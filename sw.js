// オフライン用：アプリの画面を端末に保存し、通信がなくても開けるようにする
var CACHE = "salon-yoyaku-v5";
var FILES = ["./", "index.html", "manifest.json", "apple-touch-icon.png", "アイコン-192.png", "icon-512.png"];
self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
// まず保存済みの画面を表示し、通信できるときは裏で最新版に更新する
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.open(CACHE).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (hit) {
      var net = fetch(e.request).then(function (res) {
        if (res && res.ok) c.put(e.request, res.clone());
        return res;
      }).catch(function () { return hit || c.match("index.html"); });
      return hit || net;
    });
  }));
});
