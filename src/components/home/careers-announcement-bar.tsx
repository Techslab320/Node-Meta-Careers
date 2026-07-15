import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { careersAnnouncement } from "@/config/site";

export function CareersAnnouncementBar() {
  return (
    <div className="border-b border-white/5 bg-[#05010d]/95">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <span className="shrink-0 rounded-md bg-blue-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
            {careersAnnouncement.badge}
          </span>
          <p className="text-sm leading-6 text-slate-300">
            {careersAnnouncement.message}{" "}
            <Link
              href={careersAnnouncement.href}
              className="inline-flex items-center gap-1 font-medium text-brand-light hover:text-white"
            >
              {careersAnnouncement.linkLabel}
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </p>
        </div>
        <p className="shrink-0 text-xs text-slate-500 sm:text-sm">{careersAnnouncement.date}</p>
      </div>
    </div>
  );
}
