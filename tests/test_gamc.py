"""GAMC WMS catalog and proxy tests (no live municipal upstream)."""

import httpx
import pytest
from fastapi.testclient import TestClient

from backend.config import Settings
from backend.main import app, create_app

PERIURBANO_ID = "c52066a1-32fd-4925-81e0-c2dcb8f4238f"


@pytest.fixture
def client():
    return TestClient(app)


def _mock_app(handler) -> TestClient:
    transport = httpx.MockTransport(handler)
    http_client = httpx.Client(transport=transport)
    settings = Settings(GAMC_API_KEY="test_gamc_key")
    return TestClient(create_app(settings=settings, gamc_http_client=http_client))


def test_gamc_catalog_lists_periurbanos_without_key(client):
    res = client.get("/api/gamc/services")
    assert res.status_code == 200
    data = res.json()
    assert "Adapting Farms" in data["theme"]
    ids = {s["service_id"] for s in data["services"]}
    assert PERIURBANO_ID in ids
    peri = next(s for s in data["services"] if s["service_id"] == PERIURBANO_ID)
    assert peri["title"].startswith("Periurbanos")
    assert peri["default_on"] is True
    assert len(peri["legend_classes"]) == 3
    assert "37f574a3292eafd287024269399aafa51b7cf55932603e2f" not in res.text
    assert "GAMC_API_KEY" not in res.text
    assert "api_key" not in res.text.lower()


def test_gamc_wms_rejects_unknown_service_id(client):
    res = client.get(
        "/api/gamc/wms",
        params={
            "service_id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
            "REQUEST": "GetMap",
            "SERVICE": "WMS",
            "BBOX": "0,0,1,1",
            "WIDTH": "256",
            "HEIGHT": "256",
        },
    )
    assert res.status_code == 400
    assert "Unknown" in res.json()["detail"]


def test_gamc_wms_rejects_invalid_service_id(client):
    res = client.get("/api/gamc/wms", params={"service_id": "not-a-uuid", "REQUEST": "GetMap"})
    assert res.status_code == 400


def test_gamc_wms_rejects_disallowed_request(client):
    res = client.get(
        "/api/gamc/wms",
        params={"service_id": PERIURBANO_ID, "REQUEST": "GetFeature"},
    )
    assert res.status_code == 400
    assert "REQUEST" in res.json()["detail"]


def test_gamc_wms_getmap_injects_key_via_mock():
    captured = {}

    def handler(request: httpx.Request) -> httpx.Response:
        captured["url"] = str(request.url)
        assert request.url.host == "serviciosgamc.cochabamba.bo"
        assert "test_gamc_key" in str(request.url)
        assert PERIURBANO_ID in str(request.url)
        return httpx.Response(200, content=b"\x89PNG", headers={"content-type": "image/png"})

    local = _mock_app(handler)
    res = local.get(
        "/api/gamc/wms",
        params={
            "service_id": PERIURBANO_ID,
            "REQUEST": "GetMap",
            "SERVICE": "WMS",
            "VERSION": "1.1.1",
            "LAYERS": "",
            "FORMAT": "image/png",
            "TRANSPARENT": "true",
            "SRS": "EPSG:3857",
            "BBOX": "-7364284.32,-1966770.99,-7363284.32,-1965770.99",
            "WIDTH": "256",
            "HEIGHT": "256",
        },
    )
    assert res.status_code == 200
    assert res.content == b"\x89PNG"
    assert "image/png" in res.headers["content-type"]
    assert "test_gamc_key" not in res.text
    assert "key=" not in captured["url"].split("serviciosgamc")[0]


def test_gamc_wms_getfeatureinfo_json_via_mock():
    payload = {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "properties": {"categoria": "Periurbanos en crecimiento"},
                "geometry": None,
            }
        ],
    }

    def handler(request: httpx.Request) -> httpx.Response:
        assert "GetFeatureInfo" in str(request.url)
        assert "test_gamc_key" in str(request.url)
        return httpx.Response(200, json=payload)

    local = _mock_app(handler)
    res = local.get(
        "/api/gamc/wms",
        params={
            "service_id": PERIURBANO_ID,
            "REQUEST": "GetFeatureInfo",
            "SERVICE": "WMS",
            "VERSION": "1.1.1",
            "SRS": "EPSG:3857",
            "BBOX": "0,0,1,1",
            "WIDTH": "256",
            "HEIGHT": "256",
            "X": "10",
            "Y": "12",
            "INFO_FORMAT": "application/json",
            "FEATURE_COUNT": "5",
        },
    )
    assert res.status_code == 200
    assert res.json()["features"][0]["properties"]["categoria"] == "Periurbanos en crecimiento"


def test_gamc_wms_rejects_oversized_width():
    def handler(_request: httpx.Request) -> httpx.Response:
        raise AssertionError("upstream should not be called")

    local = _mock_app(handler)
    res = local.get(
        "/api/gamc/wms",
        params={
            "service_id": PERIURBANO_ID,
            "REQUEST": "GetMap",
            "WIDTH": "9999",
            "HEIGHT": "256",
        },
    )
    assert res.status_code == 400


DISTRITOS_ID = "7eb13092-bf0e-493b-aae6-03c43eedda2c"
DRENAJE_ID = "d4cea6e3-fc7f-482a-94ad-bd377df78886"


