// `npm run build:site` replaces this development shell with the exact hashed
// assets from that build. Keeping the source shell asset-agnostic avoids a
// stale fixed entry point during `npm run dev`.
const CACHE = 'caption-salience-dev-v4';
const SHELL = ['/', '/demo', '/player', '/privacy', '/terms', '/install', '/favicon.svg', '/apple-touch-icon.png', '/assets/caption-console-720.webp'];
self.addEventListener('install', (event) => event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting())));
self.addEventListener('activate', (event) => event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith(caches.match(event.request, { ignoreVary: true }).then((cached) => cached || fetch(event.request).then((response) => {
    const copy = response.clone();
    caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    return response;
  }).catch(() => event.request.mode === 'navigate' ? caches.match('/') : Response.error())));
});
