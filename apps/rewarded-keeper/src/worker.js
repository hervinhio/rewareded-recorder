
// eslint-disable-next-line @typescript-eslint/no-unused-vars
var cache_version=1681203137; // Used to by build tools
var CACHE_NAME = 'rewarded-keeper';
var urlsToCache = [
  '/',
];

// Install a service worker
// eslint-disable-next-line no-restricted-globals
self.addEventListener('install', event => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

// Cache and return requests
// eslint-disable-next-line no-restricted-globals
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Update a service worker
// eslint-disable-next-line no-restricted-globals
self.addEventListener('activate', event => {
  var cacheWhitelist = ['rewarded-keeper'];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
          return Promise.resolve(false);
        })
      );
    })
  );
});
