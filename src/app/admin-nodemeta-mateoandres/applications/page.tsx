import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AdminApplicationsTable } from "@/components/admin/admin-applications-table";
import { Card } from "@/components/ui/card";
import { adminLoginPath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";
import { getApplications } from "@/lib/applications/queries";
import { getJoinableChatRoomApplicationMap } from "@/lib/chat-room/sessions";
import { connectDB } from "@/lib/database/mongodb";
import { JobModel } from "@/models/Job";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Applications | Node Meta Admin",
  noIndex: true,
});

interface AdminApplicationsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function AdminApplicationsPage({
  searchParams,
}: AdminApplicationsPageProps) {
  const session = await auth();
  if (!session?.user) redirect(adminLoginPath);

  const params = await searchParams;
  const filters = {
    search: typeof params.search === "string" ? params.search : undefined,
    jobId: typeof params.jobId === "string" ? params.jobId : undefined,
    status: typeof params.status === "string" ? params.status : undefined,
    country: typeof params.country === "string" ? params.country : undefined,
    dateFrom: typeof params.dateFrom === "string" ? params.dateFrom : undefined,
    dateTo: typeof params.dateTo === "string" ? params.dateTo : undefined,
  };

  await connectDB();
  const [applications, jobs, chatRoomByApplicationId] = await Promise.all([
    getApplications(filters),
    JobModel.find().select("_id title").sort({ title: 1 }),
    getJoinableChatRoomApplicationMap(),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Applications</h1>
      <p className="mt-2 text-slate-400">
        Review candidate submissions, update status, and export data.
      </p>
      <Card className="mt-8">
        <Suspense fallback={<p className="text-slate-400">Loading applications...</p>}>
          <AdminApplicationsTable
            applications={applications}
            jobs={jobs.map((job) => ({
              _id: job._id.toString(),
              title: job.title,
            }))}
            chatRoomByApplicationId={chatRoomByApplicationId}
          />
        </Suspense>
      </Card>
    </div>
  );
}
