 

// Custom Service Worker for HallsSports
// Includes push notification handling and Workbox precaching

// Important for next-pwa: Injects the precache manifest
// @ts-expect-error workbox types not available
if (typeof importScripts === 'function') {
    
  // @ts-expect-error workbox CDN script
  importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.4.1/workbox-sw.js');
}

// @ts-expect-error workbox may not be defined
if (self.workbox) {
  // @ts-expect-error workbox precaching manifest
  self.workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);
}

self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};

  const { title, body, icon, data } = payload;

  const options = {
    body: body || "",
    icon: icon || "/favicon.png",
    badge: "/favicon.png",
    data: data || {},
  };

  event.waitUntil(self.registration.showNotification(title || "HallsSports", options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const target = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    (async () => {
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      for (const client of clients) {
        if (client.url === target && "focus" in client) {
          client.focus();
          return;
        }
      }

      if (self.clients.openWindow) {
        await self.clients.openWindow(target);
      }
    })()
  );
});
