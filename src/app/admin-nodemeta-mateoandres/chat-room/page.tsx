import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminChatRoomList } from "@/components/admin/admin-chat-room-list";
import { Card } from "@/components/ui/card";
import { adminLoginPath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";
import { getWaitingChatRoomSessions } from "@/lib/chat-room/sessions";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Candidate Chat Rooms | Node Meta Admin",
  noIndex: true,
});

export default async function AdminChatRoomListPage() {
  const session = await auth();
  if (!session?.user) redirect(adminLoginPath);

  const chatRoomSessions = await getWaitingChatRoomSessions();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Candidate Chat Rooms</h1>
      <p className="mt-2 text-slate-400">
        Candidates waiting for an HR interviewer to join the interview chat room.
      </p>
      <Card className="mt-8">
        <Suspense fallback={<p className="text-slate-400">Loading chat rooms...</p>}>
          <AdminChatRoomList initialSessions={chatRoomSessions} />
        </Suspense>
      </Card>
    </div>
  );
}
