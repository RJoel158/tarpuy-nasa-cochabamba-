import React from "react";
import { Droplets, Sprout, Mountain, Wheat, Leaf, Coins } from "lucide-react";

const PRIORITIES = [
  { id: "water_conservation", Icon: Droplets, labelEs: "Cuidar el agua", labelQu: "Yaku waqaychay", activeClass: "border-sky-500 bg-sky-50/90 text-sky-950 ring-1 ring-sky-500", iconActive: "text-sky-600" },
  { id: "nitrogen_fixation", Icon: Sprout, labelEs: "Abonar la tierra natural", labelQu: "Wanuchana allpata", activeClass: "border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-1 ring-emerald-500", iconActive: "text-emerald-600" },
  { id: "erosion_control", Icon: Mountain, labelEs: "Que la lluvia no lave la tierra", labelQu: "Qhata allpa jark'ay", activeClass: "border-amber-500 bg-amber-50/90 text-amber-950 ring-1 ring-amber-500", iconActive: "text-amber-600" },
  { id: "forage_value", Icon: Wheat, labelEs: "Pasto para vacas y ovejas", labelQu: "Uywapaq qhora", activeClass: "border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-1 ring-emerald-500", iconActive: "text-emerald-600" },
  { id: "organic_matter", Icon: Leaf, labelEs: "Dar fuerza y vida a la tierra", labelQu: "Allpa kawsay", activeClass: "border-emerald-500 bg-emerald-50/90 text-emerald-950 ring-1 ring-emerald-500", iconActive: "text-emerald-600" },
  { id: "market_income", Icon: Coins, labelEs: "Vender mejor en la feria", labelQu: "Qhatupi chani", activeClass: "border-amber-500 bg-amber-50/90 text-amber-950 ring-1 ring-amber-500", iconActive: "text-amber-600" },
];

const IRRIGATIONS = [
  { id: "none_secano", label: "Solo con lluvia" },
  { id: "deficit_auxiliary", label: "Riego por turnos" },
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
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {PRIORITIES.map((p) => {
          const active = priorities.includes(p.id);
          const Icon = p.Icon;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onTogglePriority(p.id)}
              aria-pressed={active}
              className={`min-h-[64px] p-3 rounded-xl border text-left flex items-center gap-3 transition shadow-xs cursor-pointer ${
                active ? p.activeClass : "border-stone-200 bg-white hover:border-stone-300 text-stone-700"
              }`}
            >
              <div className={`p-2 rounded-lg shrink-0 ${active ? "bg-white shadow-xs" : "bg-stone-100 text-stone-500"}`}>
                <Icon className={`w-5 h-5 ${active ? p.iconActive : ""}`} />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-sm font-bold block leading-tight">{p.labelEs}</span>
                <span className="text-[11px] text-stone-500 italic block truncate">{p.labelQu}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-3 border-t border-stone-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <span className="text-[11px] font-bold text-stone-600 block mb-1.5 uppercase tracking-wide">
            ¿Cómo riegas tu chacra?
          </span>
          <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            {IRRIGATIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeIrrigation(opt.id)}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition text-center ${
                  irrigation === opt.id ? "bg-sky-700 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-[11px] font-bold text-stone-600 block mb-1.5 uppercase tracking-wide">
            ¿Con qué trabajas la tierra?
          </span>
          <div className="flex rounded-xl bg-stone-100 p-1 border border-stone-200">
            {EQUIPMENTS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeEquipment(opt.id)}
                className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg transition text-center ${
                  equipment === opt.id ? "bg-stone-800 text-white shadow-xs" : "text-stone-600 hover:text-stone-900"
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
