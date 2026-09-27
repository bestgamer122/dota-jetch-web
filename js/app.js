/* DOTA JETCH — APP v3.3.6 */

const PAGES = {
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
_404:         { title: "Страница не найдена",  render: render404 },
_error:       { title: "Ошибка",               render: renderError },
};

let currentPage = "dashboard";
let lastRenderError = null;

function safeRender(name) {
try {
if (typeof PAGES[name].render !== "function") throw new Error("render не функция");
const node = PAGES[name].render();
if (!node) throw new Error("render вернул пустой результат");
return node;
} catch (e) {
lastRenderError = { page: name, error: e };
console.error("Render error in", name, e);
const frag = document.createDocumentFragment();
const card = UI.card("Ошибка на странице " + PAGES[name].title);
card.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.6;margin-bottom:10px;" },
"Что-то пошло не так при рендере. Подробности в консоли (F12)."));
card.appendChild(el("div", {
style: "font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--red);background:var(--bg-elev);padding:10px;border-radius:8px;word-break:break-word;"
}, (e.message || String(e))));
card.appendChild(el("div", { style: "margin-top:14px;" },
UI.btn("На главную", { onclick: function() { switchPage("dashboard"); } })));
frag.appendChild(card);
return frag;
}
}

function switchPage(name) {
if (!PAGES[name]) name = "_404";
currentPage = name;
qsa(".nav-btn").forEach(function(b) { b.classList.toggle("active", b.dataset.page === name); });
const titleEl = qs("#pageTitle");
if (titleEl) titleEl.textContent = PAGES[name].title;
const content = qs("#pageContent");
if (!content) return;
content.innerHTML = "";
try { content.appendChild(safeRender(name)); }
catch (e) { content.appendChild(el("div", { style: "padding:30px;color:var(--red);" }, "Критическая ошибка: " + (e.message || e))); }
content.style.opacity = 0;
requestAnimationFrame(function() {
content.style.transition = "opacity 0.25s ease";
content.style.opacity = 1;
});
const scroller = qs(".page-scroll");
if (scroller) scroller.scrollTop = 0;
location.hash = name === "_404" ? "404" : name;
}

function renderError() {
const frag = document.createDocumentFragment();
const card = UI.card("Ошибка");
card.appendChild(el("div", { style: "padding:20px;color:var(--red);font-size:13px;" },
(lastRenderError && lastRenderError.error && lastRenderError.error.message) || "Неизвестная ошибка"));
frag.appendChild(card);
return frag;
}

function renderChartsPage() {
if (typeof Daily !== "undefined") Daily.bump("chart");
if (typeof Charts === "undefined") {
const frag = document.createDocumentFragment();
const card = UI.card("Прогресс");
card.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:20px;" }, "Модуль графиков не загружен."));
frag.appendChild(card);
return frag;
}
return Charts.render();
}

function render404() {
const frag = document.createDocumentFragment();
const card = UI.card("404");
card.appendChild(el("div", { style: "text-align:center;padding:40px;" },
el("div", { style: "font-size:44px;margin-bottom:16px;" }, "🔍"),
el("div", { style: "font-size:18px;font-weight:bold;margin-bottom:8px;color:var(--text);" }, "Страница не найдена"),
el("div", { class: "dim", style: "font-size:13px;line-height:1.5;" }, "Возможно, ссылка устарела."),
el("div", { style: "margin-top:20px;" },
UI.btn("На главную", { onclick: function() { switchPage("dashboard"); } }))
));
frag.appendChild(card);
return frag;
}

