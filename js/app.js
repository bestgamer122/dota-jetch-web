/* DOTA JETCH — APP v3.3 */

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
};

let currentPage = "dashboard";

function switchPage(name) {
if (!PAGES[name]) name = "_404";
currentPage = name;
qsa(".nav-btn").forEach(function(b) { b.classList.toggle("active", b.dataset.page === name); });
const titleEl = qs("#pageTitle");
if (titleEl) titleEl.textContent = PAGES[name].title;
const content = qs("#pageContent");
if (!content) return;
content.innerHTML = "";
content.appendChild(PAGES[name].render());
content.style.opacity = 0;
requestAnimationFrame(function() {
content.style.transition = "opacity 0.25s ease";
content.style.opacity = 1;
});
const scroller = qs(".page-scroll");
if (scroller) scroller.scrollTop = 0;
location.hash = name === "_404" ? "404" : name;
}

function renderChartsPage() {
if (typeof Daily !== "undefined") Daily.bump("chart");
return Charts.render();
}

function render404() {
const frag = document.createDocumentFragment();
const card = UI.card("404");
card.appendChild(el("div", { style: "text-align:center;padding:40px;" },
el("div", { style: "font-size:48px;margin-bottom:16px;" }, "🔍"),
el("div", { style: "font-size:18px;font-weight:bold;margin-bottom:8px;color:var(--text);" }, "Страница не найдена"),
el("div", { class: "dim", style: "font-size:13px;line-height:1.5;" }, "Возможно, ссылка устарела."),
el("div", { style: "margin-top:20px;" },
UI.btn("На главную", { onclick: function() { switchPage("dashboard"); } })
)
));
frag.appendChild(card);
return frag;
}

function renderDashboard() {
const frag = document.createDocumentFragment();
const plus = Store.get("license_active", false) === true;

frag.appendChild(UI.heroBanner(
"DOTA JETCH",
plus ? "AI 2.0 активен" : "Веб-версия · анализ матчей, ИИ, дневник",
[
UI.btn("Анализ матча", { onclick: function() { switchPage("analyze"); } }),
UI.btn("ИИ-ассистент", { onclick: function() { switchPage("chat"); }, variant: "ghost" }),
UI.btn("Мини-игры", { onclick: function() { switchPage("games"); }, variant: "ghost" }),
]
));

/* Задания дня */
frag.appendChild(renderDailyWidget());

/* Статистика */
const stats = el("div", { class: "stat-grid" });
const sessions = Store.get("sessions", 0);
const analyzed = Store.get("analyzed_count", 0) || 0;
const aiLeft = typeof aiQuotaRemaining === "function" ? aiQuotaRemaining() : "—";
stats.appendChild(UI.statCard("S", "var(--cyan)", "var(--cyan-bg)", "Сессий", String(sessions), "Всего"));
stats.appendChild(UI.statCard("A", "var(--accent-light)", "var(--accent-bg)", "Анализов", String(analyzed), "Всего"));
stats.appendChild(UI.statCard("AI", "var(--green)", "var(--green-bg)", "ИИ сегодня", String(aiLeft), plus ? "JETCH+" : "Free"));
frag.appendChild(stats);

const stats2 = el("div", { class: "stat-grid" });
const unlocked = (Store.get("achievements_unlocked", []) || []).length;
const diaryCount = (Store.get("diary_notes", []) || []).length;
const streak = Store.get("daily_streak", 0) || 0;
stats2.appendChild(UI.statCard("T", "var(--yellow)", "var(--yellow-bg)", "Ачивки", unlocked + " / 24", "Открыто"));
stats2.appendChild(UI.statCard("D", "var(--cyan)", "var(--cyan-bg)", "Дневник", String(diaryCount), "Записей"));
stats2.appendChild(UI.statCard("F", "var(--orange)", "var(--orange-bg)", "Стрик дней", String(streak), streak > 0 ? "🔥" : "начни!"));
frag.appendChild(stats2);

/* Последний матч */
if (lastAnalysis) {
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

/* Что нового */
const info = UI.card("✨ Что нового в v3.3");
info.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.8;" },
"📈 Графики прогресса (KDA, винрейт)",
el("br"),
"🎯 Ежедневные задания и стрик",
el("br"),
"💾 Экспорт / импорт данных в JSON",
el("br"),
"📱 PWA — установка на телефон",
el("br"),
"🎨 Красивые иконки героев (градиент + буквы) даже без интернета"
));
frag.appendChild(info);

return frag;
}

function renderSettings() {
const frag = document.createDocumentFragment();

/* Тема */
const themeCard = UI.card("🎨 Тема оформления");
const sel = el("select", { class: "input" });
for (const [key, t] of Object.entries(THEMES)) {
sel.appendChild(el("option", { value: key }, t.label));
}
sel.value = loadTheme();
sel.addEventListener("change", function() {
applyTheme(sel.value);
if (typeof Daily !== "undefined") Daily.bump("theme");
if (typeof Achievements !== "undefined") Achievements.onThemeChange();
showDialog("Тема применена", "Выбрана: " + THEMES[sel.value].label, "success");
});
themeCard.appendChild(sel);
frag.appendChild(themeCard);

/* Иконки CDN */
const iconsCard = UI.card("🖼 Загрузка иконок");
iconsCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
"Если иконки Steam CDN не загружаются (блокировка провайдером), отключи эту опцию — " +
"будут показаны красивые fallback-иконки с буквами и градиентом."
));
const toggleLabel = el("label", { style: "display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;" });
const toggle = el("input", { type: "checkbox" });
toggle.style.cssText = "width:18px;height:18px;cursor:pointer;";
toggle.checked = cdnEnabled();
toggle.addEventListener("change", function() {
Store.set(CDN_TRY_ENABLED_KEY, toggle.checked);
showDialog("Готово", "Перезагрузи страницу для применения.", "success");
});
toggleLabel.appendChild(toggle);
toggleLabel.appendChild(document.createTextNode("Пытаться загружать иконки с CDN"));
iconsCard.appendChild(toggleLabel);
frag.appendChild(iconsCard);

