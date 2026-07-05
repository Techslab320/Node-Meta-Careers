import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getJoinableChatRoomApplicationMap } from "@/lib/chat-room/sessions";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const chatRoomByApplicationId = await getJoinableChatRoomApplicationMap();
    return NextResponse.json({ chatRoomByApplicationId });
  } catch (error) {
    console.error("Failed to load joinable chat room sessions", error);
    return NextResponse.json(
      { error: "Unable to load joinable chat room sessions" },
      { status: 500 },
    );
  }
}
