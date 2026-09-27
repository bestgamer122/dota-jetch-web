/* DOTA JETCH — МИНИ-ИГРЫ v3.3.3
Полностью самодостаточный файл. Работает даже без heroes.js. */

const QUIZ_QUESTIONS = [
{ q: "Какая способность у Juggernaut даёт неуязвимость во время атаки?", a: "Omnislash", opts: ["Omnislash", "Blade Fury", "Blade Dance", "Healing Ward"] },
{ q: "Сколько стоит Black King Bar?", a: "4050", opts: ["3900", "4050", "4200", "5000"] },
{ q: "Какая роль у Crystal Maiden обычно?", a: "Позиция 5 (хард сапорт)", opts: ["Позиция 1", "Позиция 2", "Позиция 4", "Позиция 5 (хард сапорт)"] },
{ q: "Какой предмет даёт иммунитет к магии?", a: "Black King Bar", opts: ["Linken's Sphere", "Black King Bar", "Lotus Orb", "Eul's"] },
{ q: "Какой герой имеет способность Blink на 3 заряда?", a: "Anti-Mage", opts: ["Anti-Mage", "Queen of Pain", "Faceless Void", "Storm Spirit"] },
{ q: "Какой предмет снимает сайленс?", a: "Eul's Scepter", opts: ["Manta Style", "Eul's Scepter", "Force Staff", "Glimmer Cape"] },
{ q: "Что делает Rune of Wisdom?", a: "Даёт опыт", opts: ["Даёт золото", "Даёт опыт", "Даёт ману", "Даёт HP"] },
{ q: "Кто из героев может стать невидимым в своей ульте?", a: "Slark", opts: ["Riki", "Slark", "Bounty Hunter", "Clinkz"] },
{ q: "Сколько секунд длится стан от Scythe of Vyse?", a: "3.5 сек", opts: ["2 сек", "3 сек", "3.5 сек", "5 сек"] },
{ q: "Какой герой НЕ может быть саппортом 5?", a: "Medusa", opts: ["Crystal Maiden", "Warlock", "Medusa", "Lion"] },
{ q: "Что даёт Aegis of the Immortal?", a: "Возрождение после смерти", opts: ["+HP", "+ману", "Возрождение после смерти", "+урон"] },
{ q: "Когда респавнится Roshan (примерно)?", a: "8-11 минут", opts: ["5 минут", "8-11 минут", "12 минут", "15 минут"] },
{ q: "Какой предмет даёт +45 Strength?", a: "Heart of Tarrasque", opts: ["Sange", "Reaver", "Heart of Tarrasque", "Satanic"] },
{ q: "Какая способность Invoker наносит глобальный урон?", a: "Sunstrike", opts: ["Sunstrike", "Meteor", "Deafening Blast", "Chaos Meteor"] },
{ q: "Что такое Deny?", a: "Убийство своего юнита", opts: ["Убийство врага", "Убийство своего юнита", "Побег", "Возврат"] },
{ q: "Сколько золота даёт Bounty Rune всей команде?", a: "~40 за каждого", opts: ["~40 за каждого", "~100", "~200", "Бесплатно"] },
{ q: "Кто из героев имеет способность Mana Shield?", a: "Medusa", opts: ["Anti-Mage", "Medusa", "Morphling", "Razor"] },
{ q: "Какой герой может скопировать ульту врага?", a: "Rubick", opts: ["Rubick", "Morphling", "Doppelganger", "Puck"] },
{ q: "Что делает Refresher Orb?", a: "Сбрасывает кулдауны", opts: ["Восстанавливает HP", "Сбрасывает кулдауны", "Даёт ману", "Телепорт"] },
{ q: "Сколько секунд длится действие Smoke of Deceit?", a: "35 сек", opts: ["20 сек", "35 сек", "45 сек", "60 сек"] },
{ q: "Какой герой ставит Remote Mine?", a: "Techies", opts: ["Techies", "Tinker", "Clockwerk", "Sniper"] },
{ q: "Что такое Creep Stacking?", a: "Агр крипов для увеличения лагеря", opts: ["Убийство крипов", "Агр крипов для увеличения лагеря", "Пул крипов на линию", "Побег от крипов"] },
{ q: "Какой стат даёт +7 HP за единицу?", a: "Strength", opts: ["Agility", "Intelligence", "Strength", "Универсальный"] },
{ q: "Какая способность Zeus даёт вижен на карте?", a: "Thundergod's Wrath", opts: ["Lightning Bolt", "Thundergod's Wrath", "Arc Lightning", "Static Field"] },
{ q: "Что такое KDA?", a: "Kills / Deaths / Assists", opts: ["Kills / Damage / Armor", "Kills / Deaths / Assists", "Kills / Denies / Assists", "Kills / Damage / Assists"] },
];

