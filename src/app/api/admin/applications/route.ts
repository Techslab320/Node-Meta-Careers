import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getApplications } from "@/lib/applications/queries";
import type { AdminApplicationFilters } from "@/types";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filters: AdminApplicationFilters = {
    search: searchParams.get("search") || undefined,
    jobId: searchParams.get("jobId") || undefined,
    status: searchParams.get("status") || undefined,
    country: searchParams.get("country") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  };

  const applications = await getApplications(filters);
  return NextResponse.json({ applications });
}
