import { NextResponse } from "next/server";
import { z } from "zod";
import { isTelegramNotifyEnabled } from "@/config/env";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";
import { sendVisitorTelegram } from "@/lib/telegram/notify";
import { resolveVisitorGeo } from "@/lib/telegram/visitor-geo";

export const runtime = "nodejs";

const visitSchema = z.object({
  path: z.string().min(1).max(500),
  referrer: z.string().max(1000).optional(),
  os: z.string().max(120).optional(),
  browser: z.string().max(120).optional(),
  wallets: z.array(z.string().max(80)).max(20).optional(),
  userAgent: z.string().max(500).optional(),
});

function headerValue(request: Request, name: string): string | undefined {
  const value = request.headers.get(name)?.trim();
  return value || undefined;
}

export async function POST(request: Request) {
  try {
    if (!isTelegramNotifyEnabled()) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: "telegram_disabled",
      });
    }

    const limit = rateLimit(getClientKey(request, "visit-notify"), 30, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body = await request.json().catch(() => null);
    const parsed = visitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid visit payload" }, { status: 400 });
    }

    const data = parsed.data;
    const geo = await resolveVisitorGeo(request);

    const sent = await sendVisitorTelegram({
      path: data.path,
      referrer: data.referrer,
      os: data.os,
      browser: data.browser,
      wallets: data.wallets,
      userAgent: data.userAgent || headerValue(request, "user-agent"),
      ip: geo.ip,
      country: geo.country,
      region: geo.region,
      city: geo.city,
    });

    if (!sent) {
      return NextResponse.json(
        { ok: false, error: "telegram_send_failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, sent: true });
  } catch (error) {
    console.error("Visit notify route error:", error);
    return NextResponse.json({ error: "Failed to record visit" }, { status: 500 });
  }
}
