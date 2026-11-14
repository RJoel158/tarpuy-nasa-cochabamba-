"""Zone harmonizer combining baseline satellite indicators with NASA POWER telemetry."""

import copy
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any

try:
    from etl.interfaces import ClimateDataProvider
    from etl.nasa_power_client import NasaPowerClient
    from etl.security import compute_sha256
except ModuleNotFoundError:
    from interfaces import ClimateDataProvider
    from nasa_power_client import NasaPowerClient
    from security import compute_sha256

POWER_KEYS = (
    "temp_min_c", "temp_max_c", "precip_mm",
    "soil_moisture_index", "frost_risk_days", "data_status",
)


def _write_compact_telemetry(data: dict[str, Any], path: Path) -> None:
    """Serialize telemetry JSON with single-line month objects (<= 120 lines total)."""
    lines = [
        "{",
        f'  "dataset_version": {json.dumps(data.get("dataset_version", "1.0.0"))},',
        f'  "source": {json.dumps(data.get("source", ""))},',
        f'  "fetched_at_utc": {json.dumps(data.get("fetched_at_utc", ""))},',
        f'  "integrity_sha256": {json.dumps(data.get("integrity_sha256", ""))},',
        '  "zones": {',
    ]
    zones = data.get("zones", {})
    z_keys = list(zones.keys())
    for i, zk in enumerate(z_keys):
        zd = zones[zk]
        lines.append(f'    "{zk}": {{"lat": {zd.get("lat")}, "lon": {zd.get("lon")}, "monthly": [')
        months = zd.get("monthly", [])
        for j, m in enumerate(months):
            comma = "," if j < len(months) - 1 else ""
            lines.append(f"      {json.dumps(m)}{comma}")
        comma_zone = "," if i < len(z_keys) - 1 else ""
        lines.append(f"    ]}}{comma_zone}")
    lines.extend(["  }", "}"])
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


class ZoneHarmonizer:
    """Harmonizes pilot zone baselines with NASA POWER climatology telemetry."""

    def __init__(self, provider: ClimateDataProvider | None = None):
        self.provider: ClimateDataProvider = provider or NasaPowerClient()

    def sync_telemetry(self, pilots_path: Path | str, telemetry_path: Path | str) -> dict[str, Any]:
        """Fetch climatology for pilot zones and write compact telemetry JSON."""
        p_path, t_path = Path(pilots_path), Path(telemetry_path)
        pilots_data = json.loads(p_path.read_text(encoding="utf-8")) if p_path.exists() else {}
        zones = pilots_data.get("zones", [])
        existing = {}
        if t_path.exists():
            try:
                existing = json.loads(t_path.read_text(encoding="utf-8")).get("zones", {})
            except Exception:
                existing = {}

        zones_telemetry: dict[str, Any] = {}
        for z in zones:
            zid = z["zone_id"]
            coords = z.get("coordinates", {})
            lat, lon = float(coords["lat"]), float(coords["lon"])
            try:
                res = self.provider.fetch_monthly_climatology(lat, lon)
                monthly = res.get("monthly", []) if isinstance(res, dict) else res
            except Exception:
                if zid in existing and existing[zid].get("monthly"):
                    monthly = existing[zid]["monthly"]
                else:
                    monthly = [
                        {**m, "data_status": "offline_fallback"}
                        for m in z.get("monthly_harmonized_indicators", [])
                    ]
            zones_telemetry[zid] = {"lat": lat, "lon": lon, "monthly": monthly}

        payload: dict[str, Any] = {
            "dataset_version": pilots_data.get("dataset_version", "1.0.0"),
            "source": "NASA POWER Climatology API (AG)",
            "fetched_at_utc": datetime.now(timezone.utc).isoformat(),
            "integrity_sha256": compute_sha256(json.dumps(zones_telemetry, sort_keys=True)),
            "zones": zones_telemetry,
        }
        _write_compact_telemetry(payload, t_path)
        return payload

    def merge_zone_with_telemetry(
        self, zone: dict[str, Any], telemetry: dict[str, Any] | None
    ) -> dict[str, Any]:
        """Merge live NASA POWER metrics with zone baseline satellite indicators."""
        merged = copy.deepcopy(zone)
        if not telemetry:
            return merged
        zid = zone.get("zone_id", "")
        records: list[dict[str, Any]] = []
        if isinstance(telemetry, dict):
            if "zones" in telemetry and zid in telemetry["zones"]:
                records = telemetry["zones"][zid].get("monthly", [])
            elif "monthly" in telemetry:
                records = telemetry["monthly"]
            elif zid in telemetry and isinstance(telemetry[zid], dict):
                records = telemetry[zid].get("monthly", [])
        elif isinstance(telemetry, list):
            records = telemetry

        t_by_month = {r["month"]: r for r in records if isinstance(r, dict) and "month" in r}
        updated = []
        for ind in merged.get("monthly_harmonized_indicators", []):
            t_data = t_by_month.get(ind.get("month"))
            new_ind = dict(ind)
            if t_data:
                for k in POWER_KEYS:
                    if k in t_data:
                        new_ind[k] = t_data[k]
            updated.append(new_ind)
        merged["monthly_harmonized_indicators"] = updated
        return merged


if __name__ == "__main__":
    base = Path(__file__).resolve().parent.parent
    p_file = base / "data" / "zones" / "cochabamba_pilots.json"
    t_file = base / "data" / "zones" / "nasa_live_telemetry.json"
    synced = ZoneHarmonizer().sync_telemetry(p_file, t_file)
    print(f"Synced {len(synced.get('zones', {}))} zones to {t_file}")
