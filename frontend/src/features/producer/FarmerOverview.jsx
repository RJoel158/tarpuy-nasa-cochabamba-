import React from "react";
import { MapPin, Sprout, Volume2, Download, WifiOff } from "lucide-react";
import { CropIllustration } from "./FarmPictograms.jsx";
import { tr } from "../../utils/quechuaI18n.js";

export default function FarmerOverview({
  community, zone, crop, cropId, lang, offline, saved, onPlant, onMap, onSave, onListen, speaking,
}) {
  const qu = lang === "qu";
  const savedHere = saved?.zoneId === zone?.zone_id && saved?.updatedAt;
  const date = savedHere ? new Date(saved.updatedAt) : null;
  const dateLabel = date && !Number.isNaN(date.getTime())
    ? date.toLocaleString("es-BO", { dateStyle: "short", timeStyle: "short" }) : "";
  return (
    <section aria-label={qu ? "Chakray" : "Mi parcela"} className="rounded-3xl border border-emerald-200 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-4">
        <CropIllustration cropId={cropId} className="w-20 h-20 shrink-0" />
        <div className="min-w-0">
          <p className="font-semibold text-emerald-800">{qu ? "Chakray" : "Mi parcela"}</p>
          <h2 className="text-2xl font-bold text-[#0B2545] break-words">{community || zone?.name}</h2>
          <p className="text-sm text-slate-600">{tr(lang, "stepLastCrop")}</p>
          <p className="text-lg font-semibold">{(qu ? crop?.name_qu : crop?.name_es) || crop?.name_es || cropId}</p>
        </div>
      </div>
      <p className="text-sm text-slate-600">
        {qu ? "Llaqta" : "Zona de referencia"}: {zone?.name || "—"}.
        {!qu && " Los datos describen esta zona. Revisa también la tierra de tu parcela."}
      </p>
      {offline && <p role="status" className="flex gap-2 rounded-xl bg-amber-50 p-3 text-amber-950">
        <WifiOff className="w-6 h-6 shrink-0" aria-hidden="true" />
        {tr(lang, "offline")} · {savedHere ? dateLabel : (qu ? "Mana waqaychasqachu" : "Esta zona todavía no está guardada")}
      </p>}
      {!offline && savedHere && <p className="text-sm text-slate-600">{qu ? "Waqaychasqa" : "Copia guardada"} · {dateLabel}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <button type="button" onClick={onPlant} className="min-h-16 flex items-center justify-center gap-3 rounded-2xl bg-emerald-700 px-4 py-3 text-lg font-bold text-white">
          <Sprout aria-hidden="true" className="w-7 h-7" />{tr(lang, "navPlant")}
        </button>
        <button type="button" onClick={onListen} className="min-h-16 flex items-center justify-center gap-3 rounded-2xl bg-amber-100 px-4 py-3 font-bold text-amber-950">
          <Volume2 aria-hidden="true" className="w-7 h-7" />{tr(lang, speaking ? "stopAudio" : "listenGuide")}
        </button>
        <button type="button" onClick={onMap} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 p-3 font-semibold">
          <MapPin aria-hidden="true" className="w-6 h-6" />{qu ? tr(lang, "community") : "Cambiar comunidad"}
        </button>
        <button type="button" onClick={onSave} disabled={offline} className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 p-3 font-semibold disabled:opacity-50">
          <Download aria-hidden="true" className="w-6 h-6" />{qu ? tr(lang, "refreshCopy") : "Guardar para usar sin internet"}
        </button>
      </div>
    </section>
  );
}
