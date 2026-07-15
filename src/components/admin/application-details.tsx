import { Badge } from "@/components/ui/card";
import { formatLabel } from "@/lib/jobs/utils";
import type { ApplicationDocument } from "@/types";

function DetailField({
  label,
  value,
  href,
}: {
  label: string;
  value?: string | number | null;
  href?: string;
}) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div>
      <p className="text-sm text-slate-400">{label}</p>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 block break-all text-brand-light hover:text-brand-light"
        >
          {value}
        </a>
      ) : (
        <p className="mt-1 text-white">{value}</p>
      )}
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

export function ApplicationDetails({
  application,
}: {
  application: ApplicationDocument;
}) {
  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-3">
        <Badge>{formatLabel(application.status)}</Badge>
        <p className="text-sm text-slate-400">
          Applied {new Date(application.createdAt).toLocaleString()}
        </p>
      </div>

      <DetailSection title="Candidate">
        <DetailField
          label="Name"
          value={`${application.firstName} ${application.lastName}`}
        />
        <DetailField label="Email" value={application.email} href={`mailto:${application.email}`} />
        <DetailField label="Country" value={application.country} />
        <DetailField label="City or region" value={application.city} />
        <DetailField label="Current job title" value={application.currentJobTitle} />
        <DetailField
          label="Years of relevant experience"
          value={application.yearsOfExperience}
        />
        <DetailField label="Earliest start date" value={application.earliestStartDate} />
        <DetailField label="Work authorization" value={application.workAuthorization} />
      </DetailSection>

      <DetailSection title="Position">
        <DetailField label="Job title" value={application.jobTitle} />
        <DetailField
          label="Preferred employment type"
          value={
            application.preferredEmploymentType
              ? formatLabel(application.preferredEmploymentType)
              : undefined
          }
        />
        <DetailField
          label="Preferred experience level"
          value={
            application.preferredExperienceLevel
              ? formatLabel(application.preferredExperienceLevel)
              : undefined
          }
        />
        <DetailField label="Salary expectation" value={application.salaryExpectation} />
        <DetailField label="Referral source" value={application.referralSource} />
      </DetailSection>

      <DetailSection title="Links & profiles">
        <DetailField label="LinkedIn" value={application.linkedinUrl} href={application.linkedinUrl} />
        <DetailField label="GitHub" value={application.githubUrl} href={application.githubUrl} />
        <DetailField label="Portfolio" value={application.portfolioUrl} href={application.portfolioUrl} />
        <DetailField label="Telegram" value={application.telegramUsername} />
        <DetailField label="Discord" value={application.discordUsername} />
      </DetailSection>

      <section>
        <h2 className="text-lg font-semibold text-white">Application responses</h2>
        <div className="mt-4 space-y-4 text-slate-300">
          <div>
            <p className="text-sm text-slate-400">Professional summary</p>
            <p className="mt-2 whitespace-pre-wrap">{application.professionalSummary}</p>
          </div>
          <div>
            <p className="text-sm text-slate-400">Why Node Meta?</p>
            <p className="mt-2 whitespace-pre-wrap">{application.motivation}</p>
          </div>
          {application.additionalMessage ? (
            <div>
              <p className="text-sm text-slate-400">Additional message</p>
              <p className="mt-2 whitespace-pre-wrap">{application.additionalMessage}</p>
            </div>
          ) : null}
        </div>
      </section>

      <div>
        <p className="text-sm text-slate-400">Resume</p>
        <a
          href={`/api/admin/resumes/${application._id}`}
          className="mt-2 inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-900"
        >
          Download {application.resumeFilename}
        </a>
      </div>
    </div>
  );
}
