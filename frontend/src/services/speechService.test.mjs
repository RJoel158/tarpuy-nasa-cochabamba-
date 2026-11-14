import test from "node:test";
import assert from "node:assert/strict";
import { speakSpanish, speakQuechua, stopSpeaking } from "./speechService.js";

test("authorizes audio before downloading and reuses it for every chunk", async () => {
  const players = [];
  const events = [];
  Object.defineProperty(globalThis, "navigator", { configurable: true, value: { onLine: true } });
  globalThis.Audio = class {
    constructor() { players.push(this); }
    pause() {}
    play() {
      events.push(this.src.startsWith("data:") ? "authorize" : "play");
      if (!this.src.startsWith("data:")) queueMicrotask(() => this.onended?.());
      return Promise.resolve();
    }
  };
  globalThis.fetch = async () => {
    events.push("fetch");
    return { ok: true, blob: async () => new Blob(["audio"], { type: "audio/mpeg" }) };
  };
  assert.equal(await speakSpanish("Revisa el suelo. ".repeat(40)), true);
  assert.equal(players.length, 1);
  assert.equal(events[0], "authorize");
  assert.ok(events.filter((e) => e === "play").length > 1);
  assert.ok(events.lastIndexOf("fetch") < events.indexOf("play"));
  const downloads = events.filter((e) => e === "fetch").length;
  assert.equal(await speakSpanish("Revisa el suelo. ".repeat(40)), true);
  assert.equal(events.filter((e) => e === "fetch").length, downloads);

  const requested = [];
  globalThis.fetch = async (url, options) => {
    if (!options) return { ok: true, json: async () => ({ clips: {} }) };
    requested.push(JSON.parse(options.body).text);
    return { ok: true, blob: async () => new Blob(["audio"]) };
  };
  const narration = Array.from({ length: 30 }, (_, i) => `Allpata yakuta qhaway ${i}.`).join(" ");
  assert.equal(await speakQuechua(narration), true);
  assert.ok(requested[0].length <= 241);
  assert.equal(requested.join(" "), narration.trim());
  assert.ok(requested.every((text) => text.endsWith(".")));

  let release;
  let pendingSignal;
  globalThis.fetch = (url, options) => new Promise((resolve) => {
    pendingSignal = options.signal;
    release = resolve;
  });
  const cancelled = speakSpanish("No debe reproducirse después de detener.");
  await new Promise((resolve) => setImmediate(resolve));
  stopSpeaking();
  assert.equal(pendingSignal.aborted, true);
  const plays = events.filter((e) => e === "play").length;
  release({ ok: true });
  assert.equal(await cancelled, false);
  assert.equal(events.filter((e) => e === "play").length, plays);
});