def test_gamc_catalog_lists_distritos_enabled_in_simple_mode(client):
    data = client.get("/api/gamc/services").json()
    dist = next(s for s in data["services"] if s["service_id"] == DISTRITOS_ID)
    assert dist["title"] == "Límite de Distritos"
    assert dist["default_on"] is True
    assert dist["simple_mode"] is True
    peri = next(s for s in data["services"] if s["service_id"] == PERIURBANO_ID)
    assert peri["simple_mode"] is False


def test_gamc_catalog_lists_drenaje_e_influencia(client):
    data = client.get("/api/gamc/services").json()
    ids = {s["service_id"] for s in data["services"]}
    assert DRENAJE_ID in ids
    drain = next(s for s in data["services"] if s["service_id"] == DRENAJE_ID)
    assert drain["id"] == "drenaje_e_influencia"
    assert drain["title"] == "Drenaje e Influencia"
    assert drain["default_on"] is True
    assert drain["simple_mode"] is False
    labels = {c["label"] for c in drain["legend_classes"]}
    assert "Princ. Tributarios" in labels
    assert "Quebradas" in labels


def test_gamc_wms_getmap_drenaje_via_mock():
    def handler(request: httpx.Request) -> httpx.Response:
        assert DRENAJE_ID in str(request.url)
        assert "GetMap" in str(request.url)
        return httpx.Response(200, content=b"\x89PNG", headers={"content-type": "image/png"})

    local = _mock_app(handler)
    res = local.get(
        "/api/gamc/wms",
        params={
            "service_id": DRENAJE_ID,
            "REQUEST": "GetMap",
            "SERVICE": "WMS",
            "VERSION": "1.1.1",
            "FORMAT": "image/png",
            "TRANSPARENT": "true",
            "SRS": "EPSG:3857",
            "BBOX": "-7385000,-1995000,-7355000,-1955000",
            "WIDTH": "256",
            "HEIGHT": "256",
        },
    )
    assert res.status_code == 200
    assert res.content.startswith(b"\x89PNG")


def test_gamc_wms_getfeatureinfo_drenaje_via_mock():
    body = (
        '{"type":"FeatureCollection","features":[{"type":"Feature",'
        '"properties":{"Tipo":"2","Clasificación":"Princ. Tributarios"}}]}'
    )

    def handler(request: httpx.Request) -> httpx.Response:
        assert DRENAJE_ID in str(request.url)
        return httpx.Response(200, content=body, headers={"content-type": "application/json"})

    local = _mock_app(handler)
    res = local.get(
        "/api/gamc/wms",
        params={
            "service_id": DRENAJE_ID,
            "REQUEST": "GetFeatureInfo",
            "SRS": "EPSG:4326",
            "BBOX": "-66.17,-17.39,-66.15,-17.37",
            "WIDTH": "101",
            "HEIGHT": "101",
            "X": "50",
            "Y": "50",
            "INFO_FORMAT": "application/json",
        },
    )
    assert res.status_code == 200
    props = res.json()["features"][0]["properties"]
    assert props["Clasificación"] == "Princ. Tributarios"


def test_gamc_districts_catalog_has_center_and_bounds(client):
    res = client.get("/api/gamc/districts")
    assert res.status_code == 200
    data = res.json()
    assert data["districts"], "districts catalog must not be empty"
    assert "GAMC_API_KEY" not in res.text
    assert "37f574a3292eafd287024269399aafa51b7cf55932603e2f" not in res.text
    for d in data["districts"]:
        assert d["name"] == f"Distrito {d['number']}"
        b = d["bounds"]
        assert b["south"] <= d["center"]["lat"] <= b["north"]
        assert b["west"] <= d["center"]["lon"] <= b["east"]


def test_gamc_wms_getfeatureinfo_distritos_via_mock():
    def handler(request: httpx.Request) -> httpx.Response:
        assert DISTRITOS_ID in str(request.url)
        body = '{"type":"FeatureCollection","features":[{"type":"Feature","properties":{"Distrito":"D9","Comuna":"ITOCTA"}}]}'
        return httpx.Response(200, content=body, headers={"content-type": "application/json"})

    local = _mock_app(handler)
    res = local.get(
        "/api/gamc/wms",
        params={
            "service_id": DISTRITOS_ID,
            "REQUEST": "GetFeatureInfo",
            "SRS": "EPSG:4326",
            "BBOX": "-66.1705,-17.4505,-66.1695,-17.4495",
            "WIDTH": "101",
            "HEIGHT": "101",
            "X": "50",
            "Y": "50",
            "INFO_FORMAT": "application/json",
        },
    )
    assert res.status_code == 200
    assert res.json()["features"][0]["properties"]["Distrito"] == "D9"


def test_district_catalog_matches_municipal_layer():
    from fastapi.testclient import TestClient
    from backend.main import app

    client = TestClient(app)
    response = client.get("/api/gamc/districts")
    assert response.status_code == 200
    districts = response.json()["districts"]
    assert len(districts) == 15
    assert len({d["code"] for d in districts}) == len(districts)
    assert len({d["color"] for d in districts}) == len(districts)
    for district in districts:
        bounds, center = district["bounds"], district["center"]
        assert bounds["south"] <= center["lat"] <= bounds["north"]
        assert bounds["west"] <= center["lon"] <= bounds["east"]
    services = client.get("/api/gamc/services").json()["services"]
    assert any(s["id"] == "limite_distritos" and s["simple_mode"] for s in services)
