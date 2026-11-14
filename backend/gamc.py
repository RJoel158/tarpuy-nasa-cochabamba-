"""GAMC municipal WMS catalog and read-only proxy (key never leaves the server)."""

from __future__ import annotations

import json
import re
from typing import Any
from urllib.parse import urlparse

import httpx
from fastapi import HTTPException

from backend.config import Settings
from backend.security import resolve_safe_data_path

ALLOWED_WMS_REQUESTS = frozenset(
    {"GetMap", "GetLegendGraphic", "GetFeatureInfo", "GetCapabilities"}
)
ALLOWED_WMS_PARAMS = frozenset(
    {
        "SERVICE",
        "VERSION",
        "REQUEST",
        "LAYERS",
        "LAYER",
        "STYLES",
        "FORMAT",
        "TRANSPARENT",
        "SRS",
        "CRS",
        "BBOX",
        "WIDTH",
        "HEIGHT",
        "X",
        "Y",
        "I",
        "J",
        "INFO_FORMAT",
        "FEATURE_COUNT",
        "QUERY_LAYERS",
        "EXCEPTIONS",
        "TIME",
        "BGCOLOR",
        "SLD",
    }
)
SERVICE_UUID_RE = re.compile(
    r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    re.IGNORECASE,
)
PUBLIC_SERVICE_FIELDS = (
    "id",
    "service_id",
    "title",
    "short_title",
    "description",
    "layers",
    "enabled_by_default",
    "simple_mode",
    "bounds",
    "legend_classes",
)
MAX_MAP_PIXELS = 2048


def _public_service(raw: dict[str, Any], theme: str) -> dict[str, Any]:
    item = {k: raw.get(k) for k in PUBLIC_SERVICE_FIELDS if k in raw}
    item["theme"] = theme
    item["default_on"] = bool(raw.get("enabled_by_default"))
    item["simple_mode"] = bool(raw.get("simple_mode"))
    return item


class GamcWmsProxy:
    """Loads the classified-services catalog and proxies allow-listed WMS calls."""

    def __init__(
        self,
        settings: Settings,
        http_client: httpx.Client | None = None,
    ):
        self.settings = settings
        catalog_path = resolve_safe_data_path(
            settings.BASE_DIR, "data", "gamc", "adapting_farms_services.json"
        )
        raw = json.loads(catalog_path.read_text(encoding="utf-8")) if catalog_path.exists() else {}
        self.theme = str(raw.get("theme") or "")
        self._services: list[dict[str, Any]] = list(raw.get("services") or [])
        self._by_service_id = {
            str(s.get("service_id", "")).lower(): s for s in self._services if s.get("service_id")
        }
        districts_path = resolve_safe_data_path(
            settings.BASE_DIR, "data", "gamc", "districts.json"
        )
        districts_raw = (
            json.loads(districts_path.read_text(encoding="utf-8")) if districts_path.exists() else {}
        )
        self._districts_source = str(districts_raw.get("source") or "")
        self._districts: list[dict[str, Any]] = list(districts_raw.get("districts") or [])
        self._client = http_client or httpx.Client(timeout=15.0, follow_redirects=False)

    def list_districts(self) -> dict[str, Any]:
        """Municipal districts (code, comuna, center, bounds) sampled from the WMS."""
        return {"source": self._districts_source, "districts": self._districts}

    def list_services(self) -> dict[str, Any]:
        return {
            "theme": self.theme,
            "source": "Alcaldía de Cochabamba — proxy WMS GAMC",
            "services": [_public_service(s, self.theme) for s in self._services],
        }

    def resolve_catalog_entry(self, service_id: str) -> dict[str, Any]:
        if not isinstance(service_id, str) or not SERVICE_UUID_RE.match(service_id.strip()):
            raise HTTPException(status_code=400, detail="Invalid service_id")
        entry = self._by_service_id.get(service_id.strip().lower())
        if not entry:
            raise HTTPException(status_code=400, detail="Unknown GAMC service_id")
        return entry

    def build_upstream_params(self, query: dict[str, str]) -> dict[str, str]:
        service_id = (query.get("service_id") or "").strip()
        self.resolve_catalog_entry(service_id)

        request_name = (query.get("REQUEST") or query.get("request") or "").strip()
        if request_name not in ALLOWED_WMS_REQUESTS:
            raise HTTPException(
                status_code=400,
                detail="REQUEST must be GetMap, GetLegendGraphic, GetFeatureInfo, or GetCapabilities",
            )
        if not self.settings.GAMC_API_KEY:
            raise HTTPException(status_code=503, detail="GAMC WMS proxy is not configured")

        canonical: dict[str, str] = {}
        for key, value in query.items():
            upper = key.upper()
            if upper in {"KEY", "SERVICE_ID"}:
                continue
            if upper not in ALLOWED_WMS_PARAMS:
                continue
            canonical[upper] = value
        canonical["REQUEST"] = request_name
        canonical.setdefault("SERVICE", "WMS")

        width = canonical.get("WIDTH")
        height = canonical.get("HEIGHT")
        for dim_key, dim_val in (("WIDTH", width), ("HEIGHT", height)):
            if dim_val is None:
                continue
            try:
                pixels = int(dim_val)
            except ValueError as exc:
                raise HTTPException(status_code=400, detail=f"Invalid {dim_key}") from exc
            if pixels < 1 or pixels > MAX_MAP_PIXELS:
                raise HTTPException(status_code=400, detail=f"{dim_key} out of range")

        canonical["key"] = self.settings.GAMC_API_KEY
        canonical["service_id"] = service_id
        return canonical

    def proxy(self, query: dict[str, str]) -> tuple[bytes, str, int]:
        params = self.build_upstream_params(query)
        base = self.settings.GAMC_WMS_BASE_URL.strip()
        host = urlparse(base).hostname or ""
        if not host.endswith("cochabamba.bo"):
            raise HTTPException(status_code=500, detail="GAMC WMS proxy is misconfigured")
        try:
            response = self._client.get(base, params=params)
        except httpx.HTTPError:
            raise HTTPException(status_code=502, detail="GAMC WMS upstream unavailable") from None

        content_type = response.headers.get("content-type") or "application/octet-stream"
        status = response.status_code if response.status_code in {200, 204} else 502
        if status == 502:
            raise HTTPException(status_code=502, detail="GAMC WMS upstream unavailable")
        return response.content, content_type.split(";")[0].strip(), status
