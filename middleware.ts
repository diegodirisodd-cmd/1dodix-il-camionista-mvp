import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { routeForUser } from "@/lib/navigation";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApp = pathname.startsWith("/app");
  const isDashboardLegacy = pathname.startsWith("/dashboard");
  const isOnboarding = pathname.startsWith("/onboarding");

  if (!isApp && !isDashboardLegacy && !isOnboarding) {
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
    select: { role: true, onboardingCompleted: true },
  });

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isOnboarding) {
    if (user.onboardingCompleted) {
      return NextResponse.redirect(new URL(routeForUser({ ...user, onboardingCompleted: true }), request.url));
    }

    return NextResponse.next();
  }

  if (isDashboardLegacy) {
    return NextResponse.redirect(new URL(routeForUser(user), request.url));
  }

  if (!user.onboardingCompleted) {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/dashboard/:path*", "/onboarding"],
};
