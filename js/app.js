/* DOTA JETCH — APP v8.2
   - Убрана вкладка «Экспорт» из PAGES и NAV
   - Добавлен трекинг «О программе» для ачивки «Любопытный» */

var APP_VERSION = "8.2";

var PAGES = {
  dashboard:    { title: "Главная",         render: renderDashboard },
  analyze:      { title: "Анализ матча",    render: renderAnalyze },
  chat:         { title: "ИИ-ассистент",    render: renderChat },
  history:      { title: "История",         render: renderHistory },
  charts:       { title: "Прогресс",        render: renderChartsPage },
  diary:        { title: "Дневник",         render: renderDiary },
  games:        { title: "Мини-игры",       render: renderGames },
  achievements: { title: "Достижения",      render: renderAchievements },
  settings:     { title: "Настройки",       render: renderSettings },
  about:        { title: "О программе",     render: renderAbout }
};

var NAV = [
  { page: "dashboard",    label: "Главная",       icon: "◈" },
  { page: "analyze",      label: "Анализ матча",  icon: "▶" },
  { page: "chat",         label: "ИИ-ассистент",  icon: "✦" },
  { page: "history",      label: "История",       icon: "☰" },
  { page: "charts",       label: "Прогресс",      icon: "◱" },
  { page: "diary",        label: "Дневник",       icon: "✎" },
  { page: "games",        label: "Мини-игры",     icon: "◉" },
  { page: "achievements", label: "Достижения",    icon: "★" },
  { page: "settings",     label: "Настройки",     icon: "⚙" },
  { page: "about",        label: "О программе",   icon: "ⓘ" }
];

var currentPage = "dashboard";

function buildNav() {
  var nav = qs("#sidebarNav");
  if (!nav) return;
  nav.innerHTML = "";
  for (var i = 0; i < NAV.length; i++) {
    (function (item) {
      var btn = el("button", { class: "nav-btn" + (item.page === currentPage ? " active" : ""), "data-page": item.page });
      btn.appendChild(el("span", { class: "nav-ico" }, item.icon));
      btn.appendChild(document.createTextNode(item.label));
      btn.addEventListener("click", function () { switchPage(item.page); });
      nav.appendChild(btn);
    })(NAV[i]);
  }
}

function safeRender(name) {
  try {
    if (!PAGES[name]) throw new Error("Страница не найдена: " + name);
    var node = PAGES[name].render();
    if (!node) throw new Error("Пустой результат рендера");
    return node;
  } catch (e) {
    console.error("Render error:", name, e);
    var frag = document.createDocumentFragment();
    var card = UI.card("Ошибка: " + (PAGES[name] ? PAGES[name].title : name));
    card.appendChild(el("div", { style: "color:var(--red);font-size:12px;padding:10px;font-family:monospace;" }, e.message || String(e)));
    frag.appendChild(card);
    return frag;
  }
}

function switchPage(name) {
  if (!PAGES[name]) name = "dashboard";
  currentPage = name;
  qsa(".nav-btn").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-page") === name);
  });
  var t = qs("#pageTitle");
  if (t) t.textContent = PAGES[name].title;
  var c = qs("#pageContent");
  if (!c) return;
  c.innerHTML = "";
  try { c.appendChild(safeRender(name)); }
  catch (e) { c.appendChild(el("div", { style: "padding:30px;color:var(--red);" }, "Ошибка: " + (e.message || e))); }
  var s = qs(".page-scroll");
  if (s) s.scrollTop = 0;
  location.hash = name;

  /* Задание дня «Открой графики» */
  if (name === "charts" && typeof Daily !== "undefined") {
    try { Daily.bump("chart"); } catch (e) {}
  }

  /* Ачивка «Любопытный» — открыл «О программе» */
  if (name === "about") {
    try {
      Store.set("visitedabout", true);
      if (typeof Achievements !== "undefined") Achievements.check();
    } catch (e) {}
  }

  if (typeof updateSidebarPlan === "function") updateSidebarPlan();
}

function updateSidebarPlan() {
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);
  var t = qs("#planTitle"), i = qs("#planInfo"), v = qs("#planValue");
  var bar = qs(".plan-bar-fill");

  if (t) t.textContent = plus ? "JETCH+" : "FREE";
  if (i) i.textContent = plus ? "Бессрочно" : "5 анализов/день";

  var total = 5;
  var rem = plus ? total : ((typeof analyzeQuotaRemaining === "function") ? analyzeQuotaRemaining() : total);

  if (v) v.textContent = plus ? "∞" : String(rem) + " / " + total;

  if (bar) {
    var pct = plus ? 100 : Math.max(0, Math.min(100, (rem / total) * 100));
    bar.style.width = pct + "%";
    bar.style.background = plus
      ? "linear-gradient(90deg, var(--gold), var(--yellow))"
      : (pct > 60 ? "linear-gradient(90deg, var(--accent), var(--cyan))"
        : pct > 30 ? "linear-gradient(90deg, var(--yellow), var(--orange))"
        : "linear-gradient(90deg, var(--orange), var(--red))");
  }
}

