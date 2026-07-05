import type { EmploymentType, JobDocument } from "@/types";

export type SalaryPeriod = "hour" | "month" | "year";

export function getSalaryPeriodForEmploymentType(
  employmentType: EmploymentType | string,
): SalaryPeriod {
  switch (employmentType) {
    case "part-time":
    case "contract":
    case "support":
      return "month";
    default:
      return "year";
  }
}

export function getSalaryPeriodLabel(period: SalaryPeriod): string {
  switch (period) {
    case "hour":
      return "hourly";
    case "month":
      return "monthly";
    case "year":
      return "annual";
  }
}

export function formatSalary(
  job: Pick<
    JobDocument,
    "salaryMin" | "salaryMax" | "salaryCurrency" | "salaryPeriod" | "employmentType"
  >,
): string | null {
  if (!job.salaryMin && !job.salaryMax) return null;

  const currency = job.salaryCurrency || "USD";
  const period =
    job.salaryPeriod ?? getSalaryPeriodForEmploymentType(job.employmentType);
  const periodLabel = getSalaryPeriodLabel(period);

  if (job.salaryMin && job.salaryMax) {
    return `${currency} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()} ${periodLabel}`;
  }
  if (job.salaryMin) {
    return `From ${currency} ${job.salaryMin.toLocaleString()} ${periodLabel}`;
  }
  return `Up to ${currency} ${job.salaryMax!.toLocaleString()} ${periodLabel}`;
}
