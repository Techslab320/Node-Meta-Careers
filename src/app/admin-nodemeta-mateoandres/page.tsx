import Link from "next/link";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { adminLoginPath, adminPath } from "@/config/admin";
import { connectDB } from "@/lib/database/mongodb";
import { getApplicationStats } from "@/lib/applications/queries";
import { auth } from "@/lib/auth/auth";
import { JobModel } from "@/models/Job";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Admin Dashboard | Node Meta Careers",
  noIndex: true,
});

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect(adminLoginPath);

  await connectDB();
  const [activeJobs, applicationStats] = await Promise.all([
    JobModel.countDocuments({ status: "published" }),
    getApplicationStats(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Dashboard</h1>
      <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-400">Active jobs</p>
          <p className="mt-2 text-3xl font-bold text-white">{activeJobs}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">Total applications</p>
          <p className="mt-2 text-3xl font-bold text-white">{applicationStats.total}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">New applications</p>
          <p className="mt-2 text-3xl font-bold text-white">{applicationStats.newCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-400">In interview</p>
          <p className="mt-2 text-3xl font-bold text-white">
            {applicationStats.byStatus.interview || 0}
          </p>
        </Card>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-white">Quick actions</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={adminPath("jobs/new")} className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-slate-950">
              Create job
            </Link>
            <Link href={adminPath("applications")} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200">
              Review applications
            </Link>
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-white">Applications by status</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            {Object.entries(applicationStats.byStatus).map(([status, count]) => (
              <li key={status} className="flex justify-between">
                <span className="capitalize">{status}</span>
                <span>{count}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
