import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { buildWaterActionNarration } from "./narration.js";

const codes = { frost: "WAIT", rain: "CAUTION", drainage: "CAUTION", dry: "IRRIGATE",
  missing: "WAIT", check: "WAIT", stable: "WAIT" };
for (const [lang, folder] of [["es", "es"], ["qu", "quh"]]) {
  test(`Python water audio pack matches displayed narration: ${lang}`, () => {
    const base = new URL(`../../public/audio/${folder}/`, import.meta.url);
    const manifest = JSON.parse(readFileSync(new URL("manifest.json", base), "utf8"));
    for (const [reason, code] of Object.entries(codes)) {
      const clip = manifest.clips[`water_${reason}`];
      assert.equal(clip.text.toLowerCase(), buildWaterActionNarration({ reason, code }, lang).toLowerCase());
      const audio = readFileSync(new URL(`water_${reason}.wav`, base));
      assert.equal(audio.toString("ascii", 0, 4), "RIFF");
      assert.equal(createHash("sha256").update(audio).digest("hex"), clip.sha256);
    }
  });
}
