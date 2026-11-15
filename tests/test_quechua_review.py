import io
import wave

import pytest

from etl.build_quechua_review import join_wav_sentences
from etl.quechua_tts_client import QuechuaTtsClient, clean_quechua_for_tts


def wav(rate=16000, frames=1600):
    output = io.BytesIO()
    with wave.open(output, "wb") as writer:
        writer.setnchannels(1)
        writer.setsampwidth(2)
        writer.setframerate(rate)
        writer.writeframes(b"\x01\x00" * frames)
    return output.getvalue()


def test_quechua_preserves_distinctive_apostrophes_and_final_warning():
    text = "Ch’aki, ch’aran. " + "Allpata qhaway. " * 40 + "Ama parquychu."
    normalized = clean_quechua_for_tts(text)
    assert "Ch'aki, ch'aran" in normalized
    assert normalized.endswith("Ama parquychu.")
    assert len(normalized) > 480
    with pytest.raises(ValueError, match="do not truncate"):
        QuechuaTtsClient().synthesize_wav_bytes(text)


def test_sentence_pauses_preserve_audio_rate_and_all_frames():
    merged = join_wav_sentences([wav(), wav()], pause_ms=300)
    with wave.open(io.BytesIO(merged), "rb") as reader:
        assert reader.getframerate() == 16000
        assert reader.getnframes() == 1600 * 2 + 4800
        assert reader.getnchannels() == 1


def test_incompatible_audio_is_rejected_instead_of_distorted():
    with pytest.raises(ValueError, match="Incompatible"):
        join_wav_sentences([wav(), wav(rate=22050)])
