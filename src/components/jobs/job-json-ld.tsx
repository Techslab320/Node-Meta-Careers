import { siteConfig } from "@/config/site";
import { getSalaryPeriodLabel, getSalaryPeriodForEmploymentType } from "@/lib/jobs/salary";
import { mapEmploymentTypeToSchema } from "@/lib/jobs/utils";
import type { JobDocument } from "@/types";

export function JobPostingJsonLd({ job }: { job: JobDocument }) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: `${job.overview}\n\n${job.summary}`,
    datePosted: job.publishedAt || job.createdAt,
    employmentType: mapEmploymentTypeToSchema(job.employmentType),
    hiringOrganization: {
      "@type": "Organization",
      name: siteConfig.companyName,
      sameAs: siteConfig.mainWebsiteUrl,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
      },
    },
    applicantLocationRequirements: {
      "@type": "Country",
      name: job.remoteType === "remote" ? "Worldwide" : job.location,
    },
  };

  if (job.applicationDeadline) {
    jsonLd.validThrough = job.applicationDeadline;
  }

  if (job.salaryMin || job.salaryMax) {
    const period =
      job.salaryPeriod ?? getSalaryPeriodForEmploymentType(job.employmentType);
    jsonLd.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salaryCurrency || "USD",
      value: {
        "@type": "QuantitativeValue",
        minValue: job.salaryMin,
        maxValue: job.salaryMax,
        unitText: getSalaryPeriodLabel(period),
      },
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
