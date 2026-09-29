var PAGES = {
  dashboard: { title: "Главная", render: renderDashboard },
  analyze: { title: "Анализ матча", render: renderAnalyze },
  chat: { title: "ИИ-ассистент", render: renderChat },
  history: { title: "История", render: renderHistory },
  charts: { title: "Прогресс", render: renderChartsPage },
  diary: { title: "Дневник", render: renderDiary },
  games: { title: "Мини-игры", render: renderGames },
  achievements: { title: "Достижения", render: renderAchievements },
  export: { title: "Экспорт / Импорт", render: renderExportPage },
  settings: { title: "Настройки", render: renderSettings },
  about: { title: "О программе", render: renderAbout }
};

var currentPage = "dashboard";

var NAV = [
  { page: "dashboard", label: "Главная", icon: "M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" },
  { page: "analyze", label: "Анализ", icon: "M5 3l14 9-14 9z" },
  { page: "chat", label: "ИИ", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { page: "history", label: "История", icon: "M3 6h18M3 12h18M3 18h18" },
  { page: "charts", label: "Прогресс", icon: "M3 3v18h18M7 14l3-3 4 4 5-6" },
  { page: "diary", label: "Дневник", icon: "M4 4h12l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" },
  { page: "games", label: "Игры", icon: "M3 7h18v12H3z" },
  { page: "achievements", label: "Ачивки", icon: "M12 9m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0" },
  { page: "export", label: "Экспорт", icon: "M12 3v12M8 7l4-4 4 4" },
  { page: "settings", label: "Настройки", icon: "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" },
  { page: "about", label: "О программе", icon: "M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0" }
];

function buildNav() {
  var nav = qs("#sidebarNav");
  if (!nav) return;
  nav.innerHTML = "";
  for (var i = 0; i < NAV.length; i++) {
    (function (item) {
      var btn = el("button", { class: "nav-btn" + (item.page === currentPage ? " active" : ""), "data-page": item.page });
      var ico = el("span", { class: "nav-ico" });
      ico.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + item.icon + '"/></svg>';
      btn.appendChild(ico);
      btn.appendChild(document.createTextNode(item.label));
      btn.addEventListener("click", function () { switchPage(item.page); });
      nav.appendChild(btn);
    })(NAV[i]);
  }
}

function safeRender(name) {
  try {
    if (!PAGES[name]) throw new Error("Страница: " + name);
    var n = PAGES[name].render();
    if (!n) throw new Error("Пустой результат");
    return n;
  } catch (e) {
    console.error("Render error:", name, e);
    var frag = document.createDocumentFragment();
    var card = UI.card("Ошибка: " + PAGES[name].title);
    card.appendChild(el("div", { style: "color:var(--red);font-size:12px;padding:10px;font-family:monospace;" }, e.message || String(e)));
    frag.appendChild(card);
    return frag;
  }
}

function switchPage(name) {
  if (!PAGES[name]) name = "dashboard";
  currentPage = name;
  qsa(".nav-btn").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-page") === name); });
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
}

function renderChartsPage() {
  try { if (typeof Daily !== "undefined") Daily.bump("chart"); } catch (e) {}
  if (typeof Charts === "undefined") return UI.card("Прогресс");
  return Charts.render();
}

function renderDashboard() {
  var frag = document.createDocumentFragment();
  var plus = Store.get("license.active", false) === true;
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
  stats.appendChild(UI.statCard("A", "var(--accent-light)", "var(--accent-bg)", "Анализов сегодня", left, plus ? "JETCH+" : "из 5"));
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
      lastAnalysis.player.kills + "/" + lastAnalysis.player.deaths + "/" + lastAnalysis.player.assists + " - " + (lastAnalysis.won ? "победа" : "поражение")));
    row.appendChild(info);
    last.appendChild(row);
    frag.appendChild(last);
  }
  return frag;
}

function isLiteMode() { return Store.get("litemode", false) === true; }