/* JETCH+ */
const plus = Store.get("license_active", false) === true;
const planCard = UI.card("✦ JETCH+");
if (plus) {
planCard.appendChild(el("div", { style: "color:var(--gold);font-size:13px;font-weight:600;margin-bottom:12px;" },
"✓ JETCH+ активирован (демо)"));
planCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
"Тебе доступно: 15 вопросов ИИ в день, без рекламы."));
planCard.appendChild(UI.btn("Отключить JETCH+", {
variant: "ghost",
onclick: function() {
if (!confirm("Отключить JETCH+ и вернуться к FREE?")) return;
Store.set("license_active", false);
showDialog("Готово", "Ты вернулся к FREE-версии.", "success");
setTimeout(function() { location.reload(); }, 800);
}
}));
} else {
planCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
"FREE: 3 вопроса ИИ в день. JETCH+: 15 вопросов в день, приоритет."));
planCard.appendChild(UI.btn("Активировать JETCH+ (демо)", {
onclick: function() {
Store.set("license_active", true);
showDialog("Готово", "JETCH+ активирован. Перезагрузи страницу.", "success");
setTimeout(function() { location.reload(); }, 800);
}
}));
}
frag.appendChild(planCard);

/* Данные */
const dataCard = UI.card("💾 Данные");
dataCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
"Все данные хранятся в localStorage браузера. Сделай резервную копию перед сбросом."));
const row1 = el("div", { class: "row", style: "gap:8px;flex-wrap:wrap;" });
const exportBtn = UI.btn("Экспорт / Импорт");
exportBtn.addEventListener("click", function() { switchPage("export"); });
row1.appendChild(exportBtn);
dataCard.appendChild(row1);
frag.appendChild(dataCard);

/* PWA */
const pwaCard = UI.card("📱 Установка приложения");
pwaCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:10px;line-height:1.6;" },
"В Chrome / Edge: ⋮ → «Установить приложение». В Safari: «Поделиться» → «На экран Домой»."
));
if ("serviceWorker" in navigator) {
pwaCard.appendChild(el("div", { style: "font-size:11px;color:var(--green);" }, "✓ Service Worker активен — работает офлайн"));
}
frag.appendChild(pwaCard);

return frag;
}

function renderAbout() {
const frag = document.createDocumentFragment();
const head = el("div", { class: "card", style: "background:linear-gradient(135deg,var(--accent-dark),var(--accent-bg));border-color:var(--accent);" });
head.appendChild(el("div", { style: "font-size:22px;font-weight:bold;letter-spacing:2px;color:var(--accent-light);" },
"DOTA JETCH · AI 2.0 · WEB"));
head.appendChild(el("div", { class: "muted", style: "font-size:12px;margin-top:8px;" },
"Match Analyzer · Neural Assistant · Веб-версия"));
frag.appendChild(head);

const feat = UI.card("Что работает");
const list = [
["Анализ матчей", "KDA, GPM, XPM, ластхиты, урон, перцентили (OpenDota)"],
["ИИ-ассистент", "Локальная база: герои, предметы, механики"],
["История", "Сохранённые матчи, повторный разбор"],
["Прогресс", "Графики KDA и винрейта по последним матчам"],
["Дневник", "Записи с тегами, фильтр"],
["Достижения", "24 ачивки, автоматическая разблокировка"],
["Мини-игры", "Реакция, викторина, угадай героя"],
["Экспорт / Импорт", "Резервные копии в JSON"],
["Задания дня", "Ежедневные квесты и стрик"],
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

function init() {
applyTheme(loadTheme());

qsa(".nav-btn").forEach(function(btn) {
btn.addEventListener("click", function() { switchPage(btn.dataset.page); });
});

Store.set("sessions", (Store.get("sessions", 0) || 0) + 1);

const hash = (location.hash || "#dashboard").slice(1);
switchPage(PAGES[hash] ? hash : "dashboard");

const plus = Store.get("license_active", false) === true;
const planTitle = qs("#planTitle");
const planInfo = qs("#planInfo");
const planValue = qs("#planValue");
if (planTitle) planTitle.textContent = plus ? "JETCH+" : "FREE";
if (planInfo) planInfo.textContent = plus ? "AI 2.0 активен" : "3 вопроса ИИ / день";
if (planValue) planValue.textContent = plus ? "15 / 15" : "3 / 3";

if (typeof Achievements !== "undefined") Achievements.check();

/* Регистрация PWA Service Worker */
if ("serviceWorker" in navigator) {
navigator.serviceWorker.register("sw.js").then(function(reg) {
console.log("DOTA JETCH — SW registered:", reg.scope);
}).catch(function(e) {
console.warn("SW registration failed:", e);
});
}

console.log("DOTA JETCH WEB — init OK, version", APP_VERSION);
}

window.addEventListener("DOMContentLoaded", init);
window.addEventListener("hashchange", function() {
const h = (location.hash || "#dashboard").slice(1);
if (h !== currentPage && PAGES[h]) switchPage(h);
else if (!PAGES[h] && currentPage !== "_404") switchPage("_404");
});