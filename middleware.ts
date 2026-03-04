import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routeForUser } from "@/lib/navigation";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApp = pathname.startsWith("/app");
  const isDashboard = pathname.startsWith("/dashboard");
  const isOnboarding = pathname.startsWith("/onboarding");

  if (!isApp && !isDashboard && !isOnboarding) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifySessionToken(token);

  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { role: true },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isOnboarding) {
    return NextResponse.redirect(new URL(routeForUser(user.role), request.url));
  }

  if (isApp) {
    return NextResponse.redirect(new URL(routeForUser(user.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*", "/onboarding"],
};
