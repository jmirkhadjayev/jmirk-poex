/* Service worker — basic offline support for the PWA.
 * Strategy: network-first for ALL same-origin GETs (always fresh when online),
 * falling back to cache only when offline. Cross-origin (CDNs/APIs) untouched.
 * Network-first avoids serving stale CSS/JS after an update. */
const CACHE = 'jm-portfolio-v1';
const CORE = [
  './',
  './index.html',
  './assets/css/style.css',
  './assets/css/creative.css',
  './assets/js/main.js',
  './assets/js/creative.js',
  './assets/img/favicon.png',
  './assets/img/pwa-icon.svg',
  './manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // leave CDNs / APIs alone

  // Network-first: fresh when online, cache fallback when offline.
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
      )
  );
});
