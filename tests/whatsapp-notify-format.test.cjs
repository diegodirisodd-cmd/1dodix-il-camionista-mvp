const { test } = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { formatVolume } = require(path.join(process.env.WHATSAPP_TEST_BUILD, "format-volume.js"));

test("numero nudo -> m³", () => {
  assert.equal(formatVolume("80"), "80 m³");
  assert.equal(formatVolume("13,6"), "13,6 m³");
  assert.equal(formatVolume(" 80 "), "80 m³");
});

test("misure tutte intere -> cm, x minuscola", () => {
  assert.equal(formatVolume("120X80X150"), "120x80x150 cm");
  assert.equal(formatVolume("300x100x120"), "300x100x120 cm");
  assert.equal(formatVolume("120 x 80 x 150"), "120x80x150 cm");
  assert.equal(formatVolume("80×120"), "80x120 cm");
});

test("misure miste o decimali -> nessuna unita'", () => {
  assert.equal(formatVolume("120X80X1.40"), "120x80x1.40");
  assert.equal(formatVolume("1,2x0,8x1,5"), "1,2x0,8x1,5");
});

test("misure con unita' esplicita -> unita' mantenuta", () => {
  assert.equal(formatVolume("120 x 80 x 150 CM"), "120x80x150 cm");
  assert.equal(formatVolume("2,4x1,2x1,4 m"), "2,4x1,2x1,4 m");
});

test("testo libero -> invariato, mai m³ o cm aggiunti", () => {
  assert.equal(formatVolume("8 metri"), "8 metri");
  assert.equal(formatVolume("5 posti pallet 10m quadri"), "5 posti pallet 10m quadri");
  assert.equal(formatVolume("5 pallet 80X120 170h"), "5 pallet 80x120 170h");
  assert.equal(formatVolume("80 m³"), "80 m³");
});

test("vuoto -> null", () => {
  assert.equal(formatVolume(""), null);
  assert.equal(formatVolume("   "), null);
  assert.equal(formatVolume(null), null);
  assert.equal(formatVolume(undefined), null);
});
