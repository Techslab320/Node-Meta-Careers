import {
  chatRoomPresenceTimeoutMs,
  chatRoomWaitingSessionTtlMs,
  type ChatRoomSessionDocument,
} from "@/config/chat-room-session";
import {
  generateCandidateSessionToken,
  verifyCandidateSessionAccess,
} from "@/lib/chat-room/candidate-session-auth";
import { ChatRoomJoinError } from "@/lib/chat-room/join-errors";
import { connectDB } from "@/lib/database/mongodb";
import { ApplicationModel } from "@/models/Application";
import { ChatRoomSessionModel } from "@/models/ChatRoomSession";

interface JoinChatRoomSessionInput {
  fullName: string;
  email: string;
  jobTitle: string;
  applicationId?: string;
}

export interface JoinChatRoomSessionResult extends ChatRoomSessionDocument {
  candidateSessionToken: string;
}

function normalizeJoinedHrInterviewerIndexes(
  session: InstanceType<typeof ChatRoomSessionModel>,
): number[] {
  return [...(session.joinedHrInterviewerIndexes ?? [])].sort((a, b) => a - b);
}

async function repairLegacyJoinedIndexes(
  session: InstanceType<typeof ChatRoomSessionModel>,
) {
  const indexes = normalizeJoinedHrInterviewerIndexes(session);
  if (session.status === "in_progress" && indexes.length === 0) {
    return ChatRoomSessionModel.findByIdAndUpdate(
      session._id,
      { $addToSet: { joinedHrInterviewerIndexes: 0 } },
      { returnDocument: 'after' },
    );
  }
  return session;
}

async function loadSerializedSession(sessionId: string) {
  await connectDB();
  let session = await ChatRoomSessionModel.findById(sessionId);
  if (!session) return null;
  session = (await repairLegacyJoinedIndexes(session)) ?? session;
  return serializeSession(session);
}

function serializeSession(
  session: InstanceType<typeof ChatRoomSessionModel>,
): ChatRoomSessionDocument {
  const candidateAvatarUrl = session.candidateAvatarUrl?.trim();
  return {
    _id: session._id.toString(),
    applicationId: session.applicationId?.toString(),
    fullName: session.fullName,
    email: session.email,
    jobTitle: session.jobTitle,
    status: session.status,
    joinedAt: session.joinedAt.toISOString(),
    lastActiveAt: (session.lastActiveAt ?? session.updatedAt).toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    joinedHrInterviewerIndexes: normalizeJoinedHrInterviewerIndexes(session),
    hrBotEnabledIndexes: [...(session.hrBotEnabledIndexes ?? [])].sort((a, b) => a - b),
    candidateAvatarUrl: candidateAvatarUrl || undefined,
  };
}

function presenceSinceDate() {
  return new Date(Date.now() - chatRoomPresenceTimeoutMs);
}

function waitingSinceDate() {
  return new Date(Date.now() - chatRoomWaitingSessionTtlMs);
}

async function resolveApplicationId(input: JoinChatRoomSessionInput) {
  await connectDB();

  if (input.applicationId) {
    const application = await ApplicationModel.findById(input.applicationId).select("_id email");
    if (
      application &&
      application.email.toLowerCase() === input.email.toLowerCase()
    ) {
      return application._id.toString();
    }
  }

  const application = await ApplicationModel.findOne({
    email: input.email.toLowerCase(),
    jobTitle: input.jobTitle,
  })
    .sort({ createdAt: -1 })
    .select("_id");

  return application?._id.toString();
}

export async function joinChatRoomSession(
  input: JoinChatRoomSessionInput,
): Promise<JoinChatRoomSessionResult> {
  await connectDB();

  const email = input.email.toLowerCase().trim();
  const jobTitle = input.jobTitle.trim();
  const fullName = input.fullName.trim();
  const now = new Date();

  let applicationId: string | undefined;

  if (input.applicationId) {
    const application = await ApplicationModel.findById(input.applicationId).select("_id email");
    if (!application) {
      throw new ChatRoomJoinError(403, "This interview link is invalid.");
    }
    if (application.email.toLowerCase() !== email) {
      throw new ChatRoomJoinError(
        403,
        "This interview link is registered to a different email address.",
      );
    }
    applicationId = application._id.toString();
  } else {
    applicationId = (await resolveApplicationId(input)) ?? undefined;
  }

  const filter = applicationId ? { applicationId } : { email, jobTitle };
  const existing = await ChatRoomSessionModel.findOne(filter);

  if (existing) {
    if (existing.email !== email) {
      throw new ChatRoomJoinError(
        403,
        "This interview room is already reserved for another candidate.",
      );
    }

    const candidateSessionToken =
      existing.candidateSessionToken?.trim() || generateCandidateSessionToken();

    await ChatRoomSessionModel.findByIdAndUpdate(existing._id, {
      $set: {
        applicationId: applicationId ?? existing.applicationId,
        fullName,
        email,
        jobTitle,
        lastActiveAt: now,
        candidateSessionToken,
        ...(existing.status === "left" ? { status: "waiting" as const } : {}),
      },
    });

    const session = await loadSerializedSession(existing._id.toString());
    if (!session) {
      throw new ChatRoomJoinError(500, "Unable to join the interview room.");
    }

    return { ...session, candidateSessionToken };
  }

  const candidateSessionToken = generateCandidateSessionToken();
  const created = await ChatRoomSessionModel.create({
    applicationId,
    fullName,
    email,
    jobTitle,
    status: "waiting",
    joinedAt: now,
    lastActiveAt: now,
    candidateSessionToken,
  });

  return { ...serializeSession(created), candidateSessionToken };
}

