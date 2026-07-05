import { connectDB } from "@/lib/database/mongodb";
import { ChatRoomMessageModel } from "@/models/ChatRoomMessage";
import type {
  ChatMessageReaction,
  ChatMessageReplyTo,
  ChatRoomMessageDocument,
} from "@/config/chat-room-message";

function serializeReaction(reaction: ChatMessageReaction): ChatMessageReaction {
  return {
    emoji: reaction.emoji,
    actorRole: reaction.actorRole,
    actorName: reaction.actorName,
  };
}

function serializeReplyTo(
  replyTo: ChatRoomMessageDocument["replyTo"],
): ChatMessageReplyTo | undefined {
  if (!replyTo?.messageId || !replyTo.senderName) return undefined;

  return {
    messageId: replyTo.messageId,
    senderName: replyTo.senderName,
    content: replyTo.content,
    isDeleted: replyTo.isDeleted ?? false,
  };
}

function serializeMessage(
  message: InstanceType<typeof ChatRoomMessageModel>,
): ChatRoomMessageDocument {
  const replyToRaw = message.replyTo as
    | {
        messageId?: { toString(): string };
        senderName?: string;
        content?: string;
        isDeleted?: boolean;
      }
    | undefined;

  const replyTo =
    replyToRaw?.messageId && replyToRaw.senderName
      ? {
          messageId: replyToRaw.messageId.toString(),
          senderName: replyToRaw.senderName,
          content: replyToRaw.content ?? "",
          isDeleted: replyToRaw.isDeleted ?? false,
        }
      : undefined;

  return {
    _id: message._id.toString(),
    sessionId: message.sessionId.toString(),
    senderRole: message.senderRole,
    senderName: message.senderName,
    content: message.content,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt?.toISOString(),
    editedAt: message.editedAt?.toISOString(),
    isDeleted: message.isDeleted ?? false,
    replyToMessageId: message.replyToMessageId?.toString(),
    replyTo,
    reactions: (message.reactions ?? []).map(serializeReaction),
  };
}

function enrichReplySnapshots(
  messages: ChatRoomMessageDocument[],
): ChatRoomMessageDocument[] {
  const byId = new Map(messages.map((message) => [message._id, message]));

  return messages.map((message) => {
    if (message.replyTo) return message;

    if (!message.replyToMessageId) return message;

    const parent = byId.get(message.replyToMessageId);
    if (!parent) return message;

    return {
      ...message,
      replyTo: {
        messageId: parent._id,
        senderName: parent.senderName,
        content: parent.isDeleted ? "This message was deleted." : parent.content,
        isDeleted: parent.isDeleted ?? false,
      },
    };
  });
}

async function buildReplySnapshot(
  sessionId: string,
  replyToMessageId: string,
): Promise<ChatMessageReplyTo | undefined> {
  const parent = await ChatRoomMessageModel.findOne({
    _id: replyToMessageId,
    sessionId,
  }).select("senderName content isDeleted");

  if (!parent) return undefined;

  return {
    messageId: parent._id.toString(),
    senderName: parent.senderName,
    content: parent.isDeleted ? "This message was deleted." : parent.content,
    isDeleted: parent.isDeleted ?? false,
  };
}

export async function getSessionMessages(sessionId: string): Promise<ChatRoomMessageDocument[]> {
  await connectDB();
  const messages = await ChatRoomMessageModel.find({ sessionId })
    .sort({ createdAt: 1 })
    .limit(200);
  return enrichReplySnapshots(messages.map(serializeMessage));
}

export async function getSessionMessageById(sessionId: string, messageId: string) {
  await connectDB();
  const message = await ChatRoomMessageModel.findOne({ _id: messageId, sessionId });
  if (!message) return null;

  const serialized = serializeMessage(message);
  if (serialized.replyTo || !serialized.replyToMessageId) return serialized;

  const replyTo = await buildReplySnapshot(sessionId, serialized.replyToMessageId);
  return replyTo ? { ...serialized, replyTo } : serialized;
}

export async function addSessionMessage(input: {
  sessionId: string;
  senderRole: "candidate" | "hr";
  senderName: string;
  content: string;
  replyToMessageId?: string;
}): Promise<ChatRoomMessageDocument> {
  await connectDB();

  const replyTo = input.replyToMessageId
    ? await buildReplySnapshot(input.sessionId, input.replyToMessageId)
    : undefined;

  const message = await ChatRoomMessageModel.create({
    sessionId: input.sessionId,
    senderRole: input.senderRole,
    senderName: input.senderName,
    content: input.content,
    replyToMessageId: input.replyToMessageId,
    replyTo: replyTo
      ? {
          messageId: replyTo.messageId,
          senderName: replyTo.senderName,
          content: replyTo.content,
          isDeleted: replyTo.isDeleted ?? false,
        }
      : undefined,
  });

  return serializeMessage(message);
}

export async function editSessionMessage(input: {
  sessionId: string;
  messageId: string;
  content: string;
}) {
  await connectDB();
  const message = await ChatRoomMessageModel.findOneAndUpdate(
    { _id: input.messageId, sessionId: input.sessionId, isDeleted: { $ne: true } },
    { $set: { content: input.content.trim(), editedAt: new Date() } },
    { returnDocument: 'after' },
  );
  return message ? serializeMessage(message) : null;
}

export async function deleteSessionMessage(sessionId: string, messageId: string) {
  await connectDB();
  const message = await ChatRoomMessageModel.findOneAndUpdate(
    { _id: messageId, sessionId },
    { $set: { isDeleted: true, content: "This message was deleted." } },
    { returnDocument: 'after' },
  );

  if (message) {
    await ChatRoomMessageModel.updateMany(
      { sessionId, "replyTo.messageId": messageId },
      {
        $set: {
          "replyTo.content": "This message was deleted.",
          "replyTo.isDeleted": true,
        },
      },
    );
  }

  return message ? serializeMessage(message) : null;
}

export async function toggleSessionMessageReaction(input: {
  sessionId: string;
  messageId: string;
  emoji: string;
  actorRole: "candidate" | "hr";
  actorName: string;
}) {
  await connectDB();

  const existing = await ChatRoomMessageModel.findOne({
    _id: input.messageId,
    sessionId: input.sessionId,
    isDeleted: { $ne: true },
  });

  if (!existing) return null;

  const reactions = (existing.reactions ?? []).map((reaction) => ({
    emoji: reaction.emoji,
    actorRole: reaction.actorRole,
    actorName: reaction.actorName,
  }));
  const matchIndex = reactions.findIndex(
    (reaction) =>
      reaction.emoji === input.emoji &&
      reaction.actorRole === input.actorRole &&
      reaction.actorName === input.actorName,
  );

  if (matchIndex >= 0) {
    reactions.splice(matchIndex, 1);
  } else {
    reactions.push({
      emoji: input.emoji,
      actorRole: input.actorRole,
      actorName: input.actorName,
    });
  }

  const message = await ChatRoomMessageModel.findOneAndUpdate(
    { _id: input.messageId, sessionId: input.sessionId },
    { $set: { reactions } },
    { returnDocument: 'after' },
  );

  return message ? serializeMessage(message) : null;
}
