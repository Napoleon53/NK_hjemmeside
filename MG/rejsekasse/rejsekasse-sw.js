/* Service worker for Rejsekasse (MG/rejsekasse/).
   Virkefeltet er mappen, og den rører kun sine egne filer: alt andet sendes
   uberørt videre til netvaerket. */
"use strict";

var CACHE = 'rejsekasse-v1';

var FILER = [
  './',
  'index.html',
  'rejsekasse.webmanifest',
  '../../assets/img/rejsekasse-192.png',
  '../../assets/img/rejsekasse-512.png',
  '../../assets/img/rejsekasse-512-maskable.png'
].map(function(f){ return new URL(f, self.registration.scope).href; });

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){ return c.addAll(FILER); })
      .then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(navne){
      return Promise.all(navne.map(function(n){
        if(n !== CACHE && n.indexOf('rejsekasse-') === 0) return caches.delete(n);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  if(e.request.method !== 'GET') return;
  var url = e.request.url.split('#')[0].split('?')[0];
  if(FILER.indexOf(url) === -1) return;

  // Netvaerket foerst, saa appen opdateres af sig selv. Cachen er reserven offline.
  e.respondWith(
    fetch(e.request).then(function(svar){
      if(svar && svar.ok){
        var kopi = svar.clone();
        caches.open(CACHE).then(function(c){ c.put(e.request, kopi); });
      }
      return svar;
    }).catch(function(){
      return caches.match(e.request).then(function(fundet){
        return fundet || caches.match(FILER[1]);
      });
    })
  );
});
