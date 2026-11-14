import React from "react";

const MONTH_LETTERS = ["E", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

function resolveMonthState(monthIndex, cropSequence, indicators) {
  const m = monthIndex + 1;
  const indicator = indicators.find((ind) => ind.month === m) || indicators[monthIndex];
  const isBareIndicator = Boolean(indicator?.bare_soil_flag);

  const matchedCrop = (cropSequence || []).find((c) => {
    if (!c.start_month || !c.end_month) return false;
    if (c.start_month <= c.end_month) {
      return m >= c.start_month && m <= c.end_month;
    }
    return m >= c.start_month || m <= c.end_month;
  });

  if (matchedCrop) {
    if (matchedCrop.crop_id === "bare_soil_fallow" || isBareIndicator) {
      return {
        bg: "bg-rose-500",
        label: matchedCrop.crop_name || "Suelo Desnudo",
        category: "bare",
      };
    }
    const isCoverOrLegume = /cobertura|legum|vicia|alfalfa|tarwi|arveja|haba|fijad/i.test(
      `${matchedCrop.crop_id} ${matchedCrop.crop_name} ${matchedCrop.agronomic_role || ""}`
    );
    if (isCoverOrLegume) {
      return {
        bg: "bg-sky-500",
        label: matchedCrop.crop_name,
        category: "cover",
      };
    }
    return {
      bg: "bg-emerald-500",
      label: matchedCrop.crop_name,
      category: "main",
    };
  }

  if (isBareIndicator) {
    return {
      bg: "bg-rose-500",
      label: "Suelo Descubierto (Alerta NASA)",
      category: "bare",
    };
  }

  return {
    bg: "bg-stone-200",
    label: "Descanso / Fallow",
    category: "idle",
  };
}

export default function CropCalendarBar({ cropSequence = [], indicators = [] }) {
  return (
    <div className="w-full space-y-2 py-1">
      <div className="flex items-center justify-between text-[11px] font-semibold text-stone-600">
        <span>Calendario Anual de Cobertura de Suelo</span>
        <span className="text-[10px] text-stone-400 font-mono">12 meses</span>
      </div>

      <div className="grid grid-cols-12 gap-1 sm:gap-1.5">
        {MONTH_LETTERS.map((letter, idx) => {
          const state = resolveMonthState(idx, cropSequence, indicators);
          const fullName = MONTH_NAMES[idx];

          return (
            <div
              key={idx}
              className="flex flex-col items-center gap-1 group"
              title={`${fullName}: ${state.label}`}
            >
              <span className="text-[10px] font-bold text-stone-500">
                {letter}
              </span>
              <div
                className={`w-full h-6 rounded-md ${state.bg} transition-transform group-hover:scale-105 shadow-xs flex items-center justify-center`}
              >
                <span className="sr-only">
                  {fullName} - {state.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-1 text-[11px] text-stone-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>Cultivo principal</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shrink-0" />
          <span>Cobertura / Leguminosa</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
          <span>Suelo descubierto</span>
        </div>
      </div>
    </div>
  );
}
