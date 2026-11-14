"""NASA POWER Climatology API client implementing ClimateDataProvider (SOLID DIP)."""

from typing import Any
import requests

try:
    from etl.security import validate_bolivia_coords, validate_nasa_url
except ModuleNotFoundError:
    from security import validate_bolivia_coords, validate_nasa_url

DAYS_IN_MONTH: list[int] = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
MONTH_KEYS: list[str] = [
    "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
    "JUL", "AUG", "SEP", "OCT", "NOV", "DEC",
]


def _clean(val: Any, default: float) -> float:
    """Sanitize NASA POWER parameter value, converting missing/-999 to default."""
    if val is None:
        return default
    try:
        f = float(val)
        return default if f <= -900.0 else f
    except (TypeError, ValueError):
        return default


def _estimate_frost_days(temp_min: float) -> int:
    """Estimate monthly frost risk days from minimum temperature."""
    if temp_min >= 5.0:
        return 0
    if temp_min >= 0.0:
        return max(0, round((5.0 - temp_min) * 1.6))
    return min(31, max(0, round(8.0 - 3.2 * temp_min)))


class NasaPowerClient:
    """Client for NASA POWER Climatology API implementing ClimateDataProvider."""

    ENDPOINT = "https://power.larc.nasa.gov/api/temporal/climatology/point"

    def __init__(self, fallback_data: dict[str, Any] | None = None, timeout: int = 12):
        self.endpoint = validate_nasa_url(self.ENDPOINT)
        self.fallback_data = fallback_data
        self.timeout = timeout

    def _parse_monthly(self, params: dict[str, Any]) -> list[dict[str, Any]]:
        """Parse raw NASA POWER parameter dictionaries into 12 normalized records."""
        tmin_p = params.get("T2M_MIN", {})
        tmax_p = params.get("T2M_MAX", {})
        pr_p = params.get("PRECTOTCORR", {})
        gwet_p = params.get("GWETTOP", {})
        rh_p = params.get("RH2M", {})

        records: list[dict[str, Any]] = []
        for idx, (m_key, days) in enumerate(zip(MONTH_KEYS, DAYS_IN_MONTH), start=1):
            t_min = round(_clean(tmin_p.get(m_key), 10.0), 1)
            t_max = round(_clean(tmax_p.get(m_key), 22.0), 1)
            daily_precip = max(0.0, _clean(pr_p.get(m_key), 0.0))
            precip_mm = round(daily_precip * days, 1)
            gwet = _clean(gwet_p.get(m_key), 0.35)
            soil_moisture = round(max(0.0, min(1.0, gwet)), 2)
            rh = round(max(0.0, min(100.0, _clean(rh_p.get(m_key), 60.0))), 1)

            records.append({
                "month": idx,
                "temp_min_c": t_min,
                "temp_max_c": t_max,
                "precip_mm": precip_mm,
                "soil_moisture_index": soil_moisture,
                "rel_humidity_pct": rh,
                "frost_risk_days": _estimate_frost_days(t_min),
                "data_status": "nasa_power_live_climatology",
            })
        return records

    def fetch_monthly_climatology(
        self, lat: float, lon: float, fallback: dict[str, Any] | None = None
    ) -> dict[str, Any]:
        """Fetch and normalize 12-month climatology indicators from NASA POWER."""
        v_lat, v_lon = validate_bolivia_coords(lat, lon)
        url = validate_nasa_url(self.endpoint)
        query = {
            "community": "AG",
            "parameters": "T2M_MIN,T2M_MAX,PRECTOTCORR,GWETTOP,RH2M",
            "latitude": v_lat,
            "longitude": v_lon,
            "format": "JSON",
        }
        try:
            resp = requests.get(url, params=query, timeout=self.timeout, allow_redirects=False)
            if resp.status_code != 200:
                raise RuntimeError(f"NASA POWER API returned HTTP status {resp.status_code}")
            data = resp.json()
            raw_params = data.get("properties", {}).get("parameter", {})
            return {
                "lat": v_lat,
                "lon": v_lon,
                "data_status": "nasa_power_live_climatology",
                "monthly": self._parse_monthly(raw_params),
            }
        except Exception as err:
            fb = fallback if fallback is not None else self.fallback_data
            if fb is not None:
                return fb
            raise RuntimeError(f"NASA POWER climatology fetch failed: {type(err).__name__}") from None
