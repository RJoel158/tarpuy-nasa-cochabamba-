import React from "react";
import { buildStrategyNarration } from "../../services/narration.js";
import { Volume2 } from "lucide-react";
import CropCalendarBar from "./CropCalendarBar.jsx";
import { CheckIllustration } from "./FarmPictograms.jsx";
import { tr } from "../../utils/quechuaI18n.js";

const PLAIN_TITLES = {
  punata_strat_baseline: { es: "Seguir solo con maíz y dejar la tierra pelada", qu: "Sarallawan tarpuy, allpata q'arata saqispa" },
  punata_strat_cover_avena_vicia: { es: "Maíz y luego Avena con Vicia para tapar la tierra", qu: "Sara, chaymanta Avena-Vicia allpa qhatanapaq" },
  punata_strat_legume_diversified: { es: "Alfalfa 3 años, luego Papa Huaycha y Maíz", qu: "Alfalfa 3 wata, chaymanta Akshu, Sara ima" },
  tapacari_strat_baseline: { es: "Sembrar solo papa y dejar la ladera vacía", qu: "Akshullata tarpuy, urquta ch'usaq saqispa" },
  tapacari_strat_tarwi_papa_contour: { es: "Tarwi en surcos de contorno, Papa y Cebada", qu: "Tarwi qhatapi, Akshu, Siwara ima muyuchispa" },
  tapacari_strat_quinua_haba_intercrop: { es: "Rotar Haba, Quinua y Avena para animales", qu: "Jawasa, Kinwa, uywa Avenawan muyuy" },
  mizque_strat_baseline: { es: "Maíz y Cebolla dejando la tierra pelada al sol", qu: "Sara, Cebolla ima allpata q'arata saqispa" },
  mizque_strat_drought_cover_mulch: { es: "Maíz tapado con Avena-Vicia y Haba", qu: "Sara chhallawan qhatasqa, Avena-Vicia, Jawasawan" },
  mizque_strat_agroforestry_alfalfa_grain: { es: "Franjas de Alfalfa con Quinua y Maíz", qu: "Alfalfa wach'ukuna Kinwawan, Sarawan" },
};

export default function RotationCard({ strategy = {}, index = 1, indicators = [], onSpeak, activeAudioKey, isAdvanced = false, lang = "es" }) {
  const isQu = lang === "qu";
  const isBase = strategy.strategy_type === "current_baseline";
  const scorePct = Math.round((strategy.priority_alignment_score || 0.45) * 100);
  const titleObj = PLAIN_TITLES[strategy.strategy_id];
  const title = titleObj ? (isQu ? titleObj.qu : titleObj.es) : strategy.title_es;
  const qKey = `${strategy.strategy_id || index}_qu`;
  const esKey = `${strategy.strategy_id || index}_es`;
  const tl = strategy.visual_traffic_light || {};

  const LIGHT_LABELS = {
    green: { pill: "bg-emerald-100 text-emerald-800", word: tr(lang, "wellWord") },
    yellow: { pill: "bg-amber-100 text-amber-900", word: tr(lang, "careWord") },
    red: { pill: "bg-rose-100 text-rose-800", word: tr(lang, "riskWord") },
  };

  const checks = [
    { key: "water", name: tr(lang, "waterCheck"), val: tl.water || "yellow" },
    { key: "soil", name: tr(lang, "soilCheck"), val: tl.soil || "yellow" },
    { key: "frost", name: tr(lang, "frostCheck"), val: tl.frost || "yellow" },
    { key: "erosion", name: tr(lang, "windRainCheck"), val: tl.erosion || "yellow" },
  ];

  const primaryText = buildStrategyNarration(strategy, lang, indicators);


  return (
    <div className={`bg-white rounded-xl border p-5 sm:p-6 space-y-5 ${isBase ? "border-amber-400" : "border-stone-200"}`}>
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-4">
        <div>
          <span className={`text-xs font-bold uppercase tracking-wider ${isBase ? "text-amber-700" : "text-[#0284C7]"}`}>
            {isBase
              ? tr(lang, "riskBadge")
              : isAdvanced
              ? `${tr(lang, "recommendedBadge")} · ${scorePct}%`
              : tr(lang, "recommendedBadge")}
          </span>
          <h3 className="text-xl font-bold text-[#0B2545] mt-1">{title}</h3>
        </div>
      </div>

      {/* Intuitive 12-Month Illustrated Rotation Calendar & Stages */}
      <CropCalendarBar cropSequence={strategy.crop_sequence} indicators={indicators} lang={lang} />

      {/* Concise Plain Explanation (prioritizes active language) */}
      <div className="space-y-1.5 text-sm text-slate-800 bg-slate-50 rounded-xl p-4 border border-slate-200">
        <p className="leading-relaxed font-medium text-[#0B2545]">{primaryText}</p>
        {isQu && <p className="text-xs text-slate-600 mt-2">Guion quechua pendiente de revisión por un hablante de Cochabamba.</p>}

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
          <strong className="text-[#0B2545]">NASA:</strong> {strategy.nasa_evidence}
        </div>
      ) : null}

      {/* Clean Audio Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={() => onSpeak(buildStrategyNarration(strategy, "qu", indicators), "qu", qKey, `strat_${strategy.strategy_id}`)}
          className={`py-3 px-4 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeAudioKey === qKey ? "bg-[#0B2545] text-white border-[#081B33]" : "bg-sky-50 hover:bg-sky-100 text-[#0B2545] border-sky-300"
          }`}
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>{tr(lang, "listenQuBtn")}</span>
        </button>
        <button
          type="button"
          onClick={() => onSpeak(buildStrategyNarration(strategy, "es", indicators), "es", esKey, `strat_${strategy.strategy_id}`)}
          className={`py-3 px-4 rounded-lg border text-sm font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
            activeAudioKey === esKey ? "bg-stone-800 text-white border-stone-900" : "bg-white hover:bg-stone-100 text-stone-900 border-stone-300"
          }`}
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>{tr(lang, "listenEsBtn")}</span>
        </button>
      </div>
    </div>
  );
}
