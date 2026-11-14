import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const CROP_LABELS = {
  papa_huaycha: { title: "Papa", sub: "Akshu" },
  maiz_valle: { title: "Maíz", sub: "Sara" },
  haba: { title: "Haba", sub: "Jawasa" },
  cebada: { title: "Cebada", sub: "Siwara" },
  quinua: { title: "Quinua", sub: "Kinwa" },
  tarwi: { title: "Tarwi", sub: "Tarwi" },
  avena_vicia: { title: "Avena / Vicia", sub: "Forraje" },
  alfalfa: { title: "Alfalfa", sub: "Alfalfa" },
};

const IRRIGATIONS = [
  { id: "none_secano", label: "Solo lluvia" },
  { id: "deficit_auxiliary", label: "Riego por turnos" },
  { id: "full_canal_well", label: "Canal o pozo" },
];

const PRIORITY_PRESETS = [
  { id: "cuidar_todo", label: "Cuidar agua y tierra", ids: ["water_conservation", "nitrogen_fixation", "erosion_control"] },
  { id: "agua", label: "Guardar humedad", ids: ["water_conservation", "organic_matter"] },
  { id: "abono", label: "Abonar tierra", ids: ["nitrogen_fixation", "organic_matter"] },
  { id: "pasto_venta", label: "Pasto y venta", ids: ["forage_value", "market_income"] },
];

const EQUIPMENTS = [
  { id: "manual_yunta", label: "Yunta o a mano" },
  { id: "mixed_tractor_service", label: "Yunta y tractor" },
  { id: "mechanized", label: "Solo tractor" },
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
}) {
  const [showMore, setShowMore] = useState(false);

  const cropItems = crops.length > 0
    ? crops
    : Object.keys(CROP_LABELS).map((id) => ({ crop_id: id }));

  const isPresetActive = (ids) =>
    ids.length === priorities.length && ids.every((id) => priorities.includes(id));

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 space-y-5">
      {/* Step 1: Last Crop Harvested */}
      <div className="space-y-2">
        <span className="text-sm font-bold text-[#0B2545] block">1. ¿Qué cosechaste último?</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {cropItems.map((c) => {
            const active = cropId === c.crop_id;
            const label = CROP_LABELS[c.crop_id] || { title: c.name_es || c.crop_id, sub: c.name_qu || "" };
            return (
              <button
                key={c.crop_id}
                type="button"
                onClick={() => onChangeCrop(c.crop_id)}
                aria-pressed={active}
                className={`px-3 py-2.5 rounded-xl border text-left transition cursor-pointer ${
                  active
                    ? "bg-[#0284C7] text-white border-[#0369A1] shadow-xs"
                    : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span className="block text-sm font-bold leading-tight">{label.title}</span>
                {label.sub ? (
                  <span className={`block text-[11px] mt-0.5 ${active ? "text-sky-100" : "text-slate-500"}`}>
                    {label.sub}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Water Availability */}
      <div className="space-y-2 pt-4 border-t border-slate-100">
        <span className="text-sm font-bold text-[#0B2545] block">2. ¿Con qué agua cuentas?</span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {IRRIGATIONS.map((opt) => {
            const active = irrigation === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeIrrigation(opt.id)}
                aria-pressed={active}
                className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition cursor-pointer ${
                  active
                    ? "bg-[#0B2545] text-white border-[#081B33]"
                    : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Collapsible Details */}
      <div className="pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={() => setShowMore((p) => !p)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0284C7] hover:text-[#0369A1] cursor-pointer"
        >
          {showMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>Más detalles de tu terreno (opcional)</span>
        </button>

        {showMore ? (
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">¿Qué buscas más?</span>
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
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">¿Con qué trabajas?</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {EQUIPMENTS.map((opt) => {
                  const active = equipment === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onChangeEquipment(opt.id)}
                      aria-pressed={active}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        active
                          ? "bg-[#0B2545] text-white border-[#081B33]"
                          : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