/* ─── Fallback-список героев (работает без heroes.js и без OpenDota) ─── */
const FALLBACK_HEROES = [
{ id: 1,   name: "Anti-Mage" }, { id: 2,  name: "Axe" }, { id: 3, name: "Bane" },
{ id: 4,   name: "Bloodseeker" }, { id: 5, name: "Crystal Maiden" }, { id: 6, name: "Drow Ranger" },
{ id: 7,   name: "Earthshaker" }, { id: 8, name: "Juggernaut" }, { id: 9, name: "Mirana" },
{ id: 10,  name: "Morphling" }, { id: 11, name: "Shadow Fiend" }, { id: 12, name: "Phantom Lancer" },
{ id: 13,  name: "Puck" }, { id: 14, name: "Pudge" }, { id: 15, name: "Razor" },
{ id: 16,  name: "Sand King" }, { id: 17, name: "Storm Spirit" }, { id: 18, name: "Sven" },
{ id: 19,  name: "Tiny" }, { id: 20, name: "Vengeful Spirit" }, { id: 21, name: "Windranger" },
{ id: 22,  name: "Zeus" }, { id: 23, name: "Kunkka" }, { id: 25, name: "Lina" },
{ id: 26,  name: "Lion" }, { id: 27, name: "Shadow Shaman" }, { id: 28, name: "Slardar" },
{ id: 29,  name: "Tidehunter" }, { id: 30, name: "Witch Doctor" }, { id: 31, name: "Lich" },
{ id: 32,  name: "Riki" }, { id: 33, name: "Enigma" }, { id: 34, name: "Tinker" },
{ id: 35,  name: "Sniper" }, { id: 36,  name: "Necrophos" }, { id: 37, name: "Warlock" },
{ id: 38,  name: "Beastmaster" }, { id: 39, name: "Queen of Pain" }, { id: 40, name: "Venomancer" },
{ id: 41,  name: "Faceless Void" }, { id: 42, name: "Wraith King" }, { id: 43, name: "Death Prophet" },
{ id: 44,  name: "Phantom Assassin" }, { id: 45, name: "Pugna" }, { id: 46, name: "Templar Assassin" },
{ id: 47,  name: "Viper" }, { id: 48,  name: "Luna" }, { id: 49, name: "Dragon Knight" },
{ id: 50,  name: "Dazzle" }, { id: 51,  name: "Clockwerk" }, { id: 52, name: "Leshrac" },
{ id: 53,  name: "Nature's Prophet" }, { id: 54, name: "Lifestealer" }, { id: 55, name: "Dark Seer" },
{ id: 56,  name: "Clinkz" }, { id: 57,  name: "Omniknight" }, { id: 58, name: "Enchantress" },
{ id: 59,  name: "Huskar" }, { id: 60,  name: "Night Stalker" }, { id: 61, name: "Broodmother" },
{ id: 62,  name: "Bounty Hunter" }, { id: 63, name: "Weaver" }, { id: 64, name: "Jakiro" },
{ id: 65,  name: "Batrider" }, { id: 66, name: "Chen" }, { id: 67, name: "Spectre" },
{ id: 68,  name: "Ancient Apparition" }, { id: 69, name: "Doom" }, { id: 70, name: "Ursa" },
{ id: 71,  name: "Spirit Breaker" }, { id: 72, name: "Gyrocopter" }, { id: 73, name: "Alchemist" },
{ id: 74,  name: "Invoker" }, { id: 75, name: "Silencer" }, { id: 76, name: "Outworld Destroyer" },
{ id: 77,  name: "Lycan" }, { id: 78, name: "Brewmaster" }, { id: 79, name: "Shadow Demon" },
{ id: 80,  name: "Lone Druid" }, { id: 81, name: "Chaos Knight" }, { id: 82, name: "Meepo" },
{ id: 83,  name: "Treant Protector" }, { id: 84, name: "Ogre Magi" }, { id: 85, name: "Undying" },
{ id: 86,  name: "Rubick" }, { id: 87, name: "Disruptor" }, { id: 88, name: "Nyx Assassin" },
{ id: 89,  name: "Naga Siren" }, { id: 90, name: "Keeper of the Light" }, { id: 91, name: "Io" },
{ id: 92,  name: "Visage" }, { id: 93,  name: "Slark" }, { id: 94, name: "Medusa" },
{ id: 95,  name: "Troll Warlord" }, { id: 96, name: "Centaur Warrunner" }, { id: 97, name: "Magnus" },
{ id: 98,  name: "Timbersaw" }, { id: 99, name: "Bristleback" }, { id: 100, name: "Tusk" },
{ id: 101, name: "Skywrath Mage" }, { id: 102, name: "Abaddon" }, { id: 103, name: "Elder Titan" },
{ id: 104, name: "Legion Commander" }, { id: 105, name: "Techies" }, { id: 106, name: "Ember Spirit" },
{ id: 107, name: "Earth Spirit" }, { id: 108, name: "Underlord" }, { id: 109, name: "Terrorblade" },
{ id: 110, name: "Phoenix" }, { id: 111, name: "Oracle" }, { id: 112, name: "Winter Wyvern" },
{ id: 113, name: "Arc Warden" }, { id: 114, name: "Monkey King" }, { id: 119, name: "Dark Willow" },
{ id: 120, name: "Pangolier" }, { id: 121, name: "Grimstroke" }, { id: 123, name: "Hoodwink" },
{ id: 126, name: "Void Spirit" }, { id: 128, name: "Snapfire" }, { id: 129, name: "Mars" },
{ id: 131, name: "Dawnbreaker" }, { id: 135, name: "Dawnbreaker" }, { id: 136, name: "Marci" },
{ id: 137, name: "Primal Beast" }, { id: 138, name: "Muerta" },
];

