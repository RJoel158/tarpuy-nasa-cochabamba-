import React, { useEffect, useRef, useMemo } from "react";
import L from "leaflet";

const ZONE_PRESETS = [
  { id: "tapacari_zona_andina", name: "Tapacarí", alt: "3680 m", sub: "Cordillera Andina", coords: [-17.518, -66.612], risk: "Helada y Pendiente", riskColor: "bg-rose-100 text-rose-800", x: 65, y: 80 },
  { id: "punata_valle_alto", name: "Punata", alt: "2750 m", sub: "Valle Alto", coords: [-17.542, -65.835], risk: "Déficit Hídrico", riskColor: "bg-amber-100 text-amber-800", x: 175, y: 100 },
  { id: "mizque_cono_sur", name: "Mizque", alt: "2050 m", sub: "Cono Sur", coords: [-17.941, -65.342], risk: "Suelo Desnudo", riskColor: "bg-amber-100 text-amber-800", x: 265, y: 145 },
];

export default function CochabambaMap({ zones = [], activeZoneId, onSelectZone, forceOffline, isOnline }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const canUseLeaflet = !forceOffline && isOnline;

  const zoneList = useMemo(() => {
    return ZONE_PRESETS.map((p) => {
      const match = zones.find((z) => (z.zone_id || z.id) === p.id);
      return {
        ...p,
        coords: match?.coordinates ? [match.coordinates.lat, match.coordinates.lon] : p.coords,
        elevation: match?.elevation_msnm ? `${match.elevation_msnm} m` : p.alt,
      };
    });
  }, [zones]);

  useEffect(() => {
    if (!canUseLeaflet || !containerRef.current) return;
    if (!mapRef.current) {
      const map = L.map(containerRef.current, { center: [-17.66, -65.95], zoom: 8, zoomControl: false });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 13,
      }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }
    const layer = layerRef.current;
    if (layer) {
      layer.clearLayers();
      zoneList.forEach((z) => {
        const active = z.id === activeZoneId;
        const marker = L.circleMarker(z.coords, {
          radius: active ? 11 : 8,
          fillColor: active ? "#009FE3" : "#15803D",
          color: active ? "#0B3D91" : "#ffffff",
          weight: active ? 3 : 2,
          fillOpacity: 0.95,
        });
        marker.bindTooltip(`<b>${z.name}</b> (${z.elevation})<br/>${z.risk}`, { direction: "top" });
        marker.on("click", () => onSelectZone(z.id));
        marker.addTo(layer);
      });
    }
  }, [canUseLeaflet, activeZoneId, zoneList, onSelectZone]);

  useEffect(() => {
    if (!canUseLeaflet && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      layerRef.current = null;
    }
  }, [canUseLeaflet]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-sm overflow-hidden flex flex-col">
      <div className="h-64 sm:h-72 relative w-full bg-stone-900">
        {canUseLeaflet ? (
          <div ref={containerRef} className="w-full h-full z-10" />
        ) : (
          <div className="w-full h-full relative flex items-center justify-center p-3 select-none">
            <svg viewBox="0 0 320 200" className="w-full h-full">
              <path d="M 20 60 Q 90 20 180 30 T 300 80 Q 290 170 200 185 T 40 140 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
              <path d="M 70 80 Q 150 50 250 85 T 210 160 Q 120 160 70 80 Z" fill="#0f172a" opacity="0.75" />
              {zoneList.map((z) => {
                const active = z.id === activeZoneId;
                return (
                  <g key={z.id} onClick={() => onSelectZone(z.id)} className="cursor-pointer">
                    <circle cx={z.x} cy={z.y} r={active ? 13 : 8} fill={active ? "#009FE3" : "#15803D"} stroke="#ffffff" strokeWidth="2" />
                    {active ? (
                      <circle cx={z.x} cy={z.y} r={19} fill="none" stroke="#38bdf8" strokeWidth="2" opacity="0.6" className="animate-ping" />
                    ) : null}
                    <text x={z.x} y={z.y - 12} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                      {z.name}
                    </text>
                    <text x={z.x} y={z.y + 19} textAnchor="middle" fill="#cbd5e1" fontSize="8">
                      {z.elevation}
                    </text>
                  </g>
                );
              })}
            </svg>
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-amber-500/90 text-stone-950 font-bold text-[10px] shadow">
              Mapa Topográfico Offline
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 p-2.5 bg-stone-50 border-t border-stone-200">
        {zoneList.map((z) => {
          const active = z.id === activeZoneId;
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => onSelectZone(z.id)}
              className={`p-2 rounded-xl text-left border transition ${
                active
                  ? "bg-white border-emerald-600 shadow-xs ring-1 ring-emerald-500"
                  : "bg-white/70 border-stone-200 hover:bg-white"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span className="font-bold text-xs text-stone-900 leading-tight">
                  {z.name} · {z.elevation}
                </span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0 ${z.riskColor}`}>
                  {z.risk}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 truncate mt-0.5">{z.sub}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
