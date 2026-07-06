import { Resend } from "resend";
import { adminPath } from "@/config/admin";
import { getEnv, getPublicSiteUrl, isEmailEnabled } from "@/config/env";
import {
  buildCandidateConfirmationEmail,
  buildRecruiterNotificationEmail,
} from "@/lib/email/templates";

let resendClient: Resend | null = null;

function getResendClient(): Resend {
  if (!resendClient) {
    const { RESEND_API_KEY } = getEnv();
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }
    resendClient = new Resend(RESEND_API_KEY);
  }
  return resendClient;
}

export async function sendApplicationEmails(params: {
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  linkedinUrl?: string;
  githubUrl?: string;
  telegramUsername?: string;
  country: string;
  yearsOfExperience?: number;
  applicationId: string;
}) {
  if (!isEmailEnabled()) {
    return;
  }

  const env = getEnv();
  const resend = getResendClient();
  const siteUrl = env.NEXT_PUBLIC_SITE_URL || getPublicSiteUrl();
  const adminUrl = `${siteUrl}${adminPath(`applications/${params.applicationId}`)}`;

  const candidateEmail = buildCandidateConfirmationEmail({
    firstName: params.firstName,
    jobTitle: params.jobTitle,
  });

  const recruiterEmail = buildRecruiterNotificationEmail({
    ...params,
    adminUrl,
  });

  await Promise.all([
    resend.emails.send({
      from: env.RECRUITMENT_FROM_EMAIL!,
      to: params.email,
      subject: candidateEmail.subject,
      html: candidateEmail.html,
    }),
    resend.emails.send({
      from: env.RECRUITMENT_FROM_EMAIL!,
      to: env.RECRUITMENT_NOTIFICATION_EMAIL!,
      subject: recruiterEmail.subject,
      html: recruiterEmail.html,
    }),
  ]);
}
