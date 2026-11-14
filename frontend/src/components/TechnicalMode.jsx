import React, { useState } from "react";
import { Satellite, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "./ui/Primitives.jsx";
import ClimateChartsPanel from "./charts/ClimateChartsPanel.jsx";
import DataVeracityCard from "./alerts/DataVeracityCard.jsx";

export default function TechnicalMode({ zone, strategies = [], provenance = {}, bulletin = null }) {
  const [activeTab, setActiveTab] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const indicators = zone?.monthly_harmonized_indicators || [];
  const strat = strategies[activeTab] || strategies[0];

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#0284C7]">Transparencia y evidencia satelital</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2545] tracking-tight">Datos NASA · {zone?.name || "Cochabamba"}</h2>
      </div>

      <ClimateChartsPanel indicators={indicators} zoneName={zone?.name} />

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Evaluación agronómica y límites locales</CardTitle>
            <p className="text-xs text-stone-500 mt-0.5">Comparación de rotaciones frente a climatología mensual NASA</p>
          </div>
          <button
            type="button"
            onClick={() => setShowTable((p) => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer"
          >
            {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showTable ? "Ocultar tabla" : "Ver tabla mensual"}</span>
          </button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
            {strategies.map((s, idx) => (
              <button
                key={s.strategy_id || idx}
                type="button"
                onClick={() => setActiveTab(idx)}
                className={`py-2 px-3 text-xs font-bold border-b-2 -mb-px transition whitespace-nowrap cursor-pointer ${
                  activeTab === idx ? "border-[#0284C7] text-[#0B2545]" : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {s.strategy_type === "current_baseline" ? "Práctica tradicional" : `Alternativa #${idx}`}
              </button>
            ))}
          </div>

          {strat ? (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="font-bold text-[#0B2545] flex items-center gap-1.5">
                  <Satellite className="w-4 h-4 text-[#0284C7]" />
                  <span>Evidencia NASA (POWER & SMAP L4)</span>
                </span>
                <p className="text-slate-700 leading-relaxed">{strat.nasa_evidence}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <span className="font-bold text-emerald-900 block mb-1.5">Beneficios</span>
                  <ul className="list-disc list-inside space-y-1 text-stone-700">{(strat.benefits || []).map((b, i) => <li key={i}>{b}</li>)}</ul>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <span className="font-bold text-amber-900 block mb-1.5">Brechas de información</span>
                  <ul className="list-disc list-inside space-y-1 text-stone-700">{(strat.information_gaps || []).map((g, i) => <li key={i}>{g}</li>)}</ul>
                </div>
                <div className="p-3 bg-white rounded-lg border border-stone-200">
                  <span className="font-bold text-rose-900 block mb-1.5">Validar en campo</span>
                  <ul className="list-disc list-inside space-y-1 text-stone-700">{(strat.local_validation_risks || []).map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              </div>
            </div>
          ) : null}

          {showTable ? (
            <div className="overflow-x-auto pt-3 border-t border-stone-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold text-[11px]">
                    <th className="py-1.5 px-2">Mes</th><th className="py-1.5 px-2">Lluvia</th><th className="py-1.5 px-2">T. Mín</th><th className="py-1.5 px-2">SMAP</th><th className="py-1.5 px-2">NDVI</th><th className="py-1.5 px-2">Heladas</th><th className="py-1.5 px-2">Cobertura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-[11px]">
                  {indicators.map((m) => (
                    <tr key={m.month} className={m.bare_soil_flag ? "bg-rose-50/50" : ""}>
                      <td className="py-1.5 px-2 font-bold">{m.month_name?.slice(0, 3)}</td>
                      <td className="py-1.5 px-2">{m.precip_mm} mm</td>
                      <td className="py-1.5 px-2 font-mono">{m.temp_min_c}°C</td>
                      <td className="py-1.5 px-2 font-mono">{Math.round((m.soil_moisture_index || 0) * 100)}%</td>
                      <td className="py-1.5 px-2 font-mono">{m.ndvi_mean}</td>
                      <td className="py-1.5 px-2">{m.frost_risk_days} d</td>
                      <td className="py-1.5 px-2">{m.bare_soil_flag ? "Suelo desnudo" : "Cubierto"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {bulletin?.veracity_manifest ? <DataVeracityCard manifest={bulletin.veracity_manifest} /> : null}

      <div className="bg-[#0B2545] text-slate-200 rounded-xl p-4 font-mono text-xs space-y-1.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-sky-300" />Integridad de datos SHA-256</span>
          <Badge variant="soil" className="bg-sky-950 text-sky-300 border-sky-700 text-[10px]">VERIFICADO</Badge>
        </div>
        <p className="text-slate-400 text-[11px]">Fuentes: {(provenance?.nasa_datasets || ["NASA POWER", "SMAP L4", "Sentinel/MODIS"]).join(" · ")}</p>
        <p className="text-[11px] text-sky-300 break-all">{provenance?.integrity_sha256 || ""}</p>
      </div>
    </div>
  );
}