export async function getWaitingApplicationIds(): Promise<string[]> {
  await connectDB();

  const presenceCutoff = presenceSinceDate();

  const sessions = await ChatRoomSessionModel.find({
    status: "waiting",
    $or: [
      { lastActiveAt: { $gte: presenceCutoff } },
      { lastActiveAt: { $exists: false }, updatedAt: { $gte: presenceCutoff } },
    ],
    applicationId: { $exists: true, $ne: null },
  }).select("applicationId");

  return sessions
    .map((session) => session.applicationId?.toString())
    .filter((id): id is string => Boolean(id));
}

export async function getJoinableChatRoomApplicationMap(): Promise<
  Record<string, string>
> {
  await connectDB();

  const presenceCutoff = presenceSinceDate();
  const ttlCutoff = waitingSinceDate();

  const sessions = await ChatRoomSessionModel.find({
    applicationId: { $exists: true, $ne: null },
    updatedAt: { $gte: ttlCutoff },
    $or: [
      { status: "in_progress" },
      {
        status: "waiting",
        $or: [
          { lastActiveAt: { $gte: presenceCutoff } },
          { lastActiveAt: { $exists: false }, updatedAt: { $gte: presenceCutoff } },
        ],
      },
    ],
  })
    .select("_id applicationId")
    .sort({ updatedAt: -1 });

  const map: Record<string, string> = {};
  for (const session of sessions) {
    const applicationId = session.applicationId?.toString();
    if (applicationId && !map[applicationId]) {
      map[applicationId] = session._id.toString();
    }
  }

  return map;
}

export async function getWaitingSessionForApplication(applicationId: string) {
  await connectDB();

  const presenceCutoff = presenceSinceDate();

  const session = await ChatRoomSessionModel.findOne({
    applicationId,
    status: "waiting",
    $or: [
      { lastActiveAt: { $gte: presenceCutoff } },
      { lastActiveAt: { $exists: false }, updatedAt: { $gte: presenceCutoff } },
    ],
  }).sort({ lastActiveAt: -1, updatedAt: -1 });

  return session ? serializeSession(session) : null;
}

export async function getWaitingChatRoomSessions(): Promise<ChatRoomSessionDocument[]> {
  await connectDB();

  const presenceCutoff = presenceSinceDate();

  const sessions = await ChatRoomSessionModel.find({
    status: "waiting",
    $or: [
      { lastActiveAt: { $gte: presenceCutoff } },
      { lastActiveAt: { $exists: false }, updatedAt: { $gte: presenceCutoff } },
    ],
  }).sort({ lastActiveAt: -1, updatedAt: -1 });

  return sessions.map(serializeSession);
}

export async function getActiveChatRoomSessions(): Promise<ChatRoomSessionDocument[]> {
  await connectDB();

  const sessions = await ChatRoomSessionModel.find({
    status: { $in: ["waiting", "in_progress"] },
    updatedAt: { $gte: waitingSinceDate() },
  }).sort({ updatedAt: -1 });

  return sessions.map(serializeSession);
}

export async function getChatRoomSessionByApplicationId(applicationId: string) {
  await connectDB();

  const session = await ChatRoomSessionModel.findOne({
    applicationId,
    updatedAt: { $gte: waitingSinceDate() },
  }).sort({ updatedAt: -1 });

  return session ? serializeSession(session) : null;
}

export async function getChatRoomSessionById(sessionId: string) {
  await connectDB();
  let session = await ChatRoomSessionModel.findById(sessionId);
  if (!session || session.updatedAt.getTime() < waitingSinceDate().getTime()) {
    return null;
  }
  session = (await repairLegacyJoinedIndexes(session)) ?? session;
  return serializeSession(session);
}

