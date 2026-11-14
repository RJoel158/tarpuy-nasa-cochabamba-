import React, { useState } from "react";
import { IlustracionTarpuy } from "./illustrations/TarpuyIllustrations.jsx";
import { CropIllustration, WaterIllustration } from "../features/producer/FarmPictograms.jsx";
import RotationCard from "../features/producer/RotationCard.jsx";
import { AlertsModal } from "./ui/FeedbackSystem.jsx";
import { buildWeatherNarration } from "../services/narration.js";

export function GuidedWeather({ bulletin, community, referenceZone, onPlant, onMap, onSpeak, activeAudioKey, lang = "es" }) {
  const [alertsOpen, setAlertsOpen] = useState(false);
  const alerts = bulletin?.active_alerts || [];
  const risk = alerts.some(a => a.severity === "critical") ? "critical" : alerts.some(a => a.severity === "warning") ? "warning" : "info";
  const color = !bulletin ? "var(--tinta-apagada)" : risk === "critical" ? "var(--alerta-critico)" : risk === "warning" ? "var(--alerta-cuidado)" : "var(--hoja-oscura)";
  const current = bulletin?.current_conditions || {};
  const summary = bulletin?.predictions_summary || {};
  const qu = lang === "qu";
  const valid = n => n !== null && n !== undefined && Number.isFinite(Number(n));
  const audioKey = `guided_weather_${lang}`;
  return <div className="space-y-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm text-slate-600">{qu ? "Llaqta" : "Tu zona"} · {community}</p><h1 className="tarpuy-title">{qu ? "Kunan pacha" : "Antes de ir a tu chacra"}</h1></div><button onClick={onMap} className="flow-link">Cambiar ubicación</button></header>
    <section className="flow-risk" style={{borderColor:color}} aria-label="Semáforo de riesgos">
      <div className="flex gap-2 shrink-0" aria-hidden="true">{["info","warning","critical"].map((level,i)=><span key={level} className="w-4 h-4 rounded-full border border-black/15" style={{background:bulletin && risk===level ? ["var(--hoja-oscura)","var(--alerta-cuidado)","var(--alerta-critico)"][i] : "var(--arena)"}} />)}</div>
      <div className="flex-1 min-w-0"><h2 className="text-xl font-extrabold">{!bulletin ? "Faltan datos del clima" : risk === "critical" ? "Riesgo alto en tu zona" : risk === "warning" ? "Atención en tu zona" : "Sin alertas activas en los datos"}</h2><p className="text-base text-slate-600">{!bulletin ? "Revisa la conexión o consulta una copia guardada." : `${alerts.length} aviso${alerts.length === 1 ? "" : "s"}. Consulta qué hacer y cuándo.`}</p></div>
      <button type="button" disabled={!bulletin} onClick={()=>setAlertsOpen(true)} className="flow-link">Ver avisos</button>
    </section>
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {[
        ["termometro_calor","Temperatura",valid(current.temp_c) ? `${current.temp_c} °C` : "Sin dato"],
        ["lluvia","Lluvia · 7 días",valid(summary.total_precip_7d_mm) ? `${summary.total_precip_7d_mm} mm` : "Sin dato"],
        ["tierra_humeda","Suelo superficial",valid(current.soil_moisture_top_pct) ? `${current.soil_moisture_top_pct} %` : "Sin dato"],
      ].map(([image,title,value])=><article key={title} className="flow-weather-stat"><IlustracionTarpuy id={image} size={52}/><h2 className="text-sm font-bold">{title}</h2><p className="text-lg sm:text-2xl font-extrabold">{value}</p></article>)}
    </div>
    <section aria-label="Pronóstico de la semana"><h2 className="text-xl font-extrabold mb-3">Los próximos días</h2><div className="flow-carousel">
      {(bulletin?.seven_day_forecast || []).map(day=><article key={day.date} className="flow-day"><p className="font-extrabold">{new Date(`${day.date}T12:00:00-04:00`).toLocaleDateString("es-BO",{weekday:"short",day:"numeric",month:"short",timeZone:"America/La_Paz"})}</p><IlustracionTarpuy id={Number(day.precip_mm)>=3 ? "lluvia" : Number(day.temp_min_c)<=2 ? "helada" : "sol"} size={54}/><p>{day.temp_min_c ?? "—"}° / {day.temp_max_c ?? "—"}°</p><p className="text-sm text-slate-600">{day.precip_mm ?? "—"} mm</p></article>)}
    </div></section>
    <p className="text-sm text-slate-600">Datos de referencia: {referenceZone || community}. No son una medición de tu parcela ni un pronóstico distrital.{bulletin?.fetched_at_utc ? ` Actualizado: ${new Date(bulletin.fetched_at_utc).toLocaleString("es-BO")}.` : ""} Comprueba también la tierra antes de regar.</p>
    <div className="flex flex-wrap gap-3"><button disabled={!bulletin} className="flow-secondary" onClick={()=>onSpeak(buildWeatherNarration(bulletin,community,lang),lang,audioKey)}>{activeAudioKey===audioKey ? "Detener audio" : qu ? "Uyariy" : "Escuchar resumen"}</button><button className="flow-primary" onClick={onPlant}>{qu ? "Imata tarpuy" : "Ahora, qué sembrar"} →</button></div>
    <AlertsModal open={alertsOpen} onClose={()=>setAlertsOpen(false)} alerts={alerts} zoneName={community} lang={lang}/>
  </div>;
}

