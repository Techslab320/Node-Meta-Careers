import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { connectDB } from "@/lib/database/mongodb";
import { ChatRoomSessionModel } from "@/models/ChatRoomSession";
import { chatRoomWaitingSessionTtlMs } from "@/config/chat-room-session";

export const candidateSessionTokenHeader = "x-candidate-session-token";

export function generateCandidateSessionToken() {
  return randomBytes(32).toString("hex");
}

export function getCandidateSessionTokenFromRequest(request: Request) {
  return request.headers.get(candidateSessionTokenHeader)?.trim() || null;
}

function safeEqualToken(expected: string, provided: string) {
  const expectedHash = createHash("sha256").update(expected).digest();
  const providedHash = createHash("sha256").update(provided).digest();
  return timingSafeEqual(expectedHash, providedHash);
}

function waitingSinceDate() {
  return new Date(Date.now() - chatRoomWaitingSessionTtlMs);
}

export async function verifyCandidateSessionAccess(
  sessionId: string,
  token: string | null,
) {
  await connectDB();

  const session = await ChatRoomSessionModel.findById(sessionId).select(
    "candidateSessionToken status updatedAt",
  );

  if (!session || session.updatedAt.getTime() < waitingSinceDate().getTime()) {
    return null;
  }

  if (session.status === "left") {
    return null;
  }

  const storedToken = session.candidateSessionToken?.trim();
  if (storedToken) {
    if (!token || !safeEqualToken(storedToken, token)) {
      return null;
    }
  }

  return session;
}

export function candidateSessionAuthHeaders(token: string): HeadersInit {
  return { [candidateSessionTokenHeader]: token };
}
