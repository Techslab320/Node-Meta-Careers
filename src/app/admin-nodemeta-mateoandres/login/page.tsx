import { Suspense } from "react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { createPageMetadata } from "@/lib/metadata";

export const metadata = createPageMetadata({
  title: "Admin Login | Node Meta Careers",
  noIndex: true,
});

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="px-4 py-16 text-center text-slate-400">Loading...</div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
