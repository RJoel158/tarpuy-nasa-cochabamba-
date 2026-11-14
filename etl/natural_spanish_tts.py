"""Natural Spanish speech for farmer-facing explanations."""
import asyncio
from functools import lru_cache
import re


def normalize_spoken_spanish(text: str) -> str:
    """Expand display units so the established voice reads prose, not symbols."""
    text = re.sub(r"\bET[0₀]\b", "demanda de agua de referencia", text)
    for symbol, spoken in [("°C", " grados Celsius"), ("km/h", " kilómetros por hora"),
                           ("%", " por ciento")]:
        text = text.replace(symbol, spoken)
    text = re.sub(r"\bmm\b", "milímetros", text)
    text = re.sub(r"(?<=\d)[.,](?=\d)", " coma ", text)
    text = re.sub(r"(?<!\w)-(\d)", r"menos \1", text)
    return re.sub(r"\s+", " ", text).strip()

async def _synthesize(text: str) -> bytes:
    import edge_tts

    speech = edge_tts.Communicate(
        normalize_spoken_spanish(text), voice="es-BO-SofiaNeural", rate="-8%", pitch="+0Hz",
        connect_timeout=10, receive_timeout=30,
    )
    audio = bytearray()
    async for chunk in speech.stream():
        if chunk["type"] == "audio":
            audio.extend(chunk["data"])
    if not audio:
        raise RuntimeError("The speech provider returned no audio")
    return bytes(audio)

@lru_cache(maxsize=64)
def synthesize_spanish_mp3(text: str) -> bytes:
    """Cache bounded API-sized messages without storing farmer data on disk."""
    if not 2 <= len(text.strip()) <= 480:
        raise ValueError("Speech text must contain between 2 and 480 characters")
    return asyncio.run(_synthesize(text))
