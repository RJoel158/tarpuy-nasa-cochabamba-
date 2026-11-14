import React from "react";
import { Volume2, ArrowRight } from "lucide-react";
import { Card, Badge, SemanticMeter } from "../../components/ui/Primitives.jsx";
import CropCalendarBar from "./CropCalendarBar.jsx";

export default function RotationCard({
  strategy = {},
  index = 1,
  indicators = [],
  onSpeak,
  activeAudioKey,
}) {
  const isBase = strategy.strategy_type === "current_baseline";
  const scorePct = Math.round((strategy.priority_alignment_score || 0.45) * 100);
  const qKey = `${strategy.strategy_id || index}_qu`;
  const esKey = `${strategy.strategy_id || index}_es`;

  return (
    <Card className={`p-4 sm:p-5 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md ${
      isBase ? "border-amber-300 bg-amber-50/10" : "border-stone-200"
    }`}>
      <div className="space-y-3.5">
        {/* Top Header Badge & Affinity */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2.5">
          <Badge variant={isBase ? "danger" : "soil"}>
            {isBase ? "Tu Siembra Actual — Cuidado" : `Mejor Opción #${index - 1}`}
          </Badge>
          <div className="flex items-center gap-2">
            <div className="w-16 bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200">
              <div
                className={`h-full ${isBase ? "bg-amber-500" : "bg-emerald-600"}`}
                style={{ width: `${scorePct}%` }}
              />
            </div>
            <span className="text-xs font-bold text-stone-700">{scorePct}% ideal para tu tierra</span>
          </div>
        </div>

        {/* Titles */}
        <div>
          <h4 className="text-base font-bold text-stone-900 leading-snug">
            {strategy.title_es}
          </h4>
          <p className="text-xs italic text-emerald-800 font-medium mt-0.5">
            {strategy.title_qu}
          </p>
        </div>

        {/* Crop Sequence Flow */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
            Qué sembrar paso a paso:
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {(strategy.crop_sequence || []).map((crop, cIdx) => (
              <React.Fragment key={cIdx}>
                <span className="px-2.5 py-1 bg-stone-100 text-stone-800 rounded-lg text-xs font-semibold border border-stone-200/80">
                  {crop.crop_name}
                </span>
                {cIdx < (strategy.crop_sequence || []).length - 1 && (
                  <ArrowRight className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 12-Month Calendar Bar */}
        <CropCalendarBar cropSequence={strategy.crop_sequence} indicators={indicators} />

        {/* Plain Language Summary Box */}
        <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/90 text-xs space-y-1.5 text-stone-700">
          <p className="leading-relaxed">
            <strong className="text-stone-900">Resumen: </strong>
            {strategy.spanish_summary}
          </p>
          <p className="italic text-emerald-950 font-serif leading-relaxed">
            "{strategy.quechua_summary}"
          </p>
        </div>

        {/* 4 Semantic Meters */}
        <div className="space-y-2 pt-1 border-t border-stone-100">
          <SemanticMeter label="Cuidado del Agua" status={strategy.visual_traffic_light?.water || "yellow"} />
          <SemanticMeter label="Fuerza de la Tierra" status={strategy.visual_traffic_light?.soil || "yellow"} />
          <SemanticMeter label="Defensa contra Helada" status={strategy.visual_traffic_light?.frost || "yellow"} />
          <SemanticMeter label="Freno a la Lluvia / Viento" status={strategy.visual_traffic_light?.erosion || "yellow"} />
        </div>
      </div>

      {/* Audio Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-100">
        <button
          type="button"
          onClick={() => onSpeak(strategy.quechua_summary, "qu", qKey, `strat_${strategy.strategy_id}`)}
          className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeAudioKey === qKey
              ? "bg-emerald-700 text-white animate-pulse"
              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-200"
          }`}
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>Escuchar en Qhichwa</span>
        </button>

        <button
          type="button"
          onClick={() => onSpeak(strategy.spanish_summary, "es", esKey)}
          className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
            activeAudioKey === esKey
              ? "bg-sky-700 text-white animate-pulse"
              : "bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300"
          }`}
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>Escuchar en Castellano</span>
        </button>
      </div>
    </Card>
  );
}
