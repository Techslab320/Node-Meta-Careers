import { z } from "zod";
import { employmentTypes, experienceLevels } from "@/config/site";
import { sanitizeText } from "@/lib/security/sanitize";

function toOptionalString(value: unknown): string {
  if (value === undefined || value === null) return "";
  return String(value);
}

function normalizeOptionalText(value: string): string {
  return value.trim();
}

function isValidUrl(value: string): boolean {
  return z.string().url().safeParse(value).success;
}

function optionalTextSchema(maxLength: number) {
  return z.preprocess(
    toOptionalString,
    z.string().max(maxLength).transform(normalizeOptionalText),
  );
}

const optionalUrlSchema = z.preprocess(
  toOptionalString,
  z
    .string()
    .max(500)
    .transform((value) => {
      const trimmed = normalizeOptionalText(value);
      if (!trimmed || !isValidUrl(trimmed)) return "";
      return trimmed;
    }),
);

const optionalTelegramSchema = z.preprocess(
  toOptionalString,
  z
    .string()
    .max(100)
    .transform((value) => {
      const trimmed = normalizeOptionalText(value);
      if (!trimmed) return "";

      const username = trimmed.startsWith("http")
        ? trimmed.match(/t\.me\/([A-Za-z0-9_]{5,32})/)?.[1]
        : trimmed.replace(/^@/, "");

      if (username && /^[A-Za-z0-9_]{5,32}$/.test(username)) {
        return trimmed.startsWith("http")
          ? trimmed
          : trimmed.startsWith("@")
            ? trimmed
            : `@${trimmed}`;
      }

      return "";
    }),
);

export const applicationFormSchema = z.object({
  jobId: z.string().min(1),
  jobSlug: z.string().min(1),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(254),
  country: z.string().min(1).max(100),
  city: optionalTextSchema(100),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL").max(500),
  githubUrl: optionalUrlSchema,
  portfolioUrl: optionalUrlSchema,
  telegramUsername: optionalTelegramSchema,
  discordUsername: optionalTextSchema(100),
  currentJobTitle: optionalTextSchema(150),
  yearsOfExperience: z
    .number({ error: "Years of experience is required" })
    .min(0, "Years of experience is required")
    .max(60),
  professionalSummary: z
    .string()
    .min(20, "Professional summary must be at least 20 characters")
    .max(2000),
  motivation: z
    .string()
    .min(20, "Please write at least 20 characters about why you want to join")
    .max(2000),
  earliestStartDate: z.string().min(1).max(50),
  salaryExpectation: z.string().min(1).max(100),
  preferredEmploymentType: z.enum(employmentTypes),
  preferredExperienceLevel: z.enum(experienceLevels),
  workAuthorization: z.string().min(1).max(200),
  referralSource: optionalTextSchema(200),
  additionalMessage: optionalTextSchema(2000),
  consentAccepted: z.boolean().refine((value) => value === true, {
    message: "You must accept the privacy notice to apply",
  }),
  website: z.string().max(0).optional(),
  turnstileToken: z.string().optional(),
});

export type ApplicationFormInput = z.infer<typeof applicationFormSchema>;

export const applicationSchema = applicationFormSchema.extend({
  resumeUrl: z
    .string()
    .min(1)
    .refine(
      (value) =>
        value.startsWith("local-resume://") ||
        /^https?:\/\//.test(value),
      "Invalid resume URL",
    ),
  resumeFilename: z.string().min(1).max(255),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export function normalizeTelegram(value?: string): string | undefined {
  if (!value) return undefined;
  const trimmed = sanitizeText(value);
  if (trimmed.startsWith("http")) {
    const match = trimmed.match(/t\.me\/([A-Za-z0-9_]{5,32})/);
    return match ? `@${match[1]}` : trimmed;
  }
  return trimmed.startsWith("@") ? trimmed : `@${trimmed}`;
}

export const applicationStatusSchema = z.object({
  status: z.enum([
    "new",
    "reviewing",
    "shortlisted",
    "interview",
    "assessment",
    "offer",
    "hired",
    "rejected",
  ]),
  recruiterNotes: z.string().max(5000).optional(),
});

export const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"] as const;
export const ALLOWED_RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;
export const MAX_RESUME_SIZE = 10 * 1024 * 1024;

export function validateResumeFile(file: File): string | null {
  const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (
    !ALLOWED_RESUME_EXTENSIONS.includes(
      extension as (typeof ALLOWED_RESUME_EXTENSIONS)[number],
    )
  ) {
    return "Resume must be a PDF, DOC, or DOCX file";
  }
  if (
    file.type &&
    !ALLOWED_RESUME_MIME_TYPES.includes(
      file.type as (typeof ALLOWED_RESUME_MIME_TYPES)[number],
    )
  ) {
    return "Invalid resume file type";
  }
  if (file.size > MAX_RESUME_SIZE) {
    return "Resume must be 10 MB or smaller";
  }
  return null;
}
