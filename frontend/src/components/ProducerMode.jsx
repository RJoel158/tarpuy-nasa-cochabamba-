import React, { useState } from "react";
import { Printer } from "lucide-react";
import PrioritySelectorGrid from "../features/producer/PrioritySelectorGrid.jsx";
import RotationCard from "../features/producer/RotationCard.jsx";

export default function ProducerMode({
  zone,
  activeZoneId,
  crops = [],
  cropId,
  onChangeCrop,
  priorities = [],
  onChangePriorities,
  irrigation,
  onChangeIrrigation,
  equipment,
  onChangeEquipment,
  strategies = [],
  onSpeak,
  activeAudioKey,
}) {
  const currentZoneId = activeZoneId || zone?.zone_id || "punata_valle_alto";
  const indicators = zone?.monthly_harmonized_indicators || [];

  // Reorder so best adaptive options come first in tabs, baseline is third for clear comparison
  const ordered = [
    ...strategies.filter((s) => s.strategy_type !== "current_baseline"),
    ...strategies.filter((s) => s.strategy_type === "current_baseline"),
  ];
  const [selectedIdx, setSelectedIdx] = useState(0);
  const activeStrategy = ordered[selectedIdx] || ordered[0];

  const tabLabel = (s, idx) => {
    if (s.strategy_type === "current_baseline") return "3. Dejar tierra pelada (riesgo)";
    return idx === 0 ? "1. Mejor opción" : "2. Segunda opción";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0284C7]">Plan de rotación · {zone?.name || currentZoneId}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] tracking-tight">¿Qué conviene sembrar?</h2>
        </div>

        <a
          href={`/api/poster/${currentZoneId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition shrink-0"
        >
          <Printer className="w-4 h-4 text-amber-700" />
          <span>Cartilla para imprimir</span>
        </a>
      </div>

      {/* 2-Step Simple Form */}
      <PrioritySelectorGrid
        crops={crops}
        cropId={cropId}
        onChangeCrop={onChangeCrop}
        priorities={priorities}
        onChangePriorities={onChangePriorities}
        irrigation={irrigation}
        onChangeIrrigation={onChangeIrrigation}
        equipment={equipment}
        onChangeEquipment={onChangeEquipment}
      />

      {/* Single-Option Tab Viewer */}
      {ordered.length > 0 && activeStrategy ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ordered.map((s, idx) => (
              <button
                key={s.strategy_id || idx}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold border text-left transition cursor-pointer ${
                  selectedIdx === idx
                    ? s.strategy_type === "current_baseline"
                      ? "bg-amber-600 text-white border-amber-700"
                      : "bg-[#0B2545] text-white border-[#081B33]"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {tabLabel(s, idx)}
              </button>
            ))}
          </div>

          <RotationCard
            strategy={activeStrategy}
            index={selectedIdx + 1}
            indicators={indicators}
            onSpeak={onSpeak}
            activeAudioKey={activeAudioKey}
          />
        </div>
      ) : null}
    </div>
  );
}
