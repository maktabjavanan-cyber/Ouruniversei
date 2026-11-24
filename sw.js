// سرویس‌ورکر: اول شبکه (تا آپدیت‌ها سریع بیان)، اگه آفلاین بود از کش.
const C = 'ou-v1';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET' || e.request.headers.has('range')) return;
  e.respondWith(fetch(e.request).then(r => { if (r.ok || r.type === 'opaque') { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)).catch(() => {}); } return r; })
    .catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