function renderDashboard() {
const frag = document.createDocumentFragment();
const plus = Store.get("license_active", false) === true;

frag.appendChild(UI.heroBanner(
"DOTA JETCH",
plus ? "AI 2.0 активен" : "Веб-версия · анализ матчей, дневник, мини-игры",
[
UI.btn("Анализ матча", { onclick: function() { switchPage("analyze"); } }),
UI.btn("Мини-игры", { onclick: function() { switchPage("games"); }, variant: "ghost" }),
UI.btn("Прогресс", { onclick: function() { switchPage("charts"); }, variant: "ghost" }),
]
));

if (typeof renderDailyWidget === "function") {
try { frag.appendChild(renderDailyWidget()); }
catch (e) { console.warn("Daily widget error:", e); }
}

const stats = el("div", { class: "stat-grid" });
const sessions = Store.get("sessions", 0);
const analyzeLeft = typeof analyzeQuotaRemaining === "function"
? (plus ? "∞" : String(analyzeQuotaRemaining()))
: "—";
stats.appendChild(UI.statCard("S", "var(--cyan)", "var(--cyan-bg)", "Сессий", String(sessions), "Всего"));
stats.appendChild(UI.statCard("A", "var(--accent-light)", "var(--accent-bg)", "Анализов сегодня", analyzeLeft, plus ? "JETCH+" : "из 5"));
stats.appendChild(UI.statCard("T", "var(--yellow)", "var(--yellow-bg)", "Ачивки",
(Store.get("achievements_unlocked", []) || []).length + " / 24", "Открыто"));
frag.appendChild(stats);

const stats2 = el("div", { class: "stat-grid" });
const diaryCount = (Store.get("diary_notes", []) || []).length;
const streak = Store.get("daily_streak", 0) || 0;
const histCount = (Store.get("recent_matches", []) || []).length;
stats2.appendChild(UI.statCard("D", "var(--cyan)", "var(--cyan-bg)", "Дневник", String(diaryCount), "Записей"));
stats2.appendChild(UI.statCard("F", "var(--orange)", "var(--orange-bg)", "Стрик дней", String(streak), streak > 0 ? "🔥" : "начни!"));
stats2.appendChild(UI.statCard("H", "var(--green)", "var(--green-bg)", "История", String(histCount), "Матчей"));
frag.appendChild(stats2);

if (lastAnalysis && lastAnalysis.hero && typeof heroImgEl === "function") {
const last = UI.card("Последний разобранный матч");
const row = el("div", { style: "display:flex;align-items:center;gap:14px;" });
row.appendChild(heroImgEl(lastAnalysis.hero, 56));
const info = el("div", { style: "flex:1;" });
info.appendChild(el("div", { style: "font-size:15px;font-weight:bold;" }, lastAnalysis.hero.name));
const p = lastAnalysis.player;
info.appendChild(el("div", { class: "muted", style: "font-size:11px;margin-top:4px;" },
p.kills + "/" + p.deaths + "/" + p.assists + " · " + (lastAnalysis.won ? "победа" : "поражение") + " · " + lastAnalysis.durMin.toFixed(0) + " мин"));
row.appendChild(info);
row.appendChild(UI.btn("Открыть", { variant: "ghost", onclick: function() { switchPage("analyze"); } }));
last.appendChild(row);
frag.appendChild(last);
}

const info = UI.card("Что нового");
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
const wrap = el("div", { class: "theme-dropdown", id: "themeDropdown" });
const btn = el("button", { class: "theme-dropdown-btn", type: "button" });
const label = el("span", {}, (THEMES[currentKey] && THEMES[currentKey].label) || currentKey);
const arrow = el("span", { class: "theme-dropdown-arrow" }, "▾");
btn.appendChild(label);
btn.appendChild(arrow);
wrap.appendChild(btn);

const list = el("div", { class: "theme-dropdown-list" });
for (const [key, t] of Object.entries(THEMES)) {
const item = el("button", {
class: "theme-dropdown-item" + (key === currentKey ? " active" : ""),
type: "button",
});
item.appendChild(el("span", { class: "theme-dot", style: "background:" + (t.vars["--accent"] || "#8b5cf6") + ";" }));
item.appendChild(el("span", {}, t.label));
if (key === currentKey) item.appendChild(el("span", { class: "theme-check" }, "✓"));
item.addEventListener("click", function () {
onChange(key);
list.classList.remove("open");
});
list.appendChild(item);
}
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
const frag = document.createDocumentFragment();

const plus = Store.get("license_active", false) === true;
const planCard = UI.card("Подписка");
if (plus) {
planCard.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "JETCH+ активен"));
planCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:14px;line-height:1.7;" },
"✓ Безлимитные анализы матчей", el("br"),
"✓ Полный доступ к ИИ-ассистенту", el("br"),
"✓ Приоритетная поддержка (демо)"));
planCard.appendChild(UI.btn("Отключить JETCH+ (тест FREE)", {
variant: "ghost",
onclick: function() {
if (!confirm("Отключить JETCH+ и вернуться к FREE?")) return;
Store.set("license_active", false);
showDialog("Готово", "Ты вернулся к FREE-версии.", "success");
setTimeout(function() { location.reload(); }, 800);
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
onclick: function() {
Store.set("license_active", true);
showDialog("Готово", "JETCH+ активирован. Перезагрузи страницу.", "success");
setTimeout(function() { location.reload(); }, 800);
}
}));
}
frag.appendChild(planCard);

const themeCard = UI.card("Тема оформления");
themeCard.appendChild(makeThemeDropdown(loadTheme(), function (key) {
applyTheme(key);
if (typeof Daily !== "undefined") Daily.bump("theme");
if (typeof Achievements !== "undefined") Achievements.onThemeChange();
showDialog("Тема применена", "Выбрана: " + THEMES[key].label, "success");
}));
frag.appendChild(themeCard);

