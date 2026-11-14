import React from "react";
import { translateAlertText } from "../../utils/quechuaI18n.js";
import {
  DibujoHelada,
  DibujoNube,
  DibujoTierraSeca,
  DibujoLluvia,
  DibujoTierraHumeda,
  DibujoViento,
  DibujoSol,
} from "../illustrations/TarpuyIllustrations.jsx";

/**
 * WeatherPictograms — Mantiene todos los nombres y firmas existentes,
 * reemplazando sus dibujos con el nuevo set de ilustraciones hechas a mano
 * y 100% variables CSS (cero hex sueltos).
 */

export const TONE_CLASSES = {
  rose: { bar: "bg-rose-600", badge: "bg-rose-100 text-rose-800", text: "text-rose-700" },
  amber: { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-900", text: "text-amber-800" },
  sky: { bar: "bg-sky-700", badge: "bg-sky-100 text-sky-900", text: "text-sky-800" },
  emerald: { bar: "bg-emerald-600", badge: "bg-emerald-100 text-emerald-800", text: "text-emerald-800" },
};

export function WeatherIllustration({ kind = "stable", animated = false, className = "w-12 h-12" }) {
  const animCls = animated ? "wx-anim-float" : "";
  const fullClass = `${className} ${animCls}`.trim();

  switch (kind) {
    case "frost":
      return <DibujoHelada className={fullClass} />;
    case "chill":
      return <DibujoNube className={fullClass} />;
    case "sun_dry":
      return <DibujoTierraSeca className={fullClass} />;
    case "rain_good":
      return <DibujoLluvia className={fullClass} />;
    case "soil_moisture":
      return <DibujoTierraHumeda className={fullClass} />;
    case "wind":
      return <DibujoViento className={fullClass} />;
    case "stable":
    default:
      return <DibujoSol className={fullClass} />;
  }
}

export function VisualMeter3({ level = 2, tone = "sky", labels = ["Bajo", "Medio", "Alto"] }) {
  const cfg = TONE_CLASSES[tone] || TONE_CLASSES.sky;
  return (
    <div className="space-y-1.5 min-w-0">
      <div className="grid grid-cols-3 gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((step) => (
          <div key={step} className={`h-2.5 rounded-full ${step <= level ? cfg.bar : "bg-stone-200"}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1 text-[10px] sm:text-[11px] leading-tight">
        {labels.slice(0, 3).map((lbl, idx) => (
          <span
            key={lbl}
            className={`truncate ${idx === 1 ? "text-center" : idx === 2 ? "text-right" : "text-left"} ${
              idx + 1 === level ? `font-bold ${cfg.text}` : "text-stone-500"
            }`}
          >
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
            <path
              d="M8 1C11 6 14 9.5 14 13a6 6 0 1 1-12 0c0-3.5 3-7 6-12z"
              fill={i <= n ? "var(--color-illus-water)" : "var(--color-border-subtle)"}
              stroke="var(--color-ink-stroke)"
              strokeWidth="1.2"
            />
          </svg>
        ))}
      </div>
      <span
        className={`${compact ? "text-[11px]" : "text-xs"} font-semibold leading-tight whitespace-nowrap`}
        style={{ color: n > 0 ? "var(--color-text-primary)" : "var(--color-text-muted)" }}
      >
        {label}
      </span>
    </div>
  );
}

export function describeTempCard(tempNow, min7d, lang = "es") {
  const m = Number(min7d ?? tempNow ?? 10);
  const qu = lang === "qu";
  if (m <= 2) return { kind: "frost", badge: qu ? "Manchay" : "Peligro", tone: "rose", level: 3, title: qu ? "Qasa manchay" : "Riesgo de Helada", advice: qu ? "Tuta yurakunata qhatay" : "Tapa tus plantas de noche", levels: qu ? ["Chiri", "Qasa", "Manchay"] : ["Frío", "Helada", "Peligro"] };
  if (m <= 5) return { kind: "chill", badge: qu ? "Qhaway" : "Cuidado", tone: "amber", level: 2, title: qu ? "Tuta chirinqapuni" : "Noches Frías", advice: qu ? "Llullu brotekunata waqaychay" : "Cuida brotes tiernos", levels: qu ? ["Llanthu", "Chiri", "Qasa"] : ["Fresco", "Frío", "Mucho frío"] };
  return { kind: "stable", badge: qu ? "Allin" : "Revisar", tone: "emerald", level: 2, title: qu ? "Q'uñi pacha" : "Mínimas por encima de 5 °C", advice: qu ? "Mana qasa kanchu" : "La temperatura puede variar dentro de tu parcela", levels: qu ? ["Chiri", "Q'uñi", "Rupha"] : ["Frío", "Templado", "Calor"] };
}

export function describeSoilCard(soilPct, lang = "es") {
  if (soilPct === null || soilPct === undefined || soilPct === "" || !Number.isFinite(Number(soilPct)) || Number(soilPct) < 0 || Number(soilPct) > 100) {
    return {
      kind: "soil_moisture",
      badge: "—",
      tone: "sky",
      level: 0,
      title: lang === "qu" ? "Mana yachay kanchu" : "Humedad sin dato",
      advice: lang === "qu" ? "Allpata qhaway" : "Revisa la tierra antes de decidir el riego",
      levels: [],
    };
  }

  return {
    kind: "soil_moisture",
    badge: lang === "qu" ? "Qhaway" : "Estimación",
    tone: "sky",
    level: 0,
    title: lang === "qu" ? "Allpa uqhu" : "Humedad superficial estimada",
    advice: lang === "qu" ? "Allpata qhaway" : "Comprueba la tierra a la profundidad de las raíces",
    levels: [],
  };
}

export function describeRainCard(rain7d, lang = "es") {
  const r = Number(rain7d ?? 0);
  const qu = lang === "qu";
  if (r < 5) return { kind: "sun_dry", drops: 0, badge: qu ? "Ch'aki" : "Seco", tone: "amber", level: 1, title: qu ? "Mana anchata paranchu" : "Casi Sin Lluvia", advice: qu ? "Yaku parqoyta wakichiy" : "No confíes solo en lluvia", levels: qu ? ["Ch'aki", "Pisi", "Allin"] : ["Nada", "Regular", "Bastante"] };
  if (r < 20) return { kind: "rain_good", drops: 2, badge: qu ? "Yanapa" : "Ayuda", tone: "sky", level: 2, title: qu ? "Pisi para jamunqa" : "Lluvia Moderada", advice: qu ? "Chakrata pisi uqhuchanqa" : "Mojará un poco la chacra", levels: qu ? ["Pisi", "Chawpi", "Sinchi"] : ["Poca", "Moderada", "Fuerte"] };
  return { kind: "rain_good", drops: 3, badge: qu ? "Qhaway" : "Revisar", tone: "emerald", level: 3, title: qu ? "Allin para jamunqa" : "Mayor acumulado de lluvia", advice: qu ? "Allin pacha tarpunapaq" : "Revisa la humedad y el drenaje antes de sembrar", levels: qu ? ["Pisi", "Chawpi", "Allin"] : ["Poca", "Moderada", "Buena"] };
}

export function describeSunCard(netWater, lang = "es") {
  const w = Number(netWater ?? 0);
  const qu = lang === "qu";
  if (w <= -12) return { kind: "sun_dry", badge: qu ? "Qhaway" : "Cuidado", tone: "amber", level: 3, title: qu ? "Inti usqhayta ch'akichin" : "Lluvia menor que la demanda de referencia", advice: qu ? "Chhallawan allpata qhatay" : "Deja chala o paja encima", levels: qu ? ["Llanthu", "Chawpi", "Ch'akichin"] : ["Suave", "Medio", "Seca mucho"] };
  if (w < 0) return { kind: "stable", badge: qu ? "Allillan" : "Normal", tone: "sky", level: 2, title: qu ? "Allin inti pacha" : "Lluvia por debajo de la referencia", advice: qu ? "Tutamanta parqoy" : "Comprueba si tu cultivo necesita riego", levels: qu ? ["Llanthu", "Allillan", "Rupha"] : ["Suave", "Normal", "Fuerte"] };
  return { kind: "rain_good", badge: qu ? "Llanthu" : "Fresco", tone: "emerald", level: 1, title: qu ? "Allpa yakuta waqaychan" : "Lluvia igual o mayor que la referencia", advice: qu ? "Paraqa intita atipan" : "Comprueba la humedad y el drenaje", levels: qu ? ["Waqaychan", "Allillan", "Ch'aki"] : ["Conserva", "Normal", "Seca"] };
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

const ALERT_KIND = {
  frost_critical: "frost",
  frost_watch: "chill",
  frost_safe: "stable",
  water_deficit: "sun_dry",
  water_ok: "soil_moisture",
  rain_window: "rain_good",
  wind_warning: "wind",
};

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
