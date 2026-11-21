/* DOTA JETCH — CLOUD SYNC v2.0
   UID-isolated storage, durable pending writes, sequential Firebase updates. */
(function () {
  "use strict";

  var USER_KEYS = [
    "nickname", "nicknameChangedAt", "avatar", "chathistory",
    "license.active", "license.forever", "license.expires", "aiquestions",
    "sessions", "dailystreak", "recentmatches", "analyzequota", "litemode",
    "achievementsunlocked", "analyzedcount", "dailydate", "gamesplayed",
    "quizbest", "theme", "uniqueheroes", "dailystreakclaimed", "themechanged",
    "visitedabout", "dailyprogress.analyze", "dailyprogress.chat",
    "dailyprogress.diary", "dailyprogress.game", "dailyprogress.chart",
    "dailyprogress.theme", "dailylastclaimdate", "diarynotes", "steam_account_id",
    "lockpickbest", "automatonbest", "minigames_mmr", "minigames_games",
    "minigames_calibrated", "minigames_calibration_games", "minigames_wins",
    "sound.volume", "direjumperbest", "direjumpergames", "chatselectedmatch"
  ];
  var PROTECTED_KEYS = ["license.active", "license.forever", "license.expires", "blocked"];
  var SERVER_ONLY_KEYS = PROTECTED_KEYS.concat(["nickname", "nicknameChangedAt"]);
  var KEY_LOOKUP = Object.create(null);
  USER_KEYS.forEach(function (key) { KEY_LOOKUP[key] = true; });

  function encodeKey(key) {
    return String(key).replace(/\./g, "__DOT__").replace(/\//g, "__SLASH__")
      .replace(/#/g, "__HASH__").replace(/\$/g, "__DOLLAR__")
      .replace(/\[/g, "__LB__").replace(/\]/g, "__RB__");
  }
  function decodeKey(key) {
    return String(key).replace(/__DOT__/g, ".").replace(/__SLASH__/g, "/")
      .replace(/__HASH__/g, "#").replace(/__DOLLAR__/g, "$")
      .replace(/__LB__/g, "[").replace(/__RB__/g, "]");
  }
  function safeParse(raw, fallback) {
    try { return JSON.parse(raw); } catch (e) { return fallback; }
  }
  function clone(value) {
    if (value === undefined) return undefined;
    try { return JSON.parse(JSON.stringify(value)); } catch (e) { return value; }
  }
  function storageGet(storage, key) {
    try { return storage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(storage, key, value) {
    try { storage.setItem(key, value); return true; } catch (e) { return false; }
  }
  function storageRemove(storage, key) {
    try { storage.removeItem(key); } catch (e) {}
  }
  function dispatch(name, detail) {
    try { window.dispatchEvent(new CustomEvent(name, { detail: detail })); } catch (e) {}
  }
  function notifyChange(key, value, source) {
    dispatch("jetch:storechange", { key: key, value: clone(value), source: source || "local" });
  }
  function getQueryUid() {
    try { return new URLSearchParams(location.search).get("syncTestUid") || ""; } catch (e) { return ""; }
  }

  var Sync = {
    uid: null,
    prefix: "dota.",
    active: false,
    pending: Object.create(null),
    cache: Object.create(null),
    queue: Promise.resolve(),
    flushTimer: null,
    pollTimer: null,
    status: "offline",
    statusDetail: "",
    lastError: null,
    lastSavedAt: 0,
    remoteBusy: false,

    keys: USER_KEYS.slice(),
    encodeKey: encodeKey,
    decodeKey: decodeKey,

    userPrefix: function (uid) { return this.prefix + "u." + uid + "."; },
    pendingKey: function (uid) { return this.prefix + "pending." + uid; },
    legacyLoadedKey: function () { return "dotaJetchLoadedUid_session"; },

    _persistPending: function () {
      if (!this.uid) return;
      var keys = Object.keys(this.pending);
      if (!keys.length) { storageRemove(localStorage, this.pendingKey(this.uid)); return; }
      var payload = {};
      keys.forEach(function (key) { payload[encodeKey(key)] = clone(Sync.pending[key]); });
      storageSet(localStorage, this.pendingKey(this.uid), JSON.stringify(payload));
    },

    _loadPending: function (uid) {
      var payload = safeParse(storageGet(localStorage, this.pendingKey(uid)), {});
      this.pending = Object.create(null);
      if (!payload || typeof payload !== "object" || Array.isArray(payload)) return;
      Object.keys(payload).forEach(function (encoded) {
        var key = decodeKey(encoded);
        if (KEY_LOOKUP[key]) Sync.pending[key] = clone(payload[encoded]);
      });
    },

    _readCache: function (key) {
      if (!this.uid) return { found: false };
      var full = this.userPrefix(this.uid) + key;
      var raw = storageGet(sessionStorage, full);
      if (raw === null) raw = storageGet(localStorage, full);
      if (raw === null) return { found: false };
      return { found: true, value: safeParse(raw, null) };
    },

    _writeCache: function (key, value) {
      if (!this.uid) return;
      var full = this.userPrefix(this.uid) + key;
      if (value === undefined || value === null) {
        storageRemove(sessionStorage, full);
        storageRemove(localStorage, full);
      } else {
        var serialized = JSON.stringify(value);
        if (!storageSet(sessionStorage, full, serialized)) storageSet(localStorage, full, serialized);
        else storageSet(localStorage, full, serialized);
      }
      this.cache[key] = clone(value);
    },

    _clearMemory: function () {
      this.pending = Object.create(null);
      this.cache = Object.create(null);
    },

    activate: async function (uid) {
      if (!uid) throw new Error("UID required");
      if (this.active && this.uid === uid) return;
      if (this.uid && this.uid !== uid) await this.flush();
      this.stop();
      this.uid = uid;
      this.prefix = "dota.";
      this.active = false;
      this._clearMemory();
      this._loadPending(uid);
      this._migrateLegacy(uid);
      this.setStatus(Object.keys(this.pending).length ? "pending" : "syncing", "Загрузка данных");

      var remote = {};
      try {
        var helpers = window.__fbDB;
        if (!helpers) throw new Error("Firebase недоступен");
        var snap = await helpers.get(helpers.ref(helpers.db, "users/" + uid));
        var value = snap.val();
        if (value && typeof value === "object" && !Array.isArray(value)) remote = value;
      } catch (error) {
        this._restoreLegacy(uid);
        this.active = true;
        this.lastError = error;
        this.setStatus("error", "Облако недоступно — локальная копия");
        this._startPolling();
        this._scheduleFlush(5000);
        dispatch("jetch:syncready", { uid: uid, cloud: false });
        return;
      }

      var local = Object.create(null);
      USER_KEYS.forEach(function (key) {
        var entry = Sync._readCache(key);
        if (entry.found) local[key] = entry.value;
      });
      var merged = Object.create(null);
      Object.keys(remote).forEach(function (encoded) {
        var key = decodeKey(encoded);
        if (KEY_LOOKUP[key] && remote[encoded] !== null && remote[encoded] !== undefined) {
          merged[key] = clone(remote[encoded]);
        }
      });
      Object.keys(local).forEach(function (key) { if (!(key in merged)) merged[key] = clone(local[key]); });
      Object.keys(this.pending).forEach(function (key) {
        if (Sync.pending[key] === null) delete merged[key];
        else merged[key] = clone(Sync.pending[key]);
      });
      Object.keys(merged).forEach(function (key) { Sync._writeCache(key, merged[key]); });
      this.active = true;
      this.setStatus(Object.keys(this.pending).length ? "pending" : "saved", Object.keys(this.pending).length ? "Восстановлены локальные изменения" : "Данные синхронизированы");
      this._startPolling();
      if (Object.keys(this.pending).length) this._scheduleFlush(0);
      dispatch("jetch:syncready", { uid: uid, cloud: true });
    },

    deactivate: async function () {
      var uid = this.uid;
      if (!uid) {
        this.stop();
        this.active = false;
        this._clearMemory();
        this.setStatus("offline", "Не авторизован");
        return;
      }
      try { await this.flush(); } catch (e) {}
      this._persistPending();
      this.stop();
      this.active = false;
      this.uid = null;
      this._clearMemory();
      this.setStatus("offline", "Не авторизован");
    },

    stop: function () {
      this.active = false;
      if (this.flushTimer) { clearTimeout(this.flushTimer); this.flushTimer = null; }
      if (this.pollTimer) { clearInterval(this.pollTimer); this.pollTimer = null; }
    },

    get: function (key, fallback) {
      if (this.uid) {
        if (Object.prototype.hasOwnProperty.call(this.pending, key)) return clone(this.pending[key]);
        if (Object.prototype.hasOwnProperty.call(this.cache, key)) {
          var value = this.cache[key];
          return value === null || value === undefined ? fallback : clone(value);
        }
        var entry = this._readCache(key);
        if (entry.found) return entry.value === null || entry.value === undefined ? fallback : clone(entry.value);
        return fallback;
      }
      var raw = storageGet(sessionStorage, "dota." + key);
      if (raw === null) raw = storageGet(localStorage, "dota." + key);
      if (raw === null) return fallback;
      var value = safeParse(raw, fallback);
      return value === null || value === undefined ? fallback : value;
    },

    set: function (key, value) {
      if (!this.uid) {
        var full = "dota." + key;
        if (value === null || value === undefined) {
          storageRemove(sessionStorage, full); storageRemove(localStorage, full);
        } else {
          var serialized = JSON.stringify(value);
          storageSet(sessionStorage, full, serialized);
          storageSet(localStorage, full, serialized);
        }
        notifyChange(key, value, "unauthenticated");
        return;
      }
      this.pending[key] = clone(value);
      this._writeCache(key, value);
      this._persistPending();
      notifyChange(key, value, "local");
      this.setStatus("pending", "Ожидает сохранения");
      this._scheduleFlush(650);
    },

    remove: function (key) { this.set(key, null); },

    clear: function () {
      var self = this;
      USER_KEYS.forEach(function (key) { self.set(key, null); });
    },

    replaceFromRemote: function (data, source) {
      if (!this.uid || !data || typeof data !== "object") return;
      var self = this;
      Object.keys(data).forEach(function (encoded) {
        var key = decodeKey(encoded);
        if (!KEY_LOOKUP[key] || Object.prototype.hasOwnProperty.call(self.pending, key)) return;
        if (SERVER_ONLY_KEYS.indexOf(key) < 0 && source === "poll") return;
        self._writeCache(key, clone(data[encoded]));
        notifyChange(key, data[encoded], source || "remote");
      });
    },

    _enqueueWrite: function (operation) {
      this.queue = this.queue.catch(function () {}).then(operation);
      return this.queue;
    },

    writeNow: function (uid, encodedKey, value) {
      var helpers = window.__fbDB;
      if (!helpers) return Promise.reject(new Error("Firebase недоступен"));
      var path = "users/" + uid;
      if (value === undefined || value === null) return helpers.remove(helpers.ref(helpers.db, path + "/" + encodedKey));
      var patch = {}; patch[encodedKey] = clone(value);
      return helpers.update(helpers.ref(helpers.db, path), patch);
    },

    flush: function () {
      if (!this.uid || !this.active) return this.queue;
      if (this.remoteBusy) { this._scheduleFlush(400); return this.queue; }
      var uid = this.uid;
      var pendingSnapshot = this.pending;
      var keys = Object.keys(pendingSnapshot);
      if (!keys.length) { this.setStatus("saved", "Все изменения сохранены"); return this.queue; }
      this.pending = Object.create(null);
      this._persistPending();
      this.remoteBusy = true;
      this.setStatus("syncing", "Сохранение изменений");
      return this._enqueueWrite(async function () {
        var sent = Object.create(null);
        try {
          for (var i = 0; i < keys.length; i++) {
            if (!Sync.active || Sync.uid !== uid) throw new Error("Синхронизация остановлена");
            var key = keys[i];
            await Sync.writeNow(uid, encodeKey(key), pendingSnapshot[key]);
            sent[key] = true;
          }
          if (Sync.uid === uid) {
            Sync.lastSavedAt = Date.now();
            Sync.lastError = null;
            Sync.setStatus("saved", "Все изменения сохранены");
          }
        } catch (error) {
          keys.forEach(function (key) {
            if (sent[key]) return;
            if (!Object.prototype.hasOwnProperty.call(Sync.pending, key)) Sync.pending[key] = clone(pendingSnapshot[key]);
          });
          if (Sync.uid === uid) {
            Sync.lastError = error;
            Sync._persistPending();
            Sync.setStatus("error", "Не сохранено — повторим автоматически");
            Sync._scheduleFlush(8000);
          }
        } finally {
          Sync.remoteBusy = false;
        }
      });
    },

    _scheduleFlush: function (delay) {
      if (this.flushTimer || !this.uid) return;
      this.flushTimer = setTimeout(function () {
        Sync.flushTimer = null;
        Sync.flush();
      }, delay);
    },

    _startPolling: function () {
      if (this.pollTimer) clearInterval(this.pollTimer);
      this.pollTimer = setInterval(function () {
        if (!Sync.active || Sync.remoteBusy || !Sync.uid) return;
        var uid = Sync.uid;
        var helpers = window.__fbDB;
        if (!helpers) return;
        helpers.get(helpers.ref(helpers.db, "users/" + uid)).then(function (snap) {
          if (!Sync.active || Sync.uid !== uid) return;
          var data = snap.val() || {};
          Sync.replaceFromRemote(data, "poll");
          if (data.blocked === true) dispatch("jetch:blocked", { uid: uid });
          if (!Object.keys(Sync.pending).length && Sync.status === "error") Sync.setStatus("saved", "Соединение восстановлено");
        }).catch(function (error) {
          Sync.lastError = error;
          if (Object.keys(Sync.pending).length) Sync.setStatus("error", "Нет соединения с облаком");
        });
      }, 20000);
    },

    setStatus: function (status, detail) {
      this.status = status;
      this.statusDetail = detail || "";
      dispatch("jetch:syncstatus", this.getStatus());
    },

    getStatus: function () {
      return { status: this.status, detail: this.statusDetail, pending: Object.keys(this.pending).length, error: this.lastError, lastSavedAt: this.lastSavedAt, uid: this.uid };
    },

    flushPending: function () { return this.flush(); },

    _migrateLegacy: function (uid) {
      var loadedUid = storageGet(sessionStorage, this.legacyLoadedKey());
      /* Старые ключи не привязаны к аккаунту: переносим только когда
         точно знаем, что они принадлежат этому пользователю. */
      if (loadedUid !== uid) return;
      var self = this;
      USER_KEYS.forEach(function (key) {
        if (self._readCache(key).found || Object.prototype.hasOwnProperty.call(self.pending, key)) return;
        var raw = storageGet(sessionStorage, "dota." + key);
        if (raw === null) raw = storageGet(localStorage, "dota." + key);
        if (raw !== null) self.pending[key] = safeParse(raw, null);
        storageRemove(sessionStorage, "dota." + key);
        storageRemove(localStorage, "dota." + key);
      });
      this._persistPending();
    },

    _restoreLegacy: function (uid) {
      var self = this;
      USER_KEYS.forEach(function (key) {
        var raw = storageGet(sessionStorage, "dota." + key);
        if (raw === null) raw = storageGet(localStorage, "dota." + key);
        if (raw !== null) {
          storageSet(sessionStorage, self.userPrefix(uid) + key, raw);
          storageSet(localStorage, self.userPrefix(uid) + key, raw);
        }
        storageRemove(sessionStorage, "dota." + key);
        storageRemove(localStorage, "dota." + key);
      });
    }
  };

  window.CloudSync = Sync;
  window.addEventListener("online", function () { if (Sync.active) Sync.flush(); });
  window.addEventListener("offline", function () {
    if (Sync.uid) Sync.setStatus(Object.keys(Sync.pending).length ? "error" : "offline", "Нет сети — изменения сохранены локально");
  });
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden" && Sync.active) Sync.flush();
  });
  window.addEventListener("pagehide", function () { Sync._persistPending(); });
  window.CloudSyncTest = { getQueryUid: getQueryUid, safeParse: safeParse };
})();
