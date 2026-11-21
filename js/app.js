/* DOTA JETCH — APP v19.0 (sync status + page transitions) */

var APP_VERSION = "19.0";

var PAGES = {
  dashboard:    { title: "Главная",           render: renderDashboard },
  profile:      { title: "Мой профиль",       render: function () { return ProfileAnalyzer.render(); } },
  analyze:      { title: "Анализ матча",      render: renderAnalyze },
  history:      { title: "История",           render: renderHistory },
  charts:       { title: "Прогресс",          render: renderChartsPage },
  diary:        { title: "Дневник",           render: renderDiary },
  games:        { title: "Мини-игры",         render: renderGames },
  leaderboard:  { title: "Лидерборд",         render: renderLeaderboardPage },
  achievements: { title: "Достижения",        render: renderAchievements },
  admin:        { title: "Админ-панель",      render: renderAdminPanel },
  settings:     { title: "Настройки",         render: renderSettings },
  about:        { title: "О сайте",           render: renderAbout }
};

var ICONS = {
  dashboard: "M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z",
  profile: "M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zm0 3a3 3 0 1 1 0 6a3 3 0 1 0 0-6zm0 14.2a7.2 7.2 0 0 1-4.8-2.2c1.4-1.8 3.2-2.8 4.8-2.8s3.4 1 4.8 2.8a7.2 7.2 0 0 1-4.8 2.2z",
  analyze: "M5 3l14 9-14 9z",
  history: "M3 6h18M3 12h18M3 18h18",
  charts: "M21 12a9 9 0 1 1-9-9M21 3v9h-9",
  diary: "M4 4h12l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z",
  games: "M3 7h18v12H3z",
  leaderboard: "M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z",
  achievements: "M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3",
  settings: "M4 21v-6M4 11V3M12 21v-9M12 8V3M20 21v-4M20 13V3M1 15h6M9 8h6M17 17h6",
  about: "M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20zM12 11v6M12 7.6v.6",
  action: "M13 2 L4 14h6l-1 8 9-12h-6z",
  admin: "M12 2 L4 6v6c0 5 3.5 9.5 8 11 4.5-1.5 8-6 8-11V6l-8-4z"
};

var NAV_GROUPS = [
  { label: "Обзор", items: [
    { page: "dashboard", label: "Главная" },
    { page: "profile", label: "Мой профиль" }
  ]},
  { label: "Данные", items: [
    { page: "analyze", label: "Анализ матча" },
    { page: "history", label: "История" },
    { page: "charts", label: "Прогресс" },
    { page: "diary", label: "Дневник" }
  ]},
  { label: "Игра", items: [
    { page: "games", label: "Мини-игры" },
    { page: "leaderboard", label: "Лидерборд" },
    { page: "achievements", label: "Достижения" }
  ]},
  { label: "Система", items: [
    { page: "settings", label: "Настройки" },
    { page: "about", label: "О сайте" }
  ]}
];

function navIconMarkup(path) {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="' + path + '"/></svg>';
}

var currentPage = "dashboard";
var notificationUnsubscribe = null;
var appInitialized = false;

var SYNC_VIEW = {
  saved:   { state: "saved",   label: "Сохранено" },
  syncing: { state: "syncing", label: "Синхронизация" },
  pending: { state: "pending", label: "Ожидает" },
  error:   { state: "error",   label: "Нет связи" },
  offline: { state: "offline", label: "Офлайн" }
};

function renderSyncStatus(status) {
  var pill = qs("#syncPill");
  var label = qs("#syncLabel");
  if (!pill) return;
  var view = SYNC_VIEW[status && status.status] || SYNC_VIEW.offline;
  pill.setAttribute("data-state", view.state);
  pill.setAttribute("aria-live", "polite");
  if (label) label.textContent = view.label;
  pill.title = (status && status.detail) || view.label;
}

function initSyncIndicator() {
  renderSyncStatus(window.CloudSync ? window.CloudSync.getStatus() : null);
  window.addEventListener("jetch:syncstatus", function (event) {
    renderSyncStatus(event.detail);
  });
}

/* ─── Микро-анимации ────────────────────────────────────────── */
function prefersReducedMotion() {
  try { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) { return false; }
}

function motionEnabled() {
  return !prefersReducedMotion() && !document.body.classList.contains("lite-mode");
}

/* Каскадное появление блоков страницы */
function staggerChildren(container) {
  if (!container || !motionEnabled()) return;
  var children = container.children;
  for (var i = 0; i < children.length; i++) {
    children[i].style.setProperty("--i", String(Math.min(i, 12)));
  }
}

