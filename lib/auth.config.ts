import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  providers: [],
  secret: process.env.AUTH_SECRET || "default_auth_secret_for_local_dev_only_1234567890",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.workspaceId = user.workspaceId;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.role as any;
        session.user.workspaceId = token.workspaceId as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
