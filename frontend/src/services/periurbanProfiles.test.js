import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildMunicipalContextPayload,
  chipLabel,
  isNearDrainage,
  resolvePeriurbanProfile,
} from "./periurbanProfiles.js";

test("D9 maps to La Maica and valle zone", () => {
  const p = resolvePeriurbanProfile("D9");
  assert.equal(p.alias, "La Maica");
  assert.equal(p.zone_id, "punata_valle_alto");
  assert.equal(chipLabel(p, "es"), "Distrito 9 · La Maica");
});

test("D13 maps to Tunari ladera zone", () => {
  const p = resolvePeriurbanProfile("13");
  assert.equal(p.code, "D13");
  assert.equal(p.zone_id, "tapacari_zona_andina");
  assert.equal(p.slope_bias, "ladera");
});

test("drainage detection and municipal payload", () => {
  assert.equal(isNearDrainage({ clasificacion: "Quebradas" }), true);
  const ctx = buildMunicipalContextPayload({
    districtCode: "D9",
    comuna: "Itocta",
    periurban: { periurban: "Periurbanos en crecimiento" },
    drainage: { tipo: "3", clasificacion: "Quebradas" },
    bulletin: {
      current_conditions: { soil_moisture_top_pct: 40 },
      predictions_summary: { net_water_balance_7d_mm: 2 },
      seven_day_forecast: [{ precip_mm: 12 }],
    },
  });
  assert.equal(ctx.district_code, "D9");
  assert.equal(ctx.near_drainage, true);
  assert.equal(ctx.wet_bulletin, true);
  assert.equal(ctx.periurban_class, "growth");
});
