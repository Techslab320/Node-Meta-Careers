"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  durationMs?: number;
}

export function Toast({
  message,
  visible,
  onClose,
  durationMs = 8000,
}: ToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timeoutId = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timeoutId);
  }, [visible, onClose, durationMs]);

  return (
    <div
      className={cn(
        "pointer-events-none fixed inset-x-0 top-6 z-[100] flex justify-center px-4 transition-all duration-300",
        visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
      )}
      role="status"
      aria-live="polite"
    >
      <div className="pointer-events-auto max-w-md rounded-xl border border-cyan-500/30 bg-slate-900 px-5 py-4 text-sm text-cyan-100 shadow-lg shadow-cyan-500/10">
        {message}
      </div>
    </div>
  );
}
