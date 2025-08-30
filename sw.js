// sw.js
const CACHE_NAME = "tourist-app-v5";

const APP_SHELL = [
  "./",
  "./index.html",
  "./main.js",
  "./manifest.webmanifest",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./images/JRBUS_frontof_hokurikubank.jpeg",
  "./images/HOKUTETSUBUS_frontof_hoteltorifito.jpeg",
  // 追加：橋場町（平日）データをオフラインキャッシュ
  "./data/bus-hashibamachi-weekday.json",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // ページ遷移は常に index.html を返す（SPA）
  if (req.mode === "navigate") {
    event.respondWith(caches.match("./index.html").then((r) => r || fetch("./index.html")));
    return;
  }

  // それ以外は Cache First → ネット（取得できたらキャッシュへ保存）
  event.respondWith(
    caches
      .match(req)
      .then((cached) => {
        if (cached) return cached;
        return fetch(req).then((fresh) => {
          const copy = fresh.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return fresh;
        });
      })
      .catch(() => caches.match("./index.html"))
  );
});
