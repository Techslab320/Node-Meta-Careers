import type {
  applicationStatuses,
  employmentTypes,
  experienceLevels,
  jobStatuses,
  remoteTypes,
} from "@/config/site";

export type RemoteType = (typeof remoteTypes)[number];
export type EmploymentType = (typeof employmentTypes)[number];
export type ExperienceLevel = (typeof experienceLevels)[number];
export type JobStatus = (typeof jobStatuses)[number];
export type ApplicationStatus = (typeof applicationStatuses)[number];

export interface CompensationBand {
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  salaryPeriod: "hour" | "month" | "year";
}

export interface JobDocument {
  _id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  remoteType: RemoteType;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  compensationBands: CompensationBand[];
  summary: string;
  overview: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  technologies: string[];
  benefits: string[];
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  salaryPeriod?: "hour" | "month" | "year";
  applicationDeadline?: string;
  status: JobStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ApplicationDocument {
  _id: string;
  jobId: string;
  jobTitle: string;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  city?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  telegramUsername?: string;
  discordUsername?: string;
  currentJobTitle?: string;
  yearsOfExperience?: number;
  professionalSummary: string;
  motivation: string;
  earliestStartDate?: string;
  salaryExpectation?: string;
  workAuthorization?: string;
  referralSource?: string;
  additionalMessage?: string;
  resumeUrl: string;
  resumeFilename: string;
  status: ApplicationStatus;
  recruiterNotes?: string;
  preferredEmploymentType?: EmploymentType;
  preferredExperienceLevel?: ExperienceLevel;
  consentAccepted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JobFilters {
  search?: string;
  department?: string;
  employmentType?: string;
  experienceLevel?: string;
  location?: string;
  remoteType?: string;
}

export interface AdminApplicationFilters {
  search?: string;
  jobId?: string;
  status?: string;
  country?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const assessmentStatuses = [
  "waiting",
  "in_progress",
  "submitted",
  "expired",
] as const;

export type AssessmentStatus = (typeof assessmentStatuses)[number];

export interface AssessmentAnswer {
  questionNumber: number;
  questionText: string;
  answerText: string;
}

export interface AssessmentDocument {
  _id: string;
  applicationId: string;
  jobSlug: string;
  jobTitle: string;
  status: AssessmentStatus;
  startedAt?: string;
  endsAt?: string;
  submittedAt?: string;
  answers: AssessmentAnswer[];
  financeCompatibilityErrorDisplayedAt?: string;
  financeCompatibilityErrorDisabled?: boolean;
  financeCompatibilityErrorDisabledAt?: string;
  createdAt: string;
  updatedAt: string;
}
