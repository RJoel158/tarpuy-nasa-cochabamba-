"""FastAPI application entrypoint for Tarpuy NASA Cochabamba (OWASP Top 10 & SOLID)."""

from typing import Any
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, JSONResponse, Response

from backend.config import Settings
from backend.poster import render_zone_poster_html
from backend.repositories import HarmonizedJsonZoneRepository, SafeJsonCropRepository
from backend.schemas import HealthResponse, QuechuaTtsRequest, RecommendationRequest
from backend.security import RequestGuardMiddleware, SecurityHeadersMiddleware, validate_safe_id
from engine.alerts import AgroclimaticAlertEvaluator
from engine.recommender import RotationRecommendationService
from engine.scoring import MultiCriteriaRotationScorer
from etl.natural_spanish_tts import synthesize_spanish_mp3
from etl.quechua_tts_client import QuechuaTtsClient, SpanishTtsClient


def create_app(settings: Settings | None = None) -> FastAPI:
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

    app.state.settings = cfg
    app.state.zone_repo = zone_repo
    app.state.crop_repo = crop_repo
    app.state.alert_evaluator = alert_evaluator
    app.state.service = service

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
    def get_zone_alerts(zone_id: str) -> dict[str, Any]:
        valid_id = validate_safe_id(zone_id, "zone_id")
        zone = zone_repo.get_zone(valid_id)
        if not zone:
            raise HTTPException(status_code=404, detail=f"Zone '{valid_id}' not found")
        return alert_evaluator.evaluate_zone(valid_id, zone)

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
            return service.recommend(
                zone_id=req.zone_id,
                current_crop_id=req.current_crop_id,
                farmer_priorities=req.farmer_priorities,
                constraints=req.constraints.model_dump(),
            )
        except ValueError as err:
            raise HTTPException(status_code=404, detail=str(err))

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
