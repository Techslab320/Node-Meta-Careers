"use client";

interface AssessmentTimerProps {
  remainingMs: number;
  label: string;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function AssessmentTimer({ remainingMs, label }: AssessmentTimerProps) {
  const urgent = remainingMs <= 5 * 60 * 1000;

  return (
    <div
      className={`rounded-xl border px-4 py-3 ${
        urgent
          ? "border-red-500/40 bg-red-500/10 text-red-200"
          : "border-brand-light/20 bg-brand-dark/10 text-brand-light"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold">{formatDuration(remainingMs)}</p>
    </div>
  );
}
