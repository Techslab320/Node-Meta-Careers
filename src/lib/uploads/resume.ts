import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { getEnv } from "@/config/env";
import {
  ALLOWED_RESUME_EXTENSIONS,
  MAX_RESUME_SIZE,
  validateResumeFile,
} from "@/lib/validation/application";

export const LOCAL_RESUME_PREFIX = "local-resume://";

const LOCAL_RESUME_DIR = path.join(process.cwd(), ".data", "resumes");

function getExtension(filename: string): string {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

function sanitizeFilename(filename: string): string {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "_");
}

async function uploadResumeToBlob(file: File, token: string) {
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

async function uploadResumeLocally(file: File) {
  await mkdir(LOCAL_RESUME_DIR, { recursive: true });
  const safeName = sanitizeFilename(file.name);
  const storedName = `${randomUUID()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(LOCAL_RESUME_DIR, storedName), buffer);

  return {
    url: `${LOCAL_RESUME_PREFIX}${storedName}`,
    filename: safeName,
  };
}

export function isLocalResumeUrl(url: string): boolean {
  return url.startsWith(LOCAL_RESUME_PREFIX);
}

export function getLocalResumePath(url: string): string {
  const storedName = url.slice(LOCAL_RESUME_PREFIX.length);
  const safeStoredName = path.basename(storedName);
  return path.join(LOCAL_RESUME_DIR, safeStoredName);
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

  const env = getEnv();
  if (env.BLOB_READ_WRITE_TOKEN) {
    return uploadResumeToBlob(file, env.BLOB_READ_WRITE_TOKEN);
  }

  if (env.NODE_ENV === "development") {
    return uploadResumeLocally(file);
  }

  throw new Error(
    "Resume uploads are not configured. Set BLOB_READ_WRITE_TOKEN or run in development mode.",
  );
}
