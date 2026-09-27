/* DOTA JETCH — ЕЖЕДНЕВНЫЕ КВЕСТЫ
ВАЖНО: без подчёркиваний в именах функций — чтобы избежать
проблем с автоконвертацией символов при копировании. */

const Daily = {
todayKeyDaily: function () {
const d = new Date();
const y = d.getFullYear();
const m = String(d.getMonth() + 1).padStart(2, "0");
const day = String(d.getDate()).padStart(2, "0");
return y + "-" + m + "-" + day;
},

seedFromToday: function () {
const k = this.todayKeyDaily();
let h = 0;
for (let i = 0; i < k.length; i++) {
h = (Math.imul(h, 31) + k.charCodeAt(i)) % 100000;
}
return h;
},

tasks: function () {
const all = [
{ id: "analyze", icon: "🎯", title: "Разбери 1 матч", desc: "Вкладка «Анализ матча»",
progress: function() { return Store.get("daily_progress_analyze", 0) || 0; }, goal: 1 },
{ id: "chat", icon: "💬", title: "Задай 2 вопроса ИИ", desc: "Доступно только в JETCH+",
progress: function() { return Store.get("daily_progress_chat", 0) || 0; }, goal: 2 },
{ id: "diary", icon: "📔", title: "Запиши в дневник", desc: "Хотя бы 1 запись",
progress: function() { return Store.get("daily_progress_diary", 0) || 0; }, goal: 1 },
{ id: "game", icon: "🎮", title: "Сыграй в мини-игру", desc: "Реакция, викторина или угадай героя",
progress: function() { return Store.get("daily_progress_game", 0) || 0; }, goal: 1 },
{ id: "chart", icon: "📈", title: "Открой графики", desc: "Вкладка «Прогресс»",
progress: function() { return Store.get("daily_progress_chart", 0) || 0; }, goal: 1 },
{ id: "theme", icon: "🎨", title: "Смени тему", desc: "Настройки → тема",
progress: function() { return Store.get("daily_progress_theme", 0) || 0; }, goal: 1 },
];
const seed = this.seedFromToday();
const start = seed % all.length;
const picked = [];
for (let i = 0; i < 3; i++) picked.push(all[(start + i) % all.length]);
return picked;
},

bump: function (id) {
const today = this.todayKeyDaily();
const stored = Store.get("daily_date", "");
if (stored !== today) {
const keys = ["analyze", "chat", "diary", "game", "chart", "theme"];
for (let i = 0; i < keys.length; i++) {
Store.set("daily_progress_" + keys[i], 0);
}
Store.set("daily_date", today);
Store.set("daily_streak_claimed", false);
}
const cur = Store.get("daily_progress_" + id, 0) || 0;
Store.set("daily_progress_" + id, cur + 1);
if (typeof Achievements !== "undefined") Achievements.check();
},

allDone: function () {
const tasks = this.tasks();
for (let i = 0; i < tasks.length; i++) {
if (tasks[i].progress() < tasks[i].goal) return false;
}
return true;
},

claim: function () {
if (!this.allDone()) return false;
if (Store.get("daily_streak_claimed", false)) return false;
Store.set("daily_streak_claimed", true);
const today = this.todayKeyDaily();
const last = Store.get("daily_last_claim_date", "");
let streak = Store.get("daily_streak", 0) || 0;
if (last !== today) {
const y = new Date();
y.setDate(y.getDate() - 1);
const yy = y.getFullYear();
const mm = String(y.getMonth() + 1).padStart(2, "0");
const dd = String(y.getDate()).padStart(2, "0");
const yesterday = yy + "-" + mm + "-" + dd;
if (last === yesterday) streak = streak + 1;
else streak = 1;
Store.set("daily_streak", streak);
Store.set("daily_last_claim_date", today);
}
Store.set("daily_claims_total", (Store.get("daily_claims_total", 0) || 0) + 1);
return true;
},
};

function renderDailyWidget() {
const card = UI.card("🎯 Задания дня");
const tasks = Daily.tasks();

const today = Daily.todayKeyDaily();
if (Store.get("daily_date", "") !== today) {
const keys = ["analyze", "chat", "diary", "game", "chart", "theme"];
for (let i = 0; i < keys.length; i++) {
Store.set("daily_progress_" + keys[i], 0);
}
Store.set("daily_date", today);
Store.set("daily_streak_claimed", false);
}

const grid = el("div", { style: "display:flex;flex-direction:column;gap:10px;" });
const plus = Store.get("license_active", false) === true;

for (let i = 0; i < tasks.length; i++) {
const t = tasks[i];
const cur = Math.min(t.progress(), t.goal);
const done = cur >= t.goal;
const locked = (t.id === "chat" && !plus);

const bg = done ? "var(--green-bg)" : locked ? "rgba(150,155,175,0.06)" : "var(--bg-elev)";
const bd = done ? "var(--green)" : "var(--border)";

const row = el("div", {
style: "display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:12px;background:" + bg + ";border:1px solid " + bd + ";transition:all 0.25s ease;"
});

const icon = done ? "OK" : locked ? "LOCK" : t.icon;
const iconFilter = locked ? "grayscale(0.7) opacity(0.6)" : "none";
row.appendChild(el("div", {
style: "font-size:20px;width:32px;text-align:center;flex-shrink:0;filter:" + iconFilter + ";font-family:'JetBrains Mono',monospace;"
}, icon));

const info = el("div", { style: "flex:1;min-width:0;" });
const titleColor = done ? "var(--green)" : locked ? "var(--text-muted)" : "var(--text)";
info.appendChild(el("div", { style: "font-size:13px;font-weight:600;color:" + titleColor + ";" }, t.title));
const sub = done ? "Выполнено" : locked ? "Доступно в JETCH+" : t.desc;
info.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:3px;" }, sub));
row.appendChild(info);

if (locked) {
const upBtn = el("button", { class: "nav-btn", style: "font-size:10px;padding:4px 8px;flex-shrink:0;" }, "JETCH+");
upBtn.addEventListener("click", function () { switchPage("settings"); });
row.appendChild(upBtn);
} else {
const color = done ? "var(--green)" : "var(--text-muted)";
const progressText = cur + "/" + t.goal;
row.appendChild(el("div", {
style: "font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:" + color + ";flex-shrink:0;"
}, progressText));
}

grid.appendChild(row);
}
card.appendChild(grid);

const allDone = Daily.allDone();
const claimed = Store.get("daily_streak_claimed", false);
const claimRow = el("div", { class: "row", style: "margin-top:14px;justify-content:space-between;flex-wrap:wrap;gap:8px;" });

const streak = Store.get("daily_streak", 0) || 0;
const streakEl = el("div", { style: "font-size:12px;" });
if (streak > 0) {
const bold = el("b", { style: "color:var(--gold);" }, streak + " дн.");
streakEl.appendChild(document.createTextNode("🔥 Стрик: "));
streakEl.appendChild(bold);
} else {
streakEl.textContent = "🔥 Начни серию выполненных дней!";
streakEl.style.color = "var(--text-muted)";
}
claimRow.appendChild(streakEl);

if (allDone && !claimed) {
const btn = UI.btn("Забрать награду");
btn.addEventListener("click", function () {
if (Daily.claim()) {
showDialog("Награда получена", "Ты выполнил все задания дня!", "success");
if (typeof switchPage !== "undefined") switchPage("dashboard");
}
});
claimRow.appendChild(btn);
} else if (claimed) {
claimRow.appendChild(el("div", { style: "font-size:12px;color:var(--green);font-weight:600;" }, "Награда получена"));
}
card.appendChild(claimRow);

return card;
}