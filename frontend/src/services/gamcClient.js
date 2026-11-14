export const GAMC_WMS_PATH = "/api/gamc/wms";

export async function fetchGamcServices() {
  const res = await fetch("/api/gamc/services");
  if (!res.ok) throw new Error("Catálogo GAMC no disponible");
  return res.json();
}

export function legendGraphicUrl(serviceId) {
  const params = new URLSearchParams({
    service_id: serviceId,
    REQUEST: "GetLegendGraphic",
    VERSION: "1.0.0",
    FORMAT: "image/png",
  });
  return `${GAMC_WMS_PATH}?${params.toString()}`;
}

export function wmsTileOptions(service) {
  return {
    service_id: service.service_id,
    layers: service.layers || "",
    format: "image/png",
    transparent: true,
    version: "1.1.1",
    maxZoom: 19,
    attribution: "GAMC Cochabamba",
  };
}

export async function fetchGamcFeatureInfo({ serviceId, bbox, width, height, x, y }) {
  const params = new URLSearchParams({
    service_id: serviceId,
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetFeatureInfo",
    SRS: "EPSG:3857",
    BBOX: bbox,
    WIDTH: String(width),
    HEIGHT: String(height),
    X: String(Math.round(x)),
    Y: String(Math.round(y)),
    INFO_FORMAT: "application/json",
    FEATURE_COUNT: "5",
  });
  const res = await fetch(`${GAMC_WMS_PATH}?${params.toString()}`);
  if (!res.ok) return null;
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("json")) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export function featureInfoRows(geojson) {
  const features = geojson?.features || (geojson?.type === "Feature" ? [geojson] : []);
  return features
    .map((f) => f?.properties || {})
    .filter((props) => props && Object.keys(props).length > 0);
}

export const GAMC_DISTRICTS_SERVICE_ID = "7eb13092-bf0e-493b-aae6-03c43eedda2c";
export const GAMC_DRAINAGE_SERVICE_ID = "d4cea6e3-fc7f-482a-94ad-bd377df78886";
const PROBE_HALF_DEG = 0.0005;

let districtsPromise = null;

/** Municipal districts catalog (code, comuna, center, bounds); fetched once and cached. */
export function fetchGamcDistricts() {
  if (!districtsPromise) {
    districtsPromise = fetch("/api/gamc/districts")
      .then((res) => {
        if (!res.ok) throw new Error("Catálogo de distritos no disponible");
        return res.json();
      })
      .then((data) => data.districts || [])
      .catch((err) => {
        districtsPromise = null;
        throw err;
      });
  }
  return districtsPromise;
}

/** District ({ code, comuna }) containing a WGS84 point, or null when outside every district. */
export async function fetchDistrictAt(lat, lon) {
  const d = PROBE_HALF_DEG;
  const params = new URLSearchParams({
    service_id: GAMC_DISTRICTS_SERVICE_ID,
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetFeatureInfo",
    SRS: "EPSG:4326",
    LAYERS: "",
    QUERY_LAYERS: "",
    BBOX: `${lon - d},${lat - d},${lon + d},${lat + d}`,
    WIDTH: "101",
    HEIGHT: "101",
    X: "50",
    Y: "50",
    INFO_FORMAT: "application/json",
    FEATURE_COUNT: "1",
  });
  const res = await fetch(`${GAMC_WMS_PATH}?${params.toString()}`);
  if (!res.ok) throw new Error("Consulta de distrito no disponible");
  const props = (await res.json())?.features?.[0]?.properties;
  const code = String(props?.Distrito || "").trim().toUpperCase();
  return code ? { code, comuna: String(props?.Comuna || "").trim() } : null;
}

/** Drainage feature ({ tipo, clasificacion }) at a WGS84 point, or null when none. */
export async function fetchDrainageAt(lat, lon) {
  const d = PROBE_HALF_DEG * 4;
  const params = new URLSearchParams({
    service_id: GAMC_DRAINAGE_SERVICE_ID,
    SERVICE: "WMS",
    VERSION: "1.1.1",
    REQUEST: "GetFeatureInfo",
    SRS: "EPSG:4326",
    LAYERS: "",
    QUERY_LAYERS: "",
    BBOX: `${lon - d},${lat - d},${lon + d},${lat + d}`,
    WIDTH: "101",
    HEIGHT: "101",
    X: "50",
    Y: "50",
    INFO_FORMAT: "application/json",
    FEATURE_COUNT: "3",
  });
  const res = await fetch(`${GAMC_WMS_PATH}?${params.toString()}`);
  if (!res.ok) throw new Error("Consulta de drenaje no disponible");
  const props = (await res.json())?.features?.[0]?.properties;
  if (!props) return null;
  const clasificacion = String(props.Clasificación || props.Clasificacion || "").trim();
  const tipo = String(props.Tipo || "").trim();
  return clasificacion || tipo ? { tipo, clasificacion } : null;
}
