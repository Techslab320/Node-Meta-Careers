import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-800/80 bg-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <Logo href={null} />
          <p className="mt-4 text-sm text-slate-400">{siteConfig.companyDescription}</p>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Careers</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <Link href="/jobs" className="hover:text-cyan-300">
                Open Positions
              </Link>
            </li>
            <li>
              <Link href="/recruitment-fraud" className="hover:text-cyan-300">
                Recruitment Safety
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Legal</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li>
              <Link href="/privacy" className="hover:text-cyan-300">
                Privacy Notice
              </Link>
            </li>
            <li>
              <Link
                href={siteConfig.mainWebsiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-300"
              >
                Official Website
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800/80 px-4 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()}{" "}
        <span className="text-white">NODE</span>
        <span className="text-[#2ec4b6]">META</span>. All rights reserved.
      </div>
    </footer>
  );
}
