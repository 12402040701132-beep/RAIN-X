/**
 * RAIN-X Offline Service Worker
 * Problem Statement: SIH26080 | MoES / NCMRWF
 * Caches application shell, district forecast grids, and provides offline support.
 */

const CACHE_NAME = 'rain-x-v1';
const DATA_CACHE_NAME = 'rain-x-data-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/index.css'
];

// Install: Precache shell assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[RAIN-X SW] Precaching shell assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[RAIN-X SW] Precache partial error (ignored in dev):', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
            console.log('[RAIN-X SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-while-revalidate for data and navigation
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Handle API or dataset requests with Cache-First / Network fallback
  if (url.pathname.includes('/api/') || url.pathname.includes('/data/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME).then((cache) => {
        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            return cache.match(request).then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Return synthetic offline response if not found in cache
              return new Response(
                JSON.stringify({ offline: true, message: 'Offline cached district forecast grid active' }),
                { headers: { 'Content-Type': 'application/json' } }
              );
            });
          });
      })
    );
    return;
  }

  // Handle navigation and other assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((networkResponse) => {
        return networkResponse;
      }).catch(() => {
        if (request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});

// Listen for message events (e.g. cache refresh)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CACHE_DISTRICT_GRID') {
    caches.open(DATA_CACHE_NAME).then((cache) => {
      const response = new Response(JSON.stringify(event.data.payload), {
        headers: { 'Content-Type': 'application/json' }
      });
      cache.put('/api/districts_forecast', response);
      console.log('[RAIN-X SW] District forecast grid cached successfully in Service Worker cache');
    });
  }
});
