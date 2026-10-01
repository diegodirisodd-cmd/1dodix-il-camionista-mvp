import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Avviso WhatsApp alla controparte quando qualcuno paga per sbloccare un contatto.
//  - LOAD    (RequestUnlock):        paga il trasportatore -> avvisa l'azienda (e viceversa)
//  - SERVICE (ServiceContactUnlock): paga il fornitore     -> avvisa il trasportatore che ha chiesto il servizio
// Chiamata dai trigger AFTER INSERT sulle due tabelle: l'upsert del webhook Stripe e
// di /api/stripe/confirm inserisce una sola volta, quindi parte un solo messaggio.
// Il payload contiene solo l'id dello sblocco: tutti i dati vengono riletti dal DB.
// Chiamate ripetute o esterne sono innocue: ogni sblocco produce al massimo un
// messaggio inviato, sempre e solo alla controparte registrata (vedi claimNotice).

const WA_TOKEN = Deno.env.get("WHATSAPP_TOKEN") ?? "";
const PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID") ?? "1223790424131412";
const TEMPLATE_NAME = Deno.env.get("WHATSAPP_UNLOCK_TEMPLATE") ?? "contatto_sbloccato";
const TEMPLATE_LANG = Deno.env.get("WHATSAPP_TEMPLATE_LANG") ?? "it";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SB_SERVICE_ROLE_KEY") ?? "";
const SANDBOX_ONLY = (Deno.env.get("SANDBOX_ONLY") ?? "true") === "true";
const SANDBOX_TEST_NUMBER = "393921489852";
const MAX_AGE_MS = 48 * 60 * 60 * 1000; // finestra entro cui un avviso fallito viene ancora ritentato

type User = {
  id: number; phone: string | null; role: string; companyName: string | null;
  firstName: string | null; lastName: string | null; whatsappOptIn: boolean | null;
};

function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let n = String(raw).replace(/[^0-9]/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  if (n.startsWith("39") && n.length >= 11) return n;
  if (n.length >= 9 && n.length <= 11) return "39" + n;
  return n.length >= 10 ? n : null;
}

function displayName(u: User): string {
  const person = [u.firstName, u.lastName].filter(Boolean).join(" ").trim();
  if (u.companyName && person) return `${u.companyName} (${person})`;
  return u.companyName || person || "Un utente DodiX";
}

function displayPhone(raw: string | null): string {
  const n = normalizePhone(raw);
  return n ? `+${n}` : "visibile su dodix.it";
}

// I parametri dei template non accettano a capo, tab o 4+ spazi di fila.
function clean(s: string, max: number): string {
  return s.replace(/[\n\r\t]+/g, " ").replace(/ {2,}/g, " ").trim().substring(0, max) || "-";
}

async function rest<T>(path: string): Promise<T[]> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!r.ok) {
    console.error("REST", path, r.status, await r.text());
    return [];
  }
  return (await r.json()) as T[];
}

const USER_COLS = "id,phone,role,companyName,firstName,lastName,whatsappOptIn";
async function getUser(id: number | null | undefined): Promise<User | null> {
  if (!id) return null;
  return (await rest<User>(`User?id=eq.${id}&select=${USER_COLS}`))[0] ?? null;
}

async function sendWhatsApp(toPhone: string, params: string[]) {
  const r = await fetch(`https://graph.facebook.com/v25.0/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to: toPhone, type: "template",
      template: {
        name: TEMPLATE_NAME, language: { code: TEMPLATE_LANG },
        components: [{ type: "body", parameters: params.map((p) => ({ type: "text", text: p })) }],
      },
    }),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

async function logNotification(requestId: number | null, userId: number | null, phone: string, status: string, messageId: string | null, errorMessage: string | null) {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/WhatsappNotification`, {
      method: "POST",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ requestId, userId, phoneNumber: phone, status, messageId, errorMessage, createdAt: new Date().toISOString() }),
    });
    if (!r.ok) console.error("log notification failed:", r.status, await r.text());
  } catch (e) {
    console.error("log error:", e);
  }
}

