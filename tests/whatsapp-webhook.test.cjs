const { test } = require("node:test");
const assert = require("node:assert/strict");
const { createHmac } = require("node:crypto");
const path = require("node:path");
const { createWhatsAppWebhook, MAX_WEBHOOK_BYTES } = require(
  path.join(process.env.WHATSAPP_TEST_BUILD, "whatsapp-webhook.js")
);

const config = {
  verifyToken: "test-only-verify-token-32-characters-minimum",
  appSecret: "test-only-app-secret",
  wabaId: "100000000000001",
  phoneNumberId: "100000000000002",
};
const url = "https://example.test/api/whatsapp/webhook";
const message = () => ({ field: "messages", value: {
  metadata: { phone_number_id: config.phoneNumberId },
  messages: [{ id: "wamid.test", from: "390000000000", text: { body: "PRIVATE TEST MESSAGE" } }],
} });
const envelope = (changes = [message()]) => ({
  object: "whatsapp_business_account", entry: [{ id: config.wabaId, changes }],
});
function fixture(overrides = {}) {
  const rows = new Map();
  const logs = [];
  const handlers = createWhatsAppWebhook({
    config: () => config,
    persist: async row => { if (!rows.has(row.id)) rows.set(row.id, row); },
    log: value => logs.push(value), ...overrides,
  });
  return { ...handlers, rows, logs };
}
function signed(body = JSON.stringify(envelope()), headers = {}) {
  return new Request(url, { method: "POST", body, headers: {
    "content-type": "application/json",
    "x-hub-signature-256": "sha256=" + createHmac("sha256", config.appSecret).update(body).digest("hex"),
    ...headers,
  } });
}
function verification(overrides = {}) {
  return new Request(url + "?" + new URLSearchParams({
    "hub.mode": "subscribe", "hub.verify_token": config.verifyToken,
    "hub.challenge": "123456789", ...overrides,
  }));
}

test("verification returns exact plain-text challenge, without cache", async () => {
  const f = fixture();
  const result = await f.GET(verification());
  assert.equal(result.status, 200);
  assert.equal(await result.text(), "123456789");
  assert.match(result.headers.get("content-type"), /^text\/plain/);
  assert.equal(result.headers.get("cache-control"), "no-store");
  assert.equal(f.rows.size, 0);
});

test("incorrect token, missing challenge, duplicate parameters and wrong mode are rejected", async () => {
  const f = fixture();
  assert.equal((await f.GET(verification({ "hub.verify_token": "wrong" }))).status, 403);
  assert.equal((await f.GET(verification({ "hub.challenge": "" }))).status, 400);
  assert.equal((await f.GET(verification({ "hub.mode": "unsubscribe" }))).status, 400);
  assert.equal((await f.GET(new Request(verification().url + "&hub.challenge=other"))).status, 400);
  assert.equal((await f.GET(new Request(url))).status, 400);
});

test("incomplete configuration fails closed for both methods", async () => {
  for (const key of Object.keys(config)) {
    const f = fixture({ config: () => ({ ...config, [key]: undefined }) });
    assert.equal((await f.GET(verification())).status, 503);
    assert.equal((await f.POST(signed())).status, 503);
    assert.equal(f.rows.size, 0);
  }
  assert.equal((await fixture({ config: () => ({ ...config, verifyToken: "short" }) }).GET(verification())).status, 503);
});

test("valid signed messages, Unicode and statuses are saved before acknowledgement", async () => {
  const changes = [message(), { field: "messages", value: {
    metadata: { phone_number_id: config.phoneNumberId }, statuses: [{ id: "wamid.test", status: "delivered" }],
  } }];
  changes[0].value.messages[0].text.body = "Caffè 🚚";
  const f = fixture();
  const result = await f.POST(signed(JSON.stringify(envelope(changes), null, 2)));
  assert.equal(result.status, 200);
  assert.deepEqual(await result.json(), { received: true });
  assert.equal(f.rows.size, 1);
  assert.deepEqual([...f.rows.values()][0].payload, envelope(changes));
});

