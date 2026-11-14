import React from "react";
import { X, Volume2, Sun, Moon, CloudRain, Wind } from "lucide-react";
import { WeatherIllustration, RainDropsVisual, TONE_CLASSES } from "./WeatherPictograms.jsx";
import { tr, buildDayInterpretation } from "../../utils/quechuaI18n.js";

export default function DayForecastModal({ day, dv, zoneName = "", lang = "es", onClose, onSpeak }) {
  if (!day || !dv) return null;
  const tone = TONE_CLASSES[dv.tone] || TONE_CLASSES.emerald;
  const interp = buildDayInterpretation(day, dv, lang);

  const metrics = [
    { Icon: Sun, color: "text-amber-500", label: tr(lang, "dayTempLabel"), val: `${day.temp_max_c}°C`, sub: day.temp_max_c >= 23 ? (lang === "qu" ? "Rupha" : "Caluroso") : (lang === "qu" ? "Q'uñi" : "Templado") },
    { Icon: Moon, color: "text-indigo-600", label: tr(lang, "nightTempLabel"), val: `${day.temp_min_c}°C`, sub: dv.nightText },
    { Icon: CloudRain, color: "text-[#0284C7]", label: tr(lang, "rainLabel"), val: `${day.precip_mm} mm`, sub: `${dv.rainText} (${day.precip_prob_pct ?? 0}%)` },
    { Icon: Wind, color: "text-emerald-600", label: tr(lang, "windEvapLabel"), val: `${day.wind_kmh ?? "—"} km/h`, sub: `ET0: ${day.et0_mm ?? "—"} mm` },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${day.day_label} · ${dv.word}`}
      className="fixed inset-0 z-50 bg-slate-900/55 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full max-h-[88vh] flex flex-col shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#0284C7]">
              {tr(lang, "dayDetailSub")} · {zoneName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <h3 className="text-lg font-bold text-[#0B2545]">{day.day_label}</h3>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${tone.badge}`}>{dv.word}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tr(lang, "closeBtn")}
            className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="rounded-2xl bg-gradient-to-br from-sky-50 to-slate-50 border border-sky-200/80 p-4 flex items-center gap-4">
            <div className="w-24 h-24 rounded-2xl bg-white border border-sky-200 flex items-center justify-center shrink-0 shadow-xs">
              <WeatherIllustration kind={dv.kind} animated={true} className="w-20 h-20" />
            </div>
            <div className="min-w-0 space-y-1.5">
              <RainDropsVisual count={dv.drops} text={dv.rainText} lang={lang} />
              <p className="text-sm font-bold text-[#0B2545]">{dv.nightText}</p>
              <p className="text-xs text-slate-600">{day.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {metrics.map((m) => (
              <div key={m.label} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <m.Icon className={`w-3.5 h-3.5 ${m.color} shrink-0`} />
                  <span>{m.label}</span>
                </div>
                <p className="text-base font-bold text-[#0B2545]">{m.val}</p>
                <p className="text-[11px] text-slate-600">{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs text-slate-700 leading-relaxed">
            <h4 className="text-sm font-bold text-[#0B2545]">{tr(lang, "farmMeaningTitle")}</h4>
            <p>{interp.dayText}</p>
            <p>{interp.nightText}</p>
            <p>{interp.rainText}</p>
            <p className="pt-1.5 border-t border-slate-200 font-semibold text-[#0B2545]">
              {tr(lang, "doToday")} {interp.adviceText}
            </p>
          </div>
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onSpeak?.(interp.spokenSummary, lang, `day_${day.date}_${lang}`)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold cursor-pointer"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{tr(lang, "listenBtn")}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 text-xs font-bold cursor-pointer"
          >
            {tr(lang, "closeBtn")}
          </button>
        </div>
      </div>
    </div>
  );
}
