"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { ChatEmojiPicker } from "@/components/chat/chat-emoji-picker";
import { ChatMessageBubble } from "@/components/chat/chat-message-bubble";
import { ChatReplyComposerBanner } from "@/components/chat/chat-reply-status";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import type { ChatRoomMessageDocument } from "@/config/chat-room-message";
import { candidateSessionRequestInit } from "@/lib/chat-room/candidate-session-storage";
import {
  areChatMessagesEqual,
  scrollChatContainerToEnd,
} from "@/lib/chat/scroll-messages";
import { insertTextAtSelection, restoreInputSelection } from "@/lib/chat/insert-emoji";
import { cn } from "@/lib/utils";

interface InterviewSessionChatProps {
  sessionId: string;
  candidateSessionToken: string;
  participantName: string;
  fullScreen?: boolean;
  textChatNotice?: string;
  mobileComposerFooter?: React.ReactNode;
}

export function InterviewSessionChat({
  sessionId,
  candidateSessionToken,
  participantName,
  fullScreen = false,
  textChatNotice,
  mobileComposerFooter,
}: InterviewSessionChatProps) {
  const [messages, setMessages] = useState<ChatRoomMessageDocument[]>([]);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<ChatRoomMessageDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousMessageCountRef = useRef(0);

  useEffect(() => {
    if (messages.length <= previousMessageCountRef.current) return;
    scrollChatContainerToEnd(messagesContainerRef.current);
    previousMessageCountRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await fetch(
          `/api/chat-room/session/${sessionId}/messages`,
          candidateSessionRequestInit(candidateSessionToken, { cache: "no-store" }),
        );
        if (!response.ok) return;
        const data = (await response.json()) as { messages?: ChatRoomMessageDocument[] };
        const nextMessages = data.messages || [];
        setMessages((current) =>
          areChatMessagesEqual(current, nextMessages) ? current : nextMessages,
        );
      } catch {
        // Keep polling on transient errors.
      }
    }

    void loadMessages();
    const intervalId = window.setInterval(loadMessages, 3000);
    return () => window.clearInterval(intervalId);
  }, [candidateSessionToken, sessionId]);

  function updateMessageInList(updated: ChatRoomMessageDocument) {
    setMessages((current) =>
      current.map((message) => (message._id === updated._id ? updated : message)),
    );
  }

  function messageMap() {
    return new Map(messages.map((message) => [message._id, message]));
  }

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/chat-room/session/${sessionId}/messages`,
        candidateSessionRequestInit(candidateSessionToken, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            senderName: participantName,
            content: trimmed,
            replyToMessageId: replyTo?._id,
          }),
        }),
      );

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to send message.");
      }

      const data = (await response.json()) as { message: ChatRoomMessageDocument };
      setMessages((current) => [...current, data.message]);
      setDraft("");
      setReplyTo(null);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send message.");
    } finally {
      setLoading(false);
    }
  }

  async function handleEditMessage(messageId: string, content: string) {
    const response = await fetch(
      `/api/chat-room/session/${sessionId}/messages/${messageId}`,
      candidateSessionRequestInit(candidateSessionToken, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit",
          content,
          senderName: participantName,
        }),
      }),
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
      `/api/chat-room/session/${sessionId}/messages/${messageId}?senderName=${encodeURIComponent(participantName)}`,
      candidateSessionRequestInit(candidateSessionToken, { method: "DELETE" }),
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
      `/api/chat-room/session/${sessionId}/messages/${messageId}`,
      candidateSessionRequestInit(candidateSessionToken, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "react",
          emoji,
          actorName: participantName,
        }),
      }),
    );

    if (!response.ok) {
      const payload = (await response.json()) as { error?: string };
      throw new Error(payload.error || "Unable to react to message");
    }

    const data = (await response.json()) as { message: ChatRoomMessageDocument };
    updateMessageInList(data.message);
  }

  function handleEmojiSelect(emoji: string) {
    const input = inputRef.current;
    if (!input) {
      setDraft((current) => current + emoji);
      return;
    }

    const { value, cursor } = insertTextAtSelection(
      draft,
      emoji,
      input.selectionStart ?? draft.length,
      input.selectionEnd ?? draft.length,
    );
    setDraft(value);
    requestAnimationFrame(() => restoreInputSelection(input, cursor));
  }

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-3 sm:p-6",
        fullScreen && "h-full",
      )}
    >
      <p className="shrink-0 text-sm text-slate-400">Chat</p>

      <div
        ref={messagesContainerRef}
        className="mt-3 min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/50 p-3 sm:mt-4 sm:p-4"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-slate-400">Say hello to your interviewer.</p>
        ) : null}

        {messages.map((message) => (
          <ChatMessageBubble
            key={message._id}
            message={message}
            align={message.senderRole === "candidate" ? "right" : "left"}
            replyToMessage={
              message.replyToMessageId ? messageMap().get(message.replyToMessageId) : null
            }
            canEdit={
              message.senderRole === "candidate" &&
              message.senderName === participantName &&
              !message.isDeleted
            }
            canDelete={
              message.senderRole === "candidate" && message.senderName === participantName
            }
            onReply={setReplyTo}
            onEdit={handleEditMessage}
            onDelete={handleDeleteMessage}
            onReact={handleReactMessage}
          />
        ))}

      </div>

      {error ? (
        <div className="mt-3 shrink-0 sm:mt-4">
          <Alert variant="warning">{error}</Alert>
        </div>
      ) : null}

      <div
        className={cn(
          "mt-3 shrink-0 sm:mt-4",
          fullScreen &&
            "border-t border-slate-800/80 bg-slate-950/95 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm md:border-t-0 md:bg-transparent md:pt-0 md:pb-0 md:backdrop-blur-none",
        )}
      >
        {mobileComposerFooter ? (
          <div className="mb-3 md:hidden">{mobileComposerFooter}</div>
        ) : null}

        <form onSubmit={handleSend} className="space-y-2">
          {replyTo ? (
            <ChatReplyComposerBanner
              senderName={replyTo.senderName}
              content={replyTo.content}
              onClear={() => setReplyTo(null)}
            />
          ) : null}

          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              className="min-w-0 flex-1 rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-60 sm:px-4"
            />
            <ChatEmojiPicker onSelect={handleEmojiSelect} disabled={loading} placement="above" />
            <Button
              type="submit"
              size="sm"
              className="shrink-0 px-3 sm:px-4"
              disabled={loading || !draft.trim()}
              aria-label="Send message"
            >
              <Send className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </form>

        {textChatNotice ? (
          <p className="mt-4 hidden text-xs text-slate-500 md:block">{textChatNotice}</p>
        ) : null}
      </div>
    </div>
  );
}
