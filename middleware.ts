import { NextRequest, NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

const DASHBOARD_PREFIX = "/dashboard";

function isBillingApi(pathname: string) {
  return pathname.startsWith("/api/billing");
}

function isBillingWebhook(pathname: string) {
  return pathname === "/api/billing/webhook";
}

function isAuthApi(pathname: string) {
  return pathname.startsWith("/api/auth");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRequest = pathname.startsWith("/api");
  const isDashboard = pathname.startsWith(DASHBOARD_PREFIX);

  if (isBillingWebhook(pathname) || isAuthApi(pathname)) {
    return NextResponse.next();
  }

  if (!isApiRequest && !isDashboard) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    if (isApiRequest) {
      return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  const session = await verifySessionToken(token);

  if (!session) {
    if (isApiRequest) {
      return NextResponse.json({ error: "Token non valido" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { subscriptionActive: true },
  });

  if (!user) {
    if (isApiRequest) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }

    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!user.subscriptionActive) {
    const skipSubscriptionCheck = isBillingApi(pathname);

    if (!skipSubscriptionCheck) {
      if (isApiRequest) {
        return NextResponse.json({ error: "Abbonamento richiesto" }, { status: 402 });
      }

      return NextResponse.redirect(new URL("/paywall", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
};
