import React, { useState, useEffect } from "react";
import { CropIllustration } from "./FarmPictograms.jsx";
import { IlustracionTarpuy } from "../../components/illustrations/TarpuyIllustrations.jsx";
import { formatStageRange, resolveMonthCell } from "./calendarHelpers.js";
import { tr } from "../../utils/quechuaI18n.js";

/**
 * TARPUY NASA COCHABAMBA — CALENDARIO DE 12 MESES DIBUJADO (FASE 4)
 * =================================================================
 * Cinta de 12 meses dibujada con los mismos datos:
 * - Semilla = Sembrar (--hoja / --hoja-suave)
 * - Gota    = Regar   (--cielo / --cielo-suave)
 * - Cosecha = Cosechar (--dorado / --dorado-suave)
 * - Mes actual marcado con "Estamos aquí" en --ladrillo.
 * Sin texto pequeño ilegible. Cero códigos hexadecimales sueltos.
 */

export default function CropCalendarBar({
  cropSequence = [],
  indicators = [],
  lang = "es",
}) {
  const mesActualIdx = new Date().getMonth();
  const defaultMonth = Math.max(0, ((cropSequence?.[0]?.start_month || 10) - 1) % 12);
  const [selectedIdx, setSelectedIdx] = useState(defaultMonth);

  useEffect(() => {
    setSelectedIdx(Math.max(0, ((cropSequence?.[0]?.start_month || 1) - 1) % 12));
  }, [cropSequence]);

  const qu = lang === "qu";
  const cells = Array.from({ length: 12 }, (_, idx) =>
    resolveMonthCell(idx, cropSequence, indicators, lang)
  );
  const bareCount = cells.filter((c) => c.category === "bare").length;
  const protectedCount = 12 - bareCount;
  const activeCell = cells[selectedIdx] || cells[0];

  const obtenerEstiloAccion = (cell) => {
    switch (cell.category) {
      case "sembrar":
        return {
          dibujoId: "semilla",
          palabra: qu ? "Tarpuy" : "Sembrar",
          bg: "var(--hoja-suave)",
          muestra: "var(--hoja)",
        };
      case "cosechar":
        return {
          dibujoId: "cosecha",
          palabra: qu ? "Puquy" : "Cosechar",
          bg: "var(--dorado-suave)",
          muestra: "var(--dorado)",
        };
      case "mulch":
        return {
          dibujoId: "tierra_humeda",
          palabra: qu ? "Chhalla" : "Tapar suelo",
          bg: "var(--tierra-suave)",
          muestra: "var(--tierra)",
        };
      case "bare":
        return {
          dibujoId: "tierra_seca",
          palabra: qu ? "Q'ara" : "Tierra pelada",
          bg: "var(--alerta-critico-suave)",
          muestra: "var(--alerta-critico)",
        };
      case "regar":
      default:
        return {
          dibujoId: "brote",
          palabra: cell.category === "idle" ? (qu ? "Samay" : "Descanso") : (qu ? "Tarpuy" : "Cultivo"),
          bg: "var(--cielo-suave)",
          muestra: "var(--cielo)",
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Etapas de la rotación (Secuencia de cultivos) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(cropSequence || []).map((crop, idx) => {
          const rangeText = formatStageRange(crop.start_month, crop.end_month, lang);
          return (
            <button
              key={`${crop.crop_id || idx}-${idx}`}
              type="button"
              onClick={() => crop.start_month && setSelectedIdx((crop.start_month - 1) % 12)}
              className="tarpuy-btn-physical p-4 flex items-center gap-4 text-left cursor-pointer"
              style={{
                backgroundColor: "var(--tarjeta)",
                color: "var(--tinta)",
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "var(--arena)",
                  border: "var(--border-width-medium) solid var(--tinta)",
                }}
              >
                <CropIllustration cropId={crop.crop_id} name={crop.crop_name} className="w-14 h-14" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-sm font-extrabold uppercase"
                    style={{
                      backgroundColor: "var(--dorado-suave)",
                      color: "var(--dorado-oscuro)",
                      border: "1.5px solid var(--tinta)",
                    }}
                  >
                    {tr(lang, "stepPrefix")} {idx + 1}
                  </span>
                  {rangeText ? (
                    <span className="text-sm font-extrabold" style={{ color: "var(--tinta-suave)" }}>
                      {rangeText}
                    </span>
                  ) : null}
                </div>
                <span className="block font-extrabold text-xl leading-tight break-words">
                  {crop.crop_name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Cinta de 12 meses dibujada */}
      <div
        className="tarpuy-card-physical p-5 sm:p-6 space-y-5"
        style={{ backgroundColor: "var(--tarjeta)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="tarpuy-subtitle">{tr(lang, "calTitle")}</h4>
            <p className="tarpuy-body font-bold" style={{ color: "var(--tinta-suave)" }}>
              {tr(lang, "calTapMonth")}
            </p>
          </div>

          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-base font-extrabold"
            style={{
              backgroundColor:
                bareCount === 0 ? "var(--hoja-suave)" : "var(--alerta-critico-suave)",
              color: "var(--tinta)",
              border: "var(--border-width-medium) solid var(--tinta)",
            }}
          >
            <IlustracionTarpuy
              id={bareCount === 0 ? "tierra_humeda" : "tierra_seca"}
              size={28}
            />
            <span>
              {bareCount === 0
                ? `${protectedCount}/12 ${tr(lang, "calProtected")}`
                : `${bareCount}/12 ${tr(lang, "calBareWarn")}`}
            </span>
          </span>
        </div>

        <p className="text-base" style={{color:'var(--tinta-suave)'}}>Los meses describen cultivos y cobertura. El riego se decide revisando la humedad de tu parcela.</p>
        {/* Las 12 casillas grandes de los meses */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          {cells.map((c, idx) => {
            const estilo = obtenerEstiloAccion(c);
            const isSel = selectedIdx === idx;
            const esMesActual = idx === mesActualIdx;

            return (
              <button
                key={c.m}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                aria-pressed={isSel}
                title={`${c.monthName}: ${c.cropName}`}
                className={`tarpuy-btn-physical p-3.5 flex flex-col items-center justify-between gap-2 text-center cursor-pointer relative ${
                  isSel ? "tarpuy-btn-physical--pressed" : ""
                }`}
                style={{
                  minHeight: "156px",
                  backgroundColor: estilo.bg,
                  color: "var(--tinta)",
                  outline: esMesActual
                    ? "4px solid var(--ladrillo)"
                    : isSel
                    ? "3px solid var(--tinta)"
                    : "none",
                }}
              >
                {/* Marca "Estamos aquí" en --ladrillo para el mes actual */}
                {esMesActual && (
                  <span
                    className="w-full px-2 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide"
                    style={{
                      backgroundColor: "var(--ladrillo)",
                      color: "var(--tarjeta)",
                      border: "1.5px solid var(--tinta)",
                    }}
                  >
                    {qu ? "Kaypi" : "Estamos aquí"}
                  </span>
                )}

                <span className="font-extrabold text-xl">{c.monthShort}</span>

                {/* Dibujo de la acción del mes (Semilla, Gota o Cosecha) */}
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--tarjeta)",
                    border: "var(--border-width-medium) solid var(--tinta)",
                  }}
                >
                  <IlustracionTarpuy id={estilo.dibujoId} size={46} />
                </div>

                <div className="space-y-0.5">
                  <span className="block font-extrabold text-base leading-tight">
                    {estilo.palabra}
                  </span>
                  <span
                    className="block text-sm font-bold truncate"
                    style={{ color: "var(--tinta-suave)" }}
                  >
                    {c.shortWord}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Detalle grande del mes tocado */}
        <div
          className="p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
          style={{
            backgroundColor: "var(--arena)",
            border: "var(--border-width-medium) solid var(--tinta)",
          }}
        >
          <div className="flex items-center gap-4 min-w-0">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "var(--tarjeta)",
                border: "var(--border-width-medium) solid var(--tinta)",
              }}
            >
              <CropIllustration
                cropId={activeCell.cropId}
                name={activeCell.cropName}
                className="w-14 h-14"
              />
            </div>

            <div className="min-w-0 space-y-1">
              <p className="font-extrabold text-xl">
                {activeCell.monthName}: {activeCell.cropName}
              </p>
              <p className="tarpuy-body font-bold" style={{ color: "var(--tinta-suave)" }}>
                {activeCell.role}
              </p>
            </div>
          </div>

          {indicators.length > 0 ? (
            <div
              className="px-4 py-2.5 rounded-2xl flex items-center gap-3 font-extrabold text-base shrink-0"
              style={{
                backgroundColor: "var(--tarjeta)",
                border: "var(--border-width-medium) solid var(--tinta)",
              }}
            >
              <IlustracionTarpuy
                id={
                  activeCell.wx === "rain"
                    ? "lluvia"
                    : activeCell.wx === "frost"
                    ? "helada"
                    : "sol"
                }
                size={34}
              />
              <span>
                {tr(lang, "calMonthRain")}: {Math.round(activeCell.rainMm)} mm ·{" "}
                {activeCell.tmin}°/{activeCell.tmax}°C
              </span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
