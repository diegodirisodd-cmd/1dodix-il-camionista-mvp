import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  VAT_DOCUMENT_ALLOWED_TYPES,
  VAT_DOCUMENT_BUCKET,
  VAT_DOCUMENT_MAX_BYTES,
  ensureVatDocumentBucket,
  getSupabaseAdminClient,
  isSupabaseStorageConfigured,
} from "@/lib/supabase-storage";
import { isValidItalianVatFormat } from "@/lib/vies";

export const runtime = "nodejs";

const EXTENSION_BY_TYPE: Record<string, string> = {
  "application/pdf": "pdf",
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
};

// Verifica della P.IVA con visura camerale, per chi non risulta su VIES.
// Scelta di prodotto: approvazione automatica al caricamento. Il file resta nel
// bucket privato "vat-documents" per eventuali controlli successivi.
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });

  const me = await prisma.user.findUnique({
    where: { id: user.id },
    select: { vatNumber: true, vatVerified: true },
  });
  if (!me) return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });

  if (me.vatVerified) {
    return NextResponse.json({ error: "La tua P.IVA è già verificata." }, { status: 409 });
  }
  if (!me.vatNumber) {
    return NextResponse.json({ error: "Prima inserisci e salva la partita IVA nel profilo." }, { status: 400 });
  }
  if (!isValidItalianVatFormat(me.vatNumber)) {
    return NextResponse.json({ error: "La partita IVA salvata non è valida: correggila e salva il profilo." }, { status: 400 });
  }

  if (!isSupabaseStorageConfigured()) {
    console.error("[vat-document] SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY mancanti");
    return NextResponse.json({ error: "Caricamento non disponibile al momento." }, { status: 503 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Nessun file ricevuto" }, { status: 400 });
  }
  if (!(VAT_DOCUMENT_ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return NextResponse.json({ error: "Formato non supportato: carica un PDF o una foto (JPG, PNG)." }, { status: 400 });
  }
  if (file.size > VAT_DOCUMENT_MAX_BYTES) {
    return NextResponse.json(
      { error: `Il file supera il limite di ${Math.round(VAT_DOCUMENT_MAX_BYTES / (1024 * 1024))} MB` },
      { status: 400 },
    );
  }

  const path = `${user.id}/${randomUUID()}.${EXTENSION_BY_TYPE[file.type] ?? "bin"}`;

  try {
    await ensureVatDocumentBucket();
    const { error } = await getSupabaseAdminClient()
      .storage.from(VAT_DOCUMENT_BUCKET)
      .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
    if (error) {
      console.error("[vat-document] upload fallito", error);
      return NextResponse.json({ error: "Caricamento non riuscito, riprova." }, { status: 500 });
    }
  } catch (error) {
    console.error("[vat-document] upload fallito", error);
    return NextResponse.json({ error: "Caricamento non riuscito, riprova." }, { status: 500 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      vatVerified: true,
      vatVerifiedAt: new Date(),
      vatVerifiedMethod: "VISURA",
      vatDocumentPath: path,
    },
  });

  return NextResponse.json({ vatVerified: true, vatVerifiedMethod: "VISURA" }, { status: 201 });
}
