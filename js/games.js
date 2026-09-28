/* DOTA JETCH — МИНИ-ИГРЫ v3.4.0 */

var QUIZ_QUESTIONS = [
{ q: "Какая способность у Juggernaut даёт неуязвимость?", a: "Omnislash", opts: ["Omnislash", "Blade Fury", "Blade Dance", "Healing Ward"] },
{ q: "Сколько стоит Black King Bar?", a: "4050", opts: ["3900", "4050", "4200", "5000"] },
{ q: "Какой предмет даёт иммунитет к магии?", a: "Black King Bar", opts: ["Linken's Sphere", "Black King Bar", "Lotus Orb", "Eul's"] },
{ q: "Какой герой имеет Blink на 3 заряда?", a: "Anti-Mage", opts: ["Anti-Mage", "Queen of Pain", "Faceless Void", "Storm Spirit"] },
{ q: "Какой предмет снимает сайленс?", a: "Eul's Scepter", opts: ["Manta Style", "Eul's Scepter", "Force Staff", "Glimmer Cape"] },
{ q: "Что делает Rune of Wisdom?", a: "Даёт опыт", opts: ["Золото", "Опыт", "Ману", "HP"] },
{ q: "Кто невидим в ульте?", a: "Slark", opts: ["Riki", "Slark", "Bounty Hunter", "Clinkz"] },
{ q: "Сколько длится стан Scythe of Vyse?", a: "3.5 сек", opts: ["2 сек", "3 сек", "3.5 сек", "5 сек"] },
{ q: "Что даёт Aegis?", a: "Возрождение", opts: ["+HP", "+ману", "Возрождение", "+урон"] },
{ q: "Когда респавнится Roshan?", a: "8-11 минут", opts: ["5 мин", "8-11 мин", "12 мин", "15 мин"] }
];

function shuffle(a) {
var arr = a.slice();
for (var i = arr.length - 1; i > 0; i--) {
var j = Math.floor(Math.random() * (i + 1));
var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
}
return arr;
}

function renderGames() {
var frag = document.createDocumentFragment();
frag.appendChild(UI.heroBanner("Мини-игры", "Тренируй реакцию, знания и память", [
UI.btn("Реакция", { onclick: function () { openGame("reaction"); } }),
UI.btn("Викторина", { onclick: function () { openGame("quiz"); }, variant: "ghost" }),
UI.btn("Угадай героя", { onclick: function () { openGame("guess"); }, variant: "ghost" })
]));
var area = el("div", { id: "gameArea" });
frag.appendChild(area);
return frag;
}

async function openGame(kind) {
var area = qs("#gameArea");
if (!area) return;
area.innerHTML = "";
if (kind === "reaction") area.appendChild(renderReactionGame());
else if (kind === "quiz") area.appendChild(renderQuizGame());
else if (kind === "guess") {
var loading = UI.card("Угадай героя");
loading.appendChild(el("div", { class: "dim", style: "text-align:center;padding:30px;" }, "Загружаю..."));
area.appendChild(loading);
var game = await renderGuessGame();
area.innerHTML = "";
area.appendChild(game);
}
Store.set("gamesplayed", (Store.get("gamesplayed", 0) || 0) + 1);
if (typeof Daily !== "undefined") Daily.bump("game");
if (typeof Achievements !== "undefined") Achievements.check();
}