export async function getAdminChatRoomSessionById(sessionId: string) {
  await connectDB();
  let session = await ChatRoomSessionModel.findById(sessionId);
  if (!session || session.updatedAt.getTime() < waitingSinceDate().getTime()) {
    return null;
  }
  if (session.status === "left") {
    return null;
  }
  session = (await repairLegacyJoinedIndexes(session)) ?? session;
  return serializeSession(session);
}

export async function getAdminChatRoomSessionByApplicationId(applicationId: string) {
  await connectDB();
  const session = await ChatRoomSessionModel.findOne({
    applicationId,
    status: { $in: ["waiting", "in_progress"] },
    updatedAt: { $gte: waitingSinceDate() },
  }).sort({ updatedAt: -1 });

  return session ? serializeSession(session) : null;
}

export async function touchSessionPresence(sessionId: string) {
  await connectDB();

  const active = await ChatRoomSessionModel.findOneAndUpdate(
    { _id: sessionId, status: { $in: ["waiting", "in_progress"] } },
    { $set: { lastActiveAt: new Date() } },
  );

  if (active) {
    return loadSerializedSession(sessionId);
  }

  const revived = await ChatRoomSessionModel.findOneAndUpdate(
    { _id: sessionId, status: "left" },
    { $set: { status: "waiting", lastActiveAt: new Date() } },
  );

  return revived ? loadSerializedSession(sessionId) : null;
}

export async function touchSessionPresenceForCandidate(
  sessionId: string,
  token: string | null,
) {
  const allowed = await verifyCandidateSessionAccess(sessionId, token);
  if (!allowed) {
    return null;
  }

  return touchSessionPresence(sessionId);
}

export async function getAuthorizedCandidateSession(
  sessionId: string,
  token: string | null,
) {
  const allowed = await verifyCandidateSessionAccess(sessionId, token);
  if (!allowed) {
    return null;
  }

  return getChatRoomSessionById(sessionId);
}

export async function markSessionLeft(sessionId: string, token: string | null) {
  const allowed = await verifyCandidateSessionAccess(sessionId, token);
  if (!allowed) {
    return null;
  }

  await connectDB();
  const session = await ChatRoomSessionModel.findOneAndUpdate(
    { _id: sessionId, status: { $in: ["waiting", "in_progress"] } },
    { status: "left" },
    { returnDocument: 'after' },
  );
  return session ? serializeSession(session) : null;
}

export async function markSessionInProgress(sessionId: string) {
  return joinHrInterviewer(sessionId, 0);
}

export async function joinHrInterviewer(sessionId: string, interviewerIndex: number) {
  await connectDB();

  const updated = await ChatRoomSessionModel.findByIdAndUpdate(sessionId, {
    $addToSet: { joinedHrInterviewerIndexes: interviewerIndex },
    $set: {
      status: "in_progress",
      lastActiveAt: new Date(),
    },
  });

  if (!updated) {
    const exists = await ChatRoomSessionModel.findById(sessionId).select("_id");
    if (!exists) return null;
  }

  return loadSerializedSession(sessionId);
}

export async function leaveHrInterviewer(sessionId: string, interviewerIndex: number) {
  await connectDB();

  const updated = await ChatRoomSessionModel.findByIdAndUpdate(sessionId, {
    $pull: {
      joinedHrInterviewerIndexes: interviewerIndex,
      hrBotEnabledIndexes: interviewerIndex,
    },
    $set: { lastActiveAt: new Date() },
  });

  if (!updated) return null;

  const session = await ChatRoomSessionModel.findById(sessionId).select(
    "joinedHrInterviewerIndexes",
  );
  if (session && (session.joinedHrInterviewerIndexes ?? []).length === 0) {
    await ChatRoomSessionModel.findByIdAndUpdate(sessionId, { $set: { status: "waiting" } });
  }

  return loadSerializedSession(sessionId);
}

export async function toggleHrBotForInterviewer(sessionId: string, interviewerIndex: number) {
  await connectDB();

  const disabled = await ChatRoomSessionModel.findOneAndUpdate(
    { _id: sessionId, hrBotEnabledIndexes: interviewerIndex },
    {
      $pull: { hrBotEnabledIndexes: interviewerIndex },
      $set: { lastActiveAt: new Date() },
    },
  );

  if (!disabled) {
    await ChatRoomSessionModel.findByIdAndUpdate(sessionId, {
      $addToSet: { hrBotEnabledIndexes: interviewerIndex },
      $set: { lastActiveAt: new Date() },
    });
  }

  return loadSerializedSession(sessionId);
}

export async function updateCandidateAvatarUrl(sessionId: string, avatarUrl: string) {
  await connectDB();
  const session = await ChatRoomSessionModel.findByIdAndUpdate(
    sessionId,
    { candidateAvatarUrl: avatarUrl.trim(), lastActiveAt: new Date() },
    { returnDocument: 'after' },
  );
  return session ? serializeSession(session) : null;
}
