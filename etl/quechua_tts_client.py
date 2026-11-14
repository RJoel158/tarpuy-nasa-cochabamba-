"""Native Bolivian Quechua & Spanish TTS generator (Meta AI MMS-TTS VITS)."""

import json
from functools import lru_cache
from pathlib import Path
import re
from typing import Any, Callable
import requests

try:
    from etl.security import compute_sha256, validate_nasa_url
    from engine.alerts import AgroclimaticAlertEvaluator
except ModuleNotFoundError:
    from security import compute_sha256, validate_nasa_url

MMS_SPACE_BASE = "https://dpc-mmstts.hf.space"
QUH_LANGUAGE_LABEL = "Quechua, South Bolivian (quh)"
SPA_LANGUAGE_LABEL = "Spanish (spa)"
SAFE_GRADIO_PATH_RE = re.compile(r"^/tmp/gradio/[a-zA-Z0-9_./-]+_(?:quh|spa)\.wav$")


def clean_quechua_for_tts(text: str) -> str:
    """Normalize punctuation and symbols for South Bolivian Quechua VITS vocabulary."""
    cleaned = text.replace("’", "'").replace("‘", "'").replace("ʼ", "'")
    cleaned = cleaned.replace("->", ", chanta ").replace("—", ", ").replace("¡", "").replace("!", ".")
    return re.sub(r"[\s]+", " ", cleaned).strip()[:480]


def clean_spanish_for_tts(text: str) -> str:
    """Normalize punctuation, arrows, and parentheticals for natural Spanish MMS-TTS speech."""
    cleaned = re.sub(r"\([^)]*\)", "", text)
    cleaned = cleaned.replace("->", ", luego ").replace("+", " y ").replace("—", ", ")
    cleaned = re.sub(r"[¡!¿?]", "", cleaned)
    return re.sub(r"[\s]+", " ", cleaned).strip()[:480]


class QuechuaTtsClient:
    """Client calling facebook/mms-tts Gradio Space and caching offline WAV clips."""

    def __init__(
        self,
        timeout: int = 35,
        lang_label: str = QUH_LANGUAGE_LABEL,
        cleaner: Callable[[str], str] = clean_quechua_for_tts,
    ):
        self.predict_url = validate_nasa_url(f"{MMS_SPACE_BASE}/api/predict")
        self.timeout = timeout
        self.lang_label = lang_label
        self.cleaner = cleaner

    def synthesize_wav_bytes(self, text: str) -> bytes:
        """Synthesize neural WAV audio via Meta AI MMS-TTS upstream."""
        cleaned = self.cleaner(text)
        if not cleaned:
            raise ValueError("Empty text cannot be synthesized.")
        return self._synthesize_cached(self.predict_url, self.lang_label, self.timeout, cleaned)

    @staticmethod
    @lru_cache(maxsize=32)
    def _synthesize_cached(predict_url: str, lang_label: str, timeout: int, cleaned: str) -> bytes:
        resp = requests.post(
            validate_nasa_url(predict_url),
            json={"data": [cleaned, lang_label]},
            timeout=timeout,
            allow_redirects=False,
        )
        if resp.status_code != 200:
            raise RuntimeError(f"MMS-TTS upstream HTTP {resp.status_code}")
        fname = str(resp.json().get("data", [{}])[0].get("name", ""))
        if not SAFE_GRADIO_PATH_RE.match(fname) or ".." in fname:
            raise ValueError("Unexpected upstream Gradio audio path rejected by OWASP check.")
        file_url = validate_nasa_url(f"{MMS_SPACE_BASE}/file={fname}")
        audio_resp = requests.get(file_url, timeout=timeout, allow_redirects=False)
        if audio_resp.status_code != 200 or not audio_resp.content.startswith(b"RIFF"):
            raise RuntimeError("Invalid WAV stream returned by MMS-TTS upstream.")
        return audio_resp.content

    def _write_pack(
        self,
        targets: list[tuple[str, str]],
        out_dir: Path,
        url_prefix: str,
        model_desc: str,
        language_iso: str,
        force: bool = False,
    ) -> dict[str, Any]:
        """Generate WAV clips if missing and write compact JSON manifest with SHA-256."""
        out_dir.mkdir(parents=True, exist_ok=True)
        clips: dict[str, dict[str, str]] = {}
        for clip_id, raw_text in targets:
            wav_path = out_dir / f"{clip_id}.wav"
            if force or not wav_path.exists() or wav_path.stat().st_size < 1000:
                wav_path.write_bytes(self.synthesize_wav_bytes(raw_text))
                print(f"Generated {url_prefix}/{wav_path.name} ({wav_path.stat().st_size // 1024} KB)")
            else:
                print(f"Cached {url_prefix}/{wav_path.name}")
            clips[clip_id] = {
                "url": f"{url_prefix}/{clip_id}.wav",
                "text": self.cleaner(raw_text),
                "sha256": compute_sha256(wav_path.read_bytes()),
            }
        manifest = {"model": model_desc, "language_iso": language_iso, "clip_count": len(clips), "clips": clips}
        lines = [
            "{",
            f'  "model": {json.dumps(model_desc)},',
            f'  "language_iso": {json.dumps(language_iso)},',
            f'  "clip_count": {len(clips)},',
            '  "clips": {',
        ]
        items = list(clips.items())
        for idx, (k, v) in enumerate(items):
            lines.append(f'    {json.dumps(k)}: {json.dumps(v, ensure_ascii=False)}{"," if idx < len(items) - 1 else ""}')
        lines.extend(["  }", "}"])
        (out_dir / "manifest.json").write_text("\n".join(lines) + "\n", encoding="utf-8")
        return manifest

    def build_offline_pack(self, pilots_path: Path, out_dir: Path, force: bool = False) -> dict[str, Any]:
        """Generate pre-rendered offline Bolivian Quechua WAV pack for all zones & strategies."""
        pilots = json.loads(pilots_path.read_text(encoding="utf-8")).get("zones", [])
        evaluator = AgroclimaticAlertEvaluator(pilots_path.parent / "realtime_weather_telemetry.json")
        targets: list[tuple[str, str]] = []
        for z in pilots:
            zid, qname = z["zone_id"], z.get("quechua_name") or z.get("name")
            strats = z.get("strategies", [])
            alt = next((s for s in strats if s.get("strategy_type") != "current_baseline"), strats[0] if strats else {})
            guide_text = f"Allillanchu, {qname}. Satelite qhawasqanmanjina jallp'anchikta waqaychasun. Allin muyuy: {alt.get('title_qu', '')}. {alt.get('quechua_summary', '')}"
            targets.append((f"guide_{zid}", guide_text))
            targets.append((f"alert_{zid}", evaluator.evaluate_zone(zid, z).get("alerts_spoken_qu", "")))
            for s in strats:
                targets.append((f"strat_{s['strategy_id']}", s.get("quechua_summary", "")))
        return self._write_pack(
            targets, out_dir, "/audio/quh", "facebook/mms-tts-quh (Meta AI South Bolivian Quechua VITS)", "quh", force
        )


