"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/card";
import { adminPath } from "@/config/admin";
import { applicationStatuses } from "@/config/site";
import { formatLabel } from "@/lib/jobs/utils";
import type { ApplicationDocument } from "@/types";

interface AdminApplicationsTableProps {
  applications: ApplicationDocument[];
  jobs: Array<{ _id: string; title: string }>;
  chatRoomByApplicationId: Record<string, string>;
}

export function AdminApplicationsTable({
  applications,
  jobs,
  chatRoomByApplicationId: initialChatRoomByApplicationId,
}: AdminApplicationsTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [rows, setRows] = useState(applications);
  const [chatRoomByApplicationId, setChatRoomByApplicationId] = useState(
    initialChatRoomByApplicationId,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRows(applications);
  }, [applications]);

  useEffect(() => {
    setChatRoomByApplicationId(initialChatRoomByApplicationId);
  }, [initialChatRoomByApplicationId]);

  useEffect(() => {
    async function refreshJoinableChatRooms() {
      try {
        const response = await fetch("/api/admin/chat-room/joinable");
        if (!response.ok) return;
        const data = (await response.json()) as {
          chatRoomByApplicationId?: Record<string, string>;
        };
        setChatRoomByApplicationId(data.chatRoomByApplicationId ?? {});
      } catch {
        // Keep the last known state when polling fails.
      }
    }

    void refreshJoinableChatRooms();
    const intervalId = window.setInterval(refreshJoinableChatRooms, 5000);
    return () => window.clearInterval(intervalId);
  }, []);

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`${adminPath("applications")}?${params.toString()}`);
  }

  const exportUrl = `/api/admin/applications/export?${searchParams.toString()}`;

  function openApplication(id: string) {
    router.push(adminPath(`applications/${id}`));
  }

  async function handleDelete(
    event: React.MouseEvent,
    application: ApplicationDocument,
  ) {
    event.stopPropagation();

    const candidateName = `${application.firstName} ${application.lastName}`;
    const confirmed = window.confirm(
      `Delete the application for ${candidateName}? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(application._id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/applications/${application._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Unable to delete application.");
      }

      setRows((current) => current.filter((row) => row._id !== application._id));
      router.refresh();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : "Unable to delete application.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Input
          label="Search candidates"
          name="search"
          defaultValue={searchParams.get("search") || ""}
          onChange={(event) => updateParam("search", event.target.value)}
        />
        <Select
          label="Job"
          name="jobId"
          value={searchParams.get("jobId") || ""}
          onChange={(event) => updateParam("jobId", event.target.value)}
          options={[
            { value: "", label: "All jobs" },
            ...jobs.map((job) => ({ value: job._id, label: job.title })),
          ]}
        />
        <Select
          label="Status"
          name="status"
          value={searchParams.get("status") || ""}
          onChange={(event) => updateParam("status", event.target.value)}
          options={[
            { value: "", label: "All statuses" },
            ...applicationStatuses.map((value) => ({
              value,
              label: formatLabel(value),
            })),
          ]}
        />
        <Input
          label="Country"
          name="country"
          defaultValue={searchParams.get("country") || ""}
          onChange={(event) => updateParam("country", event.target.value)}
        />
      </div>

      <div className="flex items-center justify-end">
        <a
          href={exportUrl}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
        >
          Export CSV
        </a>
      </div>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-800">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-4 py-3 text-left text-slate-400">Candidate</th>
              <th className="px-4 py-3 text-left text-slate-400">Job</th>
              <th className="px-4 py-3 text-left text-slate-400">Country</th>
              <th className="px-4 py-3 text-left text-slate-400">Status</th>
              <th className="px-4 py-3 text-left text-slate-400">Applied</th>
              <th className="px-4 py-3 text-right text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                  No applications found.
                </td>
              </tr>
            ) : (
              rows.map((application) => (
                <tr
                  key={application._id}
                  onClick={() => openApplication(application._id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openApplication(application._id);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`View application from ${application.firstName} ${application.lastName}`}
                  className="cursor-pointer transition-colors hover:bg-slate-900/60 focus:bg-slate-900/60 focus:outline-none"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-white">
                      {application.firstName} {application.lastName}
                    </p>
                    <p className="text-slate-400">{application.email}</p>
                  </td>
                  <td className="px-4 py-4 text-slate-300">{application.jobTitle}</td>
                  <td className="px-4 py-4 text-slate-300">{application.country}</td>
                  <td className="px-4 py-4">
                    <Badge>{formatLabel(application.status)}</Badge>
                  </td>
                  <td className="px-4 py-4 text-slate-400">
                    {new Date(application.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {chatRoomByApplicationId[application._id] ? (
                        <Link
                          href={adminPath(`chat-room/session/${chatRoomByApplicationId[application._id]}`)}
                          onClick={(event) => event.stopPropagation()}
                          className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-slate-900/60 px-3 py-1.5 text-sm text-cyan-100 hover:border-cyan-400/50 hover:bg-slate-900"
                        >
                          <MessageSquare className="h-4 w-4" aria-hidden />
                          Chat Room
                        </Link>
                      ) : (
                        <span
                          className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg border border-slate-700/80 bg-slate-900/40 px-3 py-1.5 text-sm text-slate-500"
                          aria-disabled="true"
                          title="Candidate has not joined the chat room yet"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <MessageSquare className="h-4 w-4" aria-hidden />
                          Chat Room
                        </span>
                      )}
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        disabled={deletingId === application._id}
                        onClick={(event) => handleDelete(event, application)}
                      >
                        <Trash2 className="h-4 w-4" aria-hidden />
                        {deletingId === application._id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
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
