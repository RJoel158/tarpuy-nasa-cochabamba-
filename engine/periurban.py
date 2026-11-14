"""Municipal periurban context (Option A): district → zone flags for GAMC DSS."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_PROFILES_PATH = Path(__file__).resolve().parents[1] / "data" / "zones" / "periurban_profiles.json"
_CACHE: dict[str, Any] | None = None


def _load_profiles() -> dict[str, Any]:
    global _CACHE
    if _CACHE is not None:
        return _CACHE
    if not _PROFILES_PATH.exists():
        _CACHE = {"districts": {}, "default_zone_id": "punata_valle_alto"}
        return _CACHE
    _CACHE = json.loads(_PROFILES_PATH.read_text(encoding="utf-8"))
    return _CACHE


def normalize_district_code(code: str | None) -> str:
    raw = str(code or "").strip().upper()
    if raw.isdigit():
        return f"D{raw}"
    if raw.startswith("D") and raw[1:].isdigit():
        return raw
    return raw


def resolve_district_profile(district_code: str | None) -> dict[str, Any] | None:
    """Return profile dict for a GAMC district code, or None."""
    code = normalize_district_code(district_code)
    if not code:
        return None
    return _load_profiles().get("districts", {}).get(code)


def build_municipal_context(
    *,
    district_code: str | None = None,
    comuna: str | None = None,
    periurban_class: str | None = None,
    periurban_detail: str | None = None,
    near_drainage: bool = False,
    drainage_tipo: str | None = None,
    drainage_clasificacion: str | None = None,
    wet_bulletin: bool = False,
) -> dict[str, Any]:
    """Normalize frontend/GAMC signals into scoring + UI municipal_context."""
    profile = resolve_district_profile(district_code) or {}
    pressure = str(periurban_class or profile.get("periurban_pressure") or "none").lower()
    if "consolid" in pressure:
        pressure = "consolidated"
    elif "crecim" in pressure or pressure in {"growth", "en_crecimiento", "crecimiento"}:
        pressure = "growth"
    elif pressure not in {"consolidated", "growth", "none"}:
        pressure = "none"

    code = normalize_district_code(district_code) or None
    label = profile.get("label_es") or (f"Distrito {code[1:]}" if code and code.startswith("D") else None)
    if profile.get("alias") and code in {"D9", "D13"}:
        label = profile.get("label_es")

    tip_es = profile.get("tip_es") or ""
    if pressure == "consolidated" and not tip_es:
        tip_es = "Zona periurbana consolidada: cubre la tierra pronto."
    elif pressure == "growth" and not tip_es:
        tip_es = "Zona periurbana en crecimiento: todavía hay ventana agrícola."
    if near_drainage:
        tip_es = (tip_es + " " if tip_es else "") + "Hay drenaje o quebrada cerca: cuida el anegamiento."

    return {
        "district_code": code,
        "comuna": (comuna or "").strip() or None,
        "alias": profile.get("alias"),
        "label_es": label,
        "label_qu": profile.get("label_qu") or label,
        "zone_id_hint": profile.get("zone_id"),
        "periurban_pressure": pressure,
        "periurban_detail": periurban_detail,
        "flood_sensitive": bool(profile.get("flood_sensitive")) or near_drainage,
        "slope_bias": profile.get("slope_bias") or "valle",
        "near_drainage": bool(near_drainage),
        "drainage_tipo": drainage_tipo,
        "drainage_clasificacion": drainage_clasificacion,
        "wet_bulletin": bool(wet_bulletin),
        "tip_es": tip_es.strip(),
        "tip_qu": profile.get("tip_qu") or tip_es.strip(),
    }
