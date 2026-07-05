import slugify from "slugify";
import {
  buildCompensationBands,
  getCompensationBand,
  legacyBandFromJob,
} from "@/lib/jobs/compensation";
import type { Job } from "@/models/Job";
import type { JobDocument } from "@/types";

export { formatSalary } from "@/lib/jobs/salary";
export {
  formatCompensationBand,
  getCompensationBand,
  POSITION_EMPLOYMENT_TYPES,
  POSITION_EXPERIENCE_LEVELS,
} from "@/lib/jobs/compensation";

export function generateSlug(title: string): string {
  return slugify(title, { lower: true, strict: true, trim: true });
}

function toPlainCompensationBands(
  bands: JobDocument["compensationBands"],
): JobDocument["compensationBands"] {
  return bands.map((band) => ({
    employmentType: band.employmentType,
    experienceLevel: band.experienceLevel,
    salaryMin: band.salaryMin,
    salaryMax: band.salaryMax,
    salaryCurrency: band.salaryCurrency ?? "USD",
    salaryPeriod: band.salaryPeriod,
  }));
}

function resolveCompensationBands(job: {
  employmentType: Job["employmentType"];
  experienceLevel: Job["experienceLevel"];
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: Job["salaryPeriod"];
  compensationBands?: JobDocument["compensationBands"];
}): JobDocument["compensationBands"] {
  if (job.compensationBands && job.compensationBands.length > 0) {
    return job.compensationBands;
  }

  const legacy = legacyBandFromJob({
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    salaryMin: job.salaryMin ?? undefined,
    salaryMax: job.salaryMax ?? undefined,
    salaryCurrency: job.salaryCurrency ?? undefined,
    salaryPeriod: job.salaryPeriod ?? undefined,
  });

  if (!legacy) return [];

  const annualMidMin = Math.round(
    legacy.salaryPeriod === "year"
      ? legacy.salaryMin / (job.experienceLevel === "senior" ? 1.22 : 1)
      : (legacy.salaryMin * 12) / 0.72,
  );
  const annualMidMax = Math.round(
    legacy.salaryPeriod === "year"
      ? legacy.salaryMax / (job.experienceLevel === "senior" ? 1.22 : 1)
      : (legacy.salaryMax * 12) / 0.72,
  );

  return buildCompensationBands({ midMin: annualMidMin, midMax: annualMidMax });
}

export function enrichJobDocument(job: JobDocument): JobDocument {
  const compensationBands =
    job.compensationBands?.length > 0
      ? toPlainCompensationBands(job.compensationBands)
      : resolveCompensationBands(job);
  const primaryBand = getCompensationBand(compensationBands);

  return {
    ...job,
    compensationBands,
    employmentType: primaryBand?.employmentType ?? job.employmentType,
    experienceLevel: primaryBand?.experienceLevel ?? job.experienceLevel,
    salaryMin: primaryBand?.salaryMin ?? job.salaryMin,
    salaryMax: primaryBand?.salaryMax ?? job.salaryMax,
    salaryCurrency: primaryBand?.salaryCurrency ?? job.salaryCurrency,
    salaryPeriod: primaryBand?.salaryPeriod ?? job.salaryPeriod,
  };
}

export function serializeJob(job: Job & { _id: { toString(): string } }): JobDocument {
  const document: JobDocument = {
    _id: job._id.toString(),
    title: job.title,
    slug: job.slug,
    department: job.department,
    location: job.location,
    remoteType: job.remoteType,
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    compensationBands: toPlainCompensationBands(
      (job.compensationBands as JobDocument["compensationBands"]) ?? [],
    ),
    summary: job.summary,
    overview: job.overview,
    responsibilities: job.responsibilities ?? [],
    requiredQualifications: job.requiredQualifications ?? [],
    preferredQualifications: job.preferredQualifications ?? [],
    technologies: job.technologies ?? [],
    benefits: job.benefits ?? [],
    salaryMin: job.salaryMin ?? undefined,
    salaryMax: job.salaryMax ?? undefined,
    salaryCurrency: job.salaryCurrency ?? undefined,
    salaryPeriod: job.salaryPeriod ?? undefined,
    applicationDeadline: job.applicationDeadline?.toISOString(),
    status: job.status,
    featured: job.featured,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
    publishedAt: job.publishedAt?.toISOString(),
  };

  return enrichJobDocument(document);
}

export function formatLabel(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function isTechnicalRole(department: string, title: string): boolean {
  const normalized = `${department} ${title}`.toLowerCase();
  return (
    normalized.includes("engineer") ||
    normalized.includes("developer") ||
    normalized.includes("engineering") ||
    normalized.includes("blockchain") ||
    normalized.includes("solidity")
  );
}

export function mapEmploymentTypeToSchema(type: string): string {
  const mapping: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
    support: "PART_TIME",
    internship: "INTERN",
  };
  return mapping[type] || "FULL_TIME";
}
