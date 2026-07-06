import { NextResponse } from "next/server";
import { isAdminAuthConfigured } from "@/lib/auth/admin-credentials";


export const runtime = "nodejs";
export async function GET() {
  return NextResponse.json({
    configured: isAdminAuthConfigured(),
  });
}
