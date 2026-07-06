import { z } from "zod";

function emptyToUndefined(value: unknown): unknown {
  if (value === "" || value === null) {
    return undefined;
  }
  return value;
}

const optionalString = z.preprocess(emptyToUndefined, z.string().min(1).optional());

function normalizeBcryptHash(value: unknown): unknown {
  const normalized = emptyToUndefined(value);
  if (typeof normalized !== "string") {
    return normalized;
  }

  const repaired = normalized.replace(/\\\$/g, "$");
  if (repaired.length > 0 && !/^\$2[aby]\$/.test(repaired)) {
    console.error(
      "ADMIN_PASSWORD_HASH looks invalid. Use a bcrypt hash like $2b$12$... or set ADMIN_PASSWORD instead.",
    );
    return undefined;
  }

  return repaired;
}
const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().email().optional(),
);
function normalizeOptionalUrl(value: unknown): unknown {
  if (value === "" || value === null || value === undefined) {
    return resolveHostedSiteUrl();
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return resolveHostedSiteUrl();
  }

  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    return parsed.origin;
  } catch {
    return undefined;
  }
}

function resolveHostedSiteUrl(): string | undefined {
  const vercelHost =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (!vercelHost) {
    return undefined;
  }

  const host = vercelHost.replace(/^https?:\/\//i, "").replace(/\/$/, "");
  return host ? `https://${host}` : undefined;
}

const optionalUrl = z.preprocess(normalizeOptionalUrl, z.string().url().optional());

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_MAIN_WEBSITE_URL: z.preprocess(
    normalizeOptionalUrl,
    z.string().url().default("https://www.node-meta.com"),
  ),
  MONGODB_URI: optionalString,
  AUTH_SECRET: z.preprocess(
    emptyToUndefined,
    z.string().min(32).optional(),
  ),
  ADMIN_EMAIL: optionalEmail,
  ADMIN_PASSWORD_HASH: z.preprocess(normalizeBcryptHash, z.string().min(1).optional()),
  BLOB_READ_WRITE_TOKEN: optionalString,
  RESEND_API_KEY: optionalString,
  RECRUITMENT_FROM_EMAIL: optionalEmail,
  RECRUITMENT_NOTIFICATION_EMAIL: optionalEmail,
  RECRUITMENT_CONTACT_EMAIL: optionalEmail,
  TURNSTILE_SITE_KEY: optionalString,
  TURNSTILE_SECRET_KEY: optionalString,
  GROQ_API_KEY: optionalString,
  OPENAI_API_KEY: optionalString,
  DUPLICATE_APPLICATION_HOURS: z.coerce.number().positive().default(24),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;
  cachedEnv = envSchema.parse(process.env);
  return cachedEnv;
}

export function requireEnv<K extends keyof Env>(
  keys: K[],
): Pick<Env, K> {
  const env = getEnv();
  const missing = keys.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
  return env as Pick<Env, K>;
}

export function isTurnstileEnabled(): boolean {
  const env = getEnv();
  return Boolean(env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY);
}

export function isEmailEnabled(): boolean {
  const env = getEnv();
  return Boolean(
    env.RESEND_API_KEY &&
      env.RECRUITMENT_FROM_EMAIL &&
      env.RECRUITMENT_NOTIFICATION_EMAIL,
  );
}

export function getAuthSecret(): string {
  const env = getEnv();
  const secret = env.AUTH_SECRET ?? readAuthSecretFromProcessEnv();

  if (secret) {
    return secret;
  }

  if (env.NODE_ENV === "development") {
    return "local-development-auth-secret-min-32-characters";
  }

  // Lets `next build` finish when hosting env vars are runtime-only.
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return "build-time-auth-secret-minimum-32-characters";
  }

  throw new Error(
    "AUTH_SECRET is required in production. Add AUTH_SECRET (or NEXTAUTH_SECRET) " +
      "as a hosting environment variable with at least 32 random characters.",
  );
}

export function readAuthSecretFromProcessEnv() {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (typeof secret !== "string") {
    return undefined;
  }

  const trimmed = secret.trim();
  return trimmed.length >= 32 ? trimmed : undefined;
}

export function getPublicSiteUrl(): string {
  const normalized = normalizeOptionalUrl(process.env.NEXT_PUBLIC_SITE_URL);
  if (typeof normalized === "string" && normalized) {
    return normalized;
  }
  return resolveHostedSiteUrl() || "http://localhost:3000";
}

export { isAdminAuthConfigured } from "@/lib/auth/admin-credentials";
