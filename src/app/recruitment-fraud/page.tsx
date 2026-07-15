import { Card } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Recruitment Fraud Notice | Node Meta Careers",
  description: "How to identify and report fraudulent recruitment activity targeting Node Meta candidates.",
  path: "/recruitment-fraud",
});

export default function RecruitmentFraudPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-white">Recruitment Fraud Notice</h1>
      <Card className="mt-8 space-y-6 text-slate-300">
        <p>
          Fraudulent actors may impersonate companies to target job seekers. Protect
          yourself by verifying all recruitment communications.
        </p>

        <section>
          <h2 className="text-xl font-semibold text-white">Node Meta will never</h2>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            <li>Charge an application fee</li>
            <li>Request cryptocurrency or digital asset payments</li>
            <li>Request wallet credentials or private keys</li>
            <li>Request seed phrases</li>
            <li>Ask candidates to install suspicious software</li>
            <li>Send offers without an interview process</li>
            <li>Communicate only through unofficial accounts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-white">Verify official channels</h2>
          <p className="mt-3">
            Official company information is available at{" "}
            <a
              href={siteConfig.mainWebsiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-light hover:text-brand-light"
            >
              {siteConfig.mainWebsiteUrl}
            </a>
            .
          </p>
          {siteConfig.recruitmentContactEmail ? (
            <p className="mt-3">
              For recruitment verification, contact{" "}
              <a
                href={`mailto:${siteConfig.recruitmentContactEmail}`}
                className="text-brand-light hover:text-brand-light"
              >
                {siteConfig.recruitmentContactEmail}
              </a>
              .
            </p>
          ) : (
            <p className="mt-3">
              Configure <code className="text-brand-light">RECRUITMENT_CONTACT_EMAIL</code>{" "}
              in your environment to display the official recruitment contact address on
              this page.
            </p>
          )}
        </section>
      </Card>
    </div>
  );
}
