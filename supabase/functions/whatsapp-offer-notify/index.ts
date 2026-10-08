import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Offerte di Di Riso Teloni: avviso WhatsApp a tutti i trasportatori con consenso.
// Chiamata dal trigger AFTER INSERT su "Offer" (payload: { offerId }), oppure a mano
// con lo stesso payload per rilanciare un'offerta rimasta "pending".
// - Resta dormiente finché WHATSAPP_OFFER_TEMPLATE non e' impostato (template Meta approvato).
// - Una sola esecuzione per offerta: claim atomico pending -> sending.
// - Un solo messaggio per trasportatore: riga unica in "OfferDelivery" prima dell'invio.
// - SANDBOX_ONLY (default true): invia solo al numero di test, a tutti i destinatari "simulati".
// Template atteso (2 parametri): {{1}} titolo, {{2}} testo (+ link) della offerta.

const WA_TOKEN = Deno.env.get("WHATSAPP_TOKEN") ?? "";
const PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID") ?? "1223790424131412";
const TEMPLATE_NAME = Deno.env.get("WHATSAPP_OFFER_TEMPLATE") ?? "";
const TEMPLATE_LANG = Deno.env.get("WHATSAPP_TEMPLATE_LANG") ?? "it";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SB_SERVICE_ROLE_KEY") ?? "";
const SANDBOX_ONLY = (Deno.env.get("SANDBOX_ONLY") ?? "true") === "true";
const SANDBOX_TEST_NUMBER = "393921489852";
const MAX_AGE_MS = 24 * 60 * 60 * 1000;
const CONCURRENCY = 5;

type Offer = { id: number; title: string; body: string; linkUrl: string | null; createdAt: string };
type Carrier = { id: number; phone: string | null };

const H = { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" };

function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let n = String(raw).replace(/[^0-9]/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  if (n.startsWith("39") && n.length >= 11) return n;
  if (n.length >= 9 && n.length <= 11) return "39" + n;
  return n.length >= 10 ? n : null;
}

// I parametri dei template non accettano a capo, tab o 4+ spazi di fila.
function clean(s: string, max: number): string {
  return s.replace(/[\n\r\t]+/g, " ").replace(/ {2,}/g, " ").trim().substring(0, max) || "-";
}

async function rest<T>(path: string, init?: RequestInit): Promise<{ ok: boolean; status: number; data: T[] }> {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { ...init, headers: { ...H, ...(init?.headers ?? {}) } });
  const text = await r.text();
  if (!r.ok && r.status !== 409) console.error("REST", path, r.status, text);
  let data: T[] = [];
  try { data = text ? (JSON.parse(text) as T[]) : []; } catch { /* corpo non JSON */ }
  return { ok: r.ok, status: r.status, data };
}

