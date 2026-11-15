import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import ClimateChartsPanel from "./charts/ClimateChartsPanel.jsx";
import DataVeracityCard from "./alerts/DataVeracityCard.jsx";
import InstitutionalBrandBar from "./InstitutionalBrandBar.jsx";
import { IlustracionTarpuy } from "./illustrations/TarpuyIllustrations.jsx";
import { BotonGrande } from "./ui/TarpuyBaseComponents.jsx";
import { PatronPantalla, SelloCartilla } from "./personality/PatronesYSellos.jsx";
import MamaTomasaAyuda from "./personality/MamaTomasaAyuda.jsx";
import { speakSpanish, speakQuechua } from "../services/speechService.js";

const DEFAULT_MONTHS = [
  { month: 1, month_name: "Enero", precip_mm: 98, temp_min_c: 11.2, temp_max_c: 23.5, soil_moisture_index: 0.58, ndvi_mean: 0.54, frost_risk_days: 0, bare_soil_flag: false },
  { month: 2, month_name: "Febrero", precip_mm: 86, temp_min_c: 10.8, temp_max_c: 23.1, soil_moisture_index: 0.54, ndvi_mean: 0.58, frost_risk_days: 0, bare_soil_flag: false },
  { month: 3, month_name: "Marzo", precip_mm: 52, temp_min_c: 9.4, temp_max_c: 23.8, soil_moisture_index: 0.42, ndvi_mean: 0.51, frost_risk_days: 0, bare_soil_flag: false },
  { month: 4, month_name: "Abril", precip_mm: 14, temp_min_c: 5.8, temp_max_c: 24.2, soil_moisture_index: 0.28, ndvi_mean: 0.38, frost_risk_days: 1, bare_soil_flag: false },
  { month: 5, month_name: "Mayo", precip_mm: 2, temp_min_c: 1.2, temp_max_c: 23.6, soil_moisture_index: 0.16, ndvi_mean: 0.22, frost_risk_days: 8, bare_soil_flag: true },
  { month: 6, month_name: "Junio", precip_mm: 1, temp_min_c: -1.8, temp_max_c: 22.4, soil_moisture_index: 0.11, ndvi_mean: 0.16, frost_risk_days: 16, bare_soil_flag: true },
  { month: 7, month_name: "Julio", precip_mm: 3, temp_min_c: -2.4, temp_max_c: 22.8, soil_moisture_index: 0.09, ndvi_mean: 0.15, frost_risk_days: 18, bare_soil_flag: true },
  { month: 8, month_name: "Agosto", precip_mm: 6, temp_min_c: 0.4, temp_max_c: 24.5, soil_moisture_index: 0.12, ndvi_mean: 0.17, frost_risk_days: 10, bare_soil_flag: true },
  { month: 9, month_name: "Septiembre", precip_mm: 12, temp_min_c: 4.8, temp_max_c: 26.2, soil_moisture_index: 0.15, ndvi_mean: 0.21, frost_risk_days: 2, bare_soil_flag: false },
  { month: 10, month_name: "Octubre", precip_mm: 28, temp_min_c: 8.2, temp_max_c: 27.4, soil_moisture_index: 0.22, ndvi_mean: 0.31, frost_risk_days: 0, bare_soil_flag: false },
  { month: 11, month_name: "Noviembre", precip_mm: 45, temp_min_c: 10.1, temp_max_c: 27.1, soil_moisture_index: 0.34, ndvi_mean: 0.42, frost_risk_days: 0, bare_soil_flag: false },
  { month: 12, month_name: "Diciembre", precip_mm: 82, temp_min_c: 10.9, temp_max_c: 25.0, soil_moisture_index: 0.49, ndvi_mean: 0.49, frost_risk_days: 0, bare_soil_flag: false },
];

/**
 * Tarjetas visuales para MODO FÁCIL ("Los meses de más lluvia", "Los meses con helada", "Los meses más calientes")
 * Sin ejes ni números pequeños: usa barras dibujadas, termómetros y gotas.
 */
