/* DOTA JETCH — APP v3.3.8
Защита от падений в init. */

var PAGES = {
dashboard:    { title: "Главная",              render: renderDashboard },
analyze:      { title: "Анализ матча",         render: renderAnalyze },
chat:         { title: "ИИ-ассистент",         render: renderChat },
history:      { title: "История",              render: renderHistory },
charts:       { title: "Прогресс",             render: renderChartsPage },
diary:        { title: "Дневник",              render: renderDiary },
games:        { title: "Мини-игры",            render: renderGames },
achievements: { title: "Достижения",           render: renderAchievements },
export:       { title: "Экспорт / Импорт",     render: renderExportPage },
settings:     { title: "Настройки",            render: renderSettings },
about:        { title: "О программе",          render: renderAbout },
_404:         { title: "Страница не найдена",  render: render404 }
};

var currentPage = "dashboard";

function safeRender(name) {
try {
if (!PAGES[name]) throw new Error("Страница не существует: " + name);
if (typeof PAGES[name].render !== "function") throw new Error("render не функция");
var node = PAGES[name].render();
if (!node) throw new Error("render вернул пустой результат");
return node;
} catch (e) {
console.error("Render error in", name, e);
var frag = document.createDocumentFragment();
var card = UI.card("Ошибка на странице " + (PAGES[name] ? PAGES[name].title : name));
card.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.6;margin-bottom:10px;" },
"Подробности в консоли (F12)."));
card.appendChild(el("div", {
style: "font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--red);background:var(--bg-elev);padding:10px;border-radius:8px;word-break:break-word;"
}, (e.message || String(e))));
card.appendChild(el("div", { style: "margin-top:14px;" },
UI.btn("На главную", { onclick: function () { switchPage("dashboard"); } })));
frag.appendChild(card);
return frag;
}
}

function switchPage(name) {
if (!PAGES[name]) name = "_404";
currentPage = name;
qsa(".nav-btn").forEach(function (b) { b.classList.toggle("active", b.dataset.page === name); });
var titleEl = qs("#pageTitle");
if (titleEl) titleEl.textContent = PAGES[name].title;
var content = qs("#pageContent");
if (!content) return;
content.innerHTML = "";
try { content.appendChild(safeRender(name)); }
catch (e) { content.appendChild(el("div", { style: "padding:30px;color:var(--red);" }, "Критическая ошибка: " + (e.message || e))); }
content.style.opacity = 0;
requestAnimationFrame(function () {
content.style.transition = "opacity 0.25s ease";
content.style.opacity = 1;
});
var scroller = qs(".page-scroll");
if (scroller) scroller.scrollTop = 0;
location.hash = name === "_404" ? "404" : name;
}

function renderChartsPage() {
try { if (typeof Daily !== "undefined") Daily.bump("chart"); } catch (e) {}
if (typeof Charts === "undefined") {
var frag = document.createDocumentFragment();
var card = UI.card("Прогресс");
card.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:20px;" }, "Модуль графиков не загружен."));
frag.appendChild(card);
return frag;
}
return Charts.render();
}

function render404() {
var frag = document.createDocumentFragment();
var card = UI.card("404");
card.appendChild(el("div", { style: "text-align:center;padding:40px;" },
el("div", { style: "font-size:44px;margin-bottom:16px;" }, "🔍"),
el("div", { style: "font-size:18px;font-weight:bold;margin-bottom:8px;color:var(--text);" }, "Страница не найдена"),
el("div", { class: "dim", style: "font-size:13px;line-height:1.5;" }, "Возможно, ссылка устарела."),
el("div", { style: "margin-top:20px;" },
UI.btn("На главную", { onclick: function () { switchPage("dashboard"); } }))
));
frag.appendChild(card);
return frag;
}

function renderDashboard() {
var frag = document.createDocumentFragment();
var plus = Store.get("license_active", false) === true;

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
try { frag.appendChild(renderDailyWidget()); }
catch (e) { console.warn("Daily widget error:", e); }
}

var stats = el("div", { class: "stat-grid" });
var sessions = Store.get("sessions", 0);
var analyzeLeft = typeof analyzeQuotaRemaining === "function"
? (plus ? "∞" : String(analyzeQuotaRemaining()))
: "—";
stats.appendChild(UI.statCard("S", "var(--cyan)", "var(--cyan-bg)", "Сессий", String(sessions), "Всего"));
stats.appendChild(UI.statCard("A", "var(--accent-light)", "var(--accent-bg)", "Анализов сегодня", analyzeLeft, plus ? "JETCH+" : "из 5"));
stats.appendChild(UI.statCard("T", "var(--yellow)", "var(--yellow-bg)", "Ачивки",
(Store.get("achievements_unlocked", []) || []).length + " / 24", "Открыто"));
frag.appendChild(stats);

