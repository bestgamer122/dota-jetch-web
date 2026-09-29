var PAGES = {
dashboard: { title: "Главная", render: renderDashboard },
analyze: { title: "Анализ матча", render: renderAnalyze },
chat: { title: "ИИ-ассистент", render: renderChat },
history: { title: "История", render: renderHistory },
charts: { title: "Прогресс", render: renderChartsPage },
diary: { title: "Дневник", render: renderDiary },
games: { title: "Мини-игры", render: renderGames },
achievements: { title: "Достижения", render: renderAchievements },
export: { title: "Экспорт", render: renderExportPage },
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

function init() {
try { applyTheme(loadTheme()); } catch (e) {}
try { applyLiteMode(isLiteMode()); } catch (e) {}
buildNav();
document.addEventListener("click", function () { closeAllDropdowns(); });
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