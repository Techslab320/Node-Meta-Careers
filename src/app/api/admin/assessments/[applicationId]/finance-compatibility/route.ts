import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { setFinanceCompatibilityErrorDisabled } from "@/lib/assessments/queries";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ applicationId: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { applicationId } = await params;
    const body = (await request.json()) as { disabled?: unknown };

    if (typeof body.disabled !== "boolean") {
      return NextResponse.json({ error: "Invalid update data" }, { status: 400 });
    }

    const assessment = await setFinanceCompatibilityErrorDisabled(
      applicationId,
      body.disabled,
    );

    return NextResponse.json({ assessment });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to update finance compatibility error setting";
    const status = message.includes("not found")
      ? 404
      : message.includes("only be disabled after")
        ? 400
        : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
