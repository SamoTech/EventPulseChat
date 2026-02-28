// Event Pulse Chat - Service Worker
// Provides offline support and caching

const CACHE_VERSION = 'eventpulse-v1.0.0';
const APP_SHELL = [
  '/EventPulseChat/',
  '/EventPulseChat/index.html',
  '/EventPulseChat/style.css',
  '/EventPulseChat/script-simple.js',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js'
];

const API_CACHE = 'eventpulse-api-v1';
const API_CACHE_TIME = 30000; // 30 seconds

// Install - cache app shell
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(APP_SHELL);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_VERSION && name !== API_CACHE)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch - smart caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  // ESPN API - network first with cache fallback
  if (url.hostname.includes('espn.com')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          // Cache API response for 30 seconds
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(API_CACHE).then(cache => {
              cache.put(request, responseClone);
              // Clean old entries after 1 minute
              setTimeout(() => {
                cache.delete(request);
              }, 60000);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try cache
          return caches.match(request)
            .then(cachedResponse => {
              if (cachedResponse) {
                console.log('[SW] Serving stale API data from cache');
                return cachedResponse;
              }
              // Return offline response
              return new Response(
                JSON.stringify({ events: [] }),
                { 
                  headers: { 'Content-Type': 'application/json' },
                  status: 200
                }
              );
            });
        })
    );
    return;
  }
  
  // App shell - cache first
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then(response => {
            // Cache successful responses
            if (response.ok && url.origin === location.origin) {
              const responseClone = response.clone();
              caches.open(CACHE_VERSION).then(cache => {
                cache.put(request, responseClone);
              });
            }
            return response;
          })
          .catch(error => {
            console.error('[SW] Fetch failed:', error);
            // Return offline page if available
            return caches.match('/EventPulseChat/index.html');
          });
      })
  );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
  
  if (event.data === 'clearCache') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
      })
    );
  }
});

// Background sync for when connection is restored
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-scores') {
    event.waitUntil(
      // Refresh all cached API data
      caches.open(API_CACHE).then(cache => {
        return cache.keys().then(requests => {
          return Promise.all(
            requests.map(request => {
              return fetch(request)
                .then(response => {
                  if (response.ok) {
                    return cache.put(request, response);
                  }
                })
                .catch(err => console.error('[SW] Sync failed:', err));
            })
          );
        });
      })
    );
  }
});

console.log('[SW] Service worker loaded - v' + CACHE_VERSION);