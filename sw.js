/* DOTA JETCH — Service Worker v3.3.6 */

const CACHE_NAME = "dotajetch-v3.3.6";

const STATIC_ASSETS = [
"./", "./index.html", "./manifest.json", "./css/style.css",
"./js/config.js", "./js/fallback.js", "./js/ui.js",
"./js/knowledge.js", "./js/achievements.js", "./js/history.js",
"./js/diary.js", "./js/assistant.js", "./js/games.js",
"./js/charts.js", "./js/daily.js", "./js/export.js",
"./js/analyze.js", "./js/app.js", "./js/visual.js",
];

self.addEventListener("install", function (e) {
self.skipWaiting();
e.waitUntil(
caches.open(CACHE_NAME).then(function (cache) {
return Promise.allSettled(
STATIC_ASSETS.map(function (url) {
return cache.add(url).catch(function () { return null; });
})
);
})
);
});

self.addEventListener("activate", function (e) {
e.waitUntil(
caches.keys().then(function (keys) {
const old = keys.filter(function (k) { return k !== CACHE_NAME; });
return Promise.all(old.map(function (k) { return caches.delete(k); }));
}).then(function () { return self.clients.claim(); })
);
});

self.addEventListener("fetch", function (e) {
const req = e.request;
if (req.method !== "GET") return;
const url = new URL(req.url);
if (url.hostname === "api.opendota.com") return;
if (/steamstatic|akamaihd|weserv|wsrv/.test(url.hostname)) return;
if (/fonts.(googleapis|gstatic).com/.test(url.hostname)) return;
e.respondWith(
caches.match(req).then(function (cached) {
const fetching = fetch(req).then(function (res) {
if (res && res.status === 200 && res.type === "basic") {
const clone = res.clone();
caches.open(CACHE_NAME).then(function (c) { c.put(req, clone); });
}
return res;
}).catch(function () { return cached; });
return cached || fetching;
})
);
});

self.addEventListener("message", function (e) {
if (e.data === "SKIP_WAITING") self.skipWaiting();
});