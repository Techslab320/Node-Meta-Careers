import {
  assessmentDurationMs,
  assessmentMinAnswerLength,
  getAssessmentQuestions,
  isAssessmentRole,
  type AssessmentRoleSlug,
} from "@/data/assessments";
import { connectDB } from "@/lib/database/mongodb";
import { resolvePublishedJobBySlug } from "@/lib/jobs/resolve";
import { ApplicationModel } from "@/models/Application";
import { AssessmentModel } from "@/models/Assessment";
import type { AssessmentDocument, AssessmentStatus } from "@/types";

function buildDefaultAnswers(jobSlug: AssessmentRoleSlug) {
  return getAssessmentQuestions(jobSlug).map((questionText, index) => ({
    questionNumber: index + 1,
    questionText,
    answerText: "",
  }));
}

/** Keep stored question text in sync with the latest assessment bank. */
function syncAnswerQuestionTexts(
  assessment: InstanceType<typeof AssessmentModel>,
): boolean {
  if (!isAssessmentRole(assessment.jobSlug)) {
    return false;
  }

  if (assessment.status === "submitted" || assessment.status === "expired") {
    return false;
  }

  const questions = getAssessmentQuestions(assessment.jobSlug);
  let changed = false;

  for (const answer of assessment.answers) {
    const nextText = questions[answer.questionNumber - 1];
    if (nextText && answer.questionText !== nextText) {
      answer.questionText = nextText;
      changed = true;
    }
  }

  if (changed) {
    assessment.markModified("answers");
  }

  return changed;
}

function serializeAssessment(
  assessment: InstanceType<typeof AssessmentModel>,
): AssessmentDocument {
  return {
    _id: assessment._id.toString(),
    applicationId: assessment.applicationId.toString(),
    jobSlug: assessment.jobSlug,
    jobTitle: assessment.jobTitle,
    status: assessment.status as AssessmentStatus,
    startedAt: assessment.startedAt?.toISOString(),
    endsAt: assessment.endsAt?.toISOString(),
    submittedAt: assessment.submittedAt?.toISOString(),
    answers: assessment.answers.map((answer) => ({
      questionNumber: answer.questionNumber,
      questionText: answer.questionText,
      answerText: answer.answerText ?? "",
    })),
    financeCompatibilityErrorDisplayedAt:
      assessment.financeCompatibilityErrorDisplayedAt?.toISOString(),
    financeCompatibilityErrorDisabled: Boolean(
      assessment.financeCompatibilityErrorDisabled,
    ),
    financeCompatibilityErrorDisabledAt:
      assessment.financeCompatibilityErrorDisabledAt?.toISOString(),
    createdAt: assessment.createdAt.toISOString(),
    updatedAt: assessment.updatedAt.toISOString(),
  };
}

export async function getAssessmentByApplicationId(
  applicationId: string,
): Promise<AssessmentDocument | null> {
  await connectDB();
  const assessment = await AssessmentModel.findOne({ applicationId });
  if (!assessment) return null;

  if (syncAnswerQuestionTexts(assessment)) {
    await assessment.save();
  }

  return serializeAssessment(assessment);
}

function isDuplicateKeyError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const mongoError = error as { code?: number; message?: string };
  return mongoError.code === 11000 || mongoError.message?.includes("E11000") === true;
}

export async function startAssessment(
  applicationId: string,
  jobSlug: string,
): Promise<AssessmentDocument> {
  if (!isAssessmentRole(jobSlug)) {
    throw new Error("This role does not require an assessment.");
  }

  await connectDB();

  const application = await ApplicationModel.findById(applicationId);
  if (!application) {
    throw new Error("Application not found.");
  }

  const job = await resolvePublishedJobBySlug(jobSlug);
  if (!job || job.slug !== jobSlug) {
    throw new Error("Invalid assessment role.");
  }

  if (application.jobId.toString() !== job._id.toString()) {
    throw new Error("Application does not match this role.");
  }

  const existing = await AssessmentModel.findOne({ applicationId });
  if (existing) {
    if (syncAnswerQuestionTexts(existing)) {
      await existing.save();
    }
    return serializeAssessment(existing);
  }

  try {
    const assessment = await AssessmentModel.create({
      applicationId,
      jobSlug,
      jobTitle: application.jobTitle,
      status: "waiting",
      answers: buildDefaultAnswers(jobSlug),
    });

    await ApplicationModel.findByIdAndUpdate(applicationId, {
      status: "assessment",
    });

    return serializeAssessment(assessment);
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      const duplicate = await AssessmentModel.findOne({ applicationId });
      if (duplicate) {
        if (syncAnswerQuestionTexts(duplicate)) {
          await duplicate.save();
        }
        return serializeAssessment(duplicate);
      }
    }

    throw error;
  }
}

