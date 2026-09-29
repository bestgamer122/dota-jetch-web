/* DOTA JETCH — APP v4.1.0

- Lite mode для слабых ПК
- Больше настроек
- Улучшенный дашборд */

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
{ page: "analyze", label: "Анализ матча", icon: "M5 3l14 9-14 9z" },
{ page: "chat", label: "ИИ-ассистент", icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
{ page: "history", label: "История", icon: "M3 6h18M3 12h18M3 18h18" },
{ page: "charts", label: "Прогресс", icon: "M3 3v18h18M7 14l3-3 4 4 5-6" },
{ page: "diary", label: "Дневник", icon: "M4 4h12l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" },
{ page: "games", label: "Мини-игры", icon: "M3 7h18v12H3z" },
{ page: "achievements", label: "Достижения", icon: "M12 9m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0" },
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
if (!PAGES[name]) throw new Error("Страница не найдена: " + name);
var node = PAGES[name].render();
if (!node) throw new Error("Пустой результат");
return node;
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
var titleEl = qs("#pageTitle");
if (titleEl) titleEl.textContent = PAGES[name].title;
var content = qs("#pageContent");
if (!content) return;
content.innerHTML = "";
try { content.appendChild(safeRender(name)); }
catch (e) { content.appendChild(el("div", { style: "padding:30px;color:var(--red);" }, "Ошибка: " + (e.message || e))); }
var scroller = qs(".page-scroll");
if (scroller) scroller.scrollTop = 0;
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
plus ? "AI 2.0 активен" : "Веб-версия · анализ матчей, дневник, мини-игры",
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
var sessions = Store.get("sessions", 0);
var analyzeLeft = typeof analyzeQuotaRemaining === "function" ? (plus ? "∞" : String(analyzeQuotaRemaining())) : "—";
stats.appendChild(UI.statCard("S", "var(--cyan)", "var(--cyan-bg)", "Сессий", String(sessions), "Всего"));
stats.appendChild(UI.statCard("A", "var(--accent-light)", "var(--accent-bg)", "Анализов сегодня", analyzeLeft, plus ? "JETCH+" : "из 5"));
stats.appendChild(UI.statCard("T", "var(--yellow)", "var(--yellow-bg)", "Ачивки", (Store.get("achievementsunlocked", []) || []).length + " / 24", "Открыто"));
frag.appendChild(stats);
var stats2 = el("div", { class: "stat-grid" });
stats2.appendChild(UI.statCard("D", "var(--cyan)", "var(--cyan-bg)", "Дневник", String((Store.get("diarynotes", []) || []).length), "Записей"));
stats2.appendChild(UI.statCard("F", "var(--orange)", "var(--orange-bg)", "Стрик дней", String(Store.get("dailystreak", 0) || 0), "🔥"));
stats2.appendChild(UI.statCard("H", "var(--green)", "var(--green-bg)", "История", String((Store.get("recentmatches", []) || []).length), "Матчей"));
frag.appendChild(stats2);
if (lastAnalysis && lastAnalysis.hero) {
var last = UI.card("Последний матч");
var row = el("div", { style: "display:flex;align-items:center;gap:14px;" });
row.appendChild(heroImgEl(lastAnalysis.hero, 56));
var info = el("div", { style: "flex:1;" });
info.appendChild(el("div", { style: "font-size:15px;font-weight:bold;" }, lastAnalysis.hero.name));
info.appendChild(el("div", { class: "muted", style: "font-size:11px;margin-top:4px;" },
lastAnalysis.player.kills + "/" + lastAnalysis.player.deaths + "/" + lastAnalysis.player.assists + " · " + (lastAnalysis.won ? "победа" : "поражение")));
row.appendChild(info);
last.appendChild(row);
frag.appendChild(last);
}
return frag;
}

/* ═══════════ LITE MODE ═══════════ */

function isLiteMode() {
return Store.get("litemode", false) === true;
}

function applyLiteMode(enabled) {
if (enabled) {
document.body.classList.add("lite-mode");
Store.set("litemode", true);
} else {
document.body.classList.remove("lite-mode");
Store.set("litemode", false);
}
}

/* ═══════════ SETTINGS ═══════════ */

function renderSettings() {
var frag = document.createDocumentFragment();

/* Подписка */
var plus = Store.get("license.active", false) === true;
var planCard = UI.card("✦ Подписка");
if (plus) {
planCard.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "✦ JETCH+ активен"));
planCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:14px;line-height:1.7;" },
"✓ Безлимитные анализы матчей", el("br"),
"✓ Полный доступ к ИИ-ассистенту (40+ героев, 30+ предметов)", el("br"),
"✓ Все функции анализа (оценка, рекомендации, сравнение)"));
planCard.appendChild(UI.btn("Отключить JETCH+ (тест FREE)", {
variant: "ghost",
onclick: function () {
if (!confirm("Отключить JETCH+ и вернуться к FREE?")) return;
Store.set("license.active", false);
showDialog("Готово", "Ты вернулся к FREE-версии.", "success");
setTimeout(function () { location.reload(); }, 800);
}
}));
} else {
planCard.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "FREE-версия"));
planCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:10px;line-height:1.7;" },
"Доступно:", el("br"),
"✓ 5 анализов в день", el("br"),
"✓ История, дневник, графики, мини-игры", el("br"),
"✗ ИИ-ассистент (только JETCH+)"));
planCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin:14px 0 10px;line-height:1.7;" },
"JETCH+ даёт:", el("br"),
"✓ Безлимитные анализы", el("br"),
"✓ ИИ с 40+ героями и 30+ предметами", el("br"),
"✓ Оценка производительности и рекомендации"));
planCard.appendChild(UI.btn("✦ Активировать JETCH+ (демо)", {
onclick: function () {
Store.set("license.active", true);
showDialog("Готово", "JETCH+ активирован. Перезагрузи страницу.", "success");
setTimeout(function () { location.reload(); }, 800);
}
}));
}
frag.appendChild(planCard);

