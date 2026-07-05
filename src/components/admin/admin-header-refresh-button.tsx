"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";

export function AdminHeaderRefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleRefresh}
      disabled={isPending}
      aria-label="Refresh page"
      title="Refresh"
      className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
    >
      <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin")} aria-hidden />
    </button>
  );
}
