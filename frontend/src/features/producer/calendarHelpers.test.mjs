import test from "node:test";
import assert from "node:assert/strict";
import { stageMonthIndices, resolveMonthCell, formatStageRange } from "./calendarHelpers.js";

const sequence = [
  { crop_id: "maiz_valle", start_month: 10, end_month: 2 },
  { crop_id: "avena_vicia", start_month: 3, end_month: 6 },
  { crop_id: "mulch_residue", start_month: 7, end_month: 9 },
];

test("cada paso selecciona su intervalo completo, incluso al cruzar de año", () => {
  assert.deepEqual(sequence.map(stageMonthIndices), [
    [9, 10, 11, 0, 1], [2, 3, 4, 5], [6, 7, 8],
  ]);
  assert.equal(new Set(sequence.flatMap(stageMonthIndices)).size, 12);
});

test("los meses seleccionados coinciden con el cultivo y la duración mostrados", () => {
  for (const stage of sequence) {
    const months = stageMonthIndices(stage);
    assert.match(formatStageRange(stage.start_month, stage.end_month), new RegExp(`${months.length} meses$`));
    for (const month of months) {
      assert.equal(resolveMonthCell(month, sequence).cropId, stage.crop_id);
    }
  }
  assert.equal(resolveMonthCell(2, sequence).accionVisual, "sembrar");
  assert.equal(resolveMonthCell(5, sequence).accionVisual, "cosechar");
  for (const month of [6, 7, 8]) assert.equal(resolveMonthCell(month, sequence).accionVisual, "cubrir");
});

test("admite un mes, un año completo y rechaza intervalos incompletos", () => {
  assert.deepEqual(stageMonthIndices({ start_month: 4, end_month: 4 }), [3]);
  assert.equal(stageMonthIndices({ start_month: 1, end_month: 12 }).length, 12);
  for (const stage of [null, {}, { start_month: 0, end_month: 3 }, { start_month: 3, end_month: 13 }]) {
    assert.deepEqual(stageMonthIndices(stage), []);
  }
});
