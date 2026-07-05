import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { adminLoginPath } from "@/config/admin";
import { getAuthSecret, getEnv, isAdminAuthConfigured } from "@/config/env";
import { rateLimit } from "@/lib/security/rate-limit";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  secret: getAuthSecret(),
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: adminLoginPath },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const env = getEnv();
        if (!isAdminAuthConfigured()) {
          return null;
        }

        const email = credentials?.email?.toString().trim().toLowerCase();
        const password = credentials?.password?.toString() ?? "";

        if (!email || !password) {
          return null;
        }

        const limit = rateLimit(`login:${email}`, 5, 15 * 60 * 1000);
        if (!limit.success) {
          return null;
        }

        if (email !== env.ADMIN_EMAIL!.toLowerCase()) {
          return null;
        }

        const valid = await bcrypt.compare(password, env.ADMIN_PASSWORD_HASH!);
        if (!valid) {
          return null;
        }

        return {
          id: env.ADMIN_EMAIL!,
          email: env.ADMIN_EMAIL!,
          role: "admin",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = "admin";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
