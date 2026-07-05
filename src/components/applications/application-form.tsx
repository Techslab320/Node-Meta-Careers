"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldErrors, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { employmentTypes, experienceLevels } from "@/config/site";
import { formatLabel, isTechnicalRole } from "@/lib/jobs/utils";
import {
  applicationFormSchema,
  validateResumeFile,
  type ApplicationFormInput,
} from "@/lib/validation/application";
import type { JobDocument } from "@/types";

interface ApplicationFormProps {
  job: JobDocument;
  turnstileSiteKey?: string;
}

export function ApplicationForm({ job, turnstileSiteKey }: ApplicationFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const technicalRole = isTechnicalRole(job.department, job.title);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationFormSchema) as Resolver<ApplicationFormInput>,
    defaultValues: {
      jobId: job._id,
      jobSlug: job.slug,
      city: "",
      githubUrl: "",
      portfolioUrl: "",
      telegramUsername: "",
      discordUsername: "",
      currentJobTitle: "",
      referralSource: "",
      additionalMessage: "",
      preferredEmploymentType: "full-time",
      preferredExperienceLevel: "mid-level",
      consentAccepted: false,
      website: "",
    },
  });

  async function onSubmit(values: ApplicationFormInput) {
    setSubmitError(null);
    setResumeError(null);

    if (!resumeFile) {
      setResumeError("Please upload your resume.");
      setSubmitError("Please upload your resume.");
      return;
    }

    const resumeValidationError = validateResumeFile(resumeFile);
    if (resumeValidationError) {
      setSubmitError(resumeValidationError);
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append("file", resumeFile);

      const uploadResponse = await fetch("/api/uploads/resume", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadResponse.ok) {
        const payload = (await uploadResponse.json()) as { error?: string };
        throw new Error(payload.error || "Resume upload failed");
      }

      const uploadResult = (await uploadResponse.json()) as {
        url: string;
        filename: string;
      };

      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          resumeUrl: uploadResult.url,
          resumeFilename: uploadResult.filename,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error || "Application submission failed");
      }

      const result = (await response.json()) as { id?: string };
      const successParams = new URLSearchParams({ job: job.title });
      if (result.id) successParams.set("applicationId", result.id);

      router.push(`/application-success?${successParams.toString()}`);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  }

  function onInvalid(fieldErrors: FieldErrors<ApplicationFormInput>) {
    const firstError = Object.values(fieldErrors).find((error) => error?.message);
    setSubmitError(
      firstError?.message || "Please fix the highlighted fields before submitting.",
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit, onInvalid)}
      className="space-y-6"
      noValidate
    >
      <input type="hidden" {...register("jobId")} />
      <input type="hidden" {...register("jobSlug")} />
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
        {...register("website")}
      />

      {submitError ? <Alert variant="warning">{submitError}</Alert> : null}

      <div className="grid gap-6 md:grid-cols-2">
        <Input label="First name" error={errors.firstName?.message} {...register("firstName")} required />
        <Input label="Last name" error={errors.lastName?.message} {...register("lastName")} required />
        <Input label="Email address" type="email" error={errors.email?.message} {...register("email")} required />
        <Input label="Country" error={errors.country?.message} {...register("country")} required />
        <Input label="City or region" error={errors.city?.message} {...register("city")} />
        <Input label="Current job title" error={errors.currentJobTitle?.message} {...register("currentJobTitle")} />
        <Input
          label="Years of relevant experience"
          type="number"
          min={0}
          error={errors.yearsOfExperience?.message}
          {...register("yearsOfExperience", {
            valueAsNumber: true,
            validate: (value) =>
              !Number.isNaN(value) || "Years of experience is required",
          })}
          required
        />
        <Input
          label="Earliest available start date"
          error={errors.earliestStartDate?.message}
          {...register("earliestStartDate")}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="resume" className="block text-sm font-medium text-slate-200">
          Resume <span className="text-cyan-400">*</span>
        </label>
        <input
          id="resume"
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className={`block w-full rounded-lg border bg-slate-900/80 px-4 py-2.5 text-sm text-slate-200 file:mr-4 file:rounded-md file:border-0 file:bg-cyan-500/20 file:px-3 file:py-1.5 file:text-cyan-100 ${
            resumeError ? "border-red-500/70" : "border-slate-700"
          }`}
          onChange={(event) => {
            setResumeFile(event.target.files?.[0] || null);
            setResumeError(null);
          }}
        />
        {resumeError ? (
          <p className="text-sm text-red-400" role="alert">
            {resumeError}
          </p>
        ) : null}
        <p className="text-xs text-slate-400">PDF, DOC, or DOCX up to 10 MB.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Input label="LinkedIn profile URL" error={errors.linkedinUrl?.message} {...register("linkedinUrl")} required />
        <Input
          label="GitHub profile URL"
          error={errors.githubUrl?.message}
          {...register("githubUrl")}
          required={technicalRole}
        />
        <Input label="Portfolio URL" error={errors.portfolioUrl?.message} {...register("portfolioUrl")} />
        <Input label="Telegram username" error={errors.telegramUsername?.message} {...register("telegramUsername")} />
        <Input label="Discord username" error={errors.discordUsername?.message} {...register("discordUsername")} />
        <Input label="Referral source" error={errors.referralSource?.message} {...register("referralSource")} />
      </div>

      <Textarea
        label="Short professional summary"
        error={errors.professionalSummary?.message}
        {...register("professionalSummary")}
        required
      />
      <Textarea
        label="Why do you want to join Node Meta?"
        error={errors.motivation?.message}
        {...register("motivation")}
        required
      />
      <Textarea
        label="Additional message"
        error={errors.additionalMessage?.message}
        {...register("additionalMessage")}
      />

      <div className="grid gap-6 md:grid-cols-2">
        <Select
          label="Preferred employment type"
          error={errors.preferredEmploymentType?.message}
          options={employmentTypes.map((value) => ({
            value,
            label: formatLabel(value),
          }))}
          required
          {...register("preferredEmploymentType")}
        />
        <Select
          label="Preferred experience level"
          error={errors.preferredExperienceLevel?.message}
          options={experienceLevels.map((value) => ({
            value,
            label: formatLabel(value),
          }))}
          required
          {...register("preferredExperienceLevel")}
        />
        <Input
          label="Salary expectation"
          error={errors.salaryExpectation?.message}
          {...register("salaryExpectation")}
          required
        />
        <Input
          label="Work authorization status"
          error={errors.workAuthorization?.message}
          {...register("workAuthorization")}
          required
        />
      </div>

      <label className="flex items-start gap-3 text-sm text-slate-300">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-900 text-cyan-500 focus:ring-cyan-500"
          {...register("consentAccepted")}
        />
        <span>
          I agree to the processing of my application data as described in the{" "}
          <Link href="/privacy" className="text-cyan-300 hover:text-cyan-200">
            privacy notice
          </Link>
          .
        </span>
      </label>
      {errors.consentAccepted ? (
        <p className="text-sm text-red-400">{errors.consentAccepted.message}</p>
      ) : null}

      {turnstileSiteKey ? (
        <div className="rounded-lg border border-slate-800 p-4 text-sm text-slate-400">
          Cloudflare Turnstile verification is enabled for this form.
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Submitting application..." : "Submit application"}
      </Button>
    </form>
  );
}
