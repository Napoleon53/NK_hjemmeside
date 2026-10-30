/* Normvurderingen er flyttet til MG Intern. Denne service worker rydder op efter den gamle app:
   den sletter sin cache og afmelder sig, så den gamle adresse viser flyttesiden. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(navne){
    return Promise.all(navne.filter(function(n){ return n.indexOf('normvurdering-') === 0; })
      .map(function(n){ return caches.delete(n); }));
  }).then(function(){ return self.registration.unregister(); }));
});
