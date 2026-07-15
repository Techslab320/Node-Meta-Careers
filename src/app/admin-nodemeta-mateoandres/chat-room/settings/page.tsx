import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChatRoomSettingsForm } from "@/components/admin/chat-room-settings-form";
import { Card } from "@/components/ui/card";
import { adminLoginPath, adminPath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";
import {
  getChatRoomSettings,
  getPublicChatRoomSettings,
} from "@/lib/chat-room/settings";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Chat Room Settings | Node Meta Admin",
  noIndex: true,
});

export default async function AdminChatRoomSettingsPage() {
  const session = await auth();
  if (!session?.user) redirect(adminLoginPath);

  const settings = getPublicChatRoomSettings(await getChatRoomSettings());

  return (
    <div>
      <Link
        href={adminPath("chat-room")}
        className="inline-flex items-center gap-2 text-sm text-brand-light hover:text-brand-light"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to chat rooms
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-white">Chat Room Settings</h1>
      <p className="mt-2 text-slate-400">
        Configure HR interviewers, HR bot, and AI model settings.
      </p>
      <Card className="mt-8">
        <ChatRoomSettingsForm initialSettings={settings} />
      </Card>
    </div>
  );
}
