import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import {
  deleteSessionMessage,
  editSessionMessage,
  getSessionMessageById,
  toggleSessionMessageReaction,
} from "@/lib/chat-room/messages";
import { getChatRoomSessionById } from "@/lib/chat-room/sessions";

interface RouteParams {
  params: Promise<{ sessionId: string; messageId: string }>;
}

const patchSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("edit"),
    content: z.string().min(1).max(2000),
  }),
  z.object({
    action: z.literal("react"),
    emoji: z.string().min(1).max(16),
    actorName: z.string().min(1).max(120),
  }),
]);

export async function PATCH(request: Request, { params }: RouteParams) {
  const authSession = await auth();
  if (!authSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, messageId } = await params;
    const session = await getChatRoomSessionById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
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
      if (existing.senderRole !== "hr") {
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
      actorRole: "hr",
      actorName: parsed.data.actorName,
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Failed to update admin session message", error);
    return NextResponse.json({ error: "Unable to update message" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const authSession = await auth();
  if (!authSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, messageId } = await params;
    const existing = await getSessionMessageById(sessionId, messageId);
    if (!existing) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const message = await deleteSessionMessage(sessionId, messageId);
    return NextResponse.json({ message });
  } catch (error) {
    console.error("Failed to delete admin session message", error);
    return NextResponse.json({ error: "Unable to delete message" }, { status: 500 });
  }
}
