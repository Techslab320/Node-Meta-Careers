import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { getLocalAvatarPath, isLocalAvatarUrl } from "@/lib/uploads/avatar";


export const runtime = "nodejs";
interface RouteParams {
  params: Promise<{ filename: string }>;
}

function getContentType(filename: string): string {
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

export async function GET(_request: Request, { params }: RouteParams) {
  const { filename } = await params;
  const avatarUrl = `local-avatar://${decodeURIComponent(filename)}`;

  if (!isLocalAvatarUrl(avatarUrl)) {
    return NextResponse.json({ error: "Invalid avatar path" }, { status: 400 });
  }

  try {
    const buffer = await readFile(getLocalAvatarPath(avatarUrl));
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": getContentType(filename),
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }
}
