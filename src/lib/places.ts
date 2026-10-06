import "server-only";

import data from "@/data/comuni.json";

import { normalizeRegion } from "./catalog";

export type Place = {
  city: string;
  province: string;
  region: string;
  lat: number;
  lng: number;
};

type Row = [string, string, string, number, number, number];

function fold(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Righe gia' ordinate per popolazione decrescente (vedi src/data/comuni.json).
const PLACES: (Place & { key: string })[] = (data.rows as unknown as Row[]).map((r) => ({
  city: r[0],
  province: r[1],
  region: normalizeRegion(r[2]) ?? r[2],
  lat: r[3],
  lng: r[4],
  key: fold(r[0]),
}));

function strip(p: Place & { key: string }): Place {
  return { city: p.city, province: p.province, region: p.region, lat: p.lat, lng: p.lng };
}

/** Ricerca per l'autocompletamento: prima i comuni che iniziano con il testo, poi quelli che lo contengono. */
export function searchPlaces(query: string, limit = 8): Place[] {
  const q = fold(query.replace(/\([A-Za-z]{2}\)\s*$/, ""));
  if (q.length < 2) return [];
  const starts: Place[] = [];
  const contains: Place[] = [];
  for (const p of PLACES) {
    if (p.key.startsWith(q)) starts.push(strip(p));
    else if (contains.length < limit && p.key.includes(q)) contains.push(strip(p));
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}

/** Ritrova un comune dal nome e (se c'e') dalla sigla della provincia. */
export function findPlace(city: string, province?: string | null): Place | null {
  const key = fold(city);
  const sigla = province?.trim().toUpperCase();
  const match = PLACES.find((p) => p.key === key && (!sigla || p.province === sigla));
  return match ? strip(match) : null;
}

/**
 * Prova a riconoscere un luogo scritto a mano ("Milano (MI) via Roma 1",
 * "Angri Via dei goti 183 (SA)", "milano"): usato per i carichi vecchi.
 */
export function parseFreeTextPlace(text: string): Place | null {
  const sigla = text.match(/\(([A-Za-z]{2})\)/)?.[1]?.toUpperCase();
  const words = fold(text.replace(/\([A-Za-z]{2}\)/g, " ")).split(" ").filter(Boolean);
  for (let len = Math.min(4, words.length); len >= 1; len--) {
    for (let i = 0; i + len <= words.length; i++) {
      const found = findPlace(words.slice(i, i + len).join(" "), sigla);
      if (found) return found;
    }
  }
  return null;
}