var stats2 = el("div", { class: "stat-grid" });
var diaryCount = (Store.get("diary_notes", []) || []).length;
var streak = Store.get("daily_streak", 0) || 0;
var histCount = (Store.get("recent_matches", []) || []).length;
stats2.appendChild(UI.statCard("D", "var(--cyan)", "var(--cyan-bg)", "Дневник", String(diaryCount), "Записей"));
stats2.appendChild(UI.statCard("F", "var(--orange)", "var(--orange-bg)", "Стрик дней", String(streak), streak > 0 ? "🔥" : "начни!"));
stats2.appendChild(UI.statCard("H", "var(--green)", "var(--green-bg)", "История", String(histCount), "Матчей"));
frag.appendChild(stats2);

if (typeof lastAnalysis !== "undefined" && lastAnalysis && lastAnalysis.hero && typeof heroImgEl === "function") {
var last = UI.card("Последний разобранный матч");
var row = el("div", { style: "display:flex;align-items:center;gap:14px;" });
row.appendChild(heroImgEl(lastAnalysis.hero, 56));
var info = el("div", { style: "flex:1;" });
info.appendChild(el("div", { style: "font-size:15px;font-weight:bold;" }, lastAnalysis.hero.name));
var p = lastAnalysis.player;
info.appendChild(el("div", { class: "muted", style: "font-size:11px;margin-top:4px;" },
p.kills + "/" + p.deaths + "/" + p.assists + " · " + (lastAnalysis.won ? "победа" : "поражение") + " · " + lastAnalysis.durMin.toFixed(0) + " мин"));
row.appendChild(info);
row.appendChild(UI.btn("Открыть", { variant: "ghost", onclick: function () { switchPage("analyze"); } }));
last.appendChild(row);
frag.appendChild(last);
}

var info = UI.card("Что нового");
info.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.8;" },
"🎨 Кастомный дропдаун тем",
el("br"),
"🖼 Fallback-иконки — работают без CDN",
el("br"),
"📈 Графики прогресса",
el("br"),
"💾 Экспорт / импорт данных"
));
frag.appendChild(info);

return frag;
}

function makeThemeDropdown(currentKey, onChange) {
var wrap = el("div", { class: "theme-dropdown", id: "themeDropdown" });
var btn = el("button", { class: "theme-dropdown-btn", type: "button" });
var label = el("span", {}, (THEMES[currentKey] && THEMES[currentKey].label) || currentKey);
var arrow = el("span", { class: "theme-dropdown-arrow" }, "▾");
btn.appendChild(label);
btn.appendChild(arrow);
wrap.appendChild(btn);

var list = el("div", { class: "theme-dropdown-list" });
Object.keys(THEMES).forEach(function (key) {
var t = THEMES[key];
var item = el("button", {
class: "theme-dropdown-item" + (key === currentKey ? " active" : ""),
type: "button"
});
item.appendChild(el("span", { class: "theme-dot", style: "background:" + (t.vars["--accent"] || "#8b5cf6") + ";" }));
item.appendChild(el("span", {}, t.label));
if (key === currentKey) item.appendChild(el("span", { class: "theme-check" }, "✓"));
item.addEventListener("click", function () {
onChange(key);
list.classList.remove("open");
});
list.appendChild(item);
});
wrap.appendChild(list);

btn.addEventListener("click", function (e) {
e.stopPropagation();
list.classList.toggle("open");
});
document.addEventListener("click", function () {
list.classList.remove("open");
});

return wrap;
}

function renderSettings() {
var frag = document.createDocumentFragment();

var plus = Store.get("license_active", false) === true;
var planCard = UI.card("Подписка");
if (plus) {
planCard.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "JETCH+ активен"));
planCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:14px;line-height:1.7;" },
"✓ Безлимитные анализы матчей", el("br"),
"✓ Полный доступ к ИИ-ассистенту", el("br"),
"✓ Приоритетная поддержка (демо)"));
planCard.appendChild(UI.btn("Отключить JETCH+ (тест FREE)", {
variant: "ghost",
onclick: function () {
if (!confirm("Отключить JETCH+ и вернуться к FREE?")) return;
Store.set("license_active", false);
showDialog("Готово", "Ты вернулся к FREE-версии.", "success");
setTimeout(function () { location.reload(); }, 800);
}
}));
} else {
planCard.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "FREE-версия"));
planCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:10px;line-height:1.7;" },
"Сейчас доступно:", el("br"),
"✓ 5 анализов матчей в день", el("br"),
"✓ История, дневник, достижения", el("br"),
"✓ Мини-игры, графики, экспорт", el("br"),
"✗ ИИ-ассистент (только JETCH+)"));
planCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin:14px 0 10px;line-height:1.7;" },
"JETCH+ даёт:", el("br"),
"✓ Безлимитные анализы", el("br"),
"✓ Полный доступ к ИИ-ассистенту", el("br"),
"✓ Приоритет (демо)"));
planCard.appendChild(UI.btn("Активировать JETCH+ (демо)", {
onclick: function () {
Store.set("license_active", true);
showDialog("Готово", "JETCH+ активирован. Перезагрузи страницу.", "success");
setTimeout(function () { location.reload(); }, 800);
}
}));
}
frag.appendChild(planCard);

