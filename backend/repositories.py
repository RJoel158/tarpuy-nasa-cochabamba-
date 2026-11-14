"""Zone and crop repositories with safe paths and NASA POWER telemetry merging."""

import json
from pathlib import Path
from typing import Any

from backend.security import resolve_safe_data_path
from engine.interfaces import CropRepository, ZoneRepository
from etl.harmonizer import ZoneHarmonizer


class HarmonizedJsonZoneRepository(ZoneRepository):
    """Zone repository merging pilot zone baselines with live NASA POWER telemetry."""

    def __init__(
        self,
        base_dir: Path | str | None = None,
        harmonizer: ZoneHarmonizer | None = None,
    ):
        base = Path(base_dir) if base_dir else Path(__file__).resolve().parent.parent
        self.base_dir = base
        self.pilots_path = resolve_safe_data_path(base, "data", "zones", "cochabamba_pilots.json")
        self.telemetry_path = resolve_safe_data_path(base, "data", "zones", "nasa_live_telemetry.json")
        self.harmonizer = harmonizer or ZoneHarmonizer()

    def list_zones(self) -> list[dict[str, Any]]:
        if not self.pilots_path.exists():
            return []
        raw = json.loads(self.pilots_path.read_text(encoding="utf-8"))
        zones = raw.get("zones", [])
        telemetry = None
        if self.telemetry_path.exists():
            try:
                telemetry = json.loads(self.telemetry_path.read_text(encoding="utf-8"))
            except Exception:
                telemetry = None

        return [self.harmonizer.merge_zone_with_telemetry(zone, telemetry) for zone in zones]

    def get_zone(self, zone_id: str) -> dict[str, Any] | None:
        return next((z for z in self.list_zones() if z.get("zone_id") == zone_id), None)


class SafeJsonCropRepository(CropRepository):
    """Crop repository that safely loads crops catalog via path validation."""

    def __init__(self, base_dir: Path | str | None = None):
        base = Path(base_dir) if base_dir else Path(__file__).resolve().parent.parent
        self.base_dir = base
        self.crops_path = resolve_safe_data_path(base, "data", "crops_cochabamba.json")

    def list_crops(self) -> list[dict[str, Any]]:
        if not self.crops_path.exists():
            return []
        data = json.loads(self.crops_path.read_text(encoding="utf-8"))
        return data.get("crops", [])

    def get_crops_map(self) -> dict[str, dict[str, Any]]:
        return {c["crop_id"]: c for c in self.list_crops() if "crop_id" in c}
