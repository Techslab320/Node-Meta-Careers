import { NextResponse } from "next/server";
import { loadAvatarBytes } from "@/lib/uploads/avatar-storage";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const avatar = await loadAvatarBytes(`mongo-avatar://${id}`);
  if (!avatar) {
    return NextResponse.json({ error: "Avatar not found" }, { status: 404 });
  }

  return new NextResponse(new Uint8Array(avatar.buffer), {
    headers: {
      "Content-Type": avatar.contentType,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
