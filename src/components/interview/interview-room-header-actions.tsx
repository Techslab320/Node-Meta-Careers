"use client";

import { useState } from "react";
import { Copy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { candidateSessionRequestInit } from "@/lib/chat-room/candidate-session-storage";

interface InterviewRoomHeaderActionsProps {
  sessionId: string;
  candidateSessionToken: string;
  onLeave: () => void;
}

export function InterviewRoomHeaderActions({
  sessionId,
  candidateSessionToken,
  onLeave,
}: InterviewRoomHeaderActionsProps) {
  const [copied, setCopied] = useState(false);
  const [leaving, setLeaving] = useState(false);

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  async function handleLeaveRoom() {
    setLeaving(true);
    try {
      await fetch(
        `/api/chat-room/session/${sessionId}/status`,
        candidateSessionRequestInit(candidateSessionToken, { method: "POST" }),
      );
    } catch {
      // Continue leaving the UI even if the request fails.
    }
    onLeave();
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={handleCopyLink}>
        <Copy className="h-4 w-4" aria-hidden />
        {copied ? "Copied" : "Copy link"}
      </Button>
      <Button
        type="button"
        variant="danger"
        size="sm"
        onClick={handleLeaveRoom}
        disabled={leaving}
      >
        <LogOut className="h-4 w-4" aria-hidden />
        {leaving ? "Leaving..." : "Leave Room"}
      </Button>
    </div>
  );
}
