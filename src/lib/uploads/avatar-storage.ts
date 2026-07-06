import { readFile } from "fs/promises";
import path from "path";
import { connectDB } from "@/lib/database/mongodb";
import { AvatarFileModel } from "@/models/AvatarFile";
import { getLocalAvatarPath, isLocalAvatarUrl } from "@/lib/uploads/avatar";
import { getMongoAvatarId, isMongoAvatarUrl } from "@/lib/uploads/avatar-constants";

export function getAvatarContentType(filename: string): string {
  const extension = path.extname(filename).toLowerCase();
  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
}

export async function loadAvatarBytes(avatarUrl: string): Promise<{
  buffer: Buffer;
  contentType: string;
} | null> {
  if (isMongoAvatarUrl(avatarUrl)) {
    await connectDB();
    const avatarFile = await AvatarFileModel.findById(getMongoAvatarId(avatarUrl)).select(
      "data contentType filename",
    );
    if (!avatarFile?.data) return null;
    return {
      buffer: avatarFile.data,
      contentType: avatarFile.contentType || getAvatarContentType(avatarFile.filename),
    };
  }

  if (isLocalAvatarUrl(avatarUrl)) {
    try {
      const buffer = await readFile(getLocalAvatarPath(avatarUrl));
      const filename = avatarUrl.split("/").pop() || "avatar.jpg";
      return {
        buffer,
        contentType: getAvatarContentType(filename),
      };
    } catch {
      return null;
    }
  }

  return null;
}
