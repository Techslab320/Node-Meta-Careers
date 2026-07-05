import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth/auth";
import { addSessionMessage, getSessionMessages } from "@/lib/chat-room/messages";
import { getAdminChatRoomSessionById } from "@/lib/chat-room/sessions";

interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

const postMessageSchema = z.object({
  senderName: z.string().min(1).max(120),
  content: z.string().min(1).max(2000),
  replyToMessageId: z.string().optional(),
});

export async function GET(_request: Request, { params }: RouteParams) {
  const authSession = await auth();
  if (!authSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;
    const session = await getAdminChatRoomSessionById(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const messages = await getSessionMessages(sessionId);
    return NextResponse.json({ messages, session });
  } catch (error) {
    console.error("Failed to load admin session messages", error);
    return NextResponse.json({ error: "Unable to load messages" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const authSession = await auth();
  if (!authSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;
    const session = await getAdminChatRoomSessionById(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status !== "in_progress") {
      return NextResponse.json({ error: "Join the session first" }, { status: 403 });
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
      senderRole: "hr",
      senderName: parsed.data.senderName,
      content: parsed.data.content,
      replyToMessageId: parsed.data.replyToMessageId,
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Failed to send admin session message", error);
    return NextResponse.json({ error: "Unable to send message" }, { status: 500 });
  }
}
