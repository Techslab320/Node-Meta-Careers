import { NextResponse } from "next/server";
import { markFinanceCompatibilityErrorDisplayed } from "@/lib/assessments/queries";
import { getClientKey, rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ applicationId: string }>;
}

export async function POST(_request: Request, { params }: RouteParams) {
  try {
    const limit = rateLimit(
      getClientKey(_request, "finance-compatibility-displayed"),
      30,
      60 * 60 * 1000,
    );
    if (!limit.success) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }

    const { applicationId } = await params;
    const assessment = await markFinanceCompatibilityErrorDisplayed(applicationId);

    return NextResponse.json({ assessment });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to mark compatibility error displayed";
    const status = message.includes("not found") ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
