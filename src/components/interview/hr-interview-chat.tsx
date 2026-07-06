"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { ChatEmojiPicker } from "@/components/chat/chat-emoji-picker";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/card";
import type { ChatRoomSettingsInput } from "@/config/chat-room";
import { insertTextAtSelection, restoreInputSelection } from "@/lib/chat/insert-emoji";
import { scrollChatContainerToEnd } from "@/lib/chat/scroll-messages";

type ChatRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
}

interface HrInterviewChatProps {
  settings: ChatRoomSettingsInput;
  participantName: string;
  jobTitle: string;
  fullScreen?: boolean;
  enabled?: boolean;
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function HrInterviewChat({
  settings,
  participantName,
  jobTitle,
  fullScreen = false,
  enabled = true,
}: HrInterviewChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previousMessageCountRef = useRef(0);
  const interviewerName = settings.hrInterviewers[0]?.fullName.trim() || "HR interviewer";

  useEffect(() => {
    if (messages.length <= previousMessageCountRef.current) return;
    scrollChatContainerToEnd(messagesContainerRef.current);
    previousMessageCountRef.current = messages.length;
  }, [messages]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    async function loadIntroduction() {
      setInitializing(true);
      setError(null);

      try {
        const response = await fetch("/api/chat-room/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            introduction: true,
            candidateName: participantName,
            jobTitle,
            history: [],
          }),
        });

        if (!response.ok) {
          const payload = (await response.json()) as { error?: string };
          throw new Error(payload.error || "Unable to start HR bot chat.");
        }

        const data = (await response.json()) as { reply: string };
        if (!cancelled) {
          setMessages([
            {
              id: createMessageId(),
              role: "assistant",
              content: data.reply,
            },
          ]);
        }
      } catch (introError) {
        if (!cancelled) {
          setError(
            introError instanceof Error
              ? introError.message
              : "Unable to start HR bot chat.",
          );
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    void loadIntroduction();

    return () => {
      cancelled = true;
    };
  }, [enabled, jobTitle, participantName]);

  async function handleSend(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || loading || initializing) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: trimmed,
    };

    const nextHistory = [...messages, userMessage];
    setMessages(nextHistory);
    setDraft("");
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat-room/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          candidateName: participantName,
          jobTitle,
          history: messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to send message.");
      }

      const data = (await response.json()) as { reply: string };
      setMessages((current) => [
        ...current,
        {
          id: createMessageId(),
          role: "assistant",
          content: data.reply,
        },
      ]);
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : "Unable to send message.");
      setMessages((current) => current.filter((message) => message.id !== userMessage.id));
      setDraft(trimmed);
    } finally {
      setLoading(false);
    }
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
        fullScreen ? "h-full" : ""
      }`}
    >
      <p className="shrink-0 text-sm text-slate-400">Chat</p>

      <div
        ref={messagesContainerRef}
        className={`mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/50 p-4 ${
          fullScreen ? "" : "max-h-96"
        }`}
      >
        {initializing && enabled ? (
          <p className="text-sm text-slate-400">Connecting to HR bot...</p>
        ) : null}

        {!enabled ? (
          <p className="text-sm text-slate-500">Chat will begin when a recruiter joins.</p>
        ) : null}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                message.role === "user"
                  ? "bg-cyan-500/20 text-cyan-50"
                  : "bg-slate-800 text-slate-200"
              }`}
            >
              {message.role === "assistant" ? (
                <p className="mb-1 text-xs text-slate-400">{interviewerName}</p>
              ) : null}
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {loading ? (
          <p className="text-sm text-slate-400">{interviewerName} is typing...</p>
        ) : null}

      </div>

      {error ? (
        <div className="mt-4">
          <Alert variant="warning">{error}</Alert>
        </div>
      ) : null}

      <form onSubmit={handleSend} className="mt-4 flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type your message..."
          disabled={!enabled || initializing || loading}
          className="flex-1 rounded-lg border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 disabled:opacity-60"
        />
          <ChatEmojiPicker
          onSelect={handleEmojiSelect}
          disabled={!enabled || initializing || loading}
          placement="above"
        />
        <Button type="submit" disabled={!enabled || initializing || loading || !draft.trim()}>
          <Send className="h-4 w-4" aria-hidden />
          Send
        </Button>
      </form>

      <p className="mt-4 text-xs text-slate-500">{settings.textChatOnlyNotice}</p>
    </div>
  );
}
