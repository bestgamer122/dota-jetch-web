/* DOTA JETCH — ДОСТИЖЕНИЯ v3.4.0 */

var ACHIEVEMENTS = [
{ id: "a1", cat: "Анализ", icon: "🎯", title: "Первый анализ", desc: "Разобрать 1 матч", check: function (s) { return s.analyzed >= 1; } },
{ id: "a2", cat: "Анализ", icon: "📊", title: "Аналитик", desc: "Разобрать 5 матчей", check: function (s) { return s.analyzed >= 5; } },
{ id: "a3", cat: "Анализ", icon: "🔬", title: "Профи", desc: "Разобрать 25 матчей", check: function (s) { return s.analyzed >= 25; } },
{ id: "a4", cat: "Анализ", icon: "🧠", title: "Гуру", desc: "Разобрать 100 матчей", check: function (s) { return s.analyzed >= 100; } },
{ id: "a5", cat: "Герои", icon: "🎭", title: "Разнообразие", desc: "5 разных героев", check: function (s) { return s.uniqueHeroes >= 5; } },
{ id: "a6", cat: "Герои", icon: "🎪", title: "Коллекционер", desc: "15 разных героев", check: function (s) { return s.uniqueHeroes >= 15; } },
{ id: "a7", cat: "Герои", icon: "👑", title: "Все герои", desc: "50 разных героев", check: function (s) { return s.uniqueHeroes >= 50; } },
{ id: "a8", cat: "Ассистент", icon: "💬", title: "Первый вопрос", desc: "Задать 1 вопрос ИИ", check: function (s) { return s.aiQuestions >= 1; } },
{ id: "a9", cat: "Ассистент", icon: "❓", title: "Любознательный", desc: "Задать 10 вопросов", check: function (s) { return s.aiQuestions >= 10; } },
{ id: "a10", cat: "Ассистент", icon: "🗣", title: "Болтун", desc: "Задать 50 вопросов", check: function (s) { return s.aiQuestions >= 50; } },
{ id: "a11", cat: "Дневник", icon: "📝", title: "Первая запись", desc: "1 запись в дневнике", check: function (s) { return s.diaryNotes >= 1; } },
{ id: "a12", cat: "Дневник", icon: "📔", title: "Хроникёр", desc: "10 записей", check: function (s) { return s.diaryNotes >= 10; } },
{ id: "a13", cat: "Дневник", icon: "📚", title: "Автор", desc: "50 записей", check: function (s) { return s.diaryNotes >= 50; } },
{ id: "a14", cat: "Мини-игры", icon: "🎮", title: "Игрок", desc: "Сыграть в любую игру", check: function (s) { return s.gamesPlayed >= 1; } },
{ id: "a15", cat: "Мини-игры", icon: "⚡", title: "Молниеносный", desc: "Реакция < 250 мс", check: function (s) { return s.reactionBest > 0 && s.reactionBest < 250; } },
{ id: "a16", cat: "Мини-игры", icon: "🥷", title: "Ниндзя", desc: "Реакция < 200 мс", check: function (s) { return s.reactionBest > 0 && s.reactionBest < 200; } },
{ id: "a17", cat: "Мини-игры", icon: "🎓", title: "Викторина", desc: "Идеально 10/10", check: function (s) { return s.quizBest >= 10; } },
{ id: "a18", cat: "Мини-игры", icon: "🕵️", title: "Детектив", desc: "10 героев подряд", check: function (s) { return s.guessBest >= 10; } },
{ id: "a19", cat: "Активность", icon: "🔥", title: "Регулярный", desc: "5 сессий", check: function (s) { return s.sessions >= 5; } },
{ id: "a20", cat: "Активность", icon: "💎", title: "Постоянный", desc: "25 сессий", check: function (s) { return s.sessions >= 25; } },
{ id: "a21", cat: "Активность", icon: "🌟", title: "Верный", desc: "100 сессий", check: function (s) { return s.sessions >= 100; } },
{ id: "a22", cat: "Особые", icon: "🎨", title: "Стилист", desc: "Сменить тему", check: function (s) { return s.themeChanged === true; } },
{ id: "a23", cat: "Особые", icon: "🧹", title: "Чистюля", desc: "Сбросить данные", check: function (s) { return s.dataReset === true; } },
{ id: "a24", cat: "Особые", icon: "🏆", title: "Мастер", desc: "Открыть 20 ачивок", check: function (s) { return s.unlockedCount >= 20; }, late: true }
];

