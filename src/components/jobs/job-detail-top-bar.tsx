import Link from "next/link";
import { ShareJobButton } from "@/components/jobs/share-button";

interface JobDetailTopBarProps {
  title: string;
  location: string;
  applyHref: string;
  shareUrl: string;
}

export function JobDetailTopBar({
  title,
  location,
  applyHref,
  shareUrl,
}: JobDetailTopBarProps) {
  return (
    <div className="sticky top-[4.25rem] z-40 -mx-4 border-b border-slate-800/80 bg-slate-950/95 px-4 py-5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
          <p className="mt-2 text-slate-400">{location}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 lg:justify-end">
          <Link
            href={applyHref}
            className="inline-flex rounded-lg bg-gradient-to-r from-brand-light to-brand-dark px-6 py-3 text-sm font-semibold text-slate-950"
          >
            Apply Now
          </Link>
          <ShareJobButton title={title} url={shareUrl} />
        </div>
      </div>
    </div>
  );
}
