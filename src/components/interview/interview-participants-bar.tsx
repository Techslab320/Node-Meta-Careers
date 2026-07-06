"use client";

import { ParticipantAvatar } from "@/components/interview/participant-avatar";
import { cn } from "@/lib/utils";

export type InterviewParticipantPreview = {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
  variant: "hr" | "candidate";
};

interface InterviewParticipantsBarProps {
  participants: InterviewParticipantPreview[];
  onSelect: (participant: InterviewParticipantPreview) => void;
  className?: string;
}

export function InterviewParticipantsBar({
  participants,
  onSelect,
  className,
}: InterviewParticipantsBarProps) {
  if (participants.length === 0) return null;

  return (
    <div
      className={cn(
        "flex shrink-0 gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {participants.map((participant) => (
        <button
          key={participant.id}
          type="button"
          onClick={() => onSelect(participant)}
          className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
          aria-label={`View ${participant.name}`}
        >
          <ParticipantAvatar
            name={participant.name}
            avatarUrl={participant.avatarUrl}
            variant={participant.variant}
            size="md"
          />
        </button>
      ))}
    </div>
  );
}
