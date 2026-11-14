import HorizontalCarousel from "../ui/HorizontalCarousel.jsx";
import WeatherDetailCards from "../alerts/WeatherDetailCards.jsx";
import React, { useState, useEffect } from "react";
import { buildWeatherNarration } from "../../services/narration.js";
import { AlertsModal } from "../../variants/liz/components/ui/FeedbackSystem.jsx";
import DayForecastModal from "./DayForecastModal.jsx";
import { BotonGrande, BotonAltavoz } from "../../variants/liz/components/ui/TarpuyBaseComponents.jsx";
import { IlustracionTarpuy } from "../../variants/liz/components/illustrations/TarpuyIllustrations.jsx";
import { PersonajeGuia, GloboHabla } from "../../variants/liz/components/personality/PersonajeGuia.jsx";
import { PatronPantalla } from "../../variants/liz/components/personality/PatronesYSellos.jsx";
import { PaisajePorHora } from "../../variants/liz/components/personality/ElementosContextualesFase1C.jsx";
import { tr } from "../../variants/liz/utils/quechuaI18n.js";
import {
  WeatherIllustration,
  VisualMeter3,
  RainDropsVisual,
  TONE_CLASSES,
  describeTempCard,
  describeSoilCard,
  describeRainCard,
  describeSunCard,
  describeDayVisual,
  cleanAlertForFarmer,
} from "../../variants/liz/components/alerts/WeatherPictograms.jsx";

/**
 * TARPUY NASA COCHABAMBA — PANTALLA CLIMA: MENSAJE DEL DÍA, HOY, LA SEMANA Y DETALLE (FASE 3)
 * ===========================================================================================
 * Orden visual de arriba hacia abajo:
 * 1. EL MENSAJE DEL DÍA: Tarjeta gigante con UN dibujo grande, UNA frase simple,
 *    el personaje guía señalando y botón de altavoz grande (con el audio existente).
 *    Debajo, PaisajePorHora (Fase 1C) y el separador fijo de ondas (Clima).
 * 2. HOY: El clima de hoy en 3 dibujos grandes con una palabra cada uno:
 *    - Frío o Calor (termómetro dibujado: --tierra para calor, --cielo para frío)
 *    - Lluvia (nube con gotas en --cielo o sol en --dorado)
 *    - Viento ("Viento suave" / "Viento fuerte")
 *    Con los números pequeños abajo como apoyo.
 * 3. LA SEMANA: Tira de 7 casillas grandes (día + UN dibujo del clima + palabra).
 *    Al tocar un día abre el mismo DayForecastModal rediseñado.
 * 6. MODO AVANZADO / PLEGADO: Conserva toda la información técnica actual debajo,
 *    plegada con el botón grande "Ver más detalle". Nada se elimina.
 *
 * Cero códigos hexadecimales sueltos.
 */

