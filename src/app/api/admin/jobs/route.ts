import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { connectDB } from "@/lib/database/mongodb";
import { JobModel } from "@/models/Job";
import { serializeJob } from "@/lib/jobs/utils";
import { jobSchema } from "@/lib/validation/job";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const jobs = await JobModel.find().sort({ updatedAt: -1 });
  return NextResponse.json({ jobs: jobs.map(serializeJob) });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = jobSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid job data" },
        { status: 400 },
      );
    }

    await connectDB();
    const existing = await JobModel.findOne({ slug: parsed.data.slug });
    if (existing) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }

    const job = await JobModel.create({
      ...parsed.data,
      publishedAt: parsed.data.status === "published" ? new Date() : undefined,
    });

    return NextResponse.json({ job: serializeJob(job) }, { status: 201 });
  } catch (error) {
    console.error("Failed to create job", error);
    return NextResponse.json({ error: "Unable to create job" }, { status: 500 });
  }
}
