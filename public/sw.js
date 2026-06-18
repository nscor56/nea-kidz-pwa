const CACHE_NAME = 'neakidz-pwa2-v4-web-push'
const SHELL_URLS = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png', '/favicon.ico']
const CACHEABLE_ORIGINS = ['https://api.neakidz.com']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const isShellRequest = url.origin === self.location.origin && request.mode === 'navigate'
  const isStaticAsset = url.origin === self.location.origin
  const isApiMedia = CACHEABLE_ORIGINS.includes(url.origin) && (url.pathname.startsWith('/covers/') || url.pathname.startsWith('/audio/'))

  if (isShellRequest) {
    event.respondWith(fetch(request).catch(() => caches.match('/')))
    return
  }

  if (isStaticAsset || isApiMedia) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
          }
          return response
        })
      }),
    )
  }
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (_) {
    data = { body: event.data?.text() }
  }
  const title = data.title || 'NEA KIDZ'
  const options = {
    body: data.body || 'Une nouveauté vous attend.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: {
      url: data.url || data.payload?.route || '/',
      payload: data.payload || {},
    },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = new URL(event.notification.data?.url || '/', self.location.origin).href
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => client.url.startsWith(self.location.origin))
      if (existing) {
        existing.focus()
        existing.navigate(targetUrl)
        return
      }
      return self.clients.openWindow(targetUrl)
    }),
  )
})
