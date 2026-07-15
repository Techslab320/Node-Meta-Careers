import { z } from "zod";
import { assessmentMinAnswerLength } from "@/data/assessments";

export const assessmentStartSchema = z.object({
  applicationId: z.string().min(1),
  jobSlug: z.string().min(1),
});

export const assessmentAnswerSchema = z.object({
  questionNumber: z.number().int().min(1).max(10),
  questionText: z.string().min(1),
  answerText: z.string(),
});

export const assessmentSubmitSchema = z.object({
  answers: z.array(assessmentAnswerSchema).length(10),
  expired: z.boolean().optional(),
});

export function validateManualAssessmentAnswers(
  answers: Array<{ questionNumber: number; answerText: string }>,
): string | null {
  for (const answer of answers) {
    if (answer.answerText.trim().length < assessmentMinAnswerLength) {
      return `Question ${answer.questionNumber} requires at least ${assessmentMinAnswerLength} characters.`;
    }
  }
  return null;
}
