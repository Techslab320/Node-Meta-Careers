import type { EmploymentType, ExperienceLevel } from "@/types";
import type { SalaryPeriod } from "@/lib/jobs/salary";
import { formatSalary, getSalaryPeriodForEmploymentType } from "@/lib/jobs/salary";

export const POSITION_EMPLOYMENT_TYPES = [
  "full-time",
  "part-time",
  "contract",
  "support",
] as const satisfies readonly EmploymentType[];

export const POSITION_EXPERIENCE_LEVELS = [
  "mid-level",
  "senior",
] as const satisfies readonly ExperienceLevel[];

export interface CompensationBand {
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: SalaryPeriod;
}

export interface CompensationBase {
  midMin: number;
  midMax: number;
  monthlyFactors?: Partial<Record<"part-time" | "contract" | "support", number>>;
}

const SENIOR_FACTOR = 1.22;

const DEFAULT_MONTHLY_FACTORS = {
  "part-time": 0.55,
  contract: 0.72,
  support: 0.42,
} as const;

export function buildCompensationBands(base: CompensationBase): CompensationBand[] {
  const factors = { ...DEFAULT_MONTHLY_FACTORS, ...base.monthlyFactors };
  const seniorMin = Math.round(base.midMin * SENIOR_FACTOR);
  const seniorMax = Math.round(base.midMax * SENIOR_FACTOR);
  const bands: CompensationBand[] = [];

  for (const experienceLevel of POSITION_EXPERIENCE_LEVELS) {
    const [annualMin, annualMax] =
      experienceLevel === "mid-level"
        ? [base.midMin, base.midMax]
        : [seniorMin, seniorMax];
    const levelFactor = experienceLevel === "senior" ? 1 : 1;

    bands.push({
      employmentType: "full-time",
      experienceLevel,
      salaryMin: annualMin,
      salaryMax: annualMax,
      salaryCurrency: "USD",
      salaryPeriod: "year",
    });

    const fullTimeMonthlyMin = annualMin / 12;
    const fullTimeMonthlyMax = annualMax / 12;

    for (const employmentType of ["part-time", "contract", "support"] as const) {
      const factor = factors[employmentType];
      bands.push({
        employmentType,
        experienceLevel,
        salaryMin: Math.round(fullTimeMonthlyMin * factor * levelFactor),
        salaryMax: Math.round(fullTimeMonthlyMax * factor * levelFactor),
        salaryCurrency: "USD",
        salaryPeriod: "month",
      });
    }
  }

  return bands;
}

export function getCompensationBand(
  bands: CompensationBand[],
  employmentType?: EmploymentType | string,
  experienceLevel?: ExperienceLevel | string,
): CompensationBand | undefined {
  if (bands.length === 0) return undefined;

  if (employmentType && experienceLevel) {
    const match = bands.find(
      (band) =>
        band.employmentType === employmentType &&
        band.experienceLevel === experienceLevel,
    );
    if (match) return match;
  }

  if (employmentType) {
    const match = bands.find((band) => band.employmentType === employmentType);
    if (match) return match;
  }

  return (
    bands.find(
      (band) => band.employmentType === "full-time" && band.experienceLevel === "mid-level",
    ) ?? bands[0]
  );
}

export function formatCompensationBand(band: CompensationBand): string {
  return (
    formatSalary({
      salaryMin: band.salaryMin,
      salaryMax: band.salaryMax,
      salaryCurrency: band.salaryCurrency,
      salaryPeriod: band.salaryPeriod,
      employmentType: band.employmentType,
    }) ?? ""
  );
}

export function jobMatchesCompensationFilter(
  bands: CompensationBand[],
  employmentType?: string,
  experienceLevel?: string,
): boolean {
  if (!employmentType && !experienceLevel) return true;
  if (bands.length === 0) return true;

  return bands.some(
    (band) =>
      (!employmentType || band.employmentType === employmentType) &&
      (!experienceLevel || band.experienceLevel === experienceLevel),
  );
}

export function legacyBandFromJob(job: {
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: SalaryPeriod;
}): CompensationBand | undefined {
  if (!job.salaryMin && !job.salaryMax) return undefined;

  return {
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    salaryMin: job.salaryMin ?? job.salaryMax ?? 0,
    salaryMax: job.salaryMax ?? job.salaryMin ?? 0,
    salaryCurrency: job.salaryCurrency ?? "USD",
    salaryPeriod:
      job.salaryPeriod ?? getSalaryPeriodForEmploymentType(job.employmentType),
  };
}
