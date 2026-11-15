"""Real-time agroclimatic alerts, 7-day predictions, and data veracity evaluator."""

from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Any

DAY_NAMES_ES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
SEV_ORDER = {"critical": 0, "warning": 1, "info": 2}


def _day_label(iso_date: str) -> str:
    try:
        dt = datetime.strptime(iso_date, "%Y-%m-%d")
        return f"{DAY_NAMES_ES[dt.weekday()]} {dt.day:02d}/{dt.month:02d}"
    except Exception:
        return iso_date


def _build_veracity_manifest(fetched_at: str | None, has_nasa_daily: bool) -> list[dict[str, str]]:
    return [
        {
            "layer": "live_forecast",
            "status_badge": "EN VIVO · 7 Y 14 DÍAS",
            "title_es": "Clima Actual y Proyección a 7 y 14 Días",
            "source": "Open-Meteo (modelos meteorológicos globales calibrados por altura)",
            "updated": fetched_at or "No sincronizado",
            "honest_note": "Muestra lluvia, temperatura y balance hídrico proyectados a 7 y 14 días para apoyar turnos de riego y prevención de anegamiento.",
        },
        {
            "layer": "nasa_recent_daily",
            "status_badge": "SATÉLITE NASA RECIENTE" if has_nasa_daily else "PENDIENTE DE SATÉLITE",
            "title_es": "Observación Diaria NASA POWER (últimos días disponibles)",
            "source": "NASA POWER Daily API (radiación solar y humedad superficial satelital)",
            "updated": fetched_at or "Retraso satelital normal de 2 a 4 días",
            "honest_note": "Son mediciones reales ya ocurridas desde satélite (rejilla ~50 km); no incluye días futuros ni valores faltantes (-999).",
        },
        {
            "layer": "nasa_climatology_30yr",
            "status_badge": "HISTORIA NASA · 30 AÑOS",
            "title_es": "Calendario de Lluvias y Frío de Cada Mes",
            "source": "NASA POWER Climatology API (promedios históricos multianuales)",
            "updated": "Base histórica fija",
            "honest_note": "Sirve para planificar rotaciones de todo el año, pero no predice tormentas o heladas de esta semana.",
        },
        {
            "layer": "regional_soil_ndvi_baseline",
            "status_badge": "ESTUDIO REGIONAL DE SUELO",
            "title_es": "Suelo Regional y Cobertura Verde (NDVI / Pairumani)",
            "source": "ISRIC SoilGrids 250m, FAO GAEZ v4, Centro Pairumani y referencia MODIS/Sentinel",
            "updated": "Referencia estacional regional",
            "honest_note": "Refleja el suelo típico del municipio. Tu parcela puede cambiar según riego, estiércol y pendiente; revisa un puñado de tierra antes de sembrar.",
        },
    ]


