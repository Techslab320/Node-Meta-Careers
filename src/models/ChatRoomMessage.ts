import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { mongoCollections } from "@/config/database";

const chatRoomMessageSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoomSession",
      required: true,
      index: true,
    },
    senderRole: {
      type: String,
      enum: ["candidate", "hr"],
      required: true,
    },
    senderName: { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true, maxlength: 4000 },
    editedAt: { type: Date },
    isDeleted: { type: Boolean, default: false },
    replyToMessageId: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoomMessage",
    },
    replyTo: {
      messageId: { type: Schema.Types.ObjectId, ref: "ChatRoomMessage" },
      senderName: { type: String, trim: true },
      content: { type: String, trim: true, maxlength: 500 },
      isDeleted: { type: Boolean, default: false },
    },
    reactions: {
      type: [
        {
          emoji: { type: String, required: true, trim: true, maxlength: 16 },
          actorRole: { type: String, enum: ["candidate", "hr"], required: true },
          actorName: { type: String, required: true, trim: true, maxlength: 120 },
        },
      ],
      default: [],
    },
  },
  { timestamps: true },
);

chatRoomMessageSchema.index({ sessionId: 1, createdAt: 1 });

export type ChatRoomMessage = InferSchemaType<typeof chatRoomMessageSchema>;

export const ChatRoomMessageModel: Model<ChatRoomMessage> =
  mongoose.models.ChatRoomMessage ??
  mongoose.model<ChatRoomMessage>(
    "ChatRoomMessage",
    chatRoomMessageSchema,
    mongoCollections.chatRoomMessages,
  );
