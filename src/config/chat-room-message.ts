export type ChatMessageReplyTo = {
  messageId: string;
  senderName: string;
  content: string;
  isDeleted?: boolean;
};

export type ChatMessageReaction = {
  emoji: string;
  actorRole: "candidate" | "hr";
  actorName: string;
};

export type ChatRoomMessageDocument = {
  _id: string;
  sessionId: string;
  senderRole: "candidate" | "hr";
  senderName: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  isDeleted?: boolean;
  replyToMessageId?: string;
  replyTo?: ChatMessageReplyTo;
  reactions: ChatMessageReaction[];
};

export type ChatRoomMessageInput = {
  sessionId: string;
  senderRole: "candidate" | "hr";
  senderName: string;
  content: string;
  replyToMessageId?: string;
};
