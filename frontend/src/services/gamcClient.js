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
