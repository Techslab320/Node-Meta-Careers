"use client";

import { useEffect, useRef, useState } from "react";
import { HrInterviewChat } from "@/components/interview/hr-interview-chat";
import { InterviewChatRoomLayout } from "@/components/interview/interview-chat-room-layout";
import { InterviewSessionChat } from "@/components/interview/interview-session-chat";
import { InterviewRoomHeaderActions } from "@/components/interview/interview-room-header-actions";
import { WaitingRecruiterModal } from "@/components/interview/waiting-recruiter-modal";
import { CandidateAvatarUpload } from "@/components/interview/candidate-avatar-upload";
import type { ChatRoomSettingsInput } from "@/config/chat-room";
import type { JoinedHrInterviewerView } from "@/lib/chat-room/interviewer-presence";
import { candidateSessionRequestInit } from "@/lib/chat-room/candidate-session-storage";
import { applySessionStatusUpdate } from "@/lib/chat-room/session-status-poll";

interface JoinedInterviewRoomProps {
  settings: ChatRoomSettingsInput;
  jobTitle: string;
  participantName: string;
  sessionId: string;
  candidateSessionToken: string;
  initialRecruiterJoined: boolean;
  onLeave: () => void;
}

export function JoinedInterviewRoom({
  settings,
  jobTitle,
  participantName,
  sessionId,
  candidateSessionToken,
  initialRecruiterJoined,
  onLeave,
}: JoinedInterviewRoomProps) {
  const [joinedHrInterviewerIndexes, setJoinedHrInterviewerIndexes] = useState<number[]>(
    initialRecruiterJoined ? [0] : [],
  );
  const [joinedHrInterviewers, setJoinedHrInterviewers] = useState<JoinedHrInterviewerView[]>([]);
  const [candidateAvatarUrl, setCandidateAvatarUrl] = useState<string | undefined>();
  const [hrBotEnabledIndexes, setHrBotEnabledIndexes] = useState<number[]>([]);

  const leadRecruiterJoined = joinedHrInterviewerIndexes.includes(0);
  const leadUsesBot = hrBotEnabledIndexes.includes(0) && leadRecruiterJoined;
  const roomSettings = { ...settings, hrBotEnabled: leadUsesBot };
  const statusRef = useRef({
    joinedHrInterviewerIndexes,
    joinedHrInterviewers,
    candidateAvatarUrl,
    hrBotEnabledIndexes,
  });

  statusRef.current = {
    joinedHrInterviewerIndexes,
    joinedHrInterviewers,
    candidateAvatarUrl,
    hrBotEnabledIndexes,
  };

  useEffect(() => {
    async function pollStatus() {
      try {
        const response = await fetch(
          `/api/chat-room/session/${sessionId}/status`,
          candidateSessionRequestInit(candidateSessionToken, { cache: "no-store" }),
        );
        if (!response.ok) return;
        const data = (await response.json()) as {
          joinedHrInterviewerIndexes?: number[];
          joinedHrInterviewers?: JoinedHrInterviewerView[];
          candidateAvatarUrl?: string;
          hrBotEnabledIndexes?: number[];
        };

        const current = statusRef.current;
        const next = applySessionStatusUpdate(current, data);

        if (next.joinedHrInterviewerIndexes !== current.joinedHrInterviewerIndexes) {
          setJoinedHrInterviewerIndexes(next.joinedHrInterviewerIndexes);
        }
        if (next.joinedHrInterviewers !== current.joinedHrInterviewers) {
          setJoinedHrInterviewers(next.joinedHrInterviewers);
        }
        if (next.candidateAvatarUrl !== current.candidateAvatarUrl) {
          setCandidateAvatarUrl(next.candidateAvatarUrl);
        }
        if (next.hrBotEnabledIndexes !== current.hrBotEnabledIndexes) {
          setHrBotEnabledIndexes(next.hrBotEnabledIndexes);
        }
      } catch {
        // Ignore polling errors.
      }
    }

    void pollStatus();
    const intervalId = window.setInterval(pollStatus, 2000);
    return () => window.clearInterval(intervalId);
  }, [candidateSessionToken, sessionId]);

  return (
    <>
      <InterviewChatRoomLayout
        settings={roomSettings}
        roomName={settings.roomName}
        jobTitle={jobTitle}
        participantName={participantName}
        fullScreen
        largeParticipantAvatars
        visibleHrInterviewerIndexes={joinedHrInterviewerIndexes}
        visibleJoinedInterviewers={joinedHrInterviewers}
        candidateAvatarUrl={candidateAvatarUrl}
        candidateAsideFooter={
          <CandidateAvatarUpload
            sessionId={sessionId}
            candidateSessionToken={candidateSessionToken}
            onUploaded={setCandidateAvatarUrl}
          />
        }
        headerActions={
          <InterviewRoomHeaderActions
            sessionId={sessionId}
            candidateSessionToken={candidateSessionToken}
            onLeave={onLeave}
          />
        }
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          <WaitingRecruiterModal
            open={!leadRecruiterJoined}
            waitingMessage={settings.waitingMessage}
            waitingNotice={settings.waitingNotice}
            contained
          />

          {leadUsesBot ? (
            <HrInterviewChat
              settings={roomSettings}
              participantName={participantName}
              jobTitle={jobTitle}
              fullScreen
              enabled={leadRecruiterJoined}
            />
          ) : leadRecruiterJoined ? (
            <InterviewSessionChat
              sessionId={sessionId}
              candidateSessionToken={candidateSessionToken}
              participantName={participantName}
              fullScreen
              textChatNotice={roomSettings.textChatOnlyNotice}
            />
          ) : (
            <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-6">
              <p className="shrink-0 text-sm text-slate-400">Chat</p>
              <div className="mt-4 min-h-0 flex-1 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-sm text-slate-500">
                  Chat will begin when a recruiter joins.
                </p>
              </div>
            </div>
          )}
        </div>
      </InterviewChatRoomLayout>
    </>
  );
}
