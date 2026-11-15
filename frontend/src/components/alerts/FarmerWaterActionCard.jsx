import React from "react";
import { Megaphone } from "lucide-react";
import { IlustracionTarpuy } from "../illustrations/TarpuyIllustrations.jsx";
import { BotonGrande } from "../ui/TarpuyBaseComponents.jsx";
import { decideFarmerWaterAction } from "../../services/farmerWaterAction.js";
import { waterActionText } from "../../utils/quechuaI18n.js";

export default function FarmerWaterActionCard({
  bulletin,
  drainage,
  district,
  tip,
  lang,
  onSpeak,
  activeAudioKey,
  onPlant,
  advanced,
  crop = null,
  onOpenMunicipalAlert = null,
}) {
  const action = decideFarmerWaterAction(bulletin, drainage);
  const text = waterActionText(action, lang);
  const visual = {
    current_rain: { icon: "lluvia", title: "Si llueve, revisa el drenaje", cue: "Antes de añadir agua", bg: "var(--cielo-suave)" },
    rain_forecast: { icon: "riego_gravedad", title: "Prepara la salida del agua", cue: "Lluvia abundante prevista", bg: "var(--alerta-cuidado-suave)" },
    frost: { icon: "helada", title: "Cuida los brotes del frío", cue: "Posible daño por frío", bg: "var(--alerta-cuidado-suave)" },
    drainage: { icon: "riego_gravedad", title: "Comprueba por dónde sale el agua", cue: "Revisa el drenaje", bg: "var(--cielo-suave)" },
    reference_deficit: { icon: "mano_toca", title: "Comprueba cómo se siente la tierra", cue: "Antes de decidir el riego", bg: "var(--arena)" },
    check: { icon: "estudio_suelo", title: "Comprueba cómo se siente la tierra", cue: "Comprueba tu parcela", bg: "var(--arena)" },
    data_review: { icon: "pin_ubicacion", title: "Primero confirma tu ubicación", cue: "Datos por confirmar", bg: "var(--arena)" },
  }[action.reason] || { icon: "estudio_suelo", title: text.title, cue: "Antes de regar", bg: "var(--arena)" };
  const summary = bulletin?.predictions_summary || {};
  const summary14d = bulletin?.predictions_summary_14d || {};
  const et0 = Number(summary.total_et0_7d_mm);
  const kc = Number(crop?.kc_mid);
  const etcEstimate = Number.isFinite(et0) && Number.isFinite(kc) ? Math.round(et0 * kc * 10) / 10 : null;
  const municipalAlert = bulletin?.municipal_alert;

  const date = bulletin?.fetched_at_utc ? new Date(bulletin.fetched_at_utc) : null;
  const dateLabel = date && Number.isFinite(date.getTime())
    ? date.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" }) : "";
  return <section aria-label={text.heading} className={`water-advice water-advice--${action.code.toLowerCase()}`}>
    <div className="water-advice-heading">
      <p className="text-sm font-bold">{text.heading}</p>
      {district && <p className="text-sm text-slate-600 break-words">{district}</p>}
    </div>
    {tip ? <p className="text-sm font-medium">{tip}</p> : null}
    <div className="water-advice-visual" style={{ backgroundColor: visual.bg }}>
      <div className="water-advice-drawing"><IlustracionTarpuy id={visual.icon} size={128} /></div>
      <div className="min-w-0 space-y-2">
        <p className="text-sm font-bold">{visual.cue}</p>
        <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">{visual.title}</h2>
        <p className="text-base leading-relaxed font-medium">{["reference_deficit", "check"].includes(action.reason)
          ? "Toma un poco de tierra a la profundidad de las raíces. Apriétala y observa si está seca al tacto, húmeda o muy pegajosa."
          : text.instruction || text.message}</p>
      </div>
    </div>
    <p className="text-sm">Compruébalo en tu parcela; es una orientación del modelo.</p>
    {lang === "qu" && text.language === "es" && <p className="text-sm">Interpretación en castellano; traducción quechua pendiente de validación.</p>}
    <details className="text-sm water-advice-explanation">
      <summary className="cursor-pointer font-bold py-2 min-h-11">Por qué esta recomendación</summary>
      <div className="space-y-3 pt-2">
        <p>{text.title}. {text.message}</p>
        <p>La forma en que se deshace o se pega la tierra también depende de si es arenosa o arcillosa. Que esté suelta o dura no basta para decidir el riego. La inclinación indica la pendiente de la parcela y se evalúa por separado.</p>
        {action.evidence?.length > 0 && <ul className="list-disc pl-5">{action.evidence.map(item => <li key={item}>{item}</li>)}</ul>}
        {dateLabel && <p className="water-advice-date">Fecha del boletín: {dateLabel}</p>}
        {advanced && <div className="space-y-2">
          <p>Humedad superficial estimada por el modelo: {bulletin?.current_conditions?.soil_moisture_top_pct ?? "—"}% · Balance 7 días: {summary.net_water_balance_7d_mm ?? "—"} mm · Mínima: {summary.min_temp_7d_c ?? "—"} °C</p>
          {summary14d.net_water_balance_14d_mm !== undefined && <p>Proyección 14 días: {summary14d.total_precip_14d_mm} mm lluvia vs {summary14d.total_et0_14d_mm} mm ET0 (balance {summary14d.net_water_balance_14d_mm} mm)</p>}
          <p>Drenaje: {drainage ? `${drainage.tipo} · ${drainage.clasificacion}` : "Sin información confirmada"}</p>
          {etcEstimate !== null && <p>ETc ≈ Kc×ET0 ({crop?.common_name_es || crop?.crop_id || "cultivo"}): {etcEstimate} mm en 7 días (orientativo FAO-56).</p>}
        </div>}
      </div>
    </details>
    <div className="flex flex-wrap items-center gap-3">
      <BotonGrande variante="secundario" ilustracionId="mano_siembra" texto={text.plant} onClick={onPlant} className="w-full sm:w-auto" />
    </div>

    {municipalAlert && (
      <button
        type="button"
        onClick={() => onOpenMunicipalAlert?.(municipalAlert)}
        className="water-advice-share"
      >
        <Megaphone className="w-5 h-5" />
        <span>{lang === "qu" ? "Larq'a runakunaman willay (WhatsApp)" : "Coordinar con regantes"}</span>
      </button>
    )}

  </section>;
}
