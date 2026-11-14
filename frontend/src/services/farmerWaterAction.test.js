import test from "node:test";
import assert from "node:assert/strict";
import { decideFarmerWaterAction } from "./farmerWaterAction.js";
import { buildWaterActionNarration } from "./narration.js";
import { waterActionText } from "../utils/quechuaI18n.js";

const bulletin = (soil = 20, balance = -15, minimum = 8, rain = 0) => ({
  current_conditions: { soil_moisture_top_pct: soil },
  predictions_summary: { net_water_balance_7d_mm: balance, min_temp_7d_c: minimum },
  seven_day_forecast: [{ precip_mm: rain }],
});
const creek = { tipo: "Quebrada", clasificacion: "Tributario" };
for (const [name, data, drainage, code, reason] of [
  ["seco sin GPS", bulletin(), null, "IRRIGATE", "dry"],
  ["húmedo y quebrada", bulletin(30, 2), creek, "CAUTION", "drainage"],
  ["helada prioritaria", bulletin(30, 2, 2, 15), creek, "WAIT", "frost"],
  ["lluvia fuerte sobre suelo seco", bulletin(20, -15, 8, 10), null, "CAUTION", "rain"],
  ["agua aceptable", bulletin(26, -11), null, "WAIT", "stable"],
  ["balance límite", bulletin(30, -12), null, "IRRIGATE", "dry"],
  ["sin boletín", null, null, "WAIT", "missing"],
  ["humedad ausente", bulletin(null), null, "WAIT", "missing"],
  ["humedad inválida", bulletin(-999), null, "WAIT", "missing"],
  ["seco junto a drenaje", bulletin(), creek, "WAIT", "check"],
]) test(name, () => assert.deepEqual(decideFarmerWaterAction(data, drainage), { code, reason }));

for (const lang of ["es", "qu"]) test(`audio coincide con tarjeta ${lang}`, () => {
  const action = decideFarmerWaterAction(bulletin());
  const text = waterActionText(action, lang);
  const narration = buildWaterActionNarration(action, lang);
  assert.ok(narration.includes(text.title));
  assert.ok(narration.includes(text.message));
});