/* ─── Универсальный доступ к heroes.js (если загружен) ─── */
async function _getGuessHeroes() {
// 1. Пробуем heroes.js (если загружен)
try {
if (typeof getHeroes === "function") {
const list = await getHeroes();
if (Array.isArray(list) && list.length >= 10) return list;
}
} catch (e) {
console.warn("[games.js] getHeroes() failed, fallback:", e && e.message);
}
// 2. Пробуем window.getHeroes
try {
if (window.getHeroes && typeof window.getHeroes === "function") {
const list = await window.getHeroes();
if (Array.isArray(list) && list.length >= 10) return list;
}
} catch (e) {
console.warn("[games.js] window.getHeroes() failed:", e && e.message);
}
// 3. Fallback: встроенный список
console.warn("[games.js] Использую встроенный fallback-список героев");
return FALLBACK_HEROES.slice();
}

/* ─── Краткие имена для fallback-картинок ─── */
function _shortName(name) {
if (typeof heroShort === "function") return heroShort(name);
const w = String(name || "?").split(/\s+/).filter(Boolean);
if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
return w.slice(0, 3).map(function (x) { return x[0]; }).join("").toUpperCase();
}

function _heroHue(name) {
let h = 0;
for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
return h;
}

function _heroGradient(name) {
const h = _heroHue(name || "?");
const h2 = (h + 60) % 360;
return "linear-gradient(135deg, hsl(" + h + " 75% 42%), hsl(" + h2 + " 70% 26%))";
}

/* Создать карточку героя с fallback (без зависимостей от heroes.js) */
function _guessHeroCard(hero) {
const wrap = el("div", {
style: "position:relative;width:100%;aspect-ratio:16/9;border-radius:14px;overflow:hidden;border:1px solid var(--border-hl);background:" + _heroGradient(hero.name) + ";"
});
const short = _shortName(hero.name);
const fb = el("div", {
style: "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:60px;font-weight:800;color:rgba(255,255,255,0.9);font-family:'JetBrains Mono',monospace;text-shadow:0 4px 20px rgba(0,0,0,0.6);letter-spacing:0.04em;z-index:0;"
}, short);
wrap.appendChild(fb);

// Пробуем загрузить CDN-картинку (если heroes.js доступен и CDN не заблокирован)
const path = hero.imgPath || hero.img || "";
if (path && typeof cdnUrlVariants === "function" && typeof makeSmartImg === "function") {
const urls = cdnUrlVariants(path);
const img = makeSmartImg(urls, hero.name,
"position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;");
if (img) wrap.appendChild(img);
}
return wrap;
}

function shuffle(a) {
const arr = a.slice();
for (let i = arr.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
}
return arr;
}

