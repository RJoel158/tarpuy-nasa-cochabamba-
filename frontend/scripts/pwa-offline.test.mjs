import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const root = new URL("../dist/", import.meta.url);
const origin = "https://tarpuy.test";
const key = request => new URL(typeof request === "string" ? request : request.url, origin).href;
async function harness() {
  let online = true, skipped = false;
  const storage = new Map(), handlers = {};
  const network = async request => {
    if (!online) throw Error("Network offline");
    const path = new URL(key(request)).pathname;
    if (path === "/api/example") return Response.json({ fetched_at_utc: "2026-11-15T12:00:00Z", value: 42 });
    try { return new Response(await readFile(new URL(path === "/" ? "index.html" : path.slice(1), root))); }
    catch { return new Response("Missing", { status: 404 }); }
  };
  const caches = {
    async open(name) {
      if (!storage.has(name)) storage.set(name, new Map());
      const data = storage.get(name);
      return {
        async match(request) { return data.get(key(request))?.clone(); },
        async put(request, response) { data.set(key(request), response.clone()); },
        async keys() { return [...data.keys()].map(url => new Request(url)); },
        async addAll(requests) { for (const request of requests) { const response = await network(request); if (!response.ok) throw Error(`Precache failed ${request}`); data.set(key(request), response); } },
      };
    },
    async keys() { return [...storage.keys()]; },
    async delete(name) { return storage.delete(name); },
    async match(request) { for (const data of storage.values()) if (data.has(key(request))) return data.get(key(request)).clone(); },
  };
  const self = { location: { origin }, addEventListener(type, fn) { handlers[type] = fn; }, async skipWaiting() { skipped = true; }, clients: { async claim() {} } };
  vm.runInNewContext(await readFile(new URL("sw.js", root), "utf8"), { self, caches, fetch: network, URL, Response, Headers, console });
  return { caches, storage, setOnline: value => { online = value; }, skipped: () => skipped,
    async dispatch(type, request) {
      const waits = []; let response;
      handlers[type]({ request, waitUntil: task => waits.push(task), respondWith: task => { response = task; } });
      const value = response ? await response : undefined;
      await Promise.all(waits);
      return value;
    },
  };
}
const request = (path, mode = "cors") => ({ url: origin + path, method: "GET", mode });

test("first installation precaches every emitted JS/CSS asset and supports offline reload", async () => {
  const h = await harness(); await h.dispatch("install"); assert.equal(h.skipped(), true);
  h.setOnline(false);
  assert.match(await (await h.dispatch("fetch", request("/", "navigate"))).text(), /<div id="root">/);
  const assets = JSON.parse(await readFile(new URL("precache-manifest.json", root)));
  for (const asset of assets) assert.equal((await h.dispatch("fetch", request(asset))).status, 200);
});
test("offline API cache keeps original timestamp and missing entries return 503", async () => {
  const h = await harness(); await h.dispatch("install");
  await h.dispatch("fetch", request("/api/example")); h.setOnline(false);
  const copy = await h.dispatch("fetch", request("/api/example"));
  assert.equal(copy.headers.get("X-Tarpuy-Offline"), "1");
  assert.equal((await copy.json()).fetched_at_utc, "2026-11-15T12:00:00Z");
  assert.equal((await h.dispatch("fetch", request("/api/not-downloaded"))).status, 503);
});
test("update preserves saved API/audio and unrelated caches, without copying old bundles", async () => {
  const h = await harness();
  const old = await h.caches.open("tarpuy-nasa-v9-partner-logos");
  await old.put("/api/example", Response.json({ old: true }));
  await old.put("/audio/quh/saved.wav", new Response("audio"));
  await old.put("/assets/obsolete.js", new Response("old bundle"));
  await h.caches.open("other-app-cache");
  await h.dispatch("install"); await h.dispatch("activate");
  assert.equal(h.storage.has("other-app-cache"), true);
  assert.equal(h.storage.has("tarpuy-nasa-v9-partner-logos"), false);
  assert.equal(await (await h.caches.match("/audio/quh/saved.wav")).text(), "audio");
  assert.deepEqual(await (await h.caches.match("/api/example")).json(), { old: true });
  assert.equal(await h.caches.match("/assets/obsolete.js"), undefined);
});
test("failed precache does not activate an incomplete offline shell", async () => {
  const h = await harness(); h.setOnline(false);
  await assert.rejects(h.dispatch("install")); assert.equal(h.skipped(), false);
});
test("manifest has real PNG icons and a versioned production worker", async () => {
  const manifest = JSON.parse(await readFile(new URL("manifest.json", root)));
  assert.equal(manifest.display, "standalone"); assert.equal(manifest.scope, "/");
  for (const icon of manifest.icons) {
    const bytes = await readFile(new URL(icon.src.slice(1), root));
    assert.equal(bytes.readUInt32BE(16), Number(icon.sizes.split("x")[0]));
    assert.equal(bytes.readUInt32BE(20), Number(icon.sizes.split("x")[1]));
  }
  assert.ok(manifest.icons.some(icon => icon.purpose === "maskable"));
  assert.doesNotMatch(await readFile(new URL("sw.js", root), "utf8"), /__BUILD_ID__/);
});
