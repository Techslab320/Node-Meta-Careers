import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChatRoomSettingsForm } from "@/components/admin/chat-room-settings-form";
import { Card } from "@/components/ui/card";
import { adminLoginPath, adminPath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";
import { getAdminChatRoomSessionById } from "@/lib/chat-room/sessions";
import {
  getChatRoomSettings,
  getPublicChatRoomSettings,
} from "@/lib/chat-room/settings";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

interface AdminChatRoomSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: AdminChatRoomSessionPageProps) {
  const { sessionId } = await params;
  return createPageMetadata({
    title: `Chat Room ${sessionId} | Node Meta Admin`,
    noIndex: true,
  });
}

export default async function AdminChatRoomSessionPage({
  params,
}: AdminChatRoomSessionPageProps) {
  const authSession = await auth();
  if (!authSession?.user) redirect(adminLoginPath);

  const { sessionId } = await params;
  const chatSession = await getAdminChatRoomSessionById(sessionId);
  if (!chatSession) notFound();

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
      <h1 className="mt-6 text-3xl font-bold text-white">Candidate Chat Room</h1>
      <p className="mt-2 text-slate-400">
        {chatSession.fullName} · {chatSession.jobTitle}
      </p>

      <Card className="mt-8">
        <ChatRoomSettingsForm initialSettings={settings} chatSession={chatSession} />
      </Card>
    </div>
  );
}