/* Счётчики: числа «набегают» от нуля */
function countUpValues(container) {
  if (!container || !motionEnabled()) return;
  var nodes = container.querySelectorAll(".kpi-value, .quota-value");
  Array.prototype.forEach.call(nodes, function (node) {
    if (node.dataset.counted === "1") return;
    var raw = (node.textContent || "").trim();
    if (!/^\d{1,6}$/.test(raw)) return;
    var target = parseInt(raw, 10);
    if (!target) return;
    node.dataset.counted = "1";
    var start = 0;
    var duration = 620;
    node.textContent = "0";
    function frame(now) {
      if (!start) start = now;
      var t = Math.min(1, (now - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);
      node.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(frame);
      else node.textContent = raw;
    }
    requestAnimationFrame(frame);
  });
}

/* Фон: мерцающие точки. Никакой реакции на курсор — только собственное движение. */
function initBackground() {
  var layer = qs(".bg-fx");
  if (!layer || layer.dataset.twinkles) return;
  var host = layer.querySelector(".bg-twinkle");
  if (!host) return;
  for (var i = 0; i < 18; i++) {
    var dot = document.createElement("span");
    dot.style.left = (Math.random() * 100).toFixed(2) + "%";
    dot.style.top = (Math.random() * 100).toFixed(2) + "%";
    dot.style.setProperty("--sz", (1 + Math.random() * 2).toFixed(1) + "px");
    dot.style.animationDelay = (-Math.random() * 9).toFixed(2) + "s";
    dot.style.animationDuration = (5 + Math.random() * 5).toFixed(2) + "s";
    host.appendChild(dot);
  }
  layer.dataset.twinkles = "1";
}

/* Подсветка карточки за курсором + ripple на кнопках */
function initMotion() {
  document.addEventListener("pointermove", function (event) {
    if (!motionEnabled()) return;
    var target = event.target;
    var card = target && target.closest
      ? target.closest(".card, .kpi, .stat-card, .hero-banner")
      : null;
    if (!card) return;
    var rect = card.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    card.style.setProperty("--mx", (((event.clientX - rect.left) / rect.width) * 100).toFixed(1) + "%");
    card.style.setProperty("--my", (((event.clientY - rect.top) / rect.height) * 100).toFixed(1) + "%");
  }, { passive: true });

  document.addEventListener("pointerdown", function (event) {
    if (!motionEnabled()) return;
    var btn = event.target && event.target.closest ? event.target.closest(".btn") : null;
    if (!btn || btn.disabled) return;
    var rect = btn.getBoundingClientRect();
    var size = Math.max(rect.width, rect.height);
    var ripple = document.createElement("span");
    ripple.className = "btn-ripple";
    ripple.style.width = size + "px";
    ripple.style.height = size + "px";
    ripple.style.left = (event.clientX - rect.left - size / 2) + "px";
    ripple.style.top = (event.clientY - rect.top - size / 2) + "px";
    btn.appendChild(ripple);
    setTimeout(function () {
      if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
    }, 620);
  }, { passive: true });
}

function buildNav() {
  var nav = qs("#sidebarNav");
  if (!nav) return;
  nav.innerHTML = "";
  var isAdmin = window.AdminPanel && window.AdminPanel.isAdmin === true;

  NAV_GROUPS.forEach(function (group) {
    var items = group.items.slice();
    if (group.label === "Система" && isAdmin) {
      items.push({ page: "admin", label: "Админ-панель" });
    }
    var wrap = el("div", { class: "nav-group", role: "group", "aria-label": group.label });
    wrap.appendChild(el("div", { class: "nav-group-label" }, group.label));
    items.forEach(function (item) {
      var btn = el("button", {
        class: "nav-btn" + (item.page === currentPage ? " active" : ""),
        "data-page": item.page,
        type: "button",
        title: item.label,
        "aria-current": item.page === currentPage ? "page" : null
      });
      var ico = el("span", { class: "nav-ico", "aria-hidden": "true" });
      ico.innerHTML = navIconMarkup(ICONS[item.page] || ICONS.about);
      btn.appendChild(ico);
      btn.appendChild(el("span", { class: "nav-label" }, item.label));
      btn.addEventListener("click", function () { switchPage(item.page); });
      wrap.appendChild(btn);
    });
    nav.appendChild(wrap);
  });
}

/* ─── Командная палитра ─────────────────────────────────────── */
var paletteState = { open: false, index: 0, items: [] };

function paletteCommands() {
  var cmds = [];
  NAV_GROUPS.forEach(function (group) {
    group.items.forEach(function (item) {
      cmds.push({ label: item.label, hint: group.label, page: item.page });
    });
  });
  if (window.AdminPanel && window.AdminPanel.isAdmin) {
    cmds.push({ label: "Админ-панель", hint: "Система", page: "admin" });
  }
  cmds.push({
    label: "Сменить тему",
    hint: "Оформление",
    run: function () {
      var names = Object.keys(THEMES);
      var next = names[(names.indexOf(loadTheme()) + 1) % names.length];
      applyTheme(next);
      if (typeof showDialog === "function") showDialog("Тема", THEMES[next].label, "success");
    }
  });
  cmds.push({
    label: Store.get("litemode", false) === true ? "Выключить Lite-режим" : "Включить Lite-режим",
    hint: "Производительность",
    run: function () { applyLiteMode(!isLiteMode()); }
  });
  cmds.push({ label: "Открыть профиль", hint: "Аккаунт", run: function () { window.openProfileModal(); } });
  return cmds;
}

function renderPalette(query) {
  var list = qs("#paletteList");
  if (!list) return;
  var q = String(query || "").trim().toLowerCase();
  var items = paletteCommands().filter(function (item) {
    if (!q) return true;
    return item.label.toLowerCase().indexOf(q) >= 0 || item.hint.toLowerCase().indexOf(q) >= 0;
  });
  paletteState.items = items;
  paletteState.index = Math.min(paletteState.index, Math.max(0, items.length - 1));
  list.innerHTML = "";

  if (!items.length) {
    list.appendChild(el("div", { class: "palette-empty" }, "Ничего не найдено"));
    return;
  }

  items.forEach(function (item, i) {
    var row = el("button", {
      type: "button",
      class: "palette-item",
      role: "option",
      "aria-selected": i === paletteState.index ? "true" : "false"
    });
    var ico = el("span", { class: "nav-ico", "aria-hidden": "true" });
    ico.innerHTML = navIconMarkup(ICONS[item.page] || ICONS.action);
    row.appendChild(ico);
    row.appendChild(el("span", { class: "palette-item-label" }, item.label));
    row.appendChild(el("span", { class: "palette-item-hint" }, item.hint));
    row.addEventListener("mouseenter", function () {
      paletteState.index = i;
      updatePaletteSelection();
    });
    row.addEventListener("click", function () { runPaletteItem(item); });
    list.appendChild(row);
  });
}

function updatePaletteSelection() {
  var rows = qsa("#paletteList .palette-item");
  rows.forEach(function (row, i) {
    row.setAttribute("aria-selected", i === paletteState.index ? "true" : "false");
    if (i === paletteState.index && row.scrollIntoView) {
      row.scrollIntoView({ block: "nearest" });
    }
  });
}

function runPaletteItem(item) {
  closePalette();
  if (!item) return;
  if (item.page) switchPage(item.page);
  else if (typeof item.run === "function") item.run();
}

function openPalette() {
  var overlay = qs("#paletteOverlay");
  var input = qs("#paletteInput");
  if (!overlay) return;
  paletteState.open = true;
  paletteState.index = 0;
  overlay.hidden = false;
  if (input) { input.value = ""; input.focus(); }
  renderPalette("");
}

function closePalette() {
  var overlay = qs("#paletteOverlay");
  paletteState.open = false;
  if (overlay) overlay.hidden = true;
}

function onPaletteKey(e) {
  if (e.key === "Escape") { e.preventDefault(); closePalette(); return; }
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    var count = paletteState.items.length;
    if (!count) return;
    paletteState.index = (paletteState.index + (e.key === "ArrowDown" ? 1 : -1) + count) % count;
    updatePaletteSelection();
    return;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    runPaletteItem(paletteState.items[paletteState.index]);
  }
}

