/* DOTA JETCH — UID-STORE v2.0
   Переопределяет localStorage: все ключи автоматически получают префикс uid.
   Данные разных аккаунтов никогда не смешиваются. */

(function () {
  "use strict";

  /* Сохраняем оригинальные методы */
  var _getItem = Storage.prototype.getItem;
  var _setItem = Storage.prototype.setItem;
  var _removeItem = Storage.prototype.removeItem;

  var SYSTEM_KEYS = ["__active_uid", "__loaded_for_", "dotaJetchLoadedUid"];

  function isSystemKey(key) {
    for (var i = 0; i < SYSTEM_KEYS.length; i++) {
      if (key.indexOf(SYSTEM_KEYS[i]) === 0) return true;
    }
    return false;
  }

  function getPrefix() {
    var uid = _getItem.call(localStorage, "__active_uid");
    return uid ? uid + "::" : "";
  }

  Storage.prototype.getItem = function (key) {
    if (isSystemKey(key)) return _getItem.call(this, key);
    var prefixed = getPrefix() + key;
    var val = _getItem.call(this, prefixed);
    if (val !== null) return val;
    /* Совместимость: если данных с префиксом нет — не возвращаем старые */
    return null;
  };

  Storage.prototype.setItem = function (key, value) {
    if (isSystemKey(key)) return _setItem.call(this, key, value);
    return _setItem.call(this, getPrefix() + key, value);
  };

  Storage.prototype.removeItem = function (key) {
    if (isSystemKey(key)) return _removeItem.call(this, key);
    return _removeItem.call(this, getPrefix() + key);
  };

  console.log("uid-store v2.0 ready");
})();
