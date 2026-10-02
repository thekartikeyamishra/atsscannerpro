// public/sw.js — ATS Scanner Pro Service Worker
// Strategy: Network-first for navigation + Cache-first for static assets
// Version: bump CACHE_NAME to force update on all clients

const CACHE_NAME  = 'ats-scanner-v3';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

// ── Install: pre-cache critical assets ────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          // Non-fatal: some assets might not exist yet during install
          console.warn('[SW] Pre-cache failed for some assets:', err);
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ── Activate: clean old caches ─────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch: routing strategy ────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip: non-GET, API calls, chrome-extension, external URLs
  if (
    request.method !== 'GET' ||
    url.pathname.startsWith('/api/') ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Static assets (JS, CSS, images, fonts) → Cache-first + background update
  if (
    url.pathname.startsWith('/_next/static/') ||
    /\.(ico|png|svg|webp|avif|woff2?|ttf|otf)$/.test(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => cached || new Response('Not found', { status: 404 }));

        // Return cache immediately if available, else wait for network
        return cached || fetchPromise;
      })
    );
    return;
  }

  // Navigation (HTML pages) → Network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful page loads
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request)
            .then((cached) => cached || caches.match('/'))
            .then((fallback) => fallback || new Response(
              '<!DOCTYPE html><html><body style="background:#040B1A;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center"><div><h1 style="font-size:2rem;margin-bottom:1rem">You\'re offline</h1><p style="color:#94A3B8">Connect to the internet to use ATS Scanner Pro.</p><a href="/" style="color:#3B82F6;margin-top:1rem;display:inline-block">Try again</a></div></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            ))
        )
    );
    return;
  }
});

// ── Message: handle cache clear requests ──────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      event.ports[0]?.postMessage({ success: true });
    });
  }
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