var Achievements = {
stats: function () {
var unique = Store.get("uniqueheroes", []);
return {
analyzed: Store.get("analyzedcount", 0) || 0,
uniqueHeroes: Array.isArray(unique) ? unique.length : 0,
aiQuestions: Store.get("aiquestions", 0) || 0,
diaryNotes: (Store.get("diarynotes", []) || []).length,
gamesPlayed: Store.get("gamesplayed", 0) || 0,
reactionBest: Store.get("reactionbest", 0) || 0,
quizBest: Store.get("quizbest", 0) || 0,
guessBest: Store.get("guessbeststreak", 0) || 0,
sessions: Store.get("sessions", 0) || 0,
themeChanged: Store.get("themechanged", false),
dataReset: Store.get("datareset", false),
unlockedCount: (Store.get("achievementsunlocked", []) || []).length
};
},

unlocked: function () {
var u = Store.get("achievementsunlocked", []);
return Array.isArray(u) ? u : [];
},

check: function () {
var s = this.stats();
var unlocked = this.unlocked();
var newly = [];
for (var i = 0; i < ACHIEVEMENTS.length; i++) {
var a = ACHIEVEMENTS[i];
if (a.late) continue;
if (unlocked.indexOf(a.id) >= 0) continue;
try { if (a.check(s)) { unlocked.push(a.id); newly.push(a); } } catch (e) {}
}
s.unlockedCount = unlocked.length;
for (var j = 0; j < ACHIEVEMENTS.length; j++) {
var b = ACHIEVEMENTS[j];
if (!b.late) continue;
if (unlocked.indexOf(b.id) >= 0) continue;
try { if (b.check(s)) { unlocked.push(b.id); newly.push(b); } } catch (e) {}
}
if (newly.length) {
Store.set("achievementsunlocked", unlocked);
for (var k = 0; k < newly.length; k++) this.toast(newly[k]);
}
return newly;
},

toast: function (a) {
var container = qs("#achToast");
if (!container) {
container = el("div", { id: "achToast", style: "position:fixed;right:18px;bottom:18px;z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none;" });
document.body.appendChild(container);
}
var t = el("div", { style: "background:var(--bg-card);border:1px solid var(--gold);border-radius:12px;padding:12px 16px;display:flex;gap:12px;align-items:center;min-width:260px;opacity:0;transition:opacity 0.3s ease;" });
t.appendChild(el("div", { style: "font-size:26px;" }, a.icon));
var info = el("div", { style: "flex:1;" });
info.appendChild(el("div", { style: "color:var(--gold);font-size:10px;letter-spacing:1.5px;font-weight:bold;" }, "🏆 ДОСТИЖЕНИЕ"));
info.appendChild(el("div", { style: "font-size:13px;font-weight:bold;color:var(--text);margin-top:2px;" }, a.title));
info.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, a.desc));
t.appendChild(info);
container.appendChild(t);
requestAnimationFrame(function () { t.style.opacity = 1; });
setTimeout(function () { t.style.opacity = 0; setTimeout(function () { t.remove(); }, 300); }, 3800);
},

onAnalyze: function (result) {
if (!result || !result.hero) return;
Store.set("analyzedcount", (Store.get("analyzedcount", 0) || 0) + 1);
var unique = Store.get("uniqueheroes", []) || [];
if (unique.indexOf(result.hero.id) < 0) { unique.push(result.hero.id); Store.set("uniqueheroes", unique); }
this.check();
},

onThemeChange: function () {
Store.set("themechanged", true);
this.check();
}
};

function renderAchievements() {
var frag = document.createDocumentFragment();
var unlocked = Achievements.unlocked();
var head = UI.card("🏆 Достижения");
head.appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "Открыто " + unlocked.length + " из " + ACHIEVEMENTS.length));
frag.appendChild(head);

var cats = {};
for (var i = 0; i < ACHIEVEMENTS.length; i++) {
var a = ACHIEVEMENTS[i];
if (!cats[a.cat]) cats[a.cat] = [];
cats[a.cat].push(a);
}
for (var cat in cats) {
if (!cats.hasOwnProperty(cat)) continue;
var card = UI.card(cat);
var grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;" });
var list = cats[cat];
for (var j = 0; j < list.length; j++) {
var b = list[j];
var isOn = unlocked.indexOf(b.id) >= 0;
var tile = el("div", { style: "background:" + (isOn ? "var(--gold-bg)" : "var(--bg-elev)") + ";border:1px solid " + (isOn ? "var(--gold)" : "var(--border)") + ";border-radius:12px;padding:12px;text-align:center;opacity:" + (isOn ? 1 : 0.55) + ";" });
tile.appendChild(el("div", { style: "font-size:32px;filter:" + (isOn ? "none" : "grayscale(1)") + ";" }, b.icon));
tile.appendChild(el("div", { style: "font-size:12px;font-weight:bold;color:" + (isOn ? "var(--gold)" : "var(--text-muted)") + ";margin-top:6px;" }, b.title));
tile.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-top:4px;" }, b.desc));
grid.appendChild(tile);
}
card.appendChild(grid);
frag.appendChild(card);
}
return frag;
}