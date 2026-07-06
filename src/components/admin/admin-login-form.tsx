"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminBasePath } from "@/config/admin";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert, Card } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [configWarning, setConfigWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function checkAuthConfig() {
      try {
        const response = await fetch("/api/admin/auth/status", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { configured?: boolean };
        if (!data.configured) {
          setConfigWarning(
            "Admin login is not configured on the server. Set ADMIN_EMAIL, AUTH_SECRET, and ADMIN_PASSWORD (or ADMIN_PASSWORD_HASH) in Vercel environment variables, then redeploy.",
          );
        }
      } catch {
        // Ignore status check errors.
      }
    }

    void checkAuthConfig();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: adminBasePath,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      if (!result?.ok) {
        setError("Unable to sign in. Please try again.");
        return;
      }

      router.push(searchParams.get("callbackUrl") || adminBasePath);
      router.refresh();
    } catch (loginError) {
      console.error("Admin sign-in failed", loginError);
      setError("Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-16">
      <Card className="w-full">
        <Logo href={null} className="justify-center" iconClassName="h-11 w-11" textClassName="text-2xl" />
        <h1 className="mt-6 text-center text-2xl font-bold text-white">Admin Login</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sign in to manage jobs and applications.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {configWarning ? <Alert variant="warning">{configWarning}</Alert> : null}
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
