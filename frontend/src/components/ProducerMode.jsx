import React, { useState } from "react";
import { Printer, Loader2, LocateFixed, MapPin, Award, Sprout, AlertTriangle } from "lucide-react";
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
  isCalculating = false,
  onDetectGps,
  onOpenMap,
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onDetectGps}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition cursor-pointer"
          >
            <LocateFixed className="w-3.5 h-3.5" />
            <span>Mi GPS</span>
          </button>
          <button
            type="button"
            onClick={onOpenMap}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-[#0B2545] border border-slate-300 text-xs font-bold transition cursor-pointer"
          >
            <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>Mapa</span>
          </button>
          <a
            href={`/api/poster/${currentZoneId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition shrink-0"
          >
            <Printer className="w-3.5 h-3.5 text-amber-700" />
            <span>Cartilla</span>
          </a>
        </div>
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

      {/* Single-Option Tab Viewer / Process Indicator */}
      {isCalculating ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center gap-2 text-center">
          <Loader2 className="w-6 h-6 text-[#0284C7] animate-spin" />
          <p className="text-sm font-bold text-[#0B2545]">Calculando mejor siembra...</p>
        </div>
      ) : ordered.length > 0 && activeStrategy ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {ordered.map((s, idx) => {
              const TabIcon = s.strategy_type === "current_baseline" ? AlertTriangle : idx === 0 ? Award : Sprout;
              return (
                <button
                  key={s.strategy_id || idx}
                  type="button"
                  onClick={() => setSelectedIdx(idx)}
                  className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold border text-left transition cursor-pointer inline-flex items-center gap-2 ${
                    selectedIdx === idx
                      ? s.strategy_type === "current_baseline"
                        ? "bg-amber-600 text-white border-amber-700"
                        : "bg-[#0B2545] text-white border-[#081B33]"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <TabIcon className="w-4 h-4 shrink-0" />
                  <span>{tabLabel(s, idx)}</span>
                </button>
              );
            })}
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
