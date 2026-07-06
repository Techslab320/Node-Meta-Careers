import type { JoinedHrInterviewerView } from "@/lib/chat-room/interviewer-presence";

function areNumberArraysEqual(left: number[], right: number[]): boolean {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

function areJoinedInterviewersEqual(
  left: JoinedHrInterviewerView[],
  right: JoinedHrInterviewerView[],
): boolean {
  if (left.length !== right.length) return false;
  return left.every((interviewer, index) => {
    const other = right[index];
    return (
      interviewer.index === other.index &&
      interviewer.fullName === other.fullName &&
      interviewer.role === other.role &&
      interviewer.avatarUrl === other.avatarUrl
    );
  });
}

export function applySessionStatusUpdate(
  current: {
    joinedHrInterviewerIndexes: number[];
    joinedHrInterviewers: JoinedHrInterviewerView[];
    candidateAvatarUrl?: string;
    hrBotEnabledIndexes: number[];
  },
  data: {
    joinedHrInterviewerIndexes?: number[];
    joinedHrInterviewers?: JoinedHrInterviewerView[];
    candidateAvatarUrl?: string;
    hrBotEnabledIndexes?: number[];
  },
) {
  const nextIndexes = Array.isArray(data.joinedHrInterviewerIndexes)
    ? [...data.joinedHrInterviewerIndexes].sort((a, b) => a - b)
    : current.joinedHrInterviewerIndexes;

  const nextInterviewers = Array.isArray(data.joinedHrInterviewers)
    ? data.joinedHrInterviewers
    : current.joinedHrInterviewers;

  const nextBotIndexes = Array.isArray(data.hrBotEnabledIndexes)
    ? [...data.hrBotEnabledIndexes].sort((a, b) => a - b)
    : current.hrBotEnabledIndexes;

  const nextAvatarUrl = data.candidateAvatarUrl ?? current.candidateAvatarUrl;

  if (
    areNumberArraysEqual(current.joinedHrInterviewerIndexes, nextIndexes) &&
    areJoinedInterviewersEqual(current.joinedHrInterviewers, nextInterviewers) &&
    areNumberArraysEqual(current.hrBotEnabledIndexes, nextBotIndexes) &&
    current.candidateAvatarUrl === nextAvatarUrl
  ) {
    return current;
  }

  return {
    joinedHrInterviewerIndexes: nextIndexes,
    joinedHrInterviewers: nextInterviewers,
    candidateAvatarUrl: nextAvatarUrl,
    hrBotEnabledIndexes: nextBotIndexes,
  };
}
