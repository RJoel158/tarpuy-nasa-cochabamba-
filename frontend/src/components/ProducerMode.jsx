import React from "react";

const PRIORITIES = [
  { id: "water_conservation", icon: "💧", label: "Cuidar agua" },
  { id: "nitrogen_fixation", icon: "🌱", label: "Fijar nitrógeno" },
  { id: "erosion_control", icon: "⛰️", label: "Cuidar ladera" },
  { id: "forage_value", icon: "🐄", label: "Forraje ganado" },
  { id: "organic_matter", icon: "🍂", label: "Materia orgánica" },
  { id: "market_income", icon: "🪙", label: "Ingreso en feria" },
];

const IRRIGATIONS = [
  { id: "none_secano", label: "Secano (Lluvia)" },
  { id: "deficit_auxiliary", label: "Riego parcial" },
  { id: "full_canal_well", label: "Canal / Pozo" },
];

const EQUIPMENTS = [
  { id: "manual_yunta", label: "Manual / Yunta" },
  { id: "mixed_tractor_service", label: "Mixto" },
  { id: "mechanized", label: "Tractor" },
];

const LIGHT_COLORS = { green: "bg-emerald-500 text-white", yellow: "bg-amber-400 text-slate-900", red: "bg-rose-500 text-white" };

export default function ProducerMode({ zone, priorities, onTogglePriority, irrigation, onChangeIrrigation, equipment, onChangeEquipment, strategies, onSpeak, activeAudioKey }) {
  return (
    <div className="space-y-6">
      <section className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-base font-bold text-slate-900 mb-2">🎯 ¿Qué busca mejorar en su chorrera o parcela?</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PRIORITIES.map((p) => {
            const active = priorities.includes(p.id);
            return (
              <button key={p.id} type="button" onClick={() => onTogglePriority(p.id)} className={`p-3 rounded-xl border-2 flex items-center gap-2 text-left font-semibold transition ${active ? "bg-emerald-50 border-emerald-600 text-emerald-950" : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"}`}>
                <span className="text-2xl">{p.icon}</span>
                <span className="text-sm leading-tight">{p.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100 grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase block mb-1.5">💧 Agua de riego</label>
            <div className="flex gap-1.5">{IRRIGATIONS.map((i) => (<button key={i.id} type="button" onClick={() => onChangeIrrigation(i.id)} className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border ${irrigation === i.id ? "bg-emerald-700 text-white border-emerald-800" : "bg-white text-slate-700 border-slate-200"}`}>{i.label}</button>))}</div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 uppercase block mb-1.5">🐂 Trabajo de suelo</label>
            <div className="flex gap-1.5">{EQUIPMENTS.map((e) => (<button key={e.id} type="button" onClick={() => onChangeEquipment(e.id)} className={`flex-1 py-1.5 px-2 text-xs font-semibold rounded-lg border ${equipment === e.id ? "bg-emerald-700 text-white border-emerald-800" : "bg-white text-slate-700 border-slate-200"}`}>{e.label}</button>))}</div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-900">🌾 3 Opciones de Rotación Comparadas</h2>
          <a href={`/api/poster/${zone?.zone_id || "punata_valle_alto"}`} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg border border-amber-300 flex items-center gap-1.5">📄 Cartilla Imprimible</a>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {strategies.map((s, idx) => {
            const isBase = s.strategy_type === "current_baseline";
            const scorePct = Math.round((s.priority_alignment_score || 0.4) * 100);
            return (
              <div key={s.strategy_id || idx} className={`bg-white rounded-2xl p-4 border flex flex-col justify-between shadow-sm ${isBase ? "border-amber-300 bg-amber-50/20" : "border-emerald-300"}`}>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isBase ? "bg-amber-200 text-amber-900" : "bg-emerald-200 text-emerald-950"}`}>{isBase ? "Práctica Actual" : `Alternativa #${idx}`}</span>
                    <span className="text-xs font-bold text-slate-600">{scorePct}% afinidad</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{s.title_es}</h3>
                  <p className="text-xs italic text-emerald-800 font-medium mb-3">{s.title_qu}</p>

                  <div className="mb-3 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Secuencia de siembra:</span>
                    <div className="flex flex-wrap gap-1">
                      {(s.crop_sequence || []).map((c, ci) => (
                        <span key={ci} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-medium border border-slate-200">{c.crop_name}</span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 mb-3 text-xs space-y-1.5 text-slate-700">
                    <p className="line-clamp-3"><strong>Resumen:</strong> {s.spanish_summary}</p>
                    <p className="line-clamp-2 italic text-slate-600 font-serif">"{s.quechua_summary}"</p>
                  </div>
                </div>

                <div>
                  <div className="grid grid-cols-4 gap-1 text-center mb-3">
                    {[{ k: "water", icon: "💧", l: "Agua" }, { k: "soil", icon: "🌱", l: "Suelo" }, { k: "frost", icon: "❄️", l: "Helada" }, { k: "erosion", icon: "⛰️", l: "Ladera" }].map((m) => {
                      const color = (s.visual_traffic_light && s.visual_traffic_light[m.k]) || "yellow";
                      return (
                        <div key={m.k} className={`py-1 px-0.5 rounded text-[10px] font-bold ${LIGHT_COLORS[color]}`}>
                          <div>{m.icon}</div>
                          <div className="truncate">{m.l}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => onSpeak(s.quechua_summary, "qu", `${s.strategy_id}_qu`)} className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${activeAudioKey === `${s.strategy_id}_qu` ? "bg-emerald-600 text-white animate-pulse" : "bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300"}`}>
                      🔊 Quechua
                    </button>
                    <button type="button" onClick={() => onSpeak(s.spanish_summary, "es", `${s.strategy_id}_es`)} className={`py-2 px-2 text-xs font-bold rounded-xl border flex items-center justify-center gap-1.5 transition ${activeAudioKey === `${s.strategy_id}_es` ? "bg-blue-600 text-white animate-pulse" : "bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300"}`}>
                      🔊 Español
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
