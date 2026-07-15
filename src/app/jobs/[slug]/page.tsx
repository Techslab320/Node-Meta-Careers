import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { JobPostingJsonLd } from "@/components/jobs/job-json-ld";
import { JobDetailTopBar } from "@/components/jobs/job-detail-top-bar";
import { Badge, Card } from "@/components/ui/card";
import { hiringStages, siteConfig } from "@/config/site";
import { JobDescriptionPdf } from "@/components/jobs/job-description-pdf";
import { getJobDescriptionPdfUrl } from "@/lib/jobs/jd-pdf";
import { getPublishedJobBySlug } from "@/lib/jobs/queries";
import {
  formatCompensationBand,
  formatLabel,
  POSITION_EMPLOYMENT_TYPES,
  POSITION_EXPERIENCE_LEVELS,
} from "@/lib/jobs/utils";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

interface JobDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug).catch(() => null);
  if (!job) {
    return createPageMetadata({
      title: "Job Not Found | Node Meta Careers",
      path: `/jobs/${slug}`,
      noIndex: true,
    });
  }

  return createPageMetadata({
    title: `${job.title} | Node Meta Careers`,
    description: job.summary,
    path: `/jobs/${slug}`,
  });
}

function SectionList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <ul className="mt-4 space-y-2 text-slate-300">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-light" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function formatPublishedDate(value: string): string {
  return new Date(value).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { slug } = await params;
  const job = await getPublishedJobBySlug(slug).catch(() => null);
  if (!job) notFound();

  const jobUrl = `${siteConfig.siteUrl}/jobs/${job.slug}`;
  const jobDescriptionPdfUrl = getJobDescriptionPdfUrl(job.slug);

  return (
    <>
      <JobPostingJsonLd job={job} />
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-sm text-brand-light hover:text-brand-light">
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to all positions
        </Link>

        <div className="mt-8 flex flex-wrap gap-2">
          <Badge>{job.department}</Badge>
          <Badge>{formatLabel(job.remoteType)}</Badge>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {POSITION_EMPLOYMENT_TYPES.map((type) => (
            <Badge key={type} className="border-brand-light/20 bg-brand-light/10 text-brand-light/90">
              {formatLabel(type)}
            </Badge>
          ))}
          {POSITION_EXPERIENCE_LEVELS.map((level) => (
            <Badge key={level} className="border-brand-dark/20 bg-brand-dark/10 text-brand-light">
              {formatLabel(level)}
            </Badge>
          ))}
        </div>

        <JobDetailTopBar
          title={job.title}
          location={job.location}
          applyHref={`/jobs/${job.slug}/apply`}
          shareUrl={jobUrl}
        />

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4 sm:col-span-2 lg:col-span-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Compensation by arrangement</p>
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full text-left text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="py-2 pr-4 font-medium">Employment type</th>
                    <th className="py-2 pr-4 font-medium">Experience level</th>
                    <th className="py-2 font-medium">Salary</th>
                  </tr>
                </thead>
                <tbody>
                  {job.compensationBands.map((band) => (
                    <tr key={`${band.employmentType}-${band.experienceLevel}`} className="border-b border-slate-900/80">
                      <td className="py-2 pr-4 text-white">{formatLabel(band.employmentType)}</td>
                      <td className="py-2 pr-4">{formatLabel(band.experienceLevel)}</td>
                      <td className="py-2 text-brand-light">{formatCompensationBand(band)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <Card className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">Published</p>
            <p className="mt-1 text-sm text-white">
              {formatPublishedDate(job.publishedAt ?? job.createdAt)}
            </p>
          </Card>
        </div>

        <div className="mt-12 space-y-10">
          {jobDescriptionPdfUrl ? (
            <JobDescriptionPdf title={job.title} pdfUrl={jobDescriptionPdfUrl} />
          ) : (
            <>
              <section>
                <h2 className="text-xl font-semibold text-white">Overview</h2>
                <p className="mt-4 leading-7 text-slate-300">{job.overview}</p>
              </section>
              <SectionList title="Responsibilities" items={job.responsibilities} />
              <SectionList title="Required qualifications" items={job.requiredQualifications} />
              <SectionList title="Preferred qualifications" items={job.preferredQualifications} />
              <SectionList title="Technology stack" items={job.technologies} />
              <SectionList title="Benefits" items={job.benefits} />

              <section>
                <h2 className="text-xl font-semibold text-white">Hiring process</h2>
                <ol className="mt-4 space-y-3 text-slate-300">
                  {hiringStages.map((stage) => (
                    <li key={stage.step}>
                      {stage.step}. {stage.title}
                    </li>
                  ))}
                </ol>
                <p className="mt-4 text-sm text-slate-400">
                  The exact process may differ depending on the role and team.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-white">Equal opportunity</h2>
                <p className="mt-4 leading-7 text-slate-300">
                  Node Meta is committed to providing equal employment opportunities and
                  evaluating candidates based on qualifications, skills, and experience
                  relevant to the role.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </>
  );
}
