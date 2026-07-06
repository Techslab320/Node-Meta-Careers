"use client";

import { useMemo, useState } from "react";
import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatRoomSettingsInput } from "@/config/chat-room";
import { getDefaultInterviewerRole } from "@/config/chat-room";
import type { JoinedHrInterviewerView } from "@/lib/chat-room/interviewer-presence";
import { ParticipantCard } from "@/components/interview/participant-avatar";
import type { InterviewParticipantPreview } from "@/components/interview/interview-participants-bar";
import { InterviewMobileParticipantsRow } from "@/components/interview/interview-mobile-participants-row";
import { ParticipantAvatarPreviewModal } from "@/components/interview/participant-avatar-preview-modal";

interface InterviewChatRoomLayoutProps {
  settings: ChatRoomSettingsInput;
  roomName: string;
  jobTitle: string;
  participantName: string;
  fullScreen?: boolean;
  showHrInterviewers?: boolean;
  headerActions?: React.ReactNode;
  leftAside?: React.ReactNode;
  leftAsideClassName?: string;
  largeParticipantAvatars?: boolean;
  visibleHrInterviewerIndexes?: number[];
  visibleJoinedInterviewers?: JoinedHrInterviewerView[];
  candidateAvatarUrl?: string;
  candidateAsideFooter?: React.ReactNode;
  children: React.ReactNode;
}

