from etl.weatherapi_client import WeatherApiClient
from datetime import datetime, timezone
from time import monotonic
from threading import Lock
from etl.realtime_weather_client import RealtimeWeatherClient
from etl.security import validate_bolivia_coords
"""FastAPI application entrypoint for Tarpuy NASA Cochabamba (OWASP Top 10 & SOLID)."""

from typing import Any

import httpx
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, Response

from backend.config import Settings
from backend.gamc import GamcWmsProxy
from backend.poster import render_zone_poster_html
from backend.repositories import HarmonizedJsonZoneRepository, SafeJsonCropRepository
from backend.schemas import HealthResponse, QuechuaTtsRequest, RecommendationRequest
from backend.security import RequestGuardMiddleware, SecurityHeadersMiddleware, validate_safe_id
from engine.alerts import AgroclimaticAlertEvaluator
from engine.recommender import RotationRecommendationService
from engine.scoring import MultiCriteriaRotationScorer
from etl.natural_spanish_tts import synthesize_spanish_mp3
from etl.quechua_tts_client import QuechuaTtsClient, SpanishTtsClient


def create_app(
    settings: Settings | None = None,
    gamc_http_client: httpx.Client | None = None,
) -> FastAPI:
    """Create and configure FastAPI application instance with security middlewares."""
    cfg = settings or Settings()
    app = FastAPI(
        title=cfg.APP_TITLE,
        debug=cfg.DEBUG,
        docs_url="/docs",
        redoc_url=None,
    )

    zone_repo = HarmonizedJsonZoneRepository(base_dir=cfg.BASE_DIR)
    crop_repo = SafeJsonCropRepository(base_dir=cfg.BASE_DIR)
    scorer = MultiCriteriaRotationScorer()
    alert_path = cfg.BASE_DIR / "data" / "zones" / "realtime_weather_telemetry.json"
    alert_evaluator = AgroclimaticAlertEvaluator(telemetry_path=alert_path)
    service = RotationRecommendationService(
        zone_repo=zone_repo, crop_repo=crop_repo, scorer=scorer, alert_evaluator=alert_evaluator
    )
    weather_cache = {}
    weather_lock = Lock()
    weather_client = RealtimeWeatherClient(timeout=10)
    gamc_proxy = GamcWmsProxy(settings=cfg, http_client=gamc_http_client)

    app.state.settings = cfg
    app.state.zone_repo = zone_repo
    app.state.crop_repo = crop_repo
    app.state.alert_evaluator = alert_evaluator
    app.state.service = service
    app.state.gamc_proxy = gamc_proxy

    app.add_middleware(
        RequestGuardMiddleware,
        max_body_bytes=cfg.MAX_BODY_BYTES,
        rate_limit_per_minute=cfg.RATE_LIMIT_PER_MINUTE,
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=list(cfg.ALLOWED_ORIGINS),
        allow_credentials=True,
        allow_methods=["GET", "POST", "OPTIONS"],
        allow_headers=["*"],
    )
    app.add_middleware(SecurityHeadersMiddleware)

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        if isinstance(exc, HTTPException):
            return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
        if isinstance(exc, RequestValidationError):
            return JSONResponse(status_code=422, content={"detail": exc.errors()})
        return JSONResponse(status_code=500, content={"detail": "Internal server error"})

    @app.get("/api/health", response_model=HealthResponse)
    def health() -> HealthResponse:
        zones = zone_repo.list_zones()
        return HealthResponse(
            status="healthy",
            version="1.0.0",
            zones_loaded=len(zones),
            telemetry_source="NASA POWER Climatology API (AG)",
        )

    @app.get("/api/crops")
    def list_crops() -> list[dict[str, Any]]:
        return crop_repo.list_crops()

    @app.get("/api/crop-categories")
    def list_crop_categories() -> list[dict[str, Any]]:
        return crop_repo.list_categories()

    @app.get("/api/zones")
    def list_zones() -> list[dict[str, Any]]:
        zones = zone_repo.list_zones()
        return [
            {
                "zone_id": z.get("zone_id"),
                "name": z.get("name"),
                "quechua_name": z.get("quechua_name"),
                "subregion": z.get("subregion"),
                "municipality": z.get("municipality"),
                "coordinates": z.get("coordinates"),
                "elevation_msnm": z.get("elevation_msnm"),
                "slope_category": z.get("slope_category"),
                "data_status": z.get("monthly_harmonized_indicators", [{}])[0].get("data_status", "unknown"),
                "monthly_harmonized_indicators": z.get("monthly_harmonized_indicators", []),
            }
            for z in zones
        ]

    @app.get("/api/zones/{zone_id}")
    def get_zone(zone_id: str) -> dict[str, Any]:
        valid_id = validate_safe_id(zone_id, "zone_id")
        zone = zone_repo.get_zone(valid_id)
        if not zone:
            raise HTTPException(status_code=404, detail=f"Zone '{valid_id}' not found")
        return zone

    @app.get("/api/alerts/{zone_id}")
    def get_zone_alerts(
        zone_id: str,
        district_code: str | None = None,
        comuna: str | None = None,
        drainage: str | None = None,
        lat: float | None = None,
        lon: float | None = None,
        refresh: bool = False,
    ) -> dict[str, Any]:
        valid_id = validate_safe_id(zone_id, "zone_id")
        zone = zone_repo.get_zone(valid_id)
        if not zone:
            raise HTTPException(status_code=404, detail=f"Zone '{valid_id}' not found")
        override = None
        if (lat is None) != (lon is None):
            raise HTTPException(status_code=422, detail="lat and lon must be supplied together")
        selected_point = lat is not None
        if refresh and not selected_point:
            coordinates = zone.get("coordinates", {})
            lat, lon = coordinates.get("lat"), coordinates.get("lon")
        if lat is not None:
            try:
                point = validate_bolivia_coords(lat, lon)
            except ValueError as exc:
                raise HTTPException(status_code=422, detail=str(exc))
            key = (valid_id, selected_point, round(point[0], 4), round(point[1], 4))
            try:
                with weather_lock:
                    cached = weather_cache.get(key)
                    if cached and monotonic() - cached[0] < 300:
                        override = cached[1]
                    else:
                        weather = weather_client.fetch_zone_realtime(key[2], key[3], include_nasa=False)
                        weather["weather_provider"] = "Open-Meteo"
                        weather["primary_provider_status"] = "not_configured"
                        if cfg.WEATHERAPI_KEY:
                            try:
                                weather = WeatherApiClient(cfg.WEATHERAPI_KEY).enrich(weather, key[2], key[3])
                                weather["primary_provider_status"] = "active"
                            except (RuntimeError, ValueError, KeyError, TypeError):
                                weather["primary_provider_status"] = "unavailable_using_open_meteo"
                        # NASA series retain their zonal location and date; never relabel as parcel observations.
                        stored = alert_evaluator._load_telemetry().get("zones", {}).get(valid_id, {})
                        weather["nasa_recent_daily"] = stored.get("nasa_recent_daily", [])
                        weather.setdefault("data_status", "open_meteo_point_with_zonal_nasa_history")
                        override = {"fetched_at_utc": datetime.now(timezone.utc).isoformat(),
                            "weather_scope": "selected_point_model" if selected_point else "zone_reference_model", "zones": {valid_id: weather}}
                        if len(weather_cache) >= 64:
                            weather_cache.pop(next(iter(weather_cache)))
                        weather_cache[key] = (monotonic(), override)
            except Exception:
                if cached:
                    override = {**cached[1], "weather_refresh_error": True}
                else:
                    override = {**alert_evaluator._load_telemetry(), "weather_refresh_error": True}
        return alert_evaluator.evaluate_zone(
            valid_id,
            zone,
            district_code=district_code,
            comuna=comuna,
            drainage_type=drainage,
            telemetry_override=override,
        )

    @app.post("/api/tts/quechua")
    def synthesize_quechua_audio(req: QuechuaTtsRequest) -> Response:
        try:
            wav_bytes = QuechuaTtsClient().synthesize_wav_bytes(req.text)
            return Response(content=wav_bytes, media_type="audio/wav")
        except Exception:
            raise HTTPException(status_code=503, detail="Native Quechua TTS service unavailable")

    @app.post("/api/tts/spanish-natural")
    def synthesize_natural_spanish(req: QuechuaTtsRequest) -> Response:
        try:
            audio = synthesize_spanish_mp3(req.text)
            return Response(content=audio, media_type="audio/mpeg")
        except Exception:
            raise HTTPException(status_code=503, detail="Natural Spanish voice unavailable")

    @app.post("/api/tts/spanish")
    def synthesize_spanish_audio(req: QuechuaTtsRequest) -> Response:
        try:
            wav_bytes = SpanishTtsClient().synthesize_wav_bytes(req.text)
            return Response(content=wav_bytes, media_type="audio/wav")
        except Exception:
            raise HTTPException(status_code=503, detail="Native Spanish TTS service unavailable")

    @app.post("/api/recommend")
    def recommend(req: RecommendationRequest) -> dict[str, Any]:
        try:
            muni = req.municipal_context.model_dump() if req.municipal_context else None
            return service.recommend(
                zone_id=req.zone_id,
                current_crop_id=req.current_crop_id,
                farmer_priorities=req.farmer_priorities,
                constraints=req.constraints.model_dump(),
                municipal_context=muni,
            )
        except ValueError as err:
            raise HTTPException(status_code=404, detail=str(err))

    @app.get("/api/gamc/services")
    def gamc_services() -> dict[str, Any]:
        return gamc_proxy.list_services()

    @app.get("/api/gamc/districts")
    def gamc_districts() -> dict[str, Any]:
        return gamc_proxy.list_districts()

    @app.get("/api/gamc/wms")
    def gamc_wms(request: Request) -> Response:
        query = dict(request.query_params)
        body, media_type, status = gamc_proxy.proxy(query)
        return Response(content=body, media_type=media_type, status_code=status)

    @app.get("/api/offline-bundle/{zone_id}")
    def offline_bundle(zone_id: str) -> dict[str, Any]:
        valid_id = validate_safe_id(zone_id, "zone_id")
        try:
            return service.build_offline_bundle(valid_id)
        except ValueError as err:
            raise HTTPException(status_code=404, detail=str(err))

    @app.get("/api/poster/{zone_id}", response_class=HTMLResponse)
    def poster(zone_id: str) -> HTMLResponse:
        valid_id = validate_safe_id(zone_id, "zone_id")
        zone = zone_repo.get_zone(valid_id)
        if not zone:
            raise HTTPException(status_code=404, detail=f"Zone '{valid_id}' not found")
        default_crop = "papa_huaycha" if valid_id == "tapacari_zona_andina" else "maiz_valle"
        rec = service.recommend(
            zone_id=valid_id,
            current_crop_id=default_crop,
            farmer_priorities=["water_conservation", "nitrogen_fixation", "erosion_control"],
            constraints={
                "irrigation_access": "deficit_auxiliary",
                "equipment_level": "manual_yunta",
                "language_preference": "bilingual",
            },
        )
        return HTMLResponse(content=render_zone_poster_html(zone, rec), status_code=200)

    return app


app = create_app()
