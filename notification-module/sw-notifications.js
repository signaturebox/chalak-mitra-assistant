/**
 * Service Worker for Push Notifications
 * 
 * This file handles:
 * - Receiving push notifications from server
 * - Displaying notifications to user
 * - Handling notification clicks
 * - Background sync
 * 
 * Place this file in your web root (e.g., /sw-notifications.js)
 */

const CACHE_NAME = 'notification-cache-v1';

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installing...');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - receive push notification from server
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      notification: {
        title: 'New Notification',
        body: event.data ? event.data.text() : 'You have a new notification'
      }
    };
  }
  
  const notification = data.notification || {};
  
  const options = {
    body: notification.body || 'New file uploaded',
    icon: notification.icon || '/assets/images/chalak-mitra-logo.png',
    badge: notification.badge || '/assets/images/chalak-mitra-logo.png',
    tag: notification.tag || 'default',
    data: notification.data || {},
    actions: notification.actions || [
      { action: 'open', title: 'View' },
      { action: 'close', title: 'Dismiss' }
    ],
    requireInteraction: false,
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(notification.title || 'New Notification', options)
  );
});

// Notification click event - handle user clicking notification
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);
  
  event.notification.close();
  
  const notificationData = event.notification.data || {};
  const action = event.action;
  
  if (action === 'close') {
    return;
  }
  
  // Default action or 'open' action
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Build target URL
        let targetUrl = notificationData.url || '/';
        
        // If file_id is present, add it to URL
        if (notificationData.file_id) {
          targetUrl += (targetUrl.includes('?') ? '&' : '?') + 'file_id=' + notificationData.file_id;
        }
        
        // If section is present, add it
        if (notificationData.section) {
          targetUrl += (targetUrl.includes('?') ? '&' : '?') + 'tab=' + encodeURIComponent(notificationData.section);
        }
        
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url && client.focus) {
            // Focus existing window and navigate
            return client.focus().then(() => {
              return client.navigate(targetUrl);
            });
          }
        }
        
        // No window open, open new one
        return self.clients.openWindow(targetUrl);
      })
  );
});

// Message event - communicate with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  if (event.tag === 'notification-sync') {
    event.waitUntil(syncNotifications());
  }
});

// Sync notifications function
async function syncNotifications() {
  try {
    // You can add background sync logic here
    console.log('[SW] Syncing notifications...');
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Fetch event - cache strategies
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Network first strategy for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return new Response(JSON.stringify({ error: 'Network error' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }
  
  // Cache first for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      
      return fetch(event.request).then((fetchResponse) => {
        // Don't cache non-success responses
        if (!fetchResponse || fetchResponse.status !== 200) {
          return fetchResponse;
        }
        
        // Cache the response
        const responseToCache = fetchResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return fetchResponse;
      });
    })
  );
});
