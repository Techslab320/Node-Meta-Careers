import { auth } from "@/lib/auth/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await auth();
  return Boolean(session?.user?.email);
}
