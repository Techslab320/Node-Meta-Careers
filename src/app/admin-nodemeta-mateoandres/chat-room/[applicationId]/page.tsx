import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ChatRoomSettingsForm } from "@/components/admin/chat-room-settings-form";
import { Card } from "@/components/ui/card";
import { adminLoginPath, adminPath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";
import { getApplicationById } from "@/lib/applications/queries";
import { getAdminChatRoomSessionByApplicationId } from "@/lib/chat-room/sessions";
import {
  getChatRoomSettings,
  getPublicChatRoomSettings,
} from "@/lib/chat-room/settings";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

interface AdminChatRoomDetailPageProps {
  params: Promise<{ applicationId: string }>;
}

export async function generateMetadata({ params }: AdminChatRoomDetailPageProps) {
  const { applicationId } = await params;
  return createPageMetadata({
    title: `Chat Room ${applicationId} | Node Meta Admin`,
    noIndex: true,
  });
}

export default async function AdminChatRoomDetailPage({
  params,
}: AdminChatRoomDetailPageProps) {
  const session = await auth();
  if (!session?.user) redirect(adminLoginPath);

  const { applicationId } = await params;
  const application = await getApplicationById(applicationId);
  if (!application) notFound();

  const chatSession = await getAdminChatRoomSessionByApplicationId(applicationId);
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
        {application.firstName} {application.lastName} · {chatSession.jobTitle}
      </p>

      <Card className="mt-8">
        <ChatRoomSettingsForm initialSettings={settings} chatSession={chatSession} />
      </Card>
    </div>
  );
}
