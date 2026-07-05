import type { MetadataRoute } from "next";
import { adminBasePath } from "@/config/admin";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [`${adminBasePath}/`, "/api/", "/application-success"],
    },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
