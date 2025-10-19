// Advanced Service Worker for Scarlet E-commerce
// Version: 3.0.0

const CACHE_VERSION = 'v3.0.0';
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.png',
  '/apple-touch-icon.png',
];

// API endpoints that are safe to cache
const CACHEABLE_APIS = [
  '/api/catalog/categories',
  '/api/catalog/products',
  '/api/brands',
  '/api/blog',
];

// API endpoints that should NEVER be cached
const NEVER_CACHE_APIS = [
  '/api/auth',
  '/api/cart',
  '/api/orders',
  '/api/payments',
  '/api/checkout',
  '/api/users/profile',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      });
    }).then(() => {
      // Force the waiting service worker to become active
      return self.skipWaiting();
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...', CACHE_VERSION);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => {
            // Delete caches that don't match current version
            return cacheName !== STATIC_CACHE &&
                   cacheName !== DYNAMIC_CACHE &&
                   cacheName !== IMAGE_CACHE &&
                   cacheName !== API_CACHE;
          })
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
      // Take control of all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - handle requests with appropriate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other origins
  if (!url.origin.includes(self.location.origin)) {
    return;
  }

  // Handle different types of requests
  if (shouldNeverCache(url.pathname)) {
    // Network-only for critical endpoints
    event.respondWith(networkOnly(request));
  } else if (isImageRequest(request)) {
    // Cache-first for images
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
  } else if (isCacheableAPI(url.pathname)) {
    // Network-first with cache fallback for safe APIs
    event.respondWith(networkFirst(request, API_CACHE));
  } else if (isStaticAsset(url.pathname)) {
    // Cache-first for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE));
  } else {
    // Stale-while-revalidate for dynamic pages
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
  }
});

// Network-only strategy (no caching)
async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    return new Response('Network error', { status: 503 });
  }
}

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[SW] Cache-first fetch failed:', error);
    return getOfflinePage();
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    return getOfflinePage();
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      const cache = caches.open(cacheName);
      cache.then((c) => c.put(request, response.clone()));
    }
    return response;
  }).catch(() => cached || getOfflinePage());

  return cached || fetchPromise;
}

// Helper functions
function shouldNeverCache(pathname) {
  return NEVER_CACHE_APIS.some((api) => pathname.startsWith(api));
}

function isCacheableAPI(pathname) {
  return CACHEABLE_APIS.some((api) => pathname.startsWith(api));
}

function isImageRequest(request) {
  return request.destination === 'image' ||
         /\.(png|jpg|jpeg|webp|gif|svg|ico)$/i.test(request.url);
}

function isStaticAsset(pathname) {
  return /\.(js|css|woff|woff2|ttf|eot)$/i.test(pathname);
}

async function getOfflinePage() {
  const cache = await caches.open(STATIC_CACHE);
  const offlinePage = await cache.match('/offline');
  return offlinePage || new Response('Offline', { status: 503 });
}

// Background sync for cart and orders
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);

  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCart());
  } else if (event.tag === 'sync-order') {
    event.waitUntil(syncOrders());
  }
});

async function syncCart() {
  try {
    console.log('[SW] Syncing cart...');
    // Implementation would sync with backend
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Cart sync failed:', error);
    throw error;
  }
}

async function syncOrders() {
  try {
    console.log('[SW] Syncing orders...');
    // Implementation would sync with backend
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Order sync failed:', error);
    throw error;
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'Scarlet';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/favicon.png',
    badge: '/favicon.png',
    data: data.url || '/',
    actions: [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open') {
    const url = event.notification.data || '/';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Message handling from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  } else if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(clearAllCaches());
  } else if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(cacheUrls(event.data.urls));
  }
});

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((cacheName) => caches.delete(cacheName))
  );
  console.log('[SW] All caches cleared');
}

async function cacheUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  await cache.addAll(urls);
  console.log('[SW] URLs cached:', urls);
}

console.log('[SW] Service worker loaded', CACHE_VERSION);