async function sendWhatsApp(to: string, params: string[]) {
  const r = await fetch(`https://graph.facebook.com/v25.0/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp", to, type: "template",
      template: {
        name: TEMPLATE_NAME, language: { code: TEMPLATE_LANG },
        components: [{ type: "body", parameters: params.map((p) => ({ type: "text", text: p })) }],
      },
    }),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, data };
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!WA_TOKEN) return json({ error: "WHATSAPP_TOKEN not configured" }, 500);
  if (!TEMPLATE_NAME) return json({ skipped: "WHATSAPP_OFFER_TEMPLATE non impostato: offerta lasciata in attesa" });

  let offerId = 0;
  try {
    const payload = await req.json().catch(() => ({}));
    offerId = Number(payload?.offerId);
    // force: rilancio a mano di un'offerta rimasta "sending" (timeout); i destinatari già raggiunti non ricevono doppioni.
    const force = payload?.force === true;
    if (!Number.isInteger(offerId) || offerId <= 0) return json({ error: "payload non valido" }, 400);

    const offer = (await rest<Offer>(`Offer?id=eq.${offerId}&select=id,title,body,linkUrl,createdAt`)).data[0];
    if (!offer) return json({ skipped: "offerta non trovata" });
    const createdMs = new Date(offer.createdAt + (offer.createdAt.endsWith("Z") ? "" : "Z")).getTime();
    if (!Number.isFinite(createdMs) || Date.now() - createdMs > MAX_AGE_MS) return json({ skipped: "offerta non recente" });

    // Prenota l'invio: solo chi trova la riga ancora "pending" prosegue.
    const claimFilter = force ? "waStatus=in.(pending,sending)" : "waStatus=eq.pending";
    const claim = await rest<{ id: number }>(`Offer?id=eq.${offerId}&${claimFilter}&select=id`, {
      method: "PATCH", headers: { Prefer: "return=representation" }, body: JSON.stringify({ waStatus: "sending" }),
    });
    if (!claim.ok) return json({ error: "impossibile prenotare l'invio" }, 500);
    if (claim.data.length === 0) return json({ skipped: "offerta già inviata o in corso" });

    // Se qualcosa va storto prima di finire, l'offerta torna "pending" e si può rilanciare.
    const release = () => rest(`Offer?id=eq.${offerId}&waStatus=eq.sending`, { method: "PATCH", body: JSON.stringify({ waStatus: "pending" }) });

    // Tutti i destinatari, a pagine di 1000 (keyset su id). Un errore non vale "zero destinatari".
    const carriers: Carrier[] = [];
    for (let lastId = 0; ;) {
      const page = await rest<Carrier>(
        `User?role=eq.TRANSPORTER&whatsappOptIn=eq.true&phone=not.is.null&id=gt.${lastId}&select=id,phone&order=id.asc&limit=1000`,
      );
      if (!page.ok) {
        await release();
        return json({ error: "lettura destinatari fallita, offerta lasciata in attesa" }, 500);
      }
      carriers.push(...page.data);
      if (page.data.length < 1000) break;
      lastId = page.data[page.data.length - 1].id;
    }

    const text = clean(offer.body, 700) + (offer.linkUrl ? ` ${offer.linkUrl}` : "");
    const params = [clean(offer.title, 100), text.substring(0, 900)];

    let sent = 0, failed = 0, skipped = 0;
    const queue = [...carriers];
    const worker = async () => {
      for (let c = queue.shift(); c; c = queue.shift()) {
        const real = normalizePhone(c.phone);
        if (!real) { skipped++; continue; }
        // Riga unica per (offerta, trasportatore): se esiste già non si reinvia.
        const ins = await rest(`OfferDelivery`, {
          method: "POST", headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ offerId, userId: c.id, status: "sending" }),
        });
        if (!ins.ok) { skipped++; continue; }
        // In sandbox tutto va al numero di test: un solo messaggio, non uno per utente.
        if (SANDBOX_ONLY && sent + failed > 0) {
          await rest(`OfferDelivery?offerId=eq.${offerId}&userId=eq.${c.id}`, { method: "PATCH", body: JSON.stringify({ status: "skipped", error: "sandbox" }) });
          skipped++;
          continue;
        }
        const to = SANDBOX_ONLY ? SANDBOX_TEST_NUMBER : real;
        let ok = false, err: string | null = null;
        try {
          const r = await sendWhatsApp(to, params);
          ok = r.ok;
          if (!ok) err = JSON.stringify((r.data as any)?.error ?? r.data).substring(0, 500);
        } catch (e) {
          err = String(e).substring(0, 500);
        }
        await rest(`OfferDelivery?offerId=eq.${offerId}&userId=eq.${c.id}`, {
          method: "PATCH", body: JSON.stringify({ status: ok ? "sent" : "failed", error: err }),
        });
        if (ok) sent++; else failed++;
      }
    };
    await Promise.all(Array.from({ length: SANDBOX_ONLY ? 1 : CONCURRENCY }, worker));

    await rest(`Offer?id=eq.${offerId}`, { method: "PATCH", body: JSON.stringify({ waStatus: "done", waSent: sent, waFailed: failed }) });
    console.log(`WA offer ${offerId}: sent=${sent} failed=${failed} skipped=${skipped} sandbox=${SANDBOX_ONLY}`);
    return json({ offerId, sandboxOnly: SANDBOX_ONLY, sent, failed, skipped });
  } catch (e) {
    console.error("handler error:", e);
    if (Number.isInteger(offerId) && offerId > 0) {
      try {
        await rest(`Offer?id=eq.${offerId}&waStatus=eq.sending`, { method: "PATCH", body: JSON.stringify({ waStatus: "pending" }) });
      } catch { /* niente */ }
    }
    return json({ error: String(e) }, 500);
  }
});
