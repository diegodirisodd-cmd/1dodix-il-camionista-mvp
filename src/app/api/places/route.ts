import { NextResponse } from "next/server";

import { searchPlaces } from "@/lib/places";

/** Autocompletamento comuni italiani (dati ISTAT). Pubblico, nessun dato utente. */
export async function GET(req: Request) {
  const q = new URL(req.url).searchParams.get("q") ?? "";
  const results = searchPlaces(q.slice(0, 60), 8);
  return NextResponse.json(results, { headers: { "Cache-Control": "public, max-age=86400" } });
}
