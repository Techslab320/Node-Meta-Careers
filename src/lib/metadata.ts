import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

interface PageMetadataOptions {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
}

export function createPageMetadata({
  title,
  description = siteConfig.description,
  path = "",
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const url = `${siteConfig.siteUrl}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function createOrganizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.companyName,
    url: siteConfig.mainWebsiteUrl,
    description: siteConfig.companyDescription,
  };
}
