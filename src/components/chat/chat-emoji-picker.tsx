"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Smile } from "lucide-react";

export const CHAT_EMOJIS = [
  "😀",
  "😊",
  "😂",
  "🙂",
  "😉",
  "😍",
  "🥰",
  "😎",
  "🤔",
  "👍",
  "👏",
  "🙌",
  "🤝",
  "💪",
  "🎉",
  "✨",
  "🔥",
  "❤️",
  "💯",
  "✅",
  "👋",
  "🙏",
  "😅",
  "🤗",
  "😇",
  "🥳",
  "💼",
  "📅",
  "☕",
  "🚀",
  "⭐",
  "💡",
];

interface ChatEmojiPickerProps {
  onSelect: (emoji: string) => void;
  disabled?: boolean;
  className?: string;
  /** Where to open the panel relative to the trigger button. */
  placement?: "auto" | "above" | "below";
  columns?: number;
}

export function ChatEmojiPicker({
  onSelect,
  disabled,
  className,
  placement = "auto",
  columns = 8,
}: ChatEmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (buttonRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open || !buttonRef.current) return;

    function updatePosition() {
      const button = buttonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const panelWidth = Math.min(288, window.innerWidth - 16);
      const panelHeight = 220;
      const gap = 8;

      let left = rect.left;
      if (left + panelWidth > window.innerWidth - 8) {
        left = window.innerWidth - panelWidth - 8;
      }
      left = Math.max(8, left);

      const openBelow =
        placement === "below" ||
        (placement === "auto" && rect.bottom + panelHeight + gap < window.innerHeight);

      const top = openBelow ? rect.bottom + gap : rect.top - panelHeight - gap;

      setPanelStyle({
        position: "fixed",
        top: Math.max(8, top),
        left,
        width: panelWidth,
        zIndex: 9999,
      });
    }

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, placement]);

  const gridColsClass =
    columns === 6
      ? "grid-cols-6"
      : columns === 8
        ? "grid-cols-8"
        : "grid-cols-8";

  const panel =
    open && typeof document !== "undefined" ? (
      <div
        ref={panelRef}
        style={panelStyle}
        className="rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl"
      >
        <div className={`grid ${gridColsClass} gap-1`}>
          {CHAT_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              aria-label={`Insert ${emoji}`}
              className="flex h-9 w-9 items-center justify-center rounded-md text-xl transition-colors hover:bg-slate-800"
              onClick={() => {
                onSelect(emoji);
                setOpen(false);
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className={`relative shrink-0 ${className ?? ""}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Insert emoji"
        aria-expanded={open}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-300 transition-colors hover:border-slate-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Smile className="h-4 w-4" aria-hidden />
      </button>
      {panel ? createPortal(panel, document.body) : null}
    </div>
  );
}

interface ChatEmojiGridProps {
  onSelect: (emoji: string) => void;
  columns?: number;
}

export function ChatEmojiGrid({ onSelect, columns = 8 }: ChatEmojiGridProps) {
  const gridColsClass = columns === 6 ? "grid-cols-6" : "grid-cols-8";

  return (
    <div className={`grid ${gridColsClass} gap-1 p-1`}>
      {CHAT_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          aria-label={`React with ${emoji}`}
          className="flex h-8 w-8 items-center justify-center rounded-md text-lg transition-colors hover:bg-slate-800"
          onClick={() => onSelect(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
