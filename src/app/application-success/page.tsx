import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Application Received | Node Meta Careers",
  description: "Your application has been received by the Node Meta recruitment team.",
  path: "/application-success",
  noIndex: true,
});

interface SuccessPageProps {
  searchParams: Promise<{ job?: string; applicationId?: string }>;
}

export default async function ApplicationSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const params = await searchParams;
  const jobTitle = params.job || "the selected position";
  const interviewRoomParams = new URLSearchParams({ job: jobTitle });
  if (params.applicationId) {
    interviewRoomParams.set("applicationId", params.applicationId);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <Card className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-dark/15 text-brand-light">
          <CheckCircle2 className="h-7 w-7" aria-hidden />
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white">Application received</h1>
        <p className="mt-4 text-slate-300">
          Thank you for applying for <strong>{jobTitle}</strong>. Our recruitment team
          will review your application.
        </p>
        <p className="mt-4 text-slate-300">
          Please wait a moment. A recruiter will review your application and conduct a
          brief interview with you in about five minutes.
        </p>
        <p className="mt-4 text-sm text-slate-400">
          {siteConfig.companyName} will never ask for cryptocurrency payments, wallet
          seed phrases, passwords, or private keys.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href={`/interview-room?${interviewRoomParams.toString()}`}
            className="rounded-lg bg-gradient-to-r from-brand-light to-brand-dark px-5 py-2.5 text-sm font-semibold text-slate-950"
          >
            Interview room
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
    </div>
  );
}
