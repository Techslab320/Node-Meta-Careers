import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { markSessionInProgress, getChatRoomSessionById } from "@/lib/chat-room/sessions";


export const runtime = "nodejs";
interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function PATCH(_request: Request, { params }: RouteParams) {
  const authSession = await auth();
  if (!authSession?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { sessionId } = await params;
    const existing = await getChatRoomSessionById(sessionId);

    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const session = await markSessionInProgress(sessionId);
    return NextResponse.json({ session });
  } catch (error) {
    console.error("Failed to join chat room session", error);
    return NextResponse.json({ error: "Unable to join session" }, { status: 500 });
  }
}
