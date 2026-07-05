import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import { mongoCollections } from "@/config/database";

const hrInterviewerSchema = new Schema(
  {
    fullName: { type: String, trim: true, default: "" },
    avatarUrl: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: [
        "HR Interviewer",
        "Lead HR Interviewer",
        "Business Manager",
        "Project Manager",
        "Technical Recruiter",
      ],
      default: "HR Interviewer",
    },
  },
  { _id: false },
);

const chatRoomSettingsSchema = new Schema(
  {
    roomName: { type: String, required: true, trim: true },
    isOpen: { type: Boolean, default: true },
    welcomeMessage: { type: String, required: true, trim: true },
    waitingMessage: { type: String, required: true, trim: true },
    waitingNotice: { type: String, required: true, trim: true },
    requireGmail: { type: Boolean, default: true },
    minPasswordLength: { type: Number, default: 6, min: 6, max: 32 },
    textChatOnlyNotice: { type: String, required: true, trim: true },
    hrInterviewerCount: { type: Number, default: 1, min: 1, max: 4 },
    hrInterviewers: { type: [hrInterviewerSchema], default: [] },
    hrBotEnabled: { type: Boolean, default: false },
    hrBotProvider: { type: String, enum: ["groq", "openai"], default: "groq" },
    hrBotModel: { type: String, trim: true, default: "llama-3.3-70b-versatile" },
  },
  { timestamps: true },
);

export type ChatRoomSettings = InferSchemaType<typeof chatRoomSettingsSchema>;

export const ChatRoomSettingsModel: Model<ChatRoomSettings> =
  mongoose.models.ChatRoomSettings ??
  mongoose.model<ChatRoomSettings>(
    "ChatRoomSettings",
    chatRoomSettingsSchema,
    mongoCollections.chatRoomSettings,
  );
