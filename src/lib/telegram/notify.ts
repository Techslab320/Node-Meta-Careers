import { getEnv, isTelegramNotifyEnabled } from "@/config/env";

export interface VisitorNotifyPayload {
  path: string;
  referrer?: string;
  ip?: string;
  country?: string;
  region?: string;
  city?: string;
  os?: string;
  browser?: string;
  wallets?: string[];
  userAgent?: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function part(value: string | undefined, fallback = "—"): string {
  const trimmed = (value || "").trim();
  return escapeHtml(trimmed || fallback);
}

export function buildVisitorMessage(payload: VisitorNotifyPayload): string {
  const wallets =
    payload.wallets && payload.wallets.length > 0
      ? payload.wallets.join(", ")
      : "none";

  const location = [payload.country, payload.region, payload.city]
    .map((value) => (value || "").trim())
    .filter(Boolean)
    .join("/");

  // Single compact line for Telegram.
  return [
    "🔔 <b>Visitor</b>",
    part(payload.path),
    part(payload.os),
    part(payload.browser),
    part(location || undefined, "location?"),
    part(payload.ip),
    part(wallets),
    part(payload.referrer || "direct"),
  ].join(" · ");
}

export async function sendVisitorTelegram(
  payload: VisitorNotifyPayload,
): Promise<boolean> {
  if (!isTelegramNotifyEnabled()) {
    return false;
  }

  const env = getEnv();
  const token = env.TELEGRAM_BOT_TOKEN!;
  const chatIdRaw = env.TELEGRAM_CHAT_ID!;
  const chatId = /^-?\d+$/.test(chatIdRaw) ? Number(chatIdRaw) : chatIdRaw;
  const text = buildVisitorMessage(payload);

  const response = await fetch(
    `https://api.telegram.org/bot${token}/sendMessage`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    console.error("Telegram visitor notify failed:", response.status, body);
    return false;
  }

  return true;
}
