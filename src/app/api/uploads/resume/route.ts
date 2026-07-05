import { NextResponse } from "next/server";
import { uploadResume } from "@/lib/uploads/resume";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(getClientKey(request, "upload-resume"), 10, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many upload attempts" }, { status: 429 });
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Resume file is required" }, { status: 400 });
    }

    const result = await uploadResume(file);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
