import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loginSchema } from "@/lib/validations/auth";
import { AuthService } from "@/lib/services/auth.service";
import { UnauthorizedError } from "@/lib/errors";


export const { handlers, auth, signIn, signOut } = NextAuth({
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
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.workspaceId = token.workspaceId;

        return session;
    }
  },
});