import type { ChatRoomMessageDocument } from "@/config/chat-room-message";

export function areChatMessagesEqual(
  current: ChatRoomMessageDocument[],
  next: ChatRoomMessageDocument[],
): boolean {
  if (current.length !== next.length) return false;
  return current.every((message, index) => {
    const other = next[index];
    return (
      message._id === other._id &&
      message.content === other.content &&
      message.isDeleted === other.isDeleted &&
      JSON.stringify(message.reactions ?? []) === JSON.stringify(other.reactions ?? [])
    );
  });
}

export function scrollChatContainerToEnd(container: HTMLElement | null) {
  if (!container) return;
  container.scrollTop = container.scrollHeight;
}