function renderGames() {
const frag = document.createDocumentFragment();

frag.appendChild(UI.heroBanner(
"Мини-игры",
"Тренируй реакцию, знания и память",
[
UI.btn("Реакция", { onclick: function() { openGame("reaction"); } }),
UI.btn("Викторина", { onclick: function() { openGame("quiz"); }, variant: "ghost" }),
UI.btn("Угадай героя", { onclick: function() { openGame("guess"); }, variant: "ghost" }),
]
));

const stats = el("div", { class: "stat-grid" });
const rBest = Store.get("reaction_best", 0) || 0;
const qBest = Store.get("quiz_best", 0) || 0;
const gBest = Store.get("guess_best_streak", 0) || 0;
stats.appendChild(UI.statCard("R", "var(--yellow)", "var(--yellow-bg)", "Реакция", rBest ? rBest + " мс" : "-", "лучший"));
stats.appendChild(UI.statCard("Q", "var(--cyan)", "var(--cyan-bg)", "Викторина", qBest ? qBest + "/10" : "-", "лучший"));
stats.appendChild(UI.statCard("G", "var(--green)", "var(--green-bg)", "Стрик героев", gBest ? String(gBest) : "-", "макс. подряд"));
frag.appendChild(stats);

const info = UI.card("Как играть");
info.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.7;" },
"Реакция — жди зелёный сигнал, жми как можно быстрее.",
el("br"),
"Викторина — 10 вопросов по Dota 2.",
el("br"),
"Угадай героя — выбери правильное имя по иконке."
));
frag.appendChild(info);

const area = el("div", { id: "gameArea" });
frag.appendChild(area);

return frag;
}

async function openGame(kind) {
const area = qs("#gameArea");
if (!area) return;
area.innerHTML = "";
try {
if (kind === "reaction") {
area.appendChild(renderReactionGame());
} else if (kind === "quiz") {
area.appendChild(renderQuizGame());
} else if (kind === "guess") {
const loading = UI.card("Угадай героя");
loading.appendChild(el("div", { class: "dim", style: "text-align:center;padding:30px;" }, "Загружаю героев..."));
area.appendChild(loading);
const game = await renderGuessGame();
if (game) {
area.innerHTML = "";
area.appendChild(game);
}
}
} catch (e) {
area.innerHTML = "";
const errCard = UI.card("Ошибка");
errCard.appendChild(el("div", { style: "color:var(--red);padding:20px;font-size:13px;" },
"Не удалось запустить игру: " + (e.message || String(e))));
area.appendChild(errCard);
console.error("[games.js] openGame error:", e);
}
area.scrollIntoView({ behavior: "smooth", block: "start" });
Store.set("games_played", (Store.get("games_played", 0) || 0) + 1);
if (typeof Daily !== "undefined") Daily.bump("game");
if (typeof Achievements !== "undefined") Achievements.check();
}

function renderReactionGame() {
const card = UI.card("Тест реакции");
card.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;" },
"Кликни по полю, когда оно станет зелёным."));

const pad = el("div", {
style: "height:240px;border-radius:14px;background:var(--red);display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;transition:background 0.15s ease;"
});
const label = el("div", { style: "color:white;font-size:20px;font-weight:bold;text-align:center;padding:20px;" }, "КЛИКНИ, ЧТОБЫ НАЧАТЬ");
pad.appendChild(label);
card.appendChild(pad);

const result = el("div", { style: "text-align:center;padding:16px;font-size:14px;color:var(--text-muted);" }, "-");
card.appendChild(result);

let state = "idle";
let goTs = 0;
let timer = null;

pad.addEventListener("click", function () {
if (state === "idle" || state === "done") {
state = "waiting";
pad.style.background = "var(--orange)";
label.textContent = "ЖДИ ЗЕЛЁНОГО...";
result.textContent = "-";
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
label.textContent = "ФАЛЬСТАРТ! Кликни заново";
result.textContent = "Слишком рано...";
} else if (state === "go") {
const dt = Math.round(performance.now() - goTs);
state = "done";
pad.style.background = "var(--accent)";
label.textContent = dt + " мс";
const best = Store.get("reaction_best", 0) || 0;
const isBest = !best || dt < best;
if (isBest) Store.set("reaction_best", dt);
result.textContent = isBest
? "Новый рекорд! Кликни, чтобы попробовать ещё."
: "Твой результат: " + dt + " мс. Лучший: " + best + " мс.";
if (typeof Achievements !== "undefined") Achievements.check();
}
});

return card;
}

