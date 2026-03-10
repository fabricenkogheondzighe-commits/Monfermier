const CACHE = 'monfermier-v202603100907';
const FILES = ['./'];

// Installation - skip waiting pour activation immédiate
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
  self.skipWaiting(); // Active immédiatement sans attendre
});

// Activation - supprime les anciens caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // Prend le contrôle immédiatement
});

// Fetch - Network First: toujours essayer le réseau d'abord
self.addEventListener('fetch', e => {
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Mettre en cache la nouvelle version
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      })
      .catch(() => {
        // Si pas de réseau, utiliser le cache
        return caches.match(e.request);
      })
  );
});

// Message pour forcer la mise à jour
self.addEventListener('message', e => {
  if(e.data === 'skipWaiting') self.skipWaiting();
});
