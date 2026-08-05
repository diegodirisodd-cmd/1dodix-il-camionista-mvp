import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { canRequestServices } from "@/lib/roles";
import {
  SERVICE_PHOTO_ALLOWED_TYPES,
  SERVICE_PHOTO_BUCKET,
  SERVICE_PHOTO_MAX_BYTES,
  ensureServicePhotoBucket,
  getSupabaseAdminClient,
  isSupabaseStorageConfigured,
  signServicePhotoPaths,
} from "@/lib/supabase-storage";

export const runtime = "nodejs";

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  if (!canRequestServices(user.role)) {
    return NextResponse.json(
      { error: "Solo trasportatori e aziende possono caricare foto di una richiesta" },
      { status: 403 },
    );
  }

  if (!isSupabaseStorageConfigured()) {
    console.error("[uploads] SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti");
    return NextResponse.json(
      { error: "Upload delle foto non configurato" },
      { status: 503 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Nessun file ricevuto" }, { status: 400 });
  }

  if (!(SERVICE_PHOTO_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json(
      { error: "Formato non supportato: usa JPG, PNG, WEBP o HEIC" },
      { status: 400 },
    );
  }

  if (file.size > SERVICE_PHOTO_MAX_BYTES) {
    return NextResponse.json(
      { error: `La foto supera il limite di ${Math.round(SERVICE_PHOTO_MAX_BYTES / (1024 * 1024))} MB` },
      { status: 400 },
    );
  }

  // Il path include l'id utente: rende immediato risalire al proprietario e
  // tiene separati i file di utenti diversi dentro lo stesso bucket.
  const path = `${user.id}/${randomUUID()}.${EXTENSION_BY_TYPE[file.type] ?? "bin"}`;

  try {
    await ensureServicePhotoBucket();

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase.storage
      .from(SERVICE_PHOTO_BUCKET)
      .upload(path, await file.arrayBuffer(), {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("[uploads] upload foto fallito", error);
      return NextResponse.json({ error: "Caricamento della foto non riuscito" }, { status: 500 });
    }

    // "path" è il valore da salvare in ServiceRequestPhoto.url;
    // "previewUrl" serve solo all'anteprima nel form, scade dopo un'ora.
    const signed = await signServicePhotoPaths([path]);

    return NextResponse.json({ path, previewUrl: signed.get(path) ?? null }, { status: 201 });
  } catch (error) {
    console.error("[uploads] upload foto fallito", error);
    return NextResponse.json({ error: "Caricamento della foto non riuscito" }, { status: 500 });
  }
}
