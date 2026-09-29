/* DOTA JETCH — FALLBACK v4.1.0

- Каталог предметов, + красивые fallback-иконки, + lite-mode. */

(function () {
"use strict";

var FALLBACK_HEROES = [
{ id: 1, name: "Anti-Mage" }, { id: 2, name: "Axe" }, { id: 3, name: "Bane" },
{ id: 4, name: "Bloodseeker" }, { id: 5, name: "Crystal Maiden" }, { id: 6, name: "Drow Ranger" },
{ id: 7, name: "Earthshaker" }, { id: 8, name: "Juggernaut" }, { id: 9, name: "Mirana" },
{ id: 10, name: "Morphling" }, { id: 11, name: "Shadow Fiend" }, { id: 12, name: "Phantom Lancer" },
{ id: 13, name: "Puck" }, { id: 14, name: "Pudge" }, { id: 15, name: "Razor" },
{ id: 16, name: "Sand King" }, { id: 17, name: "Storm Spirit" }, { id: 18, name: "Sven" },
{ id: 19, name: "Tiny" }, { id: 20, name: "Vengeful Spirit" }, { id: 21, name: "Windranger" },
{ id: 22, name: "Zeus" }, { id: 23, name: "Kunkka" }, { id: 25, name: "Lina" },
{ id: 26, name: "Lion" }, { id: 27, name: "Shadow Shaman" }, { id: 28, name: "Slardar" },
{ id: 29, name: "Tidehunter" }, { id: 30, name: "Witch Doctor" }, { id: 31, name: "Lich" },
{ id: 32, name: "Riki" }, { id: 33, name: "Enigma" }, { id: 34, name: "Tinker" },
{ id: 35, name: "Sniper" }, { id: 36, name: "Necrophos" }, { id: 37, name: "Warlock" },
{ id: 38, name: "Beastmaster" }, { id: 39, name: "Queen of Pain" }, { id: 40, name: "Venomancer" },
{ id: 41, name: "Faceless Void" }, { id: 42, name: "Wraith King" }, { id: 43, name: "Death Prophet" },
{ id: 44, name: "Phantom Assassin" }, { id: 45, name: "Pugna" }, { id: 46, name: "Templar Assassin" },
{ id: 47, name: "Viper" }, { id: 48, name: "Luna" }, { id: 49, name: "Dragon Knight" },
{ id: 50, name: "Dazzle" }, { id: 51, name: "Clockwerk" }, { id: 52, name: "Leshrac" },
{ id: 53, name: "Nature's Prophet" }, { id: 54, name: "Lifestealer" }, { id: 55, name: "Dark Seer" },
{ id: 56, name: "Clinkz" }, { id: 57, name: "Omniknight" }, { id: 58, name: "Enchantress" },
{ id: 59, name: "Huskar" }, { id: 60, name: "Night Stalker" }, { id: 61, name: "Broodmother" },
{ id: 62, name: "Bounty Hunter" }, { id: 63, name: "Weaver" }, { id: 64, name: "Jakiro" },
{ id: 65, name: "Batrider" }, { id: 66, name: "Chen" }, { id: 67, name: "Spectre" },
{ id: 68, name: "Ancient Apparition" }, { id: 69, name: "Doom" }, { id: 70, name: "Ursa" },
{ id: 71, name: "Spirit Breaker" }, { id: 72, name: "Gyrocopter" }, { id: 73, name: "Alchemist" },
{ id: 74, name: "Invoker" }, { id: 75, name: "Silencer" }, { id: 76, name: "Outworld Destroyer" },
{ id: 77, name: "Lycan" }, { id: 78, name: "Brewmaster" }, { id: 79, name: "Shadow Demon" },
{ id: 80, name: "Lone Druid" }, { id: 81, name: "Chaos Knight" }, { id: 82, name: "Meepo" },
{ id: 83, name: "Treant Protector" }, { id: 84, name: "Ogre Magi" }, { id: 85, name: "Undying" },
{ id: 86, name: "Rubick" }, { id: 87, name: "Disruptor" }, { id: 88, name: "Nyx Assassin" },
{ id: 89, name: "Naga Siren" }, { id: 90, name: "Keeper of the Light" }, { id: 91, name: "Io" },
{ id: 92, name: "Visage" }, { id: 93, name: "Slark" }, { id: 94, name: "Medusa" },
{ id: 95, name: "Troll Warlord" }, { id: 96, name: "Centaur Warrunner" }, { id: 97, name: "Magnus" },
{ id: 98, name: "Timbersaw" }, { id: 99, name: "Bristleback" }, { id: 100, name: "Tusk" },
{ id: 101, name: "Skywrath Mage" }, { id: 102, name: "Abaddon" }, { id: 103, name: "Elder Titan" },
{ id: 104, name: "Legion Commander" }, { id: 105, name: "Techies" }, { id: 106, name: "Ember Spirit" },
{ id: 107, name: "Earth Spirit" }, { id: 108, name: "Underlord" }, { id: 109, name: "Terrorblade" },
{ id: 110, name: "Phoenix" }, { id: 111, name: "Oracle" }, { id: 112, name: "Winter Wyvern" },
{ id: 113, name: "Arc Warden" }, { id: 114, name: "Monkey King" }, { id: 119, name: "Dark Willow" },
{ id: 120, name: "Pangolier" }, { id: 121, name: "Grimstroke" }, { id: 123, name: "Hoodwink" },
{ id: 126, name: "Void Spirit" }, { id: 128, name: "Snapfire" }, { id: 129, name: "Mars" },
{ id: 131, name: "Dawnbreaker" }, { id: 136, name: "Marci" }, { id: 137, name: "Primal Beast" },
{ id: 138, name: "Muerta" }
];

/* Локальный fallback для самых частых предметов (если API не ответит) */
var FALLBACK_ITEMS = {
1:    { name: "Blink Dagger",    short: "BLNK", color: "#7b61ff" },
29:   { name: "Boots of Speed",  short: "BOOT", color: "#8b6b3e" },
36:   { name: "Magic Wand",      short: "WAND", color: "#e8c95a" },
50:   { name: "Phase Boots",     short: "PHS",  color: "#c58524" },
63:   { name: "Power Treads",    short: "TRDS", color: "#c53d2c" },
65:   { name: "Hand of Midas",   short: "MIDS", color: "#d6b83f" },
79:   { name: "Aghanim's Scepter", short: "AGHS", color: "#3ea36f" },
96:   { name: "Sheepstick",      short: "HEX",  color: "#8b6ce0" },
108:  { name: "Aghanim's Shard", short: "SHRD", color: "#a8dd3e" },
116:  { name: "Black King Bar",  short: "BKB",  color: "#5a4a3a" },
119:  { name: "Force Staff",     short: "FORC", color: "#e2d8a5" },
127:  { name: "Blade Mail",      short: "BM",   color: "#c9a73d" },
133:  { name: "Linken's Sphere", short: "LNKN", color: "#7e6cd5" },
141:  { name: "Scythe of Vyse",  short: "HEX",  color: "#8b6ce0" },
145:  { name: "Battle Fury",     short: "BF",   color: "#c8861a" },
147:  { name: "Manta Style",     short: "MNTA", color: "#c5b572" },
149:  { name: "Crystalys",       short: "CRYS", color: "#a8c7e0" },
151:  { name: "Daedalus",        short: "DAED", color: "#d96848" },
154:  { name: "Abyssal Blade",   short: "ABYS", color: "#5b3a24" },
156:  { name: "Satanic",         short: "SATN", color: "#8b1e1e" },
158:  { name: "Mithril Hammer",  short: "MTHR", color: "#a0a8b8" },
160:  { name: "Radiance",        short: "RADN", color: "#f4c430" },
168:  { name: "Desolator",       short: "DSOL", color: "#5a2a2a" },
169:  { name: "Battle Fury",     short: "BF",   color: "#c8861a" },
174:  { name: "Diffusal Blade",  short: "DIFF", color: "#7ea3d9" },
185:  { name: "Basher",          short: "BASH", color: "#8b6034" },
187:  { name: "Medallion of Courage", short: "MEDL", color: "#c8a047" },
188:  { name: "Smoke of Deceit", short: "SMK",  color: "#5b5b5b" },
201:  { name: "Dagon",           short: "DGON", color: "#8b1e4c" },
206:  { name: "Ethereal Blade",  short: "ETHR", color: "#9c8bdd" },
208:  { name: "Eye of Skadi",    short: "SKDI", color: "#7ec0d9" },
212:  { name: "Heart of Tarrasque", short: "HRT", color: "#c04545" },
214:  { name: "Tranquil Boots",  short: "TRQL", color: "#9ba4c5" },
220:  { name: "Mekansm",         short: "MEKA", color: "#e8d895" },
223:  { name: "Guardian Greaves", short: "GREA", color: "#c5b96d" },
231:  { name: "Mjollnir",        short: "MJOL", color: "#a0c5e0" },
232:  { name: "Aghanim's Blessing", short: "AGB", color: "#3ea36f" },
235:  { name: "Octarine Core",   short: "OCTA", color: "#a55bb8" },
236:  { name: "Dragon Lance",    short: "LNCE", color: "#c9a558" },
237:  { name: "Bloodthorn",      short: "BLTH", color: "#8b1e2c" },
238:  { name: "Nullifier",       short: "NULL", color: "#7ec5d9" },
242:  { name: "Crimson Guard",   short: "CG",   color: "#c55a3d" },
247:  { name: "Moon Shard",      short: "MOON", color: "#c5d5e0" },
249:  { name: "Silver Edge",     short: "SLVR", color: "#a8c7d9" },
250:  { name: "Sange and Yasha", short: "S&Y",  color: "#e0c047" },
252:  { name: "Echo Sabre",      short: "ECHO", color: "#c8b05a" },
254:  { name: "Glimmer Cape",    short: "GLIM", color: "#b0a5c8" },
255:  { name: "Pipe of Insight", short: "PIPE", color: "#8b6b3e" },
256:  { name: "Solar Crest",     short: "SOLR", color: "#e0c04a" },
257:  { name: "Lotus Orb",       short: "LOTS", color: "#7ebfa0" },
259:  { name: "Aether Lens",     short: "AETH", color: "#8b8bc8" },
261:  { name: "Guardian Greaves", short: "GRVS", color: "#c5b96d" },
263:  { name: "Hurricane Pike",  short: "HURR", color: "#7ec5e0" },
264:  { name: "Wind Waker",      short: "WNDW", color: "#7ec5d9" },
266:  { name: "Spirit Vessel",   short: "VESS", color: "#5a9e8b" },
267:  { name: "Bloodstone",      short: "BLSR", color: "#8b1e1e" },
271:  { name: "Veil of Discord", short: "VEIL", color: "#c86d5a" },
273:  { name: "Aeon Disk",       short: "AEON", color: "#5a8bc8" },
277:  { name: "Shiva's Guard",   short: "SHIV", color: "#7ec5e0" },
279:  { name: "Kaya",            short: "KAYA", color: "#8b7ec5" },
280:  { name: "Sange",           short: "SANG", color: "#c5603a" },
281:  { name: "Yasha",           short: "YASH", color: "#5a9ed9" },
282:  { name: "Mage Slayer",     short: "MAGE", color: "#8b5c8b" },
533:  { name: "Hurricane Pike",  short: "HURR", color: "#7ec5e0" },
596:  { name: "Diffusal Blade",  short: "DIFF", color: "#7ea3d9" },
597:  { name: "Eternal Shroud",  short: "ETRN", color: "#7ec560" },
603:  { name: "Overwhelming Blink", short: "OBLK", color: "#c5603a" },
604:  { name: "Swift Blink",     short: "SBLK", color: "#7ec5e0" },
605:  { name: "Arcane Blink",    short: "ABLK", color: "#c560d9" },
607:  { name: "Fallen Sky",      short: "SKY",  color: "#c58b3d" },
608:  { name: "Pirate Hat",      short: "PIR",  color: "#c5a53d" },
609:  { name: "Dandelion Amulet", short: "DAND", color: "#c5c55a" },
610:  { name: "Telescope",       short: "TLSC", color: "#7ec5a0" },
611:  { name: "Magic Lamp",      short: "LAMP", color: "#c58b3d" },
1123: { name: "Roshan's Banner", short: "ROSH", color: "#c5603a" }
};

/* ─── Персонажи (сокращения) ─── */
var HERO_ALIASES = {
"жугер":"Juggernaut","пудж":"Pudge","инвокер":"Invoker","сф":"Shadow Fiend",
"ам":"Anti-Mage","антимаг":"Anti-Mage","па":"Phantom Assassin","фантомка":"Phantom Assassin",
"сларк":"Slark","шторм":"Storm Spirit","зевс":"Zeus","лина":"Lina",
"дров":"Drow Ranger","снайпер":"Sniper","свен":"Sven","цм":"Crystal Maiden",
"кристалка":"Crystal Maiden","лк":"Wraith King","вр":"Vengeful Spirit",
"тини":"Tiny","тимбер":"Timbersaw","рубик":"Rubick","магнус":"Magnus",
"медуза":"Medusa","луна":"Luna","тайдер":"Tidehunter","войд":"Faceless Void",
"урса":"Ursa","слардар":"Slardar","цк":"Chaos Knight","некр":"Necrophos",
"дк":"Dragon Knight","тролль":"Troll Warlord","виса":"Visage",
"фурион":"Nature's Prophet","нп":"Nature's Prophet","эмбер":"Ember Spirit",
"морф":"Morphling","лайфстил":"Lifestealer","лич":"Lich","леш":"Leshrac",
"мирана":"Mirana","пак":"Puck","разор":"Razor","раста":"Shadow Shaman",
"течис":"Techies","трент":"Treant Protector","туск":"Tusk","вивер":"Winter Wyvern",
"виндра":"Windranger","вено":"Venomancer","аба":"Abaddon","алх":"Alchemist",
"квопа":"Queen of Pain","королева":"Queen of Pain","бейн":"Bane",
"визаж":"Visage","джакиро":"Jakiro","котел":"Keeper of the Light"
};

var SHORT = {
"Anti-Mage":"AM","Ancient Apparition":"AA","Arc Warden":"AW","Bounty Hunter":"BH",
"Bristleback":"BB","Crystal Maiden":"CM","Drow Ranger":"DR","Ember Spirit":"ES",
"Faceless Void":"FV","Keeper of the Light":"KotL","Legion Commander":"LC",
"Lifestealer":"LS","Lone Druid":"LD","Monkey King":"MK","Nature's Prophet":"NP",
"Night Stalker":"NS","Outworld Destroyer":"OD","Phantom Assassin":"PA",
"Phantom Lancer":"PL","Queen of Pain":"QoP","Shadow Fiend":"SF","Skywrath Mage":"SM",
"Spirit Breaker":"SB","Storm Spirit":"SS","Templar Assassin":"TA","Treant Protector":"TP",
"Vengeful Spirit":"VS","Wraith King":"WK","Winter Wyvern":"WW","Windranger":"WR",
"Shadow Shaman":"SS","Sand King":"SK","Dragon Knight":"DK","Death Prophet":"DP",
"Dark Willow":"DW","Dark Seer":"DS","Nyx Assassin":"NA","Void Spirit":"VS",
"Centaur Warrunner":"CW","Chaos Knight":"CK","Elder Titan":"ET","Gyrocopter":"GYRO",
"Ursa":"URSA","Underlord":"UL","Undying":"UND","Viper":"VIP","Visage":"VIS",
"Warlock":"WL","Weaver":"WEA","Bloodseeker":"BS","Beastmaster":"BM","Brewmaster":"BM",
"Broodmother":"BRO","Clinkz":"CL","Clockwerk":"CW","Enchantress":"ENCH","Enigma":"ENG",
"Jakiro":"JAK","Leshrac":"LESH","Magnus":"MAG","Medusa":"MED","Mirana":"MIRA",
"Morphling":"MORPH","Naga Siren":"NAGA","Necrophos":"NEC","Ogre Magi":"OGRE",
"Omniknight":"OMNI","Oracle":"ORA","Pangolier":"PANG","Phoenix":"PHX",
"Primal Beast":"PB","Pugna":"PUGNA","Razor":"RAZ","Rubick":"RUB","Slardar":"SLAR",
"Slark":"SLARK","Snapfire":"SNAP","Spectre":"SPEC","Terrorblade":"TB",
"Tidehunter":"TIDE","Timbersaw":"TIMB","Tinker":"TINK","Troll Warlord":"TW",
"Techies":"TECH","Mars":"MARS","Hoodwink":"HOOD","Dawnbreaker":"DAWN",
"Marci":"MARCI","Muerta":"MUERTA","Sniper":"SNIP","Drow Ranger":"DR",
"Juggernaut":"JUG","Pudge":"PUD","Invoker":"INV","Lina":"LINA","Zeus":"ZEUS",
"Sven":"SVEN","Luna":"LUNA","Tiny":"TINY","Magnus":"MAG","Axe":"AXE",
"Warlock":"WL","Disruptor":"DISR","Silencer":"SIL","Nature's Prophet":"NP",
"Doom":"DOOM","Lifestealer":"LS","Dazzle":"DZ","Tusk":"TUSK","Slark":"SLK"
};

function shortName(name) {
if (!name) return "?";
if (SHORT[name]) return SHORT[name];
var w = String(name).split(/\s+/).filter(Boolean);
if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
return w.slice(0, 3).map(function (x) { return x[0]; }).join("").toUpperCase();
}

function heroHue(name) {
var h = 0;
for (var i = 0; i < name.length; i++) h = (Math.imul(h, 31) + name.charCodeAt(i)) % 360;
return h;
}

function heroGradient(name) {
var h = heroHue(name || "?");
var h2 = (h + 60) % 360;
return "linear-gradient(135deg, hsl(" + h + " 75% 42%), hsl(" + h2 + " 70% 26%))";
}

/* ═══════════ ПУБЛИЧНЫЕ ФУНКЦИИ ═══════════ */

window.getHeroes = async function () { return FALLBACK_HEROES.slice(); };

window.findHeroId = async function (nameOrAlias) {
if (!nameOrAlias) return null;
var q = nameOrAlias.trim().toLowerCase();
if (!q) return null;
var alias = HERO_ALIASES[q];
var needle = alias ? alias.toLowerCase() : q;
var heroes = await window.getHeroes();
if (!heroes.length) return null;
for (var i = 0; i < heroes.length; i++) if (heroes[i].name.toLowerCase() === needle) return heroes[i];
for (var j = 0; j < heroes.length; j++) if (needle.length >= 3 && heroes[j].name.toLowerCase().indexOf(needle) >= 0) return heroes[j];
if (needle.length >= 4) for (var k = 0; k < heroes.length; k++) if (heroes[k].name.toLowerCase().indexOf(needle.slice(0, 4)) === 0) return heroes[k];
return null;
};

window.heroShort = shortName;
window.heroGradient = heroGradient;

window.heroImgEl = function (hero, size, extraStyle) {
size = size || 64;
var r = Math.max(8, Math.round(size * 0.14));
var wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;flex-shrink:0;overflow:hidden;" +
"width:" + size + "px;height:" + size + "px;" +
"border-radius:" + r + "px;" +
"border:2px solid rgba(167,139,250,0.55);" +
"background:" + heroGradient(hero ? hero.name : "?") + ";" +
"display:flex;align-items:center;justify-content:center;" +
"box-shadow:inset 0 1px 0 rgba(255,255,255,0.15);" + (extraStyle || "");
var fb = document.createElement("div");
fb.style.cssText =
"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
"font-size:" + Math.round(size * 0.34) + "px;font-weight:800;" +
"color:rgba(255,255,255,0.92);font-family:'JetBrains Mono',monospace;" +
"text-shadow:0 2px 6px rgba(0,0,0,0.55);pointer-events:none;user-select:none;";
fb.textContent = shortName(hero ? hero.name : "?");
wrap.appendChild(fb);
return wrap;
};

window.heroTileEl = function (hero, opts) {
opts = opts || {};
var wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;" +
"overflow:hidden;background:" + heroGradient(hero ? hero.name : "?") + ";" +
"border:2px solid " + (opts.borderColor || "transparent") + ";";
var fb = document.createElement("div");
fb.style.cssText =
"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
"font-size:15px;font-weight:800;color:rgba(255,255,255,0.92);" +
"font-family:'JetBrains Mono',monospace;text-shadow:0 2px 5px rgba(0,0,0,0.5);" +
"pointer-events:none;";
fb.textContent = shortName(hero ? hero.name : "?");
wrap.appendChild(fb);
if (opts.kda) {
var kda = document.createElement("div");
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

/* ═══════════ КАРТИНКИ ПРЕДМЕТОВ ═══════════ */

var ITEM_CDN = "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/";
var itemImageCache = {};

/* Имя предмета → slug для CDN */
function itemSlug(name) {
return String(name || "").toLowerCase()
.replace(/[^a-z0-9]+/g, " ")
.trim()
.split(" ")
.filter(Boolean)
.join("-");
}

/* Правильные slug-и для сложных предметов */
var ITEM_SLUGS = {
"Aghanim's Scepter": "ultimate_scepter",
"Aghanim's Shard": "aghanims_shard",
"Black King Bar": "black_king_bar",
"Force Staff": "force_staff",
"Glimmer Cape": "glimmer_cape",
"Scythe of Vyse": "sheepstick",
"Eul's Scepter": "cyclone",
"Shiva's Guard": "shivas_guard",
"Heart of Tarrasque": "heart",
"Radiance": "radiance",
"Battle Fury": "bfury",
"Diffusal Blade": "diffusal_blade",
"Manta Style": "manta",
"Abyssal Blade": "abyssal_blade",
"Linken's Sphere": "sphere",
"Aeon Disk": "aeon_disk",
"Spirit Vessel": "spirit_vessel",
"Hood of Defiance": "hood_of_defiance",
"Pipe of Insight": "pipe",
"Blade Mail": "blade_mail",
"Echo Sabre": "echo_sabre",
"Shadow Blade": "shadow_blade",
"Silver Edge": "silver_edge",
"Bloodstone": "bloodstone",
"Moon Shard": "moon_shard",
"Hurricane Pike": "hurricane_pike",
"Dragon Lance": "dragon_lance",
"Solar Crest": "solar_crest",
"Guardian Greaves": "guardian_greaves",
"Sange and Yasha": "sange_and_yasha",
"Eye of Skadi": "skadi",
"Crimson Guard": "crimson_guard",
"Lotus Orb": "lotus_orb",
"Aether Lens": "aether_lens",
"Magic Wand": "magic_stick",
"Blink Dagger": "blink",
"Power Treads": "power_treads",
"Phase Boots": "phase_boots",
"Boots of Speed": "boots",
"Tranquil Boots": "tranquil_boots",
"Hand of Midas": "hand_of_midas",
"Desolator": "desolator",
"Satanic": "satanic",
"Daedalus": "greater_crit",
"Crystalys": "lesser_crit",
"Mjollnir": "mjollnir",
"Basher": "basher",
"Mekansm": "mekansm",
"Octarine Core": "octarine_core",
"Dagon": "dagon_5",
"Ethereal Blade": "ethereal_blade",
"Nullifier": "nullifier",
"Mage Slayer": "mage_slayer",
"Overwhelming Blink": "overwhelming_blink",
"Swift Blink": "swift_blink",
"Arcane Blink": "arcane_blink",
"Smoke of Deceit": "smoke_of_deceit",
"Medallion of Courage": "medallion_of_courage",
"Veil of Discord": "veil_of_discord",
"Kaya": "kaya",
"Sange": "sange",
"Yasha": "yasha",
"Mithril Hammer": "mithril_hammer",
"Bloodthorn": "bloodthorn",
"Wind Waker": "wind_waker",
"Fallen Sky": "fallen_sky",
"Pirate Hat": "pirate_hat",
"Dandelion Amulet": "dandelion_amulet",
"Telescope": "telescope",
"Magic Lamp": "magic_lamp",
"Roshan's Banner": "roshans_banner",
"Eternal Shroud": "eternal_shroud"
};

function itemImageUrl(itemName) {
var slug = ITEM_SLUGS[itemName] || itemSlug(itemName);
return ITEM_CDN + slug + ".png";
}

/* Кэш каталога предметов */
var itemCatalogCache = null;
var itemCatalogLoading = null;

window.getItemCatalog = async function () {
if (itemCatalogCache) return itemCatalogCache;
try {
var cached = Store.get("itemscatalog", null);
if (cached && typeof cached === "object" && Object.keys(cached).length > 50) {
itemCatalogCache = cached;
return cached;
}
} catch (e) {}

if (itemCatalogLoading) return itemCatalogLoading;
itemCatalogLoading = (async function () {
try {
var data = await apiGet("/constants/items");
var map = {};
if (data && typeof data === "object") {
for (var key in data) {
if (!data.hasOwnProperty(key)) continue;
var val = data[key];
if (val && typeof val === "object" && val.id) {
map[val.id] = {
id: val.id,
name: val.dname || key,
short: null,
imgUrl: itemImageUrl(val.dname || key)
};
}
}
}
/* Дополняем локальным списком для тех, что API не отдал */
for (var id in FALLBACK_ITEMS) {
if (!map[id]) {
map[id] = {
id: parseInt(id, 10),
name: FALLBACK_ITEMS[id].name,
short: FALLBACK_ITEMS[id].short,
imgUrl: itemImageUrl(FALLBACK_ITEMS[id].name)
};
} else {
map[id].short = FALLBACK_ITEMS[id].short;
}
}
itemCatalogCache = map;
Store.set("itemscatalog", map);
itemCatalogLoading = null;
return map;
} catch (e) {
/* API упал — используем только локальный список */
var fallback = {};
for (var fid in FALLBACK_ITEMS) {
fallback[fid] = {
id: parseInt(fid, 10),
name: FALLBACK_ITEMS[fid].name,
short: FALLBACK_ITEMS[fid].short,
imgUrl: itemImageUrl(FALLBACK_ITEMS[fid].name)
};
}
itemCatalogCache = fallback;
itemCatalogLoading = null;
return fallback;
}
})();
return itemCatalogLoading;
};

window.itemImgEl = function (item) {
var wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;" +
"overflow:hidden;background:var(--bg-elev);border:1px solid var(--border);" +
"display:flex;align-items:center;justify-content:center;";

if (!item) return wrap;

/* Fallback буквы — всегда под картинкой */
var short = item.short || (function () {
var w = String(item.name || "?").split(/\s+/).filter(Boolean);
if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
return w.slice(0, 3).map(function (x) { return x[0]; }).join("").toUpperCase();
})();

var fb = document.createElement("div");
fb.style.cssText =
"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
"font-size:11px;font-weight:800;color:rgba(255,255,255,0.35);" +
"font-family:'JetBrains Mono',monospace;text-align:center;padding:2px;" +
"letter-spacing:-0.02em;z-index:0;";
fb.textContent = short;
wrap.appendChild(fb);

/* Картинка с CDN */
if (item.imgUrl) {
var img = document.createElement("img");
img.alt = "";
img.loading = "lazy";
img.referrerPolicy = "no-referrer";
img.style.cssText = "position:relative;z-index:1;width:100%;height:100%;object-fit:contain;padding:4px;";
img.addEventListener("error", function () {
img.style.display = "none";
});
img.addEventListener("load", function () {
if (img.naturalWidth === 0) img.style.display = "none";
});
img.src = item.imgUrl;
wrap.appendChild(img);
}

if (item.name) wrap.title = item.name;
return wrap;
};

/* Старый fallback для CDN картинок героев — не используется */
window.cdnUrlVariants = function () { return []; };
window.makeSmartImg = function () { return null; };
window.normalizeCdnPath = function (p) { return p || ""; };
window.cdnEnabled = function () { return false; };

window.percentileOf = function (bench, key, value) {
if (!bench || !bench[key] || !Array.isArray(bench[key])) return null;
var arr = bench[key].slice().sort(function (a, b) { return (a.percentile || 0) - (b.percentile || 0); });
if (!arr.length) return null;
var v0 = arr[0].value || 0, vN = arr[arr.length - 1].value || 0;
if (value <= v0) return (arr[0].percentile || 0) * 100;
if (value >= vN) return (arr[arr.length - 1].percentile || 0) * 100;
for (var i = 1; i < arr.length; i++) {
var a = arr[i - 1], b = arr[i];
var av = a.value || 0, bv = b.value || 0;
if (value <= bv) {
var d = bv - av;
if (d === 0) return (b.percentile || 0) * 100;
var frac = (value - av) / d;
var pa = a.percentile || 0, pb = b.percentile || 0;
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

console.log("[fallback.js] v4.1.0 готов — каталог предметов, lite-mode support");
})();

</BDS:create_file>

<BDS:create_file fileName="js/analyze