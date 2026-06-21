/* Compagnon — service worker
   Rôle : garder l'app accessible même hors-ligne, et signaler à l'iPhone
   qu'elle est "installée" pour que tes données ne soient pas effacées.
   Important : ce fichier ne touche JAMAIS à tes données (elles vivent
   séparément, dans le stockage de ton appareil). Il ne met en cache que
   l'app elle-même. */

const CACHE = 'compagnon-v5';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// Installation : on met l'app en cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// Activation : on nettoie les anciennes versions du cache
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Lecture : on sert depuis le réseau si possible, sinon depuis le cache
// (ainsi l'app se met à jour quand tu es en ligne, et marche hors-ligne sinon)
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
