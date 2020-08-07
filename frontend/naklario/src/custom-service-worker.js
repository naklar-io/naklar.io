importScripts("./ngsw-worker.js");
self.addEventListener("notificationclick", (event) => {
  console.log("notification clicked!");
  //event.waitUntil(clients.openWindow("https://developers.google.com/web/"));
  event.waitUntil(
    clients
      .matchAll({
        includeUncontrolled: true,
        type: "window",
      })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i];
          if (client.url == "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      })
  );
});

self.addEventListener("push", (event) => {
    console.log("[naklar.io-SW] Got push", event);
});