"""Create isolated bilingual listening samples; never overwrite production audio."""
import hashlib
import html
import io
import json
from pathlib import Path
import wave

from etl.natural_spanish_tts import synthesize_spanish_mp3
from etl.quechua_tts_client import QuechuaTtsClient


def join_wav_sentences(clips: list[bytes], pause_ms: int = 300) -> bytes:
    """Add silence between sentences without slowing or changing pronunciation."""
    output = io.BytesIO()
    with wave.open(output, "wb") as writer:
        expected = None
        for index, clip in enumerate(clips):
            with wave.open(io.BytesIO(clip), "rb") as reader:
                params = (reader.getnchannels(), reader.getsampwidth(), reader.getframerate())
                if expected is None:
                    expected = params
                    writer.setnchannels(params[0])
                    writer.setsampwidth(params[1])
                    writer.setframerate(params[2])
                if params != expected or reader.getcomptype() != "NONE":
                    raise ValueError("Incompatible WAV samples")
                if index:
                    silence = b"\x00" * (params[0] * params[1] * int(params[2] * pause_ms / 1000))
                    writer.writeframes(silence)
                writer.writeframes(reader.readframes(reader.getnframes()))
    return output.getvalue()


def main():
    root = Path(__file__).resolve().parents[1]
    catalog = json.loads((root / "data/localization/quh_bo_review.json").read_text(encoding="utf-8"))
    out = root / "artifacts/quechua-review"
    out.mkdir(parents=True, exist_ok=True)
    client = QuechuaTtsClient(timeout=25)
    results = []
    for sample in catalog["samples"]:
        row = dict(sample)
        for lang, text, ext in [("quh", sample["qu_spoken"], "wav"), ("es", sample["es"], "mp3")]:
            path = out / f"{sample['id']}_{lang}.{ext}"
            fingerprint = hashlib.sha256(text.encode()).hexdigest()
            stamp = path.with_suffix(path.suffix + ".sha256")
            try:
                if not path.exists() or not stamp.exists() or stamp.read_text() != fingerprint:
                    if lang == "quh":
                        sentences = [part.strip() + "." for part in text.split(".") if part.strip()]
                        audio = join_wav_sentences([client.synthesize_wav_bytes(part) for part in sentences])
                    else:
                        audio = synthesize_spanish_mp3(text)
                    path.write_bytes(audio)
                    stamp.write_text(fingerprint)
                row[f"audio_{lang}"] = path.name
                print(f"Ready {path.name}", flush=True)
            except Exception as exc:
                row[f"error_{lang}"] = type(exc).__name__
                print(f"Failed {path.name}: {type(exc).__name__}: {exc}", flush=True)
        results.append(row)
        (out / "review.json").write_text(json.dumps({**catalog, "samples": results}, ensure_ascii=False, indent=2), encoding="utf-8")
    cards = []
    for row in results:
        e = html.escape
        audio = "".join(f'<p>{lang}</p><audio controls preload="none" src="{e(row[key])}"></audio>'
                        for lang, key in [("Español", "audio_es"), ("Quechua: muestra sintética", "audio_quh")] if key in row)
        cards.append(f'<article><h2>{e(row["id"])}</h2><p>{e(row["context"])}</p><p><b>Español:</b> {e(row["es"])}</p><p><b>Quechua, borrador:</b> {e(row["qu_written"])}</p><p><b>Sentido a revisar:</b> {e(row["back_translation_es"])}</p>{audio}<p>Preguntar sin mostrar el español: ¿qué entendiste y qué harías?</p></article>')
    page = '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Revisión quechua Tarpuy</title><style>body{font:18px system-ui;max-width:850px;margin:auto;padding:20px;background:#f4efe5;color:#231a14}article{padding:22px;background:#fffaf0;border:1px solid #c9bea9;border-radius:20px;margin:20px 0}audio{width:100%}p{line-height:1.6}</style><h1>Revisión de comprensión en quechua</h1><p>Borradores sin validación local. Estas muestras usan la voz actual y frases cortas con pausas; no demuestran que la pronunciación haya mejorado. No se han sustituido audios de la web.</p>' + ''.join(cards) + '</html>'
    (out / "index.html").write_text(page, encoding="utf-8")


if __name__ == "__main__":
    main()
