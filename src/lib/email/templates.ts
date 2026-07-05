import { siteConfig } from "@/config/site";

interface CandidateEmailParams {
  firstName: string;
  jobTitle: string;
}

export function buildCandidateConfirmationEmail({
  firstName,
  jobTitle,
}: CandidateEmailParams) {
  return {
    subject: `Application received – ${jobTitle} at ${siteConfig.companyName}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <p>Hi ${escapeHtml(firstName)},</p>
        <p>Thank you for applying for the <strong>${escapeHtml(jobTitle)}</strong> position at ${siteConfig.companyName}.</p>
        <p>We have received your application and our recruitment team will review it.</p>
        <p><strong>Important safety notice:</strong> ${siteConfig.companyName} recruiters will never ask you to send cryptocurrency, share wallet seed phrases, pay application fees, provide passwords, or purchase equipment using personal funds.</p>
        <p>Learn more on our official website: <a href="${siteConfig.mainWebsiteUrl}">${siteConfig.mainWebsiteUrl}</a></p>
        <p>Best regards,<br/>${siteConfig.companyName} Recruitment Team</p>
      </div>
    `,
  };
}

interface RecruiterEmailParams {
  firstName: string;
  lastName: string;
  jobTitle: string;
  email: string;
  linkedinUrl?: string;
  githubUrl?: string;
  telegramUsername?: string;
  country: string;
  yearsOfExperience?: number;
  adminUrl: string;
}

export function buildRecruiterNotificationEmail(params: RecruiterEmailParams) {
  return {
    subject: `New application: ${params.firstName} ${params.lastName} – ${params.jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>New application received</h2>
        <p><strong>Candidate:</strong> ${escapeHtml(params.firstName)} ${escapeHtml(params.lastName)}</p>
        <p><strong>Position:</strong> ${escapeHtml(params.jobTitle)}</p>
        <p><strong>Email:</strong> ${escapeHtml(params.email)}</p>
        <p><strong>Country:</strong> ${escapeHtml(params.country)}</p>
        <p><strong>Experience:</strong> ${params.yearsOfExperience ?? "Not specified"} years</p>
        ${params.linkedinUrl ? `<p><strong>LinkedIn:</strong> <a href="${escapeHtml(params.linkedinUrl)}">${escapeHtml(params.linkedinUrl)}</a></p>` : ""}
        ${params.githubUrl ? `<p><strong>GitHub:</strong> <a href="${escapeHtml(params.githubUrl)}">${escapeHtml(params.githubUrl)}</a></p>` : ""}
        ${params.telegramUsername ? `<p><strong>Telegram:</strong> ${escapeHtml(params.telegramUsername)}</p>` : ""}
        <p><strong>Review application:</strong> <a href="${escapeHtml(params.adminUrl)}">${escapeHtml(params.adminUrl)}</a></p>
        <p>The resume is available for download in the admin dashboard.</p>
      </div>
    `,
  };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
