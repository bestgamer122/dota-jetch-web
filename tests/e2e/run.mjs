/* DOTA JETCH — E2E проверка в headless Chrome.
   Запуск: node tests/e2e/run.mjs
   Нужен установленный Chrome/Chromium; путь можно задать через CHROME_PATH.
   Внешние сервисы отключены: Firebase и сторонние API подменены. */

import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const PORT = Number(process.env.E2E_PORT || 8099);
const BASE = process.env.E2E_BASE || `http://127.0.0.1:${PORT}/`;
const DEBUG_PORT = Number(process.env.E2E_DEBUG_PORT || 9371);

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  join(process.env.LOCALAPPDATA || "", "Google\\Chrome\\Application\\chrome.exe"),
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].filter(Boolean);

const chromePath = CHROME_CANDIDATES.find(p => existsSync(p));
if (!chromePath) {
  console.log("SKIP: Chrome не найден. Укажи путь через CHROME_PATH.");
  process.exit(0);
}

const delay = ms => new Promise(r => setTimeout(r, ms));
const children = [];
const profileDir = mkdtempSync(join(tmpdir(), "dj-e2e-"));

function cleanup() {
  for (const child of children) {
    try { child.kill(); } catch {}
  }
  try { rmSync(profileDir, { recursive: true, force: true }); } catch {}
}

async function waitFor(url, attempts = 100) {
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {}
    await delay(100);
  }
  return false;
}

let socket;
const results = [];
const consoleErrors = [];
const check = (name, ok, detail = "") => results.push({ name, ok: !!ok, detail });

