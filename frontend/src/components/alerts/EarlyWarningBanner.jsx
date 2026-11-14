import React from "react";
import { AlertTriangle, CheckCircle2, CloudRain, ThermometerSnowflake, Volume2, Wind, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Primitives.jsx";

const SEV_STYLES = {
  critical: { wrap: "bg-rose-50 border-rose-400 text-rose-950", badge: "bg-rose-600 text-white", label: "¡ALERTA URGENTE!" },
  warning: { wrap: "bg-amber-50 border-amber-400 text-amber-950", badge: "bg-amber-600 text-white", label: "¡CUIDADO HOY!" },
  info: { wrap: "bg-emerald-50 border-emerald-300 text-emerald-950", badge: "bg-emerald-700 text-white", label: "BUENA SEÑAL" },
};

const DAY_PILLS = {
  frost_risk: { bg: "bg-rose-100 text-rose-900 border-rose-300", tag: "Helada" },
  chill_caution: { bg: "bg-amber-100 text-amber-900 border-amber-300", tag: "Frío" },
  rain_window: { bg: "bg-sky-100 text-sky-900 border-sky-300", tag: "Lluvia" },
  dry_wind: { bg: "bg-orange-100 text-orange-900 border-orange-300", tag: "Viento" },
  stable: { bg: "bg-stone-100 text-stone-700 border-stone-200", tag: "Normal" },
};

export default function EarlyWarningBanner({ bulletin, zoneName = "", onSpeak, activeAudioKey, voiceLang = "qu" }) {
  if (!bulletin || !bulletin.current_conditions) return null;
  const cur = bulletin.current_conditions;
  const pred = bulletin.predictions_summary || {};
  const alerts = bulletin.active_alerts || [];
  const days = bulletin.seven_day_forecast || [];
  const zId = bulletin.zone_id || "punata_valle_alto";
  const aKey = `alert_${zId}_${voiceLang}`;

  const handleListenAlert = () => {
    if (voiceLang === "qu") {
      onSpeak?.(bulletin.alerts_spoken_qu || "", "qu", aKey, `alert_${zId}`);
    } else {
      const top = alerts[0];
      const text = `${pred.plain_prediction_es || ""} ${top ? `${top.title_es}. Qué hacer hoy: ${top.action_es}` : ""}`;
      onSpeak?.(text, "es", aKey);
    }
  };

  return (
    <Card className="border-amber-300/90 bg-gradient-to-br from-white via-amber-50/25 to-sky-50/30 shadow-sm">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-stone-900">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <span>Clima de Hoy, Alertas y Pronóstico a 7 Días — {zoneName || zId}</span>
          </CardTitle>
          <p className="text-xs text-stone-600 mt-0.5">
            Medición en tiempo real y predicción de lluvia, helada, calor y humedad en la tierra
          </p>
        </div>

        <button
          type="button"
          onClick={handleListenAlert}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
            activeAudioKey === aKey
              ? "bg-amber-600 text-white border-amber-700 animate-pulse"
              : "bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300"
          }`}
        >
          <Volume2 className="w-4 h-4 shrink-0" />
          <span>{voiceLang === "qu" ? "Escuchar Avisos en Qhichwa" : "Escuchar Avisos de la Semana"}</span>
        </button>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 4 Live Current + 7-day Forecast Summary Tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white border border-stone-200">
            <span className="text-stone-500 font-semibold block">Calor / Frío Ahora</span>
            <strong className="text-base sm:text-lg font-extrabold text-stone-900">{cur.temp_c}°C</strong>
            <span className="text-[11px] text-stone-500 block">Mínima 7 días: {pred.min_temp_7d_c}°C</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-stone-200">
            <span className="text-stone-500 font-semibold block">Agua en Suelo Superficial</span>
            <strong className="text-base sm:text-lg font-extrabold text-sky-700">{cur.soil_moisture_top_pct}%</strong>
            <span className="text-[11px] text-stone-500 block">Humedad aire: {cur.humidity_pct}%</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-stone-200">
            <span className="text-stone-500 font-semibold block">Lluvia Esperada (7 días)</span>
            <strong className="text-base sm:text-lg font-extrabold text-emerald-700">{pred.total_precip_7d_mm} mm</strong>
            <span className="text-[11px] text-stone-500 block">Suma pronóstico semanal</span>
          </div>
          <div className="p-3 rounded-xl bg-white border border-stone-200">
            <span className="text-stone-500 font-semibold block">Agua que Seca el Sol</span>
            <strong className="text-base sm:text-lg font-extrabold text-amber-700">{pred.total_et0_7d_mm} mm</strong>
            <span className="text-[11px] font-bold text-rose-700 block">Balance: {pred.net_water_balance_7d_mm} mm</span>
          </div>
        </div>

        {/* Active Alerts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {alerts.map((al) => {
            const st = SEV_STYLES[al.severity] || SEV_STYLES.info;
            return (
              <div key={al.id} className={`p-3.5 rounded-xl border-l-4 border ${st.wrap} space-y-1.5`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${st.badge}`}>{st.label}</span>
                  <span className="text-[11px] font-semibold italic opacity-80">{al.title_qu}</span>
                </div>
                <h4 className="text-sm font-bold leading-snug">{al.title_es}</h4>
                <p className="text-xs leading-relaxed opacity-90">{al.message_es}</p>
                <div className="pt-1.5 border-t border-black/10 text-xs font-semibold flex items-start gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>Qué hacer hoy: {al.action_es}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 7-Day Forecast Mini Strip */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-bold text-stone-600 flex items-center gap-1.5 uppercase tracking-wide">
            <Calendar className="w-3.5 h-3.5" />
            Pronóstico Día por Día (Próximos 7 Días)
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {days.map((d) => {
              const pill = DAY_PILLS[d.day_status] || DAY_PILLS.stable;
              return (
                <div key={d.date} className="p-2 rounded-xl bg-white border border-stone-200 text-[11px] space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-800">
                    <span>{d.day_label}</span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${pill.bg}`}>{pill.tag}</span>
                  </div>
                  <div className="flex items-center justify-between text-stone-700">
                    <span className="inline-flex items-center gap-0.5"><ThermometerSnowflake className="w-3 h-3 text-rose-500" />{d.temp_min_c}°/{d.temp_max_c}°</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-stone-600">
                    <span className="inline-flex items-center gap-0.5"><CloudRain className="w-3 h-3 text-sky-600" />{d.precip_mm} mm ({d.precip_prob_pct}%)</span>
                    <span className="inline-flex items-center gap-0.5"><Wind className="w-3 h-3 text-stone-400" />{Math.round(d.wind_kmh)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