function initPalette() {
  var trigger = qs("#paletteTrigger");
  if (trigger) trigger.addEventListener("click", openPalette);
  var overlay = qs("#paletteOverlay");
  if (overlay) overlay.addEventListener("mousedown", function (e) { if (e.target === overlay) closePalette(); });
  var input = qs("#paletteInput");
  if (input) {
    input.addEventListener("input", function () { paletteState.index = 0; renderPalette(input.value); });
    input.addEventListener("keydown", onPaletteKey);
  }
  document.addEventListener("keydown", function (e) {
    if (paletteState.open && e.key === "Escape") {
      e.preventDefault();
      closePalette();
      return;
    }
    if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === "k") {
      e.preventDefault();
      if (paletteState.open) closePalette(); else openPalette();
    }
  });
}

function safeRender(name) {
  try {
    if (!PAGES[name]) throw new Error("Страница не найдена: " + name);
    var node = PAGES[name].render();
    if (!node) throw new Error("Пустой результат рендера");
    if (node instanceof Promise) throw new Error("Async render");
    return node;
  } catch (e) {
    console.error("Render error:", name, e);
    var frag = document.createDocumentFragment();
    var card = UI.card("Ошибка: " + (PAGES[name] ? PAGES[name].title : name));
    card.appendChild(el("div", { style: "color:var(--red);font-size:12px;padding:10px;font-family:monospace;white-space:pre-wrap;" }, (e.message || String(e)) + "\n" + (e.stack || "")));
    frag.appendChild(card);
    return frag;
  }
}

