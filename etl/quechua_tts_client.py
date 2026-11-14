"""Native South Bolivian Quechua TTS generator (Meta AI facebook/mms-tts-quh)."""

import json
from pathlib import Path
import re
from typing import Any
import requests

try:
    from etl.security import compute_sha256, validate_nasa_url
    from engine.alerts import AgroclimaticAlertEvaluator
except ModuleNotFoundError:
    from security import compute_sha256, validate_nasa_url

MMS_SPACE_BASE = "https://dpc-mmstts.hf.space"
QUH_LANGUAGE_LABEL = "Quechua, South Bolivian (quh)"
SAFE_GRADIO_PATH_RE = re.compile(r"^/tmp/gradio/[a-zA-Z0-9_./-]+_quh\.wav$")


def clean_quechua_for_tts(text: str) -> str:
    """Normalize punctuation and symbols for South Bolivian Quechua VITS vocabulary."""
    cleaned = text.replace("->", ", chanta ").replace("—", ", ").replace("¡", "").replace("!", ".")
    cleaned = re.sub(r"[\s]+", " ", cleaned).strip()
    return cleaned[:480]


class QuechuaTtsClient:
    """Client calling facebook/mms-tts-quh Gradio Space and caching offline WAV clips."""

    def __init__(self, timeout: int = 35):
        self.predict_url = validate_nasa_url(f"{MMS_SPACE_BASE}/api/predict")
        self.timeout = timeout

    def synthesize_wav_bytes(self, text: str) -> bytes:
        """Synthesize South Bolivian Quechua WAV audio via MMS-TTS-QUH."""
        cleaned = clean_quechua_for_tts(text)
        if not cleaned:
            raise ValueError("Empty Quechua text cannot be synthesized.")
        resp = requests.post(
            validate_nasa_url(self.predict_url),
            json={"data": [cleaned, QUH_LANGUAGE_LABEL]},
            timeout=self.timeout,
            allow_redirects=False,
        )
        if resp.status_code != 200:
            raise RuntimeError(f"MMS-TTS upstream HTTP {resp.status_code}")
        fname = str(resp.json().get("data", [{}])[0].get("name", ""))
        if not SAFE_GRADIO_PATH_RE.match(fname) or ".." in fname:
            raise ValueError("Unexpected upstream Gradio audio path rejected by OWASP check.")
        file_url = validate_nasa_url(f"{MMS_SPACE_BASE}/file={fname}")
        audio_resp = requests.get(file_url, timeout=self.timeout, allow_redirects=False)
        if audio_resp.status_code != 200 or not audio_resp.content.startswith(b"RIFF"):
            raise RuntimeError("Invalid WAV stream returned by MMS-TTS upstream.")
        return audio_resp.content

    def build_offline_pack(self, pilots_path: Path, out_dir: Path, force: bool = False) -> dict[str, Any]:
        """Generate pre-rendered offline Bolivian Quechua WAV pack for all zones & strategies."""
        pilots = json.loads(pilots_path.read_text(encoding="utf-8")).get("zones", [])
        evaluator = AgroclimaticAlertEvaluator(pilots_path.parent / "realtime_weather_telemetry.json")
        out_dir.mkdir(parents=True, exist_ok=True)
        clips: dict[str, dict[str, str]] = {}

        targets: list[tuple[str, str]] = []
        for z in pilots:
            zid = z["zone_id"]
            qname = z.get("quechua_name") or z.get("name")
            strats = z.get("strategies", [])
            alt = next((s for s in strats if s.get("strategy_type") != "current_baseline"), strats[0] if strats else {})
            guide_text = (
                f"Allillanchu, {qname}. Satelite qhawasqanmanjina jallp'anchikta waqaychasun. "
                f"Allin muyuy: {alt.get('title_qu', '')}. {alt.get('quechua_summary', '')}"
            )
            targets.append((f"guide_{zid}", guide_text))
            alert_text = evaluator.evaluate_zone(zid, z).get("alerts_spoken_qu", "")
            targets.append((f"alert_{zid}", alert_text))
            for s in strats:
                targets.append((f"strat_{s['strategy_id']}", s.get("quechua_summary", "")))

        for clip_id, raw_text in targets:
            wav_path = out_dir / f"{clip_id}.wav"
            if force or not wav_path.exists() or wav_path.stat().st_size < 1000:
                wav_path.write_bytes(self.synthesize_wav_bytes(raw_text))
                print(f"Generated {wav_path.name} ({wav_path.stat().st_size // 1024} KB)")
            else:
                print(f"Cached {wav_path.name}")
            digest = compute_sha256(wav_path.read_bytes())
            clips[clip_id] = {
                "url": f"/audio/quh/{clip_id}.wav",
                "text": clean_quechua_for_tts(raw_text),
                "sha256": digest,
            }

        manifest = {
            "model": "facebook/mms-tts-quh (Meta AI South Bolivian Quechua VITS)",
            "language_iso": "quh",
            "clip_count": len(clips),
            "clips": clips,
        }
        lines = ["{", f'  "model": {json.dumps(manifest["model"])},', '  "language_iso": "quh",', f'  "clip_count": {len(clips)},', '  "clips": {']
        items = list(clips.items())
        for idx, (k, v) in enumerate(items):
            lines.append(f'    {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}{"," if idx < len(items) - 1 else ""}')
        lines.extend(["  }", "}"])
        (out_dir / "manifest.json").write_text("\n".join(lines) + "\n", encoding="utf-8")
        return manifest


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    res = QuechuaTtsClient().build_offline_pack(
        root / "data" / "zones" / "cochabamba_pilots.json",
        root / "frontend" / "public" / "audio" / "quh",
    )
    print(f"Ready: {res['clip_count']} native South Bolivian Quechua WAV clips.")
