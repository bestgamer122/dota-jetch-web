/* DOTA JETCH — UID-STORE v3.0
   DEPRECATED.
   Раньше здесь был префикс uid поверх localStorage, но это ломало
   доступ к данным, потому что __active_uid никогда не устанавливался.
   Теперь очисткой localData при смене аккаунта занимается auth.js.
   Файл оставлен для совместимости со <script> в index.html. */

(function () {
  "use strict";
  console.log("uid-store v3.0 (deprecated — no localStorage override)");
})();
