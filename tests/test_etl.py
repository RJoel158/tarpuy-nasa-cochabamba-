"""Tests for ETL package: security, client, protocol, and harmonizer."""

import json
from pathlib import Path
from unittest.mock import MagicMock, patch
import pytest

from etl import (
    ClimateDataProvider,
    NasaPowerClient,
    ZoneHarmonizer,
    compute_sha256,
    validate_bolivia_coords,
    validate_nasa_url,
)


class TestSecurity:
    """OWASP A10 SSRF and OWASP A08 Data Integrity tests."""

    def test_validate_nasa_url_valid(self):
        url = "https://power.larc.nasa.gov/api/temporal/climatology/point"
        assert validate_nasa_url(url) == url

    def test_validate_nasa_url_rejects_http(self):
        with pytest.raises(ValueError, match="only 'https' is permitted"):
            validate_nasa_url("http://power.larc.nasa.gov/api")

    def test_validate_nasa_url_rejects_disallowed_host(self):
        with pytest.raises(ValueError, match="not in allowed NASA hosts"):
            validate_nasa_url("https://malicious-site.com/api")

    def test_validate_nasa_url_rejects_embedded_credentials(self):
        with pytest.raises(ValueError, match="Embedded credentials"):
            validate_nasa_url("https://admin:secret@power.larc.nasa.gov/api")

    def test_validate_bolivia_coords_valid(self):
        lat, lon = validate_bolivia_coords(-17.542, -65.835)
        assert lat == pytest.approx(-17.542)
        assert lon == pytest.approx(-65.835)

    def test_validate_bolivia_coords_out_of_bounds(self):
        with pytest.raises(ValueError, match="outside Bolivia bounds"):
            validate_bolivia_coords(10.0, -65.0)
        with pytest.raises(ValueError, match="outside Bolivia bounds"):
            validate_bolivia_coords(-17.0, -100.0)

    def test_validate_bolivia_coords_non_finite(self):
        with pytest.raises(ValueError, match="must be finite"):
            validate_bolivia_coords(float("nan"), -65.0)
        with pytest.raises(ValueError, match="must be finite"):
            validate_bolivia_coords(-17.0, float("inf"))

    def test_compute_sha256(self):
        digest1 = compute_sha256("test_payload")
        digest2 = compute_sha256(b"test_payload")
        assert digest1 == digest2
        assert len(digest1) == 64
        with pytest.raises(TypeError):
            compute_sha256(12345)


class TestNasaPowerClient:
    """NasaPowerClient protocol compliance, SSRF rejection, and parsing."""

    def test_implements_climate_data_provider_protocol(self):
        client = NasaPowerClient()
        assert isinstance(client, ClimateDataProvider)

    def test_parse_monthly_and_mm_day_conversion(self):
        client = NasaPowerClient()
        mock_params = {
            "T2M_MIN": {"JAN": 3.0, "FEB": -2.0},
            "T2M_MAX": {"JAN": 20.0, "FEB": 18.0},
            "PRECTOTCORR": {"JAN": 2.0, "FEB": 1.0},  # mm/day
            "GWETTOP": {"JAN": 0.5, "FEB": -999.0},  # fill value
            "RH2M": {"JAN": 80.0, "FEB": 75.0},
        }
        records = client._parse_monthly(mock_params)
        assert len(records) == 12
        jan = records[0]
        assert jan["month"] == 1
        assert jan["temp_min_c"] == 3.0
        assert jan["precip_mm"] == pytest.approx(2.0 * 31, 0.1)  # 62.0 mm
        assert jan["soil_moisture_index"] == 0.5
        assert jan["data_status"] == "nasa_power_live_climatology"

        feb = records[1]
        assert feb["month"] == 2
        assert feb["precip_mm"] == pytest.approx(1.0 * 28, 0.1)  # 28.0 mm
        assert feb["soil_moisture_index"] == 0.35  # fallback for -999 fill value
        assert feb["frost_risk_days"] > 0

    @patch("etl.nasa_power_client.requests.get")
    def test_fetch_monthly_climatology_network_error_fallback(self, mock_get):
        mock_get.side_effect = ConnectionError("Connection refused")
        fallback = {"monthly": [{"month": 1, "data_status": "fallback"}]}
        client = NasaPowerClient(fallback_data=fallback)
        res = client.fetch_monthly_climatology(-17.5, -65.5)
        assert res == fallback

    @patch("etl.nasa_power_client.requests.get")
    def test_fetch_monthly_climatology_network_error_raises_without_leak(self, mock_get):
        mock_get.side_effect = RuntimeError("secret_key=xyz internal failure")
        client = NasaPowerClient()
        with pytest.raises(RuntimeError) as exc_info:
            client.fetch_monthly_climatology(-17.5, -65.5)
        assert "secret_key" not in str(exc_info.value)


