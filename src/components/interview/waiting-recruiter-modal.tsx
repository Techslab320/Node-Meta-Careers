"use client";

import { useEffect } from "react";
import Image from "next/image";

interface WaitingRecruiterModalProps {
  open: boolean;
  waitingMessage: string;
  waitingNotice: string;
  contained?: boolean;
}

export function WaitingRecruiterModal({
  open,
  waitingMessage,
  waitingNotice,
  contained = false,
}: WaitingRecruiterModalProps) {
  useEffect(() => {
    if (!open || contained) return;

    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.removeProperty("overflow");
      body.style.removeProperty("overflow");
    };
  }, [open, contained]);

  if (!open) return null;

  return (
    <div
      className={
        contained
          ? "absolute inset-0 z-10 flex items-center justify-center overflow-hidden p-4"
          : "fixed inset-0 z-50 flex items-center justify-center overflow-hidden p-4"
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby="waiting-recruiter-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/95 p-6 shadow-2xl shadow-cyan-950/30 backdrop-blur-md">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 flex h-[88px] w-[88px] items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border border-cyan-500/20"
              aria-hidden
            />
            <div
              className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full border border-transparent border-t-cyan-400/70 border-r-cyan-400/30"
              aria-hidden
            />
            <div
              className="absolute inset-2 rounded-full border border-cyan-500/10"
              aria-hidden
            />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-xl bg-slate-900/80">
              <Image
                src="/images/nodemeta-logo.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10"
                aria-hidden
              />
            </div>
          </div>

          <p
            className="select-none text-xl font-bold tracking-tight"
            aria-label="NODEMETA"
          >
            <span className="text-white">NODE</span>
            <span className="text-[#2ec4b6]">META</span>
          </p>

          <p className="mt-2 text-sm text-slate-400">{waitingNotice}</p>

          <div className="mt-5 w-full">
            <div className="h-0.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-1/3 animate-[waiting-progress_2.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-cyan-500 to-teal-400" />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-1.5" aria-hidden>
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-cyan-400"
                style={{ animationDelay: `${index * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-6 border-t border-slate-800 pt-5">
          <h2 id="waiting-recruiter-title" className="sr-only">
            Waiting for recruiter
          </h2>
          <p className="text-center text-sm leading-relaxed text-slate-200">
            {waitingMessage}
          </p>
        </div>
      </div>
    </div>
  );
}
