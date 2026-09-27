/* DOTA JETCH — Service Worker (offline-first, кэш статики) */

const CACHE_NAME = "dotajetch-v3.3.0";
const STATIC_ASSETS = [
"./",
"./index.html",
"./manifest.json",
"./css/style.css",
"./js/config.js",
"./js/ui.js",
"./js/heroes.js",
"./js/knowledge.js",
"./js/achievements.js",
"./js/history.js",
"./js/diary.js",
"./js/assistant.js",
"./js/games.js",
"./js/analyze.js",
"./js/charts.js",
"./js/daily.js",
"./js/export.js",
"./js/app.js",
"./js/visual.js",
];

self.addEventListener("install", (e) => {
self.skipWaiting();
e.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
return Promise.allSettled(
STATIC_ASSETS.map((url) => cache.add(url).catch(() => null))
);
})
);
});

self.addEventListener("activate", (e) => {
e.waitUntil(
caches.keys().then((keys) =>
Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
).then(() => self.clients.claim())
);
});

self.addEventListener("fetch", (e) => {
const req = e.request;
if (req.method !== "GET") return;

const url = new URL(req.url);

// API OpenDota — только сеть (никогда не кэшируем актуальные данные)
if (url.hostname === "api.opendota.com") return;

// Картинки Steam CDN — сеть (не кэшируем, потому что они могут блокироваться)
if (/steamstatic|akamaihd|weserv|wsrv/.test(url.hostname)) return;

// Остальное — stale-while-revalidate
e.respondWith(
caches.match(req).then((cached) => {
const fetchPromise = fetch(req).then((res) => {
if (res && res.status === 200 && res.type === "basic") {
const clone = res.clone();
caches.open(CACHE_NAME).then((c) => c.put(req, clone));
}
return res;
}).catch(() => cached);

return cached || fetchPromise;
})
);
});