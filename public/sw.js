// GulesciGPT Service Worker
const CACHE_NAME = 'gulescigpt-v1'
const OFFLINE_URL = '/offline.html'

// Cache edilecek statik dosyalar
const STATIC_CACHE = [
  '/',
  '/offline.html',
  '/manifest.json'
]

// Install event - cache'i oluştur
self.addEventListener('install', (event) => {
  console.log('[SW] Install')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets')
      return cache.addAll(STATIC_CACHE)
    })
  )
  self.skipWaiting()
})

// Activate event - eski cache'leri temizle
self.addEventListener('activate', (event) => {
  console.log('[SW] Activate')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - Network First stratejisi
self.addEventListener('fetch', (event) => {
  // Sadece GET isteklerini cache'le
  if (event.request.method !== 'GET') {
    return
  }

  // API isteklerini cache'leme
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request))
    return
  }

  // Network First stratejisi
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Başarılı response'u cache'e ekle
        if (response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Network başarısızsa cache'den dön
        return caches.match(event.request).then((response) => {
          if (response) {
            return response
          }
          // Offline sayfasını göster
          if (event.request.mode === 'navigate') {
            return caches.match(OFFLINE_URL)
          }
        })
      })
  )
})

// Background Sync - Offline mesajları gönder
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages())
  }
})

async function syncMessages() {
  // Offline mesajları senkronize et
  console.log('[SW] Syncing offline messages')
}

// Push Notifications (gelecekte kullanılabilir)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'GulesciGPT'
  const options = {
    body: data.body || 'Yeni bildirim',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: data.tag || 'default',
    requireInteraction: false
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/')
  )
})
