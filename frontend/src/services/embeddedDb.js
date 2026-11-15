const DB_NAME = "tarpuy_embedded_sqlite_db";
const DB_VERSION = 1;
const STORE_NAME = "active_snapshot";
const PRIMARY_KEY = "CURRENT_DEVICE_SNAPSHOT";
const MIRROR_KEY = "tarpuy_single_snapshot_v1";

export function purgeLegacyStorageKeys() {
  if (typeof localStorage === "undefined") return;
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const k = localStorage.key(i);
      if (k && k.startsWith("tarpuy_bundle_")) keys.push(k);
    }
    keys.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

function openEmbeddedDb() {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

function computeSizeKb(obj) {
  try {
    const raw = JSON.stringify(obj);
    const bytes = typeof Blob !== "undefined" ? new Blob([raw]).size : raw.length;
    return Math.max(1, Math.round(bytes / 1024));
  } catch {
    return 1;
  }
}

export function loadDeviceSnapshotSync() {
  if (typeof localStorage === "undefined") return null;
  try {
    const raw = localStorage.getItem(MIRROR_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function loadDeviceSnapshotAsync() {
  const db = await openEmbeddedDb();
  if (!db) return loadDeviceSnapshotSync();
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const req = tx.objectStore(STORE_NAME).get(PRIMARY_KEY);
      req.onsuccess = () => {
        db.close();
        resolve(req.result || loadDeviceSnapshotSync());
      };
      req.onerror = () => {
        db.close();
        resolve(loadDeviceSnapshotSync());
      };
    } catch {
      resolve(loadDeviceSnapshotSync());
    }
  });
}

export async function saveDeviceSnapshot(record = {}) {
  const payload = {
    id: PRIMARY_KEY,
    zoneId: record.zoneId || "punata_valle_alto",
    communityName: record.communityName || "Punata",
    cropId: record.cropId || "maiz_valle",
    irrigation: record.irrigation || "deficit_auxiliary",
    userPoint: record.userPoint || null,
    districtMeta: record.districtMeta || null,
    bundle: record.bundle ?? loadDeviceSnapshotSync()?.bundle ?? null,
    updatedAt: new Date().toISOString(),
    sizeKb: 0,
  };
  payload.sizeKb = computeSizeKb(payload);

  purgeLegacyStorageKeys();
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.setItem(MIRROR_KEY, JSON.stringify(payload));
    } catch {}
  }

  const db = await openEmbeddedDb();
  if (db) {
    await new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.clear();
        store.put(payload, PRIMARY_KEY);
        tx.oncomplete = () => { db.close(); resolve(true); };
        tx.onerror = () => { db.close(); resolve(false); };
      } catch {
        resolve(false);
      }
    });
  }
  return payload;
}

export function getDeviceDbStats() {
  const snap = loadDeviceSnapshotSync();
  return {
    engine: "SQLite-IDB",
    records: snap ? 1 : 0,
    sizeKb: snap?.sizeKb || 0,
    zoneId: snap?.zoneId || null,
    communityName: snap?.communityName || null,
    updatedAt: snap?.updatedAt || null,
  };
}
