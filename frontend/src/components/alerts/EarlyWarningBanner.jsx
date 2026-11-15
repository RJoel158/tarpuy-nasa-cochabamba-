import HorizontalCarousel from "../ui/HorizontalCarousel.jsx";
import React, { useState, useEffect } from "react";
import { buildWeatherNarration } from "../../services/narration.js";
import { AlertsModal } from "../ui/FeedbackSystem.jsx";
import DayForecastModal from "./DayForecastModal.jsx";
import { BotonGrande, BotonAltavoz } from "../ui/TarpuyBaseComponents.jsx";
import { IlustracionTarpuy } from "../illustrations/TarpuyIllustrations.jsx";
import { PatronPantalla } from "../personality/PatronesYSellos.jsx";
import { PaisajePorHora } from "../personality/ElementosContextualesFase1C.jsx";
import MamaTomasaAyuda from "../personality/MamaTomasaAyuda.jsx";
import { SABERES_DEL_DIA_EJEMPLO } from "../../data/saberesDelDia.js";
import { tr } from "../../utils/quechuaI18n.js";
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
} from "./WeatherPictograms.jsx";

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
  const [forecastHorizon, setForecastHorizon] = useState("7d");

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
  const pred14 = bulletin.predictions_summary_14d || {};
  const alerts = bulletin.active_alerts || [];
  const days14 = bulletin.fourteen_day_forecast || bulletin.seven_day_forecast || [];
  const days = forecastHorizon === "14d" ? days14 : (bulletin.seven_day_forecast || []);
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

  // Semáforo de Mamá Tomasa en Clima (sin repetir el aviso principal, solo puntos clave cortos con su expresión de Fase 1)
  const saberHoy = SABERES_DEL_DIA_EJEMPLO[0];
  const semaforoPrincipalClima =
    primaryAlert.severity === "critical"
      ? "rojo"
      : primaryAlert.severity === "warning"
      ? "amarillo"
      : "verde";

  const posePrincipalClima =
    primaryAlert.severity === "critical" || primaryAlert.severity === "warning"
      ? "alerta"
      : lluvia7d < 5
      ? "riego"
      : "saludo";

  const tarjetasMamaTomasa = [
    ...alerts.slice(1).map((al, idx) => {
      const cleaned = cleanAlertForFarmer(al, voiceLang);
      const esCritico = cleaned?.severity === "critical";
      const esCuidado = cleaned?.severity === "warning";
      return {
        id: `alerta_extra_${idx}`,
        weatherKind: cleaned?.kind || "stable",
        pose: esCritico || esCuidado ? "alerta" : "saludo",
        semaforo: esCritico ? "rojo" : esCuidado ? "amarillo" : "verde",
        titulo: cleaned?.cleanTitle || al.title,
        frase: cleaned?.action || al.recommended_action || "",
      };
    }),
    {
      id: "semaforo_temperatura",
      dibujoId: hoyTresTarjetas[0].dibujoId,
      pose: minTemp <= 6 ? "alerta" : "saludo",
      semaforo: minTemp <= 2 ? "rojo" : minTemp <= 6 ? "amarillo" : "verde",
      titulo: `${hoyTresTarjetas[0].etiqueta}: ${hoyTresTarjetas[0].palabra}`,
      frase: hoyTresTarjetas[0].explicacion,
    },
    {
      id: "semaforo_lluvia",
      dibujoId: hoyTresTarjetas[1].dibujoId,
      pose: "riego",
      semaforo: lluvia7d < 5 ? "amarillo" : "verde",
      titulo: `${hoyTresTarjetas[1].etiqueta}: ${hoyTresTarjetas[1].palabra}`,
      frase: hoyTresTarjetas[1].explicacion,
    },
    {
      id: "semaforo_saber",
      dibujoId: saberHoy.dibujoId,
      pose: "pensando",
      semaforo: "verde",
      titulo: `${isQu ? "Yachay" : "Saber del día"}: ${saberHoy.tituloEs}`,
      frase: isQu && saberHoy.textoQu ? saberHoy.textoQu : saberHoy.textoEs,
    },
  ];

  return (
    <div className="space-y-10">
      {/* ===================================================================
       * 1. EL MENSAJE DEL DÍA (Protagonista único: titular corto + dibujo + Escuchar)
       *    El texto largo de "Qué hacer hoy" y los avisos viven en Mamá Tomasa.
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

        {/* Cuerpo limpio del Mensaje del Día: dibujo grande + titular corto + Escuchar */}
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

            {/* Titular corto del aviso (el detalle largo de "Qué hacer hoy" está en Mamá Tomasa) */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="tarpuy-title">{primaryAlert.cleanTitle}</h2>
            </div>

            {/* Botón de altavoz grande en la zona inferior/pulgar de la tarjeta */}
            <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center gap-3">
              <BotonAltavoz
                sonando={estaHablandoAlerta}
                mostrarTexto={true}
                etiqueta={tr(voiceLang, "listenBtn")}
                onClick={handleListen}
                className="w-full sm:w-auto justify-center"
              />
              {alerts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="min-h-[56px] px-4 py-2 rounded-2xl font-bold text-base underline cursor-pointer text-center"
                  style={{
                    backgroundColor: "var(--tarjeta)",
                    color: "var(--tinta)",
                    border: "1.5px solid var(--tinta)",
                  }}
                >
                  {tr(voiceLang, "seeAlerts")} ({alerts.length})
                </button>
              )}
            </div>
          </div>

          {/* 5. PAISAJE POR HORA (Fase 1C, debajo del mensaje del día con TODO-FUNCIONALIDAD) */}
          <PaisajePorHora momento={momentoEjemplo} zona={zId} />
        </div>
      </section>

      {/* Único separador suave de la pantalla de Clima */}
      <PatronPantalla tipo="ondas" />

      {/* ===================================================================
       * 2. HOY (En 3 dibujos en fila en móvil y escritorio, con 1 palabra cada uno)
       * =================================================================== */}
      <section aria-label={tr(voiceLang, "weatherToday")} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="tarpuy-subtitle">
            {isQu ? "Kunan p'unchaw (Hoy)" : "Hoy"}
          </h3>
          <span className="text-base font-normal" style={{ color: "var(--tinta-suave)" }}>
            {shortZone}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5 sm:gap-5">
          {hoyTresTarjetas.map((item) => (
            <article
              key={item.id}
              className="tarpuy-card-physical p-2.5 sm:p-6 flex flex-col items-center text-center justify-between gap-2 sm:gap-4"
              style={{ backgroundColor: "var(--tarjeta)" }}
            >
              <span
                className="text-sm font-medium leading-tight"
                style={{ color: "var(--tinta-suave)" }}
              >
                {item.etiqueta}
              </span>

              {/* Dibujo grande arriba en fondo suave */}
              <div
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: item.bg }}
              >
                <IlustracionTarpuy id={item.dibujoId} size={52} />
              </div>

              {/* UNA palabra grande en negrita */}
              <h4
                className="font-bold leading-tight break-words"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.05rem, 4.2vw, 1.65rem)",
                  color: "var(--tinta)",
                }}
              >
                {item.palabra}
              </h4>

              {/* Números de apoyo (>= 14 px) */}
              <span
                className="hidden md:block text-sm font-normal pt-1"
                style={{ color: "var(--tinta-suave)" }}
              >
                {item.apoyoNumerico}
              </span>
              <span
                className="md:hidden text-sm font-medium"
                style={{ color: "var(--tinta-suave)" }}
              >
                {item.id === "temperatura"
                  ? `${cur.temp_c}°C`
                  : item.id === "lluvia"
                  ? `${pred.total_precip_7d_mm} mm`
                  : `${days[0]?.wind_kmh ?? 12} km/h`}
              </span>
            </article>
          ))}
        </div>
      </section>

      {/* ===================================================================
       * 3. LA SEMANA (Tira de 7 casillas grandes tocables, sin requerir scroll horizontal)
       * =================================================================== */}
      <section aria-label={tr(voiceLang, "dayByDay")} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="tarpuy-subtitle">
              {forecastHorizon === "14d"
                ? (isQu ? "14 p'unchawkuna (2 semanas)" : "Próximos 14 días (2 semanas)")
                : (isQu ? "Qhipa 7 p'unchawkuna (La semana)" : "La semana")}
            </h3>
            <div className="inline-flex rounded-xl p-0.5 bg-slate-200/80 border border-slate-300 text-xs font-bold" role="group" aria-label="Horizonte de pronóstico">
              <button
                type="button"
                onClick={() => setForecastHorizon("7d")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${forecastHorizon === "7d" ? "bg-white text-slate-900 shadow-xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
              >
                7 días
              </button>
              <button
                type="button"
                onClick={() => setForecastHorizon("14d")}
                className={`px-3 py-1 rounded-lg transition cursor-pointer ${forecastHorizon === "14d" ? "bg-white text-slate-900 shadow-xs font-extrabold" : "text-slate-600 hover:text-slate-900"}`}
              >
                14 días
              </button>
            </div>
          </div>
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
                className="tarpuy-btn-physical last:col-span-2 sm:last:col-span-1 p-3.5 sm:p-4 flex flex-col items-center justify-between gap-2.5 text-center cursor-pointer"
                style={{
                  minHeight: "172px",
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

                {/* Palabra de estado + números de apoyo (>= 14 px) */}
                <div className="space-y-0.5 w-full">
                  <span className="block text-base font-bold leading-snug">
                    {dv.word}
                  </span>
                  <span
                    className="block text-sm font-normal"
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

            <HorizontalCarousel label="Detalle técnico y estado del suelo" kind="detail">
              {weatherCards.map((c) => {
                const tone = TONE_CLASSES[c.tone] || TONE_CLASSES.sky;
                return (
                  <div
                    key={c.key}
                    className="tarpuy-card-physical p-4 flex flex-col justify-between gap-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <WeatherIllustration kind={c.kind} className="w-12 h-12 shrink-0" />
                        <span
                          className="text-xs font-extrabold uppercase tracking-wider leading-tight"
                          style={{ color: "var(--tinta-suave)" }}
                        >
                          {c.category}
                        </span>
                      </div>
                      <span
                        className="text-xs font-extrabold px-2.5 py-0.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: tone.bgVar,
                          color: "var(--tinta)",
                          border: "1.5px solid var(--tinta)",
                        }}
                      >
                        {c.badge}
                      </span>
                    </div>

                    <div>
                      <p className="font-extrabold text-lg leading-tight">{c.title}</p>
                      <p className="text-sm font-bold mt-1" style={{ color: "var(--tinta-suave)" }}>
                        {c.advice}
                      </p>
                      <p
                        className="mt-2 text-xs font-mono font-bold px-2.5 py-1.5 rounded-xl"
                        style={{
                          backgroundColor: "var(--arena)",
                          color: "var(--tinta)",
                          border: "1.5px solid var(--tinta)",
                        }}
                      >
                        {c.techText}
                      </p>
                    </div>

                    {c.isRain ? (
                      <div className="space-y-2">
                        <RainDropsVisual count={c.drops} lang={voiceLang} />
                        <VisualMeter3 level={c.level} tone={c.tone} labels={c.levels} />
                      </div>
                    ) : (
                      <VisualMeter3 level={c.level} tone={c.tone} labels={c.levels} />
                    )}
                  </div>
                );
              })}
            </HorizontalCarousel>
          </div>
        )}
      </section>

      <MamaTomasaAyuda
        titulo={
          isQu
            ? `Pacha willay · ${shortZone}`
            : `Clima de hoy en ${shortZone}`
        }
        pose={posePrincipalClima}
        semaforoPrincipal={semaforoPrincipalClima}
        mensaje={primaryAlert.action}
        tarjetas={tarjetasMamaTomasa}
        onListen={handleListen}
        isSpeaking={estaHablandoAlerta}
        badgeCount={tarjetasMamaTomasa.length}
        tonoAvisoPrincipal={estiloMensajeDia.tonoGlobo}
        lang={voiceLang}
        abiertoControlado={modalOpen}
        onCambiarAbierto={setModalOpen}
      />

      <DayForecastModal
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
