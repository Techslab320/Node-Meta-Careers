"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageSquare, Settings } from "lucide-react";
import { Badge } from "@/components/ui/card";
import { adminPath } from "@/config/admin";
import type { ChatRoomSessionDocument } from "@/config/chat-room-session";

interface AdminChatRoomListProps {
  initialSessions: ChatRoomSessionDocument[];
}

export function AdminChatRoomList({ initialSessions }: AdminChatRoomListProps) {
  const [sessions, setSessions] = useState(
    initialSessions.filter((session) => session.status === "waiting"),
  );

  useEffect(() => {
    setSessions(initialSessions.filter((session) => session.status === "waiting"));
  }, [initialSessions]);

  useEffect(() => {
    async function refreshSessions() {
      try {
        const response = await fetch("/api/admin/chat-room/sessions");
        if (!response.ok) return;
        const data = (await response.json()) as { sessions?: ChatRoomSessionDocument[] };
        setSessions(
          (data.sessions || []).filter((session) => session.status === "waiting"),
        );
      } catch {
        // Keep the last known list when polling fails.
      }
    }

    void refreshSessions();
    const intervalId = window.setInterval(refreshSessions, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-end gap-3">
        <Link
          href={adminPath("chat-room/settings")}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
        >
          <Settings className="h-4 w-4" aria-hidden />
          Chat room settings
        </Link>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 text-left text-slate-400">Candidate</th>
              <th className="px-4 py-3 text-left text-slate-400">Job</th>
              <th className="px-4 py-3 text-left text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-slate-400">Joined</th>
              <th className="px-4 py-3 text-right text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sessions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No candidates waiting for interview right now.
                </td>
              </tr>
            ) : (
              sessions.map((session) => (
                <tr key={session._id} className="transition-colors hover:bg-slate-900/60">
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">{session.fullName}</p>
                    <p className="text-slate-400">{session.email}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{session.jobTitle}</td>
                  <td className="px-4 py-4">
                    <Badge className="text-amber-300">
                      <span className="inline-flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400"
                          aria-hidden
                        />
                        Waiting interview
                      </span>
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-400">
                    {new Date(session.joinedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={adminPath(`chat-room/session/${session._id}`)}
                      className="inline-flex items-center gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm text-slate-200 hover:bg-amber-500/15"
                    >
                      <MessageSquare className="h-4 w-4" aria-hidden />
                      Open chat
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
