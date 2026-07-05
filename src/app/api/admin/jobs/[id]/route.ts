import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/database/mongodb";
import { JobModel } from "@/models/Job";
import { serializeJob } from "@/lib/jobs/utils";
import { jobSchema, jobStatusSchema } from "@/lib/validation/job";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const job = await JobModel.findById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({ job: serializeJob(job) });
}

export async function PUT(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid job data" },
        { status: 400 },
      );
    }

    await connectDB();
    const job = await JobModel.findById(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const wasPublished = job.status === "published";
    Object.assign(job, parsed.data);
    if (parsed.data.status === "published" && !wasPublished) {
      job.publishedAt = new Date();
    }
    await job.save();

    return NextResponse.json({ job: serializeJob(job) });
  } catch (error) {
    console.error("Failed to update job", error);
    return NextResponse.json({ error: "Unable to update job" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const parsed = jobStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await connectDB();
    const job = await JobModel.findById(id);
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    job.status = parsed.data.status;
    if (parsed.data.status === "published" && !job.publishedAt) {
      job.publishedAt = new Date();
    }
    await job.save();

    return NextResponse.json({ job: serializeJob(job) });
  } catch {
    return NextResponse.json({ error: "Unable to update status" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const job = await JobModel.findById(id);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  if (job.status !== "draft") {
    return NextResponse.json(
      { error: "Only draft jobs can be deleted" },
      { status: 400 },
    );
  }

  await job.deleteOne();
  return NextResponse.json({ success: true });
}
