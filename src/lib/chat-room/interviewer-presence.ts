import {
  getDefaultInterviewerRole,
  type ChatRoomSettingsDocument,
  type HrInterviewer,
} from "@/config/chat-room";

export type JoinedHrInterviewerView = HrInterviewer & {
  index: number;
};

export function buildJoinedHrInterviewerViews(
  indexes: number[],
  settings: Pick<ChatRoomSettingsDocument, "hrInterviewers" | "hrInterviewerCount">,
): JoinedHrInterviewerView[] {
  const configured = settings.hrInterviewers.slice(0, settings.hrInterviewerCount);

  return [...indexes]
    .sort((a, b) => a - b)
    .filter((index) => index >= 0 && index < configured.length)
    .map((index) => {
      const interviewer = configured[index];
      return {
        index,
        fullName: interviewer?.fullName?.trim() || `HR interviewer ${index + 1}`,
        role: interviewer?.role || getDefaultInterviewerRole(index),
        avatarUrl: interviewer?.avatarUrl?.trim() || "",
      };
    });
}
