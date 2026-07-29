import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { loginSchema } from "@/lib/validations/auth";
import { AuthService } from "@/lib/services/auth.service";
import { UnauthorizedError } from "@/lib/errors";
import { authConfig } from "@/lib/auth.config";


export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
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