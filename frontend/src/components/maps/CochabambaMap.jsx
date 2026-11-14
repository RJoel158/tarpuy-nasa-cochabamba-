import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { LocateFixed, MapPin } from "lucide-react";
import CommunitySearchCombobox from "../ui/CommunitySearchCombobox.jsx";
import {
  GAMC_WMS_PATH,
  fetchGamcServices,
  fetchGamcFeatureInfo,
  featureInfoRows,
  wmsTileOptions,
} from "../../services/gamcClient.js";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function popupHtml(chunks) {
  const blocks = chunks.map((chunk) => {
    const rows = chunk.rows
      .map((props) =>
        Object.entries(props)
          .filter(([key]) => !String(key).startsWith("_"))
          .slice(0, 8)
          .map(
            ([key, val]) =>
              `<tr><th style="text-align:left;padding:2px 8px 2px 0;color:#64748b;font-weight:600;">${escapeHtml(key)}</th><td>${escapeHtml(val)}</td></tr>`
          )
          .join("")
      )
      .join("");
    return `<p style="margin:0 0 6px;font-weight:700;color:#0B2545;">${escapeHtml(chunk.title)}</p><table style="font-size:12px;border-collapse:collapse;">${rows}</table>`;
  });
  return `<div style="max-width:240px;font-family:system-ui,sans-serif;">${blocks.join("<hr style='margin:8px 0;border:0;border-top:1px solid #e2e8f0;'/>")}</div>`;
}

