import React from "react";
import { Volume2 } from "lucide-react";
import CropCalendarBar from "./CropCalendarBar.jsx";
import { CropIllustration, CheckIllustration } from "./FarmPictograms.jsx";

const PLAIN_TITLES = {
  punata_strat_baseline: "Seguir solo con maíz y dejar la tierra pelada",
  punata_strat_cover_avena_vicia: "Maíz y luego Avena con Vicia para tapar la tierra",
  punata_strat_legume_diversified: "Alfalfa 3 años, luego Papa Huaycha y Maíz",
  tapacari_strat_baseline: "Sembrar solo papa y dejar la ladera vacía",
  tapacari_strat_tarwi_papa_contour: "Tarwi en surcos de contorno, Papa y Cebada",
  tapacari_strat_quinua_haba_intercrop: "Rotar Haba, Quinua y Avena para animales",
  mizque_strat_baseline: "Maíz y Cebolla dejando la tierra pelada al sol",
  mizque_strat_drought_cover_mulch: "Maíz tapado con Avena-Vicia y Haba",
  mizque_strat_agroforestry_alfalfa_grain: "Franjas de Alfalfa con Quinua y Maíz",
};

const LIGHT_LABELS = {
  green: { pill: "bg-emerald-100 text-emerald-800", word: "Bien" },
  yellow: { pill: "bg-amber-100 text-amber-900", word: "Cuidado" },
  red: { pill: "bg-rose-100 text-rose-800", word: "Riesgo" },
};

function firstSentence(text = "") {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const first = clean.split(/(?<=[.!?])\s+/)[0] || clean;
  return first.length > 140 ? `${first.slice(0, 137).trim()}...` : first;
}

export default function RotationCard({ strategy = {}, index = 1, indicators = [], onSpeak, activeAudioKey, isAdvanced = false }) {
  const isBase = strategy.strategy_type === "current_baseline";
  const scorePct = Math.round((strategy.priority_alignment_score || 0.45) * 100);
  const title = PLAIN_TITLES[strategy.strategy_id] || strategy.title_es;
  const qKey = `${strategy.strategy_id || index}_qu`;
  const esKey = `${strategy.strategy_id || index}_es`;
  const tl = strategy.visual_traffic_light || {};

  const checks = [
    { key: "water", name: "Agua", val: tl.water || "yellow" },
    { key: "soil", name: "Tierra viva", val: tl.soil || "yellow" },
    { key: "frost", name: "Helada", val: tl.frost || "yellow" },
    { key: "erosion", name: "Lluvia/Viento", val: tl.erosion || "yellow" },
  ];

  return (
    <div className={`bg-white rounded-xl border p-5 sm:p-6 space-y-5 ${isBase ? "border-amber-400" : "border-stone-200"}`}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${isBase ? "text-amber-700" : "text-[#0284C7]"}`}>
            {isBase
              ? "Práctica actual · Riesgo para el suelo"
              : isAdvanced
              ? `Opción recomendada · ${scorePct}% adecuación algorítmica`
              : "Recomendado para tu chacra"}
          </span>
          <h3 className="text-xl font-bold text-[#0B2545] mt-1">{title}</h3>
        </div>
      </div>

      {/* Illustrated Crop Sequence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {(strategy.crop_sequence || []).map((crop, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/70 min-w-0"
          >
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
              <CropIllustration name={crop.crop_name} className="w-10 h-10" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7] block">
                Paso {idx + 1}
              </span>
              <span className="text-sm font-bold text-[#0B2545] leading-tight block break-words">
                {crop.crop_name}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 12-Month Timeline */}
      <CropCalendarBar cropSequence={strategy.crop_sequence} indicators={indicators} />

      {/* Concise Plain Explanation */}
      <div className="space-y-1.5 text-sm text-slate-800 bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="leading-relaxed">{firstSentence(strategy.spanish_summary)}</p>
        <p className="italic text-[#0B2545] leading-relaxed pt-1 border-t border-slate-200/80">“{firstSentence(strategy.quechua_summary)}”</p>
      </div>

      {/* Illustrated 4 Status Checks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {checks.map((c) => {
          const st = LIGHT_LABELS[c.val] || LIGHT_LABELS.yellow;
          return (
            <div key={c.name} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center gap-2.5 min-w-0">
              <CheckIllustration kind={c.key} className="w-8 h-8 shrink-0" />
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-slate-500 block truncate">{c.name}</span>
                <span className={`inline-block mt-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${st.pill}`}>
                  {st.word}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {isAdvanced && strategy.nasa_evidence ? (
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
          <strong className="text-[#0B2545]">Evidencia NASA:</strong> {strategy.nasa_evidence}
        </div>
      ) : null}

      {/* Clean Audio Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={() => onSpeak(strategy.quechua_summary, "qu", qKey, `strat_${strategy.strategy_id}`)}
          className={`py-3 px-4 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeAudioKey === qKey ? "bg-[#0B2545] text-white border-[#081B33]" : "bg-sky-50 hover:bg-sky-100 text-[#0B2545] border-sky-300"
          }`}
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>Escuchar en Qhichwa</span>
        </button>
        <button
          type="button"
          onClick={() => onSpeak(strategy.spanish_summary, "es", esKey, `strat_${strategy.strategy_id}`)}
          className={`py-3 px-4 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeAudioKey === esKey ? "bg-stone-800 text-white border-stone-900" : "bg-white hover:bg-stone-100 text-stone-900 border-stone-300"
          }`}
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>Escuchar en Castellano</span>
        </button>
      </div>
    </div>
  );
}
