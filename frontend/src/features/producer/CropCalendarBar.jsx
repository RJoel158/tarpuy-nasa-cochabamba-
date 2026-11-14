import React, { useState, useEffect } from "react";
import { CloudRain, Snowflake, Sun, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { CropIllustration } from "./FarmPictograms.jsx";
import { CAT_STYLE, formatStageRange, resolveMonthCell } from "./calendarHelpers.js";
import { tr } from "../../utils/quechuaI18n.js";

function MonthWxIcon({ wx }) {
  if (wx === "rain") return <CloudRain className="w-3.5 h-3.5 text-[#0284C7] shrink-0" aria-hidden="true" />;
  if (wx === "frost") return <Snowflake className="w-3.5 h-3.5 text-sky-700 shrink-0" aria-hidden="true" />;
  return <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />;
}

export default function CropCalendarBar({ cropSequence = [], indicators = [], lang = "es" }) {
  const defaultMonth = Math.max(0, ((cropSequence?.[0]?.start_month || 10) - 1) % 12);
  const [selectedIdx, setSelectedIdx] = useState(defaultMonth);

  useEffect(() => {
    setSelectedIdx(Math.max(0, ((cropSequence?.[0]?.start_month || 1) - 1) % 12));
  }, [cropSequence]);

  const cells = Array.from({ length: 12 }, (_, idx) => resolveMonthCell(idx, cropSequence, indicators, lang));
  const bareCount = cells.filter((c) => c.category === "bare").length;
  const protectedCount = 12 - bareCount;
  const activeCell = cells[selectedIdx] || cells[0];
  const activeStyle = CAT_STYLE[activeCell.category] || CAT_STYLE.idle;

  return (
    <div className="space-y-4">
      {/* Stage Cards (Crop Sequence Roadmap) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {(cropSequence || []).map((crop, idx) => {
          const rangeText = formatStageRange(crop.start_month, crop.end_month, lang);
          return (
            <button
              key={`${crop.crop_id || idx}-${idx}`}
              type="button"
              onClick={() => crop.start_month && setSelectedIdx((crop.start_month - 1) % 12)}
              className="relative flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-sky-50/70 hover:border-[#0284C7] text-left transition cursor-pointer min-w-0"
            >
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                <CropIllustration cropId={crop.crop_id} name={crop.crop_name} className="w-10 h-10" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0284C7]">
                    {tr(lang, "stepPrefix")} {idx + 1}
                  </span>
                  {rangeText ? (
                    <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                      {rangeText}
                    </span>
                  ) : null}
                </div>
                <span className="text-sm font-bold text-[#0B2545] leading-tight block break-words mt-0.5">
                  {crop.crop_name}
                </span>
              </div>
              {idx < cropSequence.length - 1 ? (
                <ArrowRight className="hidden sm:block w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Visual 12-Month Illustrated Board */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3.5 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-[#0B2545]">{tr(lang, "calTitle")}</h4>
            <p className="text-[11px] text-slate-500">{tr(lang, "calTapMonth")}</p>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${
              bareCount === 0 ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
            }`}
          >
            {bareCount === 0 ? <ShieldCheck className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
            <span>
              {bareCount === 0 ? `${protectedCount}/12 ${tr(lang, "calProtected")}` : `${bareCount}/12 ${tr(lang, "calBareWarn")}`}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {cells.map((c, idx) => {
            const st = CAT_STYLE[c.category] || CAT_STYLE.idle;
            const isSel = selectedIdx === idx;
            return (
              <button
                key={c.m}
                type="button"
                onClick={() => setSelectedIdx(idx)}
                aria-pressed={isSel}
                title={`${c.monthName}: ${c.cropName}`}
                className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1 min-w-0 ${st.cls} ${
                  isSel ? `${st.ring} shadow-xs` : "hover:brightness-97"
                }`}
              >
                <div className="flex items-center justify-between w-full px-0.5">
                  <span className="text-[11px] font-bold">{c.monthShort}</span>
                  <MonthWxIcon wx={c.wx} />
                </div>
                <CropIllustration cropId={c.cropId} name={c.cropName} className="w-8 h-8 my-0.5" />
                <span className="text-[11px] font-bold leading-tight w-full truncate">{c.shortWord}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Month Practical Detail */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${activeStyle.dot}`} />
            <div className="min-w-0">
              <p className="font-bold text-[#0B2545]">
                {activeCell.monthName}: {activeCell.cropName}
              </p>
              <p className="text-slate-600">{activeCell.role}</p>
            </div>
          </div>
          {indicators.length > 0 ? (
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shrink-0">
              <MonthWxIcon wx={activeCell.wx} />
              <span>{tr(lang, "calMonthRain")}: {Math.round(activeCell.rainMm)} mm</span>
              <span className="text-slate-300">·</span>
              <span>{activeCell.tmin}°/{activeCell.tmax}°C</span>
            </div>
          ) : null}
        </div>

        {/* Clean 4-Item Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-slate-600 pt-0.5">
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />{tr(lang, "calLegendMain")}</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#0284C7]" />{tr(lang, "calLegendCover")}</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />{tr(lang, "calLegendMulch")}</span>
          <span className="inline-flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-500" />{tr(lang, "calLegendBare")}</span>
        </div>
      </div>
    </div>
  );
}
