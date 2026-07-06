import { NextResponse } from "next/server";
import { getCandidateSessionTokenFromRequest } from "@/lib/chat-room/candidate-session-auth";
import { ChatRoomJoinError } from "@/lib/chat-room/join-errors";
import { joinChatRoomSession } from "@/lib/chat-room/sessions";
import { joinChatRoomSessionSchema } from "@/lib/validation/chat-room-session";


export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = joinChatRoomSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid join request" },
        { status: 400 },
      );
    }

    const session = await joinChatRoomSession({
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      jobTitle: parsed.data.jobTitle,
      applicationId: parsed.data.applicationId,
    });

    return NextResponse.json({ session });
  } catch (error) {
    if (error instanceof ChatRoomJoinError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    console.error("Failed to join chat room session", error);
    return NextResponse.json({ error: "Unable to join chat room" }, { status: 500 });
  }
}