function renderQuizGame() {
const card = UI.card("Викторина");
const bank = shuffle(QUIZ_QUESTIONS).slice(0, 10);
let idx = 0;
let score = 0;

const content = el("div");
card.appendChild(content);

function showQuestion() {
content.innerHTML = "";
if (idx >= bank.length) {
content.appendChild(el("div", { style: "text-align:center;padding:20px;" },
el("div", { style: "font-size:42px;" }, score >= 8 ? "🏆" : score >= 5 ? "👍" : "😐"),
el("div", { style: "font-size:22px;font-weight:bold;margin-top:8px;color:var(--text);" }, score + " / " + bank.length),
el("div", { class: "dim", style: "font-size:12px;margin-top:6px;" }, score >= 8 ? "Отличный результат!" : score >= 5 ? "Неплохо, но можно лучше." : "Стоит повторить матчасть.")
));
const best = Store.get("quiz_best", 0) || 0;
if (score > best) Store.set("quiz_best", score);
if (typeof Achievements !== "undefined") Achievements.check();
const again = UI.btn("Ещё раз");
again.addEventListener("click", function () { openGame("quiz"); });
content.appendChild(el("div", { style: "text-align:center;" }, again));
return;
}
const q = bank[idx];
content.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "Вопрос " + (idx + 1) + " / " + bank.length + " · Счёт: " + score));
const bar = el("div", { style: "height:6px;background:var(--bg-elev);border-radius:3px;overflow:hidden;margin:8px 0 14px;" });
bar.appendChild(el("div", { style: "height:100%;width:" + (idx / bank.length * 100) + "%;background:var(--accent);" }));
content.appendChild(bar);
content.appendChild(el("div", { style: "font-size:14px;font-weight:bold;margin-bottom:14px;color:var(--text);" }, q.q));

const opts = shuffle(q.opts);
for (const o of opts) {
const b = el("button", {
style: "display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;cursor:pointer;font-family:inherit;transition:all 0.15s ease;"
}, o);
b.addEventListener("click", function () {
const correct = o === q.a;
b.style.background = correct ? "var(--green-bg)" : "var(--red-bg)";
b.style.borderColor = correct ? "var(--green)" : "var(--red)";
b.style.color = correct ? "var(--green)" : "var(--red)";
if (correct) score++;
const allBtns = content.querySelectorAll("button");
for (let i = 0; i < allBtns.length; i++) allBtns[i].disabled = true;
setTimeout(function () { idx++; showQuestion(); }, 700);
});
content.appendChild(b);
}
}

showQuestion();
return card;
}

async function renderGuessGame() {
const card = UI.card("Угадай героя");
card.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;" },
"Выбери правильное имя для показанной иконки."));

const content = el("div", { style: "text-align:center;" });
card.appendChild(content);

let streak = 0;
let best = Store.get("guess_best_streak", 0) || 0;
let heroes = await _getGuessHeroes();

if (!heroes || !heroes.length) {
content.appendChild(el("div", { class: "dim", style: "padding:20px;color:var(--red);" }, "Не удалось загрузить список героев."));
return card;
}

/* Отфильтруем героев без id/name */
heroes = heroes.filter(function (h) { return h && h.id && h.name; });

function nextRound() {
content.innerHTML = "";
content.appendChild(el("div", { class: "dim", style: "font-size:11px;" },
"Стрик: " + streak + " · Лучший: " + best));

const target = heroes[Math.floor(Math.random() * heroes.length)];
const opts = [target];
let tries = 0;
while (opts.length < 4 && tries < 100) {
tries++;
const h = heroes[Math.floor(Math.random() * heroes.length)];
let dup = false;
for (const o of opts) if (o.id === h.id) dup = true;
if (!dup) opts.push(h);
}
const shuffledOpts = shuffle(opts);

const heroCard = el("div", { style: "margin:14px auto;max-width:340px;" });
heroCard.appendChild(_guessHeroCard(target));
content.appendChild(heroCard);

for (const h of shuffledOpts) {
const b = el("button", {
style: "display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;cursor:pointer;font-family:inherit;transition:all 0.15s ease;"
}, h.name);
b.addEventListener("click", function () {
const correct = h.id === target.id;
b.style.background = correct ? "var(--green-bg)" : "var(--red-bg)";
b.style.borderColor = correct ? "var(--green)" : "var(--red)";
b.style.color = correct ? "var(--green)" : "var(--red)";
const allBtns = content.querySelectorAll("button");
for (let i = 0; i < allBtns.length; i++) allBtns[i].disabled = true;
if (correct) {
streak++;
if (streak > best) { best = streak; Store.set("guess_best_streak", best); }
} else {
streak = 0;
}
if (typeof Achievements !== "undefined") Achievements.check();
setTimeout(nextRound, 800);
});
content.appendChild(b);
}
}

nextRound();
return card;
}