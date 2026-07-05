import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/database/mongodb";
import { ApplicationModel } from "@/models/Application";
import { applicationStatusSchema } from "@/lib/validation/application";
import { sanitizeOptionalText } from "@/lib/security/sanitize";
import { getApplicationById, deleteApplicationById } from "@/lib/applications/queries";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({ application });
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = applicationStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid update data" }, { status: 400 });
    }

    await connectDB();
    const application = await ApplicationModel.findById(id);
    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    application.status = parsed.data.status;
    application.recruiterNotes = sanitizeOptionalText(parsed.data.recruiterNotes);
    await application.save();

    return NextResponse.json({
      application: {
        _id: application._id.toString(),
        status: application.status,
        recruiterNotes: application.recruiterNotes,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unable to update application" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const deleted = await deleteApplicationById(id);
    if (!deleted) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unable to delete application" }, { status: 500 });
  }
}
