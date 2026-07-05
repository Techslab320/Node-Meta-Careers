import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getApplications } from "@/lib/applications/queries";

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const applications = await getApplications({
    search: searchParams.get("search") || undefined,
    jobId: searchParams.get("jobId") || undefined,
    status: searchParams.get("status") || undefined,
    country: searchParams.get("country") || undefined,
    dateFrom: searchParams.get("dateFrom") || undefined,
    dateTo: searchParams.get("dateTo") || undefined,
  });

  const headers = [
    "ID",
    "Job Title",
    "First Name",
    "Last Name",
    "Email",
    "Country",
    "Status",
    "Created At",
  ];

  const rows = applications.map((application) =>
    [
      application._id,
      application.jobTitle,
      application.firstName,
      application.lastName,
      application.email,
      application.country,
      application.status,
      application.createdAt,
    ]
      .map((value) => escapeCsv(String(value)))
      .join(","),
  );

  const csv = [headers.join(","), ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="applications.csv"',
    },
  });
}
