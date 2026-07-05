import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { chatRoomSessionStatuses } from "@/config/chat-room-session";
import { mongoCollections } from "@/config/database";

const chatRoomSessionSchema = new Schema(
  {
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: "Application",
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    jobTitle: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: chatRoomSessionStatuses,
      default: "waiting",
      index: true,
    },
    joinedAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    joinedHrInterviewerIndexes: { type: [Number], default: [] },
    hrBotEnabledIndexes: { type: [Number], default: [] },
    candidateAvatarUrl: { type: String, trim: true, default: "" },
    candidateSessionToken: { type: String, trim: true, default: "" },
  },
  { timestamps: true },
);

chatRoomSessionSchema.index({ email: 1, jobTitle: 1 });
chatRoomSessionSchema.index({ status: 1, updatedAt: -1 });

export type ChatRoomSession = InferSchemaType<typeof chatRoomSessionSchema>;

export const ChatRoomSessionModel: Model<ChatRoomSession> =
  mongoose.models.ChatRoomSession ??
  mongoose.model<ChatRoomSession>(
    "ChatRoomSession",
    chatRoomSessionSchema,
    mongoCollections.chatRoomSessions,
  );
