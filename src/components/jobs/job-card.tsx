import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Badge, Card } from "@/components/ui/card";
import {
  formatCompensationBand,
  formatLabel,
  formatSalary,
  getCompensationBand,
} from "@/lib/jobs/utils";
import type { JobDocument } from "@/types";

interface JobCardProps {
  job: JobDocument;
  employmentType?: string;
  experienceLevel?: string;
}

export function JobCard({ job, employmentType, experienceLevel }: JobCardProps) {
  const band = getCompensationBand(
    job.compensationBands,
    employmentType,
    experienceLevel,
  );
  const salary = band ? formatCompensationBand(band) : formatSalary(job);

  return (
    <Card className="flex h-full flex-col">
      <div className="flex flex-wrap gap-2">
        <Badge>{job.department}</Badge>
        <Badge className="border-emerald-500/20 bg-emerald-500/10 text-emerald-200">
          {formatLabel(job.remoteType)}
        </Badge>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-white">{job.title}</h3>
      <div className="mt-2 flex items-center gap-2 text-sm text-slate-400">
        <MapPin className="h-4 w-4" aria-hidden />
        <span>{job.location}</span>
      </div>
      {salary ? (
        <p className="mt-3 text-sm font-medium text-cyan-300">{salary}</p>
      ) : null}
      <p className="mt-4 flex-1 text-sm leading-6 text-slate-300">{job.summary}</p>
      <Link
        href={`/jobs/${job.slug}`}
        className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-300 hover:text-cyan-200"
      >
        View Position
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </Card>
  );
}
