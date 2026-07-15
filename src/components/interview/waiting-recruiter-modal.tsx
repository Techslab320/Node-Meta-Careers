"use client";

import { useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

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
    if (!open) return;

    const html = document.documentElement;
    const body = document.body;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      html.style.removeProperty("overflow");
      body.style.removeProperty("overflow");
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className={cn(
        "z-50 flex items-center justify-center overflow-y-auto p-4",
        contained
          ? "fixed inset-0 md:absolute md:inset-0 md:overflow-hidden"
          : "fixed inset-0",
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="waiting-recruiter-title"
    >
      <div
        className={cn(
          "absolute inset-0 bg-slate-950/75 backdrop-blur-sm",
          contained && "md:bg-slate-950/60",
        )}
        aria-hidden
      />

      <div className="relative my-auto w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-950/95 p-5 shadow-2xl shadow-brand-dark/30 backdrop-blur-md sm:max-w-md sm:p-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-3 flex h-16 w-16 items-center justify-center sm:mb-4 sm:h-[88px] sm:w-[88px]">
            <div
              className="absolute inset-0 rounded-full border border-brand-light/20"
              aria-hidden
            />
            <div
              className="absolute inset-0 animate-[spin_4s_linear_infinite] rounded-full border border-transparent border-t-brand-light/70 border-r-brand-light/30"
              aria-hidden
            />
            <div
              className="absolute inset-2 rounded-full border border-brand-light/10"
              aria-hidden
            />
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/80 sm:h-14 sm:w-14">
              <Image
                src="/images/nodemeta-logo.png"
                alt=""
                width={40}
                height={40}
                className="h-8 w-8 sm:h-10 sm:w-10"
                aria-hidden
              />
            </div>
          </div>

          <p className="brand-logo-text select-none" aria-label="NODEMETA">
            NODE<span className="brand-meta-text">META</span>
          </p>

          <p className="mt-2 text-xs text-slate-400 sm:text-sm">{waitingNotice}</p>

          <div className="mt-4 w-full sm:mt-5">
            <div className="h-0.5 overflow-hidden rounded-full bg-slate-800">
              <div className="h-full w-1/3 animate-[waiting-progress_2.4s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-brand-light to-brand-dark" />
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 sm:mt-4" aria-hidden>
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-light"
                style={{ animationDelay: `${index * 0.15}s` }}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 border-t border-slate-800 pt-4 sm:mt-6 sm:pt-5">
          <h2 id="waiting-recruiter-title" className="sr-only">
            Waiting for recruiter
          </h2>
          <p className="text-center text-sm leading-relaxed text-slate-200">{waitingMessage}</p>
        </div>
      </div>
    </div>
  );
}
