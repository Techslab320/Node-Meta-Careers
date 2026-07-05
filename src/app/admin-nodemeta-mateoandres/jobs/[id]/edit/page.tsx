import { notFound, redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { JobForm } from "@/components/admin/job-form";
import { adminLoginPath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/database/mongodb";
import { serializeJob } from "@/lib/jobs/utils";
import { JobModel } from "@/models/Job";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

interface EditJobPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata() {
  return createPageMetadata({
    title: "Edit Job | Node Meta Admin",
    noIndex: true,
  });
}

export default async function EditJobPage({ params }: EditJobPageProps) {
  const session = await auth();
  if (!session?.user) redirect(adminLoginPath);

  const { id } = await params;
  await connectDB();
  const job = await JobModel.findById(id);
  if (!job) notFound();

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Edit job</h1>
      <Card className="mt-8">
        <JobForm initialData={serializeJob(job)} />
      </Card>
    </div>
  );
}
