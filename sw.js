var CACHE_NAME = 'todo-v1';
var urlsToCache = [
    './',
    './index.html',
    './css/style.css',
    './js/idb.js',
    './js/network.js',
    './js/api/todo.js'
];

self.addEventListener('install', function(event) {
    
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(function(cache) {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('activate', function(event) {

    var cacheWhitelist = ['todo-v1'];

    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                    return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
        .then(function(response) {
          // Cache hit - return response
            if (response) {
                return response;
            }

            return fetch(event.request).then(
                function(response) {

                if(!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }
    
                var responseToCache = response.clone();
    
                caches.open(CACHE_NAME)
                .then(function(cache) {
                    cache.put(event.request, responseToCache);
                });
    
                return response;
            });
        })
    );
});

self.addEventListener('message', function (event) {
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});