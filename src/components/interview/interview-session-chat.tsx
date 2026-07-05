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
import { insertTextAtSelection, restoreInputSelection } from "@/lib/chat/insert-emoji";

interface InterviewSessionChatProps {
  sessionId: string;
  candidateSessionToken: string;
  participantName: string;
  fullScreen?: boolean;
  textChatNotice?: string;
}

export function InterviewSessionChat({
  sessionId,
  candidateSessionToken,
  participantName,
  fullScreen = false,
  textChatNotice,
}: InterviewSessionChatProps) {
  const [messages, setMessages] = useState<ChatRoomMessageDocument[]>([]);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<ChatRoomMessageDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    async function loadMessages() {
      try {
        const response = await fetch(
          `/api/chat-room/session/${sessionId}/messages`,
          candidateSessionRequestInit(candidateSessionToken, { cache: "no-store" }),
        );
        if (!response.ok) return;
        const data = (await response.json()) as { messages?: ChatRoomMessageDocument[] };
        setMessages(data.messages || []);
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
      className={`relative flex min-h-0 flex-1 flex-col rounded-xl border border-slate-800 bg-slate-950/60 p-4 sm:p-6 ${
        fullScreen ? "min-h-[50vh] lg:min-h-0" : ""
      }`}
    >
      <p className="shrink-0 text-sm text-slate-400">Chat</p>

      <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/50 p-4">
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

        <div ref={messagesEndRef} />
      </div>

      {error ? (
        <div className="mt-4">
          <Alert variant="warning">{error}</Alert>
        </div>
      ) : null}

      <form onSubmit={handleSend} className="mt-4 space-y-2">
        {replyTo ? (
          <ChatReplyComposerBanner
            senderName={replyTo.senderName}
            content={replyTo.content}
            onClear={() => setReplyTo(null)}
          />
        ) : null}

        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-60"
          />
          <ChatEmojiPicker onSelect={handleEmojiSelect} disabled={loading} placement="above" />
          <Button type="submit" disabled={loading || !draft.trim()}>
            <Send className="h-4 w-4" aria-hidden />
            Send
          </Button>
        </div>
      </form>

      {textChatNotice ? (
        <p className="mt-4 text-xs text-slate-500">{textChatNotice}</p>
      ) : null}
    </div>
  );
}
