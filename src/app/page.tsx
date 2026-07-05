import Link from "next/link";
import { ArrowRight, Blocks, Globe, Network, ShieldAlert, Zap } from "lucide-react";
import { JobCard } from "@/components/jobs/job-card";
import { GridBackground, NodeVisualization } from "@/components/layout/grid-background";
import { Alert, Card } from "@/components/ui/card";
import { hiringStages, siteConfig, whyJoinCards } from "@/config/site";
import { getLatestPublishedJobs } from "@/lib/jobs/queries";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata = createPageMetadata({
  title: "Node Meta Careers | Build the Future of Web3",
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
      <section className="relative overflow-hidden border-b border-slate-800/80">
        <GridBackground />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-cyan-300">
              Careers at {siteConfig.companyName}
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Build the Future of Web3 with Node Meta
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Join a team building secure blockchain infrastructure, decentralized
              applications, digital-asset products, and next-generation Web3
              experiences.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/jobs"
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:from-cyan-400 hover:to-emerald-400"
              >
                View Open Positions
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href={siteConfig.mainWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-slate-900/60 px-6 py-3 text-sm font-semibold text-cyan-100 transition hover:border-cyan-400/50"
              >
                Visit node-meta.com
              </a>
            </div>
          </div>
          <div className="hidden h-[420px] lg:block">
            <NodeVisualization />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-bold text-white">Why Join Node Meta</h2>
          <p className="mt-4 text-slate-400">
            Work on practical Web3 infrastructure with a team focused on secure
            products, scalable systems, and meaningful technical ownership.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {whyJoinCards.map((card) => {
            const Icon = iconMap[card.icon];
            return (
              <Card key={card.title}>
                <div className="mb-4 inline-flex rounded-xl bg-cyan-500/10 p-3 text-cyan-300">
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

      <section className="border-y border-slate-800/80 bg-slate-900/20 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white">Open Positions</h2>
              <p className="mt-3 text-slate-400">
                Roles for NFT Marketplace &amp; SmartCommerce initiatives.
              </p>
            </div>
            <Link href="/jobs" className="hidden text-sm text-cyan-300 hover:text-cyan-200 sm:inline-flex">
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
            <Card className="mt-10">
              <p className="text-slate-300">
                There are no published positions right now. Check back soon or visit{" "}
                <a
                  href={siteConfig.mainWebsiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-200"
                >
                  node-meta.com
                </a>{" "}
                to learn more about the company.
              </p>
            </Card>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white">Hiring Process</h2>
        <p className="mt-4 max-w-3xl text-slate-400">
          Our process is designed to be clear and respectful of your time. The exact
          steps may differ depending on the role and team.
        </p>
        <ol className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {hiringStages.map((stage) => (
            <Card key={stage.step}>
              <p className="text-sm font-semibold text-cyan-300">Step {stage.step}</p>
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
