import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { uploadAvatar } from "@/lib/uploads/avatar";


export const runtime = "nodejs";
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Avatar file is required" }, { status: 400 });
    }

    const result = await uploadAvatar(file);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
