import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no Prisma, no Node.js-only dependencies
// Used by middleware to check authentication without touching the database
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    // Map token.role → session.user.role so the edge middleware can read it
    session({ session, token }) {
      if (token?.role) {
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },

    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: string })?.role;
      const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN";
      const { pathname } = nextUrl;

      // Admin routes
      if (pathname.startsWith("/admin")) {
        if (!isLoggedIn) return Response.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
        if (!isAdmin) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      // Protected routes
      if (pathname.startsWith("/dashboard") || pathname.startsWith("/checkout")) {
        if (!isLoggedIn) return Response.redirect(new URL(`/login?callbackUrl=${pathname}`, nextUrl));
        return true;
      }

      // Redirect logged-in users away from auth pages
      if ((pathname === "/login" || pathname === "/register") && isLoggedIn) {
        const dest = isAdmin ? "/admin" : "/dashboard";
        return Response.redirect(new URL(dest, nextUrl));
      }

      return true;
    },
  },

  providers: [], // Providers are defined in auth.ts — not needed for edge middleware
};
