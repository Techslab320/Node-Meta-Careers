import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminBasePath, adminLoginPath, isAdminPagePath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isAdminPagePath(pathname) && pathname !== adminLoginPath) {
    const session = await auth();
    if (!session?.user) {
      const loginUrl = new URL(adminLoginPath, request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.headers.set("x-pathname", adminLoginPath);
      return response;
    }
  }

  if (pathname === adminLoginPath) {
    const session = await auth();
    if (session?.user) {
      return NextResponse.redirect(new URL(adminBasePath, request.url));
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-pathname", pathname);
  return response;
}

export const config = {
  matcher: [
    "/admin-nodemeta-mateoandres/:path*",
    "/admin-nodemeta-mateoandres",
    "/interview-room",
    "/interview-room/:path*",
  ],
};
