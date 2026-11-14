import React, { useEffect, useRef, useMemo } from "react";
import L from "leaflet";
import { LocateFixed, MapPin, Check } from "lucide-react";
import { ZONE_GEO_CATALOG } from "../../utils/geoUtils.js";

export default function CochabambaMap({
  zones = [],
  activeZoneId,
  onSelectZone,
  userPoint = null,
  onPickMapPoint,
  onDetectGps,
  geoStatus = "",
  forceOffline,
  isOnline,
  tall = false,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const pickRef = useRef(onPickMapPoint);
  const selectRef = useRef(onSelectZone);
  pickRef.current = onPickMapPoint;
  selectRef.current = onSelectZone;

  const canUseLeaflet = !forceOffline && isOnline;

  const zoneList = useMemo(() => {
    return ZONE_GEO_CATALOG.map((p) => {
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
      const map = L.map(containerRef.current, { center: [-17.68, -65.95], zoom: 8, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 14,
      }).addTo(map);
      map.on("click", (e) => {
        pickRef.current?.(e.latlng.lat, e.latlng.lng, "mapa");
      });
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    }

    const layer = layerRef.current;
    if (layer) {
      layer.clearLayers();
      zoneList.forEach((z) => {
        const active = z.id === activeZoneId;

        const polygon = L.polygon(z.polygon, {
          color: active ? "#0284C7" : "#0B2545",
          fillColor: active ? "#009FE3" : "#0284C7",
          fillOpacity: active ? 0.28 : 0.1,
          weight: active ? 3 : 1.5,
          dashArray: active ? null : "4 4",
        });
        polygon.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          selectRef.current?.(z.id);
        });
        polygon.addTo(layer);

        const pinpoint = L.circleMarker(z.coords, {
          radius: active ? 6 : 5,
          fillColor: active ? "#0284C7" : "#0B2545",
          color: "#FFFFFF",
          weight: 2,
          fillOpacity: 1,
        });
        pinpoint.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          selectRef.current?.(z.id);
        });
        pinpoint.addTo(layer);

        const badgeHtml = `
          <div style="
            transform: translate(-50%, -140%);
            display: inline-flex;
            align-items: center;
            gap: 5px;
            white-space: nowrap;
            padding: 4px 9px;
            border-radius: 9999px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 11px;
            font-weight: 700;
            cursor: pointer;
            border: 2px solid ${active ? "#FFFFFF" : "#0B2545"};
            background: ${active ? "#0284C7" : "#FFFFFF"};
            color: ${active ? "#FFFFFF" : "#0B2545"};
            box-shadow: 0 2px 6px rgba(11, 37, 69, 0.28);
          ">
            <span>${z.name} · ${z.sub}</span>
            <span style="opacity: 0.85; font-weight: 600;">(${z.elevation})</span>
          </div>
        `;
        const labelMarker = L.marker(z.coords, {
          icon: L.divIcon({
            className: "bg-transparent border-0",
            html: badgeHtml,
            iconSize: null,
          }),
        });
        labelMarker.on("click", (e) => {
          L.DomEvent.stopPropagation(e);
          selectRef.current?.(z.id);
        });
        labelMarker.addTo(layer);
      });

      if (userPoint && Number.isFinite(userPoint.lat) && Number.isFinite(userPoint.lon)) {
        const pin = L.circleMarker([userPoint.lat, userPoint.lon], {
          radius: 8,
          fillColor: "#F59E0B",
          color: "#0B2545",
          weight: 3,
          fillOpacity: 1,
        });
        pin.bindTooltip("Tu ubicación seleccionada", { permanent: true, direction: "bottom" });
        pin.addTo(layer);
      }
    }
  }, [canUseLeaflet, activeZoneId, zoneList, userPoint]);

  useEffect(() => {
    if (!canUseLeaflet && mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
      layerRef.current = null;
    }
  }, [canUseLeaflet]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col">
      {/* Top Map Action Bar */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs text-slate-700 space-y-0.5">
          <p className="font-semibold text-[#0B2545] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#0284C7] shrink-0" />
            <span>Toca cualquier zona o tu pueblo en el mapa para seleccionarla</span>
          </p>
          {geoStatus ? (
            <p className="text-[#0284C7] font-semibold">{geoStatus}</p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onDetectGps}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-bold transition cursor-pointer shrink-0"
        >
          <LocateFixed className="w-3.5 h-3.5 shrink-0" />
          <span>Usar mi ubicación GPS</span>
        </button>
      </div>

      {/* Interactive Leaflet Map / Offline Vector Map */}
      <div className={`${tall ? "h-80 sm:h-[420px]" : "h-64 sm:h-72"} relative w-full bg-slate-900`}>
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
                    <circle cx={z.svgPos.x} cy={z.svgPos.y} r={active ? 18 : 13} fill={active ? "#0284c7" : "#0B2545"} stroke="#ffffff" strokeWidth="2" />
                    <text x={z.svgPos.x} y={z.svgPos.y - 22} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">{z.name}</text>
                    <text x={z.svgPos.x} y={z.svgPos.y + 30} textAnchor="middle" fill="#cbd5e1" fontSize="8">{z.elevation}</text>
                  </g>
                );
              })}
            </svg>
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded bg-slate-800 text-slate-200 text-xs font-semibold">
              Mapa sin internet
            </span>
          </div>
        )}
      </div>

      {/* Recognizable Zone Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50 border-t border-slate-200">
        {zoneList.map((z) => {
          const active = z.id === activeZoneId;
          return (
            <button
              key={z.id}
              type="button"
              onClick={() => onSelectZone(z.id)}
              className={`p-3.5 text-left transition cursor-pointer ${
                active ? "bg-sky-50/90 border-l-4 sm:border-l-0 sm:border-t-2 border-[#0284C7]" : "hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-bold text-sm text-[#0B2545]">{z.name}</span>
                <span className="text-xs font-semibold text-slate-500">{z.elevation}</span>
              </div>
              <p className="text-xs text-slate-700 mt-0.5">{z.sub} · {z.risk}</p>
              <p className="text-[11px] text-slate-500 mt-1">Pueblos: {z.towns}</p>
              <span className={`inline-flex items-center gap-1 mt-2 text-[11px] font-bold ${active ? "text-[#0284C7]" : "text-slate-500"}`}>
                {active ? <Check className="w-3 h-3" /> : null}
                <span>{active ? "Seleccionado" : "Elegir zona"}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
