import { NextResponse } from "next/server";

import { buildClearedSessionCookie } from "@/lib/auth";

/**
 * Rimuove il cookie di sessione autenticata.
 */
export async function POST() {
  const response = NextResponse.json({ message: "Logout eseguito." });
  response.cookies.set(buildClearedSessionCookie());

  return response;
}
