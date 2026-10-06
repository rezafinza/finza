// FINZA service worker — versi 68f2feb0d5
const V = 'finza-68f2feb0d5';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png', 'favicon-32.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function timeout(p, ms) { return new Promise((ok, no) => { const t = setTimeout(() => no(new Error('timeout')), ms); p.then(r => { clearTimeout(t); ok(r); }, e => { clearTimeout(t); no(e); }); }); }
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET') return;                                   // data keuangan (POST ke Apps Script) tidak pernah di-cache
  if (url.origin === location.origin) {
    if (req.mode === 'navigate') {                                    // halaman: coba jaringan dulu (maks 4 dtk), kalau gagal pakai cache
      e.respondWith(timeout(fetch(req), 4000).then(r => { const c = r.clone(); caches.open(V).then(x => x.put('index.html', c)); return r; })
        .catch(() => caches.match('index.html')));
      return;
    }
    e.respondWith(caches.match(req).then(hit => hit || fetch(req)));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com$/.test(url.hostname)) {       // font: cache dulu
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => { const c = r.clone(); caches.open(V).then(x => x.put(req, c)); return r; })));
  }
});
