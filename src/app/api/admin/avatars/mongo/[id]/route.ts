import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { loadAvatarBytes } from "@/lib/uploads/avatar-storage";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const avatar = await loadAvatarBytes(`mongo-avatar://${id}`);
  if (!avatar) {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(avatar.buffer), {
    headers: {
      "Content-Type": avatar.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
