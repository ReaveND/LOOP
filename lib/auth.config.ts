import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/db";

export const authConfig = {
  providers: [],
  secret: process.env.AUTH_SECRET || "default_auth_secret_for_local_dev_only_1234567890",
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign-in, populate from the user object returned by authorize()
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.workspaceId = user.workspaceId;
        return token;
      }

      // On every subsequent request, re-fetch the user's current workspaceId and
      // role from the DB so stale tokens never point to an old workspace (e.g.
      // after a seed re-run that deletes and recreates the workspace).
      if (token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, workspaceId: true, role: true, name: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.workspaceId = dbUser.workspaceId;
            token.role = dbUser.role;
            token.name = dbUser.name;
          }
        } catch {
          // If the DB is unreachable, fall back to the existing token values
        }
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
