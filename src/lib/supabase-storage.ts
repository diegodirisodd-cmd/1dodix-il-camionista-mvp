import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Bucket privato: le foto delle richieste di servizio non sono raggiungibili
// via URL pubblico. Il server firma un URL a scadenza solo per chi ha diritto
// di vedere la richiesta (proprietario, admin, fornitori compatibili).
export const SERVICE_PHOTO_BUCKET = "service-request-photos";

export const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 ora

export const SERVICE_PHOTO_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const SERVICE_PHOTO_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
] as const;

let cachedClient: SupabaseClient | null = null;
let ensureBucketPromise: Promise<void> | null = null;

export function isSupabaseStorageConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sono necessari per lo storage delle foto",
    );
  }

  if (!cachedClient) {
    cachedClient = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return cachedClient;
}

// Crea il bucket alla prima scrittura se non esiste ancora: evita un passaggio
// manuale in dashboard Supabase per ogni ambiente (dev, preview, produzione).
export async function ensureServicePhotoBucket() {
  if (!ensureBucketPromise) {
    ensureBucketPromise = (async () => {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase.storage.getBucket(SERVICE_PHOTO_BUCKET);

      if (data && !error) return;

      const { error: createError } = await supabase.storage.createBucket(SERVICE_PHOTO_BUCKET, {
        public: false,
        fileSizeLimit: SERVICE_PHOTO_MAX_BYTES,
        allowedMimeTypes: [...SERVICE_PHOTO_ALLOWED_TYPES],
      });

      // "già esistente" non è un errore: due richieste concorrenti possono
      // provare a crearlo nello stesso momento.
      if (createError && !/already exists/i.test(createError.message)) {
        ensureBucketPromise = null;
        throw createError;
      }
    })();
  }

  return ensureBucketPromise;
}

function isAbsoluteUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

// In DB salviamo il path dell'oggetto (es. "12/ab34.jpg"), non un URL: così il
// bucket resta privato e l'URL firmato viene generato al momento della lettura.
export async function signServicePhotoPaths(paths: string[]) {
  const signed = new Map<string, string>();

  if (paths.length === 0 || !isSupabaseStorageConfigured()) {
    return signed;
  }

  const toSign = paths.filter((path) => !isAbsoluteUrl(path));

  if (toSign.length === 0) return signed;

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.storage
      .from(SERVICE_PHOTO_BUCKET)
      .createSignedUrls(toSign, SIGNED_URL_TTL_SECONDS);

    if (error) {
      console.error("[storage] firma URL foto fallita", error);
      return signed;
    }

    for (const entry of data ?? []) {
      if (entry.path && entry.signedUrl) {
        signed.set(entry.path, entry.signedUrl);
      }
    }
  } catch (error) {
    console.error("[storage] firma URL foto fallita", error);
  }

  return signed;
}

type PhotoRecord = { url: string };

// Sostituisce il path salvato con un URL firmato utilizzabile in un <img>.
// I valori già assoluti (eventuali dati storici) restano invariati.
export async function withSignedPhotoUrls<T extends PhotoRecord>(fotos: T[]): Promise<T[]> {
  const signed = await signServicePhotoPaths(fotos.map((foto) => foto.url));

  return fotos.map((foto) => ({
    ...foto,
    url: signed.get(foto.url) ?? foto.url,
  }));
}