export default function EarlyWarningBanner({
  bulletin,
  zoneName = "",
  onSpeak,
  activeAudioKey,
  voiceLang = "es",
  isAdvanced = false,
  onOpenMap,
  onDetectGps,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [mostrarMasDetalle, setMostrarMasDetalle] = useState(isAdvanced);

  useEffect(() => {
    setMostrarMasDetalle(isAdvanced);
  }, [isAdvanced]);

  if (!bulletin || !bulletin.current_conditions) {
    return (
      <div
        role="status"
        className="tarpuy-card-physical p-6 flex items-center gap-4"
        style={{ backgroundColor: "var(--alerta-cuidado-suave)" }}
      >
        <IlustracionTarpuy id="nube_con_sol" size={56} />
        <p className="tarpuy-body font-extrabold">
          {voiceLang === "qu"
            ? "Mana pacha yachay kanchu."
            : "No hay datos del clima disponibles para esta zona. Si tienes internet, vuelve a consultar."}
        </p>
      </div>
    );
  }

  const cur = bulletin.current_conditions;
  const pred = bulletin.predictions_summary || {};
  const alerts = bulletin.active_alerts || [];
  const days = bulletin.seven_day_forecast || [];
  const zId = bulletin.zone_id || "punata_valle_alto";
  const aKey = `alert_${zId}_${voiceLang}`;
  const shortZone = (zoneName || zId).split("—")[0].split("-")[0].trim();
  const isQu = voiceLang === "qu";
  const estaHablandoAlerta = activeAudioKey === aKey;

  const handleListen = () => {
    const message = buildWeatherNarration(bulletin, shortZone, voiceLang);
    onSpeak?.(message, voiceLang, aKey);
  };

  const primaryAlert = cleanAlertForFarmer(alerts[0], voiceLang) || {
    kind: "stable",
    severity: "info",
    semaforo: "tranquilo",
    bannerPill: isQu ? "ALLIN PACHA" : "TRANQUILO HOY",
    cleanTitle: isQu
      ? "Llaqtaykipi pachaqa allillan kachkan"
      : "Tiempo tranquilo hoy en tu zona",
    action: isQu
      ? "Allin pacha chakraykipi llamk'anapaq."
      : "Buen día para trabajar con calma en tu chacra.",
  };

  /* Colores semánticos de alerta (Tranquilo, Cuidado, Peligro/Crítico) */
  const estiloMensajeDia =
    primaryAlert.severity === "critical"
      ? {
          bg: "var(--alerta-critico-suave)",
          franja: "var(--alerta-critico)",
          ink: "var(--alerta-critico-oscuro)",
          tonoGlobo: "critico",
          poseGuia: "alerta",
        }
      : primaryAlert.severity === "warning"
      ? {
          bg: "var(--alerta-cuidado-suave)",
          franja: "var(--alerta-cuidado)",
          ink: "var(--alerta-cuidado-oscuro)",
          tonoGlobo: "cuidado",
          poseGuia: "alerta",
        }
      : {
          bg: "var(--alerta-tranquilo-suave)",
          franja: "var(--alerta-tranquilo)",
          ink: "var(--alerta-tranquilo-oscuro)",
          tonoGlobo: "tranquilo",
          poseGuia: "saludo",
        };

  /* Datos para las 3 tarjetas grandes de HOY (Frío/Calor, Lluvia, Viento) */
  const minTemp = Number(pred.min_temp_7d_c ?? cur.temp_c ?? 10);
  const tempActual = Number(cur.temp_c ?? 16);
  const lluvia7d = Number(pred.total_precip_7d_mm ?? 0);
  const vientoHoy = Number(days[0]?.wind_kmh ?? 12);

  const tempCard = describeTempCard(cur.temp_c, pred.min_temp_7d_c, voiceLang);
  const soilCard = describeSoilCard(cur.soil_moisture_top_pct, voiceLang);
  const rainCard = describeRainCard(pred.total_precip_7d_mm, voiceLang);
  const sunCard = describeSunCard(pred.net_water_balance_7d_mm, voiceLang);

  const hoyTresTarjetas = [
    {
      id: "temperatura",
      etiqueta: isQu ? "1. Chiri icha Rupha" : "1. Frío o Calor",
      dibujoId: minTemp <= 5 ? "termometro_frio" : "termometro_calor",
      palabra:
        minTemp <= 2
          ? isQu
            ? "Qasa"
            : "Helada"
          : minTemp <= 6
          ? isQu
            ? "Chiri"
            : "Frío"
          : tempActual >= 23
          ? isQu
            ? "Rupha"
            : "Calor"
          : isQu
          ? "Q'uñi"
          : "Templado",
      explicacion: tempCard.advice,
      apoyoNumerico: `${cur.temp_c}°C hoy · Mín ${pred.min_temp_7d_c}°C / Máx ${pred.max_temp_7d_c}°C`,
      bg: minTemp <= 5 ? "var(--cielo-suave)" : "var(--tierra-suave)",
    },
    {
      id: "lluvia",
      etiqueta: isQu ? "2. Para" : "2. Lluvia",
      dibujoId: lluvia7d >= 5 ? "lluvia" : "sol",
      palabra:
        lluvia7d < 5
          ? isQu
            ? "Mana para"
            : "Sin lluvia"
          : lluvia7d < 20
          ? isQu
            ? "Pisi para"
            : "Poca lluvia"
          : isQu
          ? "Allin para"
          : "Con lluvia",
      explicacion: rainCard.advice,
      apoyoNumerico: `${pred.total_precip_7d_mm} mm en 7 días · Humedad suelo: ${cur.soil_moisture_top_pct ?? "—"}%`,
      bg: lluvia7d >= 5 ? "var(--cielo-suave)" : "var(--dorado-suave)",
    },
    {
      id: "viento",
      etiqueta: isQu ? "3. Wayra" : "3. Viento",
      dibujoId: "viento",
      palabra:
        vientoHoy >= 18
          ? isQu
            ? "Sinchi wayra"
            : "Viento fuerte"
          : isQu
          ? "Llanthu wayra"
          : "Viento suave",
      explicacion: sunCard.advice,
      apoyoNumerico: `Viento: ${days[0]?.wind_kmh ?? "—"} km/h · Humedad aire: ${cur.humidity_pct ?? "—"}%`,
      bg: vientoHoy >= 18 ? "var(--alerta-cuidado-suave)" : "var(--arena)",
    },
  ];

  /* Las 4 tarjetas detalladas originales (conservadas íntegras para Ver más detalle / Modo Avanzado) */
  const weatherCards = [
    {
      key: "temp",
      category: isQu ? "CHIRI Q'UÑI" : "TEMPERATURA",
      ...tempCard,
      techText: `${cur.temp_c}°C · Mín: ${pred.min_temp_7d_c}°C · Máx: ${pred.max_temp_7d_c}°C`,
    },
    {
      key: "soil",
      category: isQu ? "ALLPAYKI" : "TU TIERRA",
      ...soilCard,
      techText: `${cur.soil_moisture_top_pct}% · ${cur.humidity_pct}%`,
    },
    {
      key: "rain",
      category: isQu ? "PARA 7 P'UNCHAW" : "LLUVIA 7 DÍAS",
      ...rainCard,
      isRain: true,
      techText: `${pred.total_precip_7d_mm} mm`,
    },
    {
      key: "sun",
      category: isQu ? "INTI WAN CH'AKI" : "SOL Y SEQUEDAD",
      ...sunCard,
      techText: `ET0: ${pred.total_et0_7d_mm} mm · Bal: ${pred.net_water_balance_7d_mm} mm`,
    },
  ];

  // TODO-FUNCIONALIDAD: el equipo decide cómo se calcula el momento del día (amanecer, mediodia, atardecer, noche) según la hora local o el pronóstico nocturno.
  const momentoEjemplo = minTemp <= 2 ? "noche" : "amanecer";

  return (
    <div className="space-y-10">
      {/* ===================================================================
       * 1. EL MENSAJE DEL DÍA (Protagonista único de la pantalla de Clima)
       * =================================================================== */}
      <section
        aria-label={isQu ? "Kunan p'unchaw willay" : "El mensaje del día"}
        className="tarpuy-card-physical overflow-hidden"
        style={{
          backgroundColor: estiloMensajeDia.bg,
          border: "2px solid var(--tinta)",
        }}
      >
        {/* Franja superior de estado del clima */}
        <div
          className="px-6 py-3 flex flex-wrap items-center justify-between gap-3"
          style={{
            backgroundColor: estiloMensajeDia.franja,
            color:
              primaryAlert.severity === "warning"
                ? "var(--tinta)"
                : "var(--texto-sobre-fuerte)",
          }}
        >
          <span className="inline-flex items-center gap-2.5 font-bold text-lg">
            <span
              className="w-3.5 h-3.5 rounded-full inline-block"
              style={{ backgroundColor: "var(--tarjeta)" }}
              aria-hidden="true"
            />
            <span>
              {primaryAlert.bannerPill} · {shortZone}
            </span>
          </span>

          <span className="text-sm font-medium">
            {isQu ? "¿Imata kunan ruwana?" : "¿Qué debo hacer hoy?"}
          </span>
        </div>

        {/* Cuerpo gigante del Mensaje del Día */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* UN dibujo grande del estado principal */}
            <div className="relative shrink-0">
              <div
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "var(--tarjeta)" }}
              >
                <WeatherIllustration
                  kind={primaryAlert.kind}
                  animated={true}
                  className="w-22 h-22 sm:w-24 sm:h-24"
                />
              </div>

              {primaryAlert.kind === "frost" && (
                <span
                  className="w-11 h-11 rounded-full flex items-center justify-center absolute -top-1 -right-1"
                  style={{ backgroundColor: "var(--tarjeta)" }}
                >
                  <IlustracionTarpuy id="noche_luna" size={30} />
                </span>
              )}
            </div>

            {/* UNA frase simple y grande + acción inmediata */}
            <div className="flex-1 text-center md:text-left space-y-2">
              <h2 className="tarpuy-title">{primaryAlert.cleanTitle}</h2>
              <p
                className="font-normal leading-snug"
                style={{
                  fontSize: "var(--font-size-subtitle)",
                  color: "var(--tinta)",
                }}
              >
                {primaryAlert.action}
              </p>
            </div>

            {/* Botón de altavoz grande dentro de la misma tarjeta */}
            <div className="shrink-0 flex flex-col items-center gap-2">
              <BotonAltavoz
                sonando={estaHablandoAlerta}
                mostrarTexto={true}
                etiqueta={tr(voiceLang, "listenBtn")}
                onClick={handleListen}
              />
              {alerts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="font-bold text-base underline cursor-pointer py-1"
                  style={{ color: "var(--tinta)" }}
                >
                  {tr(voiceLang, "seeAlerts")} ({alerts.length})
                </button>
              )}
            </div>
          </div>

          {/* Personaje Guía señalando lo importante (sin doble caja con borde) */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
            <PersonajeGuia
              pose={estiloMensajeDia.poseGuia}
              mostrarEtiquetaNombre={false}
              size={84}
            />
            <GloboHabla
              direccionCola="izquierda"
              tono="normal"
              texto={`${tr(voiceLang, "doToday")} ${primaryAlert.action}`}
              className="w-full"
            />
          </div>

          {/* 5. PAISAJE POR HORA (Fase 1C, debajo del mensaje del día con TODO-FUNCIONALIDAD) */}
          <PaisajePorHora momento={momentoEjemplo} zona={zId} />
        </div>
      </section>

      {/* Único separador suave de la pantalla de Clima */}
      <PatronPantalla tipo="ondas" />

      {/* ===================================================================
       * 2. HOY (El clima de hoy en 3 dibujos grandes con una palabra cada uno,
       *    en tarjetas limpias sin bordes gruesos ni cajas anidadas)
       * =================================================================== */}
      <section aria-label={tr(voiceLang, "weatherToday")} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="tarpuy-subtitle">
            {isQu ? "Kunan p'unchaw (Hoy)" : "El clima de hoy en 3 miradas"}
          </h3>
          <span className="text-base font-normal" style={{ color: "var(--tinta-suave)" }}>
            {shortZone}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {hoyTresTarjetas.map((item) => (
            <article
              key={item.id}
              className="tarpuy-card-physical p-6 flex flex-col items-center text-center justify-between gap-4"
              style={{ backgroundColor: "var(--tarjeta)" }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "var(--tinta-suave)" }}
              >
                {item.etiqueta}
              </span>

              {/* Dibujo grande arriba en fondo suave sin borde grueso */}
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: item.bg }}
              >
                <IlustracionTarpuy id={item.dibujoId} size={68} />
              </div>

              {/* UNA palabra grande en negrita y explicación en peso normal */}
              <div className="space-y-1.5">
                <h4 className="tarpuy-title">{item.palabra}</h4>
                <p className="tarpuy-body font-normal">{item.explicacion}</p>
              </div>

              {/* Los números pequeños abajo como apoyo sin encerrar en otra caja */}
              <span
                className="text-sm font-normal pt-1"
                style={{ color: "var(--tinta-suave)" }}
              >
                {item.apoyoNumerico}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* ===================================================================
       * 3. LA SEMANA (Tira de 7 casillas interactivas limpias)
       * =================================================================== */}
      <section aria-label={tr(voiceLang, "dayByDay")} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="tarpuy-subtitle">
            {isQu
              ? "Qhipa 7 p'unchawkuna (La semana)"
              : "La semana · toca un día para ver su detalle"}
          </h3>
          <span
            className="text-sm font-medium"
            style={{ color: "var(--tinta-suave)" }}
          >
            {tr(voiceLang, "tapForDetail")}
          </span>
        </div>

        <HorizontalCarousel label="Pronóstico de la semana" kind="day">
          {days.map((d) => {
            const dv = describeDayVisual(d, voiceLang);
            const bgCasilla =
              dv.tone === "rose"
                ? "var(--alerta-critico-suave)"
                : dv.tone === "amber"
                ? "var(--alerta-cuidado-suave)"
                : dv.tone === "sky"
                ? "var(--cielo-suave)"
                : "var(--tarjeta)";

            return (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelectedDay(d)}
                className="tarpuy-btn-physical p-4 flex flex-col items-center justify-between gap-3 text-center cursor-pointer"
                style={{
                  minHeight: "184px",
                  backgroundColor: bgCasilla,
                  color: "var(--tinta)",
                }}
              >
                {/* Día arriba */}
                <span className="font-bold text-lg leading-tight">
                  {d.day_label}
                </span>

                {/* UN dibujo grande del clima sin borde interior */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--tarjeta)" }}
                >
                  <WeatherIllustration kind={dv.kind} className="w-13 h-13" />
                </div>

                {/* Palabra de estado + números de apoyo sin sub-cajas */}
                <div className="space-y-0.5 w-full">
                  <span className="block text-base font-bold">
                    {dv.word}
                  </span>
                  <span
                    className="block text-xs font-normal"
                    style={{ color: "var(--tinta-suave)" }}
                  >
                    {d.temp_min_c}° / {d.temp_max_c}°C
                  </span>
                </div>
              </button>
            );
          })}
        </HorizontalCarousel>
      </section>

      {/* ===================================================================
       * 6. MODO AVANZADO / DETALLE PLEGADO ("Ver más detalle")
       *    Conserva toda la información técnica y tarjetas originales sin eliminar nada.
       * =================================================================== */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BotonGrande
            variante="secundario"
            ilustracionId="lupa"
            estado={mostrarMasDetalle ? "presionado" : "normal"}
            texto={
              mostrarMasDetalle
                ? isQu
                  ? "Sut'inchayta pakay"
                  : "Ocultar más detalle"
                : isQu
                ? "Astawan sut'inta qhaway"
                : "Ver más detalle"
            }
            onClick={() => setMostrarMasDetalle((v) => !v)}
          />

          <div className="flex flex-wrap items-center gap-3">
            <BotonGrande
              variante="secundario"
              ilustracionId="pin_ubicacion"
              texto={tr(voiceLang, "myGps")}
              onClick={onDetectGps}
            />
            <BotonGrande
              variante="secundario"
              ilustracionId="mapa_chacra"
              texto={tr(voiceLang, "map")}
              onClick={onOpenMap}
            />
            <BotonGrande
              variante="secundario"
              ilustracionId="altavoz"
              texto={tr(voiceLang, "seeAlerts")}
              onClick={() => setModalOpen(true)}
            />
          </div>
        </div>

        {mostrarMasDetalle && (
          <div
            className="tarpuy-card-physical p-6 space-y-5"
            style={{ backgroundColor: "var(--arena)" }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="tarpuy-subtitle">
                {isQu ? "Allpayki · Sut'inchasqa willay" : "Detalle técnico y estado del suelo"}
              </h4>
              <span className="text-sm font-bold" style={{ color: "var(--tinta-suave)" }}>
                {bulletin.fetched_at_utc && Number.isFinite(Date.parse(bulletin.fetched_at_utc))
                  ? `Actualizado: ${new Date(bulletin.fetched_at_utc).toLocaleString("es-BO")}`
                  : "Fecha de actualización no disponible"}
              </span>
            </div>

            <WeatherDetailCards current={cur} summary={pred} lang={voiceLang} />
          </div>
        )}
      </section>

      <AlertsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        alerts={alerts}
        zoneName={shortZone}
        lang={voiceLang}
        onListen={handleListen}
      />

      <DayForecastModal
        activeAudioKey={activeAudioKey}
        day={selectedDay}
        dv={selectedDay ? describeDayVisual(selectedDay, voiceLang) : null}
        zoneName={shortZone}
        lang={voiceLang}
        onClose={() => setSelectedDay(null)}
        onSpeak={onSpeak}
      />
    </div>
  );
}
