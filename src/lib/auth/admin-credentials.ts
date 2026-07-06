import { timingSafeEqual } from "crypto";
import { getEnv, readAuthSecretFromProcessEnv } from "@/config/env";

function safeEqualString(expected: string, provided: string) {
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, providedBuffer);
}

export function normalizeAdminPasswordHash(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  let hash = value.trim();
  if (!hash) {
    return undefined;
  }

  // Repair hashes copied from .env.local with escaped dollar signs.
  hash = hash.replace(/\\\$/g, "$");

  if (!/^\$2[aby]\$/.test(hash)) {
    return undefined;
  }

  return hash;
}

export function getAdminPasswordHash(): string | undefined {
  return normalizeAdminPasswordHash(process.env.ADMIN_PASSWORD_HASH);
}

export function getAdminPlainPassword(): string | undefined {
  const value = process.env.ADMIN_PASSWORD?.trim();
  return value || undefined;
}

export function isAdminAuthConfigured(): boolean {
  const env = getEnv();
  const hasSecret =
    Boolean(env.AUTH_SECRET || readAuthSecretFromProcessEnv()) ||
    env.NODE_ENV === "development";

  return Boolean(
    env.ADMIN_EMAIL &&
      (getAdminPasswordHash() || getAdminPlainPassword()) &&
      hasSecret,
  );
}

export async function verifyAdminPassword(
  password: string,
  bcryptCompare: (password: string, hash: string) => Promise<boolean>,
): Promise<boolean> {
  const plainPassword = getAdminPlainPassword();
  if (plainPassword && safeEqualString(plainPassword, password)) {
    return true;
  }

  const hash = getAdminPasswordHash();
  if (hash) {
    return bcryptCompare(password, hash);
  }

  return false;
}
