"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";
import { ChatEmojiGrid } from "@/components/chat/chat-emoji-picker";
import { ChatReplyStatus } from "@/components/chat/chat-reply-status";
import type { ChatMessageReplyTo, ChatRoomMessageDocument } from "@/config/chat-room-message";

interface ChatMessageBubbleProps {
  message: ChatRoomMessageDocument;
  align: "left" | "right";
  replyToMessage?: ChatRoomMessageDocument | null;
  canEdit: boolean;
  canDelete: boolean;
  onReply: (message: ChatRoomMessageDocument) => void;
  onEdit: (messageId: string, content: string) => Promise<void>;
  onDelete: (messageId: string) => Promise<void>;
  onReact: (messageId: string, emoji: string) => Promise<void>;
}

function groupReactions(message: ChatRoomMessageDocument) {
  const groups = new Map<string, { emoji: string; count: number; actors: string[] }>();

  for (const reaction of message.reactions ?? []) {
    const existing = groups.get(reaction.emoji);
    if (existing) {
      existing.count += 1;
      existing.actors.push(reaction.actorName);
    } else {
      groups.set(reaction.emoji, {
        emoji: reaction.emoji,
        count: 1,
        actors: [reaction.actorName],
      });
    }
  }

  return [...groups.values()];
}

export function ChatMessageBubble({
  message,
  align,
  replyToMessage,
  canEdit,
  canDelete,
  onReply,
  onEdit,
  onDelete,
  onReact,
}: ChatMessageBubbleProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEmojiGrid, setShowEmojiGrid] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editDraft, setEditDraft] = useState(message.content);
  const [saving, setSaving] = useState(false);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setEditDraft(message.content);
  }, [message.content]);

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (menuButtonRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setMenuOpen(false);
      setShowEmojiGrid(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || !menuButtonRef.current) return;

    function updatePosition() {
      const button = menuButtonRef.current;
      if (!button) return;

      const rect = button.getBoundingClientRect();
      const menuWidth = 168;
      const menuHeight = showEmojiGrid ? 240 : 160;
      const gap = 4;

      let left = align === "right" ? rect.right - menuWidth : rect.left;
      left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

      let top = rect.bottom + gap;
      if (top + menuHeight > window.innerHeight - 8) {
        top = rect.top - menuHeight - gap;
      }
      top = Math.max(8, top);

      setMenuStyle({
        position: "fixed",
        top,
        left,
        width: menuWidth,
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
  }, [menuOpen, showEmojiGrid, align]);

  async function handleSaveEdit() {
    const trimmed = editDraft.trim();
    if (!trimmed || trimmed === message.content) {
      setEditing(false);
      return;
    }

    setSaving(true);
    try {
      await onEdit(message._id, trimmed);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setMenuOpen(false);
    await onDelete(message._id);
  }

  async function handleReact(emoji: string) {
    setMenuOpen(false);
    setShowEmojiGrid(false);
    await onReact(message._id, emoji);
  }

  const reactionGroups = groupReactions(message);

  const replyStatus: ChatMessageReplyTo | null =
    message.replyTo ??
    (replyToMessage
      ? {
          messageId: replyToMessage._id,
          senderName: replyToMessage.senderName,
          content: replyToMessage.isDeleted
            ? "This message was deleted."
            : replyToMessage.content,
          isDeleted: replyToMessage.isDeleted,
        }
      : null);

  const menu =
    menuOpen && typeof document !== "undefined" ? (
      <div
        ref={menuRef}
        style={menuStyle}
        className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 py-1 shadow-2xl"
      >
        {showEmojiGrid ? (
          <div>
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-xs text-slate-400 hover:bg-slate-800"
              onClick={() => setShowEmojiGrid(false)}
            >
              ← Back
            </button>
            <ChatEmojiGrid onSelect={(emoji) => void handleReact(emoji)} columns={6} />
          </div>
        ) : (
          <>
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              onClick={() => {
                setMenuOpen(false);
                onReply(message);
              }}
            >
              Reply
            </button>
            {canEdit && !message.isDeleted ? (
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
                onClick={() => {
                  setMenuOpen(false);
                  setEditing(true);
                }}
              >
                Edit
              </button>
            ) : null}
            {canDelete ? (
              <button
                type="button"
                className="w-full px-3 py-2 text-left text-sm text-red-300 hover:bg-slate-800"
                onClick={() => void handleDelete()}
              >
                Delete
              </button>
            ) : null}
            <button
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-slate-200 hover:bg-slate-800"
              onClick={() => setShowEmojiGrid(true)}
            >
              Emoji
            </button>
          </>
        )}
      </div>
    ) : null;

  return (
    <div className={`group flex ${align === "right" ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
          align === "right" ? "bg-cyan-500/20 text-cyan-50" : "bg-slate-800 text-slate-200"
        } ${message.isDeleted ? "opacity-70 italic" : ""}`}
      >
        <div className="mb-1 flex items-start justify-between gap-2">
          <p className="text-xs text-slate-400">{message.senderName}</p>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Message actions"
            onClick={() => setMenuOpen((current) => !current)}
            className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 opacity-70 transition-opacity hover:bg-slate-700/50 hover:text-slate-200 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden />
          </button>
        </div>

        {replyStatus ? <ChatReplyStatus reply={replyStatus} align={align} /> : null}

        {editing ? (
          <div className="space-y-2">
            <textarea
              value={editDraft}
              onChange={(event) => setEditDraft(event.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-slate-600 bg-slate-950/80 px-2 py-1.5 text-sm text-slate-100 focus:border-cyan-500 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveEdit()}
                className="rounded-md bg-cyan-600 px-2 py-1 text-xs text-white hover:bg-cyan-500 disabled:opacity-60"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setEditDraft(message.content);
                }}
                className="rounded-md px-2 py-1 text-xs text-slate-400 hover:text-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-wrap">{message.content}</p>
            {message.editedAt ? (
              <p className="mt-1 text-[10px] text-slate-500">edited</p>
            ) : null}
          </>
        )}

        {reactionGroups.length > 0 ? (
          <div className="mt-2 flex flex-wrap gap-1">
            {reactionGroups.map((group) => (
              <button
                key={group.emoji}
                type="button"
                title={group.actors.join(", ")}
                onClick={() => void onReact(message._id, group.emoji)}
                className="inline-flex items-center gap-1 rounded-full border border-slate-600/80 bg-slate-950/50 px-2 py-0.5 text-xs hover:bg-slate-700/50"
              >
                <span>{group.emoji}</span>
                <span className="text-slate-400">{group.count}</span>
              </button>
            ))}
          </div>
        ) : null}
      </div>
      {menu ? createPortal(menu, document.body) : null}
    </div>
  );
}
