declare module "next-auth" {
  interface Session {
    user: {
      email?: string | null;
      role?: string;
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    role?: string;
  }
}

export {};
