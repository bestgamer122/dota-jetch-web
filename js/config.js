/* DOTA JETCH — CONFIG v3.3.8
Максимально простой синтаксис. Без вложенных объектов там, где можно обойтись. */

const APP_VERSION = "3.3.8";

var Store = {
*prefix: "dotajetch*",
get: function (key, def) {
if (def === undefined) def = null;
try {
var v = localStorage.getItem(this._prefix + key);
if (v === null) return def;
return JSON.parse(v);
} catch (e) {
return def;
}
},
set: function (key, val) {
try {
localStorage.setItem(this._prefix + key, JSON.stringify(val));
} catch (e) {}
},
remove: function (key) {
try {
localStorage.removeItem(this._prefix + key);
} catch (e) {}
},
clear: function () {
try {
var prefix = this._prefix;
var keys = Object.keys(localStorage);
for (var i = 0; i < keys.length; i++) {
if (keys[i].indexOf(prefix) === 0) {
localStorage.removeItem(keys[i]);
}
}
} catch (e) {}
}
};

var API_BASE = "https://api.opendota.com/api";

async function apiGet(path, params) {
var url = API_BASE + path;
if (params) {
var q = new URLSearchParams(params).toString();
if (q) url += "?" + q;
}
var res = await fetch(url);
if (!res.ok) throw new Error("HTTP " + res.status);
return await res.json();
}

var THEMES = {};

THEMES.dark = {
label: "🌙 Тёмная (фиолет)",
vars: {
"--bg": "#0b0c10",
"--bg-card": "#16181f",
"--bg-elev": "#1e2129",
"--text": "#e8eaf0",
"--text-muted": "#9ba0ad",
"--text-dim": "#6b7280",
"--border": "#2a2d36",
"--border-hl": "#3a3e4a",
"--accent": "#8b5cf6",
"--accent-light": "#a78bfa",
"--accent-dark": "#6d28d9",
"--accent-bg": "rgba(139,92,246,0.12)",
"--gold": "#fbbf24",
"--gold-bg": "rgba(251,191,36,0.12)",
"--cyan": "#22d3ee",
"--cyan-bg": "rgba(34,211,238,0.12)",
"--green": "#22c55e",
"--green-bg": "rgba(34,197,94,0.12)",
"--red": "#ef4444",
"--red-bg": "rgba(239,68,68,0.12)",
"--yellow": "#eab308",
"--yellow-bg": "rgba(234,179,8,0.12)",
"--orange": "#f97316",
"--orange-bg": "rgba(249,115,22,0.12)"
}
};

THEMES.ocean = {
label: "🌊 Океан",
vars: {
"--bg": "#081018",
"--bg-card": "#0f1a24",
"--bg-elev": "#16232f",
"--text": "#e8eaf0",
"--text-muted": "#9ba0ad",
"--text-dim": "#6b7280",
"--border": "#1e3040",
"--border-hl": "#2c4558",
"--accent": "#0ea5e9",
"--accent-light": "#38bdf8",
"--accent-dark": "#0369a1",
"--accent-bg": "rgba(14,165,233,0.12)",
"--gold": "#fbbf24",
"--gold-bg": "rgba(251,191,36,0.12)",
"--cyan": "#22d3ee",
"--cyan-bg": "rgba(34,211,238,0.12)",
"--green": "#22c55e",
"--green-bg": "rgba(34,197,94,0.12)",
"--red": "#ef4444",
"--red-bg": "rgba(239,68,68,0.12)",
"--yellow": "#eab308",
"--yellow-bg": "rgba(234,179,8,0.12)",
"--orange": "#f97316",
"--orange-bg": "rgba(249,115,22,0.12)"
}
};

THEMES.forest = {
label: "🌲 Лес",
vars: {
"--bg": "#0a120c",
"--bg-card": "#111a14",
"--bg-elev": "#19241c",
"--text": "#e8f0ea",
"--text-muted": "#9bb0a2",
"--text-dim": "#6b8072",
"--border": "#1f3025",
"--border-hl": "#2e4536",
"--accent": "#22c55e",
"--accent-light": "#4ade80",
"--accent-dark": "#166534",
"--accent-bg": "rgba(34,197,94,0.12)",
"--gold": "#fbbf24",
"--gold-bg": "rgba(251,191,36,0.12)",
"--cyan": "#22d3ee",
"--cyan-bg": "rgba(34,211,238,0.12)",
"--green": "#22c55e",
"--green-bg": "rgba(34,197,94,0.12)",
"--red": "#ef4444",
"--red-bg": "rgba(239,68,68,0.12)",
"--yellow": "#eab308",
"--yellow-bg": "rgba(234,179,8,0.12)",
"--orange": "#f97316",
"--orange-bg": "rgba(249,115,22,0.12)"
}
};

