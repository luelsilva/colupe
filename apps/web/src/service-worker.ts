/// <reference types="@sveltejs/kit" />
import { build, files, version } from "$service-worker";

const CACHE_NAME = `colupe-cache-${version}`;
const ASSETS = [...build, ...files];

self.addEventListener("install", (event) => {
  const customEvent = event as ExtendableEvent;
  customEvent.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => (self as unknown as ServiceWorkerGlobalScope).skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  const customEvent = event as ExtendableEvent;
  customEvent.waitUntil(
    caches.keys().then(async (keys) => {
      for (const key of keys) {
        if (key !== CACHE_NAME) {
          await caches.delete(key);
        }
      }
      await (self as unknown as ServiceWorkerGlobalScope).clients.claim();
    })
  );
});

self.addEventListener("fetch", (event) => {
  const customEvent = event as FetchEvent;
  if (customEvent.request.method !== "GET") return;

  const url = new URL(customEvent.request.url);

  // Não intercepta chamadas de API externas ou websockets
  if (url.protocol.startsWith("http") && !url.pathname.startsWith("/api")) {
    customEvent.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        // Tenta rede primeiro para páginas dinâmicas, cache para assets
        if (ASSETS.includes(url.pathname)) {
          const cachedResponse = await cache.match(customEvent.request);
          if (cachedResponse) return cachedResponse;
        }

        try {
          const response = await fetch(customEvent.request);
          if (response.status === 200) {
            cache.put(customEvent.request, response.clone());
          }
          return response;
        } catch {
          const cachedResponse = await cache.match(customEvent.request);
          if (cachedResponse) return cachedResponse;
          return new Response("Offline", { status: 503, statusText: "Offline" });
        }
      })
    );
  }
});
