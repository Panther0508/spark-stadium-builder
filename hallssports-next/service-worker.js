// Custom Service Worker for HallsSports
// Includes push notification handling

self.addEventListener("push", (event: ExtendableEvent) => {
  const payload = event.data?.json() ?? {};

  const { title, body, icon, data } = payload;

  const options: NotificationOptions = {
    body: body ?? "",
    icon: icon ?? "/favicon.png",
    badge: "/favicon.png",
    data: data ?? {},
    // You can add actions, vibrate, etc.
  };

  event.waitUntil(self.registration.showNotification(title ?? "HallsSports", options));
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const target = event.notification.data?.url ?? "/";

  event.waitUntil(
    (async (): Promise<void> => {
      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Try to focus an existing tab with the target URL
      for (const client of clients) {
        if (client.url === target && "focus" in client) {
          client.focus();
          return;
        }
      }

      // Open a new tab if no matching client
      if (self.clients.openWindow) {
        await self.clients.openWindow(target);
      }
    })()
  );
});
