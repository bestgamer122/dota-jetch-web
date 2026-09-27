/* DOTA JETCH — FALLBACK (самодостаточный)
Содержит все функции для работы analyze/games/history
даже если heroes.js не загрузился или повреждён. */

(function () {
"use strict";

/* ─── Список героев (для игр и поиска) ─── */
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
{ id: 35,  name: "Sniper" }, { id: 36, name: "Necrophos" }, { id: 37, name: "Warlock" },
{ id: 38,  name: "Beastmaster" }, { id: 39, name: "Queen of Pain" }, { id: 40, name: "Venomancer" },
{ id: 41,  name: "Faceless Void" }, { id: 42, name: "Wraith King" }, { id: 43, name: "Death Prophet" },
{ id: 44,  name: "Phantom Assassin" }, { id: 45, name: "Pugna" }, { id: 46, name: "Templar Assassin" },
{ id: 47,  name: "Viper" }, { id: 48, name: "Luna" }, { id: 49, name: "Dragon Knight" },
{ id: 50,  name: "Dazzle" }, { id: 51, name: "Clockwerk" }, { id: 52, name: "Leshrac" },
{ id: 53,  name: "Nature's Prophet" }, { id: 54, name: "Lifestealer" }, { id: 55, name: "Dark Seer" },
{ id: 56,  name: "Clinkz" }, { id: 57, name: "Omniknight" }, { id: 58, name: "Enchantress" },
{ id: 59,  name: "Huskar" }, { id: 60, name: "Night Stalker" }, { id: 61, name: "Broodmother" },
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
{ id: 131, name: "Dawnbreaker" }, { id: 136, name: "Marci" },
{ id: 137, name: "Primal Beast" }, { id: 138, name: "Muerta" },
];

/* ─── Алиасы (русские прозвища) ─── */
const HERO_ALIASES = {
"жугер":"Juggernaut","жуггернаут":"Juggernaut","джагернаут":"Juggernaut",
"сф":"Shadow Fiend","инвокер":"Invoker","вока":"Invoker",
"пугна":"Pudge","пудж":"Pudge","сларк":"Slark",
"дров":"Drow Ranger","тракса":"Drow Ranger","снайпер":"Sniper","снайп":"Sniper",
"свен":"Sven","ск":"Sand King","цм":"Crystal Maiden","кристалка":"Crystal Maiden",
"лк":"Wraith King","вр":"Vengeful Spirit","ам":"Anti-Mage","антимаг":"Anti-Mage",
"па":"Phantom Assassin","фантомка":"Phantom Assassin","мортра":"Phantom Assassin",
"террор":"Terrorblade","шторм":"Storm Spirit","энигма":"Enigma",
"спектра":"Spectre","спек":"Spectre","зевс":"Zeus","лайфстил":"Lifestealer",
"маг":"Magnus","магнус":"Magnus","рубик":"Rubick","феникс":"Phoenix",
"мипо":"Meepo","арка":"Arc Warden","тимбер":"Timbersaw","тини":"Tiny",
"бара":"Spirit Breaker","некр":"Necrophos","дк":"Dragon Knight",
"тролль":"Troll Warlord","клок":"Clockwerk","дуза":"Medusa","медуза":"Medusa",
"луна":"Luna","тайдер":"Tidehunter","об":"Outworld Destroyer","од":"Outworld Destroyer",
"кур":"Kunkka","кунка":"Kunkka","марси":"Mars","войд":"Faceless Void",
"урса":"Ursa","хуск":"Huskar","слардар":"Slardar","панго":"Pangolier",
"бристл":"Bristleback","цк":"Chaos Knight","венга":"Vengeful Spirit",
"никс":"Nyx Assassin","фурион":"Nature's Prophet","нп":"Nature's Prophet",
"виса":"Visage","брунка":"Primal Beast","муэрта":"Muerta","хоуд":"Hoodwink",
"даун":"Dawnbreaker",
"аба":"Abaddon","абадон":"Abaddon",
"алх":"Alchemist","алхимик":"Alchemist",
"аппарат":"Ancient Apparition",
"бейн":"Bane","батрайдер":"Batrider","бист":"Beastmaster","бистмастер":"Beastmaster",
"центур":"Centaur Warrunner","центавр":"Centaur Warrunner",
"чен":"Chen","клинкз":"Clinkz","дарксир":"Dark Seer",
"дазл":"Dazzle","дизраптор":"Disruptor","шейкер":"Earthshaker",
"эмбер":"Ember Spirit","энча":"Enchantress","гиро":"Gyrocopter",
"ио":"Io","джакиро":"Jakiro","котел":"Keeper of the Light",
"лешрак":"Leshrac","леш":"Leshrac","лич":"Lich",
"ликан":"Lycan","мирана":"Mirana","нс":"Night Stalker",
"пак":"Puck","разор":"Razor","раста":"Shadow Shaman",
"скай":"Skywrath Mage","снапфаер":"Snapfire","течис":"Techies",
"трент":"Treant Protector","туск":"Tusk","андерлорд":"Underlord",
"вено":"Venomancer","висаж":"Visage","виндра":"Windranger",
"виверна":"Winter Wyvern","вивер":"Winter Wyvern",
"тинкер":"Tinker","лина":"Lina","зеус":"Zeus","морф":"Morphling",
};

/* ─── Короткие инициалы для иконок ─── */
const HERO_SHORT = {
"Anti-Mage":"AM","Ancient Apparition":"AA","Arc Warden":"AW","Bounty Hunter":"BH",
"Bristleback":"BB","Crystal Maiden":"CM","Drow Ranger":"DR","Earth Spirit":"ES",
"Earthshaker":"ES","Ember Spirit":"ES","Faceless Void":"FV","Keeper of the Light":"KotL",
"Legion Commander":"LC","Lifestealer":"LS","Lone Druid":"LD","Monkey King":"MK",
"Nature's Prophet":"NP","Night Stalker":"NS","Outworld Destroyer":"OD",
"Phantom Assassin":"PA","Phantom Lancer":"PL","Queen of Pain":"QoP",
"Shadow Fiend":"SF","Skywrath Mage":"SM","Spirit Breaker":"SB",
"Storm Spirit":"SS","Templar Assassin":"TA","Treant Protector":"TP",
"Vengeful Spirit":"VS","Wraith King":"WK","Winter Wyvern":"WW",
"Windranger":"WR","Shadow Shaman":"SS","Sand King":"SK","Dragon Knight":"DK",
"Death Prophet":"DP","Dark Willow":"DW","Dark Seer":"DS","Dazzle":"DZ",
"Nyx Assassin":"NA","Void Spirit":"VS","Centaur Warrunner":"CW",
"Chaos Knight":"CK","Doom":"DOOM","Elder Titan":"ET","Gyrocopter":"GYRO",
"Ursa":"URSA","Underlord":"UL","Undying":"UND","Viper":"VIP","Visage":"VIS",
"Warlock":"WL","Weaver":"WEA","Zeus":"ZEUS","Bloodseeker":"BS",
"Bane":"BANE","Batrider":"BAT","Beastmaster":"BM","Brewmaster":"BM",
"Broodmother":"BRO","Chen":"CHEN","Clinkz":"CL","Clockwerk":"CW",
"Enchantress":"ENCH","Enigma":"ENG","Io":"IO","Jakiro":"JAK",
"Leshrac":"LESH","Lich":"LICH","Lina":"LINA","Lion":"LION",
"Lycan":"LYC","Magnus":"MAG","Medusa":"MED","Meepo":"MEEPO",
"Mirana":"MIRA","Morphling":"MORPH","Naga Siren":"NAGA","Necrophos":"NEC",
"Ogre Magi":"OGRE","Omniknight":"OMNI","Oracle":"ORA","Pangolier":"PANG",
"Phoenix":"PHX","Primal Beast":"PB","Puck":"PUCK","Pudge":"PUDGE",
"Pugna":"PUGNA","Razor":"RAZ","Riki":"RIKI","Rubick":"RUB",
"Slardar":"SLAR","Slark":"SLARK","Snapfire":"SNAP","Sniper":"SNIP",
"Spectre":"SPEC","Terrorblade":"TB","Tidehunter":"TIDE","Timbersaw":"TIMB",
"Tinker":"TINK","Tiny":"TINY","Troll Warlord":"TW","Tusk":"TUSK",
"Techies":"TECH","Mars":"MARS","Hoodwink":"HOOD","Dawnbreaker":"DAWN",
"Marci":"MARCI","Muerta":"MUERTA","Kez":"KEZ","Ringmaster":"RING",
};

function _shortName(name) {
if (!name) return "?";
if (HERO_SHORT[name]) return HERO_SHORT[name];
const w = String(name).split(/\s+/).filter(Boolean);
if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
return w.slice(0, 3).map(function (x) { return x[0]; }).join("").toUpperCase();
}

function _hue(name) {
let h = 0;
for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
return h;
}

function _gradient(name) {
const h = _hue(name || "?");
const h2 = (h + 60) % 360;
return "linear-gradient(135deg, hsl(" + h + " 75% 42%), hsl(" + h2 + " 70% 26%))";
}

/* ─── Публичные функции ─── */
window.getHeroes = async function () {
return FALLBACK_HEROES.slice();
};

window.findHeroId = async function (nameOrAlias) {
if (!nameOrAlias) return null;
const q = nameOrAlias.trim().toLowerCase();
if (!q) return null;
const alias = HERO_ALIASES[q];
const needle = alias ? alias.toLowerCase() : q;
const heroes = await window.getHeroes();
if (!heroes.length) return null;
for (const h of heroes) if (h.name.toLowerCase() === needle) return h;
for (const h of heroes) if (needle.length >= 3 && h.name.toLowerCase().includes(needle)) return h;
if (needle.length >= 4) for (const h of heroes) if (h.name.toLowerCase().startsWith(needle.slice(0, 4))) return h;
return null;
};

window.findHeroById = function (id, heroes) {
if (!heroes) return null;
return heroes.find(function (h) { return h.id === id; }) || null;
};

window.heroShort = _shortName;
window.heroGradient = _gradient;

window.heroImgEl = function (hero, size, extraStyle) {
size = size || 64;
const r = Math.max(8, Math.round(size * 0.14));
const wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;flex-shrink:0;overflow:hidden;" +
"width:" + size + "px;height:" + size + "px;" +
"border-radius:" + r + "px;" +
"border:2px solid rgba(167,139,250,0.55);" +
"background:" + _gradient(hero ? hero.name : "?") + ";" +
"display:flex;align-items:center;justify-content:center;" +
"box-shadow:inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 14px -6px rgba(0,0,0,0.7);" +
(extraStyle || "");
const fb = document.createElement("div");
fb.style.cssText =
"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
"font-size:" + Math.round(size * 0.34) + "px;font-weight:800;" +
"color:rgba(255,255,255,0.92);font-family:'JetBrains Mono',monospace;" +
"letter-spacing:0.02em;text-shadow:0 2px 6px rgba(0,0,0,0.55);pointer-events:none;user-select:none;";
fb.textContent = _shortName(hero ? hero.name : "?");
wrap.appendChild(fb);
return wrap;
};

window.heroTileEl = function (hero, opts) {
opts = opts || {};
const wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;" +
"overflow:hidden;background:" + _gradient(hero ? hero.name : "?") + ";" +
"border:2px solid " + (opts.borderColor || "transparent") + ";" +
"box-shadow:inset 0 1px 0 rgba(255,255,255,0.12);";
const fb = document.createElement("div");
fb.style.cssText =
"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
"font-size:15px;font-weight:800;color:rgba(255,255,255,0.92);" +
"font-family:'JetBrains Mono',monospace;text-shadow:0 2px 5px rgba(0,0,0,0.5);" +
"pointer-events:none;letter-spacing:0.02em;";
fb.textContent = _shortName(hero ? hero.name : "?");
wrap.appendChild(fb);
if (opts.kda) {
const kda = document.createElement("div");
kda.style.cssText =
"position:absolute;bottom:0;left:0;right:0;padding:4px;" +
"background:linear-gradient(0deg,rgba(0,0,0,0.9),transparent);" +
"font-size:9px;font-weight:700;color:#fff;text-align:center;" +
"font-family:'JetBrains Mono',monospace;z-index:2;";
kda.textContent = opts.kda;
wrap.appendChild(kda);
}
return wrap;
};

window.itemImgEl = function (item) {
const wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;" +
"overflow:hidden;background:var(--bg-elev);border:1px solid var(--border);" +
"display:flex;align-items:center;justify-content:center;";
const fb = document.createElement("div");
fb.style.cssText =
"font-size:10px;font-weight:800;color:rgba(255,255,255,0.45);" +
"font-family:'JetBrains Mono',monospace;text-align:center;padding:2px;letter-spacing:-0.03em;";
fb.textContent = item ? (item.name || "?").split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 3).toUpperCase() : "";
wrap.appendChild(fb);
return wrap;
};

