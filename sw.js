/* STREETDARE service worker. It exists for one job: push notifications from the Group Feed.
   On purpose there is no fetch handler and no cache: the site is static and changes often,
   and a stale cache would show people yesterday's page. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('push', event => {
  let d = {};
  try { d = event.data ? event.data.json() : {}; } catch (e) { d = { body: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.registration.showNotification(d.title || 'STREETDARE', {
    body: d.body || '',
    icon: '/img/icon-192.png',
    badge: '/img/icon-192.png',
    tag: d.tag || 'streetdare',      /* one line per group */
    renotify: true,
    data: { url: d.url || '/pass/' }
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || '/pass/';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) {
      if (c.url.indexOf('/pass') !== -1 && 'focus' in c) return c.navigate ? c.navigate(url).then(x => x && x.focus()) : c.focus();
    }
    return self.clients.openWindow(url);
  }));
});
