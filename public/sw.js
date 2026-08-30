// Syndicate Engineering Accounting Platform - Offline Service Worker v2.0
// Syrian Engineering Syndicate (Hasakah - Qamishlo - Derik)

const CACHE_NAME = 'syn-accounting-shell-v2';
const DATA_CACHE_NAME = 'syn-accounting-data-v2';
const DOCS_CACHE_NAME = 'syn-accounting-docs-v2';

const STATIC_ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  'https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&family=Chakra+Petch:ital,wght@0,600;0,700;1,700&family=JetBrains+Mono:wght@400;500;700;800&family=Space+Grotesk:wght@500;700&family=Syne:wght@700;800&display=swap'
];

// Install Event: Pre-cache App Shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching offline application shell & fonts...');
      return cache.addAll(STATIC_ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Some non-critical static assets failed to cache:', err);
      });
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== CACHE_NAME &&
            cacheName !== DATA_CACHE_NAME &&
            cacheName !== DOCS_CACHE_NAME
          ) {
            console.log('[SW] Deleting obsolete cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch Event Strategy:
// 1. Navigation requests -> Network first, fallback to cached /index.html
// 2. Static scripts/styles/fonts/images -> Stale-while-revalidate / Cache First
// 3. API calls -> Network with offline graceful JSON fallback
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || url.protocol.startsWith('chrome-extension')) {
    return;
  }

  // Handle SPA Navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          console.log('[SW] Offline navigate fallback triggered for:', request.url);
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return caches.match('/index.html') || caches.match('/');
        })
    );
    return;
  }

  // Handle Google Fonts and static CDN stylesheets
  if (url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                cache.put(request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => cachedResponse);
          return cachedResponse || fetchPromise;
        });
      })
    );
    return;
  }

  // Handle API Requests: Network first with offline fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(DATA_CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(async () => {
          const cachedData = await caches.match(request);
          if (cachedData) {
            return cachedData;
          }
          // Return generic offline API response
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'الخدمة تعمل في وضع عدم الاتصال (Offline Mode). البيانات المحلية متاحة.',
              status: 'OFFLINE_AVAILABLE'
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Default Stale-While-Revalidate for app assets, scripts, icons, stylesheets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Listen for messages from client (e.g. force cache document, sync data)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CACHE_DOCUMENT') {
    const { docId, docData } = event.data;
    caches.open(DOCS_CACHE_NAME).then((cache) => {
      const docResponse = new Response(JSON.stringify(docData), {
        headers: { 'Content-Type': 'application/json' }
      });
      cache.put(`/offline-doc/${docId}`, docResponse);
      console.log(`[SW] Cached document ${docId} for offline browsing`);
    });
  }
});
