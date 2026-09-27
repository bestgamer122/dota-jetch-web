/* DOTA JETCH — ЕЖЕДНЕВНЫЕ КВЕСТЫ + ЕЖЕДНЕВНАЯ ВИКТОРИНА */

const Daily = {
_todayKey: function () {
const d = new Date();
return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
},

_seed: function () {
const k = this._todayKey();
let h = 0;
for (let i = 0; i < k.length; i++) h = (h * 31 + k.charCodeAt(i)) % 100000;
return h;
},

/* Задания на сегодня (3 случайных) */
tasks: function () {
const all = [
{ id: "analyze", icon: "🎯", title: "Разбери 1 матч", desc: "Открой вкладку «Анализ матча»", progress: () => Store.get("daily_progress_analyze", 0), goal: 1 },
{ id: "chat", icon: "💬", title: "Задай 2 вопроса ИИ", desc: "ИИ-ассистент ответит", progress: () => Store.get("daily_progress_chat", 0), goal: 2 },
{ id: "diary", icon: "📔", title: "Запиши в дневник", desc: "Хотя бы 1 запись", progress: () => Store.get("daily_progress_diary", 0), goal: 1 },
{ id: "game", icon: "🎮", title: "Сыграй в мини-игру", desc: "Реакция, викторина или угадай героя", progress: () => Store.get("daily_progress_game", 0), goal: 1 },
{ id: "chart", icon: "📈", title: "Открой графики", desc: "Вкладка «Прогресс»", progress: () => Store.get("daily_progress_chart", 0), goal: 1 },
{ id: "theme", icon: "🎨", title: "Смени тему", desc: "Настройки → тема оформления", progress: () => Store.get("daily_progress_theme", 0), goal: 1 },
];
/* выбираем 3 на основе сида */
const seed = this._seed();
const start = seed % all.length;
const picked = [];
for (let i = 0; i < 3; i++) picked.push(all[(start + i) % all.length]);
return picked;
},

/* Отметить прогресс */
bump: function (id) {
const today = this._todayKey();
const stored = Store.get("daily_date", "");
if (stored !== today) {
/* новый день — сбрасываем */
["analyze", "chat", "diary", "game", "chart", "theme"].forEach(function (k) {
Store.set("daily_progress_" + k, 0);
});
Store.set("daily_date", today);
Store.set("daily_streak_claimed", false);
}
const cur = Store.get("daily_progress_" + id, 0) || 0;
Store.set("daily_progress_" + id, cur + 1);
if (typeof Achievements !== "undefined") Achievements.check();
},

/* Все ли выполнены */
allDone: function () {
const tasks = this.tasks();
for (const t of tasks) {
if (t.progress() < t.goal) return false;
}
return true;
},

/* Забрать награду */
claim: function () {
if (!this.allDone()) return false;
if (Store.get("daily_streak_claimed", false)) return false;
Store.set("daily_streak_claimed", true);
/* Обновляем стрик */
const today = this._todayKey();
const last = Store.get("daily_last_claim_date", "");
let streak = Store.get("daily_streak", 0) || 0;
if (last === today) {
/* уже сегодня получал */
} else {
/* проверяем вчера */
const y = new Date();
y.setDate(y.getDate() - 1);
const yesterday = y.getFullYear() + "-" + String(y.getMonth() + 1).padStart(2, "0") + "-" + String(y.getDate()).padStart(2, "0");
if (last === yesterday) streak++;
else streak = 1;
Store.set("daily_streak", streak);
Store.set("daily_last_claim_date", today);
}
Store.set("daily_claims_total", (Store.get("daily_claims_total", 0) || 0) + 1);
return true;
},
};

/* Визуальный блок на дашборде */
function renderDailyWidget() {
const card = UI.card("🎯 Задания дня");
const tasks = Daily.tasks();

const today = Daily.*todayKey();
if (Store.get("daily_date", "") !== today) {
/* сбрасываем прогресс под новый день */
["analyze", "chat", "diary", "game", "chart", "theme"].forEach(function (k) {
Store.set("daily_progress*" + k, 0);
});
Store.set("daily_date", today);
Store.set("daily_streak_claimed", false);
}

const grid = el("div", { style: "display:flex;flex-direction:column;gap:10px;" });

for (const t of tasks) {
const cur = Math.min(t.progress(), t.goal);
const done = cur >= t.goal;

const row = el("div", {
style: "display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:12px;background:" +
(done ? "var(--green-bg)" : "var(--bg-elev)") +
";border:1px solid " + (done ? "var(--green)" : "var(--border)") + ";transition:all 0.25s ease;"
});

row.appendChild(el("div", { style: "font-size:24px;width:32px;text-align:center;flex-shrink:0;" }, done ? "✅" : t.icon));

const info = el("div", { style: "flex:1;min-width:0;" });
info.appendChild(el("div", {
style: "font-size:13px;font-weight:600;color:" + (done ? "var(--green)" : "var(--text)") + ";"
}, t.title));
info.appendChild(el("div", {
class: "dim", style: "font-size:11px;margin-top:3px;"
}, done ? "Выполнено" : t.desc));
row.appendChild(info);

const prog = el("div", {
style: "font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:" +
(done ? "var(--green)" : "var(--text-muted)") + ";flex-shrink:0;"
}, cur + "/" + t.goal);
row.appendChild(prog);

grid.appendChild(row);
}
card.appendChild(grid);

/* Кнопка забрать награду */
const allDone = Daily.allDone();
const claimed = Store.get("daily_streak_claimed", false);
const claimRow = el("div", { class: "row", style: "margin-top:14px;justify-content:space-between;flex-wrap:wrap;gap:8px;" });

const streak = Store.get("daily_streak", 0) || 0;
const streakEl = el("div", { style: "font-size:12px;" });
if (streak > 0) {
streakEl.innerHTML = "🔥 Стрик: <b style='color:var(--gold);'>" + streak + " дн.</b>";
} else {
streakEl.textContent = "🔥 Начни серию выполненных дней!";
streakEl.style.color = "var(--text-muted)";
}
claimRow.appendChild(streakEl);

if (allDone && !claimed) {
const btn = UI.btn("Забрать награду");
btn.addEventListener("click", function () {
if (Daily.claim()) {
showDialog("Награда получена", "Ты выполнил все задания дня! Дневной стрик продолжается.", "success");
if (typeof switchPage !== "undefined") switchPage("dashboard");
}
});
claimRow.appendChild(btn);
} else if (claimed) {
claimRow.appendChild(el("div", { style: "font-size:12px;color:var(--green);font-weight:600;" }, "✓ Сегодня награда получена"));
}
card.appendChild(claimRow);

return card;
}