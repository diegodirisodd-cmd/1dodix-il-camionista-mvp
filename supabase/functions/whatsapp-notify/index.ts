import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Avviso "nuovo carico" ai trasportatori, chiamato dal trigger
// on_new_request_notify all'inserimento in Request.
//
// v36 (6 ott 2026): invio mirato. Un trasportatore che ha indicato regioni e
// mezzi nel profilo riceve solo i carichi che partono o arrivano in una delle
// sue regioni e compatibili con i suoi mezzi. Chi non ha ancora compilato il
// profilo continua a ricevere tutto, come prima.
//
// v37 (8 ott 2026): messaggio completo. Se WHATSAPP_TEMPLATE e' "nuovo_carico_v2*"
// vengono inviate 10 variabili con tutte le info del carico (numero, partenza,
// arrivo, km e euro/km, merce, mezzo, date, prezzo, pagamento e note).
// Con qualsiasi altro template (default "nuovo_carico") il comportamento e'
// identico a v36 (5 variabili). NON vengono mai inviati telefoni, nomi di
// contatto e indirizzi precisi: restano dietro la conferma a pagamento.
//
// v39 (14 ott 2026): il campo "Misure / volume" e' testo libero. Solo un
// numero nudo diventa "N m³"; misure tipo "120X80X150" escono come
// "120x80x150 cm"; qualsiasi altro testo ("8 metri", "5 pallet 80x120 170h")
// esce cosi' com'e', senza unita' aggiunte.

const WA_TOKEN = Deno.env.get("WHATSAPP_TOKEN") ?? "";
const PHONE_ID = Deno.env.get("WHATSAPP_PHONE_ID") ?? "1223790424131412";
const TEMPLATE_NAME = Deno.env.get("WHATSAPP_TEMPLATE") ?? "nuovo_carico";
const CONFIGURED_LANG = Deno.env.get("WHATSAPP_TEMPLATE_LANG") ?? "it";
const TEMPLATE_LANG = TEMPLATE_NAME === "hello_world" ? "en_US" : CONFIGURED_LANG;
const USE_V2 = TEMPLATE_NAME.startsWith("nuovo_carico_v2");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? Deno.env.get("SB_SERVICE_ROLE_KEY") ?? "";
const SANDBOX_ONLY = (Deno.env.get("SANDBOX_ONLY") ?? "true") === "true";
const SANDBOX_TEST_NUMBER = "393921489852";

const CARGO_LABELS: Record<string, string> = {
  pallet: "Pallet",
  colli: "Colli",
  sfuso: "Sfuso",
  container: "Container",
  frigo: "Refrigerato",
  adr: "ADR",
  liquidi: "Liquidi",
  altro: "Merce varia",
};
const VEHICLE_LABELS: Record<string, string> = {
  bilico: "Bilico",
  centinato: "Centinato",
  frigo: "Frigo",
  motrice: "Motrice",
  furgone: "Furgone",
  furgone_frigo: "Furgone frigo",
  pianale: "Pianale",
  cisterna: "Cisterna",
  ribaltabile: "Ribaltabile",
  altro: "Altro mezzo",
};

function normalizePhone(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let n = String(raw).replace(/[^0-9]/g, "");
  if (n.startsWith("00")) n = n.slice(2);
  if (n.startsWith("39") && n.length >= 11) return n;
  if (n.length >= 9 && n.length <= 11) return "39" + n;
  return n.length >= 10 ? n : null;
}

// Il prezzo nel DB e' in centesimi (integer).
function formatPrice(priceInCents: unknown): string {
  if (priceInCents === null || priceInCents === undefined || priceInCents === "") return "-";
  const cents = Number(priceInCents);
  if (Number.isNaN(cents)) return String(priceInCents);
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function formatDate(d: unknown): string {
  if (!d) return "-";
  const date = new Date(String(d));
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit", year: "numeric" });
}

async function sendWhatsApp(toPhone: string, params: string[]) {
  const body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    to: toPhone,
    type: "template",
    template: {
      name: TEMPLATE_NAME,
      language: { code: TEMPLATE_LANG },
      ...(TEMPLATE_NAME !== "hello_world" && params.length > 0
        ? { components: [{ type: "body", parameters: params.map((p) => ({ type: "text", text: String(p ?? "-") })) }] }
        : {}),
    },
  };
  const r = await fetch(`https://graph.facebook.com/v25.0/${PHONE_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  return { ok: r.ok, status: r.status, data };
}

async function logNotification(
  requestId: number | null,
  userId: number | null,
  phone: string,
  status: string,
  messageId: string | null,
  errorMessage: string | null,
) {
  if (!SUPABASE_URL || !SERVICE_KEY) return;
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/WhatsappNotification`, {
      method: "POST",
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ requestId, userId, phoneNumber: phone, status, messageId, errorMessage, createdAt: new Date().toISOString() }),
    });
    if (!r.ok) console.warn("log notification failed:", r.status, await r.text());
  } catch (e) {
    console.error("log error:", e);
  }
}

