"""Security utilities for SSRF prevention (OWASP A10) and integrity (OWASP A08)."""

import hashlib
import math
from urllib.parse import urlsplit

ALLOWED_NASA_HOSTS: frozenset[str] = frozenset({"power.larc.nasa.gov"})

# Bounding box for Bolivia's agricultural zones
BOLIVIA_LAT_MIN = -23.0
BOLIVIA_LAT_MAX = -9.0
BOLIVIA_LON_MIN = -70.0
BOLIVIA_LON_MAX = -57.0


def validate_nasa_url(url: str) -> str:
    """Validate NASA API URL against SSRF threats (OWASP A10).

    Args:
        url: Full API endpoint URL string.

    Returns:
        Validated URL string.

    Raises:
        ValueError: If scheme is not https, embedded '@' exists, or host not allowed.
    """
    if not isinstance(url, str) or not url.strip():
        raise ValueError("URL must be a non-empty string.")
    cleaned = url.strip()
    if "@" in cleaned:
        raise ValueError("Embedded credentials ('@') are prohibited to prevent SSRF.")
    parsed = urlsplit(cleaned)
    if parsed.scheme.lower() != "https":
        raise ValueError(f"Prohibited scheme '{parsed.scheme}'; only 'https' is permitted.")
    host = (parsed.hostname or "").lower()
    if host not in ALLOWED_NASA_HOSTS:
        raise ValueError(f"Host '{host}' is not in allowed NASA hosts: {sorted(ALLOWED_NASA_HOSTS)}.")
    return cleaned


def validate_bolivia_coords(lat: float, lon: float) -> tuple[float, float]:
    """Validate that coordinates are finite and within Bolivia bounding box.

    Args:
        lat: Latitude in decimal degrees.
        lon: Longitude in decimal degrees.

    Returns:
        Validated (lat, lon) tuple of floats.

    Raises:
        ValueError: If coordinates are non-numeric, non-finite, or outside Bolivia bounds.
    """
    try:
        flat = float(lat)
        flon = float(lon)
    except (TypeError, ValueError) as err:
        raise ValueError(f"Coordinates must be numeric: lat={lat}, lon={lon}") from err
    if not (math.isfinite(flat) and math.isfinite(flon)):
        raise ValueError(f"Coordinates must be finite numbers: lat={lat}, lon={lon}")
    if not (BOLIVIA_LAT_MIN <= flat <= BOLIVIA_LAT_MAX):
        raise ValueError(f"Latitude {flat} outside Bolivia bounds [{BOLIVIA_LAT_MIN}, {BOLIVIA_LAT_MAX}].")
    if not (BOLIVIA_LON_MIN <= flon <= BOLIVIA_LON_MAX):
        raise ValueError(f"Longitude {flon} outside Bolivia bounds [{BOLIVIA_LON_MIN}, {BOLIVIA_LON_MAX}].")
    return flat, flon


def compute_sha256(payload: bytes | str) -> str:
    """Compute canonical SHA-256 hex digest for data integrity (OWASP A08).

    Args:
        payload: String or bytes to hash.

    Returns:
        64-character lowercase hexadecimal digest string.
    """
    if isinstance(payload, str):
        data = payload.encode("utf-8")
    elif isinstance(payload, (bytes, bytearray)):
        data = bytes(payload)
    else:
        raise TypeError(f"Payload must be bytes or str, got {type(payload).__name__}.")
    return hashlib.sha256(data).hexdigest()