export async function beginAssessment(
  applicationId: string,
): Promise<AssessmentDocument> {
  await connectDB();

  const assessment = await AssessmentModel.findOne({ applicationId });
  if (!assessment) {
    throw new Error("Assessment not found.");
  }

  if (assessment.status === "submitted" || assessment.status === "expired") {
    return serializeAssessment(assessment);
  }

  if (assessment.status === "in_progress") {
    return serializeAssessment(assessment);
  }

  if (assessment.status !== "waiting") {
    throw new Error("Assessment cannot be started.");
  }

  const now = new Date();
  assessment.status = "in_progress";
  assessment.startedAt = now;
  assessment.endsAt = new Date(now.getTime() + assessmentDurationMs);
  await assessment.save();

  return serializeAssessment(assessment);
}

export async function saveAssessmentAnswers(
  applicationId: string,
  answers: Array<{
    questionNumber: number;
    questionText: string;
    answerText: string;
  }>,
): Promise<AssessmentDocument> {
  await connectDB();

  const assessment = await AssessmentModel.findOne({ applicationId });
  if (!assessment) {
    throw new Error("Assessment not found.");
  }

  if (assessment.status !== "in_progress") {
    throw new Error("Assessment is not active.");
  }

  for (const answer of answers) {
    const existing = assessment.answers.find(
      (item) => item.questionNumber === answer.questionNumber,
    );
    if (existing) {
      existing.answerText = answer.answerText.trim();
    }
  }
  assessment.markModified("answers");
  await assessment.save();

  return serializeAssessment(assessment);
}

export async function submitAssessment(
  applicationId: string,
  answers: Array<{
    questionNumber: number;
    questionText: string;
    answerText: string;
  }>,
  options: { expired?: boolean } = {},
): Promise<AssessmentDocument> {
  await connectDB();

  const assessment = await AssessmentModel.findOne({ applicationId });
  if (!assessment) {
    throw new Error("Assessment not found.");
  }

  if (assessment.status === "submitted" || assessment.status === "expired") {
    return serializeAssessment(assessment);
  }

  const now = new Date();
  for (const answer of answers) {
    const existing = assessment.answers.find(
      (item) => item.questionNumber === answer.questionNumber,
    );
    if (existing) {
      existing.answerText = answer.answerText.trim();
    }
  }

  if (!options.expired) {
    const incomplete = assessment.answers.some(
      (item) => item.answerText.trim().length < assessmentMinAnswerLength,
    );
    if (incomplete || assessment.answers.length < 10) {
      throw new Error(
        `Please answer all 10 questions (${assessmentMinAnswerLength}+ characters each) before submitting.`,
      );
    }
  }

  assessment.markModified("answers");
  assessment.submittedAt = now;
  assessment.status = options.expired ? "expired" : "submitted";

  if (!assessment.startedAt) {
    assessment.startedAt = now;
  }
  if (!assessment.endsAt) {
    assessment.endsAt = now;
  }

  await assessment.save();

  await ApplicationModel.findByIdAndUpdate(applicationId, {
    status: "assessment",
  });

  return serializeAssessment(assessment);
}

export function getAssessmentClientState(assessment: AssessmentDocument) {
  const now = Date.now();
  const endsAt = assessment.endsAt ? new Date(assessment.endsAt).getTime() : null;

  const phase: "waiting" | "in_progress" | "submitted" | "expired" = assessment.status;

  const examRemainingMs =
    phase === "in_progress" && endsAt ? Math.max(0, endsAt - now) : 0;

  return {
    phase,
    examRemainingMs,
    startedAt: assessment.startedAt,
    endsAt: assessment.endsAt,
    submittedAt: assessment.submittedAt,
  };
}

export async function markFinanceCompatibilityErrorDisplayed(
  applicationId: string,
): Promise<AssessmentDocument> {
  await connectDB();
  const assessment = await AssessmentModel.findOne({ applicationId });
  if (!assessment) {
    throw new Error("Assessment not found.");
  }
  if (assessment.jobSlug !== "finance-manager") {
    throw new Error("Compatibility error tracking only applies to finance assessments.");
  }

  if (!assessment.financeCompatibilityErrorDisplayedAt) {
    assessment.financeCompatibilityErrorDisplayedAt = new Date();
    await assessment.save();
  }

  return serializeAssessment(assessment);
}

export async function setFinanceCompatibilityErrorDisabled(
  applicationId: string,
  disabled: boolean,
): Promise<AssessmentDocument> {
  await connectDB();
  const assessment = await AssessmentModel.findOne({ applicationId });
  if (!assessment) {
    throw new Error("Assessment not found.");
  }
  if (assessment.jobSlug !== "finance-manager") {
    throw new Error("Compatibility error controls only apply to finance assessments.");
  }

  if (disabled && !assessment.financeCompatibilityErrorDisplayedAt) {
    throw new Error(
      "Compatibility error can only be disabled after it has been shown to the candidate.",
    );
  }

  assessment.financeCompatibilityErrorDisabled = disabled;
  assessment.financeCompatibilityErrorDisabledAt = disabled ? new Date() : undefined;
  await assessment.save();

  return serializeAssessment(assessment);
}
