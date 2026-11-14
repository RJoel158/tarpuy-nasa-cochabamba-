import React from "react";
import { Volume2, Sprout } from "lucide-react";
import { TarjetaGrande, BotonGrande } from "../../variants/liz/components/ui/TarpuyBaseComponents.jsx";
import { IlustracionTarpuy } from "../../variants/liz/components/illustrations/TarpuyIllustrations.jsx";
import { decideFarmerWaterAction } from "../../services/farmerWaterAction.js";
import { waterActionText, tr } from "../../utils/quechuaI18n.js";
import { buildWaterActionNarration } from "../../services/narration.js";

export default function FarmerWaterActionCard({ bulletin, drainage, district, lang, onSpeak, activeAudioKey, onPlant, advanced }) {
  const action = decideFarmerWaterAction(bulletin, drainage);
  const text = waterActionText(action, lang);
  const audioKey = `water_${bulletin?.zone_id}_${lang}_${action.reason}`;
  const summary = bulletin?.predictions_summary || {};
  const date = bulletin?.fetched_at_utc ? new Date(bulletin.fetched_at_utc) : null;
  const dateLabel = date && Number.isFinite(date.getTime())
    ? date.toLocaleString("es-BO", { timeZone: "America/La_Paz", dateStyle: "short", timeStyle: "short" }) : "";
  const illustration = action.reason === "frost" ? "helada" : action.code === "CAUTION" ? "lluvia" : action.code === "IRRIGATE" ? "tierra_seca" : "tierra_humeda";
  return <section aria-label={text.heading} className="space-y-4 min-w-0">
    <h2 className="tarpuy-title break-words">{text.heading}</h2>
    <TarjetaGrande titulo={text.title} texto={text.message}
      dibujo={<IlustracionTarpuy id={illustration} size={84} />}
      semaforo={action.code === "CAUTION" || action.reason === "frost" ? "cuidado" : "tranquilo"}
      etiquetaSemaforo={text.title}>
      {district && <p className="tarpuy-body font-bold">{district}</p>}
      <p className="text-sm" style={{ color: "var(--tinta-suave)" }}>{text.scope}</p>
      {dateLabel && <p className="text-sm" style={{ color: "var(--tinta-apagada)" }}>
        {lang === "qu" ? "Yachaypa p'unchawnin" : "Fecha del boletín"}: {dateLabel}
      </p>}
      <div className="grid w-full gap-3 pt-4 sm:grid-cols-2">
        <BotonGrande variante="agua" estado={activeAudioKey === audioKey ? "presionado" : "normal"}
          dibujo={<Volume2 aria-hidden="true" />} texto={tr(lang, activeAudioKey === audioKey ? "stopAudio" : "listenBtn")}
          onClick={() => onSpeak(buildWaterActionNarration(action, lang), lang, audioKey)} />
        <BotonGrande variante="primario" dibujo={<Sprout aria-hidden="true" />} texto={text.plant} onClick={onPlant} />
      </div>
      {advanced && <details className="w-full text-left rounded-xl p-3 mt-4" style={{ background: "var(--arena)", border: "2px solid var(--tinta)" }}>
        <summary className="cursor-pointer font-bold">{text.details}</summary>
        <p>Humedad: {bulletin?.current_conditions?.soil_moisture_top_pct ?? "—"}% · Balance 7 días: {summary.net_water_balance_7d_mm ?? "—"} mm · Mínima: {summary.min_temp_7d_c ?? "—"} °C</p>
        <p>Drenaje: {drainage ? `${drainage.tipo} · ${drainage.clasificacion}` : "Sin información confirmada"}</p>
      </details>}
    </TarjetaGrande>
  </section>;
}
