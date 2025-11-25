// Service Worker for Performance Optimization
// Caches static assets and API responses for offline support and faster loading

const CACHE_VERSION = 'v2.1.0';
const CACHE_NAME = `megapixelai-${CACHE_VERSION}`;
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const API_CACHE = `api-${CACHE_VERSION}`;
const IMAGE_CACHE = `images-${CACHE_VERSION}`;
const ROUTE_CACHE = `routes-${CACHE_VERSION}`;
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB max cache size (increased for better performance)
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const API_CACHE_TTL = 5 * 60 * 1000; // 5 minutes for API responses

// Critical assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/home',
  '/tools',
  '/favicon.svg',
  '/logo.svg',
];

// Install event - cache static assets with error handling
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        // Cache critical assets, ignore failures for non-critical ones
        return Promise.allSettled(
          STATIC_ASSETS.map(url => 
            cache.add(url).catch(err => {
              console.warn(`Failed to cache ${url}:`, err);
              return null;
            })
          )
        );
      })
      .catch(err => {
        console.error('Cache installation failed:', err);
      })
  );
  self.skipWaiting(); // Activate immediately
});

// Activate event - clean up old caches and manage cache size
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      // Delete old caches
      const deleteOldCaches = Promise.all(
        cacheNames
          .filter((name) => {
            return !name.includes(CACHE_VERSION);
          })
          .map((name) => {
            console.log('Deleting old cache:', name);
            return caches.delete(name);
          })
      );
      
      // Clean up cache size if needed
      return deleteOldCaches.then(() => {
        return manageCacheSize();
      });
    })
  );
  return self.clients.claim(); // Take control immediately
});

// Manage cache size to prevent overflow
async function manageCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  const cacheEntries = [];
  
  // Calculate total cache size
  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const keys = await cache.keys();
    
    for (const request of keys) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        const size = blob.size;
        totalSize += size;
        cacheEntries.push({ cacheName, request, size, timestamp: Date.now() });
      }
    }
  }
  
  // If cache exceeds max size, remove oldest entries
  if (totalSize > MAX_CACHE_SIZE) {
    cacheEntries.sort((a, b) => a.timestamp - b.timestamp);
    
    for (const entry of cacheEntries) {
      if (totalSize <= MAX_CACHE_SIZE * 0.8) break; // Remove until 80% of max
    
      const cache = await caches.open(entry.cacheName);
      await cache.delete(entry.request);
      totalSize -= entry.size;
    }
  }
  
  // Remove entries older than MAX_CACHE_AGE
  const now = Date.now();
  for (const entry of cacheEntries) {
    if (now - entry.timestamp > MAX_CACHE_AGE) {
      const cache = await caches.open(entry.cacheName);
      await cache.delete(entry.request);
    }
  }
}

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Cache strategy for static assets - Cache First
  if (url.pathname.startsWith('/_next/static/') || 
      url.pathname.startsWith('/static/') ||
      url.pathname.match(/\.(js|css|woff|woff2|ttf|eot|svg)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request)
          .then((response) => {
            // Only cache successful responses
            if (response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone).catch(err => {
                  console.warn('Failed to cache static asset:', err);
                });
              });
            }
            return response;
          })
          .catch(() => {
            // Return offline fallback if network fails
            return new Response('Offline', { 
              status: 503, 
              headers: { 'Content-Type': 'text/plain' } 
            });
          });
      })
    );
    return;
  }

  // Cache strategy for images - Cache First with Stale-While-Revalidate
  if (url.pathname.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i) || 
      url.pathname.startsWith('/_next/image')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        // Return cached version immediately if available
        if (cached) {
          // Update cache in background (stale-while-revalidate)
          fetch(request).then((response) => {
            if (response.status === 200 && response.type === 'basic') {
              const responseClone = response.clone();
              caches.open(IMAGE_CACHE).then((cache) => {
                cache.put(request, responseClone).catch(() => {});
              });
            }
          }).catch(() => {});
          return cached;
        }
        
        // Fetch and cache if not in cache
        return fetch(request).then((response) => {
          if (response.status === 200 && response.type === 'basic') {
            const responseClone = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, responseClone).catch(() => {});
            });
          }
          return response;
        }).catch(() => {
          return new Response('Image unavailable', { 
            status: 503,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
      })
    );
    return;
  }

  // Network-first strategy for API calls with short cache TTL
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        // Check if cached version is still valid
        if (cached) {
          const cachedAt = parseInt(cached.headers.get('sw-cached-at') || '0');
          const cacheAge = Date.now() - cachedAt;
          if (cacheAge < API_CACHE_TTL) {
            // Return cached version immediately, update in background
            fetch(request, { 
              cache: 'no-store',
              headers: {
                ...request.headers,
                'Cache-Control': 'no-cache',
              }
            }).then((response) => {
              if (request.method === 'GET' && response.status === 200) {
                const responseClone = response.clone();
                caches.open(API_CACHE).then((cache) => {
                  const headers = new Headers(responseClone.headers);
                  headers.set('sw-cached-at', Date.now().toString());
                  const cachedResponse = new Response(responseClone.body, {
                    status: responseClone.status,
                    statusText: responseClone.statusText,
                    headers: headers,
                  });
                  cache.put(request, cachedResponse).catch(() => {});
                });
              }
            }).catch(() => {});
            return cached;
          }
        }
        
        // Fetch fresh from network
        return fetch(request, { 
          cache: 'no-store',
          headers: {
            ...request.headers,
            'Cache-Control': 'no-cache',
          }
        }).then((response) => {
          // Only cache GET requests and successful responses
          if (request.method === 'GET' && response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then((cache) => {
              const headers = new Headers(responseClone.headers);
              headers.set('sw-cached-at', Date.now().toString());
              const cachedResponse = new Response(responseClone.body, {
                status: responseClone.status,
                statusText: responseClone.statusText,
                headers: headers,
              });
              cache.put(request, cachedResponse).catch(() => {});
            });
          }
          return response;
        }).catch(() => {
          // Return cached version if network fails (even if stale)
          return cached || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
    return;
  }

  // Stale-while-revalidate for pages
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request).then((response) => {
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });

      return cached || fetchPromise;
    })
  );
});

