// Service Worker for Push Notifications and Offline Capability
importScripts('https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js');

const CACHE_NAME = 'nwr-chalak-mitra-v19'; // Updated version for offline support
const OFFLINE_CACHE = 'nwr-chalak-offline-v1';

// Assets to cache for offline use
const OFFLINE_ASSETS = [
  '/',
  '/index.html',
  '/css/variables.css',
  '/css/reset.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/pages.css',
  '/css/animations.css',
  '/css/responsive.css',
  '/css/chalakMitra.css',
  '/js/app.js',
  '/js/config.js',
  '/js/data/faultDatabase.js',
  '/js/data/threePhaseLocoFaults.js',
  '/js/data/questionBank.js',
  '/js/services/navigation.js',
  '/js/services/auth.js',
  '/js/services/chalakMitra.js',
  '/js/pages/chalakMitraPage.js',
  '/js/pages/dashboard.js',
  '/js/pages/searchPage.js',
  '/js/pages/threePhaseLocoPage.js',
  '/assets/images/chalak-mitra-logo.png',
  '/assets/images/appstore.png',
  '/manifest.json'
];

// Install event - cache static assets for offline use
self.addEventListener('install', function (event) {
  console.log('Service Worker: Installing with offline support...');

  event.waitUntil(
    caches.open(OFFLINE_CACHE).then(function (cache) {
      console.log('Service Worker: Caching offline assets');
      // Cache assets one by one to handle errors gracefully
      return Promise.allSettled(
        OFFLINE_ASSETS.map(url =>
          cache.add(url).catch(err => console.log('Failed to cache:', url, err))
        )
      );
    })
  );

  // Skip waiting to activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', function (event) {
  console.log('Service Worker: Activating with offline support...');

  // Clean up old caches
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (cacheName) {
          if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', function (event) {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip API requests - let them fail naturally if offline
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then(function (response) {
        // Clone the response for caching
        const responseToCache = response.clone();

        // Cache successful responses
        if (response.status === 200) {
          caches.open(OFFLINE_CACHE).then(function (cache) {
            cache.put(event.request, responseToCache);
          });
        }

        return response;
      })
      .catch(function () {
        // Network failed, try to serve from cache
        return caches.match(event.request).then(function (cachedResponse) {
          if (cachedResponse) {
            console.log('Serving from cache:', event.request.url);
            return cachedResponse;
          }

          // If HTML page, return cached index.html
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/index.html');
          }

          // Return offline placeholder for other resources
          return new Response('Offline - Resource not cached', {
            status: 503,
            statusText: 'Service Unavailable'
          });
        });
      })
  );
});

// Push event - handle incoming push notifications
self.addEventListener('push', function (event) {
  console.log('Service Worker: Push Received...');

  if (!event.data) return;

  try {
    const notificationData = event.data.json();

    // If it's a OneSignal notification, it might have 'custom' or be handled by their library
    // OneSignal usually handles its own pushes, but if we catch it here, we should be careful.
    if (notificationData.custom || notificationData.onesignal) {
      console.log('OneSignal Push detected in sw.js - letting OneSignal SDK handle it');
      return;
    }

    console.log('Manual Push Data:', notificationData);

    let title = notificationData.title || 'NWR Chalak Mitra';
    let body = notificationData.body || notificationData.message || 'New update available';
    let icon = notificationData.icon || '/assets/images/appstore.png';
    let badge = notificationData.badge || '/assets/images/appstore.png';
    let data = notificationData.data || {};

    const options = {
      body: body,
      icon: icon,
      badge: badge,
      data: data
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.log('Push data is not JSON or other error:', e);
  }
});

// Notification click event - handle when user clicks notification
self.addEventListener('notificationclick', function (event) {
  console.log('Service Worker: Notification Clicked...', event.notification);

  // Close the notification
  event.notification.close();

  // Define the URL to open when notification is clicked
  const notificationData = event.notification.data;

  // Determine the URL to open based on notification data
  let urlToOpen = '/';

  if (notificationData && notificationData.fileData) {
    // If there's file data, navigate to the appropriate section
    const fileData = notificationData.fileData;
    if (fileData.division) {
      urlToOpen = `/divisions#${fileData.division}`;
      if (fileData.lobby) {
        urlToOpen += `#${fileData.lobby}`;
      }
    } else {
      urlToOpen = notificationData.url || notificationData.click_action || '/divisions';
    }
  } else {
    urlToOpen = notificationData?.url || notificationData?.click_action || '/';
  }

  // Open the URL in a new window/tab
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
      for (var i = 0; i < clientList.length; i++) {
        var client = clientList[i];
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }

      // If no matching client found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Handle push subscription change
self.addEventListener('pushsubscriptionchange', function (event) {
  console.log('Push Subscription Changed');

  // This event is fired when the push subscription expires
  // and needs to be renewed
  event.waitUntil(
    self.registration.pushManager.getSubscription().then(function (subscription) {
      if (!subscription) {
        console.log('No subscription found, need to resubscribe');
        return;
      }

      // Send the new subscription to your server
      return fetch('/api/subscription-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: subscription.keys,
          // Include user info if available
          userId: null // Would need to store user ID in service worker for this
        }),
      });
    })
  );
});