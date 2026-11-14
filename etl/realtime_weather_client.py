"""Real-time meteorological forecast & NASA POWER daily satellite ETL client."""

from datetime import datetime, timedelta, timezone
import json
from pathlib import Path
from typing import Any
import requests

try:
    from etl.security import compute_sha256, validate_bolivia_coords, validate_nasa_url
except ModuleNotFoundError:
    from security import compute_sha256, validate_bolivia_coords, validate_nasa_url

OPEN_METEO_ENDPOINT = "https://api.open-meteo.com/v1/forecast"
NASA_DAILY_ENDPOINT = "https://power.larc.nasa.gov/api/temporal/daily/point"


def _valid_val(val: Any) -> float | None:
    """Return finite float unless missing or NASA -999 fill sentinel."""
    if val is None:
        return None
    try:
        f = float(val)
        return None if f <= -900.0 else round(f, 3)
    except (TypeError, ValueError):
        return None


def _write_compact_realtime(payload: dict[str, Any], out_path: Path) -> None:
    """Serialize real-time telemetry with compact lines (<= 90 lines total)."""
    lines = [
        "{",
        f'  "dataset_version": {json.dumps(payload.get("dataset_version", "1.0.0"))},',
        f'  "source": {json.dumps(payload.get("source", ""))},',
        f'  "fetched_at_utc": {json.dumps(payload.get("fetched_at_utc", ""))},',
        f'  "integrity_sha256": {json.dumps(payload.get("integrity_sha256", ""))},',
        '  "zones": {',
    ]
    zones = payload.get("zones", {})
    z_keys = list(zones.keys())
    for idx, zk in enumerate(z_keys):
        zd = zones[zk]
        lines.append(f'    "{zk}": {{')
        lines.append(f'      "lat": {zd["lat"]}, "lon": {zd["lon"]}, "data_status": {json.dumps(zd["data_status"])},')
        lines.append(f'      "current": {json.dumps(zd["current"])},')
        lines.append('      "daily_forecast": [')
        daily = zd.get("daily_forecast", [])
        for j, d in enumerate(daily):
            lines.append(f'        {json.dumps(d)}{"," if j < len(daily) - 1 else ""}')
        lines.append('      ],')
        lines.append('      "nasa_recent_daily": [')
        nasa_days = zd.get("nasa_recent_daily", [])
        for j, nd in enumerate(nasa_days):
            lines.append(f'        {json.dumps(nd)}{"," if j < len(nasa_days) - 1 else ""}')
        lines.append('      ]')
        lines.append(f'    }}{"," if idx < len(z_keys) - 1 else ""}')
    lines.extend(["  }", "}"])
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text("\n".join(lines) + "\n", encoding="utf-8")


