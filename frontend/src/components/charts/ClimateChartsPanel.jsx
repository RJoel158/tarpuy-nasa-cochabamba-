import React, { useState } from "react";
import { CloudRain, ThermometerSnowflake, Droplets, Leaf } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, Badge } from "../ui/Primitives.jsx";

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function ClimateChartsPanel({ indicators = [], zoneName = "" }) {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const data = indicators.length === 12 ? indicators : Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    month_name: MONTH_NAMES[i],
    precip_mm: [98, 86, 52, 14, 2, 1, 3, 6, 12, 28, 45, 82][i],
    temp_min_c: [11.2, 10.8, 9.4, 5.8, 1.2, -1.8, -2.4, 0.4, 4.8, 8.2, 10.1, 10.9][i],
    soil_moisture_index: [0.58, 0.54, 0.42, 0.28, 0.16, 0.11, 0.09, 0.12, 0.15, 0.22, 0.34, 0.49][i],
    ndvi_mean: [0.54, 0.58, 0.51, 0.38, 0.22, 0.16, 0.15, 0.17, 0.21, 0.31, 0.42, 0.49][i],
    bare_soil_flag: [false, false, false, false, true, true, true, true, false, false, false, false][i],
  }));

  const active = data[selectedIdx] || data[0];
  const maxPrecip = Math.max(100, ...data.map((d) => d.precip_mm || 0));
  const tMin = -5, tMax = 20, zeroY = 110 - ((0 - tMin) / (tMax - tMin)) * 90;

  const tPoints = data.map((d, i) => `${26 + i * 24.5},${110 - (((d.temp_min_c || 0) - tMin) / (tMax - tMin)) * 90}`).join(" ");
  const ndviPoints = data.map((d, i) => `${26 + i * 24.5},${110 - (d.ndvi_mean || 0) * 90}`).join(" ");

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-wrap items-center justify-between gap-2">
        <CardTitle>
          <span>🛰️ Climatología Histórica NASA (30 años)</span>
          {zoneName ? <Badge variant="nasa">{zoneName}</Badge> : null}
        </CardTitle>
        <span className="text-[11px] font-mono text-stone-500">NASA POWER (30y) • SMAP L4 / Sentinel (Referencia)</span>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Chart A: Climograma NASA POWER */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                Lluvia (mm) + <ThermometerSnowflake className="w-3.5 h-3.5 text-rose-600" /> T. Mín (°C)
              </span>
              <span className="text-[10px] text-rose-600 font-semibold">--- 0°C Helada</span>
            </div>
            <svg viewBox="0 0 320 135" className="w-full h-36">
              <line x1="20" y1={zeroY} x2="310" y2={zeroY} stroke="#DC2626" strokeDasharray="3 3" opacity="0.6" />
              {data.map((d, i) => {
                const x = 26 + i * 24.5, h = ((d.precip_mm || 0) / maxPrecip) * 90;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => setSelectedIdx(i)}>
                    <rect x={x - 11} y="15" width="22" height="96" fill={selectedIdx === i ? "#38bdf8" : "transparent"} opacity="0.2" rx="3" />
                    <rect x={x - 6} y={110 - h} width="12" height={Math.max(2, h)} fill="#0284C7" rx="2" />
                    <text x={x} y="126" textAnchor="middle" fontSize="9" fill={selectedIdx === i ? "#0369a1" : "#78716c"} fontWeight={selectedIdx === i ? "bold" : "normal"}>{MONTH_NAMES[i]}</text>
                  </g>
                );
              })}
              <polyline points={tPoints} fill="none" stroke="#DC2626" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>

          {/* Chart B: SMAP vs NDVI */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-stone-800 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-600" />
                SMAP Humedad + <Leaf className="w-3.5 h-3.5 text-emerald-700" /> NDVI Cobertura
              </span>
              <span className="text-[10px] text-rose-700 font-semibold bg-rose-100 px-1.5 py-0.5 rounded">Zona Desnuda</span>
            </div>
            <svg viewBox="0 0 320 135" className="w-full h-36">
              {data.map((d, i) => {
                const x = 26 + i * 24.5, val = d.soil_moisture_index > 1 ? d.soil_moisture_index / 100 : d.soil_moisture_index;
                const h = val * 90;
                return (
                  <g key={i} className="cursor-pointer" onClick={() => setSelectedIdx(i)}>
                    {d.bare_soil_flag ? <rect x={x - 11} y="18" width="22" height="92" fill="#FEE2E2" opacity="0.8" rx="2" /> : null}
                    <rect x={x - 11} y="15" width="22" height="96" fill={selectedIdx === i ? "#10b981" : "transparent"} opacity="0.2" rx="3" />
                    <rect x={x - 5} y={110 - h} width="10" height={Math.max(2, h)} fill="#0EA5E9" rx="2" />
                    <text x={x} y="126" textAnchor="middle" fontSize="9" fill={selectedIdx === i ? "#065f46" : "#78716c"} fontWeight={selectedIdx === i ? "bold" : "normal"}>{MONTH_NAMES[i]}</text>
                  </g>
                );
              })}
              <polyline points={ndviPoints} fill="none" stroke="#15803D" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Selected Month Inspector Footer */}
        <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-stone-900 text-sm">{active.month_name || MONTH_NAMES[selectedIdx]}</span>
            {active.bare_soil_flag ? <Badge variant="danger">⚠️ Suelo Desnudo</Badge> : <Badge variant="soil">🌱 Cobertura Activa</Badge>}
          </div>
          <div className="flex flex-wrap items-center gap-3 font-medium text-stone-700">
            <span>Lluvia: <strong className="text-sky-700">{active.precip_mm} mm</strong></span>
            <span>T. Mín: <strong className={active.temp_min_c <= 0 ? "text-rose-600 font-bold" : "text-stone-900"}>{active.temp_min_c} °C</strong></span>
            <span>SMAP: <strong className="text-sky-700">{Math.round(active.soil_moisture_index > 1 ? active.soil_moisture_index : active.soil_moisture_index * 100)}%</strong></span>
            <span>NDVI: <strong className="text-emerald-800">{active.ndvi_mean}</strong></span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
