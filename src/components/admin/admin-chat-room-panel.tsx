"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { ChatEmojiPicker } from "@/components/chat/chat-emoji-picker";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { ChatReplyComposerBanner } from "@/components/chat/chat-reply-status";
import { InterviewChatRoomLayout } from "@/components/interview/interview-chat-room-layout";
import { ParticipantAvatar } from "@/components/interview/participant-avatar";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import type { ChatRoomSessionDocument } from "@/config/chat-room-session";
import type { ChatRoomMessageDocument } from "@/config/chat-room-message";
import type { ChatRoomSettingsInput, HrInterviewer } from "@/config/chat-room";
import { insertTextAtSelection, restoreInputSelection } from "@/lib/chat/insert-emoji";

interface AdminChatRoomPanelProps {
  chatSession: ChatRoomSessionDocument;
  settings: ChatRoomSettingsInput;
  candidateName: string;
  jobTitle: string;
  initialRecruiterJoined?: boolean;
  fullScreen?: boolean;
  headerActions?: React.ReactNode;
}

function HrBotSwitch({
  enabled,
  disabled,
  loading,
  onToggle,
}: {
  enabled: boolean;
  disabled?: boolean;
  loading?: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <span>{loading ? "Updating..." : "HR Bot"}</span>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        aria-busy={loading}
        disabled={disabled || loading}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onToggle();
        }}
        className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          enabled ? "bg-cyan-500" : "bg-slate-700"
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
            enabled ? "translate-x-4" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function AdminHrInterviewerComposer({
  interviewer,
  index,
  joined,
  joining,
  loggingOut,
  hrBotEnabled,
  togglingHrBot,
  cardError,
  draft,
  sending,
  replyTo,
  onClearReply,
  onJoin,
  onLogout,
  onToggleHrBot,
  onDraftChange,
  onSend,
}: {
  interviewer: HrInterviewer;
  index: number;
  joined: boolean;
  joining: boolean;
  loggingOut: boolean;
  hrBotEnabled: boolean;
  togglingHrBot: boolean;
  cardError?: string | null;
  draft: string;
  sending: boolean;
  replyTo: ChatRoomMessageDocument | null;
  onClearReply: () => void;
  onJoin: () => void;
  onLogout: () => void;
  onToggleHrBot: () => void;
  onDraftChange: (value: string) => void;
  onSend: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSend =
    joined &&
    Boolean(interviewer.fullName.trim()) &&
    draft.trim() &&
    !sending;

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    onSend();
  }

  function handleEmojiSelect(emoji: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      onDraftChange(draft + emoji);
      return;
    }

    const { value, cursor } = insertTextAtSelection(
      draft,
      emoji,
      textarea.selectionStart,
      textarea.selectionEnd,
    );
    onDraftChange(value);
    requestAnimationFrame(() => restoreInputSelection(textarea, cursor));
  }

  return (
    <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3">
      <div className="flex items-start gap-3">
        <ParticipantAvatar
          name={interviewer.fullName || "HR interviewer"}
          avatarUrl={interviewer.avatarUrl}
          variant="hr"
          size="sm"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white">
            {interviewer.fullName.trim() || "Unnamed interviewer"}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate text-xs text-slate-400">{interviewer.role}</p>
            <HrBotSwitch
              enabled={hrBotEnabled}
              loading={togglingHrBot}
              disabled={joining || loggingOut}
              onToggle={onToggleHrBot}
            />
          </div>
          <div className="mt-2 flex justify-end">
            {!joined ? (
              <Button
                type="button"
                size="sm"
                disabled={joining || loggingOut || togglingHrBot || !interviewer.fullName.trim()}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onJoin();
                }}
              >
                {joining ? "Joining..." : "Join"}
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={loggingOut || joining || togglingHrBot}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onLogout();
                }}
              >
                {loggingOut ? "Leaving..." : "Logout"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {cardError ? (
        <p className="mt-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2 py-1.5 text-xs text-amber-200">
          {cardError}
        </p>
      ) : null}

      {joined ? (
        <form onSubmit={handleSubmit} className="mt-3 space-y-2">
          {hrBotEnabled ? (
            <p className="text-xs text-cyan-400/90">
              HR bot is active — you can still send manual messages as this interviewer.
            </p>
          ) : null}
          {replyTo ? (
            <ChatReplyComposerBanner
              senderName={replyTo.senderName}
              content={replyTo.content}
              onClear={onClearReply}
            />
          ) : null}
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="Type a message..."
            disabled={sending || !interviewer.fullName.trim()}
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <div className="flex items-center gap-2">
            <ChatEmojiPicker
              onSelect={handleEmojiSelect}
              disabled={sending || !interviewer.fullName.trim()}
              placement="below"
              columns={6}
            />
            <Button type="submit" size="sm" disabled={!canSend} className="flex-1">
              <Send className="h-4 w-4" aria-hidden />
              {sending ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      ) : (
        <p className="mt-3 text-xs text-slate-500">
          Click Join to enter the candidate&apos;s interview room
          {index === 0 ? " and dismiss their waiting screen" : ""}.
        </p>
      )}
    </div>
  );
}