function switchPage(name) {
  if (!PAGES[name]) name = "dashboard";
  if (name === "admin" && (!window.AdminPanel || !window.AdminPanel.isAdmin)) {
    name = "dashboard";
  }
  currentPage = name;
  qsa(".nav-btn").forEach(function (b) {
    var active = b.getAttribute("data-page") === name;
    b.classList.toggle("active", active);
    if (active) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
  var t = qs("#pageTitle");
  if (t) t.textContent = PAGES[name].title;
  var c = qs("#pageContent");
  if (!c) return;
  stopActiveGames();
  c.innerHTML = "";
  try { c.appendChild(safeRender(name)); }
  catch (e) { c.appendChild(el("div", { style: "padding:30px;color:var(--red);" }, "Ошибка: " + (e.message || e))); }
  c.classList.remove("page-enter");
  void c.offsetWidth;
  staggerChildren(c);
  c.classList.add("page-enter");
  countUpValues(c);
  var s = qs(".page-scroll");
  if (s) s.scrollTop = 0;
  location.hash = name;
  if (name === "about") {
    try { Store.set("visitedabout", true); if (typeof Achievements !== "undefined") Achievements.check(); } catch (e) {}
  }
  if (typeof updateSidebarPlan === "function") updateSidebarPlan();
}

function syncSidebarUser() {
  var nick = Store.get("nickname", "") || "";
  var avatar = Store.get("avatar", null);
  var email = (window.__fbAuth && window.__fbAuth.currentUser && window.__fbAuth.currentUser.email) || "";
  var nickEl = qs("#userNick");
  var emailEl = qs("#userEmailSmall");
  var avEl = qs("#sidebarAvatar");
  var badge = qs("#sidebarUserBadge");

  if (nickEl) nickEl.textContent = nick || "Гость";
  if (emailEl) emailEl.textContent = email || "—";
  if (avEl) {
    if (avatar && typeof avatar === "string" && avatar.indexOf("data:image") === 0) {
      avEl.style.backgroundImage = "url(" + avatar + ")";
      avEl.textContent = "";
    } else {
      avEl.style.backgroundImage = "";
      avEl.textContent = (nick || "?").charAt(0).toUpperCase();
    }
  }
  if (badge) {
    var plus = false;
    try { plus = typeof checkLicense === "function" ? checkLicense() === true : false; } catch (e) {}
    badge.className = "user-badge " + (plus ? "jetch" : "free");
    badge.textContent = plus ? "JETCH+" : "FREE";
    badge.style.display = "inline-flex";
  }
}

function updateSidebarPlan() {
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);
  var forever = Store.get("license.forever", false) === true;
  var expires = Store.get("license.expires", null);
  var t = qs("#planTitle"), i = qs("#planInfo"), v = qs("#planValue");
  var bar = qs(".plan-bar-fill");
  if (t) t.textContent = plus ? "JETCH+" : "FREE";
  if (plus) {
    if (forever) {
      if (i) i.textContent = "Бессрочно";
      if (v) v.textContent = "∞";
      if (bar) { bar.style.width = "100%"; bar.style.background = "linear-gradient(90deg, var(--gold), var(--yellow))"; }
    } else if (expires) {
      var expDate = new Date(expires);
      var daysLeft = Math.max(0, Math.ceil((expDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
      var dd = String(expDate.getDate()).padStart(2, "0");
      var mm = String(expDate.getMonth() + 1).padStart(2, "0");
      var yyyy = expDate.getFullYear();
      if (i) i.textContent = "до " + dd + "." + mm + "." + yyyy;
      var word = daysLeft === 1 ? "день" : (daysLeft < 5 ? "дня" : "дней");
      if (v) v.textContent = daysLeft + " " + word;
      if (bar) {
        var total = Math.max(7, daysLeft);
        var pct = Math.max(5, Math.min(100, Math.round((daysLeft / total) * 100)));
        bar.style.width = pct + "%";
        bar.style.background = daysLeft > 3 ? "linear-gradient(90deg, var(--gold), var(--yellow))" : "linear-gradient(90deg, var(--orange), var(--red))";
      }
    } else {
      if (i) i.textContent = "Активен";
      if (v) v.textContent = "∞";
      if (bar) bar.style.width = "100%";
    }
  } else {
    if (i) i.textContent = "5 анализов/день";
    var totalFree = 5;
    var rem = (typeof analyzeQuotaRemaining === "function") ? analyzeQuotaRemaining() : totalFree;
    if (v) v.textContent = String(rem) + " / " + totalFree;
    if (bar) {
      var pctF = Math.max(0, Math.min(100, (rem / totalFree) * 100));
      bar.style.width = pctF + "%";
      bar.style.background = pctF > 60 ? "linear-gradient(90deg, var(--accent), var(--cyan))" : pctF > 30 ? "linear-gradient(90deg, var(--yellow), var(--orange))" : "linear-gradient(90deg, var(--orange), var(--red))";
    }
  }
  if (typeof window.refreshUserUI === "function") { try { window.refreshUserUI(); } catch (e) {} }
  syncSidebarUser();
}

function buildGreeting() {
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);
  var forever = Store.get("license.forever", false) === true;
  var nick = Store.get("nickname", "") || "";
  var remain = (typeof analyzeQuotaRemaining === "function") ? analyzeQuotaRemaining() : 5;
  var hello = nick ? ("Привет, " + nick + "!") : "Добро пожаловать!";
  var status;
  if (plus && forever) status = "JETCH+ активен · безлимит";
  else if (plus) {
    var expires = Store.get("license.expires", null);
    if (expires) {
      var daysLeft = Math.max(0, Math.ceil((new Date(expires).getTime() - Date.now()) / (24 * 60 * 60 * 1000)));
      var word = daysLeft === 1 ? "день" : (daysLeft < 5 ? "дня" : "дней");
      status = "JETCH+ · осталось " + daysLeft + " " + word;
    } else status = "JETCH+ активен";
  } else if (remain > 0) status = "Сегодня доступно " + remain + " " + pluralAnalyses(remain);
  else status = "Лимит анализов на сегодня исчерпан";
  return hello + " " + status;
}

function pluralAnalyses(n) {
  if (n === 1) return "анализ";
  if (n >= 2 && n <= 4) return "анализа";
  return "анализов";
}

function renderLeaderboardPage() {
  var frag = document.createDocumentFragment();
  var placeholder = el("div", { id: "leaderboardPlaceholder", class: "card" });
  for (var i = 0; i < 5; i++) placeholder.appendChild(el("div", { class: "skeleton-row" }));
  frag.appendChild(placeholder);

  function fillPlaceholder(content) {
    placeholder.classList.remove("card");
    placeholder.innerHTML = "";
    if (content) placeholder.appendChild(content);
  }

  setTimeout(function () {
    if (typeof window.renderLeaderboard !== "function") {
      fillPlaceholder(el("div", { class: "dim", style: "font-size:12px;" }, "Модуль не загрузился."));
      return;
    }
    try {
      var result = window.renderLeaderboard();
      if (result && typeof result.then === "function") {
        result.then(function (card) { fillPlaceholder(card); })
          .catch(function (e) { fillPlaceholder(el("div", { style: "color:var(--red);font-size:12px;" }, "Ошибка: " + (e.message || e))); });
      } else {
        fillPlaceholder(result);
      }
    } catch (e) {
      fillPlaceholder(el("div", { style: "color:var(--red);font-size:12px;" }, "Ошибка: " + (e.message || e)));
    }
  }, 30);
  return frag;
}

function renderDashboard() {
  var frag = document.createDocumentFragment();
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);
  var nick = Store.get("nickname", "") || "";
  var remain = (typeof analyzeQuotaRemaining === "function") ? analyzeQuotaRemaining() : 5;
  var recent = Store.get("recentmatches", []) || [];
  var unlocked = Store.get("achievementsunlocked", []) || [];
  var analyzed = Store.get("analyzedcount", 0) || 0;
  var streak = Store.get("dailystreak", 0) || 0;

  /* Шапка: приветствие, статус и быстрые действия */
  var head = el("div", { class: "dash-head" });
  var headMain = el("div", { class: "dash-head-main" });
  headMain.appendChild(el("h1", { class: "dash-greeting" }, nick ? "Привет, " + nick : "Добро пожаловать"));
  headMain.appendChild(el("p", { class: "dash-sub" }, buildStatusLine(plus, remain)));
  var actions = el("div", { class: "dash-actions" });
  actions.appendChild(UI.btn("Анализировать матч", { onclick: function () { switchPage("analyze"); } }));
  actions.appendChild(UI.btn("Открыть профиль", { variant: "ghost", onclick: function () { switchPage("profile"); } }));
  headMain.appendChild(actions);
  head.appendChild(headMain);

  var quota = el("div", { class: "dash-quota" });
  quota.appendChild(el("div", { class: "quota-label" }, plus ? "JETCH+" : "FREE"));
  quota.appendChild(el("div", { class: "quota-value" }, plus ? "∞" : String(remain)));
  quota.appendChild(el("div", { class: "quota-hint" }, plus ? "безлимит анализов" : "анализов осталось"));
  head.appendChild(quota);
  frag.appendChild(head);

  (function () {
    try {
      var db = window.__fbDB;
      if (!db) return;
      if (typeof notificationUnsubscribe === "function") notificationUnsubscribe();
      notificationUnsubscribe = db.onValue(db.ref(db.db, "config/notification"), function (snap) {
        if (currentPage !== "dashboard") return;
        var n = snap.val();
        var existing = document.getElementById("globalNotifBox");
        if (n && n.enabled && n.text) {
          if (existing) {
            existing.textContent = n.text;
          } else {
            var box = document.createElement("div");
            box.id = "globalNotifBox";
            box.className = "notice";
            box.textContent = n.text;
            var wrap = document.getElementById("pageContent");
            if (wrap) wrap.insertBefore(box, wrap.firstChild);
          }
        } else if (existing) {
          existing.remove();
        }
      });
    } catch (e) {}
  })();

  /* Ключевые показатели */
  var kpiRow = el("div", { class: "kpi-row" });
  [
    { label: "Анализов", value: String(analyzed), sub: "за всё время" },
    { label: "Достижения", value: unlocked.length + " / " + ACHIEVEMENTS.length, sub: "открыто" },
    { label: "Стрик", value: String(streak), sub: streak === 1 ? "день подряд" : "дней подряд" },
    { label: "История", value: String(recent.length), sub: "матчей сохранено" }
  ].forEach(function (item) {
    var kpi = el("div", { class: "kpi" });
    kpi.appendChild(el("div", { class: "kpi-label" }, item.label));
    kpi.appendChild(el("div", { class: "kpi-value" }, item.value));
    kpi.appendChild(el("div", { class: "kpi-sub" }, item.sub));
    kpiRow.appendChild(kpi);
  });
  frag.appendChild(kpiRow);

  /* Две колонки */
  var cols = el("div", { class: "dash-cols" });
  var colMain = el("div", { class: "dash-col" });
  var colSide = el("div", { class: "dash-col" });

  if (typeof renderDailyWidget === "function") {
    try { colMain.appendChild(renderDailyWidget()); } catch (e) { console.warn("daily widget:", e); }
  }

  if (typeof lastAnalysis !== "undefined" && lastAnalysis && lastAnalysis.hero) {
    var last = el("div", { class: "card" });
    var lastHead = el("div", { class: "card-title" }, "Последний матч");
    last.appendChild(lastHead);
    var lrow = el("div", { class: "match-row" });
    lrow.appendChild(heroImgEl(lastAnalysis.hero, 36));
    var linfo = el("div", { class: "match-info" });
    linfo.appendChild(el("div", { class: "match-hero" }, lastAnalysis.hero.name));
    linfo.appendChild(el("div", { class: "match-meta" },
      lastAnalysis.player.kills + " / " + lastAnalysis.player.deaths + " / " + lastAnalysis.player.assists +
      " · " + (lastAnalysis.won ? "победа" : "поражение")));
    lrow.appendChild(linfo);
    lrow.appendChild(el("span", { class: "badge " + (lastAnalysis.won ? "badge-win" : "badge-loss") },
      lastAnalysis.won ? "Победа" : "Поражение"));
    last.appendChild(lrow);
    colMain.appendChild(last);
  }

  colMain.appendChild(buildRecentMatchesCard(recent));

  if (typeof window.renderRatingWidget === "function") {
    try { var rw = window.renderRatingWidget(); if (rw) colSide.appendChild(rw); }
    catch (e) { console.warn("rating widget:", e); }
  }

  colSide.appendChild(buildProgressCard(unlocked, analyzed));

  cols.appendChild(colMain);
  cols.appendChild(colSide);
  frag.appendChild(cols);

  return frag;
}

function buildStatusLine(plus, remain) {
  if (plus) return "Подписка активна — анализы без ограничений.";
  if (remain > 0) return "Сегодня доступно " + remain + " " + pluralAnalyses(remain) + ".";
  return "Лимит анализов на сегодня исчерпан.";
}

function buildRecentMatchesCard(list) {
  var card = el("div", { class: "card" });
  var head = el("div", { class: "card-title" }, "Последние матчи");
  card.appendChild(head);

  if (!list.length) {
    var empty = el("div", { class: "empty-state" });
    empty.appendChild(el("div", { class: "empty-title" }, "Пока пусто"));
    empty.appendChild(el("div", { class: "empty-sub" }, "Разбери первый матч — он появится здесь."));
    var go = UI.btn("Разобрать матч", { variant: "ghost", onclick: function () { switchPage("analyze"); } });
    empty.appendChild(go);
    card.appendChild(empty);
    return card;
  }

  var rows = el("div", { class: "match-list" });
  list.slice(0, 5).forEach(function (m) {
    var row = el("div", { class: "match-row" });
    row.appendChild(heroImgEl({ id: m.heroId, name: m.heroName, slug: m.heroSlug }, 32));
    var info = el("div", { class: "match-info" });
    info.appendChild(el("div", { class: "match-hero" }, m.heroName || "Герой"));
    info.appendChild(el("div", { class: "match-meta" },
      (m.kills || 0) + " / " + (m.deaths || 0) + " / " + (m.assists || 0) +
      " · " + Math.round(m.durMin || 0) + " мин"));
    row.appendChild(info);
    row.appendChild(el("span", { class: "badge " + (m.won ? "badge-win" : "badge-loss") }, m.won ? "W" : "L"));
    rows.appendChild(row);
  });
  card.appendChild(rows);

  var foot = el("div", { class: "card-foot" });
  var all = el("button", { class: "link-btn", type: "button" }, "Вся история");
  all.addEventListener("click", function () { switchPage("history"); });
  foot.appendChild(all);
  card.appendChild(foot);
  return card;
}

function buildProgressCard(unlocked, analyzed) {
  var card = el("div", { class: "card" });
  card.appendChild(el("div", { class: "card-title" }, "Прогресс аккаунта"));

  var total = ACHIEVEMENTS.length;
  var pct = total ? Math.round((unlocked.length / total) * 100) : 0;
  var bar = el("div", { class: "progress-line" });
  var fill = el("div", { class: "progress-fill" });
  fill.style.width = pct + "%";
  bar.appendChild(fill);
  card.appendChild(bar);
  card.appendChild(el("div", { class: "progress-caption" }, "Достижения " + unlocked.length + " из " + total + " · " + pct + "%"));

  card.appendChild(el("div", { class: "progress-caption" }, "Разобрано матчей: " + analyzed));

  var foot = el("div", { class: "card-foot" });
  var btn = el("button", { class: "link-btn", type: "button" }, "Все достижения");
  btn.addEventListener("click", function () { switchPage("achievements"); });
  foot.appendChild(btn);
  card.appendChild(foot);
  return card;
}

function renderChartsPage() {
  try { if (typeof Daily !== "undefined") Daily.bump("chart"); } catch (e) {}
  if (typeof Charts === "undefined") return UI.card("Прогресс");
  return Charts.render();
}

function renderAbout() {
  var frag = document.createDocumentFragment();
  var head = UI.card("");
  head.appendChild(el("div", { style: "font-size:20px;font-weight:bold;color:var(--accent-light);" }, "DOTA JETCH"));
  head.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-top:6px;" }, "Version " + APP_VERSION));
  frag.appendChild(head);
  var feat = UI.card("Возможности");
  var list = [
    "Анализ матчей с оценкой S/A/B/C/D",
    "Личный профиль с аналитикой (JETCH+)",
    "История и графики",
    "Дневник",
    "Мини-игры: Взлом замка, Атака автоматонов, Дири-Джампер, Викторина",
    "Рейтинг и медали",
    "Лидерборд",
    "Достижения (" + ACHIEVEMENTS.length + ")",
    "Ник + аватар + облачная синхронизация"
  ];
  for (var i = 0; i < list.length; i++) {
    feat.appendChild(el("div", { style: "padding:4px 0;font-size:12px;color:var(--text-muted);" }, "• " + list[i]));
  }
  frag.appendChild(feat);
  return frag;
}

function resizeImage(file, maxSize, cb) {
  var reader = new FileReader();
  reader.onload = function (ev) {
    var img = new Image();
    img.onload = function () {
      try {
        var canvas = document.createElement("canvas");
        canvas.width = maxSize; canvas.height = maxSize;
        var ctx = canvas.getContext("2d");
        var s = Math.min(img.width, img.height);
        var sx = (img.width - s) / 2, sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, 0, 0, maxSize, maxSize);
        cb(canvas.toDataURL("image/jpeg", 0.85));
      } catch (e) { cb(null); }
    };
    img.onerror = function () { cb(null); };
    img.src = String(ev.target.result);
  };
  reader.onerror = function () { cb(null); };
  reader.readAsDataURL(file);
}

function hasAvatar() {
  var av = Store.get("avatar", null);
  return !!(av && typeof av === "string" && av.indexOf("data:image") === 0);
}

function renderAvatarInto(el, nick) {
  if (hasAvatar()) {
    el.style.backgroundImage = "url(" + Store.get("avatar", "") + ")";
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.textContent = "";
  } else {
    el.style.backgroundImage = "";
    el.textContent = String(nick || "?").charAt(0).toUpperCase() || "?";
  }
}

function getNickCooldownLeft() {
  if (typeof window.nicknameCooldownDaysLeft === "function") return window.nicknameCooldownDaysLeft();
  return 0;
}

function buildNickLockBlock() {
  var wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;align-items:center;gap:11px;padding:11px 14px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;";
  var ico = document.createElement("div");
  ico.style.cssText = "width:30px;height:30px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(251,191,36,0.10);border:1px solid rgba(251,191,36,0.28);color:var(--gold);font-size:14px;font-weight:700;line-height:1;";
  ico.textContent = "⏳";
  var body = document.createElement("div");
  body.style.cssText = "flex:1;min-width:0;";
  var title = document.createElement("div");
  title.style.cssText = "font-size:12px;font-weight:600;color:var(--text);line-height:1.3;";
  title.textContent = "Смена ника недоступна";
  var sub = document.createElement("div");
  sub.style.cssText = "font-size:10.5px;color:var(--text-dim);margin-top:3px;line-height:1.35;letter-spacing:0.01em;";
  sub.id = "nickCooldownTimer";
  function updateTimerText() {
    var days = getNickCooldownLeft();
    if (days <= 0) { sub.textContent = "Можно сменить ник"; return; }
    var word = days === 1 ? "день" : (days < 5 ? "дня" : "дней");
    sub.textContent = "Раз в 30 дней · осталось " + days + " " + word;
  }
  updateTimerText();
  if (window.__nickTimer) clearInterval(window.__nickTimer);
  window.__nickTimer = setInterval(function () {
    if (!document.getElementById("nickCooldownTimer")) { clearInterval(window.__nickTimer); window.__nickTimer = null; return; }
    updateTimerText();
  }, 60000);
  body.appendChild(title); body.appendChild(sub);
  wrap.appendChild(ico); wrap.appendChild(body);
  return wrap;
}

function renderNickSection() {
  var container = document.getElementById("profileNickSection");
  if (!container) return;
  container.innerHTML = "";
  var daysLeft = getNickCooldownLeft();
  if (daysLeft > 0) { container.appendChild(buildNickLockBlock()); return; }
  var changeBtn = document.createElement("button");
  changeBtn.type = "button"; changeBtn.className = "btn btn-ghost";
  changeBtn.style.width = "100%"; changeBtn.style.marginBottom = "12px";
  changeBtn.textContent = "Сменить ник";
  var form = document.createElement("div");
  form.style.cssText = "display:none;margin-bottom:12px;padding:12px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;";
  form.innerHTML = '<input type="text" id="profileNickInput" class="input" maxlength="20" placeholder="Новый ник (3-20, A-Z 0-9 _)" style="margin-bottom:8px;">' +
    '<div id="profileNickMsg" style="font-size:11px;min-height:14px;margin-bottom:8px;"></div>' +
    '<div style="display:flex;gap:8px;"><button id="profileNickSaveBtn" class="btn" type="button">Сохранить</button><button id="profileNickCancelBtn" class="btn btn-ghost" type="button">Отмена</button></div>' +
    '<div class="dim" style="font-size:10px;margin-top:10px;line-height:1.5;">После смены ник нельзя будет изменить в течение 30 дней.</div>';
  changeBtn.addEventListener("click", function () {
    form.style.display = form.style.display === "none" ? "block" : "none";
    var inp = document.getElementById("profileNickInput");
    var msg = document.getElementById("profileNickMsg");
    if (msg) msg.textContent = "";
    if (inp) { inp.value = ""; inp.focus(); }
  });
  container.appendChild(changeBtn); container.appendChild(form);
  setTimeout(function () {
    var saveBtn = document.getElementById("profileNickSaveBtn");
    var cancelBtn = document.getElementById("profileNickCancelBtn");
    var inp = document.getElementById("profileNickInput");
    var msg = document.getElementById("profileNickMsg");
    if (cancelBtn) cancelBtn.addEventListener("click", function () { form.style.display = "none"; if (msg) msg.textContent = ""; if (inp) inp.value = ""; });
    if (saveBtn) saveBtn.addEventListener("click", async function () {
      if (!msg) return;
      msg.style.color = "var(--text-muted)"; msg.textContent = "Проверяю...";
      if (typeof window.changeNickname !== "function") { msg.style.color = "var(--red)"; msg.textContent = "Функция недоступна."; return; }
      var val = inp ? inp.value : "";
      var res = await window.changeNickname(val);
      if (res.ok) {
        msg.style.color = "var(--green)"; msg.textContent = "✓ " + res.msg;
        var nickEl = document.getElementById("profileModalNick");
        if (nickEl) nickEl.textContent = Store.get("nickname", "—");
        if (typeof window.refreshUserUI === "function") window.refreshUserUI();
        setTimeout(function () { renderNickSection(); }, 1500);
      } else { msg.style.color = "var(--red)"; msg.textContent = "✕ " + res.msg; }
    });
  }, 0);
}

function updateProfileModal() {
  var nick = Store.get("nickname", "") || "—";
  var email = (window.__fbAuth && window.__fbAuth.currentUser && window.__fbAuth.currentUser.email) || "—";
  var nickEl = document.getElementById("profileModalNick");
  var emailEl = document.getElementById("profileModalEmail");
  var avEl = document.getElementById("profileAvatarBig");
  var statsEl = document.getElementById("profileModalStats");
  var resetBtn = document.getElementById("profileResetAvatarBtn");
  if (nickEl) nickEl.textContent = nick;
  if (emailEl) emailEl.textContent = email;
  if (avEl) renderAvatarInto(avEl, nick);
  if (resetBtn) resetBtn.classList.toggle("visible", hasAvatar());
  if (statsEl) {
    statsEl.innerHTML = "";
    var achs = (Store.get("achievementsunlocked", []) || []).length;
    var analyzed = Store.get("analyzedcount", 0) || 0;
    var mmr = Store.get("minigames_mmr", 0) || 0;
    var cells = [
      { v: String(analyzed), l: "Матчей" },
      { v: achs + "/" + ACHIEVEMENTS.length, l: "Ачивок" },
      { v: String(mmr), l: "MMR" }
    ];
    for (var i = 0; i < cells.length; i++) {
      var c = document.createElement("div"); c.className = "profile-stat-cell";
      var vEl = document.createElement("div"); vEl.className = "profile-stat-value"; vEl.textContent = cells[i].v;
      var lEl = document.createElement("div"); lEl.className = "profile-stat-label"; lEl.textContent = cells[i].l;
      c.appendChild(vEl); c.appendChild(lEl); statsEl.appendChild(c);
    }
  }
  renderNickSection();
}

window.openProfileModal = function () {
  var ov = document.getElementById("profileModalOverlay");
  if (!ov) return;
  updateProfileModal();
  if (typeof window.refreshUserUI === "function") { try { window.refreshUserUI(); } catch (e) {} }
  ov.style.display = "flex";
  document.body.style.overflow = "hidden";
};

window.closeProfileModal = function () {
  var ov = document.getElementById("profileModalOverlay");
  if (!ov) return;
  ov.style.display = "none";
  document.body.style.overflow = "";
};

window.triggerAvatarUpload = function () {
  var inp = document.getElementById("avatarFileInput");
  if (inp) inp.click();
};

function bindProfileModal() {
  var ov = document.getElementById("profileModalOverlay");
  if (!ov) return;
  ov.addEventListener("click", function (e) { if (e.target === ov) window.closeProfileModal(); });
  var closeBtn = ov.querySelector(".profile-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", window.closeProfileModal);
  var fileInp = document.getElementById("avatarFileInput");
  if (fileInp && !fileInp.__bound) {
    fileInp.__bound = true;
    fileInp.addEventListener("change", function () {
      var f = fileInp.files && fileInp.files[0];
      if (!f) return;
      if (!/^image\//.test(f.type)) { alert("Выбери картинку."); fileInp.value = ""; return; }
      if (f.size > 5 * 1024 * 1024) { alert("Файл слишком большой (макс 5 МБ)."); fileInp.value = ""; return; }
      resizeImage(f, 128, function (dataUrl) {
        fileInp.value = "";
        if (!dataUrl) { alert("Не удалось обработать."); return; }
        if (typeof window.changeAvatar !== "function") { alert("Функция недоступна."); return; }
        var res = window.changeAvatar(dataUrl);
        if (res.ok) { updateProfileModal(); if (typeof window.refreshUserUI === "function") window.refreshUserUI(); }
        else alert("Ошибка: " + res.msg);
      });
    });
  }
  var resetBtn = document.getElementById("profileResetAvatarBtn");
  if (resetBtn && !resetBtn.__bound) {
    resetBtn.__bound = true;
    resetBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!hasAvatar()) return;
      if (!confirm("Убрать аватар?")) return;
      Store.set("avatar", null);
      if (typeof window.syncPublicProfile === "function") window.syncPublicProfile();
      updateProfileModal();
      if (typeof window.refreshUserUI === "function") window.refreshUserUI();
    });
  }
  var logoutBtn = document.getElementById("profileLogoutBtn");
  if (logoutBtn && !logoutBtn.__bound) {
    logoutBtn.__bound = true;
    logoutBtn.addEventListener("click", async function () {
      if (!confirm("Выйти из аккаунта?")) return;
      window.closeProfileModal();
      if (window.__fbSignOut) await window.__fbSignOut();
      else alert("Перезагрузи страницу.");
    });
  }
}

