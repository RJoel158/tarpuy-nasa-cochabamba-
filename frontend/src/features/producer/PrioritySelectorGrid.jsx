import React from "react";
import { Droplets, Sprout, Mountain, Wheat, Leaf, Coins } from "lucide-react";

const PRIORITIES = [
  { id: "water_conservation", Icon: Droplets, label: "Guardar agua" },
  { id: "nitrogen_fixation", Icon: Sprout, label: "Abonar tierra" },
  { id: "erosion_control", Icon: Mountain, label: "Cuidar ladera" },
  { id: "forage_value", Icon: Wheat, label: "Pasto animales" },
  { id: "organic_matter", Icon: Leaf, label: "Dar vida al suelo" },
  { id: "market_income", Icon: Coins, label: "Mejor venta" },
];

const IRRIGATIONS = [
  { id: "none_secano", label: "Solo lluvia" },
  { id: "deficit_auxiliary", label: "Por turnos" },
  { id: "full_canal_well", label: "Canal o pozo" },
];

const EQUIPMENTS = [
  { id: "manual_yunta", label: "Yunta / A mano" },
  { id: "mixed_tractor_service", label: "Yunta y tractor" },
  { id: "mechanized", label: "Tractor" },
];

export default function PrioritySelectorGrid({
  priorities = [],
  onTogglePriority,
  irrigation,
  onChangeIrrigation,
  equipment,
  onChangeEquipment,
}) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-5 space-y-4">
      <div className="space-y-2">
        <span className="text-xs font-bold text-stone-700 block">¿Qué quieres lograr en tu terreno?</span>
        <div className="flex flex-wrap gap-2">
          {PRIORITIES.map(({ id, Icon, label }) => {
            const active = priorities.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => onTogglePriority(id)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border transition cursor-pointer ${
                  active
                    ? "bg-[#0284C7] text-white border-[#0369A1]"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-stone-100">
        <div className="space-y-1.5">
          <span className="text-xs font-bold text-stone-700 block">¿Cómo riegas?</span>
          <div className="grid grid-cols-3 gap-1.5">
            {IRRIGATIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeIrrigation(opt.id)}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  irrigation === opt.id
                    ? "bg-sky-800 text-white border-sky-900"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-xs font-bold text-stone-700 block">¿Con qué trabajas?</span>
          <div className="grid grid-cols-3 gap-1.5">
            {EQUIPMENTS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeEquipment(opt.id)}
                className={`py-2 px-2 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  equipment === opt.id
                    ? "bg-stone-800 text-white border-stone-900"
                    : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
