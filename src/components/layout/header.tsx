import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { siteConfig } from "@/config/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Logo priority />
        <nav aria-label="Main navigation" className="hidden items-center gap-6 md:flex">
          <Link href="/jobs" className="text-sm text-slate-300 hover:text-cyan-300">
            Open Positions
          </Link>
          <Link
            href={siteConfig.mainWebsiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-slate-300 hover:text-cyan-300"
          >
            node-meta.com
          </Link>
        </nav>
      </div>
    </header>
  );
}
