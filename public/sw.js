/* ─────────────────────────────────────────────────────────────
   MSAMBWA Service Worker
   Strategy:
   - App shell (JS/CSS/HTML) → Cache First, update in background
   - Product images          → Cache First, stale-while-revalidate
   - Supabase API calls      → Network First, fallback to cache
   - Everything else         → Network First
───────────────────────────────────────────────────────────── */

const CACHE_NAME    = 'msambwa-v1';
const IMG_CACHE     = 'msambwa-images-v1';
const API_CACHE     = 'msambwa-api-v1';

// App shell — pre-cache these on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ── Install: pre-cache app shell ──────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())   // activate immediately
  );
});

// ── Activate: delete old caches ───────────────────────────────
self.addEventListener('activate', event => {
  const VALID = [CACHE_NAME, IMG_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !VALID.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())  // take over open tabs immediately
  );
});

// ── Fetch: route-based caching ────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // ── Supabase / external API → Network First ──
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(request, API_CACHE, 5000));
    return;
  }

  // ── Images → Cache First (long TTL) ──
  if (
    request.destination === 'image' ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?.*)?$/.test(url.pathname)
  ) {
    event.respondWith(cacheFirst(request, IMG_CACHE));
    return;
  }

  // ── Next.js static assets (_next/static) → Cache First ──
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHE_NAME));
    return;
  }

  // ── HTML pages → Network First (always fresh) ──
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, CACHE_NAME, 3000));
    return;
  }

  // ── Everything else → Network First ──
  event.respondWith(networkFirst(request, CACHE_NAME, 4000));
});

/* ── Cache First strategy ─────────────────────────────────────
   Serve from cache if available; fetch and cache on miss.
   Good for: images, static assets (immutable chunks).        */
async function cacheFirst(request, cacheName) {
  const cache    = await caches.open(cacheName);
  const cached   = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());  // async — don't await
    }
    return response;
  } catch (_) {
    return new Response('', { status: 503, statusText: 'Offline' });
  }
}

/* ── Network First strategy ───────────────────────────────────
   Try network with a timeout; fall back to cache if offline.
   Good for: API calls, HTML pages.                           */
async function networkFirst(request, cacheName, timeoutMs = 4000) {
  const cache = await caches.open(cacheName);

  // Race the fetch against a timeout
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) {
      cache.put(request, response.clone());  // async update
    }
    return response;
  } catch (_) {
    clearTimeout(timeoutId);
    const cached = await cache.match(request);
    if (cached) return cached;

    // Last-resort offline page for document requests
    if (request.destination === 'document') {
      const offlinePage = await cache.match('/');
      if (offlinePage) return offlinePage;
    }
    return new Response(
      JSON.stringify({ error: 'offline' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ── Push notifications (future use) ──────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch (_) { data = { title: 'MSAMBWA', body: event.data.text() }; }

  event.waitUntil(
    self.registration.showNotification(data.title || 'MSAMBWA', {
      body:    data.body    || '',
      icon:    data.icon    || '/icons/icon-192x192.png',
      badge:   data.badge   || '/icons/icon-96x96.png',
      data:    data.url     || '/',
      vibrate: [100, 50, 100],
      actions: data.actions || [],
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
