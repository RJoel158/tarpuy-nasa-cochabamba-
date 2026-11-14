import React from "react";

export const TONE_CLASSES = {
  rose: { bar: "bg-rose-600", badge: "bg-rose-100 text-rose-800", text: "text-rose-700" },
  amber: { bar: "bg-amber-500", badge: "bg-amber-100 text-amber-900", text: "text-amber-800" },
  sky: { bar: "bg-[#0284C7]", badge: "bg-sky-100 text-sky-900", text: "text-[#0284C7]" },
  emerald: { bar: "bg-emerald-600", badge: "bg-emerald-100 text-emerald-800", text: "text-emerald-800" },
};

const SVG_BY_KIND = {
  frost: (
    <>
      <circle cx="32" cy="30" r="22" fill="#E0F2FE" />
      <path d="M32 10v28M19 17l26 14M45 17L19 31" stroke="#0284C7" strokeWidth="3.2" strokeLinecap="round" />
      <circle cx="32" cy="24" r="3.5" fill="#0B2545" />
      <path d="M18 52c4-7 12-9 14-2 2-7 10-5 14 2H18z" fill="#64748B" />
      <path d="M14 54h36" stroke="#0284C7" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  chill: (
    <>
      <circle cx="32" cy="32" r="22" fill="#EEF2FF" />
      <path d="M38 14a16 16 0 1 0 12 25A13 13 0 0 1 38 14z" fill="#1E3A8A" />
      <path d="M14 44h24M20 51h26" stroke="#38BDF8" strokeWidth="3.2" strokeLinecap="round" />
    </>
  ),
  sun_dry: (
    <>
      <circle cx="32" cy="25" r="11" fill="#F59E0B" />
      <path d="M32 7v4M32 39v4M14 25h4M46 25h4M19 12l3 3M42 35l3 3M45 12l-3 3M22 35l-3 3" stroke="#D97706" strokeWidth="3" strokeLinecap="round" />
      <path d="M12 52h40M18 52l4-5 5 5M36 52l4-4 5 4" stroke="#92400E" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  rain_good: (
    <>
      <path d="M20 35h25a9 9 0 0 0 1-18 12 12 0 0 0-23-3A10 10 0 0 0 20 35z" fill="#38BDF8" />
      <path d="M22 40l-2 7M32 40l-2 7M42 40l-2 7" stroke="#0284C7" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M32 56v-7m0 0c-5 0-8-4-8-4s4-2 8 4zm0 0c5 0 8-4 8-4s-4-2-8 4z" stroke="#059669" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="#10B981" />
    </>
  ),
  soil_moisture: (
    <>
      <path d="M32 10c7 10 13 16 13 23a13 13 0 1 1-26 0c0-7 6-13 13-23z" fill="#0284C7" />
      <path d="M27 33a5 5 0 0 0 5 5" stroke="#BAE6FD" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M10 50c7-3 15 3 22 0s15-3 22 0v6H10z" fill="#78350F" />
    </>
  ),
  wind: (
    <>
      <path d="M10 24h30a6 6 0 1 0-6-6M12 34h36a6 6 0 1 1-6 6" stroke="#0284C7" strokeWidth="3.4" strokeLinecap="round" fill="none" />
      <path d="M28 54c1-9 5-13 11-16" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
    </>
  ),
  stable: (
    <>
      <circle cx="24" cy="24" r="10" fill="#FBBF24" />
      <path d="M24 9v3M12 24H9M14 14l2 2M34 14l-2 2" stroke="#F59E0B" strokeWidth="2.8" strokeLinecap="round" />
      <path d="M23 44h24a8 8 0 0 0 1-16 10 10 0 0 0-19-2 9 9 0 0 0-6 18z" fill="#7DD3FC" stroke="#0284C7" strokeWidth="2" />
    </>
  ),
};

export function WeatherIllustration({ kind = "stable", className = "w-12 h-12" }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      {SVG_BY_KIND[kind] || SVG_BY_KIND.stable}
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

export function RainDropsVisual({ count = 0, text }) {
  const words = ["Sin lluvia", "Poca lluvia", "Lluvia", "Lluvia fuerte"];
  const n = Math.max(0, Math.min(3, count));
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <div className="flex items-center gap-0.5 shrink-0" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <svg key={i} viewBox="0 0 16 20" className="w-3.5 h-4">
            <path d="M8 1C11 6 14 9.5 14 13a6 6 0 1 1-12 0c0-3.5 3-7 6-12z" fill={i <= n ? "#0284C7" : "#CBD5E1"} />
          </svg>
        ))}
      </div>
      <span className={`text-xs font-semibold truncate ${n > 0 ? "text-[#0B2545]" : "text-slate-500"}`}>{text || words[n]}</span>
    </div>
  );
}

export function describeTempCard(tempNow, min7d) {
  const m = Number(min7d ?? tempNow ?? 10);
  if (m <= 2) return { kind: "frost", badge: "Peligro", tone: "rose", level: 3, title: "Riesgo de Helada", advice: "Tapa tus plantas de noche", levels: ["Frío", "Helada", "Peligro"] };
  if (m <= 5) return { kind: "chill", badge: "Cuidado", tone: "amber", level: 2, title: "Noches Frías", advice: "Cuida brotes tiernos", levels: ["Fresco", "Frío", "Mucho frío"] };
  return { kind: "stable", badge: "Seguro", tone: "emerald", level: 2, title: "Clima Templado", advice: "Sin peligro de helada", levels: ["Frío", "Templado", "Calor"] };
}

