const CACHE_NAME = 'khabar-v2';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico'
];

// Install - cache core
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch - Safari-safe
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Only handle GET
  if (req.method !== 'GET') return;

  // Navigation requests - NEVER return a redirected response
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Use manual redirect to detect redirects
          const networkResp = await fetch(req, { redirect: 'manual' });
          
          // If it's a redirect (3xx), follow it manually without returning redirected response
          if (networkResp.type === 'opaqueredirect' || networkResp.status >= 300 && networkResp.status < 400) {
            const finalResp = await fetch(req); // let browser follow
            // Don't cache redirected responses
            return finalResp;
          }
          
          // Cache only successful non-redirected responses
          if (networkResp.ok && !networkResp.redirected) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, networkResp.clone());
          }
          return networkResp;
        } catch (e) {
          // Offline fallback - serve cached root, NOT index.html redirect
          const cached = await caches.match('/');
          return cached || caches.match('/index.html');
        }
      })()
    );
    return;
  }

  // Static assets - stale-while-revalidate, ignore redirects
  event.respondWith(
    caches.match(req).then(cached => {
      const fetchPromise = fetch(req, { redirect: 'manual' }).then(resp => {
        // Safari fix: do not cache redirected responses
        if (resp.ok && !resp.redirected && resp.type !== 'opaqueredirect') {
          caches.open(CACHE_NAME).then(c => c.put(req, resp.clone()));
        }
        return resp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});