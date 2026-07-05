import { Suspense } from "react";
import { InterviewRoomClient } from "@/components/interview/interview-room-client";
import { defaultChatRoomSettings } from "@/config/chat-room";
import type { ChatRoomSettingsInput } from "@/config/chat-room";
import {
  getChatRoomSettings,
  getPublicChatRoomSettings,
} from "@/lib/chat-room/settings";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Interview Chat Room | Node Meta Careers",
  description: "Join the Node Meta interview chat room to connect with a recruiter.",
  path: "/interview-room",
  noIndex: true,
});

export default async function InterviewRoomPage() {
  let settings: ChatRoomSettingsInput = { ...defaultChatRoomSettings };

  try {
    settings = getPublicChatRoomSettings(await getChatRoomSettings());
  } catch (error) {
    console.error("Failed to load chat room settings", error);
  }

  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center p-8 text-slate-400">
          Loading interview room...
        </div>
      }
    >
      <InterviewRoomClient settings={settings} />
    </Suspense>
  );
}
