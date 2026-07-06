import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  getChatRoomSettings,
  getPublicChatRoomSettings,
  updateChatRoomSettings,
} from "@/lib/chat-room/settings";
import { chatRoomSettingsSchema } from "@/lib/validation/chat-room";


export const runtime = "nodejs";
export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getChatRoomSettings();
    return NextResponse.json({ settings: getPublicChatRoomSettings(settings) });
  } catch (error) {
    console.error("Failed to load chat room settings", error);
    return NextResponse.json(
      { error: "Unable to load chat room settings" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = chatRoomSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid chat room settings" },
        { status: 400 },
      );
    }

    const settings = await updateChatRoomSettings(parsed.data);
    return NextResponse.json({ settings: getPublicChatRoomSettings(settings) });
  } catch (error) {
    console.error("Failed to update chat room settings", error);
    return NextResponse.json(
      { error: "Unable to update chat room settings" },
      { status: 500 },
    );
  }
}
