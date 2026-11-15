import React, { useState, useEffect } from "react";
import { CropIllustration } from "./FarmPictograms.jsx";
import { IlustracionTarpuy } from "../../components/illustrations/TarpuyIllustrations.jsx";
import { formatStageRange, resolveMonthCell, stageMonthIndices } from "./calendarHelpers.js";
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
  const [selectedStage, setSelectedStage] = useState(null);

  useEffect(() => {
    setSelectedStage(null);
    setSelectedIdx(Math.max(0, ((cropSequence?.[0]?.start_month || 1) - 1) % 12));
  }, [cropSequence]);

  const qu = lang === "qu";
  const cells = Array.from({ length: 12 }, (_, idx) =>
    resolveMonthCell(idx, cropSequence, indicators, lang)
  );
  const bareCount = cells.filter((c) => c.category === "bare").length;
  const protectedCount = 12 - bareCount;
  const activeCell = cells[selectedIdx] || cells[0];
  const selectedMonths = selectedStage === null
    ? [selectedIdx]
    : stageMonthIndices(cropSequence[selectedStage]);

  const obtenerEstiloAccion = (cell) => {
    switch (cell.accionVisual) {
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
      case "cubrir":
        return {
          dibujoId: "tierra_humeda",
          palabra: qu ? "Chhalla" : "Tapar suelo",
          bg: "var(--tierra-suave)",
          muestra: "var(--tierra)",
        };
      case "suelo_pelado":
        return {
          dibujoId: "tierra_seca",
          palabra: qu ? "Allpa samay" : "Descanso de la tierra",
          bg: "var(--alerta-critico-suave)",
          muestra: "var(--alerta-critico)",
        };
      case "aporcar":
        return {
          dibujoId: "brote",
          palabra: qu ? "Allpachay (Aporque)" : "Aporque",
          bg: "var(--tierra-suave)",
          muestra: "var(--tierra)",
        };
      case "abonar":
        return {
          dibujoId: "mano_siembra",
          palabra: qu ? "Wanuchay (Abono)" : "Abonar",
          bg: "var(--dorado-suave)",
          muestra: "var(--dorado)",
        };
      case "regar":
      default:
        return {
          dibujoId: "gota_agua",
          palabra: qu ? "Parqoy" : "Regar y cuidar",
          bg: "var(--cielo-suave)",
          muestra: "var(--cielo)",
        };
    }
  };

  const tareaDelMes = (accion) => {
    if (qu) return "";
    switch (accion) {
      case "aporcar":
        return "Cuando la plantita empieza a salir, se le echa tierra alrededor para que el tallo no se rompa, y se abren nuevos surcos para regar.";
      case "abonar":
        return "Es el momento de poner el abono al pie de la planta.";
      case "regar":
        return "Riega por los surcos y revisa que la planta esté sana.";
      case "suelo_pelado":
        return "La tierra descansa. Si puedes, cúbrela con chala o rastrojo para que el viento no se la lleve.";
      default:
        return "";
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
              onClick={() => {
                const months = stageMonthIndices(crop);
                if (!months.length) return;
                setSelectedStage(idx);
                setSelectedIdx(months[0]);
              }}
              aria-pressed={selectedStage === idx}
              className="tarpuy-btn-physical p-4 flex items-center gap-4 text-left cursor-pointer"
              style={{
                backgroundColor: "var(--tarjeta)",
                color: "var(--tinta)",
                outline: selectedStage === idx ? "3px solid var(--tinta)" : "none",
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
                <span lang="es" className="block text-base leading-relaxed break-words" style={{ color: "var(--tinta-suave)" }}>
                  {crop.agronomic_role || "Consulta las tareas de este cultivo en el calendario."}
                </span>
                {selectedStage === idx && (
                  <span className="block text-sm font-extrabold">
                    {qu ? "Akllasqa" : "Paso seleccionado"} · {rangeText}
                  </span>
                )}
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

        {/* Leyenda visual clara (Dibujo + Color + Palabra) */}
        <div
          className="p-3.5 rounded-2xl flex flex-wrap items-center justify-center gap-4 text-base font-extrabold"
          style={{
            backgroundColor: "var(--arena)",
            border: "var(--border-width-medium) solid var(--tinta)",
          }}
        >
          <span className="inline-flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full inline-block"
              style={{ backgroundColor: "var(--hoja)", border: "2px solid var(--tinta)" }}
            />
            <IlustracionTarpuy id="semilla" size={28} />
            <span>{qu ? "Tarpuy (Sembrar)" : "Semilla = Sembrar"}</span>
          </span>

          <span className="inline-flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full inline-block"
              style={{ backgroundColor: "var(--cielo)", border: "2px solid var(--tinta)" }}
            />
            <IlustracionTarpuy id="gota_agua" size={28} />
            <span>{qu ? "Parqoy (Regar)" : "Gota = Regar"}</span>
          </span>

          <span className="inline-flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full inline-block"
              style={{ backgroundColor: "var(--tierra)", border: "2px solid var(--tinta)" }}
            />
            <IlustracionTarpuy id="brote" size={28} />
            <span>{qu ? "Allpachay (Aporque)" : "Brote = Aporque"}</span>
          </span>

          <span className="inline-flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full inline-block"
              style={{ backgroundColor: "var(--dorado)", border: "2px solid var(--tinta)" }}
            />
            <IlustracionTarpuy id="mano_siembra" size={28} />
            <span>{qu ? "Wanuchay (Abonar)" : "Mano = Abonar"}</span>
          </span>

          <span className="inline-flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full inline-block"
              style={{ backgroundColor: "var(--dorado)", border: "2px solid var(--tinta)" }}
            />
            <IlustracionTarpuy id="cosecha" size={28} />
            <span>{qu ? "Puquy (Cosechar)" : "Cosecha = Cosechar"}</span>
          </span>

          <span className="inline-flex items-center gap-2">
            <span
              className="w-5 h-5 rounded-full inline-block"
              style={{ backgroundColor: "var(--ladrillo)", border: "2px solid var(--tinta)" }}
            />
            <span>{qu ? "Kaypi kachkanchik" : "Estamos aquí (mes actual)"}</span>
          </span>
        </div>

        {/* Las 12 casillas grandes de los meses (2 filas de 6 desde sm, 3 filas de 4 en móvil sin cortar texto) */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3.5">
          {cells.map((c, idx) => {
            const estilo = obtenerEstiloAccion(c);
            const isSel = selectedMonths.includes(idx);
            const esMesActual = idx === mesActualIdx;

            return (
              <button
                key={c.m}
                type="button"
                onClick={() => {
                  setSelectedStage(null);
                  setSelectedIdx(idx);
                }}
                aria-pressed={isSel}
                aria-current={esMesActual ? "date" : undefined}
                title={`${c.monthName}: ${c.cropName}`}
                className={`tarpuy-btn-physical p-2.5 sm:p-3.5 flex flex-col items-center justify-between gap-2 text-center cursor-pointer relative ${
                  isSel ? "tarpuy-btn-physical--pressed" : ""
                }`}
                style={{
                  minHeight: "148px",
                  backgroundColor: estilo.bg,
                  color: "var(--tinta)",
                  outline: esMesActual
                    ? "4px solid var(--ladrillo)"
                    : isSel
                    ? "3px solid var(--tinta)"
                    : "none",
                  boxShadow: isSel ? "inset 0 0 0 3px var(--tinta)" : undefined,
                }}
              >
                {/* Marca "Estamos aquí" en --ladrillo para el mes actual */}
                {esMesActual && (
                  <span
                    className="w-full px-1.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide"
                    style={{
                      backgroundColor: "var(--ladrillo)",
                      color: "var(--tarjeta)",
                      border: "1.5px solid var(--tinta)",
                    }}
                  >
                    {qu ? "Kaypi" : "Aquí"}
                  </span>
                )}

                <span className="font-bold text-lg sm:text-xl">{c.monthShort}</span>
                {isSel && <span className="text-xs font-extrabold">✓ {qu ? "Akllasqa" : "Seleccionado"}</span>}

                {/* Dibujo de la acción del mes (Semilla, Gota o Cosecha) */}
                <div
                  className="w-13 h-13 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "var(--tarjeta)",
                  }}
                >
                  <IlustracionTarpuy id={estilo.dibujoId} size={42} />
                </div>

                <div className="space-y-0.5 w-full">
                  <span className="block font-bold text-sm sm:text-base leading-tight break-words">
                    {estilo.palabra}
                  </span>
                  <span
                    className="block text-sm font-normal leading-tight break-words"
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
              {tareaDelMes(activeCell.accionVisual) ? (
                <p className="tarpuy-body" style={{ color: "var(--tinta)" }}>
                  <strong>{obtenerEstiloAccion(activeCell).palabra}:</strong>{" "}
                  {tareaDelMes(activeCell.accionVisual)}
                </p>
              ) : null}
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
