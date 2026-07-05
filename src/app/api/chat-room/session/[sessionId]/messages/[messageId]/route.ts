import { NextResponse } from "next/server";
import { z } from "zod";
import { getCandidateSessionTokenFromRequest } from "@/lib/chat-room/candidate-session-auth";
import {
  deleteSessionMessage,
  editSessionMessage,
  getSessionMessageById,
  toggleSessionMessageReaction,
} from "@/lib/chat-room/messages";
import { getAuthorizedCandidateSession } from "@/lib/chat-room/sessions";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

interface RouteParams {
  params: Promise<{ sessionId: string; messageId: string }>;
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("edit"),
    content: z.string().min(1).max(2000),
    senderName: z.string().min(1).max(120),
  }),
  z.object({
    action: z.literal("react"),
    emoji: z.string().min(1).max(16),
    actorName: z.string().min(1).max(120),
  }),
]);

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const limit = rateLimit(getClientKey(request, "chat-room-message-action"), 120, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { sessionId, messageId } = await params;
    const token = getCandidateSessionTokenFromRequest(request);
    const session = await getAuthorizedCandidateSession(sessionId, token);
    if (!session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 403 });
    }

    const existing = await getSessionMessageById(sessionId, messageId);
    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 },
      );
    }

    if (parsed.data.action === "edit") {
      if (
        existing.senderRole !== "candidate" ||
        existing.senderName !== parsed.data.senderName
      ) {
        return NextResponse.json({ error: "Cannot edit this message" }, { status: 403 });
      }

      const message = await editSessionMessage({
        sessionId,
        messageId,
        content: parsed.data.content,
      });
      return NextResponse.json({ message });
    }

    const message = await toggleSessionMessageReaction({
      sessionId,
      messageId,
      emoji: parsed.data.emoji,
      actorRole: "candidate",
      actorName: parsed.data.actorName,
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Failed to update session message", error);
    return NextResponse.json({ error: "Unable to update message" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const limit = rateLimit(getClientKey(request, "chat-room-message-action"), 120, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const { sessionId, messageId } = await params;
    const token = getCandidateSessionTokenFromRequest(request);
    const session = await getAuthorizedCandidateSession(sessionId, token);
    if (!session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 403 });
    }

    const senderName = new URL(request.url).searchParams.get("senderName")?.trim();

    const existing = await getSessionMessageById(sessionId, messageId);
    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    if (existing.senderRole !== "candidate" || !senderName || existing.senderName !== senderName) {
      return NextResponse.json({ error: "Cannot delete this message" }, { status: 403 });
    }

    const message = await deleteSessionMessage(sessionId, messageId);
    return NextResponse.json({ message });
  } catch (error) {
    console.error("Failed to delete session message", error);
    return NextResponse.json({ error: "Unable to delete message" }, { status: 500 });
  }
}