type Transporter = { id: number; phone: string; vehicleTypes: string[] | null; serviceRegions: string[] | null };

async function getTransporters(): Promise<Transporter[]> {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/User?role=eq.TRANSPORTER&whatsappOptIn=eq.true&select=id,phone,vehicleTypes,serviceRegions`,
    { headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` } },
  );
  if (!r.ok) {
    console.error("getTransporters failed:", r.status, await r.text());
    return [];
  }
  const list = await r.json();
  return Array.isArray(list) ? list.filter((u: Transporter) => u.phone) : [];
}

// deno-lint-ignore no-explicit-any
export function matches(t: Transporter, record: any): boolean {
  const regions = t.serviceRegions ?? [];
  if (regions.length > 0 && (record.pickupRegion || record.deliveryRegion)) {
    if (!regions.includes(record.pickupRegion) && !regions.includes(record.deliveryRegion)) return false;
  }
  const vehicles = t.vehicleTypes ?? [];
  if (vehicles.length > 0 && record.vehicleType && record.vehicleType !== "altro") {
    if (!vehicles.includes(record.vehicleType)) return false;
  }
  return true;
}

// --- Template v1 (5 variabili) ---
// deno-lint-ignore no-explicit-any
function buildLoadParams(record: any): string[] {
  const cargo = CARGO_LABELS[record.cargoType] ?? record.cargo ?? "Merce varia";
  const vehicle = VEHICLE_LABELS[record.vehicleType];
  const weight = record.weight ? `${Math.round(Number(record.weight)).toLocaleString("it-IT")} kg` : null;
  return [
    String(record.pickup ?? "-").substring(0, 60),
    String(record.delivery ?? "-").substring(0, 60),
    [cargo, vehicle, weight].filter(Boolean).join(" · ").substring(0, 60),
    formatDate(record.pickupDate),
    formatPrice(record.price),
  ];
}

// --- Template v2 (10 variabili, messaggio completo) ---
// Meta non accetta variabili vuote, a capo, tab o piu' di 4 spazi di fila.
function clean(v: unknown, max: number, fallback = "Non indicato"): string {
  const s = String(v ?? "").replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim();
  return (s || fallback).substring(0, max);
}

function placeLabel(city: unknown, prov: unknown, region: unknown, fallback: unknown): string {
  const c = String(city ?? "").trim();
  if (c) {
    const p = String(prov ?? "").trim();
    const r = String(region ?? "").trim();
    return clean(`${c}${p ? ` (${p})` : ""}${r ? `, ${r}` : ""}`, 80);
  }
  return clean(fallback, 80);
}

const NUM = String.raw`\d+(?:[.,]\d+)?`;
const DIMS_ONLY = new RegExp(String.raw`^${NUM}(?:\s*[x×]\s*${NUM}){1,2}\s*(cm|mm|m)?$`, "i");

export function formatVolume(raw: unknown): string | null {
  const s = String(raw ?? "").replace(/\s+/g, " ").trim();
  if (!s) return null;
  if (new RegExp(`^${NUM}$`).test(s)) return `${s} m³`;
  // "120X80X150" -> "120x80x150", anche dentro un testo piu' lungo.
  const v = s.replace(/(\d)\s*[x×]\s*(?=\d)/gi, "$1x");
  const dims = v.match(DIMS_ONLY);
  if (dims) return dims[1] ? v.replace(/\s*(cm|mm|m)$/i, ` ${dims[1].toLowerCase()}`) : `${v} cm`;
  return v;
}

