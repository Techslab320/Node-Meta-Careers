"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { adminBasePath } from "@/config/admin";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/layout/logo";

export function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push(searchParams.get("callbackUrl") || adminBasePath);
    router.refresh();
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
