import { NextResponse } from "next/server";
import { submitAssessment } from "@/lib/assessments/queries";
import {
  assessmentSubmitSchema,
  validateManualAssessmentAnswers,
} from "@/lib/validation/assessment";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

interface AssessmentSubmitRouteProps {
  params: Promise<{ applicationId: string }>;
}

export async function POST(request: Request, { params }: AssessmentSubmitRouteProps) {
  try {
    const limit = rateLimit(getClientKey(request, "submit-assessment"), 10, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const { applicationId } = await params;
    const body = await request.json();
    const parsed = assessmentSubmitSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid submission" },
        { status: 400 },
      );
    }

    const { answers, expired } = parsed.data;

    if (!expired) {
      const validationError = validateManualAssessmentAnswers(answers);
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
    }

    const assessment = await submitAssessment(applicationId, answers, { expired });

    return NextResponse.json({
      success: true,
      assessment,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to submit assessment";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
