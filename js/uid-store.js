/* DOTA JETCH — UID-STORE v1.0
   Обёртка над Store: все ключи автоматически получают префикс uid.
   Данные разных аккаунтов никогда не смешиваются. */

(function () {
  if (!window.Store || window.Store.__namespaced) return;

  function getActiveUid() {
    return localStorage.getItem("__active_uid") || "anon";
  }

  var originalGet = window.Store.get.bind(window.Store);
  var originalSet = window.Store.set.bind(window.Store);

  window.Store.get = function (key, def) {
    return originalGet(getActiveUid() + "::" + key, def);
  };

  window.Store.set = function (key, val) {
    return originalSet(getActiveUid() + "::" + key, val);
  };

  window.Store.__namespaced = true;
  window.Store.getActiveUid = getActiveUid;
})();
