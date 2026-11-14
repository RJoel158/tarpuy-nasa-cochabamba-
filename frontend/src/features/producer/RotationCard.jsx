import React from "react";
import { Volume2, ArrowRight } from "lucide-react";
import CropCalendarBar from "./CropCalendarBar.jsx";

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
  green: { dot: "bg-emerald-600", text: "text-emerald-900", word: "Bien" },
  yellow: { dot: "bg-amber-500", text: "text-amber-900", word: "Cuidado" },
  red: { dot: "bg-rose-600", text: "text-rose-900", word: "Riesgo" },
};

function firstSentence(text = "") {
  const clean = String(text).replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const first = clean.split(/(?<=[.!?])\s+/)[0] || clean;
  return first.length > 140 ? `${first.slice(0, 137).trim()}...` : first;
}

export default function RotationCard({ strategy = {}, index = 1, indicators = [], onSpeak, activeAudioKey }) {
  const isBase = strategy.strategy_type === "current_baseline";
  const scorePct = Math.round((strategy.priority_alignment_score || 0.45) * 100);
  const title = PLAIN_TITLES[strategy.strategy_id] || strategy.title_es;
  const qKey = `${strategy.strategy_id || index}_qu`;
  const esKey = `${strategy.strategy_id || index}_es`;
  const tl = strategy.visual_traffic_light || {};

  const checks = [
    { name: "Agua", val: tl.water || "yellow" },
    { name: "Tierra viva", val: tl.soil || "yellow" },
    { name: "Helada", val: tl.frost || "yellow" },
    { name: "Lluvia/Viento", val: tl.erosion || "yellow" },
  ];

  return (
    <div className={`bg-white rounded-xl border p-5 sm:p-6 space-y-5 ${isBase ? "border-amber-400" : "border-stone-200"}`}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${isBase ? "text-amber-700" : "text-[#0284C7]"}`}>
            {isBase ? "Práctica actual · Riesgo para el suelo" : `Opción recomendada · ${scorePct}% ideal`}
          </span>
          <h3 className="text-xl font-bold text-[#0B2545] mt-1">{title}</h3>
        </div>
      </div>

      {/* Crop Sequence */}
      <div className="flex flex-wrap items-center gap-2">
        {(strategy.crop_sequence || []).map((crop, idx) => (
          <React.Fragment key={idx}>
            <span className="px-3 py-1.5 bg-stone-100 text-stone-900 rounded-lg text-sm font-semibold border border-stone-200">
              {idx + 1}. {crop.crop_name}
            </span>
            {idx < (strategy.crop_sequence || []).length - 1 ? <ArrowRight className="w-4 h-4 text-stone-400 shrink-0" /> : null}
          </React.Fragment>
        ))}
      </div>

      {/* 12-Month Timeline */}
      <CropCalendarBar cropSequence={strategy.crop_sequence} indicators={indicators} />

      {/* Concise Plain Explanation */}
      <div className="space-y-1.5 text-sm text-slate-800 bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="leading-relaxed">{firstSentence(strategy.spanish_summary)}</p>
        <p className="italic text-[#0B2545] leading-relaxed pt-1 border-t border-slate-200/80">“{firstSentence(strategy.quechua_summary)}”</p>
      </div>

      {/* 4 Compact Status Checks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {checks.map((c) => {
          const st = LIGHT_LABELS[c.val] || LIGHT_LABELS.yellow;
          return (
            <div key={c.name} className="p-2.5 rounded-lg border border-stone-200 bg-white flex items-center justify-between gap-2 text-xs">
              <span className="font-medium text-stone-600">{c.name}</span>
              <span className={`inline-flex items-center gap-1.5 font-bold ${st.text}`}>
                <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                {st.word}
              </span>
            </div>
          );
        })}
      </div>

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
