const CACHE = "oschad-dollar-v2";
const CORE = ["./","./index.html","./style.css","./script.js","./manifest.webmanifest","./icon.svg"];
self.addEventListener("install", event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE))));
self.addEventListener("activate", event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key))))));
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.origin === self.location.origin && url.pathname.endsWith("history.json")) {
    event.respondWith(fetch(event.request, {cache:"no-store"}).catch(() => caches.match(event.request)));
    return;
  }
  if (event.request.method === "GET" && url.origin === self.location.origin) {
    event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request)));
  }
});
