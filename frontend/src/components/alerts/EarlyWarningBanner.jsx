import React, { useState } from "react";
import { buildWeatherNarration } from "../../services/narration.js";
import { Volume2, LocateFixed, MapPin, Bell, ArrowRight } from "lucide-react";
import { AlertsModal } from "../ui/FeedbackSystem.jsx";
import DayForecastModal from "./DayForecastModal.jsx";
import { tr } from "../../utils/quechuaI18n.js";
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
  voiceLang = "es",
  isAdvanced = false,
  onOpenMap,
  onDetectGps,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  if (!bulletin || !bulletin.current_conditions) return (
    <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      {voiceLang === "qu" ? "Mana pacha yachay kanchu." : "No hay datos del clima disponibles para esta zona. Si tienes internet, vuelve a consultar."}
    </p>
  );
  const cur = bulletin.current_conditions;
  const pred = bulletin.predictions_summary || {};
  const alerts = bulletin.active_alerts || [];
  const days = bulletin.seven_day_forecast || [];
  const zId = bulletin.zone_id || "punata_valle_alto";
  const aKey = `alert_${zId}_${voiceLang}`;
  const shortZone = (zoneName || zId).split("—")[0].split("-")[0].trim();
  const isQu = voiceLang === "qu";

  const handleListen = () => {
    const message = buildWeatherNarration(bulletin, shortZone, voiceLang);
    onSpeak?.(message, voiceLang, aKey);
  };

  const primaryAlert = cleanAlertForFarmer(alerts[0], voiceLang) || {
    kind: "stable",
    bannerPill: isQu ? "ALLIN PACHA" : "BUEN TIEMPO",
    badgeClass: "bg-emerald-100 text-emerald-800",
    borderClass: "border-emerald-300 border-l-emerald-600",
    bgClass: "bg-emerald-50/60",
    cleanTitle: isQu ? "Llaqtaykipi pachaqa allillan kachkan" : "Tiempo tranquilo en tu zona",
    action: isQu ? "Allin pacha chakraykipi llamk'anapaq." : "Condiciones estables para tu chacra esta semana.",
  };

  const weatherCards = [
    { key: "temp", category: isQu ? "CHIRI Q'UÑI" : "TEMPERATURA", ...describeTempCard(cur.temp_c, pred.min_temp_7d_c, voiceLang), techText: `${cur.temp_c}°C · Mín: ${pred.min_temp_7d_c}°C · Máx: ${pred.max_temp_7d_c}°C` },
    { key: "soil", category: isQu ? "ALLPAYKI" : "TU TIERRA", ...describeSoilCard(cur.soil_moisture_top_pct, voiceLang), techText: `${cur.soil_moisture_top_pct}% · ${cur.humidity_pct}%` },
    { key: "rain", category: isQu ? "PARA 7 P'UNCHAW" : "LLUVIA 7 DÍAS", ...describeRainCard(pred.total_precip_7d_mm, voiceLang), isRain: true, techText: `${pred.total_precip_7d_mm} mm` },
    { key: "sun", category: isQu ? "INTI WAN CH'AKI" : "SOL Y SEQUEDAD", ...describeSunCard(pred.net_water_balance_7d_mm, voiceLang), techText: `ET0: ${pred.total_et0_7d_mm} mm · Bal: ${pred.net_water_balance_7d_mm} mm` },
  ];

  return (
    <div className="space-y-5">
      {/* Screen Header */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#0284C7]">{tr(voiceLang, "next7Days")}</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] tracking-tight">
            {tr(voiceLang, "weatherToday")} · {shortZone}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={onDetectGps} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition cursor-pointer">
            <LocateFixed className="w-3.5 h-3.5" />
            <span>{tr(voiceLang, "myGps")}</span>
          </button>
          <button type="button" onClick={onOpenMap} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-[#0B2545] border border-slate-300 text-xs font-bold transition cursor-pointer">
            <MapPin className="w-3.5 h-3.5 text-[#0284C7]" />
            <span>{tr(voiceLang, "map")}</span>
          </button>
          <button type="button" onClick={() => setModalOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-slate-100 text-[#0B2545] border border-slate-300 text-xs font-bold transition cursor-pointer">
            <Bell className="w-3.5 h-3.5 text-amber-600" />
            <span>{tr(voiceLang, "seeAlerts")}</span>
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
            <span>{tr(voiceLang, "listenBtn")}</span>
          </button>
        </div>
      </div>

      {!isQu && <p className="text-sm text-slate-600">
        Pronóstico de la zona · {bulletin.fetched_at_utc && Number.isFinite(Date.parse(bulletin.fetched_at_utc))
          ? new Date(bulletin.fetched_at_utc).toLocaleString("es-BO") : "Fecha de actualización no disponible"}
      </p>}
      <h3 className="text-xl font-bold text-[#0B2545]">{isQu ? tr(voiceLang, "doToday") : "Qué hago ahora"}</h3>
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
              <strong className="text-[#0B2545]">{tr(voiceLang, "doToday")}</strong> {primaryAlert.action}
            </p>
          </div>
        </div>
        {alerts.length > 0 ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-bold text-[#0284C7] cursor-pointer shrink-0 self-start sm:self-center"
          >
            <span>{tr(voiceLang, "seeAlerts")}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      <h3 className="text-xl font-bold text-[#0B2545]">{isQu ? "Allpayki" : "Cómo está mi tierra"}</h3>
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
                {isAdvanced ? (
                  <p className="mt-2 text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200">
                    {c.techText}
                  </p>
                ) : null}
              </div>
              {c.isRain ? (
                <div className="space-y-2">
                  <RainDropsVisual count={c.drops} lang={voiceLang} />
                  <VisualMeter3 level={c.level} tone={c.tone} labels={c.levels} />
                </div>
              ) : (
                <VisualMeter3 level={c.level} tone={c.tone} labels={c.levels} />
              )}
            </div>
          );
        })}
      </div>

      {/* Interactive Graphical 7-Day Forecast Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-[#0B2545]">{tr(voiceLang, "dayByDay")}</h3>
          <span className="text-xs text-[#0284C7] font-semibold">{tr(voiceLang, "tapForDetail")}</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
          {days.map((d) => {
            const dv = describeDayVisual(d, voiceLang);
            const tone = TONE_CLASSES[dv.tone] || TONE_CLASSES.emerald;
            return (
              <button
                key={d.date}
                type="button"
                onClick={() => setSelectedDay(d)}
                className="p-3 bg-white hover:bg-sky-50/70 hover:border-[#0284C7] border border-slate-200 rounded-2xl flex flex-col justify-between gap-2 text-left transition cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  <span className="text-xs font-bold text-[#0B2545]">{d.day_label}</span>
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${tone.badge}`}>{dv.word}</span>
                </div>
                <WeatherIllustration kind={dv.kind} className="w-11 h-11 mx-auto my-0.5 group-hover:scale-105 transition-transform" />
                <div className="space-y-1 w-full">
                  <RainDropsVisual count={dv.drops} text={dv.rainText} lang={voiceLang} compact={true} />
                  <p className="text-[11px] font-medium text-slate-600 leading-tight">{dv.nightText}</p>
                  {isAdvanced ? (
                    <p className="text-[10px] font-mono text-slate-500 leading-snug pt-0.5 border-t border-slate-100">
                      {d.temp_min_c}°/{d.temp_max_c}° · {d.precip_mm}mm
                    </p>
                  ) : null}
                  <span className="block text-[10px] font-bold text-[#0284C7] pt-0.5 group-hover:underline">
                    {tr(voiceLang, "tapForDetail")} →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <AlertsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        alerts={alerts}
        zoneName={shortZone}
        lang={voiceLang}
        onListen={handleListen}
      />

      <DayForecastModal
        day={selectedDay}
        dv={selectedDay ? describeDayVisual(selectedDay, voiceLang) : null}
        zoneName={shortZone}
        lang={voiceLang}
        onClose={() => setSelectedDay(null)}
        onSpeak={onSpeak}
      />
    </div>
  );
}
