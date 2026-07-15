"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/jobs", label: "Open Positions" },
  { href: "/#hiring-process", label: "Hiring Process" },
  { href: "/recruitment-fraud", label: "Recruitment Safety" },
  { href: siteConfig.mainWebsiteUrl, label: "About NodeMeta", external: true },
] as const;

function MegaphoneIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 576 512"
      className="h-4 w-4 shrink-0"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: "rgb(251, 191, 36)" }}
      aria-hidden
    >
      <path d="M576 240c0-23.63-12.95-44.04-32-55.12V32.01C544 23.26 537.02 0 512 0c-7.12 0-14.19 2.38-19.98 7.02l-85.03 68.03C364.28 109.19 310.66 128 256 128H64c-35.35 0-64 28.65-64 64v96c0 35.35 28.65 64 64 64h33.7c-1.39 10.48-2.18 21.14-2.18 32 0 39.77 9.26 77.35 25.56 110.94 5.19 10.69 16.52 17.06 28.4 17.06h74.28c26.05 0 41.69-29.84 25.9-50.56-16.4-21.52-26.15-48.36-26.15-77.44 0-11.11 1.62-21.79 4.41-32H256c54.66 0 108.28 18.81 150.98 52.95l85.03 68.03a32.023 32.023 0 0 0 19.98 7.02c24.92 0 32-22.78 32-32V295.13C563.05 284.04 576 263.63 576 240zm-96 141.42l-33.05-26.44C392.95 311.78 325.12 288 256 288v-96c69.12 0 136.95-23.78 190.95-66.98L480 98.58v282.84z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth="2"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 448 512"
      className="h-3.5 w-3.5"
      height="1em"
      width="1em"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path d="M152 64H296V24C296 10.7 306.7 0 320 0C333.3 0 344 10.7 344 24V64H384C419.3 64 448 92.7 448 128V448C448 483.3 419.3 512 384 512H64C28.7 512 0 483.3 0 448V128C0 92.7 28.7 64 64 64H104V24C104 10.7 114.7 0 128 0C141.3 0 152 10.7 152 24V64zM48 448C48 456.8 55.2 464 64 464H384C392.8 464 400 456.8 400 448V192H48V448z" />
    </svg>
  );
}

export function SiteNavbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const announcementDate = "Sun Jul 12 2026";

  return (
    <nav id="navbar">
      <div className="nm-nav-row">
        <div className="nm-container">
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src="/images/nodemeta.png"
              alt="NodeMeta"
              width={38}
              height={38}
              priority
              className="shrink-0 rounded-full object-cover"
            />
            <span className="brand-logo-text">
              NODE<span className="brand-meta-text">META</span>
            </span>
          </Link>

          <div className="hidden items-center gap-[40px] text-[14.5px] font-semibold text-[var(--text-dim)] md:flex">
            {navLinks.map((link) => {
              const isActive =
                !("external" in link) &&
                (link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href.replace("/#", "/")));

              if ("external" in link && link.external) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors duration-200 hover:text-[var(--text)]"
                  >
                    {link.label}
                  </a>
                );
              }

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "transition-colors duration-200 hover:text-[var(--text)]",
                    isActive && "text-[var(--text)]",
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:block">
            <Link href="/jobs" className="btn-primary !px-5 !py-2.5 !text-sm">
              <BriefcaseIcon />
              View Open Positions
            </Link>
          </div>

          <button
            type="button"
            className="relative z-50 cursor-pointer rounded-lg p-2 text-white transition-all duration-300 hover:bg-gray-800/50 hover:text-[var(--violet-light)] md:hidden"
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
          >
            <svg
              stroke="currentColor"
              fill="none"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
              height="24"
              width="24"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              {mobileOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="border-b border-[var(--border)] bg-[rgba(8,6,13,0.95)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) =>
              "external" in link && link.external ? (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-[var(--text-dim)] hover:text-[var(--text)]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-[var(--text-dim)] hover:text-[var(--text)]"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ),
            )}
            <Link
              href="/jobs"
              className="btn-primary !px-5 !py-2.5 !text-sm"
              onClick={() => setMobileOpen(false)}
            >
              <BriefcaseIcon />
              View Open Positions
            </Link>
          </div>
        </div>
      ) : null}

      <div className="nm-announcement-bar">
        <div
          className="nm-container flex items-center justify-between gap-4"
          style={{ display: "flex" }}
        >
          <div
            title="Click to view full announcement details"
            className="group nm-announcement-inline flex min-w-0 flex-1 cursor-pointer items-center gap-2 overflow-hidden sm:gap-3"
          >
            <MegaphoneIcon />
            <span
              className="mono shrink-0 font-bold uppercase"
              style={{
                fontSize: "11px",
                letterSpacing: "0.08em",
                color: "rgb(251, 191, 36)",
                border: "1px solid rgba(251, 191, 36, 0.3)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              Notice
            </span>
            <span className="shrink-0 text-[13px] font-semibold text-white">Official Announcement</span>
            <span
              className="min-w-0 truncate text-[13px] text-[var(--text-dim)] transition-colors duration-200 group-hover:text-white"
            >
              NodeMeta becoming a best blockchain platform for the future, stay tuned and get ready
              for the big reveal!
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-0.5 text-[10px] font-bold text-[var(--violet-light)] shadow-[0_0_10px_rgba(139,92,246,0.15)] transition-all duration-300 group-hover:border-violet-500/50 group-hover:bg-violet-500/20">
              <span>View Announcement</span>
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
            </span>
          </div>
          <div
            className="flex shrink-0 items-center gap-1.5 text-[12px] text-[var(--text-faint)]"
            style={{ flexShrink: 0 }}
          >
            <CalendarIcon />
            <span>{announcementDate}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
