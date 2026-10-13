const CACHE = 'luna-v8';
const ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './lib/html.js',
  './lib/dates.js',
  './lib/db.js',
  './lib/cycle.js',
  './lib/constants.js',
  './components/Card.js',
  './components/DayCell.js',
  './components/Header.js',
  './components/BottomNav.js',
  './views/CalendarView.js',
  './views/StatsView.js',
  './views/SettingsView.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => {
      if (hit) return hit;

      return fetch(e.request).then(res => {
        const url = new URL(e.request.url);
        
        if (res.ok && (url.hostname === 'esm.sh' || url.hostname === 'cdn.tailwindcss.com' || url.hostname === 'cdnjs.cloudflare.com')) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }

        return res;
      }).catch(() => {
        if (e.request.mode === 'navigate') {
          return caches.match('./index.html');
        }

        return Response.error();
      });
    })
  );
});
