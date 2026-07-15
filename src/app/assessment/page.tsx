import { redirect } from "next/navigation";
import { AssessmentExamClient } from "@/components/assessment/assessment-exam-client";
import { isAssessmentRole } from "@/data/assessments";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Role Assessment | Node Meta Careers",
  description: "Complete your Node Meta role assessment.",
  path: "/assessment",
  noIndex: true,
});

interface AssessmentPageProps {
  searchParams: Promise<{ applicationId?: string; slug?: string }>;
}

export default async function AssessmentPage({ searchParams }: AssessmentPageProps) {
  const params = await searchParams;
  const applicationId = params.applicationId?.trim();
  const slug = params.slug?.trim();

  if (!applicationId || !slug || !isAssessmentRole(slug)) {
    redirect("/jobs");
  }

  return (
    <div
      className={`mx-auto w-full px-4 pb-10 sm:px-6 lg:px-8 ${
        slug === "finance-manager" ? "max-w-7xl" : "max-w-4xl"
      }`}
    >
      <AssessmentExamClient applicationId={applicationId} jobSlug={slug} />
    </div>
  );
}
