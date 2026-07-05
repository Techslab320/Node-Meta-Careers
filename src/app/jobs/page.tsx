import { Suspense } from "react";
import { JobCard } from "@/components/jobs/job-card";
import { JobFilters } from "@/components/jobs/job-filters";
import { Alert, Card } from "@/components/ui/card";
import { jobsPageIntro } from "@/data/positions";
import { getJobFilterOptions, getPublishedJobs } from "@/lib/jobs/queries";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "NodeMeta — Job Descriptions",
  description:
    "Open roles for NodeMeta's NFT Marketplace and SmartCommerce initiatives on BNB Smart Chain.",
  path: "/jobs",
});

interface JobsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
  const params = await searchParams;
  const filters = {
    search: typeof params.search === "string" ? params.search : undefined,
    department: typeof params.department === "string" ? params.department : undefined,
    employmentType:
      typeof params.employmentType === "string" ? params.employmentType : undefined,
    experienceLevel:
      typeof params.experienceLevel === "string" ? params.experienceLevel : undefined,
    location: typeof params.location === "string" ? params.location : undefined,
    remoteType: typeof params.remoteType === "string" ? params.remoteType : undefined,
  };

  const [jobs, options] = await Promise.all([
    getPublishedJobs(filters),
    getJobFilterOptions(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold text-white">{jobsPageIntro.title}</h1>
        <p className="mt-4 text-lg text-slate-300">{jobsPageIntro.subtitle}</p>
        <p className="mt-4 text-slate-400">
          Explore the open roles below. Select a position to read the full job
          description and submit an application.
        </p>
      </div>

      <div className="mt-10">
        <Suspense fallback={<div className="h-40 animate-pulse rounded-2xl bg-slate-900/50" />}>
          <JobFilters options={options} />
        </Suspense>
      </div>

      {jobs.length > 0 ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {jobs.map((job) => (
            <JobCard
              key={job._id}
              job={job}
              employmentType={filters.employmentType}
              experienceLevel={filters.experienceLevel}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-10">
          <h2 className="text-xl font-semibold text-white">No matching positions</h2>
          <p className="mt-3 text-slate-400">
            Try adjusting your filters or check back later for newly published roles.
          </p>
        </Card>
      )}

      <div className="mt-12">
        <Alert variant="info">
        <p className="text-sm font-semibold text-cyan-100">Sourcing note</p>
        <p className="mt-2 text-sm leading-6 text-cyan-50/90">
          {jobsPageIntro.sourcingNote}
        </p>
      </Alert>
      </div>
    </div>
  );
}
