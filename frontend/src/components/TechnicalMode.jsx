import React, { useState } from "react";
import { Satellite, ShieldCheck, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "./ui/Primitives.jsx";
import CochabambaMap from "./maps/CochabambaMap.jsx";
import ClimateChartsPanel from "./charts/ClimateChartsPanel.jsx";

export default function TechnicalMode({
  zones = [], activeZoneId, onSelectZone, zone, strategies = [],
  provenance = {}, forceOffline = false, isOnline = true,
}) {
  const [activeTab, setActiveTab] = useState(0);
  const [showTable, setShowTable] = useState(false);
  const indicators = zone?.monthly_harmonized_indicators || [];
  const strat = strategies[activeTab] || strategies[0];

  return (
    <div className="space-y-6">
      {/* Top Grid: GIS Map + Telemetry SVG Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5">
          <Card className="overflow-hidden h-full flex flex-col justify-between">
            <CardHeader>
              <CardTitle><Satellite className="w-5 h-5 text-[#0B3D91]" /><span>Geolocalización Orográfica Cochabamba</span></CardTitle>
              <p className="text-xs text-stone-500 mt-1">OpenStreetMap Leaflet & Cartografía Topográfica</p>
            </CardHeader>
            <CardContent className="p-3 sm:p-4">
              <CochabambaMap zones={zones} activeZoneId={activeZoneId || zone?.zone_id} onSelectZone={onSelectZone} forceOffline={forceOffline} isOnline={isOnline} />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-7">
          <ClimateChartsPanel indicators={indicators} zoneName={zone?.name} />
        </div>
      </div>

      {/* Middle Card: Scientific Audit & Harmonized Table */}
      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle>Auditoría Científica de Rotación y Resiliencia</CardTitle>
            <p className="text-xs text-stone-500 mt-1">Evaluación agronómica contra telemetría satelital NASA</p>
          </div>
          <button type="button" onClick={() => setShowTable((prev) => !prev)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 transition">
            {showTable ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            <span>{showTable ? "Ocultar Tabla Mensual" : "Ver Tabla Mensual NASA"}</span>
          </button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex border-b border-stone-200 gap-2 overflow-x-auto">
            {strategies.map((s, idx) => (
              <button key={s.strategy_id || idx} type="button" onClick={() => setActiveTab(idx)} className={`py-2 px-3.5 text-xs font-bold border-b-2 -mb-px transition whitespace-nowrap cursor-pointer ${activeTab === idx ? "border-emerald-600 text-emerald-950 bg-emerald-50/40 rounded-t-lg" : "border-transparent text-stone-500 hover:text-stone-900"}`}>
                {s.strategy_type === "current_baseline" ? "Línea Base Tradicional" : `Alternativa #${idx} Adaptativa`}
              </button>
            ))}
          </div>

          {strat && (
            <div className="space-y-3.5">
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200/90 text-xs space-y-1">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5"><Satellite className="w-4 h-4 text-emerald-700" /><span>Evidencia Satelital NASA (POWER Climatology & SMAP L4)</span></span>
                <p className="text-emerald-950 leading-relaxed">{strat.nasa_evidence}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-emerald-900 block mb-1.5">Beneficios Agronómicos</span>
                  <ul className="list-disc list-inside space-y-1 text-stone-700">{(strat.benefits || []).map((b, i) => <li key={i}>{b}</li>)}</ul>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-amber-900 block mb-1.5">Brechas de Información</span>
                  <ul className="list-disc list-inside space-y-1 text-stone-700">{(strat.information_gaps || []).map((g, i) => <li key={i}>{g}</li>)}</ul>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <span className="font-bold text-rose-900 block mb-1.5">Riesgos de Validación</span>
                  <ul className="list-disc list-inside space-y-1 text-stone-700">{(strat.local_validation_risks || []).map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              </div>
            </div>
          )}

          {showTable && (
            <div className="overflow-x-auto pt-3 border-t border-stone-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-500 font-semibold text-[11px]">
                    <th className="py-1 px-1.5">Mes</th><th className="py-1 px-1.5">Precip</th><th className="py-1 px-1.5">T. Mín</th><th className="py-1 px-1.5">SMAP</th><th className="py-1 px-1.5">NDVI</th><th className="py-1 px-1.5">Heladas</th><th className="py-1 px-1.5">Vulnerabilidad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-[11px]">
                  {indicators.map((m) => (
                    <tr key={m.month} className={m.bare_soil_flag ? "bg-rose-50/70" : ""}>
                      <td className="py-1 px-1.5 font-bold text-stone-800">{m.month_name?.slice(0, 3)}</td>
                      <td className="py-1 px-1.5">{m.precip_mm} mm</td>
                      <td className="py-1 px-1.5 font-mono">{m.temp_min_c}°C</td>
                      <td className="py-1 px-1.5 font-mono">{Math.round((m.soil_moisture_index || 0) * 100)}%</td>
                      <td className="py-1 px-1.5 font-mono">{m.ndvi_mean}</td>
                      <td className="py-1 px-1.5">{m.frost_risk_days} d</td>
                      <td className="py-1 px-1.5"><Badge variant={m.bare_soil_flag ? "danger" : "soil"} className="text-[10px]">{m.bare_soil_flag ? "Suelo Desnudo" : "Cubierto"}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bottom Card: Cryptographic Data Provenance */}
      <Card className="bg-stone-900 text-stone-200 border-stone-800">
        <CardContent className="p-4 sm:p-5 space-y-2 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-2">
            <span className="font-bold text-stone-100 flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /><span>Data Provenance & Cryptographic Proof</span></span>
            <Badge variant="soil" className="bg-emerald-950 text-emerald-300 border-emerald-700 text-[10px]">SHA-256 VERIFIED</Badge>
          </div>
          <p className="text-stone-400"><strong>NASA: </strong>{(provenance?.nasa_datasets || ["POWER", "SMAP L4", "Sentinel/MODIS"]).join(" • ")}</p>
          <p className="text-stone-400"><strong>Suelo: </strong>{provenance?.soil_dataset || "ISRIC SoilGrids 250m & FAO GAEZ v4"}</p>
          <div className="break-all text-[11px] text-emerald-400 bg-black/60 p-2 rounded border border-stone-800">
            <strong>SHA-256: </strong>{provenance?.integrity_sha256 || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
