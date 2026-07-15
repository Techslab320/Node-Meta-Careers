import { NextResponse } from "next/server";
import {
  getAssessmentByApplicationId,
  getAssessmentClientState,
} from "@/lib/assessments/queries";

export const runtime = "nodejs";

interface AssessmentRouteProps {
  params: Promise<{ applicationId: string }>;
}

export async function GET(_request: Request, { params }: AssessmentRouteProps) {
  try {
    const { applicationId } = await params;
    const assessment = await getAssessmentByApplicationId(applicationId);

    if (!assessment) {
      return NextResponse.json({ error: "Assessment not found" }, { status: 404 });
    }

    const clientState = getAssessmentClientState(assessment);

    return NextResponse.json({
      assessment,
      clientState,
    });
  } catch {
    return NextResponse.json({ error: "Unable to load assessment" }, { status: 500 });
  }
}
