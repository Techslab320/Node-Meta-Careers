import { getEnv } from "@/config/env";

export async function verifyTurnstileToken(token: string): Promise<boolean> {
  const env = getEnv();
  if (!env.TURNSTILE_SECRET_KEY) {
    return true;
  }

  if (!token) {
    return false;
  }

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    },
  );

  if (!response.ok) {
    return false;
  }

  const data = (await response.json()) as { success?: boolean };
  return Boolean(data.success);
}