class TestZoneHarmonizer:
    """ZoneHarmonizer sync, compact serialization, and immutability."""

    def test_merge_zone_with_telemetry_immutability(self):
        harmonizer = ZoneHarmonizer()
        zone = {
            "zone_id": "punata_valle_alto",
            "monthly_harmonized_indicators": [
                {
                    "month": 1,
                    "month_name": "Enero",
                    "temp_min_c": 11.2,
                    "temp_max_c": 24.8,
                    "precip_mm": 98.5,
                    "soil_moisture_index": 0.58,
                    "ndvi_mean": 0.54,
                    "frost_risk_days": 0,
                    "bare_soil_flag": False,
                    "data_status": "phase0_seed_pending_etl",
                }
            ],
        }
        telemetry = {
            "zones": {
                "punata_valle_alto": {
                    "monthly": [
                        {
                            "month": 1,
                            "temp_min_c": 3.3,
                            "temp_max_c": 23.6,
                            "precip_mm": 109.1,
                            "soil_moisture_index": 0.55,
                            "frost_risk_days": 3,
                            "data_status": "nasa_power_live_climatology",
                        }
                    ]
                }
            }
        }
        merged = harmonizer.merge_zone_with_telemetry(zone, telemetry)
        # Original zone must NOT be mutated
        assert zone["monthly_harmonized_indicators"][0]["data_status"] == "phase0_seed_pending_etl"
        assert zone["monthly_harmonized_indicators"][0]["temp_min_c"] == 11.2

        # Merged copy has updated NASA metrics
        m_ind = merged["monthly_harmonized_indicators"][0]
        assert m_ind["data_status"] == "nasa_power_live_climatology"
        assert m_ind["temp_min_c"] == 3.3
        assert m_ind["precip_mm"] == 109.1
        # Preserves baseline MODIS/Sentinel indicators
        assert m_ind["ndvi_mean"] == 0.54
        assert m_ind["bare_soil_flag"] is False
        assert m_ind["month_name"] == "Enero"

    def test_sync_telemetry_line_count_and_compact_json(self, tmp_path):
        pilots_file = tmp_path / "pilots.json"
        telemetry_file = tmp_path / "telemetry.json"
        pilots_data = {
            "dataset_version": "1.0.0",
            "zones": [
                {"zone_id": "z1", "coordinates": {"lat": -17.5, "lon": -65.5}, "monthly_harmonized_indicators": []},
                {"zone_id": "z2", "coordinates": {"lat": -17.6, "lon": -65.6}, "monthly_harmonized_indicators": []},
            ],
        }
        pilots_file.write_text(json.dumps(pilots_data), encoding="utf-8")

        mock_provider = MagicMock(spec=ClimateDataProvider)
        mock_provider.fetch_monthly_climatology.return_value = {
            "monthly": [
                {"month": m, "temp_min_c": 5.0, "temp_max_c": 20.0, "precip_mm": 50.0,
                 "soil_moisture_index": 0.4, "rel_humidity_pct": 70.0, "frost_risk_days": 0,
                 "data_status": "nasa_power_live_climatology"}
                for m in range(1, 13)
            ]
        }
        harmonizer = ZoneHarmonizer(provider=mock_provider)
        res = harmonizer.sync_telemetry(pilots_file, telemetry_file)
        assert "integrity_sha256" in res
        assert telemetry_file.exists()

        content = telemetry_file.read_text(encoding="utf-8").strip().splitlines()
        # Strictly <= 120 lines
        assert len(content) <= 120
        # Valid JSON
        parsed = json.loads("\n".join(content))
        assert "zones" in parsed
        assert len(parsed["zones"]) == 2