export function InterviewChatRoomLayout({
  settings,
  roomName,
  jobTitle,
  participantName,
  fullScreen = false,
  showHrInterviewers = true,
  headerActions,
  leftAside,
  leftAsideClassName,
  largeParticipantAvatars = false,
  visibleHrInterviewerIndexes,
  visibleJoinedInterviewers,
  candidateAvatarUrl,
  candidateAsideFooter,
  children,
}: InterviewChatRoomLayoutProps) {
  const [previewParticipant, setPreviewParticipant] =
    useState<InterviewParticipantPreview | null>(null);

  const configuredInterviewers = settings.hrInterviewers.slice(
    0,
    settings.hrInterviewerCount,
  );
  const resolveInterviewer = (index: number): JoinedHrInterviewerView => {
    const configured = configuredInterviewers[index];
    return {
      index,
      fullName: configured?.fullName?.trim() || `HR interviewer ${index + 1}`,
      role: configured?.role || getDefaultInterviewerRole(index),
      avatarUrl: configured?.avatarUrl?.trim() || "",
    };
  };
  const visibleEntries =
    visibleJoinedInterviewers && visibleJoinedInterviewers.length > 0
      ? visibleJoinedInterviewers.map((interviewer) => ({
          index: interviewer.index,
          interviewer,
        }))
      : visibleHrInterviewerIndexes !== undefined
        ? visibleHrInterviewerIndexes
            .filter((index) => index >= 0 && index < configuredInterviewers.length)
            .map((index) => ({ index, interviewer: resolveInterviewer(index) }))
        : configuredInterviewers
            .map((interviewer, index) => ({ index, interviewer: resolveInterviewer(index) }))
            .filter(({ interviewer }) => interviewer.fullName.trim());

  const compactSidebar = largeParticipantAvatars;
  const participantCardProps = compactSidebar
    ? { layout: "vertical" as const, avatarSize: "lg" as const, showCaption: false }
    : {};
  const hrColumnWidth = compactSidebar
    ? "md:min-w-[9rem] md:max-w-[11rem]"
    : "md:min-w-[12rem] md:max-w-[15rem]";
  const candidateColumnWidth = compactSidebar
    ? "md:min-w-[9rem] md:max-w-[11rem]"
    : "md:min-w-[11rem] md:max-w-[13rem]";

  const mobileParticipantBar = fullScreen && !leftAside;
  const candidateParticipant = useMemo<InterviewParticipantPreview>(
    () => ({
      id: "candidate",
      name: participantName,
      role: "Candidate",
      avatarUrl: candidateAvatarUrl,
      variant: "candidate",
    }),
    [candidateAvatarUrl, participantName],
  );
  const mobileHrParticipants = useMemo<InterviewParticipantPreview[]>(
    () =>
      visibleEntries.map(({ index, interviewer }) => ({
        id: `hr-${index}`,
        name: interviewer.fullName,
        role: interviewer.role,
        avatarUrl: interviewer.avatarUrl,
        variant: "hr" as const,
      })),
    [visibleEntries],
  );

  function openPreview(participant: InterviewParticipantPreview) {
    setPreviewParticipant(participant);
  }

  return (
    <div
      className={cn(
        "flex flex-col",
        fullScreen
          ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
          : "space-y-6",
      )}
    >
      <div className="relative z-20 flex shrink-0 flex-col gap-3 border-b border-slate-800 pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300 sm:h-11 sm:w-11">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-bold text-white sm:text-2xl">{roomName}</h1>
            <p className="truncate text-xs text-slate-400 sm:text-sm">
              {jobTitle} · {participantName}
            </p>
          </div>
        </div>
        {headerActions ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">{headerActions}</div>
        ) : null}
      </div>

      {mobileParticipantBar ? (
        <div className="shrink-0 space-y-3 border-b border-slate-800/80 py-3 md:hidden">
          <InterviewMobileParticipantsRow
            hrParticipants={mobileHrParticipants}
            candidate={candidateParticipant}
            onSelect={openPreview}
          />
          {candidateAsideFooter}
        </div>
      ) : null}

      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden",
          fullScreen
            ? leftAside
              ? "grid grid-cols-1 gap-4 pt-4 md:grid-cols-[minmax(18rem,24rem)_minmax(0,1fr)_minmax(9rem,11rem)] md:grid-rows-1 md:gap-6"
              : "grid grid-cols-1 gap-4 pt-4 md:grid-cols-[minmax(9rem,11rem)_minmax(0,1fr)_minmax(9rem,11rem)] md:grid-rows-1 md:gap-6"
            : "flex flex-col gap-4 xl:flex-row xl:flex-nowrap xl:gap-6",
        )}
      >
        <aside
          className={cn(
            "min-h-0 flex-col",
            leftAside ? "flex" : "hidden md:flex",
            !leftAside && (fullScreen ? hrColumnWidth : "xl:w-56"),
            leftAsideClassName,
          )}
        >
          <p className="mb-3 shrink-0 text-xs font-medium uppercase tracking-wide text-slate-500">
            HR interviewers
          </p>
          {leftAside ? (
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">{leftAside}</div>
          ) : visibleEntries.length > 0 ? (
            <div className="space-y-2">
              {visibleEntries.map(({ index, interviewer }) => {
                const preview: InterviewParticipantPreview = {
                  id: `hr-${index}`,
                  name: interviewer.fullName,
                  role: interviewer.role,
                  avatarUrl: interviewer.avatarUrl,
                  variant: "hr",
                };

                return (
                  <ParticipantCard
                    key={`hr-${index}-${interviewer.fullName}`}
                    name={interviewer.fullName}
                    role={interviewer.role}
                    avatarUrl={interviewer.avatarUrl}
                    variant="hr"
                    onClick={mobileParticipantBar ? () => openPreview(preview) : undefined}
                    {...participantCardProps}
                  />
                );
              })}
            </div>
          ) : (
            <div
              className={cn(
                "w-full rounded-xl border border-dashed border-slate-800 bg-slate-950/40",
                compactSidebar ? "min-h-[5.5rem]" : "min-h-[88px]",
              )}
              aria-label="Waiting for HR interviewers to join"
            />
          )}
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden">{children}</main>

        <aside
          className={cn(
            "hidden min-h-0 flex-col md:flex",
            fullScreen ? candidateColumnWidth : "xl:w-48",
          )}
        >
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
            Candidate
          </p>
          <ParticipantCard
            name={participantName}
            role="Candidate"
            variant="candidate"
            avatarUrl={candidateAvatarUrl}
            onClick={
              mobileParticipantBar ? () => openPreview(candidateParticipant) : undefined
            }
            {...participantCardProps}
          />
          {candidateAsideFooter}
        </aside>
      </div>

      {mobileParticipantBar ? (
        <ParticipantAvatarPreviewModal
          participant={previewParticipant}
          onClose={() => setPreviewParticipant(null)}
        />
      ) : null}
    </div>
  );
}
