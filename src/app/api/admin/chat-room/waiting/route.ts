import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getWaitingApplicationIds } from "@/lib/chat-room/sessions";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applicationIds = await getWaitingApplicationIds();
    return NextResponse.json({ applicationIds });
  } catch (error) {
    console.error("Failed to load waiting chat room sessions", error);
    return NextResponse.json(
      { error: "Unable to load waiting chat room sessions" },
      { status: 500 },
    );
  }
}
