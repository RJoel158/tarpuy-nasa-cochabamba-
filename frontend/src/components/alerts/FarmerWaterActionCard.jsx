import React from "react";
import { Droplets, Hand, TriangleAlert, Volume2, Sprout } from "lucide-react";
import { decideFarmerWaterAction } from "../../services/farmerWaterAction.js";
import { waterActionText, tr } from "../../utils/quechuaI18n.js";
import { buildWaterActionNarration } from "../../services/narration.js";

export default function FarmerWaterActionCard({ bulletin, drainage, district, lang, onSpeak, activeAudioKey, onPlant, advanced }) {
  const action = decideFarmerWaterAction(bulletin, drainage);
  const text = waterActionText(action, lang);
  const Icon = { IRRIGATE: Droplets, WAIT: Hand, CAUTION: TriangleAlert }[action.code];
  const tone = { IRRIGATE: "bg-sky-100 text-sky-800", WAIT: "bg-emerald-100 text-emerald-800", CAUTION: "bg-amber-100 text-amber-900" }[action.code];
  const audioKey = `water_${bulletin?.zone_id}_${lang}_${action.reason}`;
  const summary = bulletin?.predictions_summary || {};
  const date = bulletin?.fetched_at_utc ? new Date(bulletin.fetched_at_utc) : null;
  const dateLabel = date && Number.isFinite(date.getTime())
    ? date.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" }) : "";
  return <section aria-label={text.heading} className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 space-y-4 text-[#0B2545]">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
      <p className="text-sm font-bold">{text.heading}</p>
      {district && <p className="text-sm text-slate-600 break-words">{district}</p>}
    </div>
    <div className="flex items-center gap-4">
      <span className={`rounded-xl p-3 shrink-0 ${tone}`}><Icon aria-hidden="true" className="w-10 h-10" /></span>
      <h2 className={`rounded-full px-3 py-1 text-lg sm:text-xl font-bold leading-snug ${tone}`}>{text.title}</h2>
    </div>
    <p className="text-base sm:text-lg leading-relaxed font-medium">{text.message}</p>
    <p className="text-sm text-slate-600">{text.scope}</p>
    {dateLabel && <p className="text-sm text-slate-500">
      {lang === "qu" ? "Yachaypa p'unchawnin" : "Fecha del boletín"}: {dateLabel}
    </p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <button type="button" aria-pressed={activeAudioKey === audioKey}
        onClick={() => onSpeak(buildWaterActionNarration(action, lang), lang, audioKey)}
        className="min-h-16 rounded-xl bg-[#0284C7] hover:bg-[#0369A1] text-white p-3 font-bold flex items-center justify-center gap-2 cursor-pointer">
        <Volume2 aria-hidden="true" />{tr(lang, activeAudioKey === audioKey ? "stopAudio" : "listenBtn")}
      </button>
      <button type="button" onClick={onPlant} className="min-h-16 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 p-3 font-bold flex items-center justify-center gap-2 cursor-pointer">
        <Sprout aria-hidden="true" />{text.plant}
      </button>
    </div>
    {advanced && <details className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm">
      <summary className="cursor-pointer font-semibold">{text.details}</summary>
      <p>Humedad: {bulletin?.current_conditions?.soil_moisture_top_pct ?? "—"}% · Balance 7 días: {summary.net_water_balance_7d_mm ?? "—"} mm · Mínima: {summary.min_temp_7d_c ?? "—"} °C</p>
      <p>Drenaje: {drainage ? `${drainage.tipo} · ${drainage.clasificacion}` : "Sin información confirmada"}</p>
    </details>}
  </section>;
}
