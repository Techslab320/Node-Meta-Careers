import { readFile } from "fs/promises";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { isLocalAvatarUrl, LOCAL_AVATAR_PREFIX } from "@/lib/uploads/avatar-constants";
import { getLocalAvatarPath } from "@/lib/uploads/avatar";
import { getAvatarContentType } from "@/lib/uploads/avatar-storage";


export const runtime = "nodejs";
interface RouteParams {
  params: Promise<{ filename: string }>;
}

function getContentType(filename: string): string {
  return getAvatarContentType(filename);
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename } = await params;
  const avatarUrl = `${LOCAL_AVATAR_PREFIX}${decodeURIComponent(filename)}`;

  if (!isLocalAvatarUrl(avatarUrl)) {
    return NextResponse.json({ error: "Invalid avatar path" }, { status: 400 });
  }

  try {
    const buffer = await readFile(getLocalAvatarPath(avatarUrl));
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": getContentType(filename),
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }
}
