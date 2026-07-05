import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getWaitingChatRoomSessions } from "@/lib/chat-room/sessions";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sessions = await getWaitingChatRoomSessions();
    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Failed to load chat room sessions", error);
    return NextResponse.json(
      { error: "Unable to load chat room sessions" },
      { status: 500 },
    );
  }
}
