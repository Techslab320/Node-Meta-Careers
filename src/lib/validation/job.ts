import { z } from "zod";
import {
  employmentTypes,
  experienceLevels,
  jobStatuses,
  remoteTypes,
} from "@/config/site";

const listField = z
  .union([z.array(z.string()), z.string()])
  .transform((value) => {
    if (Array.isArray(value)) {
      return value.map((item) => item.trim()).filter(Boolean);
    }
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  });

export const jobSchema = z.object({
  title: z.string().min(3).max(200),
  slug: z
    .string()
    .min(3)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be URL-friendly"),
  department: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  remoteType: z.enum(remoteTypes),
  employmentType: z.enum(employmentTypes),
  experienceLevel: z.enum(experienceLevels),
  summary: z.string().min(20).max(500),
  overview: z.string().min(20).max(5000),
  responsibilities: listField,
  requiredQualifications: listField,
  preferredQualifications: listField,
  technologies: listField,
  benefits: listField,
  salaryMin: z.coerce.number().nonnegative().optional(),
  salaryMax: z.coerce.number().nonnegative().optional(),
  salaryCurrency: z.string().max(10).optional(),
  salaryPeriod: z.enum(["hour", "month", "year"]).optional(),
  applicationDeadline: z.string().optional(),
  status: z.enum(jobStatuses).default("draft"),
  featured: z.boolean().default(false),
});

export type JobInput = z.infer<typeof jobSchema>;

export const jobUpdateSchema = jobSchema.partial();

export const jobStatusSchema = z.object({
  status: z.enum(jobStatuses),
});
