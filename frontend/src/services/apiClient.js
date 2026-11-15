import {
  saveDeviceSnapshot,
  loadDeviceSnapshotSync,
  getDeviceDbStats,
} from "./embeddedDb.js";

const RESPONSE_CACHE_KEY = "tarpuy_api_responses_v1";
function readResponseCache(key) {
  try { return JSON.parse(localStorage.getItem(RESPONSE_CACHE_KEY) || "{}")[key]?.data || null; } catch { return null; }
}
function cacheResponse(key, data) {
  try {
    const entries = JSON.parse(localStorage.getItem(RESPONSE_CACHE_KEY) || "{}");
    delete entries[key];
    entries[key] = { data, savedAt: new Date().toISOString() };
    const recent = Object.fromEntries(Object.entries(entries).slice(-24));
    localStorage.setItem(RESPONSE_CACHE_KEY, JSON.stringify(recent));
  } catch { /* Storage limits must not interrupt a successful online request. */ }
}
async function freshJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const data = await response.json();
  cacheResponse(url, data);
  return data;
}

export function canonicalJsonStringify(obj) {
  if (obj === null || typeof obj !== "object") return JSON.stringify(obj);
  if (Array.isArray(obj)) return `[${obj.map(canonicalJsonStringify).join(",")}]`;
  const keys = Object.keys(obj).sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJsonStringify(obj[k])}`).join(",")}}`;
}

export async function verifyBundleIntegrity(bundle) {
  if (!bundle || !bundle.integrity_sha256) return false;
  const clone = { ...bundle };
  delete clone.integrity_sha256;
  const canonical = canonicalJsonStringify(clone);
  const data = new TextEncoder().encode(canonical);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex.toLowerCase() === bundle.integrity_sha256.toLowerCase();
}

export function saveOfflineBundle(zoneId, bundle, meta = {}) {
  return saveDeviceSnapshot({ zoneId, ...meta, bundle });
}

export function loadOfflineBundle(zoneId) {
  const snap = loadDeviceSnapshotSync();
  if (!snap?.bundle) return null;
  if (!zoneId || snap.zoneId === zoneId || snap.bundle?.zone_profile?.zone_id === zoneId) {
    return snap.bundle;
  }
  return null;
}

export function listCachedZoneIds() {
  const stats = getDeviceDbStats();
  return stats.zoneId ? [stats.zoneId] : [];
}

const FALLBACK_ZONES = [
  { zone_id: "punata_valle_alto", name: "Punata — Valle Alto", quechua_name: "Punata Qhichwa", subregion: "Valle Alto", municipality: "Punata", coordinates: { lat: -17.542, lon: -65.834 }, elevation_msnm: 2750, slope_category: "plana_valle", data_status: "phase0_seed_pending_etl", monthly_harmonized_indicators: [] },
  { zone_id: "tapacari_zona_andina", name: "Tapacarí — Zona Andina", quechua_name: "Tapacarí Urqukuna", subregion: "Cordillera Andina", municipality: "Tapacarí", coordinates: { lat: -17.518, lon: -66.612 }, elevation_msnm: 3680, slope_category: "ladera_fuerte", data_status: "phase0_seed_pending_etl", monthly_harmonized_indicators: [] },
  { zone_id: "mizque_cono_sur", name: "Mizque — Cono Sur", quechua_name: "Mizque Urin Suyu", subregion: "Cono Sur", municipality: "Mizque", coordinates: { lat: -17.941, lon: -65.342 }, elevation_msnm: 2050, slope_category: "valle_seco", data_status: "phase0_seed_pending_etl", monthly_harmonized_indicators: [] },
];

export async function fetchZones(forceOffline = false) {
  if (!forceOffline) {
    try {
      return await freshJson("/api/zones");
    } catch {}
  }
  const stored = readResponseCache("/api/zones");
  if (stored) return stored;
  const cachedIds = listCachedZoneIds();
  const cached = cachedIds.map((id) => loadOfflineBundle(id)?.zone_profile).filter(Boolean);
  return cached.length > 0 ? cached : FALLBACK_ZONES;
}

