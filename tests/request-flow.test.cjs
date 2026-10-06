const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const flow = require(path.join(process.env.FLOW_TEST_BUILD, "request-flow.js"));

const NOW = new Date("2026-10-06T12:00:00");

test("ci si candida solo a carichi aperti con ritiro non passato", () => {
  assert.equal(flow.canApply({ status: "OPEN", pickupDate: "2026-10-10" }, NOW), true);
  assert.equal(flow.canApply({ status: "OPEN", pickupDate: null }, NOW), true);
  assert.equal(flow.canApply({ status: "OPEN", pickupDate: "2026-10-05" }, NOW), true, "il giorno dopo il ritiro si accetta ancora");
  assert.equal(flow.canApply({ status: "OPEN", pickupDate: "2026-10-01" }, NOW), false);
  for (const s of ["ASSIGNED", "CONFIRMED", "DELIVERED", "CANCELLED"]) {
    assert.equal(flow.canApply({ status: s, pickupDate: "2026-10-10" }, NOW), false, s);
  }
});

test("il trasportatore scelto si sostituisce solo dopo 24 ore", () => {
  assert.equal(flow.canRelease(null, NOW), false);
  assert.equal(flow.canRelease(new Date(NOW.getTime() - 23 * 3600e3), NOW), false);
  assert.equal(flow.canRelease(new Date(NOW.getTime() - 24 * 3600e3), NOW), true);
});

test("commissione sul prezzo proposto, altrimenti su quello del carico", () => {
  assert.equal(flow.effectivePriceCents(80000, null), 80000);
  assert.equal(flow.effectivePriceCents(80000, 0), 80000);
  assert.equal(flow.effectivePriceCents(80000, 95000), 95000);
});

test("la chat oscura telefoni, email e link prima della conferma", () => {
  const cases = [
    "chiamami al 333 123 4567",
    "+39 333-1234567",
    "scrivi a mario.rossi@gmail.com",
    "mario punto rossi at gmail dot com".replace("punto", "."),
    "wa.me/393331234567",
    "tel 0815551234",
  ];
  for (const c of cases) {
    const r = flow.maskContacts(c);
    assert.equal(r.masked, true, c);
    assert.doesNotMatch(r.text, /\d{7,}/, c);
    assert.doesNotMatch(r.text, /@/, c);
  }
});

test("la chat lascia intatti prezzi, pesi e date", () => {
  for (const c of ["Faccio 1.200 euro", "33 pallet, 24.000 kg", "ritiro il 12/10 alle 8", "bilico 13,6 m", "consegna il 12/10/2026", "dal 12-10-2026"]) {
    const r = flow.maskContacts(c);
    assert.equal(r.masked, false, c);
    assert.equal(r.text, c);
  }
});

test("etichette per tutti gli stati", () => {
  for (const s of Object.values(flow.REQUEST_STATUS)) assert.ok(flow.REQUEST_STATUS_LABELS[s], s);
  for (const s of Object.values(flow.APPLICATION_STATUS)) assert.ok(flow.APPLICATION_STATUS_LABELS[s], s);
});

const catalog = require(path.join(process.env.FLOW_TEST_BUILD, "catalog.js"));

test("importi in euro scritti in tutti i modi comuni", () => {
  const cases = {
    "1200": 120000,
    "1.200": 120000,
    "1.200,50": 120050,
    "950,50": 95050,
    "950.50": 95050,
    "12.000": 1200000,
    "€ 800": 80000,
  };
  for (const [input, cents] of Object.entries(cases)) assert.equal(catalog.parseEuroToCents(input), cents, input);
  for (const bad of ["", "abc", "-5", "0", "1,2,3", "12.34.5"]) assert.equal(catalog.parseEuroToCents(bad), null, bad);
  assert.equal(catalog.priceOutOfRange(4999), true);
  assert.equal(catalog.priceOutOfRange(120000), false);
});

test("distanza stradale stimata Brescia-Angri plausibile", () => {
  const km = catalog.estimateRoadKm({ lat: 45.5325, lng: 10.2259 }, { lat: 40.7409, lng: 14.5682 });
  assert.ok(km > 700 && km < 900, String(km));
});
