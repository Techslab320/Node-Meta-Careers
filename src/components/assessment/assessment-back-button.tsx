"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

export function AssessmentBackButton() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug")?.trim();
  const href = slug ? `/jobs/${slug}` : "/jobs";

  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-300 transition-colors hover:bg-slate-800/60 hover:text-white"
    >
      <ChevronLeft className="h-4 w-4" aria-hidden />
      Back
    </Link>
  );
}
