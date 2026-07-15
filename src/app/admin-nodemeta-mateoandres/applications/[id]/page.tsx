import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ApplicationDetailPanel } from "@/components/admin/application-detail-panel";
import { Card } from "@/components/ui/card";
import { adminLoginPath, adminPath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";
import { getApplicationById } from "@/lib/applications/queries";
import { getAssessmentByApplicationId } from "@/lib/assessments/queries";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

interface ApplicationDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ApplicationDetailPageProps) {
  const { id } = await params;
  return createPageMetadata({
    title: `Application ${id} | Node Meta Admin`,
    noIndex: true,
  });
}

export default async function AdminApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const session = await auth();
  if (!session?.user) redirect(adminLoginPath);

  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) notFound();
  const assessment = await getAssessmentByApplicationId(id).catch(() => null);

  return (
    <div>
      <Link
        href={adminPath("applications")}
        className="inline-flex items-center gap-2 text-sm text-brand-light hover:text-brand-light"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to applications
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-white">
        {application.firstName} {application.lastName}
      </h1>
      <p className="mt-2 text-slate-400">
        Application for {application.jobTitle}
      </p>
      <Card className="mt-8">
        <ApplicationDetailPanel application={application} assessment={assessment} />
      </Card>
    </div>
  );
}
