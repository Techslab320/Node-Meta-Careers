"use server";

import { AuthError } from "next-auth";
import { adminBasePath } from "@/config/admin";
import { signIn } from "@/lib/auth/auth";

export async function adminLoginAction(
  email: string,
  password: string,
  callbackUrl?: string,
) {
  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl?.startsWith("/") ? callbackUrl : adminBasePath,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid email or password." };
    }
    throw error;
  }

  return { ok: true };
}
