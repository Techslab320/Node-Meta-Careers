import path from "path";
import { randomUUID } from "crypto";
import {
  isLocalAvatarUrl,
  isMongoAvatarUrl,
  LOCAL_AVATAR_PREFIX,
  MONGO_AVATAR_PREFIX,
} from "@/lib/uploads/avatar-constants";

const ALLOWED_AVATAR_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"] as const;
const MAX_AVATAR_SIZE = 2 * 1024 * 1024;

function getExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function hasMongoUri(): boolean {
  return Boolean(process.env.MONGODB_URI?.trim());
}

function hasBlobToken(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN?.trim());
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
  const { put } = await import("@vercel/blob");
  const safeName = sanitizeFilename(file.name);
  const pathname = `avatars/${randomUUID()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "public",
    token,
    contentType: file.type || "application/octet-stream",
  });

  return { url: blob.url, filename: safeName };
}

async function uploadAvatarToMongo(file: File) {
  const { connectDB } = await import("@/lib/database/mongodb");
  const { AvatarFileModel } = await import("@/models/AvatarFile");
  const safeName = sanitizeFilename(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  await connectDB();
  const avatarFile = await AvatarFileModel.create({
    filename: safeName,
    contentType: file.type || "application/octet-stream",
    data: buffer,
  });

  return {
    url: `${MONGO_AVATAR_PREFIX}${avatarFile._id.toString()}`,
    filename: safeName,
  };
}

async function uploadAvatarLocally(file: File) {
  const { mkdir, writeFile } = await import("fs/promises");
  const localAvatarDir = path.join(process.cwd(), ".data", "avatars");
  const safeName = sanitizeFilename(file.name);
  const storedName = `${randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(localAvatarDir, { recursive: true });
  await writeFile(path.join(localAvatarDir, storedName), buffer);

  return {
    url: `${LOCAL_AVATAR_PREFIX}${storedName}`,
    filename: safeName,
  };
}

export {
  isLocalAvatarUrl,
  isMongoAvatarUrl,
  LOCAL_AVATAR_PREFIX,
  MONGO_AVATAR_PREFIX,
} from "@/lib/uploads/avatar-constants";

export function getLocalAvatarPath(url: string): string {
  const storedName = url.slice(LOCAL_AVATAR_PREFIX.length);
  const safeStoredName = path.basename(storedName);
  return path.join(process.cwd(), ".data", "avatars", safeStoredName);
}

export async function uploadAvatar(file: File): Promise<{ url: string; filename: string }> {
  const validationError = validateAvatarFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  if (hasBlobToken()) {
    return uploadAvatarToBlob(file, process.env.BLOB_READ_WRITE_TOKEN!.trim());
  }

  if (hasMongoUri()) {
    return uploadAvatarToMongo(file);
  }

  if (process.env.NODE_ENV === "development") {
    return uploadAvatarLocally(file);
  }

  throw new Error(
    "Avatar uploads are not configured. Set BLOB_READ_WRITE_TOKEN or MONGODB_URI.",
  );
}
