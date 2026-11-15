import test from "node:test";
import assert from "node:assert/strict";
import { fetchZones, fetchCrops, fetchRecommendations } from "./apiClient.js";

function setup(t) {
  const stored = new Map();
  t.mock.method(globalThis, "fetch", async () => { throw new Error("offline"); });
  const original = globalThis.localStorage;
  globalThis.localStorage = { getItem: k => stored.get(k) ?? null, setItem: (k,v) => stored.set(k,v) };
  t.after(() => { if (original === undefined) delete globalThis.localStorage; else globalThis.localStorage = original; });
}

test("catalogs refresh online and remain available offline without a manual save", async t => {
  setup(t);
  let generation = 1;
  globalThis.fetch = async (url, options) => {
    assert.equal(options.cache, "no-store");
    return { ok: true, json: async () => [{ id: url, generation }] };
  };
  await fetchZones();
  generation = 2;
  const zones = await fetchZones();
  const crops = await fetchCrops();
  globalThis.fetch = async () => { throw new Error("offline"); };
  assert.deepEqual(await fetchZones(true), zones);
  assert.deepEqual(await fetchCrops(true), crops);
  assert.equal(zones[0].generation, 2);
});

test("an exact recommendation retains its original evaluation date and scores offline", async t => {
  setup(t);
  const payload = { zone_id: "z1", current_crop_id: "maiz", farmer_priorities: ["water_conservation"] };
  const result = { zone_id: "z1", evaluated_at: "2026-11-14T12:00:00Z", strategies: [{ strategy_id: "a", priority_alignment_score: .63 }] };
  globalThis.fetch = async () => ({ ok: true, json: async () => result });
  await fetchRecommendations(payload);
  const cached = await fetchRecommendations(payload, true);
  assert.deepEqual(cached.strategies, result.strategies);
  assert.equal(cached.evaluated_at, result.evaluated_at);
  assert.equal(cached.data_provenance.etl_status, "offline_cached_recommendation");
  const changed = await fetchRecommendations({ ...payload, current_crop_id: "papa" }, true);
  assert.notDeepEqual(changed.strategies, result.strategies);
});

test("a failed refresh preserves the last successful recommendation", async t => {
  setup(t);
  const payload = { zone_id: "z2" };
  const result = { zone_id: "z2", strategies: [{ strategy_id: "saved" }] };
  globalThis.fetch = async () => ({ ok: true, json: async () => result });
  await fetchRecommendations(payload);
  globalThis.fetch = async () => { throw new Error("server unavailable"); };
  assert.deepEqual((await fetchRecommendations(payload)).strategies, result.strategies);
});
