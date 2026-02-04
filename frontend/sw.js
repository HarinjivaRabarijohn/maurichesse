const CACHE_NAME = 'mauheritage-v4';
const ASSETS_CRITICAL = [
  './',
  './index.html',
  './home.html',
  './scan.html',
  './style.css',
  './config.js',
  './auth.js'
];

const ASSETS_OPTIONAL = [
  './auth.html',
  './visited.html',
  './profile.html',
  './login.css',
  './hamburger-menu.css',
  './app.js',
  './qr.js',
  './push.js',
  './hamburger-menu.js',
  './manifest.json'
];

self.addEventListener('install', function (e) {
  console.log('[SW] Installing...');
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(ASSETS_CRITICAL).then(() => {
        return Promise.allSettled(
          ASSETS_OPTIONAL.map(asset => cache.add(asset))
        );
      });
    }).catch(err => {
      console.error('[SW] Install failed:', err);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  console.log('[SW] Activating...');
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys
          .filter(k => k.startsWith('mauheritage-') && k !== CACHE_NAME)
          .map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  // Don't cache API requests
  if (e.request.url.includes('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Network-first for HTML/JS
  if (e.request.url.endsWith('.html') || e.request.url.endsWith('.js')) {
    e.respondWith(
      fetch(e.request)
        .then(res => {
          if (res && res.status === 200) {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
          }
          return res;
        })
        .catch(() => caches.match(e.request) || caches.match('./home.html'))
    );
    return;
  }

  // Cache-first for assets
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request))
      .catch(() => caches.match('./home.html'))
  );
});

self.addEventListener('push', function (event) {
  if (!(self.Notification && self.Notification.permission === 'granted')) return;
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {}
  const options = {
    body: data.message || data.body || 'New update from MauRichesse',
    tag: data.tag || 'maurichesse',
    icon: './icons/icon-192.png',
    badge: './icons/icon-96.png',
    data: { url: data.click_action || data.url || './' },
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'Open', icon: './icons/icon-96.png' },
      { action: 'close', title: 'Close', icon: './icons/icon-96.png' }
    ]
  };
  event.waitUntil(self.registration.showNotification(data.title || 'MauRichesse', options));
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.action === 'close') return;
  const url = event.notification.data && event.notification.data.url;
  if (url && self.clients && self.clients.openWindow) {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then(clients => {
        for (let i = 0; i < clients.length; i++) {
          if (clients[i].url === url && 'focus' in clients[i]) {
            return clients[i].focus();
          }
        }
        return self.clients.openWindow(url);
      })
    );
  }
});

self.addEventListener('notificationclose', function () {
  console.log('[SW] Notification closed');
});
