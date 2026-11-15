import test from "node:test";
import assert from "node:assert/strict";
import { weatherTodayCards } from "./weatherTodayCards.js";
test("daily rain drives interpretation independently of weekly deficits", () => {
  const cards = weatherTodayCards({ precip_mm: 25, net_water_balance_7d_mm: -60 });
  assert.equal(cards[1].palabra, "Lluvia abundante prevista");
  assert.match(cards[1].explicacion, /salidas de agua/);
});
test("missing and unusable data never imply calm conditions", () => {
  assert.ok(weatherTodayCards().every(card => card.tone === "unknown"));
  assert.ok(weatherTodayCards({ precip_mm: 0, wind_kmh: 0 }, false).every(card => card.tone === "unknown"));
  assert.equal(weatherTodayCards({ precip_mm: null })[1].tone, "unknown");
});
test("cold and wind advice address their actual hazards", () => {
  const cards = weatherTodayCards({ temp_min_c: 1, temp_max_c: 15, wind_kmh: 45 });
  assert.equal(cards[0].palabra, "Posible helada");
  assert.match(cards[2].explicacion, /sujeciones/);
});
test("invalid ranges are not interpreted", () => {
  const cards = weatherTodayCards({ temp_min_c: 20, temp_max_c: 10, precip_mm: -1, wind_kmh: -2 });
  assert.ok(cards.every(card => card.tone === "unknown"));
});
