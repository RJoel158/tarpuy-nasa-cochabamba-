import { buildDayInterpretation } from "../../services/weatherAdvice.js";
import React from "react";
import { WeatherIllustration, RainDropsVisual } from "../../variants/liz/components/alerts/WeatherPictograms.jsx";
import { IlustracionTarpuy } from "../../variants/liz/components/illustrations/TarpuyIllustrations.jsx";
import { BotonGrande, BotonAltavoz } from "../../variants/liz/components/ui/TarpuyBaseComponents.jsx";
import { tr } from "../../variants/liz/utils/quechuaI18n.js";

/**
 * TARPUY NASA COCHABAMBA — MODAL DE DETALLE DEL DÍA (FASE 3)
 * ==========================================================
 * - Dibujos grandes y palabras simples.
 * - Previsión por tramos del día como una franja dibujada de Datos diarios disponibles
 *   en lugar de tabla fría (usando exactamente los mismos datos del día).
 * - Botón "Cerrar" enorme (mínimo 68 px) y botón de Altavoz grande.
 * - Cero códigos hexadecimales sueltos.
 */

export default function DayForecastModal({
  day,
  dv,
  zoneName = "",
  lang = "es",
  onClose,
  onSpeak,
}) {
  if (!day || !dv) return null;

  const esQu = lang === "qu";
  const interp = buildDayInterpretation(day, dv, lang);

  const metric = (value, unit) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) ? `${Number(value).toLocaleString("es-BO")} ${unit}` : "Sin dato";
  const franjaMomentos = [
    { id:"min", momento:"Temperatura mínima", dibujoId:"termometro_frio", palabra:metric(day.temp_min_c,"°C"), apoyoNumerico:"Mínima del día; sin hora pronosticada", bg:"var(--cielo-suave)" },
    { id:"max", momento:"Temperatura máxima", dibujoId:"termometro_calor", palabra:metric(day.temp_max_c,"°C"), apoyoNumerico:"Máxima del día; sin hora pronosticada", bg:"var(--dorado-suave)" },
    { id:"rain", momento:"Lluvia acumulada", dibujoId:"lluvia", palabra:metric(day.precip_mm,"mm"), apoyoNumerico:`Probabilidad: ${metric(day.precip_prob_pct,"%")}`, bg:"var(--cielo-suave)" },
  ];

  const alertaBg =
    dv.tone === "rose"
      ? "var(--alerta-critico-suave)"
      : dv.tone === "amber"
      ? "var(--alerta-cuidado-suave)"
      : dv.tone === "sky"
      ? "var(--cielo-suave)"
      : "var(--hoja-suave)";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${day.day_label} · ${dv.word}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
      style={{ backgroundColor: "rgba(35, 26, 20, 0.72)" }}
      onClick={onClose}
    >
      <div
        className="tarpuy-card-physical max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden"
        style={{
          backgroundColor: "var(--tarjeta)",
          boxShadow: "0 8px 0 var(--tinta)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal */}
        <div
          className="px-6 py-4 flex flex-wrap items-center justify-between gap-4"
          style={{
            backgroundColor: "var(--arena)",
            borderBottom: "var(--border-width-thick) solid var(--tinta)",
          }}
        >
          <div>
            <p
              className="text-sm font-extrabold uppercase tracking-wider"
              style={{ color: "var(--tinta-suave)" }}
            >
              {tr(lang, "dayDetailSub")} · {zoneName} · {day.date}
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <h3 className="tarpuy-title">{day.day_label}</h3>
              <span
                className="px-4 py-1 rounded-full font-extrabold text-lg"
                style={{
                  backgroundColor: alertaBg,
                  color: "var(--tinta)",
                  border: "var(--border-width-medium) solid var(--tinta)",
                }}
              >
                {dv.word}
              </span>
            </div>
          </div>

          <BotonAltavoz
            sonando={false}
            mostrarTexto={true}
            etiqueta={tr(lang, "listenBtn")}
            onClick={() =>
              onSpeak?.(interp.spokenSummary, lang, `day_${day.date}_${lang}`)
            }
          />
        </div>

        {/* Cuerpo del modal */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Resumen visual principal del día */}
          <div
            className="p-5 rounded-3xl flex flex-col sm:flex-row items-center gap-5"
            style={{
              backgroundColor: alertaBg,
              border: "var(--border-width-thick) solid var(--tinta)",
            }}
          >
            <div
              className="w-28 h-28 rounded-full flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "var(--tarjeta)",
                border: "var(--border-width-medium) solid var(--tinta)",
              }}
            >
              <WeatherIllustration
                kind={dv.kind}
                animated={true}
                className="w-20 h-20"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <p className="tarpuy-subtitle">{{expired:"Pronóstico vencido",cold:"Atención al frío",rain_accumulation:"Revisa el drenaje",rain:"Lluvia prevista",wind:"Atención al viento",reference_deficit:"Cuida la humedad",little_rain:"Poca lluvia prevista",heat:"Atención al calor",check:"Revisa los datos disponibles"}[interp.actions[0]?.id]}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4">
                <RainDropsVisual count={dv.drops} text={dv.rainText} lang={lang} />
                <span
                  className="px-3 py-1 rounded-full text-base font-extrabold"
                  style={{
                    backgroundColor: "var(--tarjeta)",
                    border: "1.5px solid var(--tinta)",
                  }}
                >
                  {dv.nightText}
                </span>
              </div>
            </div>
          </div>

          {/* FRANJA DIBUJADA DE MAÑANA, TARDE Y NOCHE (en vez de tabla) */}
          <div className="space-y-3">
            <h4 className="tarpuy-subtitle">
              {esQu
                ? "¿Imayna pacha kanqa p'unchawpi?"
                : "Datos del día, sin desglose por hora:"}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {franjaMomentos.map((tramo) => (
                <div
                  key={tramo.id}
                  className="p-4 rounded-3xl flex flex-col items-center text-center justify-between gap-3"
                  style={{
                    backgroundColor: tramo.bg,
                    border: "var(--border-width-thick) solid var(--tinta)",
                  }}
                >
                  <span
                    className="px-3 py-0.5 rounded-full text-sm font-extrabold uppercase tracking-wide"
                    style={{
                      backgroundColor: "var(--tarjeta)",
                      color: "var(--tinta)",
                      border: "1.5px solid var(--tinta)",
                    }}
                  >
                    {tramo.momento}
                  </span>

                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: "var(--tarjeta)",
                      border: "var(--border-width-medium) solid var(--tinta)",
                    }}
                  >
                    <IlustracionTarpuy id={tramo.dibujoId} size={56} />
                  </div>

                  <p className="font-extrabold text-xl leading-tight">
                    {tramo.palabra}
                  </p>

                  {/* Números pequeños como apoyo */}
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-xl"
                    style={{
                      backgroundColor: "var(--tarjeta)",
                      color: "var(--tinta-suave)",
                      border: "1px solid var(--tinta)",
                    }}
                  >
                    {tramo.apoyoNumerico}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Explicación completa para la chacra (conservando todos los textos de interpretación) */}
          <div
            className="p-5 rounded-2xl space-y-2"
            style={{
              backgroundColor: "var(--arena)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            <h4 className="font-extrabold text-lg">
              {tr(lang, "farmMeaningTitle")}
            </h4>
            <p className="text-base font-bold" style={{ color: "var(--tinta-suave)" }}>
              {interp.dayText} {interp.nightText} {interp.rainText}
            </p>
            <p className="pt-2 font-extrabold text-lg" style={{ color: "var(--tinta)" }}>
              {interp.expired ? "Qué hacer ahora:" : "Qué hacer ese día:"} {lang === "qu" ? interp.adviceText : ""}
            </p>
            {lang !== "qu" && <ul className="space-y-4 pt-2">{interp.actions.map(action=><li key={action.id} className="border-t border-[var(--tinta-apagada)]/30 pt-3"><p className="font-extrabold text-lg">{action.action}</p><p className="text-base mt-2 text-slate-600"><strong>Por qué:</strong> {action.reason}</p></li>)}</ul>}
            <p className="text-sm text-slate-600 pt-3">{interp.limitation}</p>
            {interp.translationPending && <p className="text-sm">Consejos detallados pendientes de validación en quechua local.</p>}
          </div>
        </div>

        {/* Pie del modal con botón "Cerrar" enorme */}
        <div
          className="px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
          style={{
            backgroundColor: "var(--arena)",
            borderTop: "var(--border-width-thick) solid var(--tinta)",
          }}
        >
          <BotonGrande
            variante="primario"
            texto={tr(lang, "closeBtn")}
            onClick={onClose}
            className="w-full text-xl justify-center"
          />
        </div>
      </div>
    </div>
  );
}
