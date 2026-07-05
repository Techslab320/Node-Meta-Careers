import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { JobForm } from "@/components/admin/job-form";
import { adminLoginPath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Create Job | Node Meta Admin",
  noIndex: true,
});

export default async function NewJobPage() {
  const session = await auth();
  if (!session?.user) redirect(adminLoginPath);

  return (
    <div>
      <h1 className="text-3xl font-bold text-white">Create job</h1>
      <Card className="mt-8">
        <JobForm />
      </Card>
    </div>
  );
}
