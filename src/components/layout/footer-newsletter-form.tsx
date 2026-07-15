"use client";

import { FormEvent, useState } from "react";

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitted(true);
    setEmail("");
  }

  if (submitted) {
    return (
      <p className="rounded-xl border border-[var(--border-strong)] bg-[#17102280] px-4 py-3 text-sm text-[var(--violet-light)]">
        Thanks for subscribing. We&apos;ll send career and company updates to your inbox.
      </p>
    );
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="nm-footer-input-wrap group">
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Enter your email"
          className="nm-footer-input"
        />
        <div className="nm-footer-input-glow" aria-hidden />
      </div>
      <button type="submit" className="nm-footer-subscribe-btn group">
        <span className="relative z-10 flex items-center justify-center gap-2">
          <span>Subscribe Now</span>
          <ArrowIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
        <div className="nm-footer-subscribe-btn-hover" aria-hidden />
      </button>
    </form>
  );
}
