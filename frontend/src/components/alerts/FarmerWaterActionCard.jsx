import React from "react";
import { Droplets, Hand, TriangleAlert, Volume2, Sprout } from "lucide-react";
import { decideFarmerWaterAction } from "../../services/farmerWaterAction.js";
import { waterActionText, tr } from "../../utils/quechuaI18n.js";
import { buildWaterActionNarration } from "../../services/narration.js";

export default function FarmerWaterActionCard({ bulletin, drainage, district, lang, onSpeak, activeAudioKey, onPlant, advanced }) {
  const action = decideFarmerWaterAction(bulletin, drainage);
  const text = waterActionText(action, lang);
  const Icon = { IRRIGATE: Droplets, WAIT: Hand, CAUTION: TriangleAlert }[action.code];
  const tone = { IRRIGATE: "bg-sky-50 border-sky-300", WAIT: "bg-emerald-50 border-emerald-300", CAUTION: "bg-amber-50 border-amber-400" }[action.code];
  const audioKey = `water_${bulletin?.zone_id}_${lang}_${action.reason}`;
  const summary = bulletin?.predictions_summary || {};
  return <section aria-label={text.heading} className={`rounded-3xl border-2 p-5 space-y-4 ${tone}`}>
    <p className="font-bold text-slate-700">{text.heading}{district ? ` · ${district}` : ""}</p>
    <div className="flex items-center gap-4">
      <Icon aria-hidden="true" className="w-16 h-16 shrink-0" />
      <h2 className="text-3xl font-black break-words">{text.title}</h2>
    </div>
    <p className="text-lg leading-relaxed">{text.message}</p>
    <p className="text-sm text-slate-600">{text.scope}</p>
    {bulletin?.fetched_at_utc && <p className="text-sm text-slate-600">
      {lang === "qu" ? "Yachaypa p'unchawnin" : "Fecha del boletín"}: {bulletin.fetched_at_utc}
    </p>}
    <div className="grid gap-3 sm:grid-cols-2">
      <button type="button" aria-pressed={activeAudioKey === audioKey}
        onClick={() => onSpeak(buildWaterActionNarration(action, lang), lang, audioKey)}
        className="min-h-16 rounded-2xl bg-slate-900 text-white p-3 font-bold flex items-center justify-center gap-2">
        <Volume2 aria-hidden="true" />{tr(lang, activeAudioKey === audioKey ? "stopAudio" : "listenBtn")}
      </button>
      <button type="button" onClick={onPlant} className="min-h-16 rounded-2xl border border-slate-400 bg-white p-3 font-bold flex items-center justify-center gap-2">
        <Sprout aria-hidden="true" />{text.plant}
      </button>
    </div>
    {advanced && <details className="rounded-xl bg-white p-3">
      <summary className="cursor-pointer font-semibold">{text.details}</summary>
      <p>Humedad: {bulletin?.current_conditions?.soil_moisture_top_pct ?? "—"}% · Balance 7 días: {summary.net_water_balance_7d_mm ?? "—"} mm · Mínima: {summary.min_temp_7d_c ?? "—"} °C</p>
      <p>Drenaje: {drainage ? `${drainage.tipo} · ${drainage.clasificacion}` : "Sin información confirmada"}</p>
    </details>}
  </section>;
}
