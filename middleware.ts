import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

const publicRoutes = ["/", "/login", "/signup"];

const protectedRoutes = [
  "/dashboard",
  "/inbox",
  "/ask",
  "/reports",
  "/trends",
  "/settings",
  "/members",
];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

//   const isPublicRoute = publicRoutes.includes(pathname);

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // User is NOT logged in but is trying to access a protected route
  if (!isLoggedIn && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // User IS logged in but is trying to access login/signup
  if (
    isLoggedIn &&
    (pathname === "/login" || pathname === "/signup")
  ) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};