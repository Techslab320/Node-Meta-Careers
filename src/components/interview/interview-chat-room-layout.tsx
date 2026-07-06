import { MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ChatRoomSettingsInput } from "@/config/chat-room";
import { getDefaultInterviewerRole } from "@/config/chat-room";
import type { JoinedHrInterviewerView } from "@/lib/chat-room/interviewer-presence";
import { ParticipantCard } from "@/components/interview/participant-avatar";

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
  const participantCardProps = largeParticipantAvatars
    ? { layout: "vertical" as const, fillAvatar: true }
    : {};
  const hrColumnWidth = largeParticipantAvatars
    ? "md:min-w-[14rem] md:max-w-[18rem]"
    : "md:min-w-[12rem] md:max-w-[15rem]";
  const candidateColumnWidth = largeParticipantAvatars
    ? "md:min-w-[14rem] md:max-w-[18rem]"
    : "md:min-w-[11rem] md:max-w-[13rem]";

  return (
    <div
      className={cn(
        "flex flex-col",
        fullScreen
          ? "flex h-full min-h-0 flex-1 flex-col overflow-hidden px-4 py-4 sm:px-6 sm:py-6"
          : "space-y-6",
      )}
    >
      <div className="relative z-20 flex shrink-0 items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500/15 text-cyan-300">
            <MessageSquare className="h-5 w-5" aria-hidden />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-white">{roomName}</h1>
            <p className="truncate text-sm text-slate-400">
              {jobTitle} · {participantName}
            </p>
          </div>
        </div>
        {headerActions}
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden",
          fullScreen
            ? "grid grid-cols-1 gap-4 pt-4 md:grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)_minmax(11rem,18rem)] md:grid-rows-1 md:gap-6"
            : "flex flex-col gap-4 xl:flex-row xl:flex-nowrap xl:gap-6",
        )}
      >
        <aside
          className={cn(
            "flex min-h-0 flex-col",
            fullScreen ? hrColumnWidth : "xl:w-56",
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
              {visibleEntries.map(({ index, interviewer }) => (
                <ParticipantCard
                  key={`hr-${index}-${interviewer.fullName}`}
                  name={interviewer.fullName}
                  role={interviewer.role}
                  avatarUrl={interviewer.avatarUrl}
                  variant="hr"
                  {...participantCardProps}
                />
              ))}
            </div>
          ) : (
            <div
              className={cn(
                "w-full rounded-xl border border-dashed border-slate-800 bg-slate-950/40",
                largeParticipantAvatars ? "min-h-[12rem] md:min-h-[16rem]" : "min-h-[88px]",
              )}
              aria-label="Waiting for HR interviewers to join"
            />
          )}
        </aside>

        <main className="flex min-h-0 min-w-0 flex-col overflow-hidden">{children}</main>

        <aside
          className={cn(
            "flex min-h-0 flex-col",
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
            {...participantCardProps}
          />
          {candidateAsideFooter}
        </aside>
      </div>
    </div>
  );
}
