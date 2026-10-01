/* DOTA JETCH — UID-STORE v4.0
   Пустой файл. Раньше здесь переопределялся localStorage с префиксом uid,
   но это ломало изоляцию аккаунтов, так как __active_uid никогда не устанавливался.
   Теперь очисткой данных при смене пользователя занимается auth.js.
   Файл оставлен, чтобы не менять index.html. */

console.log("uid-store v4.0 (disabled — handled by auth.js)");
