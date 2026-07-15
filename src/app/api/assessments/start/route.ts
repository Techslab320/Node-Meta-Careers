import { NextResponse } from "next/server";
import { getAssessmentClientState, startAssessment } from "@/lib/assessments/queries";
import { isAssessmentRole } from "@/data/assessments";
import { assessmentStartSchema } from "@/lib/validation/assessment";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const limit = rateLimit(getClientKey(request, "start-assessment"), 10, 60 * 60 * 1000);
    if (!limit.success) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const body = await request.json();
    const parsed = assessmentStartSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid request" },
        { status: 400 },
      );
    }

    const { applicationId, jobSlug } = parsed.data;

    if (!isAssessmentRole(jobSlug)) {
      return NextResponse.json(
        { error: "This role does not require an assessment." },
        { status: 400 },
      );
    }

    const assessment = await startAssessment(applicationId, jobSlug);
    const clientState = getAssessmentClientState(assessment);

    return NextResponse.json({
      assessment,
      clientState,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to start assessment";
    const isDuplicate =
      typeof error === "object" &&
      error !== null &&
      ("code" in error
        ? (error as { code?: number }).code === 11000
        : message.includes("E11000"));
    const userMessage = isDuplicate
      ? "Your assessment is already prepared. Please refresh the page."
      : message.includes("E11000") || message.includes("Mongo")
        ? "Unable to prepare assessment. Please refresh and try again."
        : message;
    const status = userMessage.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: userMessage }, { status });
  }
}
