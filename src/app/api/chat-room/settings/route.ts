import { NextResponse } from "next/server";
import {
  getChatRoomSettings,
  getPublicChatRoomSettings,
} from "@/lib/chat-room/settings";

export async function GET() {
  try {
    const settings = await getChatRoomSettings();
    return NextResponse.json({ settings: getPublicChatRoomSettings(settings) });
  } catch (error) {
    console.error("Failed to load public chat room settings", error);
    return NextResponse.json(
      { error: "Unable to load chat room settings" },
      { status: 500 },
    );
  }
}
