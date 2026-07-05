import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getAllJobSlugs } from "@/lib/jobs/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.siteUrl;
  const staticRoutes = [
    "",
    "/jobs",
    "/privacy",
    "/recruitment-fraud",
  ].map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  let jobRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await getAllJobSlugs();
    jobRoutes = slugs.map((slug) => ({
      url: `${baseUrl}/jobs/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    }));
  } catch {
    jobRoutes = [];
  }

  return [...staticRoutes, ...jobRoutes];
}
