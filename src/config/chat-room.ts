import type { HrBotProvider } from "@/config/hr-bot-models";

export const hrInterviewerRoles = [
  "HR Interviewer",
  "Lead HR Interviewer",
  "Business Manager",
  "Project Manager",
  "Technical Recruiter",
] as const;

export type HrInterviewerRole = (typeof hrInterviewerRoles)[number];

export type HrInterviewer = {
  fullName: string;
  avatarUrl: string;
  role: HrInterviewerRole;
};

export const maxHrInterviewerCount = 4;

export const hrInterviewerCountOptions = [1, 2, 3, 4] as const;

export const defaultHrInterviewerRole: HrInterviewerRole = "HR Interviewer";

export const defaultHrInterviewers: HrInterviewer[] = [
  { fullName: "", avatarUrl: "", role: "Lead HR Interviewer" },
];

export function isHrInterviewerRole(value: unknown): value is HrInterviewerRole {
  return (
    typeof value === "string" &&
    (hrInterviewerRoles as readonly string[]).includes(value)
  );
}

export function getDefaultInterviewerRole(index: number): HrInterviewerRole {
  return index === 0 ? "Lead HR Interviewer" : defaultHrInterviewerRole;
}

export const defaultChatRoomSettings = {
  roomName: "Interview chat room",
  isOpen: true,
  welcomeMessage: "Join the interview for your selected position.",
  waitingMessage:
    "You have joined the interview room. Please wait while a recruiter reviews your application and connects with you here.",
  waitingNotice: "Waiting for recruiter to join...",
  requireGmail: true,
  minPasswordLength: 6,
  textChatOnlyNotice:
    "Text chat only. Camera and microphone are not required for this interview.",
  hrInterviewerCount: 1,
  hrInterviewers: defaultHrInterviewers,
  hrBotEnabled: false,
  hrBotProvider: "groq" as const,
  hrBotModel: "llama-3.3-70b-versatile",
} as const;

export type ChatRoomSettingsDocument = {
  _id: string;
  roomName: string;
  isOpen: boolean;
  welcomeMessage: string;
  waitingMessage: string;
  waitingNotice: string;
  requireGmail: boolean;
  minPasswordLength: number;
  textChatOnlyNotice: string;
  hrInterviewerCount: number;
  hrInterviewers: HrInterviewer[];
  hrBotEnabled: boolean;
  hrBotProvider: HrBotProvider;
  hrBotModel: string;
  updatedAt: string;
};

export type ChatRoomSettingsInput = Omit<
  ChatRoomSettingsDocument,
  "_id" | "updatedAt"
>;

export function normalizeHrInterviewers(
  count: number,
  interviewers: HrInterviewer[] = [],
): HrInterviewer[] {
  const safeCount = Math.min(maxHrInterviewerCount, Math.max(1, count));
  return Array.from({ length: safeCount }, (_, index) => ({
    fullName: interviewers[index]?.fullName?.trim() || "",
    avatarUrl: interviewers[index]?.avatarUrl?.trim() || "",
    role: isHrInterviewerRole(interviewers[index]?.role)
      ? interviewers[index].role
      : getDefaultInterviewerRole(index),
  }));
}
