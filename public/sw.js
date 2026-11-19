// Service worker minimal de Kargora : rend l'application installable et affiche une page claire hors connexion.
// Il ne garde en cache aucune page ni aucun fichier de l'application, pour ne jamais montrer une ancienne version.
const OFFLINE = "/offline.html";
const CACHE = "kargora-offline-v1";

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(c => c.add(OFFLINE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.mode !== "navigate") return;
  event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE)));
});
