import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next.js 16: middleware.ts renamed to proxy.ts
// Proxy now runs on Node.js runtime — authConfig (edge-safe) still works fine here
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/checkout/:path*",
    "/login",
    "/register",
  ],
};
