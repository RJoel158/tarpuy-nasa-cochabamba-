"""Regression tests for the natural Spanish speech endpoint."""
import sys
from types import SimpleNamespace
from unittest.mock import patch
from fastapi.testclient import TestClient
from backend.main import app
from etl.natural_spanish_tts import synthesize_spanish_mp3
from etl.natural_spanish_tts import normalize_spoken_spanish


def test_voice_expands_units_and_decimal_numbers():
    spoken = normalize_spoken_spanish("Mínima -2.5 °C, lluvia 4 mm, humedad 26%, viento 18 km/h. ET0: 3.")
    assert "menos 2 coma 5" in spoken
    assert "grados Celsius" in spoken
    assert "milímetros" in spoken
    assert "26 por ciento" in spoken
    assert "kilómetros por hora" in spoken
    assert "demanda de agua de referencia" in spoken


def test_natural_voice_keeps_audio_chunks_and_uses_bolivian_spanish():
    settings = {}

    class Voice:
        def __init__(self, text, **kwargs):
            settings.update(text=text, **kwargs)

        async def stream(self):
            yield {"type": "audio", "data": b"ID3begin"}
            yield {"type": "WordBoundary"}
            yield {"type": "audio", "data": b"end"}

    synthesize_spanish_mp3.cache_clear()
    with patch.dict(sys.modules, {"edge_tts": SimpleNamespace(Communicate=Voice)}):
        assert synthesize_spanish_mp3("Revisa el agua antes de sembrar.") == b"ID3beginend"
    synthesize_spanish_mp3.cache_clear()
    assert settings["voice"] == "es-BO-SofiaNeural"
    assert settings["rate"] == "-8%"


def test_natural_voice_endpoint_and_provider_failure():
    client = TestClient(app)
    with patch("backend.main.synthesize_spanish_mp3", return_value=b"ID3audio"):
        result = client.post("/api/tts/spanish-natural", json={"text": "Revisa el suelo."})
        assert result.status_code == 200
        assert result.headers["content-type"] == "audio/mpeg"
    with patch("backend.main.synthesize_spanish_mp3", side_effect=RuntimeError):
        result = client.post("/api/tts/spanish-natural", json={"text": "Revisa el suelo."})
        assert result.status_code == 503
    assert client.post("/api/tts/spanish-natural", json={"text": "a" * 481}).status_code == 422
