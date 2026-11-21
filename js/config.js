/* DOTA JETCH — CONFIG v8.0
   - Store поверх CloudSync (UID-изоляция, очередь записи)
   - CORS-безопасный apiGet с fallback */

var Store = {
  prefix: "dota.",

  get: function (key, def) {
    if (def === undefined) def = null;
    if (window.CloudSync) return window.CloudSync.get(key, def);
    try {
      var v = sessionStorage.getItem(this.prefix + key);
      if (v === null) v = localStorage.getItem(this.prefix + key);
      if (v === null) return def;
      var parsed = JSON.parse(v);
      return parsed === null || parsed === undefined ? def : parsed;
    } catch (e) { return def; }
  },

  set: function (key, val) {
    if (window.CloudSync) { window.CloudSync.set(key, val); return; }
    try {
      var full = this.prefix + key;
      if (val === null || val === undefined) {
        sessionStorage.removeItem(full);
        localStorage.removeItem(full);
        return;
      }
      var str = JSON.stringify(val);
      sessionStorage.setItem(full, str);
      localStorage.setItem(full, str);
    } catch (e) {}
  },

  remove: function (key) { this.set(key, null); },

  clear: function () {
    if (window.CloudSync) { window.CloudSync.clear(); return; }
    try {
      var p = this.prefix;
      Object.keys(sessionStorage).forEach(function (key) {
        if (key.indexOf(p) === 0) sessionStorage.removeItem(key);
      });
      Object.keys(localStorage).forEach(function (key) {
        if (key.indexOf(p) === 0) localStorage.removeItem(key);
      });
    } catch (e) {}
  }
};

var API_BASE = "https://api.opendota.com/api";
var API_PROXY = "https://api.allorigins.win/raw?url=";

async function apiGet(path, params) {
  var url = API_BASE + path;
  if (params) {
    var q = new URLSearchParams(params).toString();
    if (q) url += "?" + q;
  }
  try {
    var res = await fetch(url);
    if (!res.ok) {
      var httpError = new Error("HTTP " + res.status);
      httpError.status = res.status;
      httpError.retryable = res.status === 429 || res.status >= 500;
      throw httpError;
    }
    return await res.json();
  } catch (e) {
    if (e && e.retryable === false) throw e;
    /* Fallback только для сети/CORS и временных ошибок сервера. */
    try {
      var proxyUrl = API_PROXY + encodeURIComponent(url);
      var res2 = await fetch(proxyUrl);
      if (!res2.ok) throw new Error("Proxy HTTP " + res2.status);
      return await res2.json();
    } catch (e2) {
      throw new Error("API недоступно: " + (e.message || e));
    }
  }
}

var THEMES = {};

THEMES.dark = { label: "Тёмная", vars: {
  "--bg": "#0a0a0b", "--bg-card": "#111113", "--bg-elev": "#19191d",
  "--text": "#ededf0", "--text-muted": "#a1a1aa", "--text-dim": "#71717a",
  "--border": "#232327", "--border-hl": "#33333a",
  "--accent": "#7c5cff", "--accent-light": "#a48bff", "--accent-dark": "#5b3fd6",
  "--accent-bg": "rgba(124,92,255,0.14)",
  "--gold": "#f5b544", "--gold-bg": "rgba(245,181,68,0.12)",
  "--cyan": "#38bdf8", "--cyan-bg": "rgba(56,189,248,0.12)",
  "--green": "#34d399", "--green-bg": "rgba(52,211,153,0.12)",
  "--red": "#f87171", "--red-bg": "rgba(248,113,113,0.12)"
}};

THEMES.ocean = { label: "Океан", vars: {
  "--bg": "#081018", "--bg-card": "#0f1a24", "--bg-elev": "#16232f",
  "--text": "#e8eaf0", "--text-muted": "#9ba0ad", "--text-dim": "#6b7280",
  "--border": "#1e3040", "--border-hl": "#2c4558",
  "--accent": "#0ea5e9", "--accent-light": "#38bdf8", "--accent-dark": "#0369a1",
  "--accent-bg": "rgba(14,165,233,0.12)",
  "--gold": "#fbbf24", "--gold-bg": "rgba(251,191,36,0.12)",
  "--cyan": "#22d3ee", "--cyan-bg": "rgba(34,211,238,0.12)",
  "--green": "#22c55e", "--green-bg": "rgba(34,197,94,0.12)",
  "--red": "#ef4444", "--red-bg": "rgba(239,68,68,0.12)"
}};

