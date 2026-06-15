import { NextResponse, type NextRequest } from "next/server";

import {
  applyCorsHeaders,
  getCorsHeaders,
  isAllowedOrigin,
} from "@/app/security/cors";
import {
  applyRateLimitHeaders,
  checkRequestRateLimit,
} from "@/app/security/rate-limit";

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const sessionSecret = process.env.ADMIN_SESSION_SECRET;
    const sessionCookie = request.cookies.get("lym_admin_session")?.value;
    const isLoginRoute = request.nextUrl.pathname.startsWith("/admin/login");
    const hasAdminSession = Boolean(
      sessionSecret && sessionCookie && sessionCookie === sessionSecret,
    );

    if (!hasAdminSession && !isLoginRoute) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    if (hasAdminSession && isLoginRoute) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    const response = NextResponse.next();
    response.headers.set("Cache-Control", "no-store, max-age=0");
    return response;
  }

  const origin = request.headers.get("origin");

  if (!isAllowedOrigin(origin)) {
    return NextResponse.json(
      { error: "Origen no permitido para este backend." },
      { status: 403 },
    );
  }

  if (request.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: getCorsHeaders(origin),
    });
  }

  const rateLimit = await checkRequestRateLimit(request);

  if (!rateLimit.allowed) {
    const response = NextResponse.json(
      { error: "Demasiadas peticiones. Intenta de nuevo en unos segundos." },
      { status: 429 },
    );

    applyCorsHeaders(response, origin);
    return applyRateLimitHeaders(response, rateLimit);
  }

  const response = applyCorsHeaders(NextResponse.next(), origin);
  return applyRateLimitHeaders(response, rateLimit);
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*"],
};
