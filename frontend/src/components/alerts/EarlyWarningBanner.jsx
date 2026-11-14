import React, { useState } from "react";
import { Volume2, LocateFixed, MapPin, Bell, ArrowRight } from "lucide-react";
import { AlertsModal } from "../ui/FeedbackSystem.jsx";
import {
  WeatherIllustration,
  VisualMeter3,
  RainDropsVisual,
  TONE_CLASSES,
  describeTempCard,
  describeSoilCard,
  describeRainCard,
  describeSunCard,
  describeDayVisual,
  cleanAlertForFarmer,
} from "./WeatherPictograms.jsx";

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

  const primaryAlert = cleanAlertForFarmer(alerts[0]) || {
    kind: "stable",
    bannerPill: "BUEN TIEMPO",
    badgeClass: "bg-emerald-100 text-emerald-800",
    borderClass: "border-emerald-300 border-l-emerald-600",
    bgClass: "bg-emerald-50/60",
    cleanTitle: "Tiempo tranquilo en tu zona",
    action: "Condiciones estables para tu chacra esta semana.",
  };
  const weatherCards = [
    { key: "temp", category: "TEMPERATURA", ...describeTempCard(cur.temp_c, pred.min_temp_7d_c) },
    { key: "soil", category: "TU TIERRA", ...describeSoilCard(cur.soil_moisture_top_pct) },
    { key: "rain", category: "LLUVIA 7 DÍAS", ...describeRainCard(pred.total_precip_7d_mm), isRain: true },
    { key: "sun", category: "SOL Y SEQUEDAD", ...describeSunCard(pred.net_water_balance_7d_mm) },
  ];

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

      {/* Top Graphical Warning Banner (Semáforo del Campo) */}
      <div className={`rounded-2xl border border-l-4 ${primaryAlert.borderClass} ${primaryAlert.bgClass} p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <div className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
            <WeatherIllustration kind={primaryAlert.kind} className="w-12 h-12" />
          </div>
          <div className="min-w-0 space-y-1">
            <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${primaryAlert.badgeClass}`}>
              {primaryAlert.bannerPill}
            </span>
            <h3 className="text-base sm:text-lg font-bold text-[#0B2545] leading-snug">{primaryAlert.cleanTitle}</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-snug">
              <strong className="text-[#0B2545]">Qué hacer hoy:</strong> {primaryAlert.action}
            </p>
          </div>
        </div>
        {alerts.length > 0 ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-[#0284C7] cursor-pointer shrink-0 self-start sm:self-center"
          >
            <span>Ver {alerts.length} avisos con dibujos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* 4 Graphical Weather Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {weatherCards.map((c) => {
          const tone = TONE_CLASSES[c.tone] || TONE_CLASSES.sky;
          return (
            <div key={c.key} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <WeatherIllustration kind={c.kind} className="w-12 h-12 shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 leading-tight">{c.category}</span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${tone.badge}`}>{c.badge}</span>
              </div>
              <div>
                <p className="text-lg font-bold text-[#0B2545] leading-tight">{c.title}</p>
                <p className="text-xs text-slate-600 mt-0.5">{c.advice}</p>
              </div>
              {c.isRain ? (
                <div className="space-y-2">
                  <RainDropsVisual count={c.drops} />
                  <VisualMeter3 level={c.level} tone={c.tone} labels={c.levels} />
                </div>
              ) : (
                <VisualMeter3 level={c.level} tone={c.tone} labels={c.levels} />
              )}
            </div>
          );
        })}
      </div>

      {/* Graphical 7-Day Forecast Cards */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-[#0B2545]">Pronóstico día por día</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {days.map((d) => {
            const dv = describeDayVisual(d);
            const tone = TONE_CLASSES[dv.tone] || TONE_CLASSES.emerald;
            return (
              <div key={d.date} className="p-3 bg-white border border-slate-200 rounded-2xl flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-[#0B2545]">{d.day_label}</span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${tone.badge}`}>{dv.word}</span>
                </div>
                <WeatherIllustration kind={dv.kind} className="w-11 h-11 mx-auto my-0.5" />
                <div className="space-y-1">
                  <RainDropsVisual count={dv.drops} text={dv.rainText} />
                  <p className="text-[11px] font-medium text-slate-600 truncate">{dv.nightText}</p>
                </div>
              </div>
            );
          })}
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