THEMES.forest = { label: "Лес", vars: {
  "--bg": "#0a120c", "--bg-card": "#111a14", "--bg-elev": "#19241c",
  "--text": "#e8f0ea", "--text-muted": "#9bb0a2", "--text-dim": "#6b8072",
  "--border": "#1f3025", "--border-hl": "#2e4536",
  "--accent": "#22c55e", "--accent-light": "#4ade80", "--accent-dark": "#166534",
  "--accent-bg": "rgba(34,197,94,0.12)",
  "--gold": "#fbbf24", "--gold-bg": "rgba(251,191,36,0.12)",
  "--cyan": "#22d3ee", "--cyan-bg": "rgba(34,211,238,0.12)",
  "--green": "#22c55e", "--green-bg": "rgba(34,197,94,0.12)",
  "--red": "#ef4444", "--red-bg": "rgba(239,68,68,0.12)"
}};

THEMES.crimson = { label: "Кримсон", vars: {
  "--bg": "#140a0a", "--bg-card": "#1e1111", "--bg-elev": "#281818",
  "--text": "#f0e8e8", "--text-muted": "#b09b9b", "--text-dim": "#806b6b",
  "--border": "#302020", "--border-hl": "#453030",
  "--accent": "#ef4444", "--accent-light": "#f87171", "--accent-dark": "#991b1b",
  "--accent-bg": "rgba(239,68,68,0.12)",
  "--gold": "#fbbf24", "--gold-bg": "rgba(251,191,36,0.12)",
  "--cyan": "#22d3ee", "--cyan-bg": "rgba(34,211,238,0.12)",
  "--green": "#22c55e", "--green-bg": "rgba(34,197,94,0.12)",
  "--red": "#ef4444", "--red-bg": "rgba(239,68,68,0.12)"
}};

THEMES.sunset = { label: "Закат", vars: {
  "--bg": "#150e0a", "--bg-card": "#1f1610", "--bg-elev": "#2a1e15",
  "--text": "#f0e8e0", "--text-muted": "#b09a8a", "--text-dim": "#806a5a",
  "--border": "#302018", "--border-hl": "#453228",
  "--accent": "#f97316", "--accent-light": "#fb923c", "--accent-dark": "#c2410c",
  "--accent-bg": "rgba(249,115,22,0.12)",
  "--gold": "#fbbf24", "--gold-bg": "rgba(251,191,36,0.12)",
  "--cyan": "#22d3ee", "--cyan-bg": "rgba(34,211,238,0.12)",
  "--green": "#22c55e", "--green-bg": "rgba(34,197,94,0.12)",
  "--red": "#ef4444", "--red-bg": "rgba(239,68,68,0.12)"
}};

THEMES.candy = { label: "Кэнди", vars: {
  "--bg": "#160e14", "--bg-card": "#20141c", "--bg-elev": "#2a1c26",
  "--text": "#f0e8ee", "--text-muted": "#b09aa8", "--text-dim": "#806a7a",
  "--border": "#302028", "--border-hl": "#45303c",
  "--accent": "#ec4899", "--accent-light": "#f472b6", "--accent-dark": "#9d174d",
  "--accent-bg": "rgba(236,72,153,0.12)",
  "--gold": "#fbbf24", "--gold-bg": "rgba(251,191,36,0.12)",
  "--cyan": "#22d3ee", "--cyan-bg": "rgba(34,211,238,0.12)",
  "--green": "#22c55e", "--green-bg": "rgba(34,197,94,0.12)",
  "--red": "#ef4444", "--red-bg": "rgba(239,68,68,0.12)"
}};

function applyThemeVars(name) {
  var key = THEMES[name] ? name : "dark";
  var t = THEMES[key];
  var root = document.documentElement;
  for (var k in t.vars) {
    if (t.vars.hasOwnProperty(k)) root.style.setProperty(k, t.vars[k]);
  }
  document.body.style.background = t.vars["--bg"];
  document.body.style.color = t.vars["--text"];
  document.documentElement.setAttribute("data-theme", key);
  /* Запоминаем последнюю тему отдельно от аккаунта: до загрузки облака
     мы ещё не знаем UID, а показать правильную тему уже нужно. */
  try { localStorage.setItem("dota.theme.last", key); } catch (e) {}
  return key;
}

/* Применяет тему и запоминает выбор. Не вызывать из обработчиков
   изменения хранилища — там нужен только applyThemeVars. */
function applyTheme(name) {
  var key = applyThemeVars(name);
  Store.set("theme", key);
  return key;
}

function loadTheme() {
  var stored = Store.get("theme", null);
  if (stored && THEMES[stored]) return stored;
  try {
    var last = localStorage.getItem("dota.theme.last");
    if (last && THEMES[last]) return last;
  } catch (e) {}
  return "dark";
}