function renderReactionGame() {
var card = UI.card("Тест реакции");
var pad = el("div", { style: "height:240px;border-radius:14px;background:var(--red);display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;" });
var label = el("div", { style: "color:white;font-size:20px;font-weight:bold;text-align:center;padding:20px;" }, "КЛИКНИ, ЧТОБЫ НАЧАТЬ");
pad.appendChild(label);
card.appendChild(pad);
var result = el("div", { style: "text-align:center;padding:16px;color:var(--text-muted);" }, "-");
card.appendChild(result);
var state = "idle", goTs = 0, timer = null;
pad.addEventListener("click", function () {
if (state === "idle" || state === "done") {
state = "waiting";
pad.style.background = "var(--orange)";
label.textContent = "ЖДИ...";
timer = setTimeout(function () {
state = "go";
pad.style.background = "var(--green)";
label.textContent = "ЖМИ!";
goTs = performance.now();
}, 1000 + Math.random() * 2500);
} else if (state === "waiting") {
clearTimeout(timer);
state = "idle";
pad.style.background = "var(--red)";
label.textContent = "ФАЛЬСТАРТ!";
result.textContent = "Рано...";
} else if (state === "go") {
var dt = Math.round(performance.now() - goTs);
state = "done";
pad.style.background = "var(--accent)";
label.textContent = dt + " мс";
var best = Store.get("reactionbest", 0) || 0;
if (!best || dt < best) Store.set("reactionbest", dt);
result.textContent = "Результат: " + dt + " мс";
if (typeof Achievements !== "undefined") Achievements.check();
}
});
return card;
}

function renderQuizGame() {
var card = UI.card("Викторина");
var bank = shuffle(QUIZ_QUESTIONS).slice(0, 10);
var idx = 0, score = 0;
var content = el("div");
card.appendChild(content);
function show() {
content.innerHTML = "";
if (idx >= bank.length) {
content.appendChild(el("div", { style: "text-align:center;padding:20px;" },
el("div", { style: "font-size:42px;" }, score >= 8 ? "🏆" : score >= 5 ? "👍" : "😐"),
el("div", { style: "font-size:22px;font-weight:bold;margin-top:8px;" }, score + " / " + bank.length)
));
var best = Store.get("quizbest", 0) || 0;
if (score > best) Store.set("quizbest", score);
if (typeof Achievements !== "undefined") Achievements.check();
return;
}
var q = bank[idx];
content.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "Вопрос " + (idx + 1) + "/" + bank.length));
content.appendChild(el("div", { style: "font-size:14px;font-weight:bold;margin:10px 0 14px;" }, q.q));
var opts = shuffle(q.opts);
for (var i = 0; i < opts.length; i++) {
(function (o) {
var b = el("button", { style: "display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;color:var(--text);cursor:pointer;font-family:inherit;" }, o);
b.addEventListener("click", function () {
var correct = o === q.a;
b.style.background = correct ? "var(--green-bg)" : "var(--red-bg)";
if (correct) score++;
var all = content.querySelectorAll("button");
for (var k = 0; k < all.length; k++) all[k].disabled = true;
setTimeout(function () { idx++; show(); }, 700);
});
content.appendChild(b);
})(opts[i]);
}
}
show();
return card;
}

async function renderGuessGame() {
var card = UI.card("Угадай героя");
var content = el("div", { style: "text-align:center;" });
card.appendChild(content);
var heroes = await getHeroes();
var streak = 0, best = Store.get("guessbeststreak", 0) || 0;

function next() {
content.innerHTML = "";
content.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "Стрик: " + streak + " · Лучший: " + best));
var target = heroes[Math.floor(Math.random() * heroes.length)];
var opts = [target];
while (opts.length < 4) {
var h = heroes[Math.floor(Math.random() * heroes.length)];
var dup = false;
for (var i = 0; i < opts.length; i++) if (opts[i].id === h.id) dup = true;
if (!dup) opts.push(h);
}
opts = shuffle(opts);
var imgWrap = el("div", { style: "margin:14px auto;max-width:300px;" });
imgWrap.appendChild(heroImgEl(target, 200));
content.appendChild(imgWrap);
for (var j = 0; j < opts.length; j++) {
(function (h) {
var b = el("button", { style: "display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;color:var(--text);cursor:pointer;font-family:inherit;" }, h.name);
b.addEventListener("click", function () {
var correct = h.id === target.id;
b.style.background = correct ? "var(--green-bg)" : "var(--red-bg)";
if (correct) { streak++; if (streak > best) { best = streak; Store.set("guessbeststreak", best); } }
else streak = 0;
if (typeof Achievements !== "undefined") Achievements.check();
var all = content.querySelectorAll("button");
for (var k = 0; k < all.length; k++) all[k].disabled = true;
setTimeout(next, 800);
});
content.appendChild(b);
})(opts[j]);
}
}
next();
return card;
}