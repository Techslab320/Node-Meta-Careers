import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database/mongodb";
import { ApplicationModel } from "@/models/Application";
import { resolvePublishedJobBySlug } from "@/lib/jobs/resolve";
import {
  applicationSchema,
  normalizeTelegram,
} from "@/lib/validation/application";
import { hasRecentDuplicateApplication } from "@/lib/applications/queries";
import { sendApplicationEmails } from "@/lib/email/send";
import { sanitizeOptionalText, sanitizeText } from "@/lib/security/sanitize";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { isTurnstileEnabled } from "@/config/env";
import { isTechnicalRole } from "@/lib/jobs/utils";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(getClientKey(request, "submit-application"), 5, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many application attempts" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = applicationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid application data" },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (data.website) {
      return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
    }

    if (isTurnstileEnabled()) {
      const valid = await verifyTurnstileToken(data.turnstileToken || "");
      if (!valid) {
        return NextResponse.json({ error: "Verification failed" }, { status: 400 });
      }
    }

    await connectDB();
    const job = await resolvePublishedJobBySlug(data.jobSlug);

    if (!job) {
      return NextResponse.json({ error: "This position is no longer available" }, { status: 404 });
    }

    const technicalRole = isTechnicalRole(job.department, job.title);
    if (technicalRole && !data.githubUrl) {
      return NextResponse.json(
        { error: "GitHub profile URL is required for this role" },
        { status: 400 },
      );
    }

    const email = sanitizeText(data.email).toLowerCase();
    const duplicate = await hasRecentDuplicateApplication(email, job._id.toString());
    if (duplicate) {
      return NextResponse.json(
        { error: "You have already applied for this position recently." },
        { status: 409 },
      );
    }

    const application = await ApplicationModel.create({
      jobId: job._id,
      jobTitle: job.title,
      firstName: sanitizeText(data.firstName),
      lastName: sanitizeText(data.lastName),
      email,
      country: sanitizeText(data.country),
      city: sanitizeOptionalText(data.city),
      linkedinUrl: sanitizeOptionalText(data.linkedinUrl),
      githubUrl: sanitizeOptionalText(data.githubUrl),
      portfolioUrl: sanitizeOptionalText(data.portfolioUrl),
      telegramUsername: normalizeTelegram(data.telegramUsername),
      discordUsername: sanitizeOptionalText(data.discordUsername),
      currentJobTitle: sanitizeOptionalText(data.currentJobTitle),
      yearsOfExperience: data.yearsOfExperience,
      professionalSummary: sanitizeText(data.professionalSummary),
      motivation: sanitizeText(data.motivation),
      earliestStartDate: sanitizeOptionalText(data.earliestStartDate),
      salaryExpectation: sanitizeOptionalText(data.salaryExpectation),
      preferredEmploymentType: data.preferredEmploymentType,
      preferredExperienceLevel: data.preferredExperienceLevel,
      workAuthorization: sanitizeOptionalText(data.workAuthorization),
      referralSource: sanitizeOptionalText(data.referralSource),
      additionalMessage: sanitizeOptionalText(data.additionalMessage),
      resumeUrl: data.resumeUrl,
      resumeFilename: sanitizeText(data.resumeFilename),
      consentAccepted: true,
    });

    await sendApplicationEmails({
      firstName: application.firstName,
      lastName: application.lastName,
      email: application.email,
      jobTitle: application.jobTitle,
      linkedinUrl: application.linkedinUrl ?? undefined,
      githubUrl: application.githubUrl ?? undefined,
      telegramUsername: application.telegramUsername ?? undefined,
      country: application.country,
      yearsOfExperience: application.yearsOfExperience ?? undefined,
      applicationId: application._id.toString(),
    }).catch((emailError) => {
      console.error("Application email delivery failed", emailError);
    });

    return NextResponse.json({ success: true, id: application._id.toString() });
  } catch (error) {
    console.error("Application submission failed", error);
    const message =
      error instanceof Error ? error.message : "Unable to submit application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