async function init() {
  try { if (typeof applyThemeVars === "function") applyThemeVars(loadTheme()); } catch (e) {}
  try { if (typeof applyLiteModeVisual === "function") applyLiteModeVisual(isLiteMode()); } catch (e) {}
  initSyncIndicator();

  /* Проверка прав администратора ДО построения навигации */
  if (window.AdminPanel && typeof window.AdminPanel.checkAdmin === "function") {
    try {
      await window.AdminPanel.checkAdmin();
      console.log("[INIT] checkAdmin completed, isAdmin =", window.AdminPanel.isAdmin);
    } catch (e) { console.warn("[INIT] checkAdmin error:", e); }
  }

  buildNav();

  /* Дополнительно: если isAdmin стал true позже, перестроим навигацию */
  setTimeout(function () {
    if (window.AdminPanel && window.AdminPanel.isAdmin === true) {
      console.log("[INIT] isAdmin true in timeout, rebuilding nav");
      buildNav();
    }
  }, 1500);

  document.addEventListener("click", function () { if (typeof closeAllDropdowns === "function") closeAllDropdowns(); });
  initPalette();
  initMotion();
  initBackground();
  bindProfileModal();

  var brand = qs(".brand");
  if (brand && !brand.__bound) {
    brand.__bound = true;
    brand.style.cursor = "pointer";
    brand.setAttribute("role", "button");
    brand.setAttribute("tabindex", "0");
    brand.setAttribute("title", "На главную");
    brand.addEventListener("click", function () { switchPage("dashboard"); });
    brand.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); switchPage("dashboard"); }
    });
  }
  try { Store.set("sessions", (Store.get("sessions", 0) || 0) + 1); } catch (e) {}
  var h = (location.hash || "#dashboard").slice(1);
  switchPage(PAGES[h] ? h : "dashboard");
  if (typeof updateSidebarPlan === "function") updateSidebarPlan();
  try { if (typeof Achievements !== "undefined") Achievements.check(); } catch (e) {}
  syncSidebarUser();
  appInitialized = true;
  console.log("DOTA JETCH v" + APP_VERSION + " init");
}

/* После загрузки облачных данных перерисовываем текущую страницу
   без полной перезагрузки приложения. */
window.addEventListener("jetch:syncready", function () {
  if (!appInitialized) return;
  if (typeof updateSidebarPlan === "function") { try { updateSidebarPlan(); } catch (e) {} }
  if (PAGES[currentPage]) {
    try { switchPage(currentPage); } catch (e) { console.warn("syncready rerender:", e); }
  }
});

if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", init);
else setTimeout(init, 0);

window.addEventListener("hashchange", function () {
  var h = (location.hash || "#dashboard").slice(1);
  if (h !== currentPage && PAGES[h]) switchPage(h);
});

console.log("app v19.0 ready");