/* Тема */
var themeCard = UI.card("🎨 Тема оформления");
var sel = el("select", { class: "input" });
for (var key in THEMES) {
if (!THEMES.hasOwnProperty(key)) continue;
var opt = el("option", { value: key }, THEMES[key].label);
if (key === loadTheme()) opt.selected = true;
sel.appendChild(opt);
}
sel.addEventListener("change", function () {
applyTheme(sel.value);
try { if (typeof Daily !== "undefined") Daily.bump("theme"); } catch (e) {}
try { if (typeof Achievements !== "undefined") Achievements.onThemeChange(); } catch (e) {}
showDialog("Тема применена", THEMES[sel.value].label, "success");
});
themeCard.appendChild(sel);
frag.appendChild(themeCard);

/* Производительность */
var perfCard = UI.card("⚡ Производительность");
perfCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
"Режим для слабых ПК и ноутбуков. Отключает тяжёлые анимации, " +
"размытие, свечение, плавающие шары и кастомный курсор. " +
"Сайт работает заметно быстрее."));

var liteLabel = el("label", { style: "display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;" });
var liteToggle = el("input", { type: "checkbox" });
liteToggle.style.cssText = "width:18px;height:18px;cursor:pointer;";
liteToggle.checked = isLiteMode();
liteToggle.addEventListener("change", function () {
applyLiteMode(liteToggle.checked);
showDialog("Готово", liteToggle.checked ? "Lite-режим включён" : "Lite-режим отключён", "success");
});
liteLabel.appendChild(liteToggle);
liteLabel.appendChild(document.createTextNode("Lite-режим (для слабых ПК)"));
perfCard.appendChild(liteLabel);

perfCard.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:10px;line-height:1.5;" },
"Lite-режим отключает: аврора-фон, плавающие шары, кастомный курсор, " +
"3D-tilt карточек, счётчики чисел, ripple-эффект на кнопках."));
frag.appendChild(perfCard);

/* Данные */
var dataCard = UI.card("💾 Данные");
var expBtn = UI.btn("Экспорт / Импорт");
expBtn.addEventListener("click", function () { switchPage("export"); });
dataCard.appendChild(expBtn);
frag.appendChild(dataCard);
return frag;
}

function renderAbout() {
var frag = document.createDocumentFragment();
var head = UI.card("");
head.style.cssText = "background:linear-gradient(135deg,var(--accent-dark),var(--accent-bg));border-color:var(--accent);";
head.appendChild(el("div", { style: "font-size:22px;font-weight:bold;color:var(--accent-light);" }, "DOTA JETCH · AI 2.0"));
head.appendChild(el("div", { class: "muted", style: "font-size:12px;margin-top:8px;" }, "Match Analyzer · v4.1.0"));
frag.appendChild(head);
var feat = UI.card("Что работает");
var list = [
"Анализ матчей с оценкой S/A/B/C/D",
"Анализ смертей и рекомендации",
"Рекомендации по предметам против врагов",
"Командное сравнение (золото, урон, убийства)",
"История и прогресс (графики)",
"Дневник с тегами",
"24 достижения",
"Три мини-игры",
"Экспорт / Импорт данных",
"Задания дня и стрик",
"ИИ-ассистент (JETCH+): 40+ героев, 30+ предметов",
"Контрпики и синергии",
"Lite-режим для слабых ПК"
];
for (var i = 0; i < list.length; i++) {
feat.appendChild(el("div", { style: "padding:6px 0;font-size:12px;color:var(--text-muted);" }, "• " + list[i]));
}
frag.appendChild(feat);
var ver = UI.card("Версия");
ver.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "APP_VERSION: " + APP_VERSION));
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
var hash = (location.hash || "#dashboard").slice(1);
switchPage(PAGES[hash] ? hash : "dashboard");
updateSidebarPlan();
try { if (typeof Achievements !== "undefined") Achievements.check(); } catch (e) {}
console.log("DOTA JETCH — init OK, version " + APP_VERSION + (isLiteMode() ? " (lite)" : ""));
}

if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", init);
else setTimeout(init, 0);

window.addEventListener("hashchange", function () {
var h = (location.hash || "#dashboard").slice(1);
if (h !== currentPage && PAGES[h]) switchPage(h);
});