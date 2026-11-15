const CACHE_NAME = "tarpuy-nasa-pwa-__BUILD_ID__";
const STATIC_ASSETS = [
  "/", "/index.html", "/manifest.json",
  "/icons/tarpuy-180.png", "/icons/tarpuy-192.png", "/icons/tarpuy-512.png", "/icons/tarpuy-maskable-512.png",
  "/fonts/atkinson-hyperlegible-0.ttf", "/fonts/atkinson-hyperlegible-1.ttf",
  "/fonts/nunito-0.ttf", "/fonts/nunito-1.ttf", "/fonts/nunito-2.ttf",
  "/logos/nasa-space-apps-no-background.png", "/logos/alcaldia-cochabamba-escudo-no-background.png",
];
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const response = await fetch("/precache-manifest.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Application asset list unavailable");
    const assets = await response.json();
    if (!Array.isArray(assets) || !assets.length || assets.some(path => typeof path !== "string" || !path.startsWith("/assets/"))) throw new Error("Invalid asset list");
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll([...STATIC_ASSETS, ...assets]);
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    // Keep previously downloaded API/audio assets; replace only the app shell.
    const current = await caches.open(CACHE_NAME);
    for (const key of keys.filter(key => key.startsWith("tarpuy-nasa-") && key !== CACHE_NAME)) {
      const previous = await caches.open(key);
      for (const request of await previous.keys()) {
        const url = new URL(request.url);
        if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/audio/")) {
          if (!(await current.match(request))) await current.put(request, await previous.match(request));
        }
      }
      await caches.delete(key);
    }
    await self.clients.claim();
  })());
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
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)));
          }
          return networkRes;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (!cached) return new Response(JSON.stringify({ detail: "Sin conexión y sin copia guardada" }), { status: 503, headers: { "Content-Type": "application/json" } });
          const headers = new Headers(cached.headers);
          headers.set("X-Tarpuy-Offline", "1");
          return new Response(cached.body, { status: cached.status, headers });
        })
    );
    return;
  }

  // Navigation (HTML): network-first so updates show immediately, fallback to cache when offline
  if (req.mode === "navigate" || url.pathname === "/" || url.pathname === "/index.html") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.status === 200) {
            const copy = res.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)));
          }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match("/index.html")))
    );
    return;
  }

  // Static assets: cache-first, fallback to network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)));
        }
        return res;
      });
    })
  );
});
