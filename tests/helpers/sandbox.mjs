/* Песочница: загружает обычные браузерные скрипты проекта в Node.
   Никаких зависимостей — только встроенный модуль vm. */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import vm from "node:vm";

function makeStorage() {
  const map = new Map();
  return {
    get length() { return map.size; },
    key(i) { return [...map.keys()][i] ?? null; },
    getItem(k) { return map.has(String(k)) ? map.get(String(k)) : null; },
    setItem(k, v) { map.set(String(k), String(v)); },
    removeItem(k) { map.delete(String(k)); },
    clear() { map.clear(); },
    _dump() { return Object.fromEntries(map); }
  };
}

function elementStub() {
  const node = {
    style: {},
    dataset: {},
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    children: [],
    textContent: "",
    innerHTML: "",
    appendChild(child) { node.children.push(child); return child; },
    removeChild() {},
    remove() {},
    setAttribute() {},
    getAttribute() { return null; },
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    focus() {},
    click() {}
  };
  return node;
}

export function createCloud(initial = {}) {
  const data = new Map(Object.entries(initial));
  const writes = [];
  const api = {
    data,
    writes,
    fail: false,
    get size() { return data.size; },
    db: {},
    ref: (_db, path) => path,
    get: async (path) => ({
      val: () => (data.has(path) ? data.get(path) : null),
      exists: () => data.has(path)
    }),
    update: async (path, patch) => {
      if (api.fail) throw new Error("permission-denied");
      writes.push({ path, patch });
      const current = { ...(data.get(path) || {}) };
      for (const [key, value] of Object.entries(patch)) {
        if (value === null) delete current[key];
        else current[key] = value;
      }
      data.set(path, current);
    },
    remove: async (path) => {
      if (api.fail) throw new Error("permission-denied");
      const parts = path.split("/");
      const key = parts.pop();
      const parent = parts.join("/");
      const current = { ...(data.get(parent) || {}) };
      delete current[key];
      data.set(parent, current);
    },
    set: async (path, value) => {
      if (api.fail) throw new Error("permission-denied");
      data.set(path, value);
    },
    onValue: () => () => {},
    runTransaction: async () => ({ committed: true })
  };
  return api;
}

/**
 * @param {{ cloud?: ReturnType<typeof createCloud>, fetchImpl?: Function, quiet?: boolean }} options
 */
export function createSandbox(options = {}) {
  const cloud = options.cloud || createCloud();
  const listeners = Object.create(null);
  const storage = { local: makeStorage(), session: makeStorage() };
  const logger = options.quiet
    ? { log() {}, info() {}, warn() {}, debug() {}, error: console.error }
    : console;
  const timers = new Set();

  const trackTimer = (fn, ms) => {
    const id = fn();
    if (id !== undefined) timers.add(id);
    return id;
  };
  void trackTimer;

  const win = {
    innerWidth: 1440,
    innerHeight: 900,
    location: { search: "", origin: "http://localhost", pathname: "/" },
    history: { replaceState() {} },
    matchMedia: () => ({ matches: false }),
    console: logger,
    addEventListener(type, fn) { (listeners[type] ||= []).push(fn); },
    removeEventListener(type, fn) {
      const list = listeners[type] || [];
      const i = list.indexOf(fn);
      if (i >= 0) list.splice(i, 1);
    },
    dispatchEvent(event) {
      (listeners[event.type] || []).forEach(fn => fn(event));
      return true;
    }
  };

  const document = {
    visibilityState: "visible",
    documentElement: { style: { setProperty() {} }, setAttribute() {} },
    head: elementStub(),
    body: elementStub(),
    addEventListener() {},
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    createElement: elementStub,
    createElementNS: elementStub,
    createTextNode: (text) => ({ textContent: String(text) }),
    createDocumentFragment: elementStub
  };

  const context = {
    window: win,
    document,
    localStorage: storage.local,
    sessionStorage: storage.session,
    location: win.location,
    history: win.history,
    matchMedia: win.matchMedia,
    URLSearchParams,
    JSON, Math, Date, Object, Array, Number, String, Boolean, Promise, Set, Map, Error, RegExp,
    parseInt, parseFloat, isNaN, isFinite,
    console: logger,
    setTimeout, clearTimeout, setInterval, clearInterval,
    CustomEvent: class { constructor(type, init) { this.type = type; this.detail = init && init.detail; } },
    Node: class {},
    HTMLElement: class {},
    __fbDB: cloud,
    fetch: options.fetchImpl || (async () => ({ ok: false, status: 503, json: async () => ({}), text: async () => "" }))
  };
  context.globalThis = context;
  win.CustomEvent = context.CustomEvent;
  win.__fbDB = cloud;
  win.localStorage = storage.local;
  win.sessionStorage = storage.session;
  win.setTimeout = setTimeout;
  win.clearTimeout = clearTimeout;
  win.setInterval = setInterval;
  win.clearInterval = clearInterval;

  vm.createContext(context);

  function load(relativePath) {
    const file = resolve(relativePath);
    const source = readFileSync(file, "utf8");
    vm.runInContext(source, context, { filename: relativePath });
    return context;
  }

  function reset() {
    storage.local.clear();
    storage.session.clear();
  }

  return { ctx: context, win, cloud, storage, load, reset, listeners };
}

export const FILES = {
  sync: "js/sync.js",
  config: "js/config.js",
  rating: "js/rating.js",
  achievements: "js/achievements.js",
  daily: "js/daily.js",
  history: "js/history.js"
};