export default function CochabambaMap({
  activeZoneId,
  onSelectZone,
  selectedCommunityName = "Distrito 9",
  onSelectCommunity,
  userPoint = null,
  onPickMapPoint,
  onDetectGps,
  geoStatus = "",
  forceOffline,
  isOnline,
  tall = false,
  isAdvanced = false,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const wmsRef = useRef({});
  const didFitDistrictsRef = useRef(false);
  const pickRef = useRef(onPickMapPoint);
  const selectRef = useRef(onSelectZone);
  pickRef.current = onPickMapPoint;
  selectRef.current = onSelectZone;

  const [mapEpoch, setMapEpoch] = useState(0);
  const [gamcTheme, setGamcTheme] = useState("");
  const [gamcServices, setGamcServices] = useState([]);
  const [enabledIds, setEnabledIds] = useState(() => new Set());
  const enabledRef = useRef(enabledIds);
  const servicesRef = useRef(gamcServices);
  enabledRef.current = enabledIds;
  servicesRef.current = gamcServices;

  const canUseLeaflet = !forceOffline && isOnline;

  useEffect(() => {
    if (!canUseLeaflet) {
      setGamcServices([]);
      return;
    }
    let cancelled = false;
    fetchGamcServices()
      .then((data) => {
        if (cancelled) return;
        setGamcTheme(data.theme || "");
        setGamcServices(data.services || []);
      })
      .catch(() => {
        if (!cancelled) setGamcServices([]);
      });
    return () => {
      cancelled = true;
    };
  }, [canUseLeaflet]);

  useEffect(() => {
    if (!gamcServices.length) {
      setEnabledIds(new Set());
      return;
    }
    if (isAdvanced) {
      setEnabledIds(new Set(gamcServices.filter((s) => s.default_on).map((s) => s.service_id)));
    } else {
      setEnabledIds(new Set(gamcServices.filter((s) => s.simple_mode).map((s) => s.service_id)));
    }
  }, [gamcServices, isAdvanced]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapEpoch || didFitDistrictsRef.current) return;
    const districts = gamcServices.find((s) => s.id === "limite_distritos");
    if (!districts?.bounds) return;
    didFitDistrictsRef.current = true;
    const { south, west, north, east } = districts.bounds;
    map.fitBounds([[south, west], [north, east]], { padding: [24, 24] });
  }, [gamcServices, mapEpoch]);

  useEffect(() => {
    const map = mapRef.current;
    const b = userPoint?.bounds;
    if (!map || !mapEpoch || !b) return;
    map.fitBounds([[b.south, b.west], [b.north, b.east]], { padding: [24, 24], maxZoom: 14 });
  }, [userPoint, mapEpoch]);

  const queryGamc = useCallback(async (e) => {
    const map = mapRef.current;
    const enabled = [...enabledRef.current];
    if (!map || enabled.length === 0) return;
    const size = map.getSize();
    const bounds = map.getBounds();
    const sw = L.CRS.EPSG3857.project(bounds.getSouthWest());
    const ne = L.CRS.EPSG3857.project(bounds.getNorthEast());
    const pt = map.latLngToContainerPoint(e.latlng);
    const bbox = `${sw.x},${sw.y},${ne.x},${ne.y}`;
    const chunks = [];
    for (const serviceId of enabled) {
      const geo = await fetchGamcFeatureInfo({
        serviceId,
        bbox,
        width: size.x,
        height: size.y,
        x: pt.x,
        y: pt.y,
      });
      const rows = featureInfoRows(geo);
      if (!rows.length) continue;
      const svc = servicesRef.current.find((s) => s.service_id === serviceId);
      chunks.push({ title: svc?.title || "Capa GAMC", rows });
    }
    if (!chunks.length) return;
    L.popup().setLatLng(e.latlng).setContent(popupHtml(chunks)).openOn(map);
  }, []);

  const queryRef = useRef(queryGamc);
  queryRef.current = queryGamc;

  useEffect(() => {
    if (!canUseLeaflet || !containerRef.current) return;
    if (!mapRef.current) {
      const map = L.map(containerRef.current, { center: [-17.40, -66.16], zoom: 12, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      map.fitBounds([[-17.53119, -66.280703], [-17.257306, -66.06952]], { padding: [16, 16] });
      map.on("click", (evt) => {
        pickRef.current?.(evt.latlng.lat, evt.latlng.lng, "mapa");
        queryRef.current?.(evt);
      });
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setMapEpoch((n) => n + 1);
    }

    const layer = layerRef.current;
    if (layer) {
      layer.clearLayers();

      if (userPoint && Number.isFinite(userPoint.lat) && Number.isFinite(userPoint.lon)) {
        const pin = L.circleMarker([userPoint.lat, userPoint.lon], {
          radius: 8,
          fillColor: "#7E57C2",
          color: "#4A148C",
          weight: 3,
          fillOpacity: 0.9,
        });
        pin.bindTooltip(userPoint.district || "Distrito detectado", { permanent: true, direction: "bottom" });
        pin.addTo(layer);
      }
    }
  }, [canUseLeaflet, userPoint]);

  useEffect(() => {
    const map = mapRef.current;
    if (!canUseLeaflet || !map || !mapEpoch) return;
    const wanted = enabledIds;
    Object.entries(wmsRef.current).forEach(([sid, layer]) => {
      if (!wanted.has(sid)) {
        map.removeLayer(layer);
        delete wmsRef.current[sid];
      }
    });
    gamcServices.forEach((svc) => {
      if (!wanted.has(svc.service_id) || wmsRef.current[svc.service_id]) return;
      const layer = L.tileLayer.wms(GAMC_WMS_PATH, wmsTileOptions(svc));
      layer.addTo(map);
      wmsRef.current[svc.service_id] = layer;
    });
  }, [canUseLeaflet, enabledIds, gamcServices, mapEpoch]);

  useEffect(() => {
    if (!canUseLeaflet && mapRef.current) {
      Object.values(wmsRef.current).forEach((layer) => {
        try {
          mapRef.current.removeLayer(layer);
        } catch {
          /* map already tearing down */
        }
      });
      wmsRef.current = {};
      mapRef.current.remove();
      mapRef.current = null;
      layerRef.current = null;
    }
  }, [canUseLeaflet]);

  const toggleService = (serviceId) => {
    setEnabledIds((prev) => {
      const next = new Set(prev);
      if (next.has(serviceId)) next.delete(serviceId);
      else next.add(serviceId);
      return next;
    });
  };

  const resetDistrictsView = () => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds([[-17.53119, -66.280703], [-17.257306, -66.06952]], { padding: [16, 16] });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 flex flex-col">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 rounded-t-xl relative z-20 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] sm:max-w-xs">
          <MapPin className="w-4 h-4 text-[#0284C7] shrink-0" />
          <CommunitySearchCombobox
            selectedZoneId={activeZoneId}
            selectedCommunityName={selectedCommunityName}
            onSelectCommunity={onSelectCommunity}
            variant="light"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={resetDistrictsView}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <span>Ver todo Cochabamba</span>
          </button>
          <button
            type="button"
            onClick={onDetectGps}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#7E57C2] hover:bg-[#6A1B9A] text-white text-xs font-bold transition cursor-pointer shadow-sm"
          >
            <LocateFixed className="w-3.5 h-3.5 shrink-0" />
            <span>Obtener mi ubicación (GPS)</span>
          </button>
        </div>
      </div>

      <div className={`${tall ? "h-80 sm:h-[420px]" : "h-64 sm:h-72"} relative w-full bg-slate-900`}>
        {canUseLeaflet ? (
          <>
            <div ref={containerRef} className="w-full h-full z-10" />
            {gamcServices.length > 0 ? (
              <p className="absolute bottom-2 left-2 z-20 max-w-[60%] rounded-md bg-white/90 px-2.5 py-1 text-[10px] text-slate-600 shadow">
                Haz clic sobre el mapa para consultar atributos · GetFeatureInfo
              </p>
            ) : null}
            {isAdvanced && gamcServices.length > 0 ? (
              <div className="absolute top-3 right-3 z-20 w-56 max-w-[calc(100%-1.5rem)] rounded-lg border border-slate-200 bg-white/95 shadow-md p-3 text-left">
                <p className="text-[10px] font-bold uppercase tracking-wide text-[#0284C7]">Capas GAMC</p>
                <p className="text-[10px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{gamcTheme}</p>
                <div className="mt-2 space-y-2">
                  {gamcServices.map((svc) => {
                    const on = enabledIds.has(svc.service_id);
                    return (
                      <label key={svc.service_id} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 accent-[#0284C7]"
                          checked={on}
                          onChange={() => toggleService(svc.service_id)}
                        />
                        <span className="text-xs font-semibold text-[#0B2545] leading-snug">{svc.title}</span>
                      </label>
                    );
                  })}
                </div>
                {gamcServices
                  .filter((svc) => enabledIds.has(svc.service_id))
                  .map((svc) => (
                    <ul key={`legend-${svc.service_id}`} className="mt-2 space-y-1 border-t border-slate-100 pt-2">
                      {(svc.legend_classes || []).map((cls) => (
                        <li key={cls.id} className="flex items-center gap-1.5 text-[11px] text-slate-700">
                          <span
                            className="w-2.5 h-2.5 rounded-sm shrink-0 border border-black/10"
                            style={{ background: cls.color }}
                          />
                          <span>{cls.label}</span>
                        </li>
                      ))}
                    </ul>
                  ))}
              </div>
            ) : null}
          </>
        ) : (
          <div className="w-full h-full relative flex items-center justify-center p-4 select-none">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold">
              Mapa municipal sin conexión a internet
            </span>
          </div>
        )}
      </div>
      {geoStatus ? <p className="sr-only">{geoStatus}</p> : null}
    </div>
  );
}
