"use client";

import { ParticipantAvatar } from "@/components/interview/participant-avatar";
import { cn } from "@/lib/utils";
import type { InterviewParticipantPreview } from "@/components/interview/interview-participants-bar";

interface InterviewMobileParticipantsRowProps {
  hrParticipants: InterviewParticipantPreview[];
  candidate: InterviewParticipantPreview;
  onSelect: (participant: InterviewParticipantPreview) => void;
  className?: string;
}

export function InterviewMobileParticipantsRow({
  hrParticipants,
  candidate,
  onSelect,
  className,
}: InterviewMobileParticipantsRowProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      <div className="min-w-0">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          HR interviewers
        </p>
        <div
          className="flex min-h-[3.25rem] items-center gap-2 overflow-x-auto rounded-xl border border-dashed border-slate-800 bg-slate-950/40 p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={
            hrParticipants.length > 0 ? undefined : "Waiting for HR interviewers to join"
          }
        >
          {hrParticipants.map((participant) => (
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
                size="sm"
              />
            </button>
          ))}
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
          Candidate
        </p>
        <div className="flex min-h-[3.25rem] items-center justify-center rounded-xl border border-slate-800/80 bg-slate-900/40 p-2">
          <button
            type="button"
            onClick={() => onSelect(candidate)}
            className="shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
            aria-label={`View ${candidate.name}`}
          >
            <ParticipantAvatar
              name={candidate.name}
              avatarUrl={candidate.avatarUrl}
              variant={candidate.variant}
              size="sm"
            />
          </button>
        </div>
      </div>
    </div>
  );
}
