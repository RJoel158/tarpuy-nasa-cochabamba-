"""Build phase-one clips with the existing Python MMS voices, preserving other clips."""
import json
from pathlib import Path
import subprocess

from etl.quechua_tts_client import QuechuaTtsClient, SpanishTtsClient
from etl.security import compute_sha256


def write_manifest(path, manifest):
    lines = ["{", *(f'  "{key}": {json.dumps(manifest[key])},' for key in
              ("model", "language_iso", "clip_count")), '  "clips": {']
    items = list(manifest["clips"].items())
    lines.extend(f'    {json.dumps(key)}: {json.dumps(value, ensure_ascii=False)}'
                 + ("," if index < len(items) - 1 else "")
                 for index, (key, value) in enumerate(items))
    path.write_text("\n".join([*lines, "  }", "}", ""]), encoding="utf-8")


def main():
    root = Path(__file__).resolve().parents[1]
    script = """
      import { buildWaterActionNarration } from './src/services/narration.js';
      const codes = {frost:'WAIT',rain:'CAUTION',drainage:'CAUTION',dry:'IRRIGATE',
        missing:'WAIT',check:'WAIT',stable:'WAIT'};
      console.log(JSON.stringify(Object.fromEntries(['es','qu'].map(lang => [lang,
        Object.entries(codes).map(([reason,code]) => ['water_'+reason,
          buildWaterActionNarration({code,reason},lang)])]))));
    """
    targets = json.loads(subprocess.check_output(
        ["node", "--input-type=module", "-e", script], cwd=root / "frontend", encoding="utf-8"
    ))
    for lang, client, folder in [("es", SpanishTtsClient(), "es"), ("qu", QuechuaTtsClient(), "quh")]:
        out = root / "frontend" / "public" / "audio" / folder
        manifest_path = out / "manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        # Persist after every clip so an interrupted run can resume safely.
        for clip_id, text in targets[lang]:
            old = manifest["clips"].get(clip_id)
            wav = out / f"{clip_id}.wav"
            if old and old.get("text") == client.cleaner(text) and wav.exists():
                continue
            audio = client.synthesize_wav_bytes(text)
            wav.write_bytes(audio)
            manifest["clips"][clip_id] = {
                "url": f"/audio/{folder}/{clip_id}.wav", "text": client.cleaner(text),
                "sha256": compute_sha256(audio),
            }
            manifest["clip_count"] = len(manifest["clips"])
            write_manifest(manifest_path, manifest)
            print(f"Generated {folder}/{clip_id}", flush=True)


if __name__ == "__main__":
    main()
