import { siteConfig } from "@/config/site";

export function formatLabel(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatSalary(job: {
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  salaryPeriod?: string | null;
}): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;
  const currency = job.salaryCurrency || "USD";
  const period = job.salaryPeriod ? ` / ${job.salaryPeriod}` : "";
  if (job.salaryMin && job.salaryMax) {
    return `${currency} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}${period}`;
  }
  if (job.salaryMin) {
    return `From ${currency} ${job.salaryMin.toLocaleString()}${period}`;
  }
  return `Up to ${currency} ${job.salaryMax?.toLocaleString()}${period}`;
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function serializeJob<T extends Record<string, unknown>>(job: T) {
  return JSON.parse(JSON.stringify(job));
}

export function getEmploymentTypeForJsonLd(
  employmentType: string,
): string | undefined {
  const map: Record<string, string> = {
    "full-time": "FULL_TIME",
    "part-time": "PART_TIME",
    contract: "CONTRACTOR",
    support: "PART_TIME",
    internship: "INTERN",
  };
  return map[employmentType];
}

export function getSiteUrl(path = ""): string {
  const base = siteConfig.siteUrl.replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
