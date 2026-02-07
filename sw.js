// Service Worker for Tax Refund Preview App
const CACHE_NAME = 'tax-refund-v1';
const urlsToCache = [
    '.',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/tax-data.js',
    './manifest.json',
];

// 설치 이벤트
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache).catch(err => {
                    // Some files might not exist - that's ok for offline support
                    console.log('Cache installation partial:', err);
                });
            })
    );
    self.skipWaiting();
});

// 활성화 이벤트
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// 페치 이벤트
self.addEventListener('fetch', event => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // 캐시에서 찾으면 반환
                if (response) {
                    return response;
                }

                return fetch(event.request).then(response => {
                    // 네트워크 요청 성공하면 캐시에 저장
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME)
                        .then(cache => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                });
            })
            .catch(() => {
                // 오프라인 상태에서는 캐시된 index.html 반환
                return caches.match('./index.html');
            })
    );
});