try {
  if (!process.env.E2E_BASE) {
    const server = spawn(process.execPath, [resolve("tools/serve.mjs"), String(PORT)], { stdio: "ignore" });
    children.push(server);
    if (!await waitFor(BASE)) throw new Error(`Сервер не поднялся на ${BASE}`);
  }

  const browser = spawn(chromePath, [
    "--headless=new", "--no-first-run", "--no-default-browser-check",
    "--disable-extensions", "--disable-crash-reporter", "--disable-breakpad",
    "--mute-audio", "--hide-scrollbars",
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=${profileDir}`,
    "about:blank"
  ], { stdio: "ignore" });
  children.push(browser);

  if (!await waitFor(`http://127.0.0.1:${DEBUG_PORT}/json/version`)) {
    throw new Error("Chrome DevTools не отвечает");
  }

  const targets = await (await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/list`)).json();
  const page = targets.find(t => t.type === "page");
  socket = new WebSocket(page.webSocketDebuggerUrl);
  await new Promise((res, rej) => {
    socket.addEventListener("open", res, { once: true });
    socket.addEventListener("error", rej, { once: true });
  });

  let seq = 0;
  const pending = new Map();
  socket.addEventListener("message", ev => {
    const msg = JSON.parse(ev.data);
    if (msg.id) {
      const p = pending.get(msg.id);
      if (p) { pending.delete(msg.id); msg.error ? p.reject(msg.error) : p.resolve(msg.result); }
      return;
    }
    if (msg.method === "Runtime.exceptionThrown") {
      const d = msg.params.exceptionDetails;
      consoleErrors.push((d.exception?.description || d.text || "exception").split("\n")[0]);
    } else if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
      consoleErrors.push(msg.params.entry.text);
    }
  });

  const send = (method, params = {}) => new Promise((resolve2, reject2) => {
    const next = ++seq;
    pending.set(next, { resolve: resolve2, reject: reject2 });
    socket.send(JSON.stringify({ id: next, method, params }));
  });
  const evaluate = async expression => {
    const r = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) {
      throw new Error(r.exceptionDetails.exception?.description?.split("\n")[0] || r.exceptionDetails.text);
    }
    return r.result.value;
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Log.enable");
  await send("Network.enable");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  await send("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
  socket.addEventListener("message", ev => {
    const msg = JSON.parse(ev.data);
    if (msg.method !== "Fetch.requestPaused") return;
    const p = msg.params;
    const local = p.request.url.startsWith(BASE) || p.request.url.includes("fonts.g");
    if (local) send("Fetch.continueRequest", { requestId: p.requestId }).catch(() => {});
    else send("Fetch.failRequest", { requestId: p.requestId, errorReason: "Aborted" }).catch(() => {});
  });

  await send("Page.addScriptToEvaluateOnNewDocument", { source: `
    (() => {
      const put = (k, v) => { sessionStorage.setItem('dota.u.e2e.' + k, JSON.stringify(v)); };
      put('nickname', 'e2e_user');
      put('license.active', true);
      put('license.forever', true);
      put('minigames_mmr', 1200);
      put('minigames_calibrated', true);
      put('recentmatches', [{ matchId: 1, heroId: 10, heroName: 'Morphling', kills: 1, deaths: 0, assists: 2, won: true, durMin: 30 }]);
      put('diarynotes', [{ id: '1', title: 't', text: 'x', tags: [], ts: 1 }]);
      put('achievementsunlocked', ['a1', 'a2']);
      window.__fbAuth = { currentUser: null, app: {} };
      window.__fbDB = {
        db: {}, ref: (_d, p) => p,
        get: async () => ({ val: () => null, exists: () => false }),
        update: async () => {}, remove: async () => {},
        onValue: () => () => {}, runTransaction: async () => ({ committed: true })
      };
      window.alert = () => {}; window.confirm = () => true;
      window.fetch = async () => ({ ok: false, status: 503, json: async () => ({}), text: async () => "" });
    })();
  ` });

  await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await send("Page.navigate", { url: BASE + "index.html" });
  await delay(2500);

  await evaluate(`(async () => {
    await CloudSync.activate('e2e');
    var auth = document.getElementById('authScreen');
    if (auth) { auth.style.display = 'none'; auth.innerHTML = ''; }
    document.body.style.overflow = '';
    if (typeof updateSidebarPlan === 'function') updateSidebarPlan();
  })()`);
  await delay(400);

  const report = await Promise.race([
    evaluate(`(async () => {
      const out = { pages: [], checks: [] };
      const tick = ms => new Promise(r => setTimeout(r, ms));
      const test = (name, ok, detail = '') => out.checks.push({ name, ok: !!ok, detail });

      const pages = ['dashboard','profile','analyze','history','charts','diary','games','leaderboard','achievements','settings','about'];
      for (const name of pages) {
        switchPage(name);
        await tick(180);
        const text = document.querySelector('#pageContent')?.innerText || '';
        out.pages.push({ name, ok: !!text.trim() && !text.includes('Render error') && !text.startsWith('Ошибка:') });
      }

      test('nav построена по группам', document.querySelectorAll('#sidebarNav .nav-group').length >= 4);
      test('индикатор синхронизации на месте', !!document.querySelector('#syncPill'));

      applyTheme('ocean');
      await tick(80);
      applyTheme('dark');
      await tick(80);
      test('переключение темы не зацикливается', document.documentElement.getAttribute('data-theme') === 'dark');

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
      await tick(60);
      test('палитра открывается по Ctrl+K', !document.querySelector('#paletteOverlay').hidden);

      const input = document.querySelector('#paletteInput');
      input.value = 'истор';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      await tick(60);
      test('палитра фильтрует', document.querySelectorAll('#paletteList .palette-item').length === 1);

      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      await tick(120);
      test('палитра переходит по Enter', currentPage === 'history' && document.querySelector('#paletteOverlay').hidden);

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
      await tick(60);
      document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
      await tick(60);
      test('палитра закрывается по Escape', document.querySelector('#paletteOverlay').hidden);

      return out;
    })()`),
    delay(40000).then(() => { throw new Error("E2E: сценарий не завершился вовремя"); })
  ]);

  for (const p of report.pages) check(`страница: ${p.name}`, p.ok);
  for (const c of report.checks) check(c.name, c.ok, c.detail);
} catch (error) {
  check("E2E выполнился", false, error.message);
} finally {
  if (socket) socket.close();
  cleanup();
}

const failed = results.filter(r => !r.ok);
for (const r of results) {
  console.log(`${r.ok ? "✔" : "✖"} ${r.name}${r.detail ? " — " + r.detail : ""}`);
}
if (consoleErrors.length) {
  console.log("\nОшибки в консоли браузера:");
  for (const line of [...new Set(consoleErrors)]) console.log("  " + line);
}

const ok = failed.length === 0 && consoleErrors.length === 0;
console.log(`\nE2E: ${results.length - failed.length}/${results.length} проверок, ошибок консоли: ${consoleErrors.length}`);
console.log(ok ? "RESULT=PASS" : "RESULT=FAIL");
process.exit(ok ? 0 : 1);
