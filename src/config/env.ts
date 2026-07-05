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

  if (normalized.length > 0 && !/^\$2[aby]\$/.test(normalized)) {
    console.error(
      "ADMIN_PASSWORD_HASH looks corrupted. Escape each $ in .env.local as \\$ (example: \\$2b\\$12\\$...).",
    );
  }

  return normalized;
}
const optionalEmail = z.preprocess(
  emptyToUndefined,
  z.string().email().optional(),
);
const optionalUrl = z.preprocess(emptyToUndefined, z.string().url().optional());

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: optionalUrl,
  NEXT_PUBLIC_MAIN_WEBSITE_URL: z.preprocess(
    emptyToUndefined,
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
  if (env.AUTH_SECRET) {
    return env.AUTH_SECRET;
  }

  if (env.NODE_ENV === "development") {
    return "local-development-auth-secret-min-32-characters";
  }

  throw new Error("AUTH_SECRET is required in production");
}

export function isAdminAuthConfigured(): boolean {
  const env = getEnv();
  const hasSecret = Boolean(env.AUTH_SECRET) || env.NODE_ENV === "development";
  return Boolean(env.ADMIN_EMAIL && env.ADMIN_PASSWORD_HASH && hasSecret);
}
