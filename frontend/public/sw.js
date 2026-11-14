const CACHE_NAME = "tarpuy-nasa-v8-water-main";
const STATIC_ASSETS = [
  "/fonts/atkinson-hyperlegible-0.ttf",
  "/fonts/atkinson-hyperlegible-1.ttf",
  "/fonts/nunito-0.ttf",
  "/fonts/nunito-1.ttf",
  "/fonts/nunito-2.ttf",
  "/",
  "/index.html",
  "/manifest.json",
  "/vite.svg",
  "/logos/nasa-space-apps.png",
  "/logos/alcaldia-cochabamba-celeste.png",
  "/logos/alcaldia-cochabamba-escudo.jpg",
  "/audio/quh/manifest.json",
  "/audio/quh/guide_punata_valle_alto.wav",
  "/audio/quh/guide_tapacari_zona_andina.wav",
  "/audio/quh/guide_mizque_cono_sur.wav",
  "/audio/es/manifest.json",
  ...["es", "quh"].flatMap((lang) =>
    ["frost", "rain", "drainage", "dry", "missing", "check", "stable"]
      .map((reason) => `/audio/${lang}/water_${reason}.wav`)),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/@vite/") ||
    url.pathname.startsWith("/@react-refresh") ||
    url.pathname.startsWith("/node_modules/") ||
    url.searchParams.has("t") ||
    url.searchParams.has("v")
  ) return;

  // API endpoints: network-first, fallback to cache for offline rural access
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(req)
        .then((networkRes) => {
          if (networkRes && networkRes.status === 200) {
            const copy = networkRes.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return networkRes;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Static assets & navigation: cache-first, fallback to network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          if (req.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
