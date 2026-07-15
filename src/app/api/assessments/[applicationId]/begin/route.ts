import { NextResponse } from "next/server";
import {
  beginAssessment,
  getAssessmentClientState,
} from "@/lib/assessments/queries";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

interface AssessmentBeginRouteProps {
  params: Promise<{ applicationId: string }>;
}

export async function POST(_request: Request, { params }: AssessmentBeginRouteProps) {
  try {
    const limit = rateLimit(getClientKey(_request, "begin-assessment"), 10, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const { applicationId } = await params;
    const assessment = await beginAssessment(applicationId);
    const clientState = getAssessmentClientState(assessment);

    return NextResponse.json({
      assessment,
      clientState,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to begin assessment";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