// Stato dell'avviso in WhatsappUnlockNotice (una riga per sblocco):
// pending -> sending -> sent | failed | skipped. claim_unlock_notice prenota
// l'invio in modo atomico, quindi trigger, retry e chiamate ripetute non
// producono mai due messaggi; un "failed" viene ritentato dal cron ogni 10 min
// (retry_unlock_notices, attesa crescente, max 12 tentativi entro 48 ore).
async function rpc<T>(fn: string, args: Record<string, unknown>): Promise<{ ok: boolean; data: T | null }> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    if (!r.ok) {
      console.error("rpc", fn, r.status, await r.text());
      return { ok: false, data: null };
    }
    const text = await r.text();
    return { ok: true, data: text ? (JSON.parse(text) as T) : null };
  } catch (e) {
    console.error("rpc error", fn, e);
    return { ok: false, data: null };
  }
}

const claimNotice = (kind: string, unlockId: number) =>
  rpc<boolean>("claim_unlock_notice", { p_kind: kind, p_unlock_id: unlockId });

const finishNotice = (kind: string, unlockId: number, status: "sent" | "failed" | "skipped", error: string | null) =>
  rpc<null>("finish_unlock_notice", { p_kind: kind, p_unlock_id: unlockId, p_status: status, p_error: error });

type Plan = {
  recipient: User; payer: User; subject: string;
  logRequestId: number | null; // FK su Request: null per Borsa Servizi
  createdAt: string;
};

async function planLoad(unlockId: number): Promise<Plan | string> {
  const unlock = (await rest<{ requestId: number; userId: number; userRole: string; createdAt: string }>(
    `RequestUnlock?id=eq.${unlockId}&select=requestId,userId,userRole,createdAt`))[0];
  if (!unlock) return "sblocco non trovato";
  const req = (await rest<{ id: number; pickup: string; delivery: string; companyId: number | null; transporterId: number | null }>(
    `Request?id=eq.${unlock.requestId}&select=id,pickup,delivery,companyId,transporterId`))[0];
  if (!req) return "carico non trovato";

  const payer = await getUser(unlock.userId);
  const role = (unlock.userRole || "").toUpperCase();
  const recipientId = role === "TRANSPORTER" ? req.companyId : role === "COMPANY" ? req.transporterId : null;
  const recipient = recipientId && recipientId !== unlock.userId ? await getUser(recipientId) : null;
  if (!payer || !recipient) return "controparte non disponibile";

  return {
    recipient, payer, logRequestId: req.id, createdAt: unlock.createdAt,
    subject: clean(`carico ${req.pickup ?? "-"} → ${req.delivery ?? "-"}`, 120),
  };
}

