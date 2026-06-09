const CACHE_NAME = 'barberapp-v1'

// Archivos que se cachean para funcionar offline (solo el shell básico)
const STATIC_ASSETS = [
  '/admin',
  '/login',
]

// ── Instalación ──────────────────────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// ── Activación — limpiar caches viejos ───────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ── Fetch — network first, cache fallback ────────────────────────────────────
self.addEventListener('fetch', event => {
  // Solo cachear GET, no API calls ni Supabase
  if (event.request.method !== 'GET') return
  const url = new URL(event.request.url)
  if (url.hostname.includes('supabase') || url.pathname.startsWith('/api')) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Actualizar cache con respuesta fresca
        const clone = response.clone()
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone))
        return response
      })
      .catch(() => caches.match(event.request))
  )
})

// ── Push notifications (Paso 2) ──────────────────────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return
  const data = event.data.json()

  event.waitUntil(
    self.registration.showNotification(data.title ?? 'BarberApp', {
      body:    data.body   ?? '',
      icon:    data.icon   ?? '/icons/icon-192.png',
      badge:   '/icons/icon-192.png',
      tag:     data.tag    ?? 'barberapp',
      data:    data.url ? { url: data.url } : undefined,
      actions: data.actions ?? [],
      vibrate: [200, 100, 200],
    })
  )
})

// Abrir el panel al hacer click en la notificación
self.addEventListener('notificationclick', event => {
  event.notification.close()
  const url = event.notification.data?.url ?? '/admin/agenda'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of windowClients) {
        if (client.url.includes('/admin') && 'focus' in client) {
          client.focus()
          client.navigate(url)
          return
        }
      }
      // Si no hay ventana abierta, abrir una nueva
      if (clients.openWindow) return clients.openWindow(url)
    })
  )
})