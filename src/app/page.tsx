import Link from "next/link";
import { Blocks, Globe, Network, ShieldAlert, Zap } from "lucide-react";
import { CareersHeroSection } from "@/components/home/careers-hero-section";
import { JobCard } from "@/components/jobs/job-card";
import { Alert, Card } from "@/components/ui/card";
import { hiringStages, siteConfig, whyJoinCards } from "@/config/site";
import { getLatestPublishedJobs } from "@/lib/jobs/queries";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "NodeMeta - Decentralized Mining Ecosystem",
  path: "/",
});

const iconMap = {
  blocks: Blocks,
  network: Network,
  globe: Globe,
  zap: Zap,
} as const;

export default async function HomePage() {
  let jobs: Awaited<ReturnType<typeof getLatestPublishedJobs>> = [];
  try {
    jobs = await getLatestPublishedJobs(3);
  } catch {
    jobs = [];
  }

  return (
    <>
      <CareersHeroSection />

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-light">
            Why Node Meta
          </p>
          <h2 className="mt-3 text-3xl font-bold text-white">Why Join Node Meta</h2>
          <p className="mt-4 text-slate-400">
            Work on practical Web3 infrastructure with a team focused on secure
            products, scalable systems, and meaningful technical ownership.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {whyJoinCards.map((card) => {
            const Icon = iconMap[card.icon];
            return (
              <Card key={card.title} className="border-white/5 bg-white/[0.02]">
                <div className="mb-4 inline-flex rounded-xl bg-brand-light/10 p-3 text-brand-light">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <h3 className="text-lg font-semibold text-white">{card.title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {card.description}
                </p>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="border-y border-white/5 bg-[#080612]/80 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-light">
                Careers
              </p>
              <h2 className="mt-3 text-3xl font-bold text-white">Open Positions</h2>
              <p className="mt-3 text-slate-400">
                Roles for blockchain, smart contract, product, and operations teams.
              </p>
            </div>
            <Link
              href="/jobs"
              className="hidden text-sm text-brand-light hover:text-white sm:inline-flex"
            >
              View all positions
            </Link>
          </div>
          {jobs.length > 0 ? (
            <div className="mt-10 grid gap-6 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
            </div>
          ) : (
            <Card className="mt-10 border-white/5 bg-white/[0.02]">
              <p className="text-slate-300">
                There are no published positions right now. Check back soon or visit{" "}
                <a
                  href={siteConfig.mainWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-light hover:text-white"
                >
                  node-meta.com
                </a>{" "}
                to learn more about the company.
              </p>
            </Card>
          )}
        </div>
      </section>

      <section
        id="hiring-process"
        className="mx-auto max-w-7xl scroll-mt-[180px] px-4 py-20 sm:px-6 lg:px-8"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-light">
          How we hire
        </p>
        <h2 className="mt-3 text-3xl font-bold text-white">Hiring Process</h2>
        <p className="mt-4 max-w-3xl text-slate-400">
          Our process is designed to be clear and respectful of your time. The exact
          steps may differ depending on the role and team.
        </p>
        <ol className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {hiringStages.map((stage) => (
            <Card key={stage.step} className="border-white/5 bg-white/[0.02]">
              <p className="text-sm font-semibold text-brand-light">Step {stage.step}</p>
              <h3 className="mt-2 font-semibold text-white">{stage.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-400">{stage.description}</p>
            </Card>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <Alert variant="warning">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
            <p>
              Node Meta recruiters will never ask candidates to send cryptocurrency,
              share wallet seed phrases, pay application fees, or purchase equipment
              using personal funds.{" "}
              <Link href="/recruitment-fraud" className="font-medium text-amber-100 underline">
                Learn how to verify legitimate outreach
              </Link>
              .
            </p>
          </div>
        </Alert>
      </section>
    </>
  );
}
