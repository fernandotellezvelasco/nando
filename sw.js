const CACHE_NAME = 'gymstar-v6';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/storage.js',
  './js/data.js',
  './js/routines.js',
  './js/macros.js',
  './js/achievements.js',
  './js/charts.js',
  './js/seed.js',
  './js/app.js',
  './vendor/chart.umd.min.js',
  './vendor/feather.min.js',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/mark.png',
  './icons/splash/splash-1284x2778.png',
  './icons/splash/splash-1320x2868.png',
  './icons/splash/splash-1206x2622.png',
  './icons/splash/splash-1179x2556.png',
  './icons/splash/splash-1170x2532.png',
  './icons/splash/splash-828x1792.png',
  './icons/splash/splash-750x1334.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // Network-first: always prefer a fresh copy so fixes/updates land immediately.
  // Falls back to cache only when offline.
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.ok && event.request.url.startsWith(self.location.origin)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
