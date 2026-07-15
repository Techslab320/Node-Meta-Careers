import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminBasePath, adminLoginPath, isAdminPagePath } from "@/config/admin";
import { auth } from "@/lib/auth/auth";

function withPathnameHeader(request: NextRequest, pathname: string) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);
  return requestHeaders;
}

export async function proxy(request: NextRequest) {
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

  return NextResponse.next({
    request: {
      headers: withPathnameHeader(request, pathname),
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)$).*)",
  ],
};
