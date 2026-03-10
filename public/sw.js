/* ─────────────────────────────────────────────────────────────
   MSAMBWA Service Worker v2
   - App shell / images / API caching (unchanged)
   - Local notification scheduling via message events
   - Handles: welcome, cart abandonment, new arrivals, sale alert
───────────────────────────────────────────────────────────── */

const CACHE_NAME = 'msambwa-v2';
const IMG_CACHE  = 'msambwa-images-v1';
const API_CACHE  = 'msambwa-api-v1';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ── Timers held in SW memory ──────────────────────────────────
let cartTimer    = null;   // cart abandonment
let arrivalTimer = null;   // new arrivals repeat

// ── Install ───────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ──────────────────────────────────────────────────
self.addEventListener('activate', event => {
  const VALID = [CACHE_NAME, IMG_CACHE, API_CACHE];
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => !VALID.includes(k)).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(networkFirst(request, API_CACHE, 5000)); return;
  }
  if (request.destination === 'image' || /\.(png|jpg|jpeg|gif|webp|svg|ico)(\?.*)?$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMG_CACHE)); return;
  }
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(cacheFirst(request, CACHE_NAME)); return;
  }
  if (request.destination === 'document' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request, CACHE_NAME, 3000)); return;
  }
  event.respondWith(networkFirst(request, CACHE_NAME, 4000));
});

// ── Cache helpers ─────────────────────────────────────────────
async function cacheFirst(request, cacheName) {
  const cache  = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (_) {
    return new Response('', { status: 503 });
  }
}

async function networkFirst(request, cacheName, timeoutMs = 4000) {
  const cache      = await caches.open(cacheName);
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (_) {
    clearTimeout(timeoutId);
    const cached = await cache.match(request);
    if (cached) return cached;
    if (request.destination === 'document') {
      const offlinePage = await cache.match('/');
      if (offlinePage) return offlinePage;
    }
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503, headers: { 'Content-Type': 'application/json' }
    });
  }
}

// ── Notification helper ───────────────────────────────────────
function showNotif(title, body, tag, url = '/') {
  return self.registration.showNotification(title, {
    body,
    tag,                               // prevents duplicate stacking
    icon:    '/icons/icon-192x192.png',
    badge:   '/icons/icon-96x96.png',
    vibrate: [120, 60, 120],
    data:    { url },
    requireInteraction: false,
  });
}

// ── Message events from the app ───────────────────────────────
self.addEventListener('message', event => {
  const { type, payload } = event.data || {};

  switch (type) {

    // ── 1. WELCOME — fire once after 30 seconds ──────────────
    case 'NOTIF_WELCOME':
      setTimeout(() => {
        showNotif(
          'Welcome to MSAMBWA',
          'Classic wear, delivered. Tap to explore the latest collection.',
          'welcome'
        );
      }, 30 * 1000);
      break;

    // ── 2. CART ABANDONMENT — fire 1hr after cart updated ────
    case 'NOTIF_CART_START':
      clearTimeout(cartTimer);
      cartTimer = setTimeout(() => {
        const count = payload?.count || 1;
        showNotif(
          'Still thinking it over?',
          `You have ${count} item${count > 1 ? 's' : ''} waiting in your bag.`,
          'cart-abandon'
        );
      }, 60 * 60 * 1000); // 1 hour
      break;

    case 'NOTIF_CART_CANCEL':
      clearTimeout(cartTimer);
      break;

    // ── 3. NEW ARRIVALS — fire every 3 days ──────────────────
    case 'NOTIF_ARRIVALS_START':
      clearInterval(arrivalTimer);
      // First fire after 3 days, then every 3 days
      const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
      arrivalTimer = setInterval(() => {
        showNotif(
          'New arrivals just dropped',
          'Fresh styles are in. Check out what\'s new at MSAMBWA.',
          'new-arrivals'
        );
      }, THREE_DAYS);
      break;

    case 'NOTIF_ARRIVALS_STOP':
      clearInterval(arrivalTimer);
      break;

    // ── 4. SALE ALERT — triggered from dashboard ─────────────
    case 'NOTIF_SALE':
      const title   = payload?.title   || 'Sale at MSAMBWA';
      const message = payload?.message || 'Special offer available now. Shop before it ends.';
      showNotif(title, message, 'sale-alert');
      break;
  }
});

// ── Push notifications (backend — future use) ─────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch (_) { data = { title: 'MSAMBWA', body: event.data.text() }; }
  event.waitUntil(
    showNotif(
      data.title || 'MSAMBWA',
      data.body  || '',
      data.tag   || 'push',
      data.url   || '/'
    )
  );
});

// ── Notification click → open app ────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if ('focus' in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow(url);
      })
  );
});
