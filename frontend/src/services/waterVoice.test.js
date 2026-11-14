import test from "node:test";
import assert from "node:assert/strict";
import { speakSpanish, speakQuechua, stopSpeaking } from "./speechService.js";

test("water voice reports Python TTS failure without browser substitution", async () => {
  const previousFetch = globalThis.fetch;
  const previousWindow = globalThis.window;
  let browserCalls = 0;
  globalThis.window = { speechSynthesis: { cancel() {}, speak() { browserCalls++; } } };
  globalThis.fetch = async () => ({ ok: false });
  try {
    for (const speak of [speakSpanish, speakQuechua]) {
      let errors = 0;
      const result = await speak("Mensaje de agua", { neuralOnly: true, onError: () => errors++ });
      assert.equal(result, false);
      assert.equal(errors, 1);
    }
    assert.equal(browserCalls, 0);
  } finally {
    stopSpeaking();
    globalThis.fetch = previousFetch;
    globalThis.window = previousWindow;
  }
});
