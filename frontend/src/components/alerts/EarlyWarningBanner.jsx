import React, { useState } from "react";
import { CloudRain, ThermometerSnowflake, Volume2, AlertTriangle, CheckCircle2, LocateFixed, MapPin, Bell } from "lucide-react";
import { AlertsModal } from "../ui/FeedbackSystem.jsx";

const DAY_TAG = {
  frost_risk: "text-rose-700 bg-rose-50",
  chill_caution: "text-amber-800 bg-amber-50",
  rain_window: "text-sky-800 bg-sky-50",
  dry_wind: "text-orange-800 bg-orange-50",
  stable: "text-slate-600 bg-slate-100",
};

const DAY_WORD = {
  frost_risk: "Helada",
  chill_caution: "Frío",
  rain_window: "Lluvia",
  dry_wind: "Viento",
  stable: "Normal",
};

export default function EarlyWarningBanner({
  bulletin,
  zoneName = "",
  onSpeak,
  activeAudioKey,
  voiceLang = "qu",
  onOpenMap,
  onDetectGps,
}) {
  const [modalOpen, setModalOpen] = useState(false);

  if (!bulletin || !bulletin.current_conditions) return null;
  const cur = bulletin.current_conditions;
  const pred = bulletin.predictions_summary || {};
  const alerts = bulletin.active_alerts || [];
  const days = bulletin.seven_day_forecast || [];
  const zId = bulletin.zone_id || "punata_valle_alto";
  const aKey = `alert_${zId}_${voiceLang}`;
  const shortZone = (zoneName || zId).split("—")[0].split("-")[0].trim();

  const handleListen = () => {
    if (voiceLang === "qu") {
      onSpeak?.(bulletin.alerts_spoken_qu || "", "qu", aKey, `alert_${zId}`);
    } else {
      const msg = bulletin.alerts_spoken_es || pred.plain_prediction_es || "";
      onSpeak?.(msg, "es", aKey, `alert_${zId}`);
    }
  };

  const topAlert = alerts[0];

  return (
    <div className="space-y-5">
      {/* Screen Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0284C7]">Próximos 7 días</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] tracking-tight">Clima hoy · {shortZone}</h2>
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
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-[#0B2545] border border-slate-300 text-xs font-bold transition cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>Ver avisos ({alerts.length})</span>
          </button>
          <button
            type="button"
            onClick={handleListen}
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border transition cursor-pointer ${
              activeAudioKey === aKey
                ? "bg-[#0B2545] text-white border-[#081B33]"
                : "bg-white hover:bg-slate-100 text-slate-900 border-slate-300"
            }`}
          >
            <Volume2 className={`w-3.5 h-3.5 ${activeAudioKey === aKey ? "text-sky-300" : "text-[#0284C7]"}`} />
            <span>{voiceLang === "qu" ? "Qhichwa" : "Escuchar"}</span>
          </button>
        </div>
      </div>

      {/* 4 Concise Key Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 rounded-xl divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500">Temperatura</span>
          <p className="text-3xl font-bold text-[#0B2545] mt-1">{cur.temp_c}°C</p>
          <span className="text-xs text-slate-500">Mín: {pred.min_temp_7d_c}°C</span>
        </div>
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500">Humedad tierra</span>
          <p className="text-3xl font-bold text-[#0B2545] mt-1">{cur.soil_moisture_top_pct}%</p>
          <span className="text-xs text-slate-500">Aire: {cur.humidity_pct}%</span>
        </div>
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500">Lluvia 7 días</span>
          <p className="text-3xl font-bold text-[#0284C7] mt-1">{pred.total_precip_7d_mm} mm</p>
          <span className="text-xs text-slate-500">Acumulado semanal</span>
        </div>
        <div className="p-4 sm:p-5">
          <span className="text-xs font-medium text-slate-500">Sol que seca</span>
          <p className="text-3xl font-bold text-amber-700 mt-1">{pred.total_et0_7d_mm} mm</p>
          <span className="text-xs text-slate-500">Balance: {pred.net_water_balance_7d_mm} mm</span>
        </div>
      </div>

      {/* Single Concise Tip Bar (Replaces Stacked Alert Clutter) */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs sm:text-sm text-slate-800 flex items-center gap-2 min-w-0 flex-1">
          {topAlert?.severity === "info" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          )}
          <span className="truncate font-medium">
            {topAlert?.action_es || "Condiciones estables para tu terreno esta semana."}
          </span>
        </p>
        {alerts.length > 0 ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-xs font-bold text-[#0284C7] hover:text-[#0369A1] cursor-pointer shrink-0"
          >
            Ver detalles ({alerts.length}) →
          </button>
        ) : null}
      </div>

      {/* 7-Day Forecast Strip */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#0B2545]">Pronóstico 7 días</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {days.map((d) => (
            <div key={d.date} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-bold text-[#0B2545]">{d.day_label}</span>
                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${DAY_TAG[d.day_status] || DAY_TAG.stable}`}>
                  {DAY_WORD[d.day_status] || "Normal"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-800">
                <ThermometerSnowflake className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{d.temp_min_c}° / {d.temp_max_c}°</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <CloudRain className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                <span>{d.precip_mm} mm ({d.precip_prob_pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <AlertsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        alerts={alerts}
        zoneName={shortZone}
        onListen={handleListen}
      />
    </div>
  );
}
