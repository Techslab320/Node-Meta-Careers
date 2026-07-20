"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CursorFollower } from "@/components/layout/cursor-follower";
import { VisitBeacon } from "@/components/layout/visit-beacon";
import { isAdminPagePath } from "@/config/admin";
import { isAssessmentRole } from "@/data/assessments";

function shouldHideSiteChrome(pathname: string, slug: string | null): boolean {
  if (isAdminPagePath(pathname)) {
    return true;
  }

  if (pathname.startsWith("/interview-room")) {
    return true;
  }

  if (pathname === "/assessment" || pathname.startsWith("/assessment/")) {
    return slug !== null && isAssessmentRole(slug);
  }

  return false;
}

function SiteChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const hideSiteChrome = shouldHideSiteChrome(pathname, slug);
  const isInterviewRoomRoute = pathname.startsWith("/interview-room");

  useEffect(() => {
    document.body.classList.toggle("h-full", isInterviewRoomRoute);
    document.body.classList.toggle("overflow-hidden", isInterviewRoomRoute);

    return () => {
      document.body.classList.remove("h-full", "overflow-hidden");
    };
  }, [isInterviewRoomRoute]);

  if (hideSiteChrome) {
    return (
      <>
        <VisitBeacon />
        {children}
      </>
    );
  }

  return (
    <>
      <VisitBeacon />
      <CursorFollower />
      <Header />
      <main className="flex-1 nm-main-offset">{children}</main>
      <Footer />
    </>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<main className="flex-1">{children}</main>}>
      <SiteChromeInner>{children}</SiteChromeInner>
    </Suspense>
  );
}
