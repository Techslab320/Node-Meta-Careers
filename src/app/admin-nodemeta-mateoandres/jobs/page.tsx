import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { AdminJobsTable } from "@/components/admin/admin-jobs-table";
import { adminLoginPath, adminPath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/database/mongodb";
import { serializeJob } from "@/lib/jobs/utils";
import { JobModel } from "@/models/Job";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Manage Jobs | Node Meta Admin",
  noIndex: true,
});

export default async function AdminJobsPage() {
  const session = await auth();
  if (!session?.user) redirect(adminLoginPath);

  await connectDB();
  const jobs = (await JobModel.find().sort({ updatedAt: -1 })).map(serializeJob);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-white">Jobs</h1>
        <Link
          href={adminPath("jobs/new")}
          className="rounded-lg bg-brand-light px-4 py-2 text-sm font-medium text-slate-950"
        >
          Create job
        </Link>
      </div>
      <Card className="mt-8">
        <Suspense fallback={<p>Loading jobs...</p>}>
          <AdminJobsTable jobs={jobs} />
        </Suspense>
      </Card>
    </div>
  );
}
