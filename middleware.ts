import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    console.log(req.nextUrl.pathname);
    console.log(req.auth);
});