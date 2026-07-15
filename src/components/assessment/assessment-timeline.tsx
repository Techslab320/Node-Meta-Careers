"use client";

import { assessmentDurationMs, assessmentMinAnswerLength } from "@/data/assessments";
import { AssessmentTimer } from "@/components/assessment/assessment-timer";
import type { AssessmentAnswer } from "@/types";

interface AssessmentTimelineProps {
  remainingMs: number;
  totalMs?: number;
  currentQuestion: number;
  totalQuestions: number;
  answers?: AssessmentAnswer[];
}

export function AssessmentTimeline({
  remainingMs,
  totalMs = assessmentDurationMs,
  currentQuestion,
  totalQuestions,
  answers = [],
}: AssessmentTimelineProps) {
  const progress = Math.max(0, Math.min(100, (remainingMs / totalMs) * 100));
  const urgent = remainingMs <= 5 * 60 * 1000;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">Assessment progress</p>
          <p className="mt-1 text-sm text-slate-300">
            Question {currentQuestion} of {totalQuestions}
          </p>
        </div>
        <AssessmentTimer remainingMs={remainingMs} label="Time remaining" />
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
            urgent
              ? "bg-gradient-to-r from-red-500 to-orange-400"
              : "bg-gradient-to-r from-brand-light to-brand-dark"
          }`}
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Time remaining"
        />
      </div>

      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const step = index + 1;
          const isActive = step === currentQuestion;
          const answerText = answers[index]?.answerText.trim() ?? "";
          const isComplete = answerText.length >= assessmentMinAnswerLength;

          return (
            <span
              key={step}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                isActive
                  ? "bg-brand-light"
                  : isComplete
                    ? "bg-brand-dark"
                    : "bg-slate-700"
              }`}
              aria-hidden
            />
          );
        })}
      </div>
    </div>
  );
}
