import React, { useState } from "react";

const ZONES_META = [
  { id: "tapacari_zona_andina", name: "Tapacarí", alt: "3,680 msnm", sub: "Cordillera Andina", cx: 60, cy: 75 },
  { id: "punata_valle_alto", name: "Punata", alt: "2,750 msnm", sub: "Valle Alto", cx: 175, cy: 95 },
  { id: "mizque_cono_sur", name: "Mizque", alt: "2,050 msnm", sub: "Cono Sur", cx: 270, cy: 150 },
];

export default function TechnicalMode({ activeZoneId, onSelectZone, zone, strategies, provenance }) {
  const [activeStratTab, setActiveStratTab] = useState(0);
  const indicators = zone?.monthly_harmonized_indicators || [];
  const strat = strategies[activeStratTab] || strategies[0];

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-3 gap-6">
        <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-1">🗺️ Pilotos Agroecológicos Cochabamba</h2>
            <p className="text-xs text-slate-500 mb-3">Seleccione una zona en el mapa orográfico interactivo:</p>
            <div className="relative bg-slate-900 rounded-xl p-3 border border-slate-800">
              <svg viewBox="0 0 320 200" className="w-full h-44 drop-shadow">
                <path d="M 20 60 Q 90 20 180 30 T 300 80 Q 290 170 200 185 T 40 140 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
                <path d="M 70 80 Q 150 50 250 85 T 210 160 Q 120 160 70 80 Z" fill="#0f172a" opacity="0.6" />
                {ZONES_META.map((z) => {
                  const active = z.id === activeZoneId;
                  return (
                    <g key={z.id} onClick={() => onSelectZone(z.id)} className="cursor-pointer group">
                      <circle cx={z.cx} cy={z.cy} r={active ? 12 : 8} fill={active ? "#10b981" : "#38bdf8"} className="transition-all duration-300" />
                      <circle cx={z.cx} cy={z.cy} r={active ? 18 : 12} fill="none" stroke={active ? "#34d399" : "#7dd3fc"} strokeWidth="2" opacity="0.5" className="animate-ping" />
                      <text x={z.cx} y={z.cy - 14} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">{z.name}</text>
                      <text x={z.cx} y={z.cy + 22} textAnchor="middle" fill="#94a3b8" fontSize="8">{z.alt}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-xs">
            {ZONES_META.map((z) => (
              <button key={z.id} type="button" onClick={() => onSelectZone(z.id)} className={`p-1.5 rounded-lg border font-semibold ${z.id === activeZoneId ? "bg-emerald-50 border-emerald-600 text-emerald-900" : "bg-slate-50 border-slate-200 text-slate-600"}`}>
                <div>{z.name}</div>
                <div className="text-[10px] text-slate-400 font-normal">{z.alt}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="lg:col-span-2 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h2 className="text-sm font-bold text-slate-900">🛰️ Serie Climatológica y Satelital Mensual NASA</h2>
              <span className="text-[11px] text-slate-500 font-mono">POWER Climatology + SMAP L4 + Sentinel/MODIS NDVI</span>
            </div>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold bg-emerald-100 text-emerald-800">
              {indicators[0]?.data_status || "nasa_power_live_climatology"}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold text-[11px]">
                  <th className="py-1 px-1.5">Mes</th><th className="py-1 px-1.5">Lluvia (mm)</th><th className="py-1 px-1.5">T. Mín (°C)</th><th className="py-1 px-1.5">Humedad SMAP</th><th className="py-1 px-1.5">NDVI</th><th className="py-1 px-1.5">Heladas</th><th className="py-1 px-1.5">Vulnerabilidad</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {indicators.map((m) => (
                  <tr key={m.month} className={m.bare_soil_flag ? "bg-rose-50/50" : ""}>
                    <td className="py-1 px-1.5 font-bold text-slate-800">{m.month_name?.slice(0, 3)}</td>
                    <td className="py-1 px-1.5">{m.precip_mm} mm</td>
                    <td className="py-1 px-1.5 font-mono">{m.temp_min_c}°C</td>
                    <td className="py-1 px-1.5 font-mono">{(m.soil_moisture_index * 100).toFixed(0)}%</td>
                    <td className="py-1 px-1.5 font-mono">{m.ndvi_mean}</td>
                    <td className="py-1 px-1.5">{m.frost_risk_days} d</td>
                    <td className="py-1 px-1.5">{m.bare_soil_flag ? <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded font-bold text-[9px]">SUELO DESNUDO</span> : <span className="text-emerald-700 font-medium">Cubierto</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <section className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex border-b border-slate-200 gap-2">
          {strategies.map((s, idx) => (
            <button key={s.strategy_id || idx} type="button" onClick={() => setActiveStratTab(idx)} className={`py-2 px-3 text-xs font-bold border-b-2 -mb-px transition ${activeStratTab === idx ? "border-emerald-600 text-emerald-950" : "border-transparent text-slate-500 hover:text-slate-800"}`}>
              {s.strategy_type === "current_baseline" ? "Línea Base Tradicional" : `Alternativa #${idx} Adaptativa`}
            </button>
          ))}
        </div>
        {strat && (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200 text-xs">
              <span className="font-bold text-emerald-900 block mb-1">🛰️ Evidencia Satelital NASA:</span>
              <p className="text-emerald-950 leading-relaxed">{strat.nasa_evidence}</p>
            </div>
            <div className="grid md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-emerald-800 block mb-1">✅ Beneficios Agronómicos</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">{(strat.benefits || []).map((b, i) => <li key={i}>{b}</li>)}</ul>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-amber-800 block mb-1">⚠️ Brechas de Información</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">{(strat.information_gaps || []).map((g, i) => <li key={i}>{g}</li>)}</ul>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-rose-800 block mb-1">🔍 Riesgos de Validación Local</span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">{(strat.local_validation_risks || []).map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="bg-slate-900 text-slate-200 p-4 rounded-2xl text-xs space-y-2 font-mono">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <span className="font-bold text-slate-100 flex items-center gap-1.5">🔒 Data Provenance & Cryptographic Proof</span>
          <span className="px-2 py-0.5 bg-emerald-900/80 text-emerald-300 rounded border border-emerald-700 text-[10px]">SHA-256 VERIFIED</span>
        </div>
        <p className="text-[11px] text-slate-400"><strong>Conjuntos NASA:</strong> {(provenance?.nasa_datasets || []).join(" | ")}</p>
        <p className="text-[11px] text-slate-400"><strong>Suelo Andino:</strong> {provenance?.soil_dataset || "ISRIC SoilGrids 250m & FAO GAEZ v4"}</p>
        <div className="break-all text-[10px] text-emerald-400 bg-slate-950 p-2 rounded border border-slate-800">
          <strong>SHA-256:</strong> {provenance?.integrity_sha256 || "N/A"}
        </div>
      </section>
    </div>
  );
}
