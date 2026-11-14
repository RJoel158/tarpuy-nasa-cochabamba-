import React from "react";
import { translateAlertText } from "../../utils/quechuaI18n.js";

export const TONE_CLASSES = {
  rose: { bar: "bg-rose-600", badge: "bg-rose-100 text-rose-800", text: "text-rose-700" },
  amber: { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-900", text: "text-amber-800" },
  sky: { bar: "bg-[#0284C7]", badge: "bg-sky-100 text-sky-900", text: "text-[#0284C7]" },
  emerald: { bar: "bg-emerald-600", badge: "bg-emerald-100 text-emerald-800", text: "text-emerald-800" },
};

function renderSvgKind(kind, animated) {
  switch (kind) {
    case "frost":
      return (
        <>
          <circle cx="32" cy="27" r="19" fill="#E0F2FE" />
          <g className={animated ? "wx-anim-pulse" : ""}>
            <path d="M32 13v28M20 20l24 14M44 20L20 34" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
            <circle cx="32" cy="27" r="3.4" fill="#0B2545" />
          </g>
          <path d="M14 51h36M20 57h24" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "chill":
      return (
        <>
          <circle cx="32" cy="28" r="19" fill="#EEF2FF" />
          <g className={animated ? "wx-anim-float" : ""}>
            <path d="M34 14a13 13 0 1 0 11 20A11 11 0 0 1 34 14z" fill="#1E3A8A" />
            <circle cx="46" cy="18" r="2" fill="#38BDF8" />
            <circle cx="50" cy="28" r="1.5" fill="#60A5FA" />
          </g>
          <path d="M14 50h24M22 56h24" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" />
        </>
      );
    case "sun_dry":
      return (
        <>
          <g className={animated ? "wx-anim-pulse" : ""}>
            <circle cx="32" cy="23" r="10" fill="#F59E0B" />
            <path
              d="M32 7v3.5M32 35.5V39M16 23h3.5M44.5 23H48M20.5 11.5l2.5 2.5M41 32l2.5 2.5M43.5 11.5L41 14M23 32l-2.5 2.5"
              stroke="#D97706"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
          </g>
          <path d="M12 52h40" stroke="#92400E" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M18 47l4 4M32 47v4M46 47l-4 4" stroke="#B45309" strokeWidth="2.2" strokeLinecap="round" />
        </>
      );
    case "rain_good":
      return (
        <>
          <g className={animated ? "wx-anim-float" : ""}>
            <path d="M19 34h26a8.5 8.5 0 0 0 1-17 11.5 11.5 0 0 0-22-2.5A9 9 0 0 0 19 34z" fill="#38BDF8" />
          </g>
          <g className={animated ? "wx-anim-drop" : ""}>
            <path d="M22 41c2 3 3.2 5 3.2 6.8a3.2 3.2 0 1 1-6.4 0c0-1.8 1.2-3.8 3.2-6.8z" fill="#0284C7" />
            <path d="M32 43c2 3 3.2 5 3.2 6.8a3.2 3.2 0 1 1-6.4 0c0-1.8 1.2-3.8 3.2-6.8z" fill="#0284C7" />
            <path d="M42 41c2 3 3.2 5 3.2 6.8a3.2 3.2 0 1 1-6.4 0c0-1.8 1.2-3.8 3.2-6.8z" fill="#0284C7" />
          </g>
        </>
      );
    case "soil_moisture":
      return (
        <>
          <g className={animated ? "wx-anim-float" : ""}>
            <path d="M32 9c7 9.5 12 15 12 21.5a12 12 0 1 1-24 0C20 24 25 18.5 32 9z" fill="#0284C7" />
            <path d="M27.5 31a4.5 4.5 0 0 0 4.5 4.5" stroke="#BAE6FD" strokeWidth="2.4" strokeLinecap="round" />
          </g>
          <path d="M10 51c7-2.5 15 2.5 22 0s15-2.5 22 0v5H10z" fill="#78350F" />
        </>
      );
    case "wind":
      return (
        <g className={animated ? "wx-anim-wind" : ""}>
          <path d="M10 21h28a5 5 0 1 0-5-5" stroke="#0284C7" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d="M8 32h36a5.5 5.5 0 1 1-5.5 5.5" stroke="#0284C7" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d="M14 45h22a4.5 4.5 0 1 1-4.5 4.5" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="52" cy="18" rx="4.5" ry="2.5" transform="rotate(-25 52 18)" fill="#16A34A" />
          <ellipse cx="53" cy="40" rx="4" ry="2.2" transform="rotate(15 53 40)" fill="#22C55E" />
        </g>
      );
    case "stable":
    default:
      return (
        <>
          <g className={animated ? "wx-anim-pulse" : ""}>
            <circle cx="21" cy="22" r="9" fill="#FBBF24" />
            <path d="M21 8v3M8 22h3M12 13l2 2M30 13l-2 2M12 31l2-2" stroke="#F59E0B" strokeWidth="2.6" strokeLinecap="round" />
          </g>
          <g className={animated ? "wx-anim-float" : ""}>
            <path
              d="M23 47h24a8 8 0 0 0 1-16 10 10 0 0 0-19-2 8.5 8.5 0 0 0-6 18z"
              fill="#E0F2FE"
              stroke="#0284C7"
              strokeWidth="2.4"
              strokeLinejoin="round"
            />
          </g>
        </>
      );
  }
}

export function WeatherIllustration({ kind = "stable", animated = false, className = "w-12 h-12" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {renderSvgKind(kind, animated)}
    </svg>
  );
}

export function VisualMeter3({ level = 2, tone = "sky", labels = ["Bajo", "Medio", "Alto"] }) {
  const cfg = TONE_CLASSES[tone] || TONE_CLASSES.sky;
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((step) => (
          <div key={step} className={`h-2.5 rounded-full ${step <= level ? cfg.bar : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 text-[10px] sm:text-[11px] leading-tight">
        {labels.slice(0, 3).map((lbl, idx) => (
          <span key={lbl} className={`truncate ${idx === 1 ? "text-center" : idx === 2 ? "text-right" : "text-left"} ${idx + 1 === level ? `font-bold ${cfg.text}` : "text-slate-400"}`}>
            {lbl}
          </span>
        ))}
      </div>
    </div>
  );
}

export function RainDropsVisual({ count = 0, text, lang = "es", compact = false }) {
  const wordsEs = ["Sin lluvia", "Poca lluvia", "Lluvia", "Lluvia fuerte"];
  const wordsQu = ["Mana para", "Pisi para", "Para", "Sinchi para"];
  const n = Math.max(0, Math.min(3, count));
  const label = text || (lang === "qu" ? wordsQu[n] : wordsEs[n]);
  return (
    <div className="flex items-center gap-1 min-w-0">
      <div className="flex items-center gap-0.5 shrink-0" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <svg key={i} viewBox="0 0 16 20" className={compact ? "w-2.5 h-3.5" : "w-3.5 h-4"}>
            <path d="M8 1C11 6 14 9.5 14 13a6 6 0 1 1-12 0c0-3.5 3-7 6-12z" fill={i <= n ? "#0284C7" : "#CBD5E1"} />
          </svg>
        ))}
      </div>
      <span className={`${compact ? "text-[11px]" : "text-xs"} font-semibold leading-tight whitespace-nowrap ${n > 0 ? "text-[#0B2545]" : "text-slate-500"}`}>{label}</span>
    </div>
  );
}

export function describeTempCard(tempNow, min7d, lang = "es") {
  const m = Number(min7d ?? tempNow ?? 10);
  const qu = lang === "qu";
  if (m <= 2) return { kind: "frost", badge: qu ? "Manchay" : "Peligro", tone: "rose", level: 3, title: qu ? "Qasa manchay" : "Riesgo de Helada", advice: qu ? "Tuta yurakunata qhatay" : "Tapa tus plantas de noche", levels: qu ? ["Chiri", "Qasa", "Manchay"] : ["Frío", "Helada", "Peligro"] };
  if (m <= 5) return { kind: "chill", badge: qu ? "Qhaway" : "Cuidado", tone: "amber", level: 2, title: qu ? "Tuta chirinqapuni" : "Noches Frías", advice: qu ? "Llullu brotekunata waqaychay" : "Cuida brotes tiernos", levels: qu ? ["Llanthu", "Chiri", "Qasa"] : ["Fresco", "Frío", "Mucho frío"] };
  return { kind: "stable", badge: qu ? "Allin" : "Seguro", tone: "emerald", level: 2, title: qu ? "Q'uñi pacha" : "Clima Templado", advice: qu ? "Mana qasa kanchu" : "Sin peligro de helada", levels: qu ? ["Chiri", "Q'uñi", "Rupha"] : ["Frío", "Templado", "Calor"] };
}

export function describeSoilCard(soilPct, lang = "es") {
  const s = Number(soilPct ?? 0);
  const qu = lang === "qu";
  if (s < 20) return { kind: "sun_dry", badge: qu ? "Ch'aki" : "Seca", tone: "rose", level: 1, title: qu ? "Ch'aki allpa" : "Tierra Seca", advice: qu ? "Yakuta icha parata munan" : "Necesita riego o lluvia", levels: qu ? ["Ch'aki", "Uqhu", "Jiq'i"] : ["Seca", "Húmeda", "Mojada"] };
  if (s < 32) return { kind: "soil_moisture", badge: qu ? "Chawpi" : "Media", tone: "amber", level: 2, title: qu ? "Pisi uqhu allpa" : "Tierra Poco Húmeda", advice: qu ? "Ichuwan allpata qhatay" : "Tapa el suelo con paja", levels: qu ? ["Ch'aki", "Chawpi", "Uqhu"] : ["Seca", "Media", "Mojada"] };
  return { kind: "soil_moisture", badge: qu ? "Allin" : "Buena", tone: "emerald", level: 3, title: qu ? "Allin uqhu allpa" : "Tierra Húmeda", advice: qu ? "Tarpunapaq wakichisqa" : "Lista para sembrar", levels: qu ? ["Ch'aki", "Chawpi", "Uqhu"] : ["Seca", "Media", "Mojada"] };
}

export function describeRainCard(rain7d, lang = "es") {
  const r = Number(rain7d ?? 0);
  const qu = lang === "qu";
  if (r < 5) return { kind: "sun_dry", drops: 0, badge: qu ? "Ch'aki" : "Seco", tone: "amber", level: 1, title: qu ? "Mana anchata paranchu" : "Casi Sin Lluvia", advice: qu ? "Yaku parqoyta wakichiy" : "No confíes solo en lluvia", levels: qu ? ["Ch'aki", "Pisi", "Allin"] : ["Nada", "Regular", "Bastante"] };
  if (r < 20) return { kind: "rain_good", drops: 2, badge: qu ? "Yanapa" : "Ayuda", tone: "sky", level: 2, title: qu ? "Pisi para jamunqa" : "Lluvia Moderada", advice: qu ? "Chakrata pisi uqhuchanqa" : "Mojará un poco la chacra", levels: qu ? ["Pisi", "Chawpi", "Sinchi"] : ["Poca", "Moderada", "Fuerte"] };
  return { kind: "rain_good", drops: 3, badge: qu ? "Allin" : "Buena", tone: "emerald", level: 3, title: qu ? "Allin para jamunqa" : "Buena Lluvia", advice: qu ? "Allin pacha tarpunapaq" : "Buen momento para sembrar", levels: qu ? ["Pisi", "Chawpi", "Allin"] : ["Poca", "Moderada", "Buena"] };
}

export function describeSunCard(netWater, lang = "es") {
  const w = Number(netWater ?? 0);
  const qu = lang === "qu";
  if (w <= -12) return { kind: "sun_dry", badge: qu ? "Qhaway" : "Cuidado", tone: "amber", level: 3, title: qu ? "Inti usqhayta ch'akichin" : "El Sol Seca Rápido", advice: qu ? "Chhallawan allpata qhatay" : "Deja chala o paja encima", levels: qu ? ["Llanthu", "Chawpi", "Ch'akichin"] : ["Suave", "Medio", "Seca mucho"] };
  if (w < 0) return { kind: "stable", badge: qu ? "Allillan" : "Normal", tone: "sky", level: 2, title: qu ? "Allin inti pacha" : "Sol Moderado", advice: qu ? "Tutamanta parqoy" : "Riega temprano o tarde", levels: qu ? ["Llanthu", "Allillan", "Rupha"] : ["Suave", "Normal", "Fuerte"] };
  return { kind: "rain_good", badge: qu ? "Llanthu" : "Fresco", tone: "emerald", level: 1, title: qu ? "Allpa yakuta waqaychan" : "Tierra Conserva Agua", advice: qu ? "Paraqa intita atipan" : "La lluvia gana al sol", levels: qu ? ["Waqaychan", "Allillan", "Ch'aki"] : ["Conserva", "Normal", "Seca"] };
}

export function describeDayVisual(day, lang = "es") {
  const qu = lang === "qu";
  const pr = Number(day?.precip_mm ?? 0);
  const tmin = Number(day?.temp_min_c ?? 10);
  const drops = pr < 0.5 ? 0 : pr < 3 ? 1 : pr < 8 ? 2 : 3;
  const rainText = qu
    ? ["Mana para", "Ch'allallay", "Para", "Sinchi para"][drops]
    : ["Sin lluvia", "Llovizna", "Lluvia", "Aguacero"][drops];
  const nightText = qu
    ? (tmin <= 2 ? "¡Qasa!" : tmin <= 6 ? "Tuta chiri" : "Q'uñi tuta")
    : (tmin <= 2 ? "¡Helada!" : tmin <= 6 ? "Noche fría" : "Noche templada");
  const byStatus = {
    frost_risk: { kind: "frost", word: qu ? "Qasa" : "Helada", tone: "rose" },
    chill_caution: { kind: "chill", word: qu ? "Chiri" : "Frío", tone: "amber" },
    rain_window: { kind: "rain_good", word: qu ? "Para" : "Lluvia", tone: "sky" },
    dry_wind: { kind: "wind", word: qu ? "Wayra" : "Viento", tone: "amber" },
    stable: drops >= 2
      ? { kind: "rain_good", word: qu ? "Para" : "Lluvia", tone: "sky" }
      : { kind: "stable", word: qu ? "Allin" : "Normal", tone: "emerald" },
  };
  const base = byStatus[day?.day_status] || byStatus.stable;
  return { ...base, drops, rainText, nightText };
}

const ALERT_KIND = { frost_critical: "frost", frost_watch: "chill", frost_safe: "stable", water_deficit: "sun_dry", water_ok: "soil_moisture", rain_window: "rain_good", wind_warning: "wind" };

export function cleanAlertForFarmer(alert, lang = "es") {
  if (!alert) return null;
  const qu = lang === "qu";
  const trAlert = translateAlertText(alert, lang);
  const sev = alert.severity || "info";
  const style = sev === "critical"
    ? { badgeText: qu ? "MANCHAY" : "PELIGRO", bannerPill: qu ? "CHAKRAPI MANCHAY" : "PELIGRO EN TU CHACRA", badgeClass: "bg-rose-100 text-rose-800", borderClass: "border-rose-300 border-l-rose-600", bgClass: "bg-rose-50/70" }
    : sev === "warning"
    ? { badgeText: qu ? "QHAWAY" : "CUIDADO", bannerPill: qu ? "CHAKRAPI QHAWAY" : "CUIDADO EN TU CHACRA", badgeClass: "bg-amber-100 text-amber-900", borderClass: "border-amber-300 border-l-amber-500", bgClass: "bg-amber-50/70" }
    : { badgeText: qu ? "ALLIN WILLAY" : "BUENA NOTICIA", bannerPill: qu ? "ALLIN PACHA" : "BUEN TIEMPO", badgeClass: "bg-emerald-100 text-emerald-800", borderClass: "border-emerald-300 border-l-emerald-600", bgClass: "bg-emerald-50/60" };
  return { ...style, kind: ALERT_KIND[alert.id] || "stable", cleanTitle: trAlert.title, category: trAlert.category, action: trAlert.action };
}