export function AdminChatRoomPanel({
  chatSession,
  settings,
  candidateName,
  jobTitle,
  initialRecruiterJoined = false,
  fullScreen = false,
  headerActions,
}: AdminChatRoomPanelProps) {
  const [session, setSession] = useState(chatSession);
  const [roomSettings, setRoomSettings] = useState(settings);
  const [messages, setMessages] = useState<ChatRoomMessageDocument[]>([]);
  const [drafts, setDrafts] = useState<Record<number, string>>({});
  const [replyTo, setReplyTo] = useState<ChatRoomMessageDocument | null>(null);
  const [activeComposerIndex, setActiveComposerIndex] = useState<number | null>(null);
  const [sendingIndex, setSendingIndex] = useState<number | null>(null);
  const [joiningIndex, setJoiningIndex] = useState<number | null>(null);
  const [loggingOutIndex, setLoggingOutIndex] = useState<number | null>(null);
  const [togglingHrBotIndex, setTogglingHrBotIndex] = useState<number | null>(null);
  const [cardErrors, setCardErrors] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);
  const lastSessionMutationAt = useRef(0);

  const adminFetchInit: RequestInit = { credentials: "include" };

  const interviewers = roomSettings.hrInterviewers.slice(0, roomSettings.hrInterviewerCount);
  const joinedIndexes = session.joinedHrInterviewerIndexes ?? [];
  const hrBotEnabledIndexes = session.hrBotEnabledIndexes ?? [];
  const leadJoined = joinedIndexes.includes(0);

  useEffect(() => {
    setRoomSettings(settings);
  }, [settings]);

  function applySessionUpdate(next: ChatRoomSessionDocument, fromPoll = false) {
    setSession((current) => {
      const mergedJoinedIndexes = [
        ...new Set([
          ...(current.joinedHrInterviewerIndexes ?? []),
          ...(next.joinedHrInterviewerIndexes ?? []),
        ]),
      ].sort((a, b) => a - b);

      const mergedBotIndexes = [
        ...new Set([
          ...(current.hrBotEnabledIndexes ?? []),
          ...(next.hrBotEnabledIndexes ?? []),
        ]),
      ].sort((a, b) => a - b);

      const recentMutation = Date.now() - lastSessionMutationAt.current < 30000;

      return {
        ...next,
        joinedHrInterviewerIndexes:
          fromPoll && recentMutation
            ? mergedJoinedIndexes
            : (next.joinedHrInterviewerIndexes ?? mergedJoinedIndexes),
        hrBotEnabledIndexes:
          fromPoll && recentMutation
            ? (current.hrBotEnabledIndexes ?? [])
            : fromPoll
              ? (next.hrBotEnabledIndexes ?? mergedBotIndexes)
              : mergedBotIndexes,
      };
    });
  }

  function markSessionMutation(
    next: ChatRoomSessionDocument,
    options?: {
      joinedIndex?: number;
      botIndexes?: number[];
      joinedIndexes?: number[];
    },
  ) {
    lastSessionMutationAt.current = Date.now();
    setSession((current) => {
      const mergedJoinedIndexes = [
        ...new Set([
          ...(next.joinedHrInterviewerIndexes ?? []),
          ...(current.joinedHrInterviewerIndexes ?? []),
          ...(options?.joinedIndex !== undefined ? [options.joinedIndex] : []),
        ]),
      ].sort((a, b) => a - b);

      const joinedIndexes =
        options?.joinedIndexes ??
        (options?.joinedIndex !== undefined ? mergedJoinedIndexes : next.joinedHrInterviewerIndexes ?? mergedJoinedIndexes);

      const botIndexes =
        options?.botIndexes ??
        next.hrBotEnabledIndexes ??
        current.hrBotEnabledIndexes ??
        [];

      return {
        ...next,
        joinedHrInterviewerIndexes: [...joinedIndexes].sort((a, b) => a - b),
        hrBotEnabledIndexes: [...botIndexes].sort((a, b) => a - b),
      };
    });
  }

  function setCardError(index: number, message: string | null) {
    setCardErrors((current) => {
      if (!message) {
        const { [index]: _, ...rest } = current;
        return rest;
      }
      return { ...current, [index]: message };
    });
  }

  function updateMessageInList(updated: ChatRoomMessageDocument) {
    setMessages((current) =>
      current.map((message) => (message._id === updated._id ? updated : message)),
    );
  }

  function messageMap() {
    return new Map(messages.map((message) => [message._id, message]));
  }

  const reactionActorName =
    interviewers.find((_, index) => joinedIndexes.includes(index))?.fullName.trim() ||
    "HR Team";

  useEffect(() => {
    const currentSessionId = session._id;

    async function refreshSession() {
      try {
        const response = await fetch(
          `/api/admin/chat-room/session/${currentSessionId}/messages`,
        );
        if (!response.ok) return;
        const data = (await response.json()) as {
          messages?: ChatRoomMessageDocument[];
          session?: ChatRoomSessionDocument;
        };
        if (data.messages) setMessages(data.messages);
        if (data.session) applySessionUpdate(data.session, true);
      } catch {
        // Ignore polling errors.
      }
    }

    void refreshSession();
    const intervalId = window.setInterval(refreshSession, 3000);
    return () => window.clearInterval(intervalId);
  }, [session._id]);

  async function handleJoinInterviewer(index: number) {
    setJoiningIndex(index);
    setError(null);
    setCardError(index, null);

    setSession((current) => {
      const joined = [...new Set([...(current.joinedHrInterviewerIndexes ?? []), index])].sort(
        (a, b) => a - b,
      );
      return { ...current, joinedHrInterviewerIndexes: joined, status: "in_progress" };
    });

    try {
      const response = await fetch(
        `/api/admin/chat-room/session/${session._id}/interviewers/${index}/join`,
        { method: "PATCH", ...adminFetchInit },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to join interviewer.");
      }

      const data = (await response.json()) as { session: ChatRoomSessionDocument };
      markSessionMutation(data.session, { joinedIndex: index });
    } catch (joinError) {
      const message =
        joinError instanceof Error ? joinError.message : "Unable to join interviewer.";
      setCardError(index, message);
      setError(message);
      setSession((current) => ({
        ...current,
        joinedHrInterviewerIndexes: (current.joinedHrInterviewerIndexes ?? []).filter(
          (value) => value !== index,
        ),
      }));
    } finally {
      setJoiningIndex(null);
    }
  }

  async function handleLogoutInterviewer(index: number) {
    setLoggingOutIndex(index);
    setError(null);
    setCardError(index, null);

    try {
      const response = await fetch(
        `/api/admin/chat-room/session/${session._id}/interviewers/${index}/leave`,
        { method: "PATCH", ...adminFetchInit },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to leave interviewer.");
      }

      const data = (await response.json()) as { session: ChatRoomSessionDocument };
      markSessionMutation(data.session, {
        joinedIndexes: data.session.joinedHrInterviewerIndexes ?? [],
        botIndexes: data.session.hrBotEnabledIndexes ?? [],
      });
      setDrafts((current) => ({ ...current, [index]: "" }));
      if (activeComposerIndex === index) {
        setReplyTo(null);
        setActiveComposerIndex(null);
      }
    } catch (logoutError) {
      const message =
        logoutError instanceof Error ? logoutError.message : "Unable to leave interviewer.";
      setCardError(index, message);
      setError(message);
    } finally {
      setLoggingOutIndex(null);
    }
  }

  async function handleSend(index: number) {
    const interviewer = interviewers[index];
    const content = drafts[index]?.trim();
    if (!interviewer?.fullName.trim() || !content || sendingIndex !== null) return;

    setSendingIndex(index);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/chat-room/session/${session._id}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderName: interviewer.fullName.trim(),
            content,
            replyToMessageId: replyTo?._id,
          }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to send message");
      }

      const data = (await response.json()) as { message: ChatRoomMessageDocument };
      setMessages((current) => [...current, data.message]);
      setDrafts((current) => ({ ...current, [index]: "" }));
      setReplyTo(null);
      setActiveComposerIndex(null);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send message");
    } finally {
      setSendingIndex(null);
    }
  }

  async function handleEditMessage(messageId: string, content: string) {
    const response = await fetch(
      `/api/admin/chat-room/session/${session._id}/messages/${messageId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "edit", content }),
      },
    );

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      throw new Error(payload.error || "Unable to edit message");
    }

    const data = (await response.json()) as { message: ChatRoomMessageDocument };
    updateMessageInList(data.message);
  }

  async function handleDeleteMessage(messageId: string) {
    const response = await fetch(
      `/api/admin/chat-room/session/${session._id}/messages/${messageId}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      throw new Error(payload.error || "Unable to delete message");
    }

    const data = (await response.json()) as { message: ChatRoomMessageDocument };
    updateMessageInList(data.message);
  }

  async function handleReactMessage(messageId: string, emoji: string) {
    const response = await fetch(
      `/api/admin/chat-room/session/${session._id}/messages/${messageId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "react",
          emoji,
          actorName: reactionActorName,
        }),
      },
    );

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      throw new Error(payload.error || "Unable to react to message");
    }

    const data = (await response.json()) as { message: ChatRoomMessageDocument };
    updateMessageInList(data.message);
  }

  function handleReply(message: ChatRoomMessageDocument) {
    setReplyTo(message);
    const firstJoinedIndex = joinedIndexes.find((index) => index < interviewers.length);
    if (firstJoinedIndex !== undefined) {
      setActiveComposerIndex(firstJoinedIndex);
    }
  }

  async function handleToggleHrBot(index: number) {
    setTogglingHrBotIndex(index);
    setError(null);
    setCardError(index, null);

    const currentlyEnabled = hrBotEnabledIndexes.includes(index);
    setSession((current) => {
      const nextBotIndexes = currentlyEnabled
        ? (current.hrBotEnabledIndexes ?? []).filter((value) => value !== index)
        : [...new Set([...(current.hrBotEnabledIndexes ?? []), index])].sort((a, b) => a - b);
      return { ...current, hrBotEnabledIndexes: nextBotIndexes };
    });

    try {
      const response = await fetch(
        `/api/admin/chat-room/session/${session._id}/interviewers/${index}/hr-bot`,
        { method: "PATCH", ...adminFetchInit },
      );

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error || "Unable to update HR bot setting.");
      }

      const data = (await response.json()) as { session: ChatRoomSessionDocument };
      markSessionMutation(data.session, {
        botIndexes: data.session.hrBotEnabledIndexes,
      });
    } catch (toggleError) {
      const message =
        toggleError instanceof Error ? toggleError.message : "Unable to update HR bot setting.";
      setCardError(index, message);
      setError(message);
      setSession((current) => ({
        ...current,
        hrBotEnabledIndexes: currentlyEnabled
          ? [...new Set([...(current.hrBotEnabledIndexes ?? []), index])].sort((a, b) => a - b)
          : (current.hrBotEnabledIndexes ?? []).filter((value) => value !== index),
      }));
    } finally {
      setTogglingHrBotIndex(null);
    }
  }

  const hrSidebar = (
    <>
      {interviewers.map((interviewer, index) => (
        <AdminHrInterviewerComposer
          key={`${interviewer.fullName}-${index}`}
          interviewer={interviewer}
          index={index}
          joined={joinedIndexes.includes(index)}
          joining={joiningIndex === index}
          loggingOut={loggingOutIndex === index}
          hrBotEnabled={hrBotEnabledIndexes.includes(index)}
          togglingHrBot={togglingHrBotIndex === index}
          cardError={cardErrors[index]}
          draft={drafts[index] ?? ""}
          sending={sendingIndex === index}
          replyTo={activeComposerIndex === index ? replyTo : null}
          onClearReply={() => {
            setReplyTo(null);
            setActiveComposerIndex(null);
          }}
          onJoin={() => void handleJoinInterviewer(index)}
          onLogout={() => void handleLogoutInterviewer(index)}
          onToggleHrBot={() => void handleToggleHrBot(index)}
          onDraftChange={(value) =>
            setDrafts((current) => ({ ...current, [index]: value }))
          }
          onSend={() => void handleSend(index)}
        />
      ))}
    </>
  );

  return (
    <InterviewChatRoomLayout
      settings={roomSettings}
      roomName={settings.roomName}
      jobTitle={jobTitle}
      participantName={candidateName}
      candidateAvatarUrl={session.candidateAvatarUrl}
      fullScreen={fullScreen}
      showHrInterviewers={false}
      leftAside={hrSidebar}
      leftAsideClassName="lg:w-80 xl:w-80"
      headerActions={headerActions}
    >
      <div
        className={
          fullScreen
            ? "flex min-h-0 flex-1 flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-6"
            : "flex min-h-[420px] flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-6"
        }
      >
        {error ? <Alert variant="warning">{error}</Alert> : null}

        {leadJoined ? (
          <>
            <p className="shrink-0 text-sm text-slate-400">Chat</p>
            <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/50 p-4">
              {messages.length === 0 ? (
                <p className="text-sm text-slate-400">
                  No messages yet. Use the interviewer panels on the left to send a message.
                </p>
              ) : (
                messages.map((message) => (
                  <ChatMessageBubble
                    key={message._id}
                    message={message}
                    align={message.senderRole === "hr" ? "left" : "right"}
                    replyToMessage={
                      message.replyToMessageId
                        ? messageMap().get(message.replyToMessageId)
                        : null
                    }
                    canEdit={message.senderRole === "hr" && !message.isDeleted}
                    canDelete
                    onReply={handleReply}
                    onEdit={handleEditMessage}
                    onDelete={handleDeleteMessage}
                    onReact={handleReactMessage}
                  />
                ))
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col justify-center">
            <p className="text-center text-sm text-slate-400">
              Click Join on the lead HR interviewer to enter the room and dismiss the
              candidate&apos;s waiting screen.
            </p>
          </div>
        )}
      </div>
    </InterviewChatRoomLayout>
  );
}
