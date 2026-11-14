import React, { useEffect, useRef, useMemo } from "react";
import L from "leaflet";

const ZONE_PRESETS = [
  { id: "tapacari_zona_andina", name: "Tapacarí", alt: "3680 m", sub: "Zona Alta", coords: [-17.518, -66.612], risk: "Helada y ladera", x: 65, y: 80 },
  { id: "punata_valle_alto", name: "Punata", alt: "2750 m", sub: "Valle Alto", coords: [-17.542, -65.835], risk: "Poca lluvia", x: 175, y: 100 },
  { id: "mizque_cono_sur", name: "Mizque", alt: "2050 m", sub: "Cono Sur", coords: [-17.941, -65.342], risk: "Sol fuerte", x: 265, y: 145 },
];

export default function CochabambaMap({ zones = [], activeZoneId, onSelectZone, forceOffline, isOnline, tall = false }) {
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
      const map = L.map(containerRef.current, { center: [-17.66, -65.95], zoom: 8, zoomControl: true });
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
          fillColor: active ? "#0284c7" : "#15803d",
          color: "#ffffff",
          weight: active ? 3 : 2,
          fillOpacity: 0.95,
        });
        marker.bindTooltip(`<b>${z.name}</b> (${z.elevation}) · ${z.risk}`, { direction: "top" });
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
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden flex flex-col">
      <div className={`${tall ? "h-80 sm:h-96" : "h-64 sm:h-72"} relative w-full bg-stone-900`}>
        {canUseLeaflet ? (
          <div ref={containerRef} className="w-full h-full z-10" />
        ) : (
          <div className="w-full h-full relative flex items-center justify-center p-4 select-none">
            <svg viewBox="0 0 320 200" className="w-full h-full">
              <path d="M 20 60 Q 90 20 180 30 T 300 80 Q 290 170 200 185 T 40 140 Z" fill="#1e293b" stroke="#334155" strokeWidth="2" strokeDasharray="4 2" />
              {zoneList.map((z) => {
                const active = z.id === activeZoneId;
                return (
                  <g key={z.id} onClick={() => onSelectZone(z.id)} className="cursor-pointer">
                    <circle cx={z.x} cy={z.y} r={active ? 12 : 8} fill={active ? "#0284c7" : "#15803d"} stroke="#ffffff" strokeWidth="2" />
                    <text x={z.x} y={z.y - 14} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">{z.name}</text>
                    <text x={z.x} y={z.y + 20} textAnchor="middle" fill="#cbd5e1" fontSize="8">{z.elevation}</text>
                  </g>
                );
              })}
            </svg>
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-stone-800 text-stone-200 text-xs font-semibold">
              Mapa sin internet
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200 bg-stone-50 border-t border-stone-200">
        {zoneList.map((z) => {
          const active = z.id === activeZoneId;
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => onSelectZone(z.id)}
              className={`p-3.5 text-left transition cursor-pointer ${
                active ? "bg-sky-50/80 border-l-4 sm:border-l-0 sm:border-t-2 border-[#0284C7]" : "hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-stone-900">{z.name}</span>
                <span className="text-xs font-medium text-stone-500">{z.elevation}</span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">{z.sub} · {z.risk}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
