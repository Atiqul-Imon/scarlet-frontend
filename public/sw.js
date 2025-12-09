// Service Worker for offline functionality
const CACHE_NAME = 'scarlet-beauty-v1';
const STATIC_CACHE = 'scarlet-static-v1';
const DYNAMIC_CACHE = 'scarlet-dynamic-v1';

// Files to cache for offline functionality
const STATIC_FILES = [
  '/',
  '/offline',
  '/manifest.json',
  '/favicon.ico',
  // Add other critical static files
];

// Dynamic API endpoints - DO NOT CACHE
const DYNAMIC_API_PATTERNS = [
  /\/api\/cart/,
  /\/api\/orders/,
  /\/api\/auth\/(?!me)/,  // Auth endpoints except /me
  /\/api\/users/,
  /\/api\/checkout/,
  /\/api\/wishlist/,
  /\/api\/payments/,
  /\/api\/addresses/,
  /\/api\/cart-abandonment/,
];

// Semi-static API endpoints - Cache with short TTL
const STATIC_API_PATTERNS = [
  /\/api\/products/,
  /\/api\/categories/,
  /\/api\/auth\/me/,  // User profile can be cached briefly
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Failed to cache static files:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  event.respondWith(
    handleRequest(request)
  );
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Handle API requests based on type
    if (url.pathname.startsWith('/api/')) {
      // Check if it's dynamic content - never cache
      if (isDynamicApiRequest(request)) {
        return await fetch(request);  // Always fetch fresh
      }
      
      // Semi-static API - use network first with short cache
      if (isStaticApiRequest(request)) {
        return await networkFirstWithShortCache(request);
      }
      
      // Default API behavior - network first
      return await networkFirst(request);
    }
    
    // Try cache first for static assets
    if (isStaticAsset(request)) {
      return await cacheFirst(request);
    }
    
    // For pages, try network first with cache fallback
    return await networkFirstWithFallback(request);
    
  } catch (error) {
    console.error('Fetch failed:', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    // For dynamic API requests, don't return cached version
    if (url.pathname.startsWith('/api/') && isDynamicApiRequest(request)) {
      throw error;
    }
    
    // Return cached version if available
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Network first strategy
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Cache first strategy
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Network first with short cache (for semi-static content)
async function networkFirstWithShortCache(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses with short TTL
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      // Add timestamp to response for TTL checking
      const responseWithTimestamp = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: {
          ...networkResponse.headers,
          'sw-cache-timestamp': Date.now().toString(),
          'sw-cache-ttl': '300000', // 5 minutes
        },
      });
      cache.put(request, responseWithTimestamp.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Check if we have a cached version that's not expired
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      const timestamp = cachedResponse.headers.get('sw-cache-timestamp');
      const ttl = parseInt(cachedResponse.headers.get('sw-cache-ttl') || '300000');
      
      if (timestamp && (Date.now() - parseInt(timestamp)) < ttl) {
        return cachedResponse;
      }
    }
    
    throw error;
  }
}

// Network first with cache fallback
async function networkFirstWithFallback(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // For navigation requests, return offline page
    if (request.mode === 'navigate') {
      return caches.match('/offline');
    }
    
    throw error;
  }
}

// Check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)
  );
}

// Check if API request is dynamic (should never be cached)
function isDynamicApiRequest(request) {
  const url = new URL(request.url);
  return DYNAMIC_API_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Check if API request is semi-static (can be cached briefly)
function isStaticApiRequest(request) {
  const url = new URL(request.url);
  return STATIC_API_PATTERNS.some(pattern => pattern.test(url.pathname));
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'cart-sync') {
    event.waitUntil(syncCartData());
  }
  
  if (event.tag === 'wishlist-sync') {
    event.waitUntil(syncWishlistData());
  }
});

// Sync cart data when back online
async function syncCartData() {
  try {
    // Get pending cart actions from IndexedDB
    const pendingActions = await getPendingCartActions();
    
    for (const action of pendingActions) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action),
        });
        
        // Remove from pending actions
        await removePendingCartAction(action.id);
      } catch (error) {
        console.error('Failed to sync cart action:', error);
      }
    }
  } catch (error) {
    console.error('Cart sync failed:', error);
  }
}

// Sync wishlist data when back online
async function syncWishlistData() {
  try {
    // Get pending wishlist actions from IndexedDB
    const pendingActions = await getPendingWishlistActions();
    
    for (const action of pendingActions) {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(action),
        });
        
        // Remove from pending actions
        await removePendingWishlistAction(action.id);
      } catch (error) {
        console.error('Failed to sync wishlist action:', error);
      }
    }
  } catch (error) {
    console.error('Wishlist sync failed:', error);
  }
}

// Helper functions for IndexedDB operations
async function getPendingCartActions() {
  // Implementation would depend on your IndexedDB setup
  return [];
}

async function removePendingCartAction(id) {
  // Implementation would depend on your IndexedDB setup
}

async function getPendingWishlistActions() {
  // Implementation would depend on your IndexedDB setup
  return [];
}

async function removePendingWishlistAction(id) {
  // Implementation would depend on your IndexedDB setup
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from Scarlet Beauty',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icon-192x192.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png',
      },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification('Scarlet Beauty', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});
