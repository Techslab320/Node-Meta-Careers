import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { AdminChatRoomPanel } from "@/components/admin/admin-chat-room-panel";
import { adminLoginPath, adminPath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";
import { getAdminChatRoomSessionById } from "@/lib/chat-room/sessions";
import {
  getChatRoomSettings,
  getPublicChatRoomSettings,
} from "@/lib/chat-room/settings";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

interface AdminChatRoomLivePageProps {
  params: Promise<{ sessionId: string }>;
}

export async function generateMetadata({ params }: AdminChatRoomLivePageProps) {
  const { sessionId } = await params;
  return createPageMetadata({
    title: `Live Chat Room ${sessionId} | Node Meta Admin`,
    noIndex: true,
  });
}

export default async function AdminChatRoomLivePage({
  params,
}: AdminChatRoomLivePageProps) {
  const authSession = await auth();
  if (!authSession?.user) redirect(adminLoginPath);

  const { sessionId } = await params;
  const chatSession = await getAdminChatRoomSessionById(sessionId);
  if (!chatSession) notFound();

  const settings = getPublicChatRoomSettings(await getChatRoomSettings());

  return (
    <div className="-mx-4 -mt-8 flex min-h-[calc(100dvh-5.5rem)] flex-col sm:-mx-6 lg:-mx-8">
      <AdminChatRoomPanel
        chatSession={chatSession}
        settings={settings}
        candidateName={chatSession.fullName}
        jobTitle={chatSession.jobTitle}
        initialRecruiterJoined={chatSession.joinedHrInterviewerIndexes.includes(0)}
        fullScreen
        headerActions={
          <Link
            href={adminPath(`chat-room/session/${sessionId}`)}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-900"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Back to settings
          </Link>
        }
      />
    </div>
  );
}