const iconsCard = UI.card("Загрузка иконок");
iconsCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
"Если иконки Steam CDN не грузятся — отключи, будут показаны fallback-иконки с буквами и градиентом."));
const toggleLabel = el("label", { style: "display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;" });
const toggle = el("input", { type: "checkbox" });
toggle.style.cssText = "width:18px;height:18px;cursor:pointer;";
toggle.checked = (typeof cdnEnabled === "function" ? cdnEnabled() : true);
toggle.addEventListener("change", function() {
Store.set("cdn_try_enabled", toggle.checked);
showDialog("Готово", "Перезагрузи страницу для применения.", "success");
});
toggleLabel.appendChild(toggle);
toggleLabel.appendChild(document.createTextNode("Пытаться загружать иконки с CDN"));
iconsCard.appendChild(toggleLabel);
frag.appendChild(iconsCard);

const dataCard = UI.card("Данные");
dataCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
"Все данные хранятся в localStorage. Сделай резервную копию."));
const expBtn = UI.btn("Экспорт / Импорт");
expBtn.addEventListener("click", function() { switchPage("export"); });
dataCard.appendChild(expBtn);
frag.appendChild(dataCard);

return frag;
}

function renderAbout() {
const frag = document.createDocumentFragment();
const head = el("div", { class: "card", style: "background:linear-gradient(135deg,var(--accent-dark),var(--accent-bg));border-color:var(--accent);" });
head.appendChild(el("div", { style: "font-size:22px;font-weight:bold;letter-spacing:2px;color:var(--accent-light);" }, "DOTA JETCH · AI 2.0 · WEB"));
head.appendChild(el("div", { class: "muted", style: "font-size:12px;margin-top:8px;" }, "Match Analyzer · Neural Assistant · Веб-версия"));
frag.appendChild(head);

const feat = UI.card("Что работает");
const list = [
["Анализ матчей", "KDA, GPM, XPM, ластхиты, урон, перцентили"],
["История", "Сохранённые матчи, повторный разбор"],
["Прогресс", "Графики KDA и винрейта"],
["Дневник", "Записи с тегами, фильтр"],
["Достижения", "24 ачивки"],
["Мини-игры", "Реакция, викторина, угадай героя"],
["Экспорт / Импорт", "Резервные копии в JSON"],
["Задания дня", "Ежедневные квесты и стрик"],
["ИИ-ассистент", "Только для JETCH+"],
];
for (const [t, d] of list) {
feat.appendChild(el("div", { style: "display:flex;gap:14px;padding:6px 0;" },
el("div", { style: "width:180px;font-weight:bold;color:var(--gold);font-size:12px;" }, t),
el("div", { class: "muted", style: "flex:1;font-size:11px;" }, d)));
}
frag.appendChild(feat);

const data = UI.card("Источник данных");
data.appendChild(el("div", { style: "color:var(--cyan);font-size:11px;" }, "OpenDota API · api.opendota.com"));
frag.appendChild(data);

const ver = UI.card("Версия");
ver.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "APP_VERSION: " + APP_VERSION));
frag.appendChild(ver);

return frag;
}

function updateSidebarPlan() {
const plus = Store.get("license_active", false) === true;
const planTitle = qs("#planTitle");
const planInfo = qs("#planInfo");
const planValue = qs("#planValue");
if (planTitle) planTitle.textContent = plus ? "JETCH+" : "FREE";
if (planInfo) planInfo.textContent = plus ? "AI 2.0 · безлимит" : "5 анализов/день · без ИИ";
if (planValue) {
if (plus) planValue.textContent = "∞";
else {
const left = typeof analyzeQuotaRemaining === "function" ? analyzeQuotaRemaining() : 5;
planValue.textContent = left + " / 5";
}
}
}

function init() {
applyTheme(loadTheme());

qsa(".nav-btn").forEach(function(btn) {
btn.addEventListener("click", function() { switchPage(btn.dataset.page); });
});

Store.set("sessions", (Store.get("sessions", 0) || 0) + 1);

const hash = (location.hash || "#dashboard").slice(1);
switchPage(PAGES[hash] ? hash : "dashboard");

updateSidebarPlan();

if (typeof Achievements !== "undefined") Achievements.check();

if ("serviceWorker" in navigator) {
navigator.serviceWorker.register("sw.js").then(function(reg) {
console.log("DOTA JETCH — SW registered:", reg.scope);
}).catch(function(e) { console.warn("SW registration failed:", e); });
}

console.log("DOTA JETCH WEB — init OK, version", APP_VERSION);
}

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("hashchange", function() {
const h = (location.hash || "#dashboard").slice(1);
if (h !== currentPage && PAGES[h]) switchPage(h);
else if (!PAGES[h] && currentPage !== "_404") switchPage("_404");
});