export function describeSoilCard(soilPct) {
  const s = Number(soilPct ?? 0);
  if (s < 20) return { kind: "sun_dry", badge: "Seca", tone: "rose", level: 1, title: "Tierra Seca", advice: "Necesita riego o lluvia", levels: ["Seca", "Húmeda", "Mojada"] };
  if (s < 32) return { kind: "soil_moisture", badge: "Media", tone: "amber", level: 2, title: "Tierra Poco Húmeda", advice: "Tapa el suelo con paja", levels: ["Seca", "Media", "Mojada"] };
  return { kind: "soil_moisture", badge: "Buena", tone: "emerald", level: 3, title: "Tierra Húmeda", advice: "Lista para sembrar", levels: ["Seca", "Media", "Mojada"] };
}

export function describeRainCard(rain7d) {
  const r = Number(rain7d ?? 0);
  if (r < 5) return { kind: "sun_dry", drops: 0, badge: "Seco", tone: "amber", level: 1, title: "Casi Sin Lluvia", advice: "No confíes solo en lluvia", levels: ["Nada", "Regular", "Bastante"] };
  if (r < 20) return { kind: "rain_good", drops: 2, badge: "Ayuda", tone: "sky", level: 2, title: "Lluvia Moderada", advice: "Mojará un poco la chacra", levels: ["Poca", "Moderada", "Fuerte"] };
  return { kind: "rain_good", drops: 3, badge: "Buena", tone: "emerald", level: 3, title: "Buena Lluvia", advice: "Buen momento para sembrar", levels: ["Poca", "Moderada", "Buena"] };
}

export function describeSunCard(netWater) {
  const w = Number(netWater ?? 0);
  if (w <= -12) return { kind: "sun_dry", badge: "Cuidado", tone: "amber", level: 3, title: "El Sol Seca Rápido", advice: "Deja chala o paja encima", levels: ["Suave", "Medio", "Seca mucho"] };
  if (w < 0) return { kind: "stable", badge: "Normal", tone: "sky", level: 2, title: "Sol Moderado", advice: "Riega temprano o tarde", levels: ["Suave", "Normal", "Fuerte"] };
  return { kind: "rain_good", badge: "Fresco", tone: "emerald", level: 1, title: "Tierra Conserva Agua", advice: "La lluvia gana al sol", levels: ["Conserva", "Normal", "Seca"] };
}

export function describeDayVisual(day) {
  const pr = Number(day?.precip_mm ?? 0);
  const tmin = Number(day?.temp_min_c ?? 10);
  const drops = pr < 0.5 ? 0 : pr < 3 ? 1 : pr < 8 ? 2 : 3;
  const rainText = ["Sin lluvia", "Llovizna", "Lluvia", "Aguacero"][drops];
  const nightText = tmin <= 2 ? "¡Helada!" : tmin <= 6 ? "Noche fría" : "Noche templada";
  const byStatus = {
    frost_risk: { kind: "frost", word: "Helada", tone: "rose" },
    chill_caution: { kind: "chill", word: "Frío", tone: "amber" },
    rain_window: { kind: "rain_good", word: "Lluvia", tone: "sky" },
    dry_wind: { kind: "wind", word: "Viento", tone: "amber" },
    stable: drops >= 2 ? { kind: "rain_good", word: "Lluvia", tone: "sky" } : { kind: "stable", word: "Normal", tone: "emerald" },
  };
  const base = byStatus[day?.day_status] || byStatus.stable;
  return { ...base, drops, rainText, nightText };
}

const ALERT_KIND = { frost_critical: "frost", frost_watch: "chill", frost_safe: "stable", water_deficit: "sun_dry", water_ok: "soil_moisture", rain_window: "rain_good", wind_warning: "wind" };

export function cleanAlertForFarmer(alert) {
  if (!alert) return null;
  const cleanTitle = (alert.title_es || "").replace(/\s*\([^)]*\)/g, "").replace(/[¡!]/g, "").trim();
  const sev = alert.severity || "info";
  const style = sev === "critical"
    ? { badgeText: "PELIGRO", bannerPill: "PELIGRO EN TU CHACRA", badgeClass: "bg-rose-100 text-rose-800", borderClass: "border-rose-300 border-l-rose-600", bgClass: "bg-rose-50/70" }
    : sev === "warning"
    ? { badgeText: "CUIDADO", bannerPill: "CUIDADO EN TU CHACRA", badgeClass: "bg-amber-100 text-amber-900", borderClass: "border-amber-300 border-l-amber-500", bgClass: "bg-amber-50/70" }
    : { badgeText: "BUENA NOTICIA", bannerPill: "BUEN TIEMPO", badgeClass: "bg-emerald-100 text-emerald-800", borderClass: "border-emerald-300 border-l-emerald-600", bgClass: "bg-emerald-50/60" };
  return { ...style, kind: ALERT_KIND[alert.id] || "stable", cleanTitle, category: alert.category || "Campo", action: alert.action_es || "" };
}
