import {
  defaultChatRoomSettings,
  maxHrInterviewerCount,
  normalizeHrInterviewers,
} from "@/config/chat-room";
import {
  defaultHrBotModel,
  defaultHrBotProvider,
  isHrBotProvider,
  normalizeHrBotModel,
} from "@/config/hr-bot-models";
import { connectDB } from "@/lib/database/mongodb";
import { ChatRoomSettingsModel } from "@/models/ChatRoomSettings";
import type { ChatRoomSettingsDocument, ChatRoomSettingsInput } from "@/config/chat-room";

function serializeSettings(
  settings: InstanceType<typeof ChatRoomSettingsModel>,
): ChatRoomSettingsDocument {
  const hrInterviewerCount = Math.min(
    maxHrInterviewerCount,
    Math.max(
      1,
      settings.hrInterviewerCount ?? defaultChatRoomSettings.hrInterviewerCount,
    ),
  );
  const hrBotProvider = isHrBotProvider(settings.hrBotProvider ?? "")
    ? settings.hrBotProvider
    : defaultHrBotProvider;
  const hrBotModel = normalizeHrBotModel(
    hrBotProvider,
    settings.hrBotModel ?? defaultHrBotModel,
  );
  const hrInterviewers = normalizeHrInterviewers(
    hrInterviewerCount,
    (settings.hrInterviewers || []).map((interviewer) => ({
      fullName: interviewer.fullName || "",
      avatarUrl: interviewer.avatarUrl || "",
      role: interviewer.role,
    })),
  );

  return {
    _id: settings._id.toString(),
    roomName: settings.roomName,
    isOpen: settings.isOpen,
    welcomeMessage: settings.welcomeMessage,
    waitingMessage: settings.waitingMessage,
    waitingNotice: settings.waitingNotice,
    requireGmail: settings.requireGmail,
    minPasswordLength: settings.minPasswordLength,
    textChatOnlyNotice: settings.textChatOnlyNotice,
    hrInterviewerCount,
    hrInterviewers,
    hrBotEnabled: settings.hrBotEnabled ?? defaultChatRoomSettings.hrBotEnabled,
    hrBotProvider,
    hrBotModel,
    updatedAt: settings.updatedAt.toISOString(),
  };
}

export async function getChatRoomSettings(): Promise<ChatRoomSettingsDocument> {
  await connectDB();

  const existing = await ChatRoomSettingsModel.findOne().sort({ updatedAt: -1 });
  if (existing) {
    return serializeSettings(existing);
  }

  const created = await ChatRoomSettingsModel.create({
    ...defaultChatRoomSettings,
    hrInterviewers: normalizeHrInterviewers(defaultChatRoomSettings.hrInterviewerCount),
  });

  return serializeSettings(created);
}

export async function updateChatRoomSettings(
  input: ChatRoomSettingsInput,
): Promise<ChatRoomSettingsDocument> {
  await connectDB();

  const payload = {
    ...input,
    hrInterviewers: normalizeHrInterviewers(input.hrInterviewerCount, input.hrInterviewers),
  };

  const updated = await ChatRoomSettingsModel.findOneAndUpdate(
    {},
    payload,
    { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, sort: { updatedAt: -1 } },
  );

  if (!updated) {
    const created = await ChatRoomSettingsModel.create(payload);
    return serializeSettings(created);
  }

  return serializeSettings(updated);
}

export function getPublicChatRoomSettings(
  settings: ChatRoomSettingsDocument,
): ChatRoomSettingsInput {
  return {
    roomName: settings.roomName,
    isOpen: settings.isOpen,
    welcomeMessage: settings.welcomeMessage,
    waitingMessage: settings.waitingMessage,
    waitingNotice: settings.waitingNotice,
    requireGmail: settings.requireGmail,
    minPasswordLength: settings.minPasswordLength,
    textChatOnlyNotice: settings.textChatOnlyNotice,
    hrInterviewerCount: settings.hrInterviewerCount,
    hrInterviewers: settings.hrInterviewers,
    hrBotEnabled: settings.hrBotEnabled,
    hrBotProvider: settings.hrBotProvider,
    hrBotModel: settings.hrBotModel,
  };
}
