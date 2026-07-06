import path from "path";
import { randomUUID } from "crypto";
import {
  ALLOWED_RESUME_EXTENSIONS,
  MAX_RESUME_SIZE,
  validateResumeFile,
} from "@/lib/validation/application";

export const LOCAL_RESUME_PREFIX = "local-resume://";
export const MONGO_RESUME_PREFIX = "mongo-resume://";

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

async function uploadResumeToBlob(file: File, token: string) {
  const { put } = await import("@vercel/blob");
  const safeName = sanitizeFilename(file.name);
  const pathname = `resumes/${randomUUID()}-${safeName}`;

  const blob = await put(pathname, file, {
    access: "public",
    token,
    contentType: file.type || "application/octet-stream",
  });

  return {
    url: blob.url,
    filename: safeName,
  };
}

async function uploadResumeToMongo(file: File) {
  const { connectDB } = await import("@/lib/database/mongodb");
  const { ResumeFileModel } = await import("@/models/ResumeFile");
  const safeName = sanitizeFilename(file.name);
  const buffer = Buffer.from(await file.arrayBuffer());

  await connectDB();
  const resumeFile = await ResumeFileModel.create({
    filename: safeName,
    contentType: file.type || "application/octet-stream",
    data: buffer,
  });

  return {
    url: `${MONGO_RESUME_PREFIX}${resumeFile._id.toString()}`,
    filename: safeName,
  };
}

async function uploadResumeLocally(file: File) {
  const { mkdir, writeFile } = await import("fs/promises");
  const path = await import("path");
  const localResumeDir = path.join(process.cwd(), ".data", "resumes");
  const safeName = sanitizeFilename(file.name);
  const storedName = `${randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  await mkdir(localResumeDir, { recursive: true });
  await writeFile(path.join(localResumeDir, storedName), buffer);

  return {
    url: `${LOCAL_RESUME_PREFIX}${storedName}`,
    filename: safeName,
  };
}

export function isLocalResumeUrl(url: string): boolean {
  return url.startsWith(LOCAL_RESUME_PREFIX);
}

export function isMongoResumeUrl(url: string): boolean {
  return url.startsWith(MONGO_RESUME_PREFIX);
}

export function getLocalResumePath(url: string): string {
  const storedName = url.slice(LOCAL_RESUME_PREFIX.length);
  const safeStoredName = path.basename(storedName);
  return path.join(process.cwd(), ".data", "resumes", safeStoredName);
}

export function getMongoResumeId(url: string): string {
  return url.slice(MONGO_RESUME_PREFIX.length);
}

export async function uploadResume(file: File): Promise<{
  url: string;
  filename: string;
}> {
  const validationError = validateResumeFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const extension = getExtension(file.name);
  if (
    !ALLOWED_RESUME_EXTENSIONS.includes(
      extension as (typeof ALLOWED_RESUME_EXTENSIONS)[number],
    )
  ) {
    throw new Error("Invalid resume file extension");
  }

  if (file.size > MAX_RESUME_SIZE) {
    throw new Error("Resume exceeds maximum size of 10 MB");
  }

  if (hasBlobToken()) {
    return uploadResumeToBlob(file, process.env.BLOB_READ_WRITE_TOKEN!.trim());
  }

  if (hasMongoUri()) {
    return uploadResumeToMongo(file);
  }

  if (process.env.NODE_ENV === "development") {
    return uploadResumeLocally(file);
  }

  throw new Error(
    "Resume uploads are not configured. Set BLOB_READ_WRITE_TOKEN or MONGODB_URI.",
  );
}