var themeCard = UI.card("Тема оформления");
themeCard.appendChild(makeThemeDropdown(loadTheme(), function (key) {
applyTheme(key);
try { if (typeof Daily !== "undefined") Daily.bump("theme"); } catch (e) {}
try { if (typeof Achievements !== "undefined") Achievements.onThemeChange(); } catch (e) {}
showDialog("Тема применена", "Выбрана: " + THEMES[key].label, "success");
}));
frag.appendChild(themeCard);

var dataCard = UI.card("Данные");
dataCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
"Все данные хранятся в localStorage. Сделай резервную копию."));
var expBtn = UI.btn("Экспорт / Импорт");
expBtn.addEventListener("click", function () { switchPage("export"); });
dataCard.appendChild(expBtn);
frag.appendChild(dataCard);

return frag;
}

function renderAbout() {
var frag = document.createDocumentFragment();
var head = el("div", { class: "card", style: "background:linear-gradient(135deg,var(--accent-dark),var(--accent-bg));border-color:var(--accent);" });
head.appendChild(el("div", { style: "font-size:22px;font-weight:bold;letter-spacing:2px;color:var(--accent-light);" }, "DOTA JETCH · AI 2.0 · WEB"));
head.appendChild(el("div", { class: "muted", style: "font-size:12px;margin-top:8px;" }, "Match Analyzer · Neural Assistant · Веб-версия"));
frag.appendChild(head);

var feat = UI.card("Что работает");
var list = [
["Анализ матчей", "KDA, GPM, XPM, ластхиты, урон, перцентили"],
["История", "Сохранённые матчи, повторный разбор"],
["Прогресс", "Графики KDA и винрейта"],
["Дневник", "Записи с тегами, фильтр"],
["Достижения", "24 ачивки"],
["Мини-игры", "Реакция, викторина, угадай героя"],
["Экспорт / Импорт", "Резервные копии в JSON"],
["Задания дня", "Ежедневные квесты и стрик"],
["ИИ-ассистент", "Только для JETCH+"]
];
list.forEach(function (item) {
feat.appendChild(el("div", { style: "display:flex;gap:14px;padding:6px 0;" },
el("div", { style: "width:180px;font-weight:bold;color:var(--gold);font-size:12px;" }, item[0]),
el("div", { class: "muted", style: "flex:1;font-size:11px;" }, item[1])));
});
frag.appendChild(feat);

var data = UI.card("Источник данных");
data.appendChild(el("div", { style: "color:var(--cyan);font-size:11px;" }, "OpenDota API · api.opendota.com"));
frag.appendChild(data);

var ver = UI.card("Версия");
ver.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "APP_VERSION: " + APP_VERSION));
frag.appendChild(ver);

return frag;
}

function updateSidebarPlan() {
try {
var plus = Store.get("license_active", false) === true;
var planTitle = qs("#planTitle");
var planInfo = qs("#planInfo");
var planValue = qs("#planValue");
if (planTitle) planTitle.textContent = plus ? "JETCH+" : "FREE";
if (planInfo) planInfo.textContent = plus ? "AI 2.0 · безлимит" : "5 анализов/день · без ИИ";
if (planValue) {
if (plus) planValue.textContent = "∞";
else {
var left = typeof analyzeQuotaRemaining === "function" ? analyzeQuotaRemaining() : 5;
planValue.textContent = left + " / 5";
}
}
} catch (e) { console.warn("updateSidebarPlan error:", e); }
}

function init() {
try { applyTheme(loadTheme()); } catch (e) { console.error("applyTheme error:", e); }

try {
qsa(".nav-btn").forEach(function (btn) {
btn.addEventListener("click", function () { switchPage(btn.dataset.page); });
});
} catch (e) { console.error("nav binding error:", e); }

try { Store.set("sessions", (Store.get("sessions", 0) || 0) + 1); } catch (e) {}

try {
var hash = (location.hash || "#dashboard").slice(1);
switchPage(PAGES[hash] ? hash : "dashboard");
} catch (e) {
console.error("switchPage error:", e);
var el2 = qs("#pageContent");
if (el2) {
el2.innerHTML = '<div style="padding:40px;color:#ef4444;font-family:monospace;">' +
'<div style="font-size:24px;margin-bottom:12px;">⚠️ Ошибка запуска</div>' +
'<div style="font-size:13px;">' + (e.message || String(e)) + '</div>' +
'</div>';
}
}

try { updateSidebarPlan(); } catch (e) {}
try { if (typeof Achievements !== "undefined") Achievements.check(); } catch (e) {}

console.log("DOTA JETCH WEB — init OK, version", APP_VERSION);
}

if (document.readyState === "loading") {
window.addEventListener("DOMContentLoaded", init);
} else {
setTimeout(init, 0);
}

window.addEventListener("hashchange", function () {
var h = (location.hash || "#dashboard").slice(1);
if (h !== currentPage && PAGES[h]) switchPage(h);
else if (!PAGES[h] && currentPage !== "_404") switchPage("_404");
});