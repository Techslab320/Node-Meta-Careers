export const chatRoomSessionStatuses = ["waiting", "in_progress", "left"] as const;

export type ChatRoomSessionStatus = (typeof chatRoomSessionStatuses)[number];

export const chatRoomWaitingSessionTtlMs = 2 * 60 * 60 * 1000;

/** Candidate must ping within this window to count as actively waiting. */
export const chatRoomPresenceTimeoutMs = 45 * 1000;

export type ChatRoomSessionDocument = {
  _id: string;
  applicationId?: string;
  fullName: string;
  email: string;
  jobTitle: string;
  status: ChatRoomSessionStatus;
  joinedAt: string;
  lastActiveAt: string;
  updatedAt: string;
  joinedHrInterviewerIndexes: number[];
  hrBotEnabledIndexes: number[];
  candidateAvatarUrl?: string;
};

export type { JoinedHrInterviewerView } from "@/lib/chat-room/interviewer-presence";