function applyLiteMode(on) {
  if (on) document.body.classList.add("lite-mode");
  else document.body.classList.remove("lite-mode");
  Store.set("litemode", !!on);
}

/* ═════ CUSTOM DROPDOWN ═════ */

function makeDropdown(opts, currentValue, onChange) {
  var wrap = el("div", { class: "dropdown", id: opts.id || "" });
  var btn = el("button", { class: "dropdown-btn", type: "button" });
  var label = el("span", { class: "dropdown-label" });
  var arrow = el("span", { class: "dropdown-arrow" });
  arrow.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  btn.appendChild(label);
  btn.appendChild(arrow);
  wrap.appendChild(btn);

  var list = el("div", { class: "dropdown-list" });

  function setLabel(v) {
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === v) { label.textContent = opts[i].label; return; }
    }
    label.textContent = v;
  }
  setLabel(currentValue);

  for (var i = 0; i < opts.length; i++) {
    (function (o) {
      var item = el("button", { class: "dropdown-item" + (o.value === currentValue ? " active" : ""), type: "button" });
      if (o.color) item.appendChild(el("span", { class: "dropdown-dot", style: "background:" + o.color + ";" }));
      item.appendChild(el("span", { class: "dropdown-item-label" }, o.label));
      if (o.value === currentValue) item.appendChild(el("span", { class: "dropdown-check" }, "✓"));
      item.addEventListener("click", function (e) {
        e.stopPropagation();
        list.classList.remove("open");
        wrap.classList.remove("open");
        var items = list.querySelectorAll(".dropdown-item");
        for (var j = 0; j < items.length; j++) items[j].classList.remove("active");
        item.classList.add("active");
        setLabel(o.value);
        onChange(o.value);
      });
      list.appendChild(item);
    })(opts[i]);
  }
  wrap.appendChild(list);

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var wasOpen = list.classList.contains("open");
    qsa(".dropdown-list").forEach(function (l) { l.classList.remove("open"); });
    qsa(".dropdown").forEach(function (d) { d.classList.remove("open"); });
    if (!wasOpen) { list.classList.add("open"); wrap.classList.add("open"); }
  });
  document.addEventListener("click", function () {
    list.classList.remove("open");
    wrap.classList.remove("open");
  });

  return wrap;
}

function renderSettings() {
  var frag = document.createDocumentFragment();
  var plus = Store.get("license.active", false) === true;
  var plan = UI.card("Подписка");
  if (plus) {
    plan.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "JETCH+ активен"));
    plan.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:14px;line-height:1.7;" },
      "+ Безлимитные анализы", el("br"), "+ ИИ-ассистент"));
    plan.appendChild(UI.btn("Отключить JETCH+", { variant: "ghost", onclick: function () {
      if (!confirm("Отключить JETCH+?")) return;
      Store.set("license.active", false);
      showDialog("Готово", "Ты вернулся к FREE", "success");
      setTimeout(function () { location.reload(); }, 800);
    }}));
  } else {
    plan.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "FREE"));
    plan.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:10px;line-height:1.7;" },
      "+ 5 анализов в день", el("br"), "+ История, дневник, графики", el("br"), "- ИИ-ассистент"));
    plan.appendChild(UI.btn("Активировать JETCH+", { onclick: function () {
      Store.set("license.active", true);
      showDialog("Готово", "JETCH+ активирован", "success");
      setTimeout(function () { location.reload(); }, 800);
    }}));
  }
  frag.appendChild(plan);

  var theme = UI.card("Тема оформления");
  var themeOpts = [];
  for (var key in THEMES) {
    if (!THEMES.hasOwnProperty(key)) continue;
    themeOpts.push({ value: key, label: THEMES[key].label, color: THEMES[key].vars["--accent"] });
  }
  theme.appendChild(makeDropdown(themeOpts, loadTheme(), function (v) {
    applyTheme(v);
    try { if (typeof Daily !== "undefined") Daily.bump("theme"); } catch (e) {}
    try { if (typeof Achievements !== "undefined") Achievements.onThemeChange(); } catch (e) {}
    showDialog("Тема применена", THEMES[v].label, "success");
  }));
  frag.appendChild(theme);

  var perf = UI.card("Производительность");
  perf.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
    "Lite-режим для слабых ПК. Отключает тяжёлые анимации, размытие, tilt карточек."));
  var lbl = el("label", { style: "display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;" });
  var tgl = el("input", { type: "checkbox" });
  tgl.style.cssText = "width:18px;height:18px;cursor:pointer;";
  tgl.checked = isLiteMode();
  tgl.addEventListener("change", function () {
    applyLiteMode(tgl.checked);
    showDialog("Готово", tgl.checked ? "Lite-режим включён" : "Lite отключён", "success");
  });
  lbl.appendChild(tgl);
  lbl.appendChild(document.createTextNode("Lite-режим"));
  perf.appendChild(lbl);
  frag.appendChild(perf);

  var data = UI.card("Данные");
  var eb = UI.btn("Экспорт / Импорт");
  eb.addEventListener("click", function () { switchPage("export"); });
  data.appendChild(eb);
  frag.appendChild(data);

  return frag;
}

