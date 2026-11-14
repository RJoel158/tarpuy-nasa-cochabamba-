"""Natural Spanish speech for farmer-facing explanations."""
import asyncio
from functools import lru_cache

async def _synthesize(text: str) -> bytes:
    import edge_tts

    speech = edge_tts.Communicate(
        text, voice="es-BO-SofiaNeural", rate="-8%", pitch="+0Hz",
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
