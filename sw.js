const CACHE_NAME = 'tacsim-v1.0.0';
const STATIC_CACHE = 'tacsim-static-v1.0.0';
const DYNAMIC_CACHE = 'tacsim-dynamic-v1.0.0';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/plugins.html',
    '/news.html',
    '/about.html',
    '/css/main.css',
    '/css/index.css',
    '/css/plugins.css',
    '/css/news.css',
    '/css/about.css',
    '/scripts/plugins.js',
    '/scripts/news.js',
    '/scripts/performance.js',
    '/data/pictures/favicon.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    const { request } = event;
    
    if (request.method !== 'GET') return;
    if (!request.url.startsWith('http')) return;
    if (!request.url.startsWith(self.location.origin)) return;
    if (request.url.includes('/data/content/')) {
        event.respondWith(networkFirstStrategy(request));
    } else if (STATIC_ASSETS.some(asset => request.url.includes(asset))) {
        event.respondWith(cacheFirstStrategy(request));
    } else {
        event.respondWith(networkFirstStrategy(request));
    }
});

async function cacheFirstStrategy(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        
        const networkResponse = await fetch(request);
        if (networkResponse.ok && request.url.startsWith('http')) {
            const cache = await caches.open(STATIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline', { status: 503 });
    }
}

// Network first strategy for dynamic content
async function networkFirstStrategy(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok && request.url.startsWith('http')) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        return cachedResponse || new Response('Offline', { status: 503 });
    }
}