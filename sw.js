/* Service worker: rende l'app disponibile anche offline.
   Quando modifichi l'app, aumenta CACHE per far scaricare la nuova versione. */
const CACHE = "piccoli-passi-v8";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/app.css",
  "./js/app.js",
  "./js/data-recipes.js",
  "./js/data-guide.js",
  "./js/data-activities.js",
  "./js/data-events.js",
  "./js/data-health.js",
  "./js/data-growth.js",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Prima la rete (così i contenuti restano aggiornati); se la rete è lenta o assente, la copia salvata.
self.addEventListener("fetch", event => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  const network = fetch(req).then(res => {
    if (res && res.ok) {
      const copy = res.clone();
      caches.open(CACHE).then(cache => cache.put(req, copy));
    }
    return res;
  });
  event.waitUntil(network.then(() => undefined, () => undefined));
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(cached => {
      if (!cached) return network.catch(() => caches.match("./index.html"));
      const slow = new Promise(resolve => setTimeout(() => resolve(cached), 3000));
      return Promise.race([network.catch(() => cached), slow]);
    })
  );
});
