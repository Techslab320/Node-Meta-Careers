import { CornerDownRight } from "lucide-react";
import type { ChatMessageReplyTo } from "@/config/chat-room-message";

interface ChatReplyStatusProps {
  reply: ChatMessageReplyTo;
  align?: "left" | "right";
}

export function ChatReplyStatus({ reply, align = "left" }: ChatReplyStatusProps) {
  const isRight = align === "right";

  return (
    <div
      className={`mb-2 rounded-lg border-l-[3px] bg-black/25 px-2.5 py-2 ${
        isRight ? "border-brand-light/70" : "border-brand-light/70"
      }`}
    >
      <div
        className={`flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide ${
          isRight ? "text-brand-light" : "text-brand-light"
        }`}
      >
        <CornerDownRight className="h-3 w-3 shrink-0" aria-hidden />
        <span>Reply to {reply.senderName}</span>
      </div>
      <p
        className={`mt-1 line-clamp-2 text-xs whitespace-pre-wrap ${
          reply.isDeleted ? "italic text-slate-500" : "text-slate-400"
        }`}
      >
        {reply.content}
      </p>
    </div>
  );
}

interface ChatReplyComposerBannerProps {
  senderName: string;
  content: string;
  onClear: () => void;
}

export function ChatReplyComposerBanner({
  senderName,
  content,
  onClear,
}: ChatReplyComposerBannerProps) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-lg border border-brand-light/30 bg-brand-light/10 px-3 py-2 text-xs">
      <div className="min-w-0">
        <div className="flex items-center gap-1 font-semibold uppercase tracking-wide text-brand-light">
          <CornerDownRight className="h-3 w-3 shrink-0" aria-hidden />
          <span>Replying to {senderName}</span>
        </div>
        <p className="mt-1 truncate text-slate-300">{content}</p>
      </div>
      <button
        type="button"
        onClick={onClear}
        aria-label="Cancel reply"
        className="shrink-0 rounded px-1 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
      >
        ×
      </button>
    </div>
  );
}