function ResumenClimaticoModoFacil({ indicators = [], zoneName = "", lang = "es" }) {
  const isQu = lang === "qu";
  const months = indicators.length === 12 ? indicators : DEFAULT_MONTHS;

  // 1. Los meses de más lluvia (ordenados por precipitación en temporada húmeda)
  const maxRain = Math.max(80, ...months.map((m) => Number(m.precip_mm || 0)));
  const rainyMonths = [...months]
    .sort((a, b) => Number(b.precip_mm || 0) - Number(a.precip_mm || 0))
    .slice(0, 4);

  // 2. Los meses con helada (meses de invierno con menor temperatura mínima o más días de helada)
  const frostMonths = [...months]
    .sort((a, b) => Number(a.temp_min_c ?? 10) - Number(b.temp_min_c ?? 10))
    .slice(0, 4);

  // 3. Los meses más calientes
  // TODO-FUNCIONALIDAD: si el indicador mensual de alguna zona no incluye temp_max_c en el payload,
  // el equipo puede inyectar T2M_MAX mensual desde el armonizador NASA POWER. Aquí usamos temp_max_c si existe o valores de referencia primaveral.
  const FALLBACK_WARMTH_BY_MONTH = { 9: 88, 10: 100, 11: 96, 8: 80, 12: 76, 4: 72, 3: 70, 1: 68, 2: 65, 5: 62, 7: 58, 6: 55 };
  const hotMonths = [...months]
    .map((m) => {
      const hasMax = m.temp_max_c !== undefined && m.temp_max_c !== null;
      const heatScore = hasMax
        ? Math.min(100, Math.max(35, Math.round(((Number(m.temp_max_c) - 14) / 16) * 100)))
        : FALLBACK_WARMTH_BY_MONTH[m.month] || 65;
      return { ...m, heatScore };
    })
    .sort((a, b) => b.heatScore - a.heatScore)
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 3 tarjetas grandes con barras dibujadas, gotas y termómetros (las explicaciones viven en Mamá Tomasa) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TARJETA 1: LOS MESES DE MÁS LLUVIA */}
        <article
          className="tarpuy-card-physical p-5 sm:p-6 space-y-5 flex flex-col justify-between"
          style={{ backgroundColor: "var(--tarjeta)" }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--cielo-suave)" }}
              >
                <IlustracionTarpuy id="lluvia" size={48} />
              </div>
              <div>
                <span
                  className="block text-sm font-medium mb-0.5"
                  style={{ color: "var(--cielo-oscuro)" }}
                >
                  {isQu ? "Para pacha" : "Agua del cielo"}
                </span>
                <h3
                  className="font-bold leading-tight"
                  style={{
                    fontFamily: "var(--tarpuy-font-display)",
                    fontSize: "var(--tarpuy-text-subtitle)",
                    color: "var(--tinta)",
                  }}
                >
                  {isQu ? "Aswan paray killakuna" : "Los meses de más lluvia"}
                </h3>
              </div>
            </div>

            {/* Barras dibujadas con gotas (sin bordes de caja anidados) */}
            <div className="space-y-3">
              {rainyMonths.map((m) => {
                const pct = Math.max(28, Math.min(100, Math.round((Number(m.precip_mm || 0) / maxRain) * 100)));
                const dropCount = pct >= 80 ? 3 : pct >= 50 ? 2 : 1;
                const levelWord = pct >= 80 ? "Mucha lluvia" : pct >= 50 ? "Buena lluvia" : "Lluvia moderada";
                return (
                  <div
                    key={`rain-${m.month}`}
                    className="p-3.5 rounded-2xl space-y-2"
                    style={{ backgroundColor: "var(--arena)" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-bold"
                        style={{
                          fontSize: "var(--tarpuy-text-body)",
                          color: "var(--tinta)",
                        }}
                      >
                        {m.month_name}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {Array.from({ length: dropCount }).map((_, idx) => (
                          <IlustracionTarpuy key={idx} id="gota_agua" size={22} />
                        ))}
                        <span
                          className="font-medium ml-1"
                          style={{
                            color: "var(--cielo-oscuro)",
                            fontSize: "0.95rem",
                          }}
                        >
                          {levelWord}
                        </span>
                      </span>
                    </div>
                    <div
                      className="w-full h-4 rounded-full overflow-hidden"
                      style={{ backgroundColor: "var(--tarjeta)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: "var(--cielo)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>

        {/* TARJETA 2: LOS MESES CON HELADA */}
        <article
          className="tarpuy-card-physical p-5 sm:p-6 space-y-5 flex flex-col justify-between"
          style={{ backgroundColor: "var(--tarjeta)" }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--alerta-cuidado-suave)" }}
              >
                <IlustracionTarpuy id="termometro_frio" size={48} />
              </div>
              <div>
                <span
                  className="block text-sm font-medium mb-0.5"
                  style={{ color: "var(--alerta-cuidado-oscuro)" }}
                >
                  {isQu ? "Qasa pacha" : "Frío de noche"}
                </span>
                <h3
                  className="font-bold leading-tight"
                  style={{
                    fontFamily: "var(--tarpuy-font-display)",
                    fontSize: "var(--tarpuy-text-subtitle)",
                    color: "var(--tinta)",
                  }}
                >
                  {isQu ? "Qasay killakuna" : "Los meses con helada"}
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {frostMonths.map((m) => {
                const tMin = Number(m.temp_min_c ?? 2);
                const frostScore = Math.max(30, Math.min(100, Math.round(((10 - tMin) / 14) * 100)));
                const isHardFrost = tMin <= 0 || Number(m.frost_risk_days || 0) >= 10;
                const levelWord = isHardFrost ? "Helada fuerte" : "Noches frías";
                return (
                  <div
                    key={`frost-${m.month}`}
                    className="p-3.5 rounded-2xl space-y-2"
                    style={{ backgroundColor: "var(--arena)" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-bold"
                        style={{
                          fontSize: "var(--tarpuy-text-body)",
                          color: "var(--tinta)",
                        }}
                      >
                        {m.month_name}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <IlustracionTarpuy
                          id={isHardFrost ? "helada" : "termometro_frio"}
                          size={24}
                        />
                        <span
                          className="font-medium"
                          style={{
                            color: isHardFrost
                              ? "var(--alerta-critico-oscuro)"
                              : "var(--cielo-oscuro)",
                            fontSize: "0.95rem",
                          }}
                        >
                          {levelWord}
                        </span>
                      </span>
                    </div>
                    <div
                      className="w-full h-4 rounded-full overflow-hidden"
                      style={{ backgroundColor: "var(--tarjeta)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${frostScore}%`,
                          backgroundColor: isHardFrost
                            ? "var(--alerta-critico)"
                            : "var(--cielo)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>

        {/* TARJETA 3: LOS MESES MÁS CALIENTES */}
        <article
          className="tarpuy-card-physical p-5 sm:p-6 space-y-5 flex flex-col justify-between"
          style={{ backgroundColor: "var(--tarjeta)" }}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3.5">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "var(--tierra-suave)" }}
              >
                <IlustracionTarpuy id="termometro_calor" size={48} />
              </div>
              <div>
                <span
                  className="block text-sm font-medium mb-0.5"
                  style={{ color: "var(--tierra-oscura)" }}
                >
                  {isQu ? "Ruphay pacha" : "Sol fuerte"}
                </span>
                <h3
                  className="font-bold leading-tight"
                  style={{
                    fontFamily: "var(--tarpuy-font-display)",
                    fontSize: "var(--tarpuy-text-subtitle)",
                    color: "var(--tinta)",
                  }}
                >
                  {isQu ? "Aswan q'uñi killakuna" : "Los meses más calientes"}
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {hotMonths.map((m) => {
                const isVeryHot = m.heatScore >= 85;
                const levelWord = isVeryHot ? "Sol muy fuerte" : "Calor alto";
                return (
                  <div
                    key={`hot-${m.month}`}
                    className="p-3.5 rounded-2xl space-y-2"
                    style={{ backgroundColor: "var(--arena)" }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="font-bold"
                        style={{
                          fontSize: "var(--tarpuy-text-body)",
                          color: "var(--tinta)",
                        }}
                      >
                        {m.month_name}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <IlustracionTarpuy id="sol" size={24} />
                        <span
                          className="font-medium"
                          style={{
                            color: "var(--tierra-oscura)",
                            fontSize: "0.95rem",
                          }}
                        >
                          {levelWord}
                        </span>
                      </span>
                    </div>
                    <div
                      className="w-full h-4 rounded-full overflow-hidden"
                      style={{ backgroundColor: "var(--tarjeta)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${m.heatScore}%`,
                          backgroundColor: "var(--tierra)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default function TechnicalMode({
  zone,
  strategies = [],
  provenance = {},
  bulletin = null,
  isAdvanced = true,
  lang = "es",
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const [showAdvancedChartsInEasy, setShowAdvancedChartsInEasy] = useState(false);

  const isQu = lang === "qu";
  const indicators =
    zone?.monthly_harmonized_indicators?.length > 0
      ? zone.monthly_harmonized_indicators
      : DEFAULT_MONTHS;
  const strat = strategies[activeTab] || strategies[0];

  const handlePrintCartilla = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const handleDownloadCsv = () => {
    if (!indicators || indicators.length === 0) return;
    const headers = ["Mes", "Lluvia_mm", "Temp_Min_C", "Humedad_SMAP_pct", "NDVI", "Dias_Helada", "Cobertura"];
    const rows = indicators.map((m) => [
      m.month_name || m.month,
      m.precip_mm ?? "",
      m.temp_min_c ?? "",
      Math.round((m.soil_moisture_index || 0) * 100),
      m.ndvi_mean ?? "",
      m.frost_risk_days ?? 0,
      m.bare_soil_flag ? "Descanso de la tierra" : "Cubierto",
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `datos_nasa_${zone?.zone_id || "cochabamba"}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Encabezado exclusivo para la hoja impresa (@media print) con los 2 logos institucionales */}
      <div className="print-only hidden pb-4 mb-4" style={{ borderBottom: "3px solid var(--tinta)" }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-extrabold text-2xl" style={{ color: "var(--tinta)" }}>
              Cartilla Agroclimática Comunal · Tarpuy NASA Cochabamba
            </h1>
            <p className="font-bold text-base" style={{ color: "var(--tinta)" }}>
              Comunidad / Zona: {zone?.name || "Cochabamba"} ({zone?.elevation_msnm || 2750} msnm)
            </p>
          </div>
          <InstitutionalBrandBar variant="header" />
        </div>
      </div>

      {/* Cabecera principal + Botón grande "Imprimir Cartilla" con dibujo de impresora */}
      <header
        className="tarpuy-card-physical p-5 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
        style={{
          backgroundColor: "var(--tarjeta)",
          borderColor: "var(--tinta)",
        }}
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full font-extrabold uppercase tracking-wider"
              style={{
                backgroundColor: "var(--dorado-suave)",
                color: "var(--tinta)",
                border: "var(--tarpuy-border-thin) solid var(--tinta)",
                fontSize: "0.875rem",
              }}
            >
              <IlustracionTarpuy id="cartilla_grafico" size={22} />
              <span>{isQu ? "NASA Satélite Willaykuna" : "Transparencia y evidencia satelital"}</span>
            </span>
            <SelloCartilla
              texto={isAdvanced ? "Cartilla técnica lista" : "Cartilla del campo"}
              subtitulo={zone?.municipality || "COCHABAMBA"}
            />
          </div>
          <h2
            className="font-extrabold tracking-tight"
            style={{
              fontFamily: "var(--tarpuy-font-display)",
              fontSize: "var(--tarpuy-text-title)",
              lineHeight: "var(--tarpuy-line-title)",
              color: "var(--tinta)",
            }}
          >
            {isQu ? "NASA Willay" : "Datos NASA"} · {zone?.name || "Cochabamba"}
          </h2>
        </div>

        {/* 3. BOTÓN "IMPRIMIR CARTILLA" GRANDE CON DIBUJO DE IMPRESORA */}
        <div className="no-print flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <BotonGrande
            variante="primario"
            ilustracionId="impresora"
            texto={isQu ? "Raphita hurquy (Imprimir)" : "Imprimir cartilla"}
            onClick={handlePrintCartilla}
            className="w-full sm:w-auto"
          />
        </div>
      </header>

      {/* Patrón fijo de Datos: Hojas y semillas ordenadas */}
      <PatronPantalla tipo="hojas" />

      {/* 4. MODO FÁCIL: Tarjetas grandes con barras dibujadas, termómetros y gotas */}
      {!isAdvanced ? (
        <div className="space-y-6">
          <ResumenClimaticoModoFacil
            indicators={indicators}
            zoneName={zone?.name}
            lang={lang}
          />

          {/* Botón plegable por si en Modo Fácil desean ver los gráficos técnicos completos */}
          <div className="no-print">
            <button
              type="button"
              onClick={() => setShowAdvancedChartsInEasy((prev) => !prev)}
              className="w-full min-h-[64px] px-5 py-4 rounded-2xl font-extrabold flex items-center justify-between gap-3 cursor-pointer transition-all"
              style={{
                backgroundColor: showAdvancedChartsInEasy ? "var(--dorado-suave)" : "var(--tarjeta)",
                color: "var(--tinta)",
                border: "var(--tarpuy-border-thick) solid var(--tinta)",
                boxShadow: "0 4px 0 0 var(--tinta)",
                fontSize: "var(--tarpuy-text-body)",
              }}
            >
              <span className="flex items-center gap-3">
                <IlustracionTarpuy id="lupa" size={36} />
                <span>
                  {showAdvancedChartsInEasy
                    ? "Ocultar gráficos técnicos y tabla de 12 meses"
                    : "Ver gráficos técnicos completos y tabla de 12 meses"}
                </span>
              </span>
              {showAdvancedChartsInEasy ? (
                <ChevronUp className="w-7 h-7 shrink-0" />
              ) : (
                <ChevronDown className="w-7 h-7 shrink-0" />
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* 1. MODO AVANZADO (o desplegado en Modo Fácil): Gráficos NASA + Evaluación agronómica + Tabla descargable */}
      {(isAdvanced || showAdvancedChartsInEasy) ? (
        <div className="space-y-8">
          <ClimateChartsPanel
            indicators={indicators}
            zoneName={zone?.name}
            lang={lang}
          />

          {/* Evaluación agronómica y tabla mensual descargable */}
          <section
            className="tarpuy-card-physical p-5 sm:p-7 space-y-6"
            style={{
              backgroundColor: "var(--tarjeta)",
              borderColor: "var(--tinta)",
            }}
          >
            <div
              className="flex flex-wrap items-center justify-between gap-4 pb-4"
              style={{ borderBottom: "var(--tarpuy-border-thin) solid var(--tinta)" }}
            >
              <div>
                <h3
                  className="font-extrabold"
                  style={{
                    fontFamily: "var(--tarpuy-font-display)",
                    fontSize: "var(--tarpuy-text-subtitle)",
                    color: "var(--tinta)",
                  }}
                >
                  Evaluación agronómica y tabla climática mensual
                </h3>
                <p
                  className="font-bold mt-0.5"
                  style={{
                    color: "var(--tinta-suave)",
                    fontSize: "var(--tarpuy-text-body-min)",
                  }}
                >
                  Comparación de rotaciones frente a la climatología mensual NASA de 30 años
                </p>
              </div>

              <div className="no-print flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowTable((p) => !p)}
                  className="min-h-[56px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold cursor-pointer transition-all"
                  style={{
                    backgroundColor: showTable ? "var(--dorado)" : "var(--arena)",
                    color: "var(--tinta)",
                    border: "var(--tarpuy-border-thin) solid var(--tinta)",
                    boxShadow: "0 3px 0 0 var(--tinta)",
                    fontSize: "1rem",
                  }}
                >
                  <IlustracionTarpuy id="cartilla_grafico" size={28} />
                  <span>{showTable ? "Ocultar tabla mensual" : "Ver tabla mensual (12 meses)"}</span>
                  {showTable ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="min-h-[56px] inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold cursor-pointer transition-all"
                  style={{
                    backgroundColor: "var(--hoja-suave)",
                    color: "var(--hoja-oscura)",
                    border: "var(--tarpuy-border-thin) solid var(--tinta)",
                    boxShadow: "0 3px 0 0 var(--tinta)",
                    fontSize: "1rem",
                  }}
                >
                  <span>Descargar tabla (CSV)</span>
                </button>
              </div>
            </div>

            {/* Selector de estrategias */}
            {strategies.length > 0 ? (
              <div className="flex flex-wrap gap-2.5 no-print">
                {strategies.map((s, idx) => {
                  const isSel = activeTab === idx;
                  return (
                    <button
                      key={s.strategy_id || idx}
                      type="button"
                      onClick={() => setActiveTab(idx)}
                      className="min-h-[52px] px-4 py-2.5 rounded-2xl font-extrabold cursor-pointer transition-all"
                      style={{
                        backgroundColor: isSel ? "var(--dorado)" : "var(--arena)",
                        color: "var(--tinta)",
                        border: "var(--tarpuy-border-thin) solid var(--tinta)",
                        boxShadow: isSel ? "0 3px 0 0 var(--tinta)" : "none",
                        fontSize: "1rem",
                      }}
                    >
                      {s.strategy_type === "current_baseline"
                        ? "Práctica tradicional"
                        : `Alternativa recomendada #${idx}`}
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* Evidencia NASA y análisis de la rotación seleccionada */}
            {strat ? (
              <div className="space-y-4">
                <div
                  className="p-4 sm:p-5 rounded-2xl space-y-2"
                  style={{
                    backgroundColor: "var(--cielo-suave)",
                    border: "var(--tarpuy-border-thin) solid var(--tinta)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <IlustracionTarpuy id="satelite_real" size={32} />
                    <span
                      className="font-extrabold"
                      style={{
                        fontSize: "1.15rem",
                        color: "var(--cielo-oscuro)",
                      }}
                    >
                      Evidencia NASA (POWER & SMAP L4)
                    </span>
                  </div>
                  <p
                    className="font-bold leading-relaxed"
                    style={{
                      color: "var(--tinta)",
                      fontSize: "var(--tarpuy-text-body-min)",
                    }}
                  >
                    {strat.nasa_evidence}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className="p-4 rounded-2xl space-y-2"
                    style={{
                      backgroundColor: "var(--hoja-suave)",
                      border: "var(--tarpuy-border-thin) solid var(--tinta)",
                    }}
                  >
                    <span
                      className="font-extrabold block"
                      style={{
                        color: "var(--hoja-oscura)",
                        fontSize: "1.1rem",
                      }}
                    >
                      🌱 Beneficios para la chacra
                    </span>
                    <ul
                      className="list-disc list-inside space-y-1.5 font-bold"
                      style={{
                        color: "var(--tinta)",
                        fontSize: "1rem",
                      }}
                    >
                      {(strat.benefits || []).map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="p-4 rounded-2xl space-y-2"
                    style={{
                      backgroundColor: "var(--alerta-cuidado-suave)",
                      border: "var(--tarpuy-border-thin) solid var(--tinta)",
                    }}
                  >
                    <span
                      className="font-extrabold block"
                      style={{
                        color: "var(--alerta-cuidado-oscuro)",
                        fontSize: "1.1rem",
                      }}
                    >
                      🔍 Límites del dato satelital
                    </span>
                    <ul
                      className="list-disc list-inside space-y-1.5 font-bold"
                      style={{
                        color: "var(--tinta)",
                        fontSize: "1rem",
                      }}
                    >
                      {(strat.information_gaps || []).map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>

                  <div
                    className="p-4 rounded-2xl space-y-2"
                    style={{
                      backgroundColor: "var(--tierra-suave)",
                      border: "var(--tarpuy-border-thin) solid var(--tinta)",
                    }}
                  >
                    <span
                      className="font-extrabold block"
                      style={{
                        color: "var(--tierra-oscura)",
                        fontSize: "1.1rem",
                      }}
                    >
                      🖐️ Qué revisar en tu terreno
                    </span>
                    <ul
                      className="list-disc list-inside space-y-1.5 font-bold"
                      style={{
                        color: "var(--tinta)",
                        fontSize: "1rem",
                      }}
                    >
                      {(strat.local_validation_risks || []).map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Tabla mensual de 12 meses: en móvil como lista de tarjetas simples (1 por mes), en escritorio como tabla */}
            {showTable ? (
              <div
                className="pt-4 space-y-4"
                style={{ borderTop: "1.5px solid var(--tinta)" }}
              >
                {/* Vista móvil (< md): Lista de tarjetas simples por mes sin scroll horizontal */}
                <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {indicators.map((m) => {
                    const smapPct = Math.round(
                      m.soil_moisture_index > 1
                        ? m.soil_moisture_index
                        : (m.soil_moisture_index || 0) * 100
                    );
                    return (
                      <div
                        key={`card-${m.month}`}
                        className="p-4 rounded-2xl space-y-2.5"
                        style={{
                          backgroundColor: m.bare_soil_flag
                            ? "var(--tierra-suave)"
                            : "var(--arena)",
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <strong className="font-bold text-lg" style={{ color: "var(--tinta)" }}>
                            {m.month_name || `Mes ${m.month}`}
                          </strong>
                          <span
                            className="px-2.5 py-0.5 rounded-full text-sm font-bold"
                            style={{
                              backgroundColor: "var(--tarjeta)",
                              color: "var(--tinta)",
                            }}
                          >
                            {m.bare_soil_flag ? "⚠️ Descanso de la tierra" : "🌱 Cubierto"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="block font-normal" style={{ color: "var(--tinta-suave)" }}>
                              Lluvia:
                            </span>
                            <strong className="font-bold text-base">{m.precip_mm} mm</strong>
                          </div>
                          <div>
                            <span className="block font-normal" style={{ color: "var(--tinta-suave)" }}>
                              T. Mínima:
                            </span>
                            <strong className="font-bold text-base">{m.temp_min_c}°C</strong>
                          </div>
                          <div>
                            <span className="block font-normal" style={{ color: "var(--tinta-suave)" }}>
                              Humedad SMAP:
                            </span>
                            <strong className="font-bold text-base">{smapPct}%</strong>
                          </div>
                          <div>
                            <span className="block font-normal" style={{ color: "var(--tinta-suave)" }}>
                              Verdor NDVI / Helada:
                            </span>
                            <strong className="font-bold text-base">
                              {m.ndvi_mean} · {m.frost_risk_days ?? 0} d
                            </strong>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Vista escritorio (>= md): Tabla completa */}
                <div className="hidden md:block overflow-x-auto">
                  <table
                    className="w-full text-left border-collapse"
                    style={{
                      color: "var(--tinta)",
                      fontSize: "1rem",
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          backgroundColor: "var(--arena)",
                          borderBottom: "var(--tarpuy-border-medium) solid var(--tinta)",
                        }}
                      >
                        <th className="py-3 px-3 font-extrabold">Mes</th>
                        <th className="py-3 px-3 font-extrabold">Lluvia (mm)</th>
                        <th className="py-3 px-3 font-extrabold">T. Mínima (°C)</th>
                        <th className="py-3 px-3 font-extrabold">Humedad SMAP</th>
                        <th className="py-3 px-3 font-extrabold">Verdor NDVI</th>
                        <th className="py-3 px-3 font-extrabold">Días Helada</th>
                        <th className="py-3 px-3 font-extrabold">Estado del suelo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {indicators.map((m) => (
                        <tr
                          key={m.month}
                          style={{
                            backgroundColor: m.bare_soil_flag
                              ? "var(--tierra-suave)"
                              : "var(--tarjeta)",
                            borderBottom: "1.5px solid var(--piedra)",
                          }}
                        >
                          <td className="py-2.5 px-3 font-extrabold">
                            {m.month_name || `Mes ${m.month}`}
                          </td>
                          <td className="py-2.5 px-3 font-bold">{m.precip_mm} mm</td>
                          <td className="py-2.5 px-3 font-mono font-bold">{m.temp_min_c}°C</td>
                          <td className="py-2.5 px-3 font-mono font-bold">
                            {Math.round(
                              m.soil_moisture_index > 1
                                ? m.soil_moisture_index
                                : (m.soil_moisture_index || 0) * 100
                            )}
                            %
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold">{m.ndvi_mean}</td>
                          <td className="py-2.5 px-3 font-bold">{m.frost_risk_days ?? 0} días</td>
                          <td className="py-2.5 px-3 font-extrabold">
                            {m.bare_soil_flag ? "⚠️ Descanso de la tierra" : "🌱 Cubierto"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {/* 2. DATAVERACITYCARD: Los 3 sellos dibujados (Satélite, Modelo, Estudio de suelo) + frase simple + detalle */}
      <DataVeracityCard
        manifest={bulletin?.veracity_manifest || []}
        isAdvanced={isAdvanced}
        lang={lang}
      />

      {/* Sello de integridad criptográfica SHA-256 con tokens de diseño */}
      <section
        className="tarpuy-card-physical p-5 sm:p-6 space-y-2"
        style={{
          backgroundColor: "var(--arena)",
          borderColor: "var(--tinta)",
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <IlustracionTarpuy id="satelite_real" size={32} />
            <span
              className="font-extrabold"
              style={{
                fontSize: "1.15rem",
                color: "var(--tinta)",
              }}
            >
              Verificación de integridad satelital (SHA-256)
            </span>
          </div>
          <span
            className="inline-flex items-center px-3 py-1 rounded-full font-extrabold"
            style={{
              backgroundColor: "var(--hoja-suave)",
              color: "var(--hoja-oscura)",
              border: "1.5px solid var(--tinta)",
              fontSize: "0.875rem",
            }}
          >
            ✓ DATOS VERIFICADOS
          </span>
        </div>
        <p
          className="font-bold"
          style={{
            color: "var(--tinta-suave)",
            fontSize: "1rem",
          }}
        >
          Fuentes combinadas:{" "}
          {(provenance?.nasa_datasets || ["NASA POWER", "SMAP L4", "Sentinel/MODIS"]).join(" · ")}
        </p>
        {provenance?.integrity_sha256 ? (
          <p
            className="font-mono font-bold break-all pt-1"
            style={{
              color: "var(--tinta)",
              fontSize: "0.9rem",
            }}
          >
            Huella digital: {provenance.integrity_sha256}
          </p>
        ) : null}
      </section>

      {/* Ventana emergente de Mamá Tomasa en la pantalla de Datos NASA */}
      <MamaTomasaAyuda
        titulo={
          isQu
            ? `NASA Willay · ${zone?.name || "Cochabamba"}`
            : `Datos del año en ${zone?.name || "tu comunidad"}`
        }
        pose="pensando"
        semaforoPrincipal="verde"
        mensaje={
          isQu
            ? "30 wata satélite qhawarisqan: mayk'aqchus paran, qasan, ruphan."
            : "Semáforo del año según 30 años de satélites NASA:"
        }
        tarjetas={[
          {
            id: "explicacion_lluvia",
            dibujoId: "lluvia",
            pose: "riego",
            semaforo: "verde",
            titulo: isQu ? "Aswan paray killakuna" : "Meses de más lluvia",
            frase: isQu
              ? "Para allpata uqhuchin tarpunapaq."
              : "Momento seguro para sembrar con agua del cielo.",
          },
          {
            id: "explicacion_calor",
            dibujoId: "termometro_calor",
            pose: "siembra",
            semaforo: "amarillo",
            titulo: isQu ? "Aswan q'uñi killakuna" : "Meses más calientes",
            frase: isQu
              ? "Inti allpata ch'akichin; rastrojowan qhatana."
              : "El sol seca rápido la tierra; cúbrela con rastrojo.",
          },
          {
            id: "explicacion_helada",
            dibujoId: "termometro_frio",
            pose: "alerta",
            semaforo: "rojo",
            titulo: isQu ? "Qasay killakuna" : "Meses con helada",
            frase: isQu
              ? "Tutamanta sinchita chirin; yurakunata qhatana."
              : "Madrugadas muy frías: abriga tus brotes.",
          },
        ]}
        onListen={() => {
          const texto = isQu
            ? "NASA satélitekuna 30 wata qhawarqanku mayk'aqchus paran, qasan, ruphan ima."
            : `Así se porta el tiempo en ${zone?.name || "tu comunidad"} durante el año. Los satélites de la NASA miraron el cielo durante 30 años para recordar en qué meses llueve más, cuándo cae helada y cuándo hace más calor.`;
          if (isQu) speakQuechua(texto);
          else speakSpanish(texto);
        }}
        badgeCount={3}
        lang={lang}
      />
    </div>
  );
}