window.cdnUrlVariants = function () { return []; };
window.makeSmartImg = function () { return null; };
window.normalizeCdnPath = function (p) { return p || ""; };
window.cdnEnabled = function () { return false; };

/* Перцентили */
window.percentileOf = function (bench, key, value) {
if (!bench || !bench[key] || !Array.isArray(bench[key])) return null;
const arr = bench[key].slice().sort(function (a, b) { return (a.percentile || 0) - (b.percentile || 0); });
if (!arr.length) return null;
const v0 = arr[0].value || 0;
const vN = arr[arr.length - 1].value || 0;
if (value <= v0) return (arr[0].percentile || 0) * 100;
if (value >= vN) return (arr[arr.length - 1].percentile || 0) * 100;
for (let i = 1; i < arr.length; i++) {
const a = arr[i - 1], b = arr[i];
const av = a.value || 0, bv = b.value || 0;
if (value <= bv) {
const d = bv - av;
if (d === 0) return (b.percentile || 0) * 100;
const frac = (value - av) / d;
const pa = a.percentile || 0, pb = b.percentile || 0;
return (pa + frac * (pb - pa)) * 100;
}
}
return null;
};

window.pctGrade = function (pct) {
if (pct === null || pct === undefined) return "—";
if (pct >= 90) return "S";
if (pct >= 75) return "A";
if (pct >= 50) return "B";
if (pct >= 25) return "C";
return "D";
};

window.pctColor = function (pct) {
if (pct === null || pct === undefined) return "var(--text-dim)";
if (pct >= 75) return "var(--green)";
if (pct >= 50) return "var(--yellow)";
if (pct >= 25) return "var(--orange)";
return "var(--red)";
};

console.log("[fallback.js] Самодостаточные функции готовы");
})();