THEMES.crimson = {
label: "🔥 Кримсон",
vars: {
"--bg": "#140a0a",
"--bg-card": "#1e1111",
"--bg-elev": "#281818",
"--text": "#f0e8e8",
"--text-muted": "#b09b9b",
"--text-dim": "#806b6b",
"--border": "#302020",
"--border-hl": "#453030",
"--accent": "#ef4444",
"--accent-light": "#f87171",
"--accent-dark": "#991b1b",
"--accent-bg": "rgba(239,68,68,0.12)",
"--gold": "#fbbf24",
"--gold-bg": "rgba(251,191,36,0.12)",
"--cyan": "#22d3ee",
"--cyan-bg": "rgba(34,211,238,0.12)",
"--green": "#22c55e",
"--green-bg": "rgba(34,197,94,0.12)",
"--red": "#ef4444",
"--red-bg": "rgba(239,68,68,0.12)",
"--yellow": "#eab308",
"--yellow-bg": "rgba(234,179,8,0.12)",
"--orange": "#f97316",
"--orange-bg": "rgba(249,115,22,0.12)"
}
};

THEMES.sunset = {
label: "🌅 Закат",
vars: {
"--bg": "#150e0a",
"--bg-card": "#1f1610",
"--bg-elev": "#2a1e15",
"--text": "#f0e8e0",
"--text-muted": "#b09a8a",
"--text-dim": "#806a5a",
"--border": "#302018",
"--border-hl": "#453228",
"--accent": "#f97316",
"--accent-light": "#fb923c",
"--accent-dark": "#c2410c",
"--accent-bg": "rgba(249,115,22,0.12)",
"--gold": "#fbbf24",
"--gold-bg": "rgba(251,191,36,0.12)",
"--cyan": "#22d3ee",
"--cyan-bg": "rgba(34,211,238,0.12)",
"--green": "#22c55e",
"--green-bg": "rgba(34,197,94,0.12)",
"--red": "#ef4444",
"--red-bg": "rgba(239,68,68,0.12)",
"--yellow": "#eab308",
"--yellow-bg": "rgba(234,179,8,0.12)",
"--orange": "#f97316",
"--orange-bg": "rgba(249,115,22,0.12)"
}
};

THEMES.candy = {
label: "🌸 Кэнди",
vars: {
"--bg": "#160e14",
"--bg-card": "#20141c",
"--bg-elev": "#2a1c26",
"--text": "#f0e8ee",
"--text-muted": "#b09aa8",
"--text-dim": "#806a7a",
"--border": "#302028",
"--border-hl": "#45303c",
"--accent": "#ec4899",
"--accent-light": "#f472b6",
"--accent-dark": "#9d174d",
"--accent-bg": "rgba(236,72,153,0.12)",
"--gold": "#fbbf24",
"--gold-bg": "rgba(251,191,36,0.12)",
"--cyan": "#22d3ee",
"--cyan-bg": "rgba(34,211,238,0.12)",
"--green": "#22c55e",
"--green-bg": "rgba(34,197,94,0.12)",
"--red": "#ef4444",
"--red-bg": "rgba(239,68,68,0.12)",
"--yellow": "#eab308",
"--yellow-bg": "rgba(234,179,8,0.12)",
"--orange": "#f97316",
"--orange-bg": "rgba(249,115,22,0.12)"
}
};

function applyTheme(name) {
var key = THEMES[name] ? name : "dark";
var t = THEMES[key];
var root = document.documentElement;
for (var k in t.vars) {
if (t.vars.hasOwnProperty(k)) {
root.style.setProperty(k, t.vars[k]);
}
}
document.body.style.background = t.vars["--bg"];
document.body.style.color = t.vars["--text"];
Store.set("theme", key);
}

function loadTheme() {
return Store.get("theme", "dark");
}