function renderDashboard() {
  var frag = document.createDocumentFragment();
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);

  frag.appendChild(UI.heroBanner(
    "DOTA JETCH",
    plus ? "AI 2.0 активен" : "Веб-версия",
    [
      UI.btn("Анализ матча", { onclick: function () { switchPage("analyze"); } }),
      UI.btn("Мини-игры", { onclick: function () { switchPage("games"); }, variant: "ghost" }),
      UI.btn("Прогресс", { onclick: function () { switchPage("charts"); }, variant: "ghost" })
    ]
  ));

  if (typeof renderDailyWidget === "function") {
    try { frag.appendChild(renderDailyWidget()); } catch (e) {}
  }

  var stats = el("div", { class: "stat-grid" });
  var left = typeof analyzeQuotaRemaining === "function" ? (plus ? "∞" : String(analyzeQuotaRemaining())) : "-";
  stats.appendChild(UI.statCard("S", "var(--cyan)", "var(--cyan-bg)", "Сессий", String(Store.get("sessions", 0)), "Всего"));
  stats.appendChild(UI.statCard("A", "var(--accent-light)", "var(--accent-bg)", "Анализов", left, plus ? "JETCH+" : "из 5"));
  stats.appendChild(UI.statCard("T", "var(--yellow)", "var(--yellow-bg)", "Ачивки", (Store.get("achievementsunlocked", []) || []).length + " / 24", "Открыто"));
  frag.appendChild(stats);

  var s2 = el("div", { class: "stat-grid" });
  s2.appendChild(UI.statCard("D", "var(--cyan)", "var(--cyan-bg)", "Дневник", String((Store.get("diarynotes", []) || []).length), "Записей"));
  s2.appendChild(UI.statCard("F", "var(--orange)", "var(--orange-bg)", "Стрик", String(Store.get("dailystreak", 0) || 0), "дней"));
  s2.appendChild(UI.statCard("H", "var(--green)", "var(--green-bg)", "История", String((Store.get("recentmatches", []) || []).length), "Матчей"));
  frag.appendChild(s2);

  if (typeof lastAnalysis !== "undefined" && lastAnalysis && lastAnalysis.hero) {
    var last = UI.card("Последний матч");
    var row = el("div", { style: "display:flex;align-items:center;gap:14px;" });
    row.appendChild(heroImgEl(lastAnalysis.hero, 56));
    var info = el("div", { style: "flex:1;" });
    info.appendChild(el("div", { style: "font-size:15px;font-weight:bold;" }, lastAnalysis.hero.name));
    info.appendChild(el("div", { class: "muted", style: "font-size:11px;margin-top:4px;" },
      lastAnalysis.player.kills + "/" + lastAnalysis.player.deaths + "/" + lastAnalysis.player.assists + " — " + (lastAnalysis.won ? "победа" : "поражение")));
    row.appendChild(info);
    last.appendChild(row);
    frag.appendChild(last);
  }

  return frag;
}

function renderChartsPage() {
  try { if (typeof Daily !== "undefined") Daily.bump("chart"); } catch (e) {}
  if (typeof Charts === "undefined") return UI.card("Прогресс");
  return Charts.render();
}

function renderAbout() {
  var frag = document.createDocumentFragment();
  var head = UI.card("");
  head.appendChild(el("div", { style: "font-size:20px;font-weight:bold;color:var(--accent-light);" }, "DOTA JETCH AI 2.0"));
  head.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-top:6px;" }, "Version " + APP_VERSION));
  frag.appendChild(head);
  var feat = UI.card("Возможности");
  var list = [
    "Анализ матчей с оценкой S/A/B/C/D",
    "ИИ-ассистент (JETCH+)",
    "История и графики",
    "Дневник",
    "Достижения (24)",
    "Мини-игры",
    "Система ключей JETCH+",
    "Firebase-синхронизация"
  ];
  for (var i = 0; i < list.length; i++) {
    feat.appendChild(el("div", { style: "padding:4px 0;font-size:12px;color:var(--text-muted);" }, "• " + list[i]));
  }
  frag.appendChild(feat);
  return frag;
}

function init() {
  try { if (typeof applyTheme === "function") applyTheme(loadTheme()); } catch (e) {}
  try { if (typeof applyLiteMode === "function") applyLiteMode(isLiteMode()); } catch (e) {}

  buildNav();

  document.addEventListener("click", function () {
    if (typeof closeAllDropdowns === "function") closeAllDropdowns();
  });

  try { Store.set("sessions", (Store.get("sessions", 0) || 0) + 1); } catch (e) {}

  var h = (location.hash || "#dashboard").slice(1);
  switchPage(PAGES[h] ? h : "dashboard");

  if (typeof updateSidebarPlan === "function") updateSidebarPlan();
  try { if (typeof Achievements !== "undefined") Achievements.check(); } catch (e) {}

  console.log("DOTA JETCH v" + APP_VERSION + " init");
}

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", init);
} else {
  setTimeout(init, 0);
}

window.addEventListener("hashchange", function () {
  var h = (location.hash || "#dashboard").slice(1);
  if (h !== currentPage && PAGES[h]) switchPage(h);
});
