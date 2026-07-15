"use client";

import { Check } from "lucide-react";
import { assessmentMinAnswerLength } from "@/data/assessments";
import type { AssessmentAnswer } from "@/types";

interface AssessmentProgressSidebarProps {
  answers: AssessmentAnswer[];
  currentQuestionIndex: number;
  totalQuestions: number;
  onSelectQuestion: (index: number) => void;
  disabled?: boolean;
}

function isAnswered(answer: AssessmentAnswer | undefined): boolean {
  return (answer?.answerText.trim().length ?? 0) >= assessmentMinAnswerLength;
}

export function AssessmentProgressSidebar({
  answers,
  currentQuestionIndex,
  totalQuestions,
  onSelectQuestion,
  disabled = false,
}: AssessmentProgressSidebarProps) {
  const answeredCount = answers.filter((answer) => isAnswered(answer)).length;
  const percent = Math.round((answeredCount / totalQuestions) * 100);

  return (
    <aside className="flex h-full w-full flex-col border-r border-violet-500/15 bg-[#0e0a16] lg:w-[260px] lg:shrink-0">
      <div className="border-b border-violet-500/15 px-5 py-5">
        <p className="text-sm font-semibold text-white">Your Progress</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-brand-light to-brand-dark transition-[width] duration-300"
              style={{ width: `${percent}%` }}
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Questions completed"
            />
          </div>
          <span className="text-xs font-medium text-slate-400">{percent}%</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Questions">
        {Array.from({ length: totalQuestions }, (_, index) => {
          const step = index + 1;
          const current = index === currentQuestionIndex;
          const answered = isAnswered(answers[index]);

          return (
            <button
              key={step}
              type="button"
              disabled={disabled}
              onClick={() => onSelectQuestion(index)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                current
                  ? "bg-violet-600/35 text-white ring-1 ring-violet-400/35"
                  : "text-slate-300 hover:bg-white/5"
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-semibold ${
                  answered && !current
                    ? "bg-emerald-500 text-white"
                    : current
                      ? "bg-white text-violet-800"
                      : "border border-slate-600 text-slate-400"
                }`}
              >
                {answered && !current ? <Check className="h-3.5 w-3.5" aria-hidden /> : step}
              </span>
              <span className={current ? "font-medium text-white" : answered ? "text-white" : "text-slate-400"}>
                Question {step}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="border-t border-violet-500/15 px-5 py-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Question Status
        </p>
        <ul className="mt-3 space-y-2 text-xs text-slate-400">
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" aria-hidden />
            Answered
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500" aria-hidden />
            Current
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full border border-slate-500" aria-hidden />
            Not Answered
          </li>
        </ul>
      </div>
    </aside>
  );
}