def _build_municipal_alert(
    zone_id: str,
    district_code: str | None = None,
    comuna: str | None = None,
    drainage_type: str | None = None,
    soil_pct: float = 30.0,
    rain_7d: float = 0.0,
    rain_14d: float = 0.0,
    net_14d: float = 0.0,
) -> dict[str, Any]:
    """Generates actionable alerts for irrigation committees and GAMC network managers."""
    dist_label = f"Distrito {district_code.replace('D', '')}" if district_code else "Valles de Cochabamba"
    comuna_label = f" (Comuna {comuna})" if comuna else ""
    is_flood_zone = bool(drainage_type) or (district_code in ("D9", "D13"))

    if (rain_7d >= 15.0 or (soil_pct >= 50.0 and rain_7d >= 8.0) or net_14d >= 5.0) and is_flood_zone:
        sev = "critical" if (rain_7d >= 25.0 or soil_pct >= 65.0) else "warning"
        title = f"Riesgo de saturación y anegamiento en red de canales — {dist_label}{comuna_label}"
        body = (
            f"Lluvia prevista de {rain_7d} mm (7d) / {rain_14d} mm (14d) con humedad del suelo al {soil_pct:.0f}% "
            f"cerca de la red de drenaje ({drainage_type or 'canales de riego'}). Riesgo inminente de desborde y daño radicular."
        )
        actions = [
            "Regular y cerrar compuertas en la toma principal de la red de canales",
            "Priorizar drenaje y limpieza de tomas en Quebradas y Principales Tributarios",
            "Alertar a productores periurbanos consolidados para proteger almácigos y surcos bajos",
        ]
        share_text = (
            f"🚨 AVISO A REGANTES Y GAMC — {dist_label}{comuna_label}\n"
            f"Alerta: Riesgo de anegamiento en canales de riego.\n"
            f"Lluvia proyectada: {rain_7d} mm en 7 días (humedad {soil_pct:.0f}%).\n"
            f"Acción: Cerrar compuertas de canal y desobstruir tomas para evitar pudrición de raíz."
        )
        theme = "anegamiento_canales"
    elif net_14d <= -20.0 or soil_pct < 24.0:
        sev = "critical" if (net_14d <= -30.0 or soil_pct < 18.0) else "warning"
        title = f"Aviso de déficit hídrico prolongado (14 días) — {dist_label}{comuna_label}"
        body = (
            f"Balance hídrico neto proyectado de {net_14d:+.1f} mm en los próximos 14 días. "
            f"La evapotranspiración superará ampliamente las precipitaciones en la cuenca comunal."
        )
        actions = [
            "Revisar y reprogramar turnos de entrega de agua entre los comités de regantes",
            "Priorizar parcelas con cultivos en floración y emergencia de brotes",
            "Recomendar aplicación de cobertura vegetal (mulch/chala) para reducir evaporación",
        ]
        share_text = (
            f"⚠️ AVISO A REGANTES — {dist_label}{comuna_label}\n"
            f"Alerta: Déficit hídrico prolongado (14 días).\n"
            f"Balance proyectado: {net_14d:+.1f} mm (humedad {soil_pct:.0f}%).\n"
            f"Acción: Programar turnos de agua comunales con anticipación y evitar riego a mediodía."
        )
        theme = "desabastecimiento"
    else:
        sev = "info"
        title = f"Red de canales en operación regular — {dist_label}{comuna_label}"
        body = f"Condiciones hídricas equilibradas (lluvia 14d: {rain_14d} mm, humedad: {soil_pct:.0f}%). Sin riesgo de anegamiento ni sequía extrema."
        actions = [
            "Mantener el rol de turnos de riego habitual en la comunidad",
            "Monitorear niveles en tomas secundarias de la asociación",
        ]
        share_text = f"ℹ️ SITUACIÓN DE RIEGO — {dist_label}: Operación de canales normal esta quincena. Humedad: {soil_pct:.0f}%."
        theme = "operacion_normal"

    return {
        "audience": "regantes_gamc",
        "district_code": district_code or "cochabamba",
        "comuna": comuna or "Valles",
        "severity": sev,
        "theme": theme,
        "title_es": title,
        "body_es": body,
        "actions_es": actions,
        "share_text": share_text,
    }


