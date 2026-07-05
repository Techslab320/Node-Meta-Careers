import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getAdminChatRoomSessionById, toggleHrBotForInterviewer } from "@/lib/chat-room/sessions";
import { getChatRoomSettings } from "@/lib/chat-room/settings";

interface RouteParams {
  params: Promise<{ sessionId: string; index: string }>;
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  const authSession = await auth();
  if (!authSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId, index } = await params;
    const interviewerIndex = Number.parseInt(index, 10);

    if (!Number.isInteger(interviewerIndex) || interviewerIndex < 0) {
      return NextResponse.json({ error: "Invalid interviewer index" }, { status: 400 });
    }

    const settings = await getChatRoomSettings();
    if (interviewerIndex >= settings.hrInterviewerCount) {
      return NextResponse.json({ error: "Interviewer slot is not configured" }, { status: 400 });
    }

    const existing = await getAdminChatRoomSessionById(sessionId);
    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = await toggleHrBotForInterviewer(sessionId, interviewerIndex);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (error) {
    console.error("Failed to toggle HR bot for interviewer", error);
    return NextResponse.json({ error: "Unable to update HR bot setting" }, { status: 500 });
  }
}
