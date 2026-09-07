import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Below Vercel's request limit; count streamed bytes, not only Content-Length.
export const MAX_WEBHOOK_BYTES = 3 * 1024 * 1024;

type JsonObject = Record<string, unknown>;
export type WhatsAppConfig = {
  verifyToken?: string;
  appSecret?: string;
  wabaId?: string;
  phoneNumberId?: string;
};
export type WebhookReceipt = {
  id: string;
  wabaId: string;
  phoneNumberId: string;
  payload: JsonObject;
};
type Dependencies = {
  config: () => WhatsAppConfig;
  // Resolve only after durable storage. A duplicate receipt is also success.
  persist: (receipt: WebhookReceipt) => Promise<void>;
  log?: (message: string) => void;
};

function object(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function configured(config: WhatsAppConfig): config is Required<WhatsAppConfig> {
  return Boolean(
    config.verifyToken && config.verifyToken.length >= 32 && config.appSecret &&
    config.wabaId && /^\d+$/.test(config.wabaId) &&
    config.phoneNumberId && /^\d+$/.test(config.phoneNumberId)
  );
}

function equalSecret(left: string, right: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(left).digest(),
    createHash("sha256").update(right).digest()
  );
}

function json(body: JsonObject, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

class BodyTooLarge extends Error {}

async function readBody(request: Request): Promise<Buffer> {
  const declared = request.headers.get("content-length");
  if (declared !== null && Number(declared) > MAX_WEBHOOK_BYTES) throw new BodyTooLarge();
  if (!request.body) return Buffer.alloc(0);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let bytes = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_WEBHOOK_BYTES) {
        await reader.cancel();
        throw new BodyTooLarge();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, bytes);
}

// Keep only the configured WABA and, for messages/statuses, the configured phone.
// WABA-level events (e.g. template updates) do not carry phone metadata.
function selectPayload(payload: unknown, config: Required<WhatsAppConfig>): JsonObject | null {
  if (!object(payload) || payload.object !== "whatsapp_business_account" ||
      !Array.isArray(payload.entry) || payload.entry.length === 0) throw new Error("Invalid envelope");
  const entries: JsonObject[] = [];
  for (const entry of payload.entry) {
    if (!object(entry) || typeof entry.id !== "string" || !Array.isArray(entry.changes)) {
      throw new Error("Invalid entry");
    }
    if (entry.id !== config.wabaId) continue;
    const changes: JsonObject[] = [];
    for (const change of entry.changes) {
      if (!object(change) || typeof change.field !== "string" || !object(change.value)) {
        throw new Error("Invalid change");
      }
      if (change.field === "messages") {
        const metadata = change.value.metadata;
        if (!object(metadata) || typeof metadata.phone_number_id !== "string") {
          throw new Error("Missing phone metadata");
        }
        if (metadata.phone_number_id !== config.phoneNumberId) continue;
      }
      changes.push(change);
    }
    if (changes.length) entries.push({ ...entry, changes });
  }
  return entries.length ? { object: payload.object, entry: entries } : null;
}

export function createWhatsAppWebhook({ config: readConfig, persist, log = console.info }: Dependencies) {
  return {
    async GET(request: Request): Promise<Response> {
      const config = readConfig();
      if (!configured(config)) return json({ error: "Webhook not configured" }, 503);
      const params = new URL(request.url).searchParams;
      const mode = params.get("hub.mode");
      const token = params.get("hub.verify_token");
      const challenge = params.get("hub.challenge");
      if (mode !== "subscribe" || !token || !challenge ||
          ["hub.mode", "hub.verify_token", "hub.challenge"].some(key => params.getAll(key).length !== 1)) {
        return json({ error: "Invalid verification request" }, 400);
      }
      if (!equalSecret(token, config.verifyToken)) return json({ error: "Forbidden" }, 403);
      // Return the challenge verbatim, without JSON quotes or an HTML response.
      return new Response(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
      });
    },

    async POST(request: Request): Promise<Response> {
      const config = readConfig();
      if (!configured(config)) return json({ error: "Webhook not configured" }, 503);
      const signature = request.headers.get("x-hub-signature-256");
      const match = signature?.match(/^sha256=([a-fA-F0-9]{64})$/);
      if (!match) return json({ error: "Invalid signature" }, 401);
      if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
        return json({ error: "Expected application/json" }, 415);
      }
      let rawBody: Buffer;
      try {
        rawBody = await readBody(request);
      } catch (error) {
        return json({ error: error instanceof BodyTooLarge ? "Payload too large" : "Invalid body" },
          error instanceof BodyTooLarge ? 413 : 400);
      }
      const expected = createHmac("sha256", config.appSecret).update(rawBody).digest();
      if (!timingSafeEqual(expected, Buffer.from(match[1], "hex"))) {
        return json({ error: "Invalid signature" }, 401);
      }
      let payload: JsonObject | null;
      try {
        payload = selectPayload(JSON.parse(rawBody.toString("utf8")), config);
      } catch {
        return json({ error: "Invalid WhatsApp payload" }, 400);
      }
      // An app may receive events for other assets. Acknowledge, but do not store them.
      if (!payload) return json({ received: true, ignored: true });
      const id = createHash("sha256").update(JSON.stringify(payload)).digest("hex");
      try {
        await persist({ id, wabaId: config.wabaId, phoneNumberId: config.phoneNumberId, payload });
      } catch {
        // Do not log payloads, sender numbers, signatures, secrets or database errors.
        log("[whatsapp-webhook] storage_failed");
        return json({ error: "Temporary storage failure" }, 503);
      }
      log(`[whatsapp-webhook] receipt_stored ${id}`);
      return json({ received: true });
    },
  };
}
