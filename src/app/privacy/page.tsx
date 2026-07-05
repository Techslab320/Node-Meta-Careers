import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Privacy Notice | Node Meta Careers",
  description: "How Node Meta collects, uses, and stores applicant information.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white">Privacy Notice</h1>
      <Card className="mt-8 space-y-6 text-slate-300">
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
          This privacy notice is provided for recruitment purposes and should be reviewed
          by qualified legal counsel before production launch.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-white">Information we collect</h2>
          <p className="mt-3">
            When you apply for a role, we collect information you provide such as your
            name, email address, location, professional links, resume, work history
            details, motivation statement, salary expectations, work authorization
            status, and optional contact details.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Why we collect it</h2>
          <p className="mt-3">
            Applicant information is used only for recruitment purposes, including
            evaluating your candidacy, contacting you about your application, and
            managing the hiring process.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">How resumes are stored</h2>
          <p className="mt-3">
            Resumes are uploaded securely and stored using Vercel Blob. Resume files are
            not displayed publicly and are accessible only to authorized recruitment
            administrators through protected admin tools.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Who can access applications</h2>
          <p className="mt-3">
            Access is limited to authorized {siteConfig.companyName} recruitment and
            hiring personnel who need the information to review applications and manage
            the hiring process.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Retention</h2>
          <p className="mt-3">
            Applicant data may be retained for a reasonable period to manage active and
            future recruitment processes unless deletion is requested or a shorter
            retention period is implemented by the company.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Deletion requests</h2>
          <p className="mt-3">
            You may request deletion of your application data by contacting the
            recruitment team
            {siteConfig.recruitmentContactEmail
              ? ` at ${siteConfig.recruitmentContactEmail}`
              : " using the official contact channel published on node-meta.com"}
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Third-party services</h2>
          <p className="mt-3">
            This careers portal uses third-party services for hosting (Vercel), database
            storage (MongoDB Atlas), resume storage (Vercel Blob), and email delivery
            (Resend). These providers process data on our behalf to operate the
            recruitment platform.
          </p>
        </section>
      </Card>
    </div>
  );
}
