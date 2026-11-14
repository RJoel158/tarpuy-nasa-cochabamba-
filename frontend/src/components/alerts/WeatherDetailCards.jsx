import HorizontalCarousel from "../ui/HorizontalCarousel.jsx";
import React from "react";
import { WeatherIllustration, RainDropsVisual, describeTempCard, describeSoilCard, describeRainCard, describeSunCard, TONE_CLASSES } from "../../variants/liz/components/alerts/WeatherPictograms.jsx";
const value = (n,unit) => n === null || n === undefined || n === "" || !Number.isFinite(Number(n)) ? "Sin dato" : `${Number(n).toLocaleString("es-BO",{maximumFractionDigits:1})}${unit}`;

export default function WeatherDetailCards({ current = {}, summary = {}, lang = "es" }) {
  const cards=[
    {key:"temp",label:lang === "qu" ? "Chiri q'uñi" : "Temperatura",...describeTempCard(current.temp_c,summary.min_temp_7d_c,lang), metrics:[`Actual: ${value(current.temp_c," °C")}`,`Mín: ${value(summary.min_temp_7d_c," °C")} · Máx: ${value(summary.max_temp_7d_c," °C")}`]},
    {key:"soil",label:lang === "qu" ? "Allpayki" : "Tu tierra",...describeSoilCard(current.soil_moisture_top_pct,lang),metrics:[`Suelo: ${value(current.soil_moisture_top_pct," %")}`,`Aire: ${value(current.humidity_pct," %")}`]},
    {key:"rain",label:lang === "qu" ? "Para · 7 p'unchaw" : "Lluvia · 7 días",...describeRainCard(summary.total_precip_7d_mm,lang),metrics:[value(summary.total_precip_7d_mm," mm")],isRain:true},
    {key:"sun",label:lang === "qu" ? "Inti wan ch'aki" : "Sol y sequedad",...describeSunCard(summary.net_water_balance_7d_mm,lang),metrics:[`ET₀: ${value(summary.total_et0_7d_mm," mm")}`,`Balance: ${value(summary.net_water_balance_7d_mm," mm")}`]},
  ];
  return <HorizontalCarousel label="Detalle técnico y estado del suelo" kind="detail">{cards.map(card=>{
    const tone=TONE_CLASSES[card.tone]||TONE_CLASSES.sky;
    return <article key={card.key} className="weather-liz-card">
      <header className="weather-liz-header"><WeatherIllustration kind={card.kind} className="w-12 h-12 shrink-0"/><h3>{card.label}</h3></header>
      <span className="weather-liz-badge" style={{background:tone.bgVar}}>{card.badge}</span>
      <div className="weather-liz-copy"><h4>{card.title}</h4><p>{card.advice}</p></div>
      <div className="weather-liz-metrics">{card.metrics.map(metric=><p key={metric}>{metric}</p>)}</div>
      <footer className="weather-liz-scale">
        {card.isRain && <RainDropsVisual count={card.drops} text={lang === "qu" ? "Para · 7 p'unchaw" : "Acumulado semanal"} lang={lang}/>}
        <div className="grid grid-cols-3 gap-2" aria-hidden="true">{[1,2,3].map(i=><span key={i} className="h-3 rounded-full border-2 border-[var(--tinta)]" style={{background:i<=card.level?tone.barVar:"var(--arena)"}}/>)}</div>
        <div className="weather-liz-scale-labels">{(card.isRain ? ["Poca","Media","Mayor"] : card.levels||[]).map(label=><span key={label}>{label}</span>)}</div>
      </footer>
    </article>;
  })}</HorizontalCarousel>;
}
