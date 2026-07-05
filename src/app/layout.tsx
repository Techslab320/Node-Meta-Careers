import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { isAdminPagePath } from "@/config/admin";
import { createOrganizationJsonLd, createPageMetadata } from "@/lib/metadata";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = createPageMetadata({
  title: "Node Meta Careers",
  description:
    "Explore open roles at Node Meta and help build secure blockchain infrastructure, decentralized applications, and next-generation Web3 experiences.",
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationJsonLd = createOrganizationJsonLd();
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isAdminRoute = isAdminPagePath(pathname);
  const isInterviewRoomRoute = pathname.startsWith("/interview-room");
  const hideSiteChrome = isAdminRoute || isInterviewRoomRoute;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body
        className={`min-h-full flex flex-col bg-slate-950 text-slate-100 ${
          isInterviewRoomRoute ? "h-full overflow-hidden" : ""
        }`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        {hideSiteChrome ? (
          children
        ) : (
          <>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </>
        )}
      </body>
    </html>
  );
}
