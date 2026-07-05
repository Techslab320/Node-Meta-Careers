import { NextResponse } from "next/server";
import { z } from "zod";
import { getCandidateSessionTokenFromRequest } from "@/lib/chat-room/candidate-session-auth";
import { getSessionMessages, addSessionMessage } from "@/lib/chat-room/messages";
import { getAuthorizedCandidateSession } from "@/lib/chat-room/sessions";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

const postMessageSchema = z.object({
  senderName: z.string().min(1).max(120),
  content: z.string().min(1).max(2000),
  replyToMessageId: z.string().optional(),
});

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { sessionId } = await params;
    const token = getCandidateSessionTokenFromRequest(request);
    const session = await getAuthorizedCandidateSession(sessionId, token);

    if (!session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 403 });
    }

    const messages = await getSessionMessages(sessionId);
    return NextResponse.json({ messages, status: session.status });
  } catch (error) {
    console.error("Failed to load session messages", error);
    return NextResponse.json({ error: "Unable to load messages" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const limit = rateLimit(getClientKey(request, "chat-room-session-message"), 60, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many messages" }, { status: 429 });
    }

    const { sessionId } = await params;
    const token = getCandidateSessionTokenFromRequest(request);
    const session = await getAuthorizedCandidateSession(sessionId, token);

    if (!session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 403 });
    }

    if (session.status !== "in_progress") {
      return NextResponse.json(
        { error: "Recruiter has not joined yet" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const parsed = postMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid message" },
        { status: 400 },
      );
    }

    const message = await addSessionMessage({
      sessionId,
      senderRole: "candidate",
      senderName: parsed.data.senderName,
      content: parsed.data.content,
      replyToMessageId: parsed.data.replyToMessageId,
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Failed to send session message", error);
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
  }
}
