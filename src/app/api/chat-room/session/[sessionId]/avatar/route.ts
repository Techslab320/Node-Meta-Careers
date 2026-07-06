import { NextResponse } from "next/server";
import { getCandidateSessionTokenFromRequest } from "@/lib/chat-room/candidate-session-auth";
import { getAuthorizedCandidateSession, updateCandidateAvatarUrl } from "@/lib/chat-room/sessions";
import { uploadAvatar } from "@/lib/uploads/avatar";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";


export const runtime = "nodejs";
interface RouteParams {
  params: Promise<{ sessionId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const limit = rateLimit(getClientKey(request, "candidate-avatar"), 10, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many upload attempts" }, { status: 429 });
    }

    const { sessionId } = await params;
    const token = getCandidateSessionTokenFromRequest(request);
    const session = await getAuthorizedCandidateSession(sessionId, token);
    if (!session) {
      return NextResponse.json({ error: "Session not found or access denied" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Avatar file is required" }, { status: 400 });
    }

    const upload = await uploadAvatar(file);
    const updated = await updateCandidateAvatarUrl(sessionId, upload.url);
    if (!updated) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      url: upload.url,
      candidateAvatarUrl: updated.candidateAvatarUrl,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed" },
      { status: 400 },
    );
  }
}
