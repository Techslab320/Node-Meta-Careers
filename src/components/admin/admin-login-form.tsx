"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminBasePath } from "@/config/admin";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert, Card } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";

export function AdminLoginForm() {
  const searchParams = useSearchParams();
  const [csrfToken, setCsrfToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [configWarning, setConfigWarning] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || adminBasePath;

  useEffect(() => {
    const authError = searchParams.get("error");
    if (authError) {
      setError("Invalid email or password.");
    }
  }, [searchParams]);

  useEffect(() => {
    async function loadCsrfToken() {
      try {
        const response = await fetch("/api/auth/csrf", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { csrfToken?: string };
        if (data.csrfToken) {
          setCsrfToken(data.csrfToken);
        }
      } catch {
        setError("Unable to start sign-in. Please refresh and try again.");
      }
    }

    void loadCsrfToken();
  }, []);

  useEffect(() => {
    async function checkAuthConfig() {
      try {
        const response = await fetch("/api/admin/auth/status", { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { configured?: boolean };
        if (!data.configured) {
          setConfigWarning(
            "Admin login is not configured on the server. In Vercel, set ADMIN_EMAIL, AUTH_SECRET, and ADMIN_PASSWORD, then redeploy.",
          );
        }
      } catch {
        // Ignore status check errors.
      }
    }

    void checkAuthConfig();
  }, []);

  return (
    <div className="mx-auto flex min-h-screen max-w-md items-center px-4 py-16">
      <Card className="w-full">
        <Logo href={null} layout="stacked" className="justify-center" iconClassName="h-11 w-11 sm:h-12 sm:w-12" textClassName="text-2xl" />
        <h1 className="mt-6 text-center text-2xl font-bold text-white">Admin Login</h1>
        <p className="mt-2 text-center text-sm text-slate-400">
          Sign in to manage jobs and applications.
        </p>
        <form
          action="/api/auth/callback/credentials"
          method="POST"
          className="mt-8 space-y-4"
          onSubmit={() => setLoading(true)}
        >
          <input type="hidden" name="csrfToken" value={csrfToken} />
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          {configWarning ? <Alert variant="warning">{configWarning}</Alert> : null}
          <Input
            label="Email"
            name="email"
            type="email"
            autoComplete="username"
            required
          />
          <PasswordInput
            label="Password"
            name="password"
            autoComplete="current-password"
            required
          />
          {error ? <p className="text-sm text-red-400">{error}</p> : null}
          <Button type="submit" disabled={loading || !csrfToken} className="w-full">
            {loading ? "Signing in..." : csrfToken ? "Sign in" : "Loading..."}
          </Button>
        </form>
      </Card>
    </div>
  );
}
