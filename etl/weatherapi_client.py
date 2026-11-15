"""WeatherAPI adapter. Explicitly retain Open-Meteo agronomic fields and uncovered dates."""
from copy import deepcopy
from math import isfinite
from datetime import datetime
import requests
from etl.security import validate_bolivia_coords


def value(data, key, low=None, high=None):
    raw = data.get(key)
    if raw is None or isinstance(raw, bool):
        raise ValueError(f"Missing WeatherAPI field: {key}")
    number = float(raw)
    if not isfinite(number) or (low is not None and number < low) or (high is not None and number > high):
        raise ValueError(f"Invalid WeatherAPI field: {key}")
    return number


def merge_weatherapi(base, payload):
    """Only replace dates actually supplied; never invent ET0, soil moisture or extra forecast days."""
    location = payload.get("location", {})
    provider_lat = value(location, "lat")
    provider_lon = value(location, "lon")
    validate_bolivia_coords(provider_lat, provider_lon)
    if location.get("tz_id") != "America/La_Paz":
        raise ValueError("Unexpected WeatherAPI timezone")
    out = deepcopy(base)
    out["agronomic_grid"] = out.get("model_grid")
    out["model_grid"] = {"lat":provider_lat, "lon":provider_lon, "kind":"provider_location_not_parcel_measurement"}
    records = payload.get("forecast", {}).get("forecastday", [])
    if not records:
        raise ValueError("Empty WeatherAPI forecast")
    by_date = {}
    for record in records:
        date = record["date"]
        datetime.strptime(date, "%Y-%m-%d")
        if date in by_date:
            raise ValueError("Duplicate WeatherAPI date")
        daily = record["day"]
        minimum, maximum = value(daily,"mintemp_c"), value(daily,"maxtemp_c")
        if minimum > maximum:
            raise ValueError("Minimum exceeds maximum")
        by_date[date] = {"temp_min_c": minimum, "temp_max_c": maximum,
            "precip_mm": value(daily,"totalprecip_mm",0),
            "precip_prob_pct": value(daily,"daily_chance_of_rain",0,100),
            "wind_kmh": value(daily,"maxwind_kph",0)}
    matched = 0
    for day in out["daily_forecast"]:
        replacement = by_date.get(day["date"])
        if replacement:
            day.update(replacement)
            day["forecast_provider"] = "WeatherAPI"
            day["et0_provider"] = "Open-Meteo"
            matched += 1
        else:
            day["forecast_provider"] = "Open-Meteo"
    if not matched:
        raise ValueError("WeatherAPI and reference forecast dates do not overlap")
    current = payload.get("current", {})
    updated = current["last_updated"].replace(" ", "T")
    datetime.fromisoformat(updated)
    out["current"].update({"observed_at": updated, "temp_c": value(current,"temp_c"),
        "humidity_pct": value(current,"humidity",0,100), "precip_mm": value(current,"precip_mm",0),
        "wind_kmh": value(current,"wind_kph",0)})
    out["weather_provider"] = "WeatherAPI"
    out["provider_forecast_days"] = matched
    out["weather_sources"] = {"current_and_first_days":"WeatherAPI", "remaining_forecast_days":"Open-Meteo", "et0_and_surface_soil_moisture":"Open-Meteo", "nasa_history":"NASA POWER, zonal"}
    out["data_status"] = "weatherapi_with_open_meteo_agronomic_reference"
    return out


class WeatherApiClient:
    def __init__(self, api_key, timeout=10):
        self.api_key, self.timeout = api_key, timeout

    def enrich(self, reference, lat, lon):
        lat, lon = validate_bolivia_coords(lat,lon)
        try:
            response = requests.get("https://api.weatherapi.com/v1/forecast.json", params={"key":self.api_key,"q":f"{lat},{lon}","days":3,"aqi":"no","alerts":"no"},timeout=self.timeout,allow_redirects=False)
        except requests.RequestException:
            raise RuntimeError("WeatherAPI connection unavailable") from None
        if response.status_code != 200:
            raise RuntimeError(f"WeatherAPI HTTP {response.status_code}")
        return merge_weatherapi(reference,response.json())
