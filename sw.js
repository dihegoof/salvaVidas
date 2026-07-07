const CACHE = 'salvaVidas-v2.1';
const FILES = [
  './',
  './index.html',
  './manifest.json',
  './css/variables.css',
  './css/components.css',
  './css/main.css',
  './css/toast.css',
  './css/loading.css',
  './css/admin.css',
  './css/wardrobe.css',
  './js/main.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

