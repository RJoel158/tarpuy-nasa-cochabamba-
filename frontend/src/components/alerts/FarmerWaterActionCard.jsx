import React from "react";
import { Droplets, Hand, TriangleAlert, Volume2, Sprout, Megaphone } from "lucide-react";
import { decideFarmerWaterAction } from "../../services/farmerWaterAction.js";
import { waterActionText, tr } from "../../utils/quechuaI18n.js";
import { buildWaterActionNarration } from "../../services/narration.js";

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
  const Icon = { IRRIGATE: Droplets, WAIT: Hand, CAUTION: TriangleAlert }[action.code];

  const audioKey = `water_${bulletin?.zone_id}_${lang}_${action.reason}`;
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
    <div className="water-advice-title">
      <span className="water-advice-icon"><Icon aria-hidden="true" className="w-10 h-10" /></span>
      <h2 className="text-2xl font-extrabold">{text.title}</h2>
    </div>
    <p className="text-base sm:text-lg leading-relaxed font-medium">{text.message}</p>
    <p className="text-sm text-slate-600">{text.scope}</p>
    {dateLabel && <p className="water-advice-date">
      {lang === "qu" ? "Yachaypa p'unchawnin" : "Fecha del boletín"}: {dateLabel}
    </p>}
    <div className="water-advice-actions">
      <button type="button" aria-pressed={activeAudioKey === audioKey}
        onClick={() => onSpeak(buildWaterActionNarration(action, lang), lang, audioKey)}
        className="weather-action weather-action--primary">
        <Volume2 aria-hidden="true" />{tr(lang, activeAudioKey === audioKey ? "stopAudio" : "listenBtn")}
      </button>
      <button type="button" onClick={onPlant} className="weather-action">
        <Sprout aria-hidden="true" />{text.plant}
      </button>
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

    {advanced && <details className="rounded-xl bg-white p-3 space-y-1.5">
      <summary className="cursor-pointer font-semibold">{text.details}</summary>
      <p>Humedad: {bulletin?.current_conditions?.soil_moisture_top_pct ?? "—"}% · Balance 7 días: {summary.net_water_balance_7d_mm ?? "—"} mm · Mínima: {summary.min_temp_7d_c ?? "—"} °C</p>
      {summary14d.net_water_balance_14d_mm !== undefined && (
        <p>Proyección 14 días: {summary14d.total_precip_14d_mm} mm lluvia vs {summary14d.total_et0_14d_mm} mm ET0 (balance {summary14d.net_water_balance_14d_mm} mm)</p>
      )}
      <p>Drenaje: {drainage ? `${drainage.tipo} · ${drainage.clasificacion}` : "Sin información confirmada"}</p>
      {etcEstimate !== null ? (
        <p>ETc ≈ Kc×ET0 ({crop?.common_name_es || crop?.crop_id || "cultivo"}): {etcEstimate} mm en 7 días (orientativo FAO-56).</p>
      ) : null}
    </details>}
  </section>;
}
