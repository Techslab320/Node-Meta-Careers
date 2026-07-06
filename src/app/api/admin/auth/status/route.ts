import { NextResponse } from "next/server";
import { isAdminAuthConfigured } from "@/lib/auth/admin-credentials";

export async function GET() {
  return NextResponse.json({
    configured: isAdminAuthConfigured(),
  });
}