class AgroclimaticAlertEvaluator:
    """Computes live weather alerts, 7-day water balance predictions, and veracity notes."""

    def __init__(self, telemetry_path: Path | str | None = None):
        root = Path(__file__).resolve().parents[1]
        self.telemetry_path = Path(telemetry_path) if telemetry_path else root / "data" / "zones" / "realtime_weather_telemetry.json"

    def _load_telemetry(self) -> dict[str, Any]:
        if not self.telemetry_path.exists():
            return {}
        try:
            return json.loads(self.telemetry_path.read_text(encoding="utf-8"))
        except Exception:
            return {}

    def evaluate_zone(
        self,
        zone_id: str,
        zone: dict[str, Any] | None = None,
        district_code: str | None = None,
        comuna: str | None = None,
        drainage_type: str | None = None,
    ) -> dict[str, Any]:
        """Return current conditions, 7/14-day forecasts, actionable alerts, municipal alert, and veracity notes."""
        raw = self._load_telemetry()
        fetched_at = raw.get("fetched_at_utc")
        z_rt = raw.get("zones", {}).get(zone_id, {})
        current = z_rt.get("current", {})
        daily_raw = z_rt.get("daily_forecast", [])
        nasa_daily = z_rt.get("nasa_recent_daily", [])

        forecast = []
        for d in daily_raw:
            bal = round(float(d.get("precip_mm", 0.0)) - float(d.get("et0_mm", 0.0)), 1)
            tmin = float(d.get("temp_min_c", 10.0))
            pr, prob, wind = float(d.get("precip_mm", 0.0)), int(d.get("precip_prob_pct", 0)), float(d.get("wind_kmh", 0.0))
            status = "frost_risk" if tmin <= 2.0 else ("chill_caution" if tmin <= 5.0 else ("rain_window" if pr >= 4.0 or prob >= 60 else ("dry_wind" if wind >= 18.0 else "stable")))
            forecast.append({**d, "day_label": _day_label(d.get("date", "")), "water_balance_mm": bal, "day_status": status})

        forecast_7d = forecast[:7]
        forecast_14d = forecast[:14]

        tot_rain = round(sum(d.get("precip_mm", 0.0) for d in forecast_7d), 1)
        tot_et0 = round(sum(d.get("et0_mm", 0.0) for d in forecast_7d), 1)
        net_water = round(tot_rain - tot_et0, 1)
        min_t = min((d["temp_min_c"] for d in forecast_7d), default=None)
        max_t = max((d["temp_max_c"] for d in forecast_7d), default=None)
        max_w = max((d["wind_kmh"] for d in forecast_7d), default=0.0)
        soil_pct = float(current.get("soil_moisture_top_pct", 0.0))

        tot_rain_14d = round(sum(d.get("precip_mm", 0.0) for d in forecast_14d), 1)
        tot_et0_14d = round(sum(d.get("et0_mm", 0.0) for d in forecast_14d), 1)
        net_water_14d = round(tot_rain_14d - tot_et0_14d, 1)
        min_t_14d = min((d["temp_min_c"] for d in forecast_14d), default=min_t)
        max_t_14d = max((d["temp_max_c"] for d in forecast_14d), default=max_t)
        max_w_14d = max((d["wind_kmh"] for d in forecast_14d), default=max_w)

        alerts: list[dict[str, str]] = []
        if min_t is not None:
            coldest = min(forecast, key=lambda x: x["temp_min_c"])
            if min_t <= 1.0:
                alerts.append({
                    "id": "frost_critical", "severity": "critical", "category": "Helada",
                    "title_es": f"¡Alerta de Helada! ({min_t}°C el {coldest['day_label']})",
                    "title_qu": f"¡Qasa Chayamunqa! ({min_t}°C)",
                    "message_es": f"La madrugada del {coldest['day_label']} bajará a {min_t}°C. Puede quemar brotes de papa o maíz tierno.",
                    "action_es": "Tapa plantas chicas con paja o rastrojo seco y evita deshierbar dejando la tierra en descanso sin cobertura.",
                })
            elif min_t <= 5.0:
                alerts.append({
                    "id": "frost_watch", "severity": "warning", "category": "Frío Nocturno",
                    "title_es": f"Cuidado: Noche Fría ({min_t}°C el {coldest['day_label']})",
                    "title_qu": f"Chiri Tuta ({min_t}°C)",
                    "message_es": f"El frío bajará a {min_t}°C cerca del suelo. No es helada fuerte, pero frena el crecimiento.",
                    "action_es": "Vigila hondonadas donde se junta aire frío antes de plantar cultivos sensibles.",
                })
            else:
                max_min_t = max((d["temp_min_c"] for d in forecast), default=min_t)
                alerts.append({
                    "id": "frost_safe", "severity": "info", "category": "Temperatura Segura",
                    "title_es": f"Sin Peligro de Helada esta Semana (mínima {min_t}°C)",
                    "title_qu": "Mana Qasa Kanchu Kay Semana",
                    "message_es": f"Las madrugadas bajarán entre {min_t}°C y {max_min_t}°C esta semana.",
                    "action_es": "Buena temperatura nocturna para siembras y emergencia de semillas.",
                })

        if net_water <= -12.0 or soil_pct < 26.0:
            sev = "critical" if (soil_pct < 18.0 and net_water <= -15.0) else "warning"
            alerts.append({
                "id": "water_deficit", "severity": sev, "category": "Agua y Sequía",
                "title_es": f"El Sol Secará Más Agua de la que Llueve ({net_water:+.1f} mm en 7 días)",
                "title_qu": "Ruphay Allpata Ch'akichishan",
                "message_es": f"Lloverá aprox. {tot_rain} mm, pero el sol y viento evaporarán {tot_et0} mm. Humedad actual de superficie: {soil_pct:.0f}%.",
                "action_es": "Deja chala, paja o rastrojo tapando la tierra; si tienes riego, riega al amanecer o al caer el sol.",
            })
        else:
            alerts.append({
                "id": "water_ok", "severity": "info", "category": "Agua",
                "title_es": f"Humedad de Tierra Aceptable ({soil_pct:.0f}%)",
                "title_qu": "Allpa Ch'aranqa Allillan",
                "message_es": f"Se esperan {tot_rain} mm de lluvia frente a {tot_et0} mm de evaporación en los próximos 7 días.",
                "action_es": "Aprovecha la humedad sin voltear demasiado la tierra para no perder agua.",
            })

        rainy = [d for d in forecast if d["precip_mm"] >= 4.0 or d["precip_prob_pct"] >= 65]
        if rainy:
            rain_names = ", ".join(f"{d['day_label']} (~{d['precip_mm']} mm)" for d in rainy[:3])
            is_steep = any(w in (zone or {}).get("slope_category", "").lower() for w in ("pendiente", "colina", "ladera", "12"))
            has_heavy = any(d["precip_mm"] >= 10.0 for d in rainy)
            alerts.append({
                "id": "rain_window",
                "severity": "warning" if (is_steep and has_heavy) else "info",
                "category": "Ventana de Lluvia",
                "title_es": "Lluvia Fuerte: Cuida tus Surcos de Ladera" if (is_steep and has_heavy) else "Días con Lluvia Útil para el Campo",
                "title_qu": "Para P'unchawkuna Hamushan",
                "message_es": f"Mayor lluvia prevista: {rain_names}.",
                "action_es": "Revisa zanjas de desagüe y surcos en curva para que el aguacero no lave la tierra buena." if (is_steep and has_heavy) else "Momento bueno para sembrar o tapar abono sin gastar riego.",
            })

        if max_w >= 18.0:
            windy = max(forecast, key=lambda x: x["wind_kmh"])
            alerts.append({
                "id": "wind_warning", "severity": "warning", "category": "Viento Seco",
                "title_es": f"Aviso de Viento Fuerte ({max_w:.0f} km/h el {windy['day_label']})",
                "title_qu": "Sinchi Wayra Hamushan",
                "message_es": f"Las ráfagas del {windy['day_label']} secarán rápido la tierra descubierta y pueden volcar plantas.",
                "action_es": "No quemes ni dejes la tierra en descanso sin cobertura; aplica abonos foliares o riegos por aspersión cuando calme el viento.",
            })

        alerts.sort(key=lambda a: SEV_ORDER.get(a["severity"], 9))
        alerts_qu_clean = ". ".join(a["title_qu"].split("(")[0].strip() for a in alerts[:3])
        alerts_es_clean = ". ".join(a["title_es"].split("(")[0].replace("¡", "").replace("!", "").strip() for a in alerts[:3])
        top_action_es = alerts[0]["action_es"] if alerts else "Cuida la humedad de tu terreno."
        municipal_alert = _build_municipal_alert(
            zone_id=zone_id,
            district_code=district_code,
            comuna=comuna,
            drainage_type=drainage_type,
            soil_pct=soil_pct,
            rain_7d=tot_rain,
            rain_14d=tot_rain_14d,
            net_14d=net_water_14d,
        )
        return {
            "zone_id": zone_id,
            "data_status": z_rt.get("data_status", "unavailable_realtime_fallback"),
            "fetched_at_utc": fetched_at,
            "current_conditions": current,
            "predictions_summary": {
                "total_precip_7d_mm": tot_rain,
                "total_et0_7d_mm": tot_et0,
                "net_water_balance_7d_mm": net_water,
                "min_temp_7d_c": min_t,
                "max_temp_7d_c": max_t,
                "max_wind_7d_kmh": max_w,
                "plain_prediction_es": f"En los próximos 7 días caerán aprox. {tot_rain} mm de lluvia, mientras el sol evaporará {tot_et0} mm (balance {net_water:+.1f} mm). Mínima nocturna: {min_t}°C; máxima de día: {max_t}°C.",
            },
            "predictions_summary_14d": {
                "total_precip_14d_mm": tot_rain_14d,
                "total_et0_14d_mm": tot_et0_14d,
                "net_water_balance_14d_mm": net_water_14d,
                "min_temp_14d_c": min_t_14d,
                "max_temp_14d_c": max_t_14d,
                "max_wind_14d_kmh": max_w_14d,
                "plain_prediction_es": f"Proyección a 14 días: lluvia estimada {tot_rain_14d} mm vs {tot_et0_14d} mm de evaporación (balance neto {net_water_14d:+.1f} mm). Mínima: {min_t_14d}°C; máxima: {max_t_14d}°C.",
            },
            "seven_day_forecast": forecast_7d,
            "fourteen_day_forecast": forecast_14d,
            "municipal_alert": municipal_alert,
            "nasa_recent_daily": nasa_daily,
            "active_alerts": alerts,
            "alerts_spoken_qu": f"Allillanchu. Kay semanapaq willakuy: {alerts_qu_clean}. Allpata qhorawan p'istuy.",
            "alerts_spoken_es": f"Hola compañero productor. Aviso del clima para esta semana: {alerts_es_clean}. Consejo práctico: {top_action_es}",
            "veracity_manifest": _build_veracity_manifest(fetched_at, bool(nasa_daily)),
        }
