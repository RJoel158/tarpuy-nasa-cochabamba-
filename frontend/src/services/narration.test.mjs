import test from "node:test";
import assert from "node:assert/strict";
import { buildStrategyNarration } from "./narration.js";

test("narration follows visible months rather than overlapping crop ranges", () => {
  const strategy = { crop_sequence: [
    { crop_id: "haba", crop_name: "Haba Pairumani", start_month: 11, end_month: 5 },
    { crop_id: "quinua", crop_name: "Quinua Real de Valle", start_month: 10, end_month: 4 },
    { crop_id: "avena_vicia", crop_name: "Avena con Vicia", start_month: 2, end_month: 6 },
  ] };
  const indicators = [7, 8, 9].map((month) => ({ month, bare_soil_flag: true }));
  const text = buildStrategyNarration(strategy, "es", indicators);
  const expected = [
    "De Enero a Mayo, Haba Pairumani.",
    "En Junio, Avena con Vicia.",
    "De Julio a Septiembre, tierra pelada, sin cobertura.",
    "En Octubre, Quinua Real de Valle.",
    "De Noviembre a Diciembre, Haba Pairumani.",
  ];
  let previous = -1;
  for (const phrase of expected) {
    const position = text.indexOf(phrase);
    assert.ok(position > previous, phrase);
    previous = position;
  }
  assert.ok(text.includes("superpuestos"));
  assert.ok(!text.includes("calendario muestra"));
  assert.ok(!text.includes("Primera etapa"));
});

test("explains a documented purpose once and preserves Quechua month ranges and warnings", () => {
  const strategy = { crop_sequence: [
    { crop_id: "haba", crop_name: "Haba", start_month: 11, end_month: 5, agronomic_role: "Fijación de nitrógeno" },
    { crop_id: "avena_vicia", crop_name: "Avena con Vicia", start_month: 2, end_month: 6, agronomic_role: "Forraje" },
  ] };
  const es = buildStrategyNarration(strategy);
  assert.equal(es.match(/Ayuda a aportar nitrógeno/g).length, 1);
  assert.ok(es.includes("alimento para los animales"));
  const qu = buildStrategyNarration(strategy, "qu");
  assert.ok(qu.includes("Enero killamanta Mayo killakama, Hawas,"));
  assert.ok(qu.includes("uywakunapaq mikhuna."));
  assert.ok(qu.includes("Yachaqwan tapurikuy"));
  assert.ok(qu.includes("Avenawan wikawan"));
});
