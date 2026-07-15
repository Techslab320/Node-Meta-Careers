import { NextResponse } from "next/server";
import {
  getAssessmentClientState,
  saveAssessmentAnswers,
} from "@/lib/assessments/queries";
import { assessmentSubmitSchema } from "@/lib/validation/assessment";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

interface AssessmentSaveRouteProps {
  params: Promise<{ applicationId: string }>;
}

export async function POST(request: Request, { params }: AssessmentSaveRouteProps) {
  try {
    const limit = rateLimit(getClientKey(request, "save-assessment"), 60, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const { applicationId } = await params;
    const body = await request.json();
    const parsed = assessmentSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 },
      );
    }

    const assessment = await saveAssessmentAnswers(applicationId, parsed.data.answers);
    const clientState = getAssessmentClientState(assessment);

    return NextResponse.json({
      assessment,
      clientState,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save assessment";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
