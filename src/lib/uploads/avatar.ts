import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { getEnv } from "@/config/env";
import { LOCAL_AVATAR_PREFIX } from "@/lib/uploads/avatar-constants";

const LOCAL_AVATAR_DIR = path.join(process.cwd(), ".data", "avatars");
const ALLOWED_AVATAR_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"] as const;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

function getExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function validateAvatarFile(file: File): string | null {
  const extension = getExtension(file.name);
  if (!ALLOWED_AVATAR_EXTENSIONS.includes(extension as (typeof ALLOWED_AVATAR_EXTENSIONS)[number])) {
    return "Avatar must be a JPG, PNG, WEBP, or GIF image.";
  }
  if (!file.type.startsWith("image/")) {
    return "Avatar must be an image file.";
  }
  if (file.size > MAX_AVATAR_SIZE) {
    return "Avatar exceeds maximum size of 2 MB.";
  }
  return null;
}

async function uploadAvatarToBlob(file: File, token: string) {
  const safeName = sanitizeFilename(file.name);
  const pathname = `avatars/${randomUUID()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "public",
    token,
    contentType: file.type || "application/octet-stream",
  });

  return { url: blob.url, filename: safeName };
}

async function uploadAvatarLocally(file: File) {
  await mkdir(LOCAL_AVATAR_DIR, { recursive: true });
  const safeName = sanitizeFilename(file.name);
  const storedName = `${randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(LOCAL_AVATAR_DIR, storedName), buffer);

  return {
    url: `${LOCAL_AVATAR_PREFIX}${storedName}`,
    filename: safeName,
  };
}

export { isLocalAvatarUrl, LOCAL_AVATAR_PREFIX } from "@/lib/uploads/avatar-constants";

export function getLocalAvatarPath(url: string): string {
  const storedName = url.slice(LOCAL_AVATAR_PREFIX.length);
  const safeStoredName = path.basename(storedName);
  return path.join(LOCAL_AVATAR_DIR, safeStoredName);
}

export async function uploadAvatar(file: File): Promise<{ url: string; filename: string }> {
  const validationError = validateAvatarFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const env = getEnv();
  if (env.BLOB_READ_WRITE_TOKEN) {
    return uploadAvatarToBlob(file, env.BLOB_READ_WRITE_TOKEN);
  }

  if (env.NODE_ENV === "development") {
    return uploadAvatarLocally(file);
  }

  throw new Error(
    "Avatar uploads are not configured. Set BLOB_READ_WRITE_TOKEN or run in development mode.",
  );
}
