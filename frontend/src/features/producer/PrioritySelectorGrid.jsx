import React from "react";
import { CheckCircle2 } from "lucide-react";
import { CropIllustration, WaterIllustration, ToolIllustration } from "./FarmPictograms.jsx";
import { tr } from "../../utils/quechuaI18n.js";

const CROP_LABELS = {
  papa_huaycha: { title: "Papa", sub: "Akshu" },
  maiz_valle: { title: "Maíz", sub: "Sara" },
  haba: { title: "Haba", sub: "Jawasa" },
  cebada: { title: "Cebada", sub: "Siwara" },
  quinua: { title: "Quinua", sub: "Kinwa" },
  tarwi: { title: "Tarwi", sub: "Tarwi" },
  avena_vicia: { title: "Avena / Vicia", sub: "Uywa mikhuna" },
  alfalfa: { title: "Alfalfa", sub: "Alfalfa" },
};

const IRRIGATIONS = [
  { id: "none_secano", es: "Solo lluvia", esCue: "Agua de lluvia", qu: "Para yakulla", quCue: "Pachamanta yaku" },
  { id: "deficit_auxiliary", es: "Riego por turnos", esCue: "Agua por mitas", qu: "Mit'awan parqoy", quCue: "Tanda yaku" },
  { id: "full_canal_well", es: "Canal o pozo", esCue: "Riego frecuente", qu: "Larq'amanta / Poso", quCue: "Sapa kuti parqoy" },
];

const PRIORITY_PRESETS = [
  { id: "cuidar_todo", es: "Cuidar agua y tierra", qu: "Yakuta allpata jark'ay", ids: ["water_conservation", "nitrogen_fixation", "erosion_control"] },
  { id: "agua", es: "Guardar humedad", qu: "Uqhu allpa waqaychay", ids: ["water_conservation", "organic_matter"] },
  { id: "abono", es: "Abonar tierra", qu: "Allpata wanuchay", ids: ["nitrogen_fixation", "organic_matter"] },
  { id: "pasto_venta", es: "Pasto y venta", qu: "Uywa q'achu, qhatu", ids: ["forage_value", "market_income"] },
];

const EQUIPMENTS = [
  { id: "manual_yunta", es: "Yunta o a mano", qu: "Yunta icha makiwan" },
  { id: "mixed_tractor_service", es: "Yunta y tractor", qu: "Yuntawan tractorwan" },
  { id: "mechanized", es: "Solo tractor", qu: "Tractorllawan" },
];

export default function PrioritySelectorGrid({
  crops = [],
  cropId,
  onChangeCrop,
  priorities = [],
  onChangePriorities,
  irrigation,
  onChangeIrrigation,
  equipment,
  onChangeEquipment,
  isAdvanced = false,
  lang = "es",
}) {
  const qu = lang === "qu";
  const cropItems = crops.length > 0
    ? crops
    : Object.keys(CROP_LABELS).map((id) => ({ crop_id: id }));

  const isPresetActive = (ids) =>
    ids.length === priorities.length && ids.every((id) => priorities.includes(id));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-5">
      {/* Step 1: Last Crop Harvested */}
      <div className="space-y-2">
        <span className="text-lg font-bold text-[#0B2545] block">{tr(lang, "stepLastCrop")}</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {cropItems.map((c) => {
            const active = cropId === c.crop_id;
            const meta = CROP_LABELS[c.crop_id] || { title: c.name_es || c.crop_id, sub: c.name_qu || "" };
            const mainName = qu ? (meta.sub || meta.title) : meta.title;
            const subName = qu ? meta.title : meta.sub;
            return (
              <button
                key={c.crop_id}
                type="button"
                onClick={() => onChangeCrop(c.crop_id)}
                aria-pressed={active}
                className={`relative min-h-28 p-3 rounded-2xl border-2 text-left transition cursor-pointer flex flex-col items-center justify-center gap-2 min-w-0 ${
                  active
                    ? "bg-[#0284C7] text-white border-[#0369A1] shadow-xs"
                    : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {active && <CheckCircle2 aria-hidden="true" className="absolute right-2 top-2 w-5 h-5" />}
                <span className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <CropIllustration cropId={c.crop_id} className="w-12 h-12" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-bold leading-snug break-words">{mainName}</span>
                  {subName ? (
                    <span className={`block text-sm mt-1 break-words ${active ? "text-sky-100" : "text-slate-500"}`}>
                      {subName}
                    </span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Water Availability */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <span className="text-lg font-bold text-[#0B2545] block">{tr(lang, "stepWater")}</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {IRRIGATIONS.map((opt) => {
            const active = irrigation === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeIrrigation(opt.id)}
                aria-pressed={active}
                className={`relative min-h-24 p-3 rounded-2xl border-2 text-left transition cursor-pointer flex items-center gap-3 ${
                  active
                    ? "bg-[#0B2545] text-white border-[#081B33]"
                    : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {active && <CheckCircle2 aria-hidden="true" className="absolute right-2 top-2 w-5 h-5" />}
                <span className="w-14 h-14 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  <WaterIllustration id={opt.id} className="w-12 h-12" />
                </span>
                <span className="min-w-0">
                  <span className="block text-base font-bold leading-snug">{qu ? opt.qu : opt.es}</span>
                  <span className={`block text-sm mt-1 ${active ? "text-sky-200" : "text-slate-500"}`}>{qu ? opt.quCue : opt.esCue}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Controls: Priorities & Tools */}
      {isAdvanced ? (
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">{tr(lang, "stepPriorities")}</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRIORITY_PRESETS.map((preset) => {
                const active = isPresetActive(preset.ids);
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onChangePriorities(preset.ids)}
                    aria-pressed={active}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                      active
                        ? "bg-[#0284C7] text-white border-[#0369A1]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {qu ? preset.qu : preset.es}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 block">{tr(lang, "stepTools")}</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {EQUIPMENTS.map((opt) => {
                const active = equipment === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onChangeEquipment(opt.id)}
                    aria-pressed={active}
                    className={`p-2.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-2.5 text-left ${
                      active
                        ? "bg-[#0B2545] text-white border-[#081B33]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                      <ToolIllustration id={opt.id} className="w-8 h-8" />
                    </span>
                    <span>{qu ? opt.qu : opt.es}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