export function GuidedSowing(props) {
  const { crops=[],cropId,onChangeCrop,irrigation,onChangeIrrigation,strategies=[],zone,indicators=zone?.monthly_harmonized_indicators || [],onSpeak,activeAudioKey,lang="es",isCalculating }=props;
  const [step,setStep]=useState(0);
  const [selected,setSelected]=useState("");
  const ordered=[...strategies.filter(s=>s.strategy_type!=="current_baseline"),...strategies.filter(s=>s.strategy_type==="current_baseline")];
  const strategy=ordered.find(s=>s.strategy_id===selected)||ordered[0];
  return <div className="space-y-6">
    <header><p className="text-sm text-slate-600">Tu próxima siembra · {zone?.name}</p><h1 className="tarpuy-title">{step===0 ? "¿Qué cosechaste antes?" : step===1 ? "¿Con qué agua cuentas?" : "Una opción para tu tierra"}</h1></header>
    <nav aria-label="Pasos para elegir cultivo" className="flex flex-wrap gap-3">{["Cultivo anterior","Agua","Tu plan"].map((label,i)=><button key={label} onClick={()=>i<step&&setStep(i)} disabled={i>step} aria-current={step===i?"step":undefined} className={`flow-step ${step===i?"flow-step-active":""}`}>{i+1}. {label}</button>)}</nav>
    {step===0 && <><p>Elige el último cultivo de tu parcela.</p><div className="flow-carousel">{crops.map(c=><button key={c.crop_id} onClick={()=>onChangeCrop(c.crop_id)} aria-pressed={cropId===c.crop_id} className={`flow-crop ${cropId===c.crop_id?"flow-selected":""}`}><CropIllustration cropId={c.crop_id} className="w-20 h-20"/><span>{(lang==="qu" ? c.name_qu : c.name_es)||c.common_name_es||c.crop_id}</span></button>)}</div><button className="flow-primary" disabled={!cropId} onClick={()=>setStep(1)}>Continuar →</button></>}
    {step===1 && <><div className="flow-carousel">{[["none_secano","Solo lluvia"],["deficit_auxiliary","Riego por turnos"],["full_canal_well","Canal o pozo"]].map(([id,label])=><button key={id} aria-pressed={irrigation===id} onClick={()=>onChangeIrrigation(id)} className={`flow-crop ${irrigation===id?"flow-selected":""}`}><WaterIllustration id={id} className="w-20 h-20"/><span>{label}</span></button>)}</div><button className="flow-primary" onClick={()=>setStep(2)}>Ver mi plan →</button></>}
    {step===2 && <>{isCalculating ? <p role="status">Actualizando opciones para tu parcela…</p> : strategy ? <><label className="block font-bold">Comparar opciones<select value={strategy.strategy_id} onChange={e=>setSelected(e.target.value)} className="flow-select">{ordered.map((s,i)=><option key={s.strategy_id} value={s.strategy_id}>{i+1}. {s.title_es}</option>)}</select></label><RotationCard strategy={strategy} index={ordered.indexOf(strategy)+1} indicators={indicators} onSpeak={onSpeak} activeAudioKey={activeAudioKey} lang={lang} isAdvanced={false} compact/></> : <p role="status">No hay una recomendación disponible para esta selección.</p>}</>}
  </div>;
}
