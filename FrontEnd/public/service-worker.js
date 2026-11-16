const CACHE_NAME = "promise-portfolio-shell-v1";
const APP_SHELL = "/";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.add(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith("promise-portfolio-shell-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.put(APP_SHELL, copy)));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || caches.match(APP_SHELL)),
    );
    return;
  }

  if (url.pathname.startsWith("/assets/") || url.pathname === "/favicon.svg") {
    event.respondWith((async () => {
      const cached = await caches.match(request);
      const refresh = fetch(request).then(async (response) => {
        if (response.ok) {
          const copy = response.clone();
          await caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });

      if (cached) {
        event.waitUntil(refresh.catch(() => cached));
        return cached;
      }
      return refresh;
    })());
  }
});
