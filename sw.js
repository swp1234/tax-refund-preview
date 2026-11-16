// Service Worker for Tax Refund Preview App
const CACHE_PREFIX = 'tax-refund-';
const CACHE_NAME = `${CACHE_PREFIX}v3`;
const APP_SCOPE = '/tax-refund-preview/';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/i18n.js',
    './js/tax-data.js',
    './manifest.json',
    './icon-192.svg',
    './icon-512.svg',
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => Promise.all(
            cacheNames
                .filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME)
                .map(name => caches.delete(name))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin || !url.pathname.startsWith(APP_SCOPE)) return;

    event.respondWith(
        fetch(event.request).then(response => {
            if (response && response.ok && response.type === 'basic') {
                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
            }
            return response;
        }).catch(() => caches.match(event.request).then(r => r || caches.match('./index.html')))
    );
});
