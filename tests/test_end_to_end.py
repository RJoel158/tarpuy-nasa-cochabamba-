"""End-to-end integration and OWASP security test suite for Tarpuy NASA backend API."""

import hashlib
import json
import pytest
from fastapi.testclient import TestClient

from backend.main import app
from backend.poster import render_zone_poster_html


@pytest.fixture
def client():
    """Test client instance for FastAPI application."""
    return TestClient(app)


def test_health_check(client):
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["zones_loaded"] == 3
    assert data["version"] == "1.0.0"
    assert "NASA POWER" in data["telemetry_source"]


def test_crops_catalog(client):
    res = client.get("/api/crops")
    assert res.status_code == 200
    crops = res.json()
    assert len(crops) == 8
    crop_ids = {c["crop_id"] for c in crops}
    assert "papa_huaycha" in crop_ids and "maiz_valle" in crop_ids


def test_zones_and_nasa_power_harmonization(client):
    res = client.get("/api/zones")
    assert res.status_code == 200
    zones = res.json()
    assert len(zones) == 3
    for z in zones:
        assert z["data_status"] == "nasa_power_live_climatology"
        assert z["monthly_harmonized_indicators"][0]["data_status"] == "nasa_power_live_climatology"

    res_single = client.get("/api/zones/punata_valle_alto")
    assert res_single.status_code == 200
    assert res_single.json()["zone_id"] == "punata_valle_alto"


def test_recommendation_strategies_and_provenance(client):
    payload = {
        "zone_id": "punata_valle_alto",
        "current_crop_id": "maiz_valle",
        "farmer_priorities": ["water_conservation", "nitrogen_fixation"],
        "constraints": {
            "irrigation_access": "deficit_auxiliary",
            "equipment_level": "manual_yunta",
            "language_preference": "bilingual",
        },
    }
    res = client.post("/api/recommend", json=payload)
    assert res.status_code == 200
    data = res.json()
    strategies = data["strategies"]
    assert len(strategies) >= 3
    assert strategies[0]["strategy_type"] == "current_baseline"
    for s in strategies[1:]:
        assert s["strategy_type"] in ("adaptive_alternative", "current_baseline")
    assert "data_provenance" in data
    assert len(data["data_provenance"]["nasa_datasets"]) >= 4


def test_offline_bundle_canonical_sha256(client):
    res = client.get("/api/offline-bundle/tapacari_zona_andina")
    assert res.status_code == 200
    bundle = res.json()
    assert "integrity_sha256" in bundle
    expected_hash = bundle["integrity_sha256"]
    bundle_no_hash = {k: v for k, v in bundle.items() if k != "integrity_sha256"}
    canonical = json.dumps(bundle_no_hash, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    actual_hash = hashlib.sha256(canonical.encode("utf-8")).hexdigest()
    assert actual_hash == expected_hash


def test_poster_html_and_security_headers(client):
    res = client.get("/api/poster/mizque_cono_sur")
    assert res.status_code == 200
    assert "text/html" in res.headers["content-type"]
    assert "Cartilla Agr" in res.text
    assert res.headers["x-frame-options"] == "DENY"
    assert res.headers["x-content-type-options"] == "nosniff"
    assert "default-src 'self'" in res.headers["content-security-policy"]


def test_owasp_rejection_cases(client):
    assert client.get("/api/zones/..%2Fetc").status_code in (400, 404)
    assert client.get("/api/zones/bad$id").status_code in (400, 404)

    bad_req = {
        "zone_id": "punata_valle_alto",
        "current_crop_id": "maiz_valle",
        "farmer_priorities": ["water_conservation"],
        "constraints": {
            "irrigation_access": "deficit_auxiliary",
            "equipment_level": "manual_yunta",
            "language_preference": "es",
        },
        "malicious_extra": "drop table students",
    }
    assert client.post("/api/recommend", json=bad_req).status_code == 422

    oversized_data = b"x" * 35000
    res_large = client.post("/api/recommend", content=oversized_data, headers={"content-type": "application/json"})
    assert res_large.status_code == 413

    xss_payload = "<script>alert(1)</script>"
    rendered = render_zone_poster_html(xss_payload)
    assert xss_payload not in rendered
    assert "&lt;script&gt;alert(1)&lt;/script&gt;" in rendered
