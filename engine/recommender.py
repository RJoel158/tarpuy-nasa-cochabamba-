"""Rotation recommendation service and offline bundle builder (SOLID DIP)."""

import copy
from datetime import datetime, timezone
import json
import math
from pathlib import Path
from typing import Any


def _normalize_json_numbers(obj: Any) -> Any:
    """Convert whole-valued finite floats (e.g. 105.0) to int for JS/Python JSON parity."""
    if isinstance(obj, bool):
        return obj
    if isinstance(obj, float) and math.isfinite(obj) and obj.is_integer():
        return int(obj)
    if isinstance(obj, list):
        return [_normalize_json_numbers(item) for item in obj]
    if isinstance(obj, dict):
        return {k: _normalize_json_numbers(v) for k, v in obj.items()}
    return obj

from etl.security import compute_sha256
from engine.alerts import AgroclimaticAlertEvaluator
from engine.interfaces import CropRepository, RotationScorer, ZoneRepository
from engine.scoring import MultiCriteriaRotationScorer


class JsonZoneRepository:
    """Repository reading pilot zones from cochabamba_pilots.json."""

    def __init__(self, path: Path | str | None = None):
        self.path = Path(path) if path else Path(__file__).resolve().parents[1] / "data" / "zones" / "cochabamba_pilots.json"

    def list_zones(self) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        return json.loads(self.path.read_text(encoding="utf-8")).get("zones", [])

    def get_zone(self, zone_id: str) -> dict[str, Any] | None:
        return next((z for z in self.list_zones() if z.get("zone_id") == zone_id), None)


class JsonCropRepository:
    """Repository reading crops from crops_cochabamba.json."""

    def __init__(self, path: Path | str | None = None):
        self.path = Path(path) if path else Path(__file__).resolve().parents[1] / "data" / "crops_cochabamba.json"

    def list_crops(self) -> list[dict[str, Any]]:
        if not self.path.exists():
            return []
        return json.loads(self.path.read_text(encoding="utf-8")).get("crops", [])

    def get_crops_map(self) -> dict[str, dict[str, Any]]:
        return {c["crop_id"]: c for c in self.list_crops() if "crop_id" in c}


class RotationRecommendationService:
    """Service providing comparative crop rotation strategies and offline sync bundles."""

    def __init__(
        self,
        zone_repo: ZoneRepository | None = None,
        crop_repo: CropRepository | None = None,
        scorer: RotationScorer | None = None,
        alert_evaluator: AgroclimaticAlertEvaluator | None = None,
    ):
        self.zone_repo: ZoneRepository = zone_repo or JsonZoneRepository()
        self.crop_repo: CropRepository = crop_repo or JsonCropRepository()
        self.scorer: RotationScorer = scorer or MultiCriteriaRotationScorer()
        self.alert_evaluator: AgroclimaticAlertEvaluator = alert_evaluator or AgroclimaticAlertEvaluator()

    def recommend(
        self,
        zone_id: str,
        current_crop_id: str,
        farmer_priorities: list[str],
        constraints: dict[str, Any],
    ) -> dict[str, Any]:
        """Generate ranked rotation strategies with live NASA telemetry."""
        zone = self.zone_repo.get_zone(zone_id)
        if not zone:
            raise ValueError(f"Unknown zone: '{zone_id}'")

        crops_map = self.crop_repo.get_crops_map()
        if current_crop_id not in crops_map:
            raise ValueError(f"Unknown crop: '{current_crop_id}'")

        raw_strats = zone.get("strategies", [])
        scored = [
            self.scorer.score_strategy(s, zone, crops_map, farmer_priorities, constraints, current_crop_id)
            for s in raw_strats
        ]

        baselines = [s for s in scored if s.get("strategy_type") == "current_baseline"]
        alts = [s for s in scored if s.get("strategy_type") == "adaptive_alternative"]
        alts.sort(key=lambda s: s.get("priority_alignment_score", 0.0), reverse=True)
        others = [s for s in scored if s.get("strategy_type") not in ("current_baseline", "adaptive_alternative")]
        strategies = _normalize_json_numbers(baselines + alts + others)

        if len(strategies) < 3:
            raise ValueError(f"Zone '{zone_id}' must yield at least 3 strategies, got {len(strategies)}")

        inds = zone.get("monthly_harmonized_indicators", [])
        etl_status = inds[0].get("data_status", "phase0_seed_pending_etl") if inds else "phase0_seed_pending_etl"
        provenance = {
            "nasa_datasets": [
                "NASA POWER (Climatology & Radiation)",
                "SMAP L4 (Root-zone soil moisture)",
                "MODIS/Sentinel-2 (NDVI bare soil detection)",
                "GPM/IMERG (Precipitation)",
                "SRTM (Elevation & Slope)",
            ],
            "soil_dataset": "ISRIC SoilGrids 250m & FAO GAEZ v4 (USDA SSURGO substituted due to US-only coverage)",
            "etl_status": etl_status,
            "integrity_sha256": compute_sha256(
                json.dumps(strategies, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
            ),
        }

        bulletin = _normalize_json_numbers(self.alert_evaluator.evaluate_zone(zone_id, zone))

        return {
            "zone_id": zone_id,
            "evaluated_at": datetime.now(timezone.utc).isoformat(),
            "current_crop_id": current_crop_id,
            "priorities_considered": list(farmer_priorities),
            "strategies": strategies,
            "data_provenance": provenance,
            "realtime_bulletin": bulletin,
        }

    def build_offline_bundle(self, zone_id: str) -> dict[str, Any]:
        """Package all zone profiles, crops, and recommendations for offline PWA sync."""
        zone = self.zone_repo.get_zone(zone_id)
        if not zone:
            raise ValueError(f"Unknown zone: '{zone_id}'")

        crops = self.crop_repo.list_crops()
        crops_map = self.crop_repo.get_crops_map()
        def_priorities = ["water_conservation", "nitrogen_fixation", "erosion_control"]
        def_constraints = {"irrigation_access": "deficit_auxiliary", "equipment_level": "manual_yunta", "language_preference": "bilingual"}
        default_crop = "papa_huaycha" if zone_id == "tapacari_zona_andina" else "maiz_valle"

        scored = [
            self.scorer.score_strategy(s, zone, crops_map, def_priorities, def_constraints, default_crop)
            for s in zone.get("strategies", [])
        ]
        now_utc = datetime.now(timezone.utc).isoformat()
        bundle_content = _normalize_json_numbers({
            "bundle_id": f"bundle_{zone_id}",
            "zone_id": zone_id,
            "generated_at": now_utc,
            "generated_at_utc": now_utc,
            "version": "1.0.0",
            "bundle_version": "1.0.0",
            "zone_profile": copy.deepcopy(zone),
            "crops_catalog": copy.deepcopy(crops),
            "precomputed_recommendations": scored,
            "realtime_bulletin": self.alert_evaluator.evaluate_zone(zone_id, zone),
        })
        canonical = json.dumps(bundle_content, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
        bundle_content["integrity_sha256"] = compute_sha256(canonical)
        return bundle_content