// deno-lint-ignore no-explicit-any
function buildLoadParamsV2(record: any): string[] {
  const cargo = CARGO_LABELS[record.cargoType] ?? record.cargo ?? "Merce varia";
  const pallets = record.palletCount ? `${record.palletCount} pallet` : null;
  const weight = record.weight ? `${Math.round(Number(record.weight)).toLocaleString("it-IT")} kg` : null;
  const volume = formatVolume(record.volume);
  const adr = record.isAdr ? "ADR" : null;

  const km = Number(record.distanceKm);
  const price = Number(record.price);
  let distance = "Non indicata";
  if (km > 0) {
    distance = `${Math.round(km).toLocaleString("it-IT")} km`;
    if (price > 0) {
      const perKm = new Intl.NumberFormat("it-IT", {
        style: "currency",
        currency: "EUR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price / 100 / km);
      distance += ` (${perKm}/km)`;
    }
  }

  const payment = clean(record.paymentTerms, 80);
  const notes = String(record.description ?? "").replace(/[\r\n\t]+/g, " ").replace(/ {2,}/g, " ").trim();

  return [
    String(record.id ?? "-"),
    placeLabel(record.pickupCity, record.pickupProvince, record.pickupRegion, record.pickup),
    placeLabel(record.deliveryCity, record.deliveryProvince, record.deliveryRegion, record.delivery),
    distance,
    clean([cargo, pallets, weight, volume, adr].filter(Boolean).join(" · "), 120),
    clean(VEHICLE_LABELS[record.vehicleType], 40),
    formatDate(record.pickupDate),
    formatDate(record.deliveryDate),
    formatPrice(record.price),
    clean(notes ? `${payment}. Note: ${notes}` : payment, 250),
  ];
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  if (!WA_TOKEN) return new Response(JSON.stringify({ error: "WHATSAPP_TOKEN not configured" }), { status: 500 });

  try {
    const payload = await req.json();
    const record = payload?.record;

    if (!record) {
      const fakeParams = USE_V2
        ? [
            "0",
            "Brescia (BS), Lombardia",
            "Angri (SA), Campania",
            "812 km (1,54 €/km)",
            `Pallet · 33 pallet · 24.000 kg · ${formatVolume("120X80X150")}`,
            "Bilico",
            "15/05/2026",
            "17/05/2026",
            "1250 €",
            "60 giorni FM. Note: messaggio di prova",
          ]
        : ["Brescia (BS)", "Angri (SA)", "Pallet · Bilico · 12.000 kg", "15/05/2026", "1.200 €"];
      const test = await sendWhatsApp(SANDBOX_TEST_NUMBER, fakeParams);
      await logNotification(null, null, SANDBOX_TEST_NUMBER, test.ok ? "sent" : "failed", test.data?.messages?.[0]?.id ?? null, test.ok ? null : JSON.stringify(test.data));
      return new Response(JSON.stringify({ mode: "ping", template: TEMPLATE_NAME, lang: TEMPLATE_LANG, result: test }), { status: 200 });
    }

    let recipients: Array<{ id: number | null; phone: string }> = [];
    let skipped = 0;
    if (SANDBOX_ONLY) {
      recipients = [{ id: null, phone: SANDBOX_TEST_NUMBER }];
    } else {
      const transporters = await getTransporters();
      const seen = new Set<string>();
      for (const t of transporters) {
        if (!matches(t, record)) {
          skipped++;
          continue;
        }
        const phone = normalizePhone(t.phone);
        if (!phone || seen.has(phone)) continue;
        seen.add(phone);
        recipients.push({ id: t.id, phone });
      }
    }

    const params = USE_V2 ? buildLoadParamsV2(record) : buildLoadParams(record);
    const results = [];
    for (const r of recipients) {
      const send = await sendWhatsApp(r.phone, params);
      const messageId = send.data?.messages?.[0]?.id ?? null;
      const status = send.ok ? "sent" : "failed";
      const errorMsg = send.ok ? null : JSON.stringify(send.data?.error ?? send.data);
      await logNotification(record.id ?? null, r.id, r.phone, status, messageId, errorMsg);
      results.push({ phone: r.phone, status, messageId, error: errorMsg });
    }

    console.log(`load ${record.id}: ${results.filter((x) => x.status === "sent").length} sent, ${skipped} fuori zona/mezzo (template ${TEMPLATE_NAME})`);
    return new Response(
      JSON.stringify({
        requestId: record.id,
        sandboxOnly: SANDBOX_ONLY,
        template: TEMPLATE_NAME,
        sent: results.filter((x) => x.status === "sent").length,
        failed: results.filter((x) => x.status === "failed").length,
        skippedNotMatching: skipped,
        results,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("handler error:", e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }
});
