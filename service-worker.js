
const CACHE = 'fastdoctor-v1';
const ASSETS = [
  '/', '/index.html', '/styles.css', '/app.js', '/triage.js', '/profile.html', '/profile.js',
  '/map.html','/map.js','/env.js','/manifest.json',
  '/icons/icon-192.png','/icons/icon-512.png','/data/kcd_specialty.json'
];

self.addEventListener('install', (e)=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)));
});
self.addEventListener('activate', (e)=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
});
self.addEventListener('fetch', (e)=>{
  const url = new URL(e.request.url);
  if(ASSETS.includes(url.pathname)){
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));
  }
});