async function planService(unlockId: number): Promise<Plan | string> {
  const unlock = (await rest<{ requestId: number; supplierId: number; createdAt: string }>(
    `ServiceContactUnlock?id=eq.${unlockId}&select=requestId,supplierId,createdAt`))[0];
  if (!unlock) return "sblocco servizio non trovato";
  const sr = (await rest<{ transporterId: number; categoria: string; posizione: string | null }>(
    `ServiceRequest?id=eq.${unlock.requestId}&select=transporterId,categoria,posizione`))[0];
  const supplier = (await rest<{ userId: number; ragioneSociale: string | null }>(
    `SupplierProfile?id=eq.${unlock.supplierId}&select=userId,ragioneSociale`))[0];
  if (!sr || !supplier) return "richiesta o fornitore non trovati";

  const payer = await getUser(supplier.userId);
  const recipient = await getUser(sr.transporterId);
  if (!payer || !recipient) return "controparte non disponibile";
  if (supplier.ragioneSociale) payer.companyName = supplier.ragioneSociale;

  const categoria = (sr.categoria || "servizio").replace(/_/g, " ").toLowerCase();
  return {
    recipient, payer, logRequestId: null, createdAt: unlock.createdAt,
    subject: clean(`richiesta di servizio (${categoria}${sr.posizione ? ", " + sr.posizione : ""})`, 120),
  };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!WA_TOKEN) return json({ error: "WHATSAPP_TOKEN not configured" }, 500);

  try {
    const payload = await req.json().catch(() => ({}));

    // Ping di prova: invia il template con dati finti al numero di test.
    if (payload?.test === true) {
      const params = ["carico Brescia (BS) → Angri (SA)", "Trasporti Prova Srl (Mario Rossi)", "+39 333 000 0000"];
      const send = await sendWhatsApp(SANDBOX_TEST_NUMBER, params);
      await logNotification(null, null, SANDBOX_TEST_NUMBER, send.ok ? "sent" : "failed", send.data?.messages?.[0]?.id ?? null, send.ok ? null : JSON.stringify(send.data?.error ?? send.data));
      return json({ mode: "ping", template: TEMPLATE_NAME, result: send });
    }

    const kind = String(payload?.kind ?? "").toUpperCase();
    const unlockId = Number(payload?.unlockId);
    if (!Number.isFinite(unlockId) || (kind !== "LOAD" && kind !== "SERVICE")) return json({ error: "payload non valido" }, 400);

    const plan = kind === "LOAD" ? await planLoad(unlockId) : await planService(unlockId);
    if (typeof plan === "string") {
      console.log(`skip ${kind} ${unlockId}: ${plan}`);
      // "controparte non disponibile" riguarda uno sblocco reale: lo segniamo
      // perché resti visibile; per id inesistenti non si scrive nulla.
      if (plan === "controparte non disponibile") await finishNotice(kind, unlockId, "skipped", plan);
      return json({ skipped: plan });
    }

    const createdMs = new Date(plan.createdAt + (plan.createdAt.endsWith("Z") ? "" : "Z")).getTime();
    if (!Number.isFinite(createdMs) || Date.now() - createdMs > MAX_AGE_MS) return json({ skipped: "sblocco non recente" });

    const skip = async (reason: string) => {
      await finishNotice(kind, unlockId, "skipped", reason);
      return json({ skipped: reason });
    };
    if (!plan.recipient.whatsappOptIn) return await skip("destinatario senza opt-in WhatsApp");
    const to = SANDBOX_ONLY ? SANDBOX_TEST_NUMBER : normalizePhone(plan.recipient.phone);
    if (!to) return await skip("destinatario senza telefono");

    const claim = await claimNotice(kind, unlockId);
    if (!claim.ok) return json({ error: "impossibile prenotare l'avviso" }, 500);
    if (claim.data !== true) return json({ skipped: "avviso già inviato, in corso o tentativi esauriti" });

    const params = [plan.subject, clean(displayName(plan.payer), 100), displayPhone(plan.payer.phone)];
    let send: { ok: boolean; status: number; data: any };
    try {
      send = await sendWhatsApp(to, params);
    } catch (e) {
      send = { ok: false, status: 0, data: { error: String(e) } };
    }
    const messageId = send.data?.messages?.[0]?.id ?? null;
    const errorMsg = send.ok ? null : JSON.stringify(send.data?.error ?? send.data);
    await finishNotice(kind, unlockId, send.ok ? "sent" : "failed", errorMsg);
    await logNotification(plan.logRequestId, plan.recipient.id, to, send.ok ? "sent" : "failed", messageId, errorMsg);
    console.log(`WA unlock ${kind} ${unlockId} -> ${to}: ${send.ok ? "sent" : "failed"} (${send.status})`);

    return json({ kind, unlockId, sandboxOnly: SANDBOX_ONLY, status: send.ok ? "sent" : "failed", messageId, error: errorMsg });
  } catch (e) {
    console.error("handler error:", e);
    return json({ error: String(e) }, 500);
  }
});
