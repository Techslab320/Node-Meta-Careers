import { NextResponse } from "next/server";
import { connectDB } from "@/lib/database/mongodb";
import { getPublishedJobs } from "@/lib/jobs/queries";
import type { JobFilters } from "@/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filters: JobFilters = {
      search: searchParams.get("search") || undefined,
      department: searchParams.get("department") || undefined,
      employmentType: searchParams.get("employmentType") || undefined,
      experienceLevel: searchParams.get("experienceLevel") || undefined,
      location: searchParams.get("location") || undefined,
      remoteType: searchParams.get("remoteType") || undefined,
    };

    await connectDB();
    const jobs = await getPublishedJobs(filters);
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Failed to fetch jobs", error);
    return NextResponse.json({ error: "Unable to fetch jobs" }, { status: 500 });
  }
}