export async function fetchCrops(forceOffline = false) {
  if (!forceOffline) {
    try {
      return await freshJson("/api/crops");
    } catch {}
  }
  const stored = readResponseCache("/api/crops");
  if (stored) return stored;
  for (const zid of listCachedZoneIds()) {
    const b = loadOfflineBundle(zid);
    if (b?.crops_catalog?.length) return b.crops_catalog;
  }
  return [
    { crop_id: "papa_huaycha", name_es: "Papa Huaycha", name_qu: "Huaycha Papa" },
    { crop_id: "maiz_valle", name_es: "Maíz de Valle", name_qu: "Sara" },
    { crop_id: "haba", name_es: "Haba", name_qu: "Jawasa" },
    { crop_id: "tarwi", name_es: "Tarwi", name_qu: "Tarwi" },
    { crop_id: "quinua", name_es: "Quinua", name_qu: "Kinwa" },
    { crop_id: "cebada", name_es: "Cebada", name_qu: "Siwara" },
    { crop_id: "avena_vicia", name_es: "Avena y Vicia", name_qu: "Avenawan Wikawan" },
    { crop_id: "alfalfa", name_es: "Alfalfa", name_qu: "Alfalfa" },
  ];
}

export async function fetchAlerts(zoneId, forceOffline = false, { districtCode, comuna, drainage, lat, lon } = {}) {
  const cacheKey = `alerts:${canonicalJsonStringify({ zoneId, lat: lat ?? null, lon: lon ?? null, districtCode: districtCode || null, comuna: comuna || null, drainage: drainage || null })}`;
  if (!forceOffline) {
    try {
      const params = new URLSearchParams({ refresh: "true" });
      if (Number.isFinite(lat) && Number.isFinite(lon)) { params.set("lat", lat); params.set("lon", lon); }
      if (districtCode) params.set("district_code", districtCode);
      if (comuna) params.set("comuna", comuna);
      if (drainage) {
        const dText = typeof drainage === "string" ? drainage : drainage.clasificacion || drainage.tipo || "";
        if (dText) params.set("drainage", dText);
      }
      const qs = params.toString();
      const res = await fetch(`/api/alerts/${zoneId}${qs ? `?${qs}` : ""}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (res.headers?.get("X-Tarpuy-Offline") === "1") return { ...data, offline_copy: true, weather_refresh_error: true };
        cacheResponse(cacheKey, data); return data;
      }
    } catch {}
  }
  const saved = readResponseCache(cacheKey) || loadOfflineBundle(zoneId)?.realtime_bulletin;
  return saved ? { ...saved, offline_copy: true, weather_refresh_error: true } : null;
}

export async function fetchRecommendations(payload, forceOffline = false) {
  const cacheKey = `recommend:${canonicalJsonStringify(payload)}`;
  if (!forceOffline) {
    try {
      const res = await fetch("/api/recommend", {
        method: "POST",
        cache: "no-store",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        cacheResponse(cacheKey, data);
        return data;
      }
    } catch {}
  }
  const previous = readResponseCache(cacheKey);
  if (previous) return { ...previous, data_provenance: { ...previous.data_provenance, etl_status: "offline_cached_recommendation" } };
  const bundle = loadOfflineBundle(payload.zone_id);
  const strats = bundle?.precomputed_recommendations || bundle?.zone_profile?.strategies || [];
  const muni = payload.municipal_context || null;
  const scored = strats; // Stored reference strategies, never fabricate a new offline score.
  return {
    zone_id: payload.zone_id,
    evaluated_at: loadDeviceSnapshotSync()?.updatedAt || null,
    current_crop_id: payload.current_crop_id,
    priorities_considered: [],
    strategies: scored,
    realtime_bulletin: bundle?.realtime_bulletin || null,
    municipal_context: muni,
    data_provenance: {
      nasa_datasets: ["NASA POWER", "SMAP L4", "MODIS/Sentinel-2", "GPM/IMERG", "SRTM"],
      soil_dataset: "ISRIC SoilGrids 250m & FAO GAEZ v4 (Offline Sync)",
      etl_status: "offline_reference_only",
      integrity_sha256: bundle?.integrity_sha256 || null,
    },
  };
}

export async function autoSyncZoneSnapshot(zoneId, meta = {}, { signal } = {}) {
  const res = await fetch(`/api/offline-bundle/${encodeURIComponent(zoneId)}`, { cache: "no-store", signal });
  if (!res.ok) throw new Error(`HTTP ${res.status} al sincronizar base local`);
  const bundle = await res.json();
  const verified = await verifyBundleIntegrity(bundle);
  if (!verified) throw new Error("Firma SHA-256 del paquete satelital inválida");
  if (signal?.aborted) throw new Error("Sincronización cancelada");
  const saved = await saveDeviceSnapshot({ zoneId, ...meta, bundle });
  return {
    success: true,
    verified,
    zoneId,
    sizeKb: saved.sizeKb,
    updatedAt: saved.updatedAt,
    engine: "SQLite-IDB",
    bundle,
  };
}

export async function downloadZoneBundle(zoneId, meta = {}) {
  return autoSyncZoneSnapshot(zoneId, meta);
}
