"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Lock,
} from "lucide-react";
import {
  FinanceCompatibilityIssueOverlay,
  FinanceScenarioPdfOverlay,
  isFinanceInvoiceScenarioQuestion,
} from "@/components/assessment/assessment-system-error-dialogs";
import {
  FinanceMonthlyExpenseTable,
  isFinanceMonthlyExpenseQuestion,
} from "@/components/assessment/finance-monthly-expense-table";
import { getFinanceQuestionMaterial } from "@/components/assessment/finance-question-materials";
import { AssessmentProgressSidebar } from "@/components/assessment/assessment-progress-sidebar";
import { AssessmentTimeline } from "@/components/assessment/assessment-timeline";
import { Alert, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  assessmentMinAnswerLength,
  getAssessmentTrackLabel,
  isAssessmentRole,
} from "@/data/assessments";
import { parseJsonResponse } from "@/lib/api/parse-json-response";
import type { AssessmentAnswer, AssessmentDocument } from "@/types";

interface AssessmentClientState {
  phase: "waiting" | "in_progress" | "submitted" | "expired";
  examRemainingMs: number;
}

interface AssessmentExamClientProps {
  applicationId: string;
  jobSlug: string;
}

const TOTAL_QUESTIONS = 10;

function getFirstUnansweredIndex(answers: AssessmentAnswer[]): number {
  const index = answers.findIndex(
    (answer) => answer.answerText.trim().length < assessmentMinAnswerLength,
  );
  return index === -1 ? TOTAL_QUESTIONS - 1 : index;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function AssessmentExamClient({
  applicationId,
  jobSlug,
}: AssessmentExamClientProps) {
  const router = useRouter();
  const [assessment, setAssessment] = useState<AssessmentDocument | null>(null);
  const [clientState, setClientState] = useState<AssessmentClientState | null>(null);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [beginning, setBeginning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scenarioDialogOpen, setScenarioDialogOpen] = useState(false);
  const [scenarioPdfOpen, setScenarioPdfOpen] = useState(false);
  const autoSubmittedRef = useRef(false);

  const isFinanceExam = jobSlug === "finance-manager";
  const trackLabel = isAssessmentRole(jobSlug)
    ? getAssessmentTrackLabel(jobSlug)
    : "Role";

  const syncTimer = useCallback(async () => {
    const response = await fetch(`/api/assessments/${applicationId}`);
    if (!response.ok) {
      return;
    }

    const payload = await parseJsonResponse<{
      assessment: AssessmentDocument;
      clientState: AssessmentClientState;
    }>(response);

    setAssessment((current) =>
      current
        ? {
            ...current,
            status: payload.assessment.status,
            startedAt: payload.assessment.startedAt,
            endsAt: payload.assessment.endsAt,
            submittedAt: payload.assessment.submittedAt,
            financeCompatibilityErrorDisplayedAt:
              payload.assessment.financeCompatibilityErrorDisplayedAt,
            financeCompatibilityErrorDisabled:
              payload.assessment.financeCompatibilityErrorDisabled,
            financeCompatibilityErrorDisabledAt:
              payload.assessment.financeCompatibilityErrorDisabledAt,
          }
        : payload.assessment,
    );
    setClientState(payload.clientState);
  }, [applicationId]);

  const markCompatibilityErrorDisplayed = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/assessments/${applicationId}/finance-compatibility/displayed`,
        { method: "POST" },
      );
      if (!response.ok) {
        return;
      }
      const payload = await parseJsonResponse<{ assessment: AssessmentDocument }>(response);
      setAssessment((current) =>
        current
          ? {
              ...current,
              financeCompatibilityErrorDisplayedAt:
                payload.assessment.financeCompatibilityErrorDisplayedAt,
              financeCompatibilityErrorDisabled:
                payload.assessment.financeCompatibilityErrorDisabled,
              financeCompatibilityErrorDisabledAt:
                payload.assessment.financeCompatibilityErrorDisabledAt,
            }
          : payload.assessment,
      );
    } catch {
      // Non-blocking: admin disable remains unavailable until this succeeds.
    }
  }, [applicationId]);

  const openScenario = useCallback(() => {
    if (assessment?.financeCompatibilityErrorDisabled) {
      setScenarioPdfOpen(true);
      return;
    }
    setScenarioDialogOpen(true);
  }, [assessment?.financeCompatibilityErrorDisabled]);

  const prepareAssessment = useCallback(async () => {
    const response = await fetch("/api/assessments/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId, jobSlug }),
    });

    if (!response.ok) {
      const payload = await parseJsonResponse<{ error?: string }>(response);
      throw new Error(payload.error || "Unable to prepare assessment");
    }

    const payload = await parseJsonResponse<{
      assessment: AssessmentDocument;
      clientState: AssessmentClientState;
    }>(response);

    setAssessment(payload.assessment);
    setClientState(payload.clientState);
    setAnswers(payload.assessment.answers);

    if (payload.clientState.phase === "in_progress") {
      setCurrentQuestionIndex(getFirstUnansweredIndex(payload.assessment.answers));
    }

    return payload;
  }, [applicationId, jobSlug]);

  const saveProgress = useCallback(
    async (nextAnswers: AssessmentAnswer[]) => {
      const response = await fetch(`/api/assessments/${applicationId}/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: nextAnswers }),
      });

      if (!response.ok) {
        const payload = await parseJsonResponse<{ error?: string }>(response);
        throw new Error(payload.error || "Unable to save progress");
      }
    },
    [applicationId],
  );

  const beginExam = useCallback(async () => {
    setBeginning(true);
    setError(null);

    try {
      const response = await fetch(`/api/assessments/${applicationId}/begin`, {
        method: "POST",
      });

      if (!response.ok) {
        const payload = await parseJsonResponse<{ error?: string }>(response);
        throw new Error(payload.error || "Unable to start assessment");
      }

      const payload = await parseJsonResponse<{
        assessment: AssessmentDocument;
        clientState: AssessmentClientState;
      }>(response);

      setAssessment(payload.assessment);
      setClientState(payload.clientState);
      setAnswers(payload.assessment.answers);
      setCurrentQuestionIndex(0);
    } catch (beginError) {
      setError(
        beginError instanceof Error ? beginError.message : "Unable to start assessment",
      );
    } finally {
      setBeginning(false);
    }
  }, [applicationId]);

  const submitAssessment = useCallback(
    async (expired = false) => {
      if (submitting || autoSubmittedRef.current) return;

      setSubmitting(true);
      setError(null);

      try {
        const response = await fetch(`/api/assessments/${applicationId}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers,
            expired,
          }),
        });

        if (!response.ok) {
          const payload = await parseJsonResponse<{ error?: string }>(response);
          throw new Error(payload.error || "Unable to submit assessment");
        }

        autoSubmittedRef.current = true;
        router.push(
          `/assessment-complete?${new URLSearchParams({
            job: assessment?.jobTitle || "your role",
          }).toString()}`,
        );
      } catch (submitError) {
        setError(
          submitError instanceof Error
            ? submitError.message
            : "Unable to submit assessment",
        );
        setSubmitting(false);
      }
    },
    [answers, applicationId, assessment?.jobTitle, router, submitting],
  );

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      try {
        setLoading(true);
        setError(null);
        await prepareAssessment();
      } catch (initError) {
        if (!cancelled) {
          setError(
            initError instanceof Error
              ? initError.message
              : "Unable to prepare assessment",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [prepareAssessment]);

  useEffect(() => {
    if (!assessment) return undefined;
    if (assessment.status === "submitted" || assessment.status === "expired") {
      router.push(
        `/assessment-complete?${new URLSearchParams({
          job: assessment.jobTitle,
        }).toString()}`,
      );
    }
    return undefined;
  }, [assessment, router]);

  useEffect(() => {
    if (!assessment || clientState?.phase !== "in_progress") return undefined;

    const intervalId = window.setInterval(() => {
      void syncTimer().catch(() => undefined);
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [assessment, clientState?.phase, syncTimer]);

  useEffect(() => {
    if (!clientState || clientState.phase !== "in_progress") return undefined;
    if (clientState.examRemainingMs > 0) return undefined;
    if (autoSubmittedRef.current) return undefined;

    void submitAssessment(true);
    return undefined;
  }, [clientState, submitAssessment]);

  useEffect(() => {
    if (!clientState || clientState.phase !== "in_progress") return undefined;

    function handleBeforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [clientState]);

  const phase = clientState?.phase ?? "waiting";
  const isWaiting = phase === "waiting";
  const isActive = phase === "in_progress";
  const currentAnswer = answers[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === TOTAL_QUESTIONS - 1;
  const isInvoiceScenarioQuestion = isFinanceInvoiceScenarioQuestion(
    jobSlug,
    currentAnswer?.questionNumber ?? 0,
  );
  const isMonthlyExpenseQuestion = isFinanceMonthlyExpenseQuestion(
    jobSlug,
    currentAnswer?.questionNumber ?? 0,
  );

  useEffect(() => {
    setScenarioDialogOpen(false);
    setScenarioPdfOpen(false);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (assessment?.financeCompatibilityErrorDisabled) {
      setScenarioDialogOpen(false);
    } else {
      setScenarioPdfOpen(false);
    }
  }, [assessment?.financeCompatibilityErrorDisabled]);

  const answeredCount = useMemo(
    () =>
      answers.filter((answer) => answer.answerText.trim().length >= assessmentMinAnswerLength)
        .length,
    [answers],
  );
  const allAnswersComplete = answeredCount === TOTAL_QUESTIONS;
  const canSubmit = allAnswersComplete && !submitting;

  function updateAnswer(questionNumber: number, answerText: string) {
    setAnswers((current) =>
      current.map((answer) =>
        answer.questionNumber === questionNumber ? { ...answer, answerText } : answer,
      ),
    );
  }

  async function handleNavigate(nextIndex: number) {
    if (submitting) return;
    if (nextIndex < 0 || nextIndex >= TOTAL_QUESTIONS) return;

    try {
      await saveProgress(answers);
      setCurrentQuestionIndex(nextIndex);
      setError(null);
    } catch (navigateError) {
      setError(
        navigateError instanceof Error
          ? navigateError.message
          : "Unable to save your answer",
      );
    }
  }

  if (loading) {
    return (
      <Card className="text-center">
        <p className="text-slate-300">Loading your assessment...</p>
      </Card>
    );
  }

  if (error && !assessment) {
    return (
      <Alert variant="warning">
        <p>{error}</p>
      </Alert>
    );
  }

  if (isWaiting) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-light">Role assessment</p>
          <h1 className="mt-2 text-3xl font-bold text-white">
            {assessment?.jobTitle} — Role Assessment
          </h1>
        </div>

        <Card className="space-y-6 p-8 text-center">
          <div>
            <p className="text-lg font-medium text-white">You are ready to begin</p>
            <p className="mt-3 text-slate-400">
              10 written questions · 30 minutes · one question at a time
            </p>
            <p className="mt-2 text-sm text-slate-500">
              The timer starts immediately when you click Start assessment. Use Back and Next
              to move between questions.
            </p>
          </div>

          {isFinanceExam ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-left">
              <p className="text-sm font-medium text-amber-100">Desktop or laptop required</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-300">
                Please complete this assessment on a PC (Windows, macOS, or Linux) using a current
                desktop browser such as Chrome, Edge, Firefox, or Safari. One question includes an
                interactive invoice / payment scenario that needs full browser support for document
                preview and graphics acceleration. Phones and tablets are not supported and may fail
                to open that scenario correctly.
              </p>
            </div>
          ) : null}

          {error ? (
            <Alert variant="warning">
              <p>{error}</p>
            </Alert>
          ) : null}

          <Button type="button" onClick={() => void beginExam()} disabled={beginning}>
            {beginning ? "Starting..." : "Start assessment"}
          </Button>
        </Card>
      </div>
    );
  }

  if (!isActive || !currentAnswer || !clientState) {
    return null;
  }

  const urgent = clientState.examRemainingMs <= 5 * 60 * 1000;

  if (isFinanceExam) {
    return (
      <>
        <FinanceCompatibilityIssueOverlay
          open={scenarioDialogOpen}
          onOpenChange={setScenarioDialogOpen}
          onErrorShown={markCompatibilityErrorDisplayed}
        />
        <FinanceScenarioPdfOverlay
          open={scenarioPdfOpen}
          onOpenChange={setScenarioPdfOpen}
        />

        <div className="overflow-hidden rounded-2xl border border-violet-500/20 bg-[#0a0712] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
          <div className="flex min-h-[70vh] flex-col lg:flex-row">
            <AssessmentProgressSidebar
              answers={answers}
              currentQuestionIndex={currentQuestionIndex}
              totalQuestions={TOTAL_QUESTIONS}
              onSelectQuestion={(index) => void handleNavigate(index)}
              disabled={submitting}
            />

            <div className="flex min-w-0 flex-1 flex-col">
              <header className="flex flex-wrap items-start justify-between gap-4 border-b border-violet-500/15 px-5 py-5 sm:px-7">
                <div>
                  <h1 className="text-2xl font-bold text-white sm:text-3xl">
                    {trackLabel} Q&A Assessment
                  </h1>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
                      <FileText className="h-3.5 w-3.5 text-brand-light" aria-hidden />
                      {TOTAL_QUESTIONS} Questions
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs text-slate-300">
                      <Clock className="h-3.5 w-3.5 text-brand-light" aria-hidden />
                      30 Minutes
                    </span>
                  </div>
                </div>

                <div
                  className={`min-w-[140px] rounded-xl border px-4 py-3 text-center ${
                    urgent
                      ? "border-red-500/40 bg-red-500/10"
                      : "border-brand-light/30 bg-brand-dark/15"
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock
                      className={`h-4 w-4 ${urgent ? "text-red-300" : "text-brand-light"}`}
                      aria-hidden
                    />
                    <p
                      className={`font-mono text-2xl font-semibold ${
                        urgent ? "text-red-200" : "text-brand-light"
                      }`}
                    >
                      {formatDuration(clientState.examRemainingMs)}
                    </p>
                  </div>
                  <p className="mt-1 text-[11px] uppercase tracking-wide text-slate-400">
                    Time Remaining
                  </p>
                </div>
              </header>

              <div className="flex-1 px-5 py-6 sm:px-7">
                <p className="text-sm font-medium text-brand-light">
                  Question {currentAnswer.questionNumber} of {TOTAL_QUESTIONS}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white sm:text-xl">
                  {currentAnswer.questionText}
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  {answeredCount} completed · minimum {assessmentMinAnswerLength} characters each
                </p>

                {isMonthlyExpenseQuestion ? <FinanceMonthlyExpenseTable /> : null}

                {getFinanceQuestionMaterial(currentAnswer.questionNumber)}

                {isInvoiceScenarioQuestion ? (
                  <div className="mt-5 rounded-xl border border-violet-500/20 bg-slate-950/70 p-5">
                    <p className="text-sm font-medium text-white">
                      Sample Invoice / Payment Scenario
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">
                      Open the sample invoice and payment scenario, then list any errors or missing
                      information you find in your answer below.
                    </p>
                    <Button
                      type="button"
                      className="mt-4"
                      onClick={openScenario}
                      disabled={submitting}
                    >
                      <FileText className="h-4 w-4" aria-hidden />
                      Open Scenario
                    </Button>
                  </div>
                ) : null}

                <div className="mt-5">
                  <Textarea
                    label="Your answer"
                    name={`answer-${currentAnswer.questionNumber}`}
                    value={currentAnswer.answerText}
                    onChange={(event) =>
                      updateAnswer(currentAnswer.questionNumber, event.target.value)
                    }
                    rows={9}
                    disabled={submitting}
                  />
                </div>

                {error ? (
                  <div className="mt-4">
                    <Alert variant="warning">
                      <p>{error}</p>
                    </Alert>
                  </div>
                ) : null}
              </div>

              <footer className="border-t border-violet-500/15 bg-[#120d1c]/95 px-5 py-4 sm:px-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => void handleNavigate(currentQuestionIndex - 1)}
                    disabled={isFirstQuestion || submitting}
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden />
                    Previous
                  </Button>

                  {!isLastQuestion ? (
                    <Button
                      type="button"
                      onClick={() => void handleNavigate(currentQuestionIndex + 1)}
                      disabled={submitting}
                    >
                      Save & Next
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </Button>
                  ) : (
                    <span className="hidden sm:inline" aria-hidden />
                  )}

                  <Button
                    type="button"
                    onClick={() => void submitAssessment(false)}
                    disabled={!canSubmit}
                    title={
                      allAnswersComplete
                        ? "Submit your assessment"
                        : `Answer all ${TOTAL_QUESTIONS} questions before submitting (${answeredCount}/${TOTAL_QUESTIONS} complete)`
                    }
                    className={!allAnswersComplete ? "opacity-50" : undefined}
                  >
                    {!allAnswersComplete ? <Lock className="h-4 w-4" aria-hidden /> : null}
                    {submitting ? "Submitting..." : "Submit Assessment"}
                  </Button>
                </div>
                {!allAnswersComplete ? (
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Complete all {TOTAL_QUESTIONS} answers to submit ({answeredCount}/
                    {TOTAL_QUESTIONS} done · {assessmentMinAnswerLength}+ characters each).
                  </p>
                ) : null}
              </footer>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-wide text-brand-light">Role assessment</p>
          <h1 className="mt-2 text-3xl font-bold text-white">{assessment?.jobTitle}</h1>
        </div>

        <AssessmentTimeline
          remainingMs={clientState.examRemainingMs}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={TOTAL_QUESTIONS}
          answers={answers}
        />

        <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-sm text-slate-300">
          Question {currentQuestionIndex + 1} of {TOTAL_QUESTIONS} · {answeredCount} completed
          (minimum {assessmentMinAnswerLength} characters each)
        </div>

        <Card className="p-6">
          <p className="text-sm font-medium text-brand-light">
            Question {currentAnswer.questionNumber} of {TOTAL_QUESTIONS}
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white">{currentAnswer.questionText}</h2>
          <div className="mt-4">
            <Textarea
              label="Your answer"
              name={`answer-${currentAnswer.questionNumber}`}
              value={currentAnswer.answerText}
              onChange={(event) =>
                updateAnswer(currentAnswer.questionNumber, event.target.value)
              }
              rows={8}
              disabled={submitting}
            />
          </div>
        </Card>

        {error ? (
          <Alert variant="warning">
            <p>{error}</p>
          </Alert>
        ) : null}

        <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/95 p-4 backdrop-blur">
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleNavigate(currentQuestionIndex - 1)}
            disabled={isFirstQuestion || submitting}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
            Back
          </Button>

          <div className="flex flex-wrap gap-3">
            {!isLastQuestion ? (
              <Button
                type="button"
                onClick={() => void handleNavigate(currentQuestionIndex + 1)}
                disabled={submitting}
              >
                Next
                <ChevronRight className="h-4 w-4" aria-hidden />
              </Button>
            ) : null}

            <Button
              type="button"
              onClick={() => void submitAssessment(false)}
              disabled={!canSubmit}
              title={
                allAnswersComplete
                  ? "Submit your assessment"
                  : `Answer all ${TOTAL_QUESTIONS} questions before submitting (${answeredCount}/${TOTAL_QUESTIONS} complete)`
              }
            >
              {!allAnswersComplete ? <Lock className="h-4 w-4" aria-hidden /> : null}
              {submitting ? "Submitting..." : "Submit assessment"}
            </Button>
          </div>
        </div>
        {!allAnswersComplete ? (
          <p className="text-center text-xs text-slate-500">
            Complete all {TOTAL_QUESTIONS} answers to submit ({answeredCount}/{TOTAL_QUESTIONS}{" "}
            done · {assessmentMinAnswerLength}+ characters each).
          </p>
        ) : null}
      </div>
    </>
  );
}