function renderAbout() {
  var frag = document.createDocumentFragment();
  var head = UI.card("");
  head.style.cssText = "background:linear-gradient(135deg,var(--accent-dark),var(--accent-bg));border-color:var(--accent);";
  head.appendChild(el("div", { style: "font-size:22px;font-weight:bold;color:var(--accent-light);" }, "DOTA JETCH AI 2.0"));
  head.appendChild(el("div", { class: "muted", style: "font-size:12px;margin-top:8px;" }, "Web version v7"));
  frag.appendChild(head);
  var feat = UI.card("Что работает");
  var list = [
    "Анализ матчей с оценкой S/A/B/C/D",
    "Анализ смертей и рекомендации",
    "Рекомендации по предметам",
    "Реальные иконки героев и предметов (4 зеркала CDN)",
    "История и прогресс (графики)",
    "Дневник с тегами",
    "24 достижения",
    "3 мини-игры",
    "Экспорт / Импорт",
    "Задания дня и стрик",
    "ИИ (JETCH+): 20 героев, 18 предметов",
    "Lite-режим для слабых ПК",
    "Кастомные выпадающие списки"
  ];
  for (var i = 0; i < list.length; i++) feat.appendChild(el("div", { style: "padding:6px 0;font-size:12px;color:var(--text-muted);" }, "* " + list[i]));
  frag.appendChild(feat);
  var ver = UI.card("Версия");
  ver.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "v" + APP_VERSION));
  frag.appendChild(ver);
  return frag;
}

function updateSidebarPlan() {
  var plus = Store.get("license.active", false) === true;
  var t = qs("#planTitle"), i = qs("#planInfo"), v = qs("#planValue");
  if (t) t.textContent = plus ? "JETCH+" : "FREE";
  if (i) i.textContent = plus ? "Безлимит" : "5 анализов/день";
  if (v) v.textContent = plus ? "∞" : (typeof analyzeQuotaRemaining === "function" ? String(analyzeQuotaRemaining()) + " / 5" : "5 / 5");
}

function init() {
  try { applyTheme(loadTheme()); } catch (e) {}
  try { applyLiteMode(isLiteMode()); } catch (e) {}
  buildNav();
  try { Store.set("sessions", (Store.get("sessions", 0) || 0) + 1); } catch (e) {}
  var h = (location.hash || "#dashboard").slice(1);
  switchPage(PAGES[h] ? h : "dashboard");
  updateSidebarPlan();
  try { if (typeof Achievements !== "undefined") Achievements.check(); } catch (e) {}
  console.log("DOTA JETCH v" + APP_VERSION + " init");
}

if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", init);
else setTimeout(init, 0);

window.addEventListener("hashchange", function () {
  var h = (location.hash || "#dashboard").slice(1);
  if (h !== currentPage && PAGES[h]) switchPage(h);
});