import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { LocateFixed, Layers } from "lucide-react";
import { useGamcDistricts } from "../../services/useGamcDistricts.js";
import {
  GAMC_WMS_PATH,
  fetchGamcServices,
  fetchGamcFeatureInfo,
  featureInfoRows,
  wmsTileOptions,
  fetchDistrictAt,
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
              `<tr><th style="text-align:left;padding:2px 8px 2px 0;color:var(--tinta-suave);font-weight:600;">${escapeHtml(key)}</th><td>${escapeHtml(val)}</td></tr>`
          )
          .join("")
      )
      .join("");
    return `<p style="margin:0 0 6px;font-weight:700;color:var(--tinta);">${escapeHtml(chunk.title)}</p><table style="font-size:12px;border-collapse:collapse;">${rows}</table>`;
  });
  return `<div style="max-width:240px;font-family:system-ui,sans-serif;">${blocks.join("<hr style='margin:8px 0;border:0;border-top:1px solid var(--arena);'/>")}</div>`;
}

export default function CochabambaMap({
  zones = [],
  activeZoneId,
  onSelectZone,
  selectedCommunityName = "Punata",
  onSelectCommunity,
  userPoint = null,
  onPickMapPoint,
  onDetectGps,
  geoStatus = "",
  forceOffline,
  isOnline,
  tall = false,
  isAdvanced = false,
  onChooseDistrict,
  guided = false,
  onContinue,
  onDistrictResolved,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const wmsRef = useRef({});
  const pickRef = useRef(onPickMapPoint);
  const selectRef = useRef(onSelectZone);
  pickRef.current = onPickMapPoint;
  selectRef.current = onSelectZone;

  const [mapEpoch, setMapEpoch] = useState(0);
  const districts = useGamcDistricts();
  const [districtCode, setDistrictCode] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [districtLayerError, setDistrictLayerError] = useState(false);
  const didFitDistrictsRef = useRef(false);
  const [gamcTheme, setGamcTheme] = useState("");
  const [gamcServices, setGamcServices] = useState([]);
  const [enabledIds, setEnabledIds] = useState(() => new Set());
  const enabledRef = useRef(enabledIds);
  const servicesRef = useRef(gamcServices);
  const districtResolvedRef = useRef(onDistrictResolved);
  districtResolvedRef.current = onDistrictResolved;
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

  const focusDistrict = (code) => {
    setDistrictCode(code);
    const map = mapRef.current;
    if (!map || !districts.length) return;
    const selected = code ? districts.filter((d) => d.code === code) : districts;
    const bounds = selected.map((d) => [[d.bounds.south, d.bounds.west], [d.bounds.north, d.bounds.east]]).flat();
    if (bounds.length) map.fitBounds(bounds, { padding: [24, 24] });
  };

  useEffect(() => {
    if (!mapRef.current || !districts.length || didFitDistrictsRef.current || userPoint) return;
    const bounds = districts.flatMap((d) => [[d.bounds.south, d.bounds.west], [d.bounds.north, d.bounds.east]]);
    mapRef.current.fitBounds(bounds, { padding: [24, 24] });
    didFitDistrictsRef.current = true;
  }, [districts, mapEpoch]);

  useEffect(() => {
    if (!userPoint || !canUseLeaflet || !districts.length) return;
    let cancelled = false;
    setDistrictCode("");
    setLocationMessage("Identificando tu distrito…");
    fetchDistrictAt(userPoint.lat, userPoint.lon).then((district) => {
      if (cancelled) return;
      districtResolvedRef.current?.(district);
      if (!district) { setLocationMessage("La ubicación está fuera de los distritos municipales de Cochabamba."); return; }
      setDistrictCode(district.code);
      setLocationMessage(`Tu ubicación: Distrito ${district.code.replace(/^D/, "")} · ${district.comuna}`);
    }).catch(() => { if (!cancelled) setLocationMessage("Ubicación marcada. No se pudo consultar el distrito; puedes elegirlo en la lista."); });
    return () => { cancelled = true; };
  }, [userPoint, districts, canUseLeaflet]);

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
      const map = L.map(containerRef.current, { center: [-17.68, -65.95], zoom: 8, zoomControl: true });
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      map.fitBounds([[-17.53119, -66.280703], [-17.257306, -66.06952]], { padding: [24, 24] });
      map.on("click", (evt) => {
        pickRef.current?.(evt.latlng.lat, evt.latlng.lng, "mapa");
        if (!guided) queryRef.current?.(evt);
      });
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setMapEpoch((n) => n + 1);
    }

    const layer = layerRef.current;
    if (layer) {
      layer.clearLayers();
      if (userPoint && Number.isFinite(userPoint.lat) && Number.isFinite(userPoint.lon)) {
        if (userPoint.source === "GPS" && Number.isFinite(userPoint.accuracy) && userPoint.accuracy > 0) {
          L.circle([userPoint.lat, userPoint.lon], { radius: userPoint.accuracy, color: "var(--cielo-oscuro)", fillOpacity: 0.12, weight: 1 }).addTo(layer);
        }
        const pin = L.circleMarker([userPoint.lat, userPoint.lon], {
          radius: 8,
          fillColor: "var(--dorado)",
          color: "var(--tinta)",
          weight: 3,
          fillOpacity: 1,
        });
        if (!guided) pin.bindTooltip("Tu ubicación seleccionada", { permanent: true, direction: "bottom" });
        pin.addTo(layer);
        mapRef.current.setView([userPoint.lat, userPoint.lon], userPoint.accuracy > 1000 ? 13 : 16);
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
      if (svc.id === "limite_distritos") {
        layer.on("tileerror", () => setDistrictLayerError(true));
        layer.on("tileload", () => setDistrictLayerError(false));
      }
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

  const fitPeriurbanos = () => {
    const map = mapRef.current;
    const svc =
      gamcServices.find((s) => s.id === "periurbanos_categorizado") || gamcServices[0];
    if (!map || !svc?.bounds) return;
    const { south, west, north, east } = svc.bounds;
    map.fitBounds(
      [
        [south, west],
        [north, east],
      ],
      { padding: [24, 24], maxZoom: 13 }
    );
    if (!enabledIds.has(svc.service_id)) {
      setEnabledIds((prev) => new Set(prev).add(svc.service_id));
    }
  };

  return (
    <div className={`${guided ? "flow-location-map" : "tarpuy-card-physical"} overflow-hidden flex flex-col`}>
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 rounded-t-xl relative z-20 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {!guided && <button type="button" onClick={onDetectGps} className="tarpuy-btn-physical tarpuy-btn-physical--primary px-5 py-3 flex items-center justify-center gap-3">
            <LocateFixed className="w-6 h-6" aria-hidden="true" /><span>Ubícame</span>
          </button>}
          {!guided && canUseLeaflet && gamcServices.length > 0 ? (
            <button
              type="button"
              onClick={fitPeriurbanos}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 shrink-0 text-[var(--cielo-oscuro)]" />
              <span>Ver periurbanos</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className="px-4 py-3 border-b border-slate-200 space-y-2">
        <p className="text-sm font-semibold">Encuentra tu distrito con tu ubicación o elígelo por su número.</p>
        <label className="flex flex-wrap items-center gap-3 text-sm font-semibold">
          {guided ? "Tu distrito" : "Distritos municipales"}
          <select aria-label="Distrito municipal" value={districtCode} onChange={(e) => { focusDistrict(e.target.value); const district = districts.find(d=>d.code === e.target.value); if (district) onChooseDistrict?.(district); }} disabled={!districts.length || !canUseLeaflet}
            className="min-h-14 min-w-0 max-w-full flex-1 rounded-2xl border-2 border-[var(--tinta)] bg-white px-3 text-base font-bold">
            <option value="">{districts.length ? "Todos los distritos" : "Catálogo no disponible"}</option>
            {districts.map((d) => <option key={d.code} value={d.code}>{d.name} · {d.comuna}</option>)}
          </select>
        </label>
        {!guided && <p className="text-xs text-slate-600">Límites municipales del GAMC. Elegir un distrito acerca el mapa; las recomendaciones agrícolas siguen referidas a la zona piloto seleccionada.</p>}
        {locationMessage && <p role="status" className={guided && locationMessage.startsWith("Tu ubicación:") ? "sr-only" : "text-sm text-slate-600"}>{locationMessage}</p>}
        {guided && <button className="flow-primary w-full" disabled={!userPoint} onClick={onContinue}>Ver clima →</button>}
        {userPoint?.source === "GPS" && Number.isFinite(userPoint.accuracy) && <p className="text-sm text-slate-600" role="status">Precisión del dispositivo: ±{Math.round(userPoint.accuracy)} m.{userPoint.accuracy > 200 ? " Es aproximada. Toca el mapa para corregir tu parcela." : " Puedes ajustar el punto tocando el mapa."}</p>}

        {districtLayerError && <p role="status" className="text-sm text-amber-900">No se pudieron cargar los límites distritales. Revisa la conexión y la configuración del servicio GAMC.</p>}
      </div>
      <div className={`${tall ? "h-80 sm:h-[420px]" : "h-64 sm:h-72"} relative w-full bg-slate-900`}>
        {canUseLeaflet ? (
          <>
            <div ref={containerRef} className="w-full h-full z-10" />
            {!guided && gamcServices.length > 0 ? (
              <details className="absolute top-3 right-3 z-20 w-56 max-w-[calc(100%-1.5rem)] max-h-[80%] overflow-auto rounded-lg border border-slate-200 bg-white/95 shadow-md p-3 text-left">
                <summary className="text-xs font-bold text-[var(--cielo-oscuro)] cursor-pointer">Capas del mapa</summary>
                <p className="text-[10px] text-slate-500 leading-snug mt-0.5 line-clamp-2">{gamcTheme}</p>
                <div className="mt-2 space-y-2">
                  {gamcServices.map((svc) => {
                    const on = enabledIds.has(svc.service_id);
                    return (
                      <label key={svc.service_id} className="flex items-start gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          className="mt-0.5 accent-[var(--cielo-oscuro)]"
                          checked={on}
                          onChange={() => toggleService(svc.service_id)}
                        />
                        <span className="text-xs font-semibold text-[var(--tinta)] leading-snug">{svc.title}</span>
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
              </details>
            ) : null}
          </>
        ) : (
          <div className="w-full h-full relative flex items-center justify-center p-4 select-none">
            <p role="status" className="text-center text-sm text-white">Los límites de distritos necesitan conexión a internet.</p>
          </div>
        )}
      </div>

      {geoStatus ? <p className="sr-only">{geoStatus}</p> : null}
    </div>
  );
}
