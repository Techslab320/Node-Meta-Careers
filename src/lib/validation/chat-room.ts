import { z } from "zod";
import {
  hrInterviewerRoles,
  maxHrInterviewerCount,
  normalizeHrInterviewers,
} from "@/config/chat-room";
import { hrBotProviders, isHrBotProvider, normalizeHrBotModel } from "@/config/hr-bot-models";

export const hrInterviewerSchema = z.object({
  fullName: z.string().min(1).max(120),
  avatarUrl: z.string().max(500),
  role: z.enum(hrInterviewerRoles),
});

export const chatRoomSettingsSchema = z
  .object({
    roomName: z.string().min(1).max(120),
    isOpen: z.boolean(),
    welcomeMessage: z.string().min(1).max(500),
    waitingMessage: z.string().min(1).max(1000),
    waitingNotice: z.string().min(1).max(300),
    requireGmail: z.boolean(),
    minPasswordLength: z.number().int().min(6).max(32),
    textChatOnlyNotice: z.string().min(1).max(300),
    hrInterviewerCount: z.number().int().min(1).max(maxHrInterviewerCount),
    hrInterviewers: z.array(hrInterviewerSchema).max(maxHrInterviewerCount),
    hrBotEnabled: z.boolean(),
    hrBotProvider: z.enum(hrBotProviders),
    hrBotModel: z.string().min(1).max(120),
  })
  .transform((data) => ({
    ...data,
    hrBotProvider: isHrBotProvider(data.hrBotProvider) ? data.hrBotProvider : "groq",
    hrBotModel: normalizeHrBotModel(
      isHrBotProvider(data.hrBotProvider) ? data.hrBotProvider : "groq",
      data.hrBotModel,
    ),
    hrInterviewers: normalizeHrInterviewers(data.hrInterviewerCount, data.hrInterviewers),
  }));

export type ChatRoomSettingsFormInput = z.infer<typeof chatRoomSettingsSchema>;
