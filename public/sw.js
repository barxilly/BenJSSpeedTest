// QwkSpd Service Worker - Minimal Caching
const CACHE_NAME = 'qwkspd-v1';
const ESSENTIAL_CACHE = [
  '/',
  '/index.html',
  '/fav.png',
  '/qwkspd.png'
];

// Install event - cache only essential files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('QwkSpd: Caching essential files');
        return cache.addAll(ESSENTIAL_CACHE);
      })
      .then(() => {
        // Skip waiting to activate immediately
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('QwkSpd: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - network first with minimal caching
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip external URLs (like Cloudflare API, fonts, etc.)
  if (!request.url.startsWith(self.location.origin)) {
    return;
  }

  // Network first strategy with minimal fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Only cache successful responses for essential files
        if (response.status === 200 && ESSENTIAL_CACHE.some(url => request.url.endsWith(url))) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Only return cached version for essential files
        if (ESSENTIAL_CACHE.some(url => request.url.endsWith(url))) {
          return caches.match(request);
        }
        // For everything else, just fail - we want fresh data for speed tests
        throw new Error('Network failed and no cache available');
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
