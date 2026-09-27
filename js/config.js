/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — CONFIG
   Версия, темы, Store (localStorage), API-хелпер.
   ═══════════════════════════════════════════════════════════════════ */

const APP_VERSION = "3.0.0";

/* ─── localStorage обёртка ─── */
const Store = {
  _prefix: "dotajetch_",
  get(key, def = null) {
    try {
      const v = localStorage.getItem(this._prefix + key);
      if (v === null) return def;
      return JSON.parse(v);
    } catch (e) {
      return def;
    }
  },
  set(key, val) {
    try {
      localStorage.setItem(this._prefix + key, JSON.stringify(val));
    } catch (e) {}
  },
  remove(key) {
    try { localStorage.removeItem(this._prefix + key); } catch (e) {}
  },
  clear() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(this._prefix));
      for (const k of keys) localStorage.removeItem(k);
    } catch (e) {}
  },
};

/* ─── OpenDota API ─── */
const API_BASE = "https://api.opendota.com/api";

async function apiGet(path, params) {
  let url = API_BASE + path;
  if (params) {
    const q = new URLSearchParams(params).toString();
    if (q) url += "?" + q;
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  return await res.json();
}

/* ─── Темы ─── */
const THEME_DARK_BASE = {
  "--bg":       "#0b0c10",
  "--bg-card":  "#16181f",
  "--bg-elev":  "#1e2129",
  "--text":     "#e8eaf0",
  "--text-muted": "#9ba0ad",
  "--text-dim": "#6b7280",
  "--border":   "#2a2d36",
  "--border-hl": "#3a3e4a",
};

const THEMES = {
  dark: {
    label: "🌙 Тёмная (фиолет)",
    vars: {
      ...THEME_DARK_BASE,
      "--accent":       "#8b5cf6",
      "--accent-light": "#a78bfa",
      "--accent-dark":  "#6d28d9",
      "--accent-bg":    "rgba(139, 92, 246, 0.12)",
      "--gold":         "#fbbf24",
      "--gold-bg":      "rgba(251, 191, 36, 0.12)",
      "--cyan":         "#22d3ee",
      "--cyan-bg":      "rgba(34, 211, 238, 0.12)",
      "--green":        "#22c55e",
      "--green-bg":     "rgba(34, 197, 94, 0.12)",
      "--red":          "#ef4444",
      "--red-bg":       "rgba(239, 68, 68, 0.12)",
      "--yellow":       "#eab308",
      "--yellow-bg":    "rgba(234, 179, 8, 0.12)",
      "--orange":       "#f97316",
      "--orange-bg":    "rgba(249, 115, 22, 0.12)",
    },
  },
  ocean: {
    label: "🌊 Океан",
    vars: {
      ...THEME_DARK_BASE,
      "--bg":      "#081018",
      "--bg-card": "#0f1a24",
      "--bg-elev": "#16232f",
      "--accent":       "#0ea5e9",
      "--accent-light": "#38bdf8",
      "--accent-dark":  "#0369a1",
      "--accent-bg":    "rgba(14, 165, 233, 0.12)",
      "--gold":         "#fbbf24",
      "--gold-bg":      "rgba(251, 191, 36, 0.12)",
      "--cyan":         "#22d3ee",
      "--cyan-bg":      "rgba(34, 211, 238, 0.12)",
      "--green":        "#22c55e",
      "--green-bg":     "rgba(34, 197, 94, 0.12)",
      "--red":          "#ef4444",
      "--red-bg":       "rgba(239, 68, 68, 0.12)",
      "--yellow":       "#eab308",
      "--yellow-bg":    "rgba(234, 179, 8, 0.12)",
      "--orange":       "#f97316",
      "--orange-bg":    "rgba(249, 115, 22, 0.12)",
    },
  },
  forest: {
    label: "🌲 Лес",
    vars: {
      ...THEME_DARK_BASE,
      "--bg":      "#0a120c",
      "--bg-card": "#111a14",
      "--bg-elev": "#19241c",
      "--accent":       "#22c55e",
      "--accent-light": "#4ade80",
      "--accent-dark":  "#166534",
      "--accent-bg":    "rgba(34, 197, 94, 0.12)",
      "--gold":         "#fbbf24",
      "--gold-bg":      "rgba(251, 191, 36, 0.12)",
      "--cyan":         "#22d3ee",
      "--cyan-bg":      "rgba(34, 211, 238, 0.12)",
      "--green":        "#22c55e",
      "--green-bg":     "rgba(34, 197, 94, 0.12)",
      "--red":          "#ef4444",
      "--red-bg":       "rgba(239, 68, 68, 0.12)",
      "--yellow":       "#eab308",
      "--yellow-bg":    "rgba(234, 179, 8, 0.12)",
      "--orange":       "#f97316",
      "--orange-bg":    "rgba(249, 115, 22, 0.12)",
    },
  },
  crimson: {
    label: "🔥 Кримсон",
    vars: {
      ...THEME_DARK_BASE,
      "--bg":      "#140a0a",
      "--bg-card": "#1e1111",
      "--bg-elev": "#281818",
      "--accent":       "#ef4444",
      "--accent-light": "#f87171",
      "--accent-dark":  "#991b1b",
      "--accent-bg":    "rgba(239, 68, 68, 0.12)",
      "--gold":         "#fbbf24",
      "--gold-bg":      "rgba(251, 191, 36, 0.12)",
      "--cyan":         "#22d3ee",
      "--cyan-bg":      "rgba(34, 211, 238, 0.12)",
      "--green":        "#22c55e",
      "--green-bg":     "rgba(34, 197, 94, 0.12)",
      "--red":          "#ef4444",
      "--red-bg":       "rgba(239, 68, 68, 0.12)",
      "--yellow":       "#eab308",
      "--yellow-bg":    "rgba(234, 179, 8, 0.12)",
      "--orange":       "#f97316",
      "--orange-bg":    "rgba(249, 115, 22, 0.12)",
    },
  },
  sunset: {
    label: "🌅 Закат",
    vars: {
      ...THEME_DARK_BASE,
      "--bg":      "#150e0a",
      "--bg-card": "#1f1610",
      "--bg-elev": "#2a1e15",
      "--accent":       "#f97316",
      "--accent-light": "#fb923c",
      "--accent-dark":  "#c2410c",
      "--accent-bg":    "rgba(249, 115, 22, 0.12)",
      "--gold":         "#fbbf24",
      "--gold-bg":      "rgba(251, 191, 36, 0.12)",
      "--cyan":         "#22d3ee",
      "--cyan-bg":      "rgba(34, 211, 238, 0.12)",
      "--green":        "#22c55e",
      "--green-bg":     "rgba(34, 197, 94, 0.12)",
      "--red":          "#ef4444",
      "--red-bg":       "rgba(239, 68, 68, 0.12)",
      "--yellow":       "#eab308",
      "--yellow-bg":    "rgba(234, 179, 8, 0.12)",
      "--orange":       "#f97316",
      "--orange-bg":    "rgba(249, 115, 22, 0.12)",
    },
  },
  candy: {
    label: "🌸 Кэнди",
    vars: {
      ...THEME_DARK_BASE,
      "--bg":      "#160e14",
      "--bg-card": "#20141c",
      "--bg-elev": "#2a1c26",
      "--accent":       "#ec4899",
      "--accent-light": "#f472b6",
      "--accent-dark":  "#9d174d",
      "--accent-bg":    "rgba(236, 72, 153, 0.12)",
      "--gold":         "#fbbf24",
      "--gold-bg":      "rgba(251, 191, 36, 0.12)",
      "--cyan":         "#22d3ee",
      "--cyan-bg":      "rgba(34, 211, 238, 0.12)",
      "--green":        "#22c55e",
      "--green-bg":     "rgba(34, 197, 94, 0.12)",
      "--red":          "#ef4444",
      "--red-bg":       "rgba(239, 68, 68, 0.12)",
      "--yellow":       "#eab308",
      "--yellow-bg":    "rgba(234, 179, 8, 0.12)",
      "--orange":       "#f97316",
      "--orange-bg":    "rgba(249, 115, 22, 0.12)",
    },
  },
};

function applyTheme(name) {
  const key = THEMES[name] ? name : "dark";
  const t = THEMES[key];
  const root = document.documentElement;
  for (const [k, v] of Object.entries(t.vars)) {
    root.style.setProperty(k, v);
  }
  Store.set("theme", key);
}

function loadTheme() {
  return Store.get("theme", "dark");
}