class SpanishTtsClient(QuechuaTtsClient):
    """Client calling facebook/mms-tts-spa for natural offline/online Spanish audio."""

    def __init__(self, timeout: int = 35):
        super().__init__(timeout=timeout, lang_label=SPA_LANGUAGE_LABEL, cleaner=clean_spanish_for_tts)


def build_spanish_offline_pack(pilots_path: Path, out_dir: Path, force: bool = False) -> dict[str, Any]:
    """Generate pre-rendered offline Spanish WAV pack for all zones & strategies."""
    pilots = json.loads(pilots_path.read_text(encoding="utf-8")).get("zones", [])
    evaluator = AgroclimaticAlertEvaluator(pilots_path.parent / "realtime_weather_telemetry.json")
    targets: list[tuple[str, str]] = []
    for z in pilots:
        zid = z["zone_id"]
        z_clean = re.sub(r"\([^)]*\)", "", z.get("name", "Cochabamba")).replace("—", ",").strip()
        strats = z.get("strategies", [])
        alt = next((s for s in strats if s.get("strategy_type") != "current_baseline"), strats[0] if strats else {})
        title_clean = clean_spanish_for_tts(alt.get("title_es", ""))
        guide_text = (
            f"Hola compañero productor de {z_clean}. Según los datos del satélite NASA, "
            f"cuidemos la humedad de nuestra tierra. Recomendación principal: {title_clean}. {alt.get('spanish_summary', '')}"
        )
        targets.append((f"guide_{zid}", guide_text))
        targets.append((f"alert_{zid}", evaluator.evaluate_zone(zid, z).get("alerts_spoken_es", "")))
        for s in strats:
            targets.append((f"strat_{s['strategy_id']}", s.get("spanish_summary", "")))
    return SpanishTtsClient()._write_pack(
        targets, out_dir, "/audio/es", "facebook/mms-tts-spa (Meta AI Spanish VITS)", "spa", force
    )


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    qu_res = QuechuaTtsClient().build_offline_pack(
        root / "data" / "zones" / "cochabamba_pilots.json", root / "frontend" / "public" / "audio" / "quh"
    )
    es_res = build_spanish_offline_pack(
        root / "data" / "zones" / "cochabamba_pilots.json", root / "frontend" / "public" / "audio" / "es"
    )
    print(f"Ready: {qu_res['clip_count']} Quechua + {es_res['clip_count']} Spanish neural WAV clips.")
