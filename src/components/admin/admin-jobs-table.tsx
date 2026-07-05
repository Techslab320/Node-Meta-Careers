"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminPath } from "@/config/admin";
import { formatLabel } from "@/lib/jobs/utils";
import type { JobDocument } from "@/types";

export function AdminJobsTable({ jobs }: { jobs: JobDocument[] }) {
  const router = useRouter();

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/admin/jobs/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  async function deleteJob(id: string) {
    if (!confirm("Delete this draft job?")) return;
    const response = await fetch(`/api/admin/jobs/${id}`, { method: "DELETE" });
    if (response.ok) router.refresh();
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-800">
      <table className="min-w-full divide-y divide-slate-800 text-sm">
        <thead className="bg-slate-900/80">
          <tr>
            <th className="px-4 py-3 text-left text-slate-400">Title</th>
            <th className="px-4 py-3 text-left text-slate-400">Department</th>
            <th className="px-4 py-3 text-left text-slate-400">Status</th>
            <th className="px-4 py-3 text-left text-slate-400">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {jobs.map((job) => (
            <tr key={job._id}>
              <td className="px-4 py-4 text-white">
                {job.title}
                {job.featured ? (
                  <Badge className="ml-2">Featured</Badge>
                ) : null}
              </td>
              <td className="px-4 py-4 text-slate-300">{job.department}</td>
              <td className="px-4 py-4">
                <Badge>{formatLabel(job.status)}</Badge>
              </td>
              <td className="px-4 py-4">
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={adminPath(`jobs/${job._id}/edit`)}
                    className="text-cyan-300 hover:text-cyan-200"
                  >
                    Edit
                  </Link>
                  {job.status !== "published" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => updateStatus(job._id, "published")}
                    >
                      Publish
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => updateStatus(job._id, "closed")}
                    >
                      Close
                    </Button>
                  )}
                  {job.status === "draft" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      onClick={() => deleteJob(job._id)}
                    >
                      Delete
                    </Button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
