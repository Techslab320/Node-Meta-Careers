import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/applications/application-form";
import { Card } from "@/components/ui/card";
import { getEnv, isTurnstileEnabled } from "@/config/env";
import { getPublishedJobBySlug } from "@/lib/jobs/queries";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

interface ApplyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ApplyPageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug).catch(() => null);
  return createPageMetadata({
    title: job
      ? `Apply for ${job.title} | Node Meta Careers`
      : "Apply | Node Meta Careers",
    path: `/jobs/${slug}/apply`,
    noIndex: true,
  });
}

export default async function ApplyPage({ params }: ApplyPageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug).catch(() => null);
  if (!job) notFound();

  const env = getEnv();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link href={`/jobs/${job.slug}`} className="text-sm text-cyan-300 hover:text-cyan-200">
        ← Back to job details
      </Link>
      <h1 className="mt-6 text-3xl font-bold text-white">Apply for {job.title}</h1>
      <p className="mt-3 text-slate-400">
        Complete the form below to submit your application. Fields marked with * are required.
      </p>
      <Card className="mt-8">
        <ApplicationForm
          job={job}
          turnstileSiteKey={
            isTurnstileEnabled() ? env.TURNSTILE_SITE_KEY : undefined
          }
        />
      </Card>
    </div>
  );
}
