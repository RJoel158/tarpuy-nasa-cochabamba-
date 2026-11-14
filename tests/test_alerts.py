"""Tests for real-time ETL SSRF rules, alert evaluation, veracity manifest, and /api/alerts."""

import json
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from backend.main import app
from engine.alerts import AgroclimaticAlertEvaluator
from etl.realtime_weather_client import RealtimeWeatherClient


def test_realtime_weather_client_parses_live_and_nasa_daily():
    mock_om = MagicMock(status_code=200)
    mock_om.json.return_value = {
        "current": {"time": "2026-11-13T18:00", "temperature_2m": 16.0, "relative_humidity_2m": 60, "precipitation": 0.0, "wind_speed_10m": 8.0, "soil_moisture_0_to_7cm": 0.21},
        "daily": {
            "time": ["2026-11-13", "2026-11-14"],
            "temperature_2m_max": [24.0, 22.0], "temperature_2m_min": [6.0, -1.0],
            "precipitation_sum": [1.0, 0.0], "precipitation_probability_max": [20, 5],
            "et0_fao_evapotranspiration": [5.0, 5.5], "wind_speed_10m_max": [12.0, 21.0],
        },
    }
    mock_np = MagicMock(status_code=200)
    mock_np.json.return_value = {
        "properties": {"parameter": {
            "T2M_MIN": {"20261110": 8.2, "20261111": -999.0},
            "T2M_MAX": {"20261110": 21.4, "20261111": -999.0},
            "PRECTOTCORR": {"20261110": 2.5, "20261111": -999.0},
            "GWETTOP": {"20261110": 0.52, "20261111": -999.0},
            "ALLSKY_SFC_SW_DWN": {"20261110": 18.9, "20261111": -999.0},
        }}
    }
    with patch("etl.realtime_weather_client.requests.get", side_effect=[mock_om, mock_np]):
        res = RealtimeWeatherClient().fetch_zone_realtime(-17.542, -65.835)
    assert res["data_status"] == "live_open_meteo_and_nasa_daily"
    assert len(res["daily_forecast"]) == 2
    assert len(res["nasa_recent_daily"]) == 1  # -999 day excluded honestly
    assert res["nasa_recent_daily"][0]["solar_mj_m2"] == 18.9


def test_alert_evaluator_detects_frost_water_and_wind(tmp_path):
    tel_file = tmp_path / "rt.json"
    tel_file.write_text(json.dumps({
        "fetched_at_utc": "2026-11-14T00:00:00Z",
        "zones": {"tapacari_zona_andina": {
            "data_status": "live_open_meteo_and_nasa_daily",
            "current": {"temp_c": 9.0, "soil_moisture_top_pct": 16.0},
            "daily_forecast": [
                {"date": "2026-11-14", "temp_max_c": 18.0, "temp_min_c": -1.5, "precip_mm": 0.0, "precip_prob_pct": 10, "et0_mm": 6.0, "wind_kmh": 22.0},
                {"date": "2026-11-15", "temp_max_c": 19.0, "temp_min_c": 2.0, "precip_mm": 0.0, "precip_prob_pct": 5, "et0_mm": 11.0, "wind_kmh": 14.0},
            ],
            "nasa_recent_daily": [{"date": "2026-11-10", "surface_wetness": 0.42}],
        }},
    }), encoding="utf-8")
    bulletin = AgroclimaticAlertEvaluator(tel_file).evaluate_zone("tapacari_zona_andina")
    ids = {a["id"]: a["severity"] for a in bulletin["active_alerts"]}
    assert ids["frost_critical"] == "critical"
    assert ids["water_deficit"] == "critical"
    assert ids["wind_warning"] == "warning"
    assert len(bulletin["veracity_manifest"]) == 4


def test_api_alerts_endpoint_and_security():
    client = TestClient(app)
    res = client.get("/api/alerts/punata_valle_alto")
    assert res.status_code == 200
    data = res.json()
    assert data["zone_id"] == "punata_valle_alto"
    assert len(data["seven_day_forecast"]) == 7
    assert len(data["active_alerts"]) >= 1
    assert len(data["veracity_manifest"]) == 4
    assert "media-src 'self'" in res.headers["content-security-policy"]
    assert client.get("/api/alerts/bad$zone").status_code == 400
    assert client.get("/api/alerts/unknown_zone_xyz").status_code == 404
