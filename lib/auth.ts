import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loginSchema } from "@/lib/validations/auth";
import { AuthService } from "@/lib/services/auth.service";
import { UnauthorizedError } from "@/lib/errors";
import { authConfig } from "@/lib/auth.config";
import { prisma } from "@/lib/db";


export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  callbacks: {
    ...authConfig.callbacks,

    // Override jwt here (Node.js runtime — Prisma is safe to use).
    // On every token refresh, re-fetch workspaceId and role from the DB so
    // that stale tokens (e.g. after a seed re-run recreates the workspace)
    // auto-heal on the next request without requiring a sign-out.
    async jwt({ token, user }) {
      // Initial sign-in: populate from the authorize() return value
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.workspaceId = user.workspaceId;
        return token;
      }

      // Subsequent requests: sync from DB
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
          // DB unreachable — keep existing token values
        }
      }

      return token;
    },
  },
  providers: [
    Credentials({
        async authorize(credentials) {
            const validated = loginSchema.safeParse(credentials);
            if (!validated.success) return null;
            
            try {
                const user = await AuthService.login(validated.data);
                return user;
            } catch (error) {
                if (error instanceof UnauthorizedError) {
                    return null;
                }
                throw error;
            }
        },
    }),
  ],
});