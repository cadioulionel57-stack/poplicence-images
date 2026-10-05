/*
 * Garde la page du PTC en mémoire pour qu'elle s'ouvre
 * sans Wi-Fi dans la réserve. Quand le Wi-Fi est là, la
 * version la plus récente est rechargée en arrière-plan.
 */

var CACHE = "ptc-poplicence-v1";
var FICHIERS = ["./", "./index.html"];

self.addEventListener("install", function (evenement) {
  evenement.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(FICHIERS);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (evenement) {
  evenement.waitUntil(
    caches.keys().then(function (noms) {
      return Promise.all(
        noms.filter(function (nom) { return nom !== CACHE; })
            .map(function (nom) { return caches.delete(nom); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function (evenement) {
  if (evenement.request.method !== "GET") return;

  evenement.respondWith(
    caches.match(evenement.request).then(function (enCache) {
      var reseau = fetch(evenement.request).then(function (reponse) {
        if (reponse && reponse.ok) {
          var copie = reponse.clone();
          caches.open(CACHE).then(function (cache) {
            cache.put(evenement.request, copie);
          });
        }
        return reponse;
      }).catch(function () {
        return enCache;
      });

      return enCache || reseau;
    })
  );
});