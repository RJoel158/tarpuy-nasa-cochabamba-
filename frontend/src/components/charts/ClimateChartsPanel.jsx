import React, { useState } from "react";
import { IlustracionTarpuy } from "../illustrations/TarpuyIllustrations.jsx";

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const MONTH_FULL_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

export default function ClimateChartsPanel({ indicators = [], zoneName = "", lang = "es" }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const isQu = lang === "qu";

  const data =
    indicators.length === 12
      ? indicators
      : Array.from({ length: 12 }, (_, i) => ({
          month: i + 1,
          month_name: MONTH_FULL_NAMES[i],
          precip_mm: [98, 86, 52, 14, 2, 1, 3, 6, 12, 28, 45, 82][i],
          temp_min_c: [11.2, 10.8, 9.4, 5.8, 1.2, -1.8, -2.4, 0.4, 4.8, 8.2, 10.1, 10.9][i],
          soil_moisture_index: [0.58, 0.54, 0.42, 0.28, 0.16, 0.11, 0.09, 0.12, 0.15, 0.22, 0.34, 0.49][i],
          ndvi_mean: [0.54, 0.58, 0.51, 0.38, 0.22, 0.16, 0.15, 0.17, 0.21, 0.31, 0.42, 0.49][i],
          bare_soil_flag: [false, false, false, false, true, true, true, true, false, false, false, false][i],
        }));

  const active = data[selectedIdx] || data[0];
  const maxPrecip = Math.max(100, ...data.map((d) => d.precip_mm || 0));
  const tMin = -5;
  const tMax = 20;
  const zeroY = 114 - ((0 - tMin) / (tMax - tMin)) * 88;

  const tPoints = data
    .map((d, i) => `${28 + i * 24.5},${114 - (((d.temp_min_c || 0) - tMin) / (tMax - tMin)) * 88}`)
    .join(" ");
  const ndviPoints = data
    .map((d, i) => `${28 + i * 24.5},${114 - (d.ndvi_mean || 0) * 88}`)
    .join(" ");

  const activeSoilPct = Math.round(
    active.soil_moisture_index > 1 ? active.soil_moisture_index : (active.soil_moisture_index || 0) * 100
  );

  return (
    <section
      className="tarpuy-card-physical overflow-hidden p-5 sm:p-7 space-y-6"
      style={{
        backgroundColor: "var(--tarjeta)",
        borderColor: "var(--tinta)",
      }}
      aria-label="Climatología histórica NASA de 30 años"
    >
      {/* Cabecera del panel de gráficos */}
      <div
        className="flex flex-wrap items-center justify-between gap-4 pb-4"
        style={{ borderBottom: "var(--tarpuy-border-thin) solid var(--tinta)" }}
      >
        <div className="flex items-center gap-3.5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              backgroundColor: "var(--cielo-suave)",
              border: "var(--tarpuy-border-thin) solid var(--tinta)",
            }}
          >
            <IlustracionTarpuy id="satelite_real" size={44} />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className="font-extrabold"
                style={{
                  fontFamily: "var(--tarpuy-font-display)",
                  fontSize: "var(--tarpuy-text-subtitle)",
                  color: "var(--tinta)",
                }}
              >
                {isQu
                  ? "30 wata NASA pacha yuyariy"
                  : "Climatología Histórica NASA (30 años)"}
              </h3>
              {zoneName ? (
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full font-extrabold"
                  style={{
                    backgroundColor: "var(--dorado-suave)",
                    color: "var(--tinta)",
                    border: "var(--tarpuy-border-thin) solid var(--tinta)",
                    fontSize: "0.95rem",
                  }}
                >
                  {zoneName}
                </span>
              ) : null}
            </div>
            <p
              className="font-bold mt-0.5"
              style={{
                color: "var(--tinta-suave)",
                fontSize: "var(--tarpuy-text-body-min)",
              }}
            >
              NASA POWER (serie de 30 años) · SMAP L4 Humedad Radicular · Sentinel/MODIS NDVI
            </p>
          </div>
        </div>
      </div>

      {/* Dos gráficos con título en lenguaje claro + subtítulo técnico */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico A: Climograma NASA POWER */}
        <div
          className="rounded-2xl p-4 sm:p-5 space-y-3"
          style={{
            backgroundColor: "var(--arena)",
            border: "var(--tarpuy-border-thin) solid var(--tinta)",
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <IlustracionTarpuy id="lluvia" size={34} className="shrink-0" />
              <h4
                className="font-extrabold leading-snug"
                style={{
                  fontFamily: "var(--tarpuy-font-display)",
                  fontSize: "1.35rem",
                  color: "var(--tinta)",
                }}
              >
                {isQu
                  ? "¿Mayk'aqtaq paran, mayk'aqtaq qasan?"
                  : "¿Cuándo llueve en el año?"}
              </h4>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span
                className="font-extrabold"
                style={{
                  color: "var(--tinta-suave)",
                  fontSize: "0.95rem",
                }}
              >
                Nombre técnico: Climograma NASA POWER — Lluvia (mm) + T. Mín (°C)
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-extrabold"
                style={{
                  backgroundColor: "var(--alerta-critico-suave)",
                  color: "var(--alerta-critico-oscuro)",
                  border: "1.5px solid var(--tinta)",
                  fontSize: "0.85rem",
                }}
              >
                --- Línea 0°C (Helada)
              </span>
            </div>
          </div>

          {/* Leyenda de colores del Gráfico A */}
          <div
            className="flex flex-wrap items-center gap-4 px-3 py-2 rounded-xl"
            style={{
              backgroundColor: "var(--tarjeta)",
              border: "1.5px solid var(--tinta)",
              fontSize: "0.95rem",
              color: "var(--tinta)",
            }}
          >
            <span className="inline-flex items-center gap-2 font-extrabold">
              <span
                className="w-4 h-4 rounded-sm inline-block"
                style={{
                  backgroundColor: "var(--grafico-lluvia)",
                  border: "1.5px solid var(--tinta)",
                }}
              />
              Barras: Lluvia mensual (mm)
            </span>
            <span className="inline-flex items-center gap-2 font-extrabold">
              <span
                className="w-5 h-1.5 rounded-full inline-block"
                style={{ backgroundColor: "var(--grafico-helada)" }}
              />
              Línea: Frío de madrugada (°C)
            </span>
          </div>

          <svg
            viewBox="0 0 330 145"
            className="w-full h-48 rounded-xl p-1"
            style={{
              backgroundColor: "var(--tarjeta)",
              border: "var(--tarpuy-border-thin) solid var(--tinta)",
            }}
            role="img"
            aria-label="Gráfico mensual de lluvia y temperatura mínima"
          >
            {/* Línea de referencia de helada 0°C */}
            <line
              x1="18"
              y1={zeroY}
              x2="314"
              y2={zeroY}
              stroke="var(--grafico-helada)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            {data.map((d, i) => {
              const x = 28 + i * 24.5;
              const h = ((d.precip_mm || 0) / maxPrecip) * 88;
              const isSelected = selectedIdx === i;
              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onClick={() => setSelectedIdx(i)}
                >
                  {/* Fondo de selección del mes */}
                  <rect
                    x={x - 11}
                    y="14"
                    width="22"
                    height="102"
                    fill={isSelected ? "var(--dorado-suave)" : "transparent"}
                    stroke={isSelected ? "var(--tinta)" : "transparent"}
                    strokeWidth="1.5"
                    rx="4"
                  />
                  {/* Barra de lluvia en --grafico-lluvia (--cielo) */}
                  <rect
                    x={x - 7}
                    y={114 - h}
                    width="14"
                    height={Math.max(3, h)}
                    fill="var(--grafico-lluvia)"
                    stroke="var(--tinta)"
                    strokeWidth="1.5"
                    rx="3"
                  />
                  {/* Etiqueta del mes con mayor contraste */}
                  <text
                    x={x}
                    y="133"
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="var(--tinta)"
                    fontWeight={isSelected ? "900" : "700"}
                  >
                    {MONTH_NAMES[i]}
                  </text>
                </g>
              );
            })}
            {/* Curva de temperatura mínima */}
            <polyline
              points={tPoints}
              fill="none"
              stroke="var(--grafico-helada)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {data.map((d, i) => {
              const x = 28 + i * 24.5;
              const y = 114 - (((d.temp_min_c || 0) - tMin) / (tMax - tMin)) * 88;
              return (
                <circle
                  key={`pt-${i}`}
                  cx={x}
                  cy={y}
                  r={selectedIdx === i ? "4.5" : "3"}
                  fill={d.temp_min_c <= 0 ? "var(--grafico-helada)" : "var(--tarjeta)"}
                  stroke="var(--tinta)"
                  strokeWidth="1.8"
                  onClick={() => setSelectedIdx(i)}
                  className="cursor-pointer"
                />
              );
            })}
          </svg>
        </div>

        {/* Gráfico B: SMAP Humedad vs NDVI Cobertura */}
        <div
          className="rounded-2xl p-4 sm:p-5 space-y-3"
          style={{
            backgroundColor: "var(--arena)",
            border: "var(--tarpuy-border-thin) solid var(--tinta)",
          }}
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <IlustracionTarpuy id="tierra_humeda" size={34} className="shrink-0" />
              <h4
                className="font-extrabold leading-snug"
                style={{
                  fontFamily: "var(--tarpuy-font-display)",
                  fontSize: "1.35rem",
                  color: "var(--tinta)",
                }}
              >
                {isQu
                  ? "¿Mayk'aqtaq allpapi yaku, q'omer yura kan?"
                  : "¿Cuándo tiene agua y plantas la tierra?"}
              </h4>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span
                className="font-extrabold"
                style={{
                  color: "var(--tinta-suave)",
                  fontSize: "0.95rem",
                }}
              >
                Nombre técnico: SMAP Humedad Radicular + NDVI Cobertura
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-extrabold"
                style={{
                  backgroundColor: "var(--tierra-suave)",
                  color: "var(--tierra-oscura)",
                  border: "1.5px solid var(--tinta)",
                  fontSize: "0.85rem",
                }}
              >
                Franja: Descanso de la tierra
              </span>
            </div>
          </div>

          {/* Leyenda de colores del Gráfico B */}
          <div
            className="flex flex-wrap items-center gap-4 px-3 py-2 rounded-xl"
            style={{
              backgroundColor: "var(--tarjeta)",
              border: "1.5px solid var(--tinta)",
              fontSize: "0.95rem",
              color: "var(--tinta)",
            }}
          >
            <span className="inline-flex items-center gap-2 font-extrabold">
              <span
                className="w-4 h-4 rounded-sm inline-block"
                style={{
                  backgroundColor: "var(--cielo)",
                  border: "1.5px solid var(--tinta)",
                }}
              />
              Barras: Humedad en suelo (SMAP)
            </span>
            <span className="inline-flex items-center gap-2 font-extrabold">
              <span
                className="w-5 h-1.5 rounded-full inline-block"
                style={{ backgroundColor: "var(--grafico-et0)" }}
              />
              Línea: Verdor de plantas (NDVI)
            </span>
          </div>

          <svg
            viewBox="0 0 330 145"
            className="w-full h-48 rounded-xl p-1"
            style={{
              backgroundColor: "var(--tarjeta)",
              border: "var(--tarpuy-border-thin) solid var(--tinta)",
            }}
            role="img"
            aria-label="Gráfico mensual de humedad en tierra SMAP y cobertura vegetal NDVI"
          >
            {data.map((d, i) => {
              const x = 28 + i * 24.5;
              const val =
                d.soil_moisture_index > 1
                  ? d.soil_moisture_index / 100
                  : d.soil_moisture_index || 0;
              const h = val * 88;
              const isSelected = selectedIdx === i;
              return (
                <g
                  key={i}
                  className="cursor-pointer"
                  onClick={() => setSelectedIdx(i)}
                >
                  {/* Franja de suelo desnudo */}
                  {d.bare_soil_flag ? (
                    <rect
                      x={x - 11}
                      y="16"
                      width="22"
                      height="98"
                      fill="var(--tierra-suave)"
                      rx="3"
                    />
                  ) : null}
                  {/* Resaltado del mes activo */}
                  <rect
                    x={x - 11}
                    y="14"
                    width="22"
                    height="102"
                    fill={isSelected ? "var(--dorado-suave)" : "transparent"}
                    stroke={isSelected ? "var(--tinta)" : "transparent"}
                    strokeWidth="1.5"
                    rx="4"
                  />
                  {/* Barra SMAP en --cielo */}
                  <rect
                    x={x - 6}
                    y={114 - h}
                    width="12"
                    height={Math.max(3, h)}
                    fill="var(--cielo)"
                    stroke="var(--tinta)"
                    strokeWidth="1.5"
                    rx="3"
                  />
                  {/* Etiqueta del mes */}
                  <text
                    x={x}
                    y="133"
                    textAnchor="middle"
                    fontSize="10.5"
                    fill="var(--tinta)"
                    fontWeight={isSelected ? "900" : "700"}
                  >
                    {MONTH_NAMES[i]}
                  </text>
                </g>
              );
            })}
            {/* Curva NDVI en --grafico-et0 (--hoja) */}
            <polyline
              points={ndviPoints}
              fill="none"
              stroke="var(--grafico-et0)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {data.map((d, i) => {
              const x = 28 + i * 24.5;
              const y = 114 - (d.ndvi_mean || 0) * 88;
              return (
                <circle
                  key={`ndvi-${i}`}
                  cx={x}
                  cy={y}
                  r={selectedIdx === i ? "4.5" : "3"}
                  fill="var(--hoja)"
                  stroke="var(--tinta)"
                  strokeWidth="1.8"
                  onClick={() => setSelectedIdx(i)}
                  className="cursor-pointer"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {/* Botonera táctil de meses para elegir sin esfuerzo */}
      <div className="space-y-2 no-print">
        <p
          className="font-extrabold"
          style={{
            color: "var(--tinta-suave)",
            fontSize: "var(--tarpuy-text-body-min)",
          }}
        >
          {isQu
            ? "Killata ñit'iy sut'inta qhawanapaq:"
            : "Toca un mes en el gráfico o en estos botones para inspeccionar sus datos:"}
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
          {MONTH_NAMES.map((mName, idx) => {
            const isSel = selectedIdx === idx;
            return (
              <button
                key={mName}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className="min-h-[48px] px-2 py-2 rounded-xl font-extrabold cursor-pointer transition-all"
                style={{
                  backgroundColor: isSel ? "var(--dorado)" : "var(--arena)",
                  color: "var(--tinta)",
                  border: "var(--tarpuy-border-thin) solid var(--tinta)",
                  boxShadow: isSel ? "0 3px 0 0 var(--tinta)" : "none",
                  fontSize: "1rem",
                }}
              >
                {mName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inspector del mes seleccionado con letras grandes y dibujos (sin bordes anidados) */}
      <div
        className="rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
        style={{ backgroundColor: "var(--arena)" }}
      >
        <div className="flex items-center gap-3">
          <span
            className="font-bold"
            style={{
              fontFamily: "var(--tarpuy-font-display)",
              fontSize: "var(--tarpuy-text-subtitle)",
              color: "var(--tinta)",
            }}
          >
            {active.month_name || MONTH_FULL_NAMES[selectedIdx]}
          </span>
          <span
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-bold"
            style={{
              backgroundColor: active.bare_soil_flag
                ? "var(--alerta-cuidado-suave)"
                : "var(--hoja-suave)",
              color: active.bare_soil_flag
                ? "var(--alerta-cuidado-oscuro)"
                : "var(--hoja-oscura)",
              fontSize: "0.95rem",
            }}
          >
            {active.bare_soil_flag ? "⚠️ Descanso de la tierra" : "🌱 Cobertura Activa"}
          </span>
        </div>

        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
          style={{ fontSize: "var(--tarpuy-text-body-min)" }}
        >
          <div
            className="px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
            style={{ backgroundColor: "var(--tarjeta)" }}
          >
            <IlustracionTarpuy id="gota_agua" size={28} />
            <div>
              <span className="block text-sm font-normal" style={{ color: "var(--tinta-suave)" }}>
                Lluvia
              </span>
              <strong className="font-bold" style={{ color: "var(--cielo-oscuro)" }}>
                {active.precip_mm} mm
              </strong>
            </div>
          </div>

          <div
            className="px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
            style={{ backgroundColor: "var(--tarjeta)" }}
          >
            <IlustracionTarpuy
              id={active.temp_min_c <= 2 ? "termometro_frio" : "termometro_calor"}
              size={28}
            />
            <div>
              <span className="block text-sm font-normal" style={{ color: "var(--tinta-suave)" }}>
                T. Mínima
              </span>
              <strong
                className="font-bold"
                style={{
                  color:
                    active.temp_min_c <= 0
                      ? "var(--alerta-critico-oscuro)"
                      : "var(--tinta)",
                }}
              >
                {active.temp_min_c} °C
              </strong>
            </div>
          </div>

          <div
            className="px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
            style={{ backgroundColor: "var(--tarjeta)" }}
          >
            <IlustracionTarpuy id="tierra_humeda" size={28} />
            <div>
              <span className="block text-sm font-normal" style={{ color: "var(--tinta-suave)" }}>
                SMAP Humedad
              </span>
              <strong className="font-bold" style={{ color: "var(--cielo-oscuro)" }}>
                {activeSoilPct}%
              </strong>
            </div>
          </div>

          <div
            className="px-3.5 py-2.5 rounded-xl flex items-center gap-2.5"
            style={{ backgroundColor: "var(--tarjeta)" }}
          >
            <IlustracionTarpuy id="planta_crecida" size={28} />
            <div>
              <span className="block text-sm font-normal" style={{ color: "var(--tinta-suave)" }}>
                NDVI Verdor
              </span>
              <strong className="font-bold" style={{ color: "var(--hoja-oscura)" }}>
                {active.ndvi_mean}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