test("missing, malformed, incorrect and tampered signatures never reach storage", async () => {
  const f = fixture();
  for (const signature of ["", "sha256=bad", "sha1=" + "a".repeat(64), "sha256=" + "0".repeat(64)]) {
    assert.equal((await f.POST(signed(undefined, { "x-hub-signature-256": signature }))).status, 401);
  }
  const original = JSON.stringify(envelope());
  const signature = "sha256=" + createHmac("sha256", config.appSecret).update(original).digest("hex");
  assert.equal((await f.POST(signed(original + " ", { "x-hub-signature-256": signature }))).status, 401);
  assert.equal(f.rows.size, 0);
});

test("signed invalid JSON and malformed WhatsApp envelopes return 400", async () => {
  const f = fixture();
  for (const value of ["{", "null", "[]", "{}", JSON.stringify({ object: "other", entry: [] }),
    JSON.stringify(envelope([{ field: "messages", value: {} }]))]) {
    assert.equal((await f.POST(signed(value))).status, 400);
  }
  assert.equal((await f.POST(signed(undefined, { "content-type": "text/plain" }))).status, 415);
  assert.equal(f.rows.size, 0);
});

test("other WABAs and phone IDs are acknowledged but not stored", async () => {
  const f = fixture();
  const other = envelope(); other.entry[0].id = "999";
  const result = await f.POST(signed(JSON.stringify(other)));
  assert.deepEqual(await result.json(), { received: true, ignored: true });
  const otherPhone = message(); otherPhone.value.metadata.phone_number_id = "999";
  assert.equal((await f.POST(signed(JSON.stringify(envelope([otherPhone]))))).status, 200);
  assert.equal(f.rows.size, 0);
  await f.POST(signed(JSON.stringify(envelope([otherPhone, message()]))));
  assert.deepEqual([...f.rows.values()][0].payload.entry[0].changes, [message()]);
});

test("WABA template updates are stored without requiring phone metadata", async () => {
  const f = fixture();
  const update = { field: "message_template_status_update", value: { event: "APPROVED", message_template_id: "123" } };
  assert.equal((await f.POST(signed(JSON.stringify(envelope([update]))))).status, 200);
  assert.equal(f.rows.size, 1);
});

test("identical redeliveries use a stable key, while changed status creates a new receipt", async () => {
  const f = fixture();
  const results = await Promise.all([f.POST(signed()), f.POST(signed())]);
  assert.ok(results.every(r => r.status === 200));
  assert.equal(f.rows.size, 1);
  const updated = envelope(); updated.entry[0].changes[0].value.messages[0].text.body = "different";
  await f.POST(signed(JSON.stringify(updated)));
  assert.equal(f.rows.size, 2);
});

test("awaits storage; database failure returns 503 without leaking data", async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const f = fixture({ persist: () => pending });
  let acknowledged = false;
  const response = f.POST(signed()).then(result => { acknowledged = true; return result; });
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(acknowledged, false);
  finish();
  assert.equal((await response).status, 200);
  const failed = fixture({ persist: async () => { throw new Error("secret database connection string"); } });
  const result = await failed.POST(signed());
  assert.equal(result.status, 503);
  assert.doesNotMatch(await result.text(), /secret database/);
  assert.deepEqual(failed.logs, ["[whatsapp-webhook] storage_failed"]);
  assert.doesNotMatch(f.logs.join(" "), /PRIVATE TEST MESSAGE|390000000000|test-only/);
});

test("oversized bodies are rejected with and without Content-Length", async () => {
  const f = fixture();
  const body = " ".repeat(MAX_WEBHOOK_BYTES + 1);
  assert.equal((await f.POST(signed(body))).status, 413);
  assert.equal((await f.POST(signed("{}", { "content-length": String(MAX_WEBHOOK_BYTES + 1) }))).status, 413);
  assert.equal(f.rows.size, 0);
});
