import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "@/i18n/routing";

const intl = createMiddleware(routing);

// Cookie name must match src/server/auth/session.ts (kept literal: proxy can't import server-only code).
const ADMIN_COOKIES = ["__Host-zack_admin", "zack_admin"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    // Fast redirect only. The real check is requireAdminPage()/requireAdmin() on the server.
    const signedIn = ADMIN_COOKIES.some((c) => request.cookies.has(c));
    if (!signedIn && pathname !== "/admin/login") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return intl(request);
}

export const config = {
  // Everything except API routes, uploaded media, Next internals and files with an extension.
  matcher: ["/((?!api|media|_next|_vercel|.*\\..*).*)"],
};