class RealtimeWeatherClient:
    """Fetches live 7-day meteorological forecasts and recent NASA POWER daily telemetry."""

    def __init__(self, timeout: int = 12):
        self.open_meteo_url = validate_nasa_url(OPEN_METEO_ENDPOINT)
        self.nasa_daily_url = validate_nasa_url(NASA_DAILY_ENDPOINT)
        self.timeout = timeout

    def fetch_zone_realtime(self, lat: float, lon: float) -> dict[str, Any]:
        """Fetch live current weather, 7-day daily forecast, and recent NASA POWER daily obs."""
        v_lat, v_lon = validate_bolivia_coords(lat, lon)
        om_resp = requests.get(
            validate_nasa_url(self.open_meteo_url),
            params={
                "latitude": v_lat, "longitude": v_lon,
                "current": "temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,soil_moisture_0_to_7cm",
                "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max,et0_fao_evapotranspiration,wind_speed_10m_max",
                "timezone": "America/La_Paz", "forecast_days": 7,
            },
            timeout=self.timeout, allow_redirects=False,
        )
        if om_resp.status_code != 200:
            raise RuntimeError(f"Open-Meteo HTTP {om_resp.status_code}")
        om = om_resp.json()
        cur = om.get("current", {})
        daily = om.get("daily", {})
        dates = daily.get("time", [])
        forecast = []
        for i, dt in enumerate(dates):
            forecast.append({
                "date": dt,
                "temp_max_c": round(float(daily["temperature_2m_max"][i]), 1),
                "temp_min_c": round(float(daily["temperature_2m_min"][i]), 1),
                "precip_mm": round(float(daily["precipitation_sum"][i]), 1),
                "precip_prob_pct": int(daily["precipitation_probability_max"][i] or 0),
                "et0_mm": round(float(daily["et0_fao_evapotranspiration"][i] or 0.0), 1),
                "wind_kmh": round(float(daily["wind_speed_10m_max"][i] or 0.0), 1),
            })

        end_dt = datetime.now(timezone.utc).date() - timedelta(days=2)
        start_dt = end_dt - timedelta(days=8)
        nasa_days: list[dict[str, Any]] = []
        try:
            np_resp = requests.get(
                validate_nasa_url(self.nasa_daily_url),
                params={
                    "community": "AG",
                    "parameters": "T2M_MIN,T2M_MAX,PRECTOTCORR,GWETTOP,ALLSKY_SFC_SW_DWN",
                    "latitude": v_lat, "longitude": v_lon,
                    "start": start_dt.strftime("%Y%m%d"), "end": end_dt.strftime("%Y%m%d"), "format": "JSON",
                },
                timeout=self.timeout, allow_redirects=False,
            )
            if np_resp.status_code == 200:
                params = np_resp.json().get("properties", {}).get("parameter", {})
                all_keys = sorted(params.get("T2M_MIN", {}).keys())
                for k in all_keys:
                    tmin = _valid_val(params.get("T2M_MIN", {}).get(k))
                    gwet = _valid_val(params.get("GWETTOP", {}).get(k))
                    rad = _valid_val(params.get("ALLSKY_SFC_SW_DWN", {}).get(k))
                    if tmin is None and gwet is None:
                        continue
                    nasa_days.append({
                        "date": f"{k[:4]}-{k[4:6]}-{k[6:]}",
                        "temp_min_c": round(tmin, 1) if tmin is not None else None,
                        "temp_max_c": _valid_val(params.get("T2M_MAX", {}).get(k)),
                        "precip_mm": _valid_val(params.get("PRECTOTCORR", {}).get(k)),
                        "surface_wetness": round(gwet, 2) if gwet is not None else None,
                        "solar_mj_m2": round(rad, 1) if rad is not None else None,
                    })
                nasa_days = nasa_days[-5:]
        except Exception:
            nasa_days = []

        return {
            "lat": v_lat, "lon": v_lon,
            "data_status": "live_open_meteo_and_nasa_daily",
            "current": {
                "observed_at": cur.get("time"),
                "temp_c": round(float(cur.get("temperature_2m", 0.0)), 1),
                "humidity_pct": int(cur.get("relative_humidity_2m", 0)),
                "precip_mm": round(float(cur.get("precipitation", 0.0)), 1),
                "wind_kmh": round(float(cur.get("wind_speed_10m", 0.0)), 1),
                "soil_moisture_top_pct": round(float(cur.get("soil_moisture_0_to_7cm", 0.0)) * 100.0, 1),
            },
            "daily_forecast": forecast,
            "nasa_recent_daily": nasa_days,
        }

    def sync_all_zones(self, pilots_path: Path | str, out_path: Path | str) -> dict[str, Any]:
        """Synchronize live weather + NASA recent daily telemetry for all Cochabamba zones."""
        pilots = json.loads(Path(pilots_path).read_text(encoding="utf-8")).get("zones", [])
        zones_out: dict[str, Any] = {}
        for z in pilots:
            zid = z.get("zone_id")
            coords = z.get("coordinates", {})
            if zid and "lat" in coords and "lon" in coords:
                zones_out[zid] = self.fetch_zone_realtime(coords["lat"], coords["lon"])
        body = {
            "dataset_version": "1.0.0",
            "source": "Open-Meteo Live Forecast + NASA POWER Daily Satellite",
            "fetched_at_utc": datetime.now(timezone.utc).isoformat(),
            "zones": zones_out,
        }
        canonical = json.dumps(zones_out, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
        body["integrity_sha256"] = compute_sha256(canonical)
        _write_compact_realtime(body, Path(out_path))
        return body


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    res = RealtimeWeatherClient().sync_all_zones(
        root / "data" / "zones" / "cochabamba_pilots.json",
        root / "data" / "zones" / "realtime_weather_telemetry.json",
    )
    print(f"Synced real-time weather + NASA daily for {len(res['zones'])} zones (sha256={res['integrity_sha256'][:12]}...)")
