const CACHE_NAME = 'khabar-v3'; // Bump version again to force update
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/logo.png',
  '/css/style.css',
  '/css/responsive.css'
];

// Install - cache core
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k!== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

// Fetch - Safari-safe + skip external APIs
self.addEventListener('fetch', (event) => {
  const req = event.request;
  
  // Only handle GET
  if (req.method!== 'GET') return;

  // ✅ FIX 1: Skip Appwrite, AdSense, and other external APIs
  if (req.url.includes('nyc.cloud.appwrite.io') || 
      req.url.includes('pagead2.googlesyndication.com') ||
      req.url.includes('google-analytics.com') ||
      req.url.includes('googletagmanager.com')) {
    return; // Let browser handle it, don't intercept
  }

  // Navigation requests - NEVER return a redirected response
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const networkResp = await fetch(req, { redirect: 'manual' });
          
          // If redirect, follow manually
          if (networkResp.type === 'opaqueredirect' || (networkResp.status >= 300 && networkResp.status < 400)) {
            return await fetch(req);
          }
          
          // Cache only successful non-redirected responses
          if (networkResp.ok &&!networkResp.redirected) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(req, networkResp.clone());
          }
          return networkResp;
        } catch (e) {
          // Offline fallback
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
        if (resp.ok &&!resp.redirected && resp.type!== 'opaqueredirect') {
          caches.open(CACHE_NAME).then(c => c.put(req, resp.clone()));
        }
        return resp;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});