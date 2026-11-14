"""Build the GAMC districts catalog by sampling the "Limite Distritos" WMS layer.

The municipal WMS only answers attribute queries (GetFeatureInfo), it does not expose
geometries. We sample a regular grid, group hits by district and derive for each one a
representative center (a real hit, so it is always inside the district) and its bounds.

Run from the repository root (needs GAMC_API_KEY in .env):
    python -m etl.gamc_districts
"""

from __future__ import annotations

import json
import time
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from typing import Any

import httpx

from backend.config import Settings

DISTRICTS_SERVICE_ID = "7eb13092-bf0e-493b-aae6-03c43eedda2c"
BOUNDS = {"west": -66.280703, "south": -17.53119, "east": -66.06952, "north": -17.257306}
STEP_DEG = 0.006  # ~660 m: small enough to catch the central districts
PROBE_HALF_DEG = 0.0005
OUTPUT = Path(__file__).resolve().parent.parent / "data" / "gamc" / "districts.json"


def sample_point(
    client: httpx.Client, settings: Settings, lat: float, lon: float
) -> tuple[str, str] | None:
    """Return (district code, comuna) at a coordinate, or None when outside districts."""
    d = PROBE_HALF_DEG
    params = {
        "key": settings.GAMC_API_KEY,
        "service_id": DISTRICTS_SERVICE_ID,
        "SERVICE": "WMS",
        "VERSION": "1.1.1",
        "REQUEST": "GetFeatureInfo",
        "SRS": "EPSG:4326",
        "LAYERS": "",
        "QUERY_LAYERS": "",
        "BBOX": f"{lon - d},{lat - d},{lon + d},{lat + d}",
        "WIDTH": "101",
        "HEIGHT": "101",
        "X": "50",
        "Y": "50",
        "INFO_FORMAT": "application/json",
        "FEATURE_COUNT": "1",
    }
    last_error: Exception | None = None
    for attempt in range(4):
        try:
            res = client.get(settings.GAMC_WMS_BASE_URL, params=params)
            res.raise_for_status()
            features = res.json().get("features") or []
            if not features:
                return None
            props = features[0].get("properties") or {}
            code = str(props.get("Distrito") or "").strip().upper()
            return (code, str(props.get("Comuna") or "").strip()) if code else None
        except (httpx.HTTPError, ValueError) as exc:
            last_error = exc
            time.sleep(0.5 * (attempt + 1))
    # An upstream failure is NOT the same as "outside every district": surface it.
    raise RuntimeError(f"GetFeatureInfo failed at {lat},{lon}") from last_error


def _grid() -> list[tuple[float, float]]:
    points = []
    lat = BOUNDS["south"]
    while lat <= BOUNDS["north"]:
        lon = BOUNDS["west"]
        while lon <= BOUNDS["east"]:
            points.append((round(lat, 6), round(lon, 6)))
            lon += STEP_DEG
        lat += STEP_DEG
    return points


def build_catalog(hits: dict[str, list[tuple[float, float, str]]]) -> list[dict[str, Any]]:
    """Group sampled points by district code into catalog entries."""
    catalog = []
    for code, pts in hits.items():
        mean_lat = sum(p[0] for p in pts) / len(pts)
        mean_lon = sum(p[1] for p in pts) / len(pts)
        center = min(pts, key=lambda p: (p[0] - mean_lat) ** 2 + (p[1] - mean_lon) ** 2)
        comuna = Counter(p[2] for p in pts).most_common(1)[0][0]
        half = STEP_DEG / 2
        number = int("".join(ch for ch in code if ch.isdigit()) or 0)
        catalog.append(
            {
                "code": code,
                "number": number,
                "name": f"Distrito {number}",
                "comuna": comuna.title(),
                "center": {"lat": center[0], "lon": center[1]},
                "bounds": {
                    "south": round(min(p[0] for p in pts) - half, 6),
                    "west": round(min(p[1] for p in pts) - half, 6),
                    "north": round(max(p[0] for p in pts) + half, 6),
                    "east": round(max(p[1] for p in pts) + half, 6),
                },
                "samples": len(pts),
            }
        )
    return sorted(catalog, key=lambda d: d["number"])


def _sample_all(
    settings: Settings, points: list[tuple[float, float]], workers: int
) -> tuple[dict[tuple[float, float], tuple[str, str] | None], list[tuple[float, float]]]:
    """Sample points concurrently; return (results, points that failed upstream)."""
    results: dict[tuple[float, float], tuple[str, str] | None] = {}
    failed: list[tuple[float, float]] = []

    def work(point: tuple[float, float]) -> None:
        try:
            results[point] = sample_point(client, settings, *point)
        except RuntimeError:
            failed.append(point)

    with httpx.Client(timeout=20.0) as client, ThreadPoolExecutor(max_workers=workers) as pool:
        list(pool.map(work, points))
    return results, failed


def format_catalog(payload: dict[str, Any]) -> str:
    """Serialize with one district per line so the data file stays small and diff-friendly."""
    districts = [json.dumps(d, ensure_ascii=False) for d in payload["districts"]]
    return (
        "{\n"
        f'  "source": {json.dumps(payload["source"], ensure_ascii=False)},\n'
        f'  "service_id": {json.dumps(payload["service_id"])},\n'
        '  "districts": [\n    ' + ",\n    ".join(districts) + "\n  ]\n}\n"
    )


def main() -> None:
    settings = Settings()
    if not settings.GAMC_API_KEY:
        raise SystemExit("GAMC_API_KEY is not set (see .env)")
    points = _grid()
    print(f"Sampling {len(points)} points...")
    results, failed = _sample_all(settings, points, workers=6)
    if failed:
        print(f"Retrying {len(failed)} failed points with fewer workers...")
        retry, failed = _sample_all(settings, failed, workers=2)
        results.update(retry)
    if failed:
        raise SystemExit(f"{len(failed)} points still failing upstream; not writing catalog")
    hits: dict[str, list[tuple[float, float, str]]] = {}
    for (lat, lon), found in results.items():
        if found:
            hits.setdefault(found[0], []).append((lat, lon, found[1]))
    catalog = build_catalog(hits)
    payload = {
        "source": "Alcaldía de Cochabamba — Límite Distritos (WMS GetFeatureInfo)",
        "service_id": DISTRICTS_SERVICE_ID,
        "districts": catalog,
    }
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(format_catalog(payload), encoding="utf-8")
    print(f"Wrote {len(catalog)} districts to {OUTPUT}")
    for d in catalog:
        print(f"  {d['code']:>4} {d['comuna']:<28} {d['samples']} samples")


if __name__ == "__main__":
    main()
