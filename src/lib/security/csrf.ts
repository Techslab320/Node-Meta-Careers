import { headers } from "next/headers";

export async function assertSameOrigin(): Promise<void> {
  const headerList = await headers();
  const origin = headerList.get("origin");
  const host = headerList.get("host");
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  if (!origin || !host) return;

  if (origin.includes(host)) return;

  if (siteUrl && origin === siteUrl) return;

  throw new Error("Invalid request origin");
}
