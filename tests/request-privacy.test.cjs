const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const {
  buildRequestsListPayload,
  canViewRequestContacts,
  redactRequestContacts,
  requestsWhereClauseForRole,
} = require(path.join(process.env.PRIVACY_TEST_BUILD, "request-privacy.js"));

const COMPANY_ID = 7;
const TRANSPORTER_ID = 42;

const EMAIL = "logistica@azienda-test.example";
const PHONE = "+39 055 0000000";
const PICKUP_CONTACT = "Mario Referente";
const PICKUP_PHONE = "+39 333 0000000";

// Stessa forma della riga selezionata da GET /api/requests.
function row(overrides = {}) {
  return {
    id: 1,
    pickup: "Firenze",
    delivery: "Milano",
    cargo: "Pallet",
    price: 120000,
    createdAt: new Date("2026-01-02T10:00:00.000Z"),
    transporterId: null,
    companyId: COMPANY_ID,
    contactsUnlocked: false,
    company: { email: EMAIL, phone: PHONE, companyName: "Azienda Test SRL" },
    ...overrides,
  };
}

const unlocked = { unlockedByMe: true, unlockedByOther: true, bothUnlocked: true };
const notUnlocked = { unlockedByMe: false, unlockedByOther: false, bothUnlocked: false };

// Il payload viene serializzato come lo serializza NextResponse.json.
function asJson(payload) {
  return JSON.stringify(payload);
}

test("la bacheca trasportatore filtra su carichi liberi e ancora aperti", () => {
  assert.deepEqual(requestsWhereClauseForRole("TRANSPORTER", TRANSPORTER_ID), {
    transporterId: null,
    status: "OPEN",
  });
  assert.deepEqual(requestsWhereClauseForRole("COMPANY", COMPANY_ID), {
    companyId: COMPANY_ID,
  });
  assert.equal(requestsWhereClauseForRole("ADMIN", 1), undefined);
});

test("GET da trasportatore senza sblocco non contiene email ne telefono", () => {
  const payload = buildRequestsListPayload([row(), row({ id: 2 })], new Map(), {
    id: TRANSPORTER_ID,
    role: "TRANSPORTER",
  });

  const json = asJson(payload);
  assert.ok(!json.includes(EMAIL), "l'email dell'azienda non deve uscire dalla API");
  assert.ok(!json.includes(PHONE), "il telefono dell'azienda non deve uscire dalla API");
  assert.ok(!json.includes("@"), "nessun indirizzo email nel payload");

  for (const item of payload) {
    assert.equal(item.company.email, null);
    assert.equal(item.company.phone, null);
    // I dati non sensibili restano: la lista deve continuare a funzionare.
    assert.equal(item.company.companyName, "Azienda Test SRL");
    assert.equal(item.pickup, "Firenze");
    assert.equal(item.unlockedForCurrentUser, false);
  }
});

test("il trasportatore che ha sbloccato vede i contatti", () => {
  const [item] = buildRequestsListPayload(
    [row()],
    new Map([[1, unlocked]]),
    { id: TRANSPORTER_ID, role: "TRANSPORTER" },
  );

  assert.equal(item.company.email, EMAIL);
  assert.equal(item.company.phone, PHONE);
  assert.equal(item.unlockedForCurrentUser, true);
  assert.equal(item.bothPartiesUnlocked, true);
});

test("uno sblocco altrui non basta: conta solo unlockedByMe", () => {
  const [item] = buildRequestsListPayload(
    [row()],
    new Map([[1, { unlockedByMe: false, unlockedByOther: true, bothUnlocked: false }]]),
    { id: TRANSPORTER_ID, role: "TRANSPORTER" },
  );

  assert.equal(item.company.email, null);
  assert.equal(item.company.phone, null);
  assert.equal(item.unlockedByOtherParty, true);
});

test("il proprietario del carico e l'admin vedono sempre i contatti", () => {
  const owner = buildRequestsListPayload([row()], new Map(), {
    id: COMPANY_ID,
    role: "COMPANY",
  });
  assert.equal(owner[0].company.email, EMAIL);

  const admin = buildRequestsListPayload([row()], new Map(), { id: 999, role: "ADMIN" });
  assert.equal(admin[0].company.email, EMAIL);
});

test("un'altra azienda non vede i contatti di un carico non suo", () => {
  const [item] = buildRequestsListPayload([row()], new Map(), {
    id: COMPANY_ID + 1,
    role: "COMPANY",
  });
  assert.equal(item.company.email, null);
  assert.equal(item.company.phone, null);
});

test("pickupContact e pickupPhone vengono azzerati solo se presenti", () => {
  const withContacts = redactRequestContacts(
    row({ pickupContact: PICKUP_CONTACT, pickupPhone: PICKUP_PHONE }),
    { id: TRANSPORTER_ID, role: "TRANSPORTER" },
    false,
  );
  assert.equal(withContacts.pickupContact, null);
  assert.equal(withContacts.pickupPhone, null);
  assert.ok(!asJson([withContacts]).includes(PICKUP_PHONE));

  const withoutContacts = redactRequestContacts(
    row(),
    { id: TRANSPORTER_ID, role: "TRANSPORTER" },
    false,
  );
  assert.ok(!("pickupContact" in withoutContacts));
  assert.ok(!("pickupPhone" in withoutContacts));
});

test("la redazione non muta la riga in ingresso", () => {
  const original = row({ pickupPhone: PICKUP_PHONE });
  redactRequestContacts(original, { id: TRANSPORTER_ID, role: "TRANSPORTER" }, false);
  assert.equal(original.company.email, EMAIL);
  assert.equal(original.company.phone, PHONE);
  assert.equal(original.pickupPhone, PICKUP_PHONE);
});

test("una riga senza relazione company non fa esplodere la redazione", () => {
  const item = redactRequestContacts(
    { id: 1, companyId: COMPANY_ID, company: null },
    { id: TRANSPORTER_ID, role: "TRANSPORTER" },
    false,
  );
  assert.equal(item.company, null);
});

test("senza sessione non si vede nulla", () => {
  assert.equal(canViewRequestContacts({ companyId: COMPANY_ID }, null, true), false);
});
