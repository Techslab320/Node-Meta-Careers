import Link from "next/link";
import { Briefcase, FileText, LayoutDashboard, LogOut } from "lucide-react";
import { AdminHeaderRefreshButton } from "@/components/admin/admin-header-refresh-button";
import { Logo } from "@/components/layout/logo";
import { Providers } from "@/components/providers";
import { adminBasePath, adminLoginPath, adminPath } from "@/config/admin";
import { auth, signOut } from "@/lib/auth/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    return <Providers>{children}</Providers>;
  }

  return (
    <Providers>
    <div className="min-h-screen bg-[#080612]">
      <div className="border-b border-slate-800 bg-slate-900/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <Logo href={adminBasePath} layout="inline" iconClassName="h-9 w-9" textClassName="text-xl sm:text-[1.35rem]" />
            <p className="mt-1 text-sm text-slate-400">Admin · {session.user.email}</p>
          </div>
          <div className="flex items-center gap-1">
            <nav aria-label="Admin navigation" className="flex flex-wrap gap-2">
              <Link href={adminBasePath} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <Link href={adminPath("jobs")} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                <Briefcase className="h-4 w-4" /> Jobs
              </Link>
              <Link href={adminPath("applications")} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800">
                <FileText className="h-4 w-4" /> Applications
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: adminLoginPath });
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </form>
            </nav>
            <AdminHeaderRefreshButton />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
    </Providers>
  );
}
