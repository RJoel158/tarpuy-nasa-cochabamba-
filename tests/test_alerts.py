"""Tests for real-time ETL SSRF rules, alert evaluation, veracity manifest, and /api/alerts."""

import json
from unittest.mock import MagicMock, patch
from fastapi.testclient import TestClient

from backend.main import app
from engine.alerts import AgroclimaticAlertEvaluator
from etl.quechua_tts_client import QuechuaTtsClient, SpanishTtsClient, clean_quechua_for_tts, clean_spanish_for_tts
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
    mock_om.json.return_value["daily_units"] = {"temperature_2m_max":"°C", "temperature_2m_min":"°C", "precipitation_sum":"mm", "precipitation_probability_max":"%", "et0_fao_evapotranspiration":"mm", "wind_speed_10m_max":"km/h"}
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
    assert ids["water_deficit"] == "warning"  # Weekly model balance does not establish local drought.
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
    assert "alerts_spoken_es" in data
    assert "predictions_summary_14d" in data
    assert "municipal_alert" in data
    assert data["municipal_alert"]["audience"] == "regantes_gamc"
    assert "media-src 'self'" in res.headers["content-security-policy"]
    assert client.get("/api/alerts/bad$zone").status_code == 400
    assert client.get("/api/alerts/unknown_zone_xyz").status_code == 404


def test_municipal_alert_rules_anegamiento_and_desabastecimiento(tmp_path):
    tel_file = tmp_path / "rt_14d.json"
    # Scenario A: Flood / Canal saturation (Rain + D9 / drainage)
    tel_file.write_text(json.dumps({
        "fetched_at_utc": "2026-11-14T00:00:00Z",
        "zones": {"punata_valle_alto": {
            "data_status": "live_open_meteo_and_nasa_daily",
            "current": {"temp_c": 16.0, "soil_moisture_top_pct": 58.0},
            "daily_forecast": [
                {"date": f"2026-11-{14+i:02d}", "temp_max_c": 22.0, "temp_min_c": 11.0, "precip_mm": 18.0 if i < 3 else 0.0, "precip_prob_pct": 90 if i < 3 else 5, "et0_mm": 4.0, "wind_kmh": 10.0}
                for i in range(14)
            ],
            "nasa_recent_daily": [],
        }},
    }), encoding="utf-8")
    evaluator = AgroclimaticAlertEvaluator(tel_file)
    res_flood = evaluator.evaluate_zone("punata_valle_alto", district_code="D9", comuna="Itocta", drainage_type="Quebradas")
    alert_f = res_flood["municipal_alert"]
    assert alert_f["theme"] == "anegamiento_canales"
    assert alert_f["district_code"] == "D9"
    assert "Distrito 9" in alert_f["title_es"]
    assert "cerrar compuertas" in alert_f["actions_es"][0].lower()
    assert "🚨 AVISO A REGANTES" in alert_f["share_text"]
    assert len(res_flood["fourteen_day_forecast"]) == 14
    assert len(res_flood["seven_day_forecast"]) == 7

    # Scenario B: Drought / Desabastecimiento
    tel_file.write_text(json.dumps({
        "fetched_at_utc": "2026-11-14T00:00:00Z",
        "zones": {"punata_valle_alto": {
            "data_status": "live_open_meteo_and_nasa_daily",
            "current": {"temp_c": 25.0, "soil_moisture_top_pct": 19.0},
            "daily_forecast": [
                {"date": f"2026-11-{14+i:02d}", "temp_max_c": 28.0, "temp_min_c": 12.0, "precip_mm": 0.0, "precip_prob_pct": 0, "et0_mm": 6.5, "wind_kmh": 14.0}
                for i in range(14)
            ],
            "nasa_recent_daily": [],
        }},
    }), encoding="utf-8")
    evaluator_dry = AgroclimaticAlertEvaluator(tel_file)
    res_dry = evaluator_dry.evaluate_zone("punata_valle_alto", district_code="D13", comuna="Tunari")
    alert_d = res_dry["municipal_alert"]
    assert alert_d["theme"] == "desabastecimiento"
    assert "déficit hídrico" in alert_d["title_es"].lower()
    assert "turnos" in alert_d["actions_es"][0].lower()
    assert "⚠️ AVISO A REGANTES" in alert_d["share_text"]


def test_quechua_tts_clean_and_api_endpoint():
    assert clean_quechua_for_tts("Sara -> Avena!") == "Sara , chanta Avena."
    assert clean_spanish_for_tts("Maíz -> Avena (forraje)!") == "Maíz , luego Avena"
    client = TestClient(app)
    with patch.object(QuechuaTtsClient, "synthesize_wav_bytes", return_value=b"RIFF\x24\x00\x00\x00WAVEfmt "):
        res = client.post("/api/tts/quechua", json={"text": "Allillanchu Cochabamba"})
    assert res.status_code == 200
    assert res.headers["content-type"].startswith("audio/wav")
    assert res.content.startswith(b"RIFF")
    with patch.object(SpanishTtsClient, "synthesize_wav_bytes", return_value=b"RIFF\x24\x00\x00\x00WAVEfmt "):
        res_es = client.post("/api/tts/spanish", json={"text": "Hola productor de Punata"})
    assert res_es.status_code == 200
    assert res_es.headers["content-type"].startswith("audio/wav")
    assert res_es.content.startswith(b"RIFF")
    assert client.post("/api/tts/quechua", json={"text": "a", "extra": "hack"}).status_code == 422
