import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import { LocateFixed, Layers } from "lucide-react";
import { IlustracionTarpuy } from "../illustrations/TarpuyIllustrations.jsx";
import { MobileBottomNav } from "../layout/Navbar.jsx";
import CommunitySearchCombobox from "../ui/CommunitySearchCombobox.jsx";
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
  lang = "es",
  onChooseDistrict,
  guided = false,
  previewOpen = false,
  onDismissPreview,
  onNavigate,
  nextView = "clima",
  onContinue,
  onDistrictResolved,
  onBack,
}) {
  const containerRef = useRef(null);
  const searchDockRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const wmsRef = useRef({});
  const didFitDistrictsRef = useRef(false);
  const pickRef = useRef(onPickMapPoint);
  const selectRef = useRef(onSelectZone);
  pickRef.current = onPickMapPoint;
  selectRef.current = onSelectZone;

  const [mapEpoch, setMapEpoch] = useState(0);
  const districts = useGamcDistricts();
  const [districtCode, setDistrictCode] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [districtLayerError, setDistrictLayerError] = useState(false);
  const [gamcTheme, setGamcTheme] = useState("");
  const [gamcServices, setGamcServices] = useState([]);
  const [enabledIds, setEnabledIds] = useState(() => new Set());
  const [layersOpen, setLayersOpen] = useState(false);
  const enabledRef = useRef(enabledIds);
  const servicesRef = useRef(gamcServices);
  const districtResolvedRef = useRef(onDistrictResolved);
  districtResolvedRef.current = onDistrictResolved;
  enabledRef.current = enabledIds;
  servicesRef.current = gamcServices;

  const LAYER_CHIP_LABEL = {
    periurbanos_categorizado: "Periurbanos",
    drenaje_e_influencia: "Drenaje",
    limite_distritos: "Límites de distritos",
  };

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

  const handleSearchSelect = (item) => {
    onSelectCommunity?.(item);
    if (item?.code) {
      focusDistrict(item.code);
      const district = districts.find((d) => d.code === item.code);
      if (district) onChooseDistrict?.(district);
    }
  };

  useEffect(() => {
    const dock = searchDockRef.current;
    const root = dock?.parentElement;
    const canvas = root?.querySelector?.(".tarpuy-map-canvas");
    if (!dock || !root) return undefined;
    const syncChrome = () => {
      const gap = 8;
      const rootTop = root.getBoundingClientRect().top;
      const offset = Math.max(
        72,
        Math.ceil(dock.getBoundingClientRect().bottom - rootTop + gap)
      );
      if (canvas) canvas.style.setProperty("--tarpuy-map-chrome-bottom", `${offset}px`);
      root.style.setProperty("--tarpuy-map-chrome-bottom", `${offset}px`);
    };
    syncChrome();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncChrome) : null;
    ro?.observe(dock);
    window.addEventListener("resize", syncChrome);
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", syncChrome);
      canvas?.style.removeProperty("--tarpuy-map-chrome-bottom");
      root?.style.removeProperty("--tarpuy-map-chrome-bottom");
    };
  }, [guided, layersOpen]);

  useEffect(() => {
    if (!mapRef.current || !districts.length || didFitDistrictsRef.current || userPoint) return;
    const bounds = districts.flatMap((d) => [[d.bounds.south, d.bounds.west], [d.bounds.north, d.bounds.east]]);
    mapRef.current.fitBounds(bounds, { padding: [24, 24] });
    didFitDistrictsRef.current = true;
  }, [districts, mapEpoch, userPoint]);

  useEffect(() => {
    const map = mapRef.current;
    const b = userPoint?.bounds;
    if (!map || !mapEpoch || !b || userPoint?.source === "GPS") return;
    map.fitBounds([[b.south, b.west], [b.north, b.east]], { padding: [24, 24], maxZoom: 14 });
  }, [userPoint, mapEpoch]);

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
      const map = L.map(containerRef.current, { center: [-17.40, -66.16], zoom: 12, zoomControl: false });
      L.control.zoom({ position: "topleft" }).addTo(map);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);
      map.fitBounds([[-17.53119, -66.280703], [-17.257306, -66.06952]], { padding: [24, 24] });
      map.on("click", (evt) => {
        pickRef.current?.(evt.latlng.lat, evt.latlng.lng, "mapa");
        if (!guided || [...enabledRef.current].some(id => servicesRef.current.find(s => s.service_id === id)?.id !== "limite_distritos")) queryRef.current?.(evt);
      });
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setMapEpoch((n) => n + 1);
      requestAnimationFrame(() => {
        map.invalidateSize();
      });
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
          fillOpacity: 0.9,
        });
        pin.bindTooltip(userPoint.district || (guided ? "Tu parcela" : "Tu ubicación seleccionada"), { permanent: true, direction: "bottom" });
        pin.addTo(layer);
        mapRef.current.setView([userPoint.lat, userPoint.lon], userPoint.accuracy > 1000 ? 13 : 16);
      }
    }
    const map = mapRef.current;
    const canvas = containerRef.current?.parentElement;
    const syncSize = () => map?.invalidateSize({ animate: false });
    requestAnimationFrame(syncSize);
    const ro = typeof ResizeObserver !== "undefined" && canvas ? new ResizeObserver(syncSize) : null;
    ro?.observe(canvas);
    return () => ro?.disconnect();
  }, [canUseLeaflet, userPoint, guided]);

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

  const resetDistrictsView = () => {
    const map = mapRef.current;
    if (!map) return;
    map.fitBounds([[-17.53119, -66.280703], [-17.257306, -66.06952]], { padding: [16, 16] });
  };

  return (
    <div className={`${guided ? "flow-location-map" : "tarpuy-card-physical"} overflow-hidden flex flex-col`}>
      {/* Barra tipo Maps: Volver + buscar distrito + chips (si Capas abierto) */}
      <div
        ref={searchDockRef}
        className={`${guided ? "tarpuy-map-search-dock" : "relative z-20"} px-3 pt-3 pb-2 space-y-2`}
      >
        <div className="flex items-center gap-2">
          {guided && onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="tarpuy-map-back-in-dock shrink-0"
            >
              ← Volver
            </button>
          ) : null}
          <div className="flex-1 min-w-0">
            <CommunitySearchCombobox
              selectedZoneId={activeZoneId}
              selectedCommunityName={selectedCommunityName}
              onSelectCommunity={handleSearchSelect}
              variant="light"
              placeholder="Buscar distrito..."
            />
          </div>
          {!guided ? (
            <button
              type="button"
              onClick={resetDistrictsView}
              className="shrink-0 min-h-12 px-3 rounded-2xl border-2 border-[var(--tinta)] bg-[var(--tarjeta)] text-xs font-extrabold cursor-pointer"
            >
              Todo
            </button>
          ) : null}
        </div>

        {layersOpen && gamcServices.length > 0 ? (
          <div
            className="tarpuy-map-layer-chips flex gap-2 overflow-x-auto pb-1"
            role="group"
            aria-label="Capas del mapa"
          >
            {gamcServices.map((svc) => {
              const on = enabledIds.has(svc.service_id);
              const label = LAYER_CHIP_LABEL[svc.id] || svc.short_title || svc.title;
              return (
                <button
                  key={svc.service_id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleService(svc.service_id)}
                  className="tarpuy-map-layer-chip shrink-0 inline-flex items-center gap-2 min-h-11 px-3.5 rounded-full text-sm font-extrabold cursor-pointer"
                  style={{
                    backgroundColor: on ? "var(--hoja-suave)" : "var(--tarjeta)",
                    color: "var(--tinta)",
                    border: on ? "2px solid var(--hoja-oscura)" : "2px solid var(--tinta)",
                    boxShadow: on ? "0 2px 0 var(--hoja-oscura)" : "0 2px 0 var(--tinta)",
                  }}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: (svc.legend_classes || [])[0]?.color || "var(--piedra)" }}
                    aria-hidden="true"
                  />
                  {label}
                </button>
              );
            })}
          </div>
        ) : null}

        {(locationMessage || geoStatus || districtLayerError) && !guided ? (
          <div className="space-y-1">
            {locationMessage ? <p role="status" className="text-xs font-semibold text-[var(--tinta-suave)]">{locationMessage}</p> : null}
            {geoStatus ? <p role="status" className="text-xs font-semibold">{geoStatus}</p> : null}
            {districtLayerError ? (
              <p role="status" className="text-xs font-semibold text-amber-900">
                No se pudieron cargar los límites distritales.
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      {guided ? (
        <div className="tarpuy-map-district px-4 py-3 space-y-2">
          {locationMessage ? (
            <p role="status" className={locationMessage.startsWith("Tu ubicación:") ? "sr-only" : "text-sm text-slate-600"}>
              {locationMessage}
            </p>
          ) : null}
          {geoStatus ? <p role="status" className="text-sm font-semibold">{geoStatus}</p> : null}
          {districtLayerError ? (
            <p role="status" className="text-sm text-amber-900">No se pudieron cargar los límites distritales.</p>
          ) : null}
        </div>
      ) : null}

      {guided && userPoint && previewOpen && (
        <section className="tarpuy-map-preview" aria-label="Confirma tu ubicación">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-extrabold text-lg">¿Tu parcela está aquí?</h2>
              <p>{districtCode ? districts.find((d) => d.code === districtCode)?.name : "Punto seleccionado"}</p>
            </div>
            <button type="button" onClick={onDismissPreview} aria-label="Cerrar vista previa" className="min-h-11 min-w-11 font-bold">
              ×
            </button>
          </div>
          <p className="text-sm">
            {userPoint.source === "GPS"
              ? `Ubicación aproximada, ±${Math.round(userPoint.accuracy || 0)} m.`
              : userPoint.bounds
              ? "Centro aproximado del distrito."
              : "Punto elegido en el mapa."}{" "}
            Toca el mapa para ajustar.
          </p>
          <button type="button" className="flow-primary w-full" onClick={onContinue}>
            Confirmar y ver {nextView === "siembra" ? "qué sembrar" : "clima"} →
          </button>
        </section>
      )}

      <div
        className={`${
          guided ? "tarpuy-map-canvas--guided" : tall ? "h-80 sm:h-[420px]" : "h-64 sm:h-72"
        } tarpuy-map-canvas w-full bg-slate-900 ${guided ? "" : "relative"}`}
      >
        {canUseLeaflet ? (
          <div ref={containerRef} className="w-full h-full z-10" />
        ) : (
          <div className="w-full h-full relative flex items-center justify-center p-4 select-none">
            <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-200 text-xs font-semibold">
              Mapa municipal sin conexión a internet
            </span>
          </div>
        )}
        {!guided && canUseLeaflet && gamcServices.length > 0 ? (
          <p className="absolute bottom-2 left-2 z-20 max-w-[55%] rounded-md bg-white/90 px-2.5 py-1 text-[10px] text-slate-600 shadow">
            Haz clic sobre el mapa para consultar atributos
          </p>
        ) : null}
      </div>

      {canUseLeaflet ? (
        <div className={`tarpuy-map-fab-stack${guided ? " tarpuy-map-fab-stack--guided" : ""}`}>
          {gamcServices.length > 0 ? (
            <button
              type="button"
              className="tarpuy-map-layers-btn"
              aria-expanded={layersOpen}
              aria-controls="tarpuy-map-layer-panel"
              onClick={() => setLayersOpen((open) => !open)}
            >
              <Layers size={22} aria-hidden="true" />
              <span>Capas</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDetectGps}
            className="tarpuy-map-locate-btn"
            aria-label="Ubícame con GPS"
          >
            <LocateFixed size={22} aria-hidden="true" />
            <span>Ubícame</span>
          </button>
        </div>
      ) : null}

      {canUseLeaflet && layersOpen && gamcServices.length > 0 ? (
        <div
          id="tarpuy-map-layer-panel"
          className={`tarpuy-map-layers-panel${guided ? " tarpuy-map-layers-panel--guided" : ""}`}
          role="region"
          aria-label="Leyenda de capas"
        >
          <div className="flex items-center justify-between gap-2 border-b border-[var(--color-border-subtle)] pb-1.5 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--tinta-suave)]">
              Leyenda de capas
            </span>
            <button
              type="button"
              onClick={() => setLayersOpen(false)}
              aria-label="Cerrar leyenda"
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-black/5 text-sm font-bold text-[var(--tinta)] cursor-pointer"
            >
              ✕
            </button>
          </div>
          {gamcServices.filter((svc) => enabledIds.has(svc.service_id)).length === 0 ? (
            <p className="text-xs text-[var(--tinta-suave)]">No hay capas activas. Toca un chip arriba para activar.</p>
          ) : (
            gamcServices
              .filter((svc) => enabledIds.has(svc.service_id))
              .map((svc) => (
                <ul key={`legend-${svc.service_id}`} className="space-y-1">
                  <li className="text-xs font-extrabold mb-1">{LAYER_CHIP_LABEL[svc.id] || svc.short_title}</li>
                  {(svc.legend_classes || []).map((cls) => (
                    <li key={cls.id} className="flex items-center gap-1.5 text-[11px] text-[var(--tinta-suave)]">
                      <span
                        className="w-2.5 h-2.5 rounded-sm shrink-0 border border-black/10"
                        style={{ background: cls.color }}
                      />
                      <span>{cls.label}</span>
                    </li>
                  ))}
                </ul>
              ))
          )}
        </div>
      ) : null}

      {guided && onContinue && !previewOpen ? (
        <button
          type="button"
          onClick={onContinue}
          disabled={!userPoint}
          className="tarpuy-map-next-btn flow-primary disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Siguiente: ver clima →
        </button>
      ) : null}

      {guided ? (
        <MobileBottomNav
          activeView="mapa"
          onChangeView={(view) => {
            if (onNavigate) onNavigate(view);
            else if (view !== "mapa") onContinue?.();
          }}
          appMode={isAdvanced ? "avanzado" : "facil"}
          voiceLang={lang}
          zIndex="z-[520]"
        />
      ) : null}

      {geoStatus ? <p className="sr-only">{geoStatus}</p> : null}
    </div>
  );
}
