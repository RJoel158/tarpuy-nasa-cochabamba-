import React from "react";
import { CloudRain, ThermometerSnowflake, Volume2, AlertTriangle, CheckCircle2 } from "lucide-react";

const SEV_BORDER = {
  critical: "border-l-rose-600 bg-rose-50/50 text-stone-900",
  warning: "border-l-amber-500 bg-amber-50/50 text-stone-900",
  info: "border-l-emerald-600 bg-white text-stone-900",
};

const DAY_TAG = {
  frost_risk: "text-rose-700 bg-rose-50",
  chill_caution: "text-amber-800 bg-amber-50",
  rain_window: "text-sky-800 bg-sky-50",
  dry_wind: "text-orange-800 bg-orange-50",
  stable: "text-stone-600 bg-stone-100",
};

const DAY_WORD = {
  frost_risk: "Helada",
  chill_caution: "Frío",
  rain_window: "Lluvia",
  dry_wind: "Viento",
  stable: "Normal",
};

export default function EarlyWarningBanner({ bulletin, zoneName = "", onSpeak, activeAudioKey, voiceLang = "qu" }) {
  if (!bulletin || !bulletin.current_conditions) return null;
  const cur = bulletin.current_conditions;
  const pred = bulletin.predictions_summary || {};
  const alerts = bulletin.active_alerts || [];
  const days = bulletin.seven_day_forecast || [];
  const zId = bulletin.zone_id || "punata_valle_alto";
  const aKey = `alert_${zId}_${voiceLang}`;

  const handleListen = () => {
    if (voiceLang === "qu") {
      onSpeak?.(bulletin.alerts_spoken_qu || "", "qu", aKey, `alert_${zId}`);
    } else {
      const msg = bulletin.alerts_spoken_es || pred.plain_prediction_es || "";
      onSpeak?.(msg, "es", aKey, `alert_${zId}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Screen Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0284C7]">Reporte en vivo · 7 días</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] tracking-tight">Clima hoy en {zoneName || zId}</h2>
        </div>
        <button
          type="button"
          onClick={handleListen}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition cursor-pointer ${
            activeAudioKey === aKey
              ? "bg-[#0B2545] text-white border-[#081B33]"
              : "bg-white hover:bg-slate-100 text-slate-900 border-slate-300"
          }`}
        >
          <Volume2 className={`w-4 h-4 ${activeAudioKey === aKey ? "text-sky-300" : "text-[#0284C7]"}`} />
          <span>{voiceLang === "qu" ? "Escuchar en Qhichwa" : "Escuchar avisos"}</span>
        </button>
      </div>

      {/* 4 Clean Key Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-stone-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-stone-200">
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-stone-500">Temperatura ahora</span>
          <p className="text-3xl font-bold text-stone-900 mt-1">{cur.temp_c}°C</p>
          <span className="text-xs text-stone-500">Mín. semana: {pred.min_temp_7d_c}°C</span>
        </div>
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500">Humedad en tierra</span>
          <p className="text-3xl font-bold text-[#0B2545] mt-1">{cur.soil_moisture_top_pct}%</p>
          <span className="text-xs text-slate-500">Aire: {cur.humidity_pct}%</span>
        </div>
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500">Lluvia esperada</span>
          <p className="text-3xl font-bold text-[#0284C7] mt-1">{pred.total_precip_7d_mm} mm</p>
          <span className="text-xs text-slate-500">En los próximos 7 días</span>
        </div>
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-stone-500">Sol que seca</span>
          <p className="text-3xl font-bold text-amber-700 mt-1">{pred.total_et0_7d_mm} mm</p>
          <span className="text-xs text-stone-600">Balance: {pred.net_water_balance_7d_mm} mm</span>
        </div>
      </div>

      {/* Weekly Advisories */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-stone-900">Avisos para tu chacra</h3>
        <div className="space-y-2.5">
          {alerts.map((al) => (
            <div key={al.id} className={`p-4 rounded-xl border border-stone-200 border-l-4 ${SEV_BORDER[al.severity] || SEV_BORDER.info}`}>
              <div className="flex items-start gap-3">
                {al.severity === "info"
                  ? <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                  : <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />}
                <div className="space-y-1">
                  <p className="text-sm sm:text-base font-bold text-stone-900">{al.title_es}</p>
                  <p className="text-sm text-stone-700">{al.action_es}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-Day Forecast Strip */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-stone-900">Pronóstico día por día</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {days.map((d) => (
            <div key={d.date} className="p-3 bg-white border border-stone-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-stone-900">{d.day_label}</span>
                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${DAY_TAG[d.day_status] || DAY_TAG.stable}`}>
                  {DAY_WORD[d.day_status] || "Normal"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-stone-800">
                <ThermometerSnowflake className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{d.temp_min_c}° / {d.temp_max_c}°</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-stone-600">
                <CloudRain className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>{d.precip_mm} mm ({d.precip_prob_pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
