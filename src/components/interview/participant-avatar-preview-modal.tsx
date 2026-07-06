"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { ParticipantAvatar } from "@/components/interview/participant-avatar";
import type { InterviewParticipantPreview } from "@/components/interview/interview-participants-bar";

interface ParticipantAvatarPreviewModalProps {
  participant: InterviewParticipantPreview | null;
  onClose: () => void;
  footer?: React.ReactNode;
}

export function ParticipantAvatarPreviewModal({
  participant,
  onClose,
  footer,
}: ParticipantAvatarPreviewModalProps) {
  useEffect(() => {
    if (!participant) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, participant]);

  if (!participant) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="participant-preview-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xs rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <div className="flex flex-col items-center text-center">
          <ParticipantAvatar
            name={participant.name}
            avatarUrl={participant.avatarUrl}
            variant={participant.variant}
            size="2xl"
          />
          <h2 id="participant-preview-title" className="mt-4 text-lg font-semibold text-white">
            {participant.name}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{participant.role}</p>
          {footer ? <div className="mt-4 w-full">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
