import test from 'node:test';
import assert from 'node:assert/strict';
import { lightRainLabel } from './forecastLabels.js';
test('trace rainfall with 57 percent chance is not described as no rain', () => {
 assert.equal(lightRainLabel({precip_mm:.2,precip_prob_pct:57}), 'Posibilidad de lluvia: 57%');
});
test('missing probability is not converted to zero', () => {
 assert.match(lightRainLabel({precip_prob_pct:null}), /no disponible/);
 assert.match(lightRainLabel({}), /no disponible/);
});
test('zero probability is still a model probability rather than a guarantee', () => {
 assert.equal(lightRainLabel({precip_prob_pct:0}), 'Posibilidad de lluvia: 0%');
});
