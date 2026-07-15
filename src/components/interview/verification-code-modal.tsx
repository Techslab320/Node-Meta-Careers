"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface VerificationCodeModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  loading?: boolean;
  error?: string | null;
}

export function VerificationCodeModal({
  open,
  onClose,
  onVerify,
  loading = false,
  error = null,
}: VerificationCodeModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!open) {
      setDigits(Array(6).fill(""));
      return;
    }
    inputRefs.current[0]?.focus();
  }, [open]);

  function updateDigit(index: number, value: string) {
    const sanitized = value.replace(/\D/g, "").slice(-1);
    setDigits((current) => {
      const next = [...current];
      next[index] = sanitized;
      return next;
    });

    if (sanitized && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: React.ClipboardEvent) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const next = Array(6).fill("");
    pasted.split("").forEach((char, index) => {
      next[index] = char;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onVerify(digits.join(""));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="verification-title"
      >
        <h2 id="verification-title" className="text-xl font-bold text-white">
          Enter verification code
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Enter the 6-digit verification code to join the interview room.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(event) => updateDigit(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                className={cn(
                  "h-12 w-10 rounded-lg border border-slate-700 bg-slate-950 text-center text-lg font-semibold text-white",
                  "focus:border-brand-light focus:outline-none focus:ring-2 focus:ring-brand-light/30",
                  error && "border-red-500/70",
                )}
                aria-label={`Verification digit ${index + 1}`}
              />
            ))}
          </div>

          {error ? <p className="text-center text-sm text-red-400">{error}</p> : null}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || digits.some((digit) => !digit)}
              className="flex-1"
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function generateVerificationCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function getVerificationToastDelayMs(): number {
  return 2000 + Math.floor(Math.random() * 1000);
}
