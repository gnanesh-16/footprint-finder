self.addEventListener('install', (e) => {
    self.skipWaiting();
});
self.addEventListener('activate', (e) => {
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const req = event.request;
    const url = new URL(req.url);
    if (url.origin.includes('tile.openstreetmap.org')) {
        event.respondWith(fetch(req));
        return;
    }
    event.respondWith(fetch(req).catch(() => caches.match(req)));
});
