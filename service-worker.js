
const CACHE = 'fastdoctor-v3';

self.addEventListener('install', (e)=>{
  e.waitUntil((async ()=>{
    try{
      const scopeUrl = new URL(self.registration.scope);
      const BASE = scopeUrl.pathname.replace(/\/$/, '');
      const assets = [
        'index.html','styles.css','app.js','triage.js','profile.html','profile.js',
        'map.html','map.js','env.js','manifest.json',
        'icons/icon-192.png','icons/icon-512.png',
        'data/kcd_specialty.json','data/ktas_rules.json',
        'qr.html','qr.js'
      ].map(p => `${BASE}/${p}`);
      const c = await caches.open(CACHE);
      await c.addAll(assets);
    }catch(e){ /* ignore */ }
  })());
});

self.addEventListener('activate', (e)=>{
  e.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
  })());
});

self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if(url.origin === location.origin && e.request.method === 'GET'){
    e.respondWith((async()=>{
      const c = await caches.open(CACHE);
      const cached = await c.match(e.request);
      if(cached) return cached;
      try{
        const net = await fetch(e.request);
        if(net.ok){
          c.put(e.request, net.clone());
        }
        return net;
      }catch(err){
        return cached || new Response('offline', {status:503, statusText:'offline'});
      }
    })());
  }
});
