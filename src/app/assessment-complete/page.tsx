import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Assessment Submitted | Node Meta Careers",
  description: "Your Node Meta role assessment has been submitted.",
  path: "/assessment-complete",
  noIndex: true,
});

interface AssessmentCompletePageProps {
  searchParams: Promise<{ job?: string }>;
}

export default async function AssessmentCompletePage({
  searchParams,
}: AssessmentCompletePageProps) {
  const params = await searchParams;
  const jobTitle = params.job || "the selected position";

  return (
    <Card className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-dark/15 text-brand-light">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white">Assessment submitted</h1>
        <p className="mt-4 text-slate-300">
          Thank you for completing the assessment for <strong>{jobTitle}</strong>. Our
          recruitment team will review your application and responses.
        </p>
        <p className="mt-4 text-sm text-slate-400">
          {siteConfig.companyName} will never ask for cryptocurrency payments, wallet
          seed phrases, passwords, or private keys.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/jobs"
            className="rounded-lg bg-gradient-to-r from-brand-light to-brand-dark px-5 py-2.5 text-sm font-semibold text-slate-950"
          >
            View open positions
          </Link>
          <a
            href={siteConfig.mainWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm text-slate-200"
          >
            Visit node-meta.com
          </a>
        </div>
      </Card>
  );
}
