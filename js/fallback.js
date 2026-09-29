(function () {
"use strict";

var HEROES_FALLBACK = [
{ id: 1, name: "Anti-Mage", slug: "antimage" },
{ id: 2, name: "Axe", slug: "axe" },
{ id: 3, name: "Bane", slug: "bane" },
{ id: 4, name: "Bloodseeker", slug: "bloodseeker" },
{ id: 5, name: "Crystal Maiden", slug: "crystal_maiden" },
{ id: 6, name: "Drow Ranger", slug: "drow_ranger" },
{ id: 7, name: "Earthshaker", slug: "earthshaker" },
{ id: 8, name: "Juggernaut", slug: "juggernaut" },
{ id: 9, name: "Mirana", slug: "mirana" },
{ id: 10, name: "Morphling", slug: "morphling" },
{ id: 11, name: "Shadow Fiend", slug: "nevermore" },
{ id: 12, name: "Phantom Lancer", slug: "phantom_lancer" },
{ id: 13, name: "Puck", slug: "puck" },
{ id: 14, name: "Pudge", slug: "pudge" },
{ id: 15, name: "Razor", slug: "razor" },
{ id: 16, name: "Sand King", slug: "sand_king" },
{ id: 17, name: "Storm Spirit", slug: "storm_spirit" },
{ id: 18, name: "Sven", slug: "sven" },
{ id: 19, name: "Tiny", slug: "tiny" },
{ id: 20, name: "Vengeful Spirit", slug: "vengefulspirit" },
{ id: 21, name: "Windranger", slug: "windrunner" },
{ id: 22, name: "Zeus", slug: "zuus" },
{ id: 23, name: "Kunkka", slug: "kunkka" },
{ id: 25, name: "Lina", slug: "lina" },
{ id: 26, name: "Lion", slug: "lion" },
{ id: 27, name: "Shadow Shaman", slug: "shadow_shaman" },
{ id: 28, name: "Slardar", slug: "slardar" },
{ id: 29, name: "Tidehunter", slug: "tidehunter" },
{ id: 30, name: "Witch Doctor", slug: "witch_doctor" },
{ id: 31, name: "Lich", slug: "lich" },
{ id: 32, name: "Riki", slug: "riki" },
{ id: 33, name: "Enigma", slug: "enigma" },
{ id: 34, name: "Tinker", slug: "tinker" },
{ id: 35, name: "Sniper", slug: "sniper" },
{ id: 36, name: "Necrophos", slug: "necrolyte" },
{ id: 37, name: "Warlock", slug: "warlock" },
{ id: 38, name: "Beastmaster", slug: "beastmaster" },
{ id: 39, name: "Queen of Pain", slug: "queenofpain" },
{ id: 40, name: "Venomancer", slug: "venomancer" },
{ id: 41, name: "Faceless Void", slug: "faceless_void" },
{ id: 42, name: "Wraith King", slug: "skeleton_king" },
{ id: 43, name: "Death Prophet", slug: "death_prophet" },
{ id: 44, name: "Phantom Assassin", slug: "phantom_assassin" },
{ id: 45, name: "Pugna", slug: "pugna" },
{ id: 46, name: "Templar Assassin", slug: "templar_assassin" },
{ id: 47, name: "Viper", slug: "viper" },
{ id: 48, name: "Luna", slug: "luna" },
{ id: 49, name: "Dragon Knight", slug: "dragon_knight" },
{ id: 50, name: "Dazzle", slug: "dazzle" },
{ id: 51, name: "Clockwerk", slug: "rattletrap" },
{ id: 52, name: "Leshrac", slug: "leshrac" },
{ id: 53, name: "Nature's Prophet", slug: "furion" },
{ id: 54, name: "Lifestealer", slug: "life_stealer" },
{ id: 55, name: "Dark Seer", slug: "dark_seer" },
{ id: 56, name: "Clinkz", slug: "clinkz" },
{ id: 57, name: "Omniknight", slug: "omniknight" },
{ id: 58, name: "Enchantress", slug: "enchantress" },
{ id: 59, name: "Huskar", slug: "huskar" },
{ id: 60, name: "Night Stalker", slug: "night_stalker" },
{ id: 61, name: "Broodmother", slug: "broodmother" },
{ id: 62, name: "Bounty Hunter", slug: "bounty_hunter" },
{ id: 63, name: "Weaver", slug: "weaver" },
{ id: 64, name: "Jakiro", slug: "jakiro" },
{ id: 65, name: "Batrider", slug: "batrider" },
{ id: 66, name: "Chen", slug: "chen" },
{ id: 67, name: "Spectre", slug: "spectre" },
{ id: 68, name: "Ancient Apparition", slug: "ancient_apparition" },
{ id: 69, name: "Doom", slug: "doom_bringer" },
{ id: 70, name: "Ursa", slug: "ursa" },
{ id: 71, name: "Spirit Breaker", slug: "spirit_breaker" },
{ id: 72, name: "Gyrocopter", slug: "gyrocopter" },
{ id: 73, name: "Alchemist", slug: "alchemist" },
{ id: 74, name: "Invoker", slug: "invoker" },
{ id: 75, name: "Silencer", slug: "silencer" },
{ id: 76, name: "Outworld Destroyer", slug: "obsidian_destroyer" },
{ id: 77, name: "Lycan", slug: "lycan" },
{ id: 78, name: "Brewmaster", slug: "brewmaster" },
{ id: 79, name: "Shadow Demon", slug: "shadow_demon" },
{ id: 80, name: "Lone Druid", slug: "lone_druid" },
{ id: 81, name: "Chaos Knight", slug: "chaos_knight" },
{ id: 82, name: "Meepo", slug: "meepo" },
{ id: 83, name: "Treant Protector", slug: "treant" },
{ id: 84, name: "Ogre Magi", slug: "ogre_magi" },
{ id: 85, name: "Undying", slug: "undying" },
{ id: 86, name: "Rubick", slug: "rubick" },
{ id: 87, name: "Disruptor", slug: "disruptor" },
{ id: 88, name: "Nyx Assassin", slug: "nyx_assassin" },
{ id: 89, name: "Naga Siren", slug: "naga_siren" },
{ id: 90, name: "Keeper of the Light", slug: "keeper_of_the_light" },
{ id: 91, name: "Io", slug: "wisp" },
{ id: 92, name: "Visage", slug: "visage" },
{ id: 93, name: "Slark", slug: "slark" },
{ id: 94, name: "Medusa", slug: "medusa" },
{ id: 95, name: "Troll Warlord", slug: "troll_warlord" },
{ id: 96, name: "Centaur Warrunner", slug: "centaur" },
{ id: 97, name: "Magnus", slug: "magnataur" },
{ id: 98, name: "Timbersaw", slug: "shredder" },
{ id: 99, name: "Bristleback", slug: "bristleback" },
{ id: 100, name: "Tusk", slug: "tusk" },
{ id: 101, name: "Skywrath Mage", slug: "skywrath_mage" },
{ id: 102, name: "Abaddon", slug: "abaddon" },
{ id: 103, name: "Elder Titan", slug: "elder_titan" },
{ id: 104, name: "Legion Commander", slug: "legion_commander" },
{ id: 105, name: "Techies", slug: "techies" },
{ id: 106, name: "Ember Spirit", slug: "ember_spirit" },
{ id: 107, name: "Earth Spirit", slug: "earth_spirit" },
{ id: 108, name: "Underlord", slug: "abyssal_underlord" },
{ id: 109, name: "Terrorblade", slug: "terrorblade" },
{ id: 110, name: "Phoenix", slug: "phoenix" },
{ id: 111, name: "Oracle", slug: "oracle" },
{ id: 112, name: "Winter Wyvern", slug: "winter_wyvern" },
{ id: 113, name: "Arc Warden", slug: "arc_warden" },
{ id: 114, name: "Monkey King", slug: "monkey_king" },
{ id: 119, name: "Dark Willow", slug: "dark_willow" },
{ id: 120, name: "Pangolier", slug: "pangolier" },
{ id: 121, name: "Grimstroke", slug: "grimstroke" },
{ id: 123, name: "Hoodwink", slug: "hoodwink" },
{ id: 126, name: "Void Spirit", slug: "void_spirit" },
{ id: 128, name: "Snapfire", slug: "snapfire" },
{ id: 129, name: "Mars", slug: "mars" },
{ id: 131, name: "Dawnbreaker", slug: "dawnbreaker" },
{ id: 136, name: "Marci", slug: "marci" },
{ id: 137, name: "Primal Beast", slug: "primal_beast" },
{ id: 138, name: "Muerta", slug: "muerta" },
{ id: 145, name: "Kez", slug: "kez" },
{ id: 155, name: "Largo", slug: "largo" }
];

var ITEMS_FALLBACK = {
1: ["Blink Dagger", "blink"],
29: ["Boots of Speed", "boots"],
36: ["Magic Wand", "magic_wand"],
63: ["Power Treads", "power_treads"],
79: ["Aghanim's Scepter", "ultimate_scepter"],
96: ["Scythe of Vyse", "sheepstick"],
108: ["Aghanim's Shard", "aghanims_shard"],
116: ["Black King Bar", "black_king_bar"],
119: ["Force Staff", "force_staff"],
127: ["Blade Mail", "blade_mail"],
145: ["Battle Fury", "bfury"],
147: ["Manta Style", "manta"],
154: ["Abyssal Blade", "abyssal_blade"],
160: ["Radiance", "radiance"],
174: ["Diffusal Blade", "diffusal_blade"],
206: ["Ethereal Blade", "ethereal_blade"],
208: ["Eye of Skadi", "skadi"],
212: ["Heart of Tarrasque", "heart"],
235: ["Octarine Core", "octarine_core"],
236: ["Dragon Lance", "dragon_lance"],
249: ["Silver Edge", "silver_edge"],
250: ["Sange and Yasha", "sange_and_yasha"],
254: ["Glimmer Cape", "glimmer_cape"],
263: ["Hurricane Pike", "hurricane_pike"],
266: ["Spirit Vessel", "spirit_vessel"],
273: ["Aeon Disk", "aeon_disk"],
277: ["Shiva's Guard", "shivas_guard"],
597: ["Eternal Shroud", "eternal_shroud"],
603: ["Overwhelming Blink", "overwhelming_blink"],
604: ["Swift Blink", "swift_blink"],
605: ["Arcane Blink", "arcane_blink"],
607: ["Fallen Sky", "fallen_sky"],
608: ["Pirate Hat", "pirate_hat"],
609: ["Dandelion Amulet", "dandelion_amulet"],
610: ["Telescope", "telescope"],
611: ["Magic Lamp", "magic_lamp"],
1123: ["Rattlecage", "rattlecage"],
1124: ["Witless Shako", "witless_shako"]
};

var ALIASES = {
"жугер": "Juggernaut",
"пудж": "Pudge",
"инвокер": "Invoker",
"сф": "Shadow Fiend",
"ам": "Anti-Mage",
"антимаг": "Anti-Mage",
"па": "Phantom Assassin",
"фантомка": "Phantom Assassin",
"сларк": "Slark",
"шторм": "Storm Spirit",
"зевс": "Zeus",
"лина": "Lina",
"дров": "Drow Ranger",
"снайпер": "Sniper",
"свен": "Sven",
"цм": "Crystal Maiden",
"кристалка": "Crystal Maiden",
"лк": "Wraith King",
"вр": "Vengeful Spirit",
"тини": "Tiny",
"тимбер": "Timbersaw",
"рубик": "Rubick",
"магнус": "Magnus",
"медуза": "Medusa",
"луна": "Luna",
"тайдер": "Tidehunter",
"войд": "Faceless Void",
"урса": "Ursa",
"слардар": "Slardar",
"цк": "Chaos Knight",
"некр": "Necrophos",
"дк": "Dragon Knight",
"тролль": "Troll Warlord",
"виса": "Visage",
"фурион": "Nature's Prophet",
"нп": "Nature's Prophet",
"эмбер": "Ember Spirit",
"морф": "Morphling",
"лайфстил": "Lifestealer",
"лич": "Lich",
"леш": "Leshrac",
"мирана": "Mirana",
"пак": "Puck",
"разор": "Razor",
"раста": "Shadow Shaman",
"течис": "Techies",
"трент": "Treant Protector",
"туск": "Tusk",
"вивер": "Winter Wyvern",
"виндра": "Windranger",
"вено": "Venomancer",
"аба": "Abaddon",
"алх": "Alchemist",
"квопа": "Queen of Pain",
"королева": "Queen of Pain",
"бейн": "Bane",
"визаж": "Visage",
"джакиро": "Jakiro",
"котел": "Keeper of the Light"
};

var CDN = "https://api.opendota.com";

function heroImgUrl(slug) {
if (!slug) return null;
return CDN + "/apps/dota2/images/heroes/" + slug + "_full.png";
}

function itemImgUrl(slug) {
if (!slug) return null;
return CDN + "/apps/dota2/images/items/" + slug + "_lg.png";
}

function shortName(name) {
if (!name) return "?";
var w = String(name).split(/\s+/).filter(Boolean);
if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
return w.slice(0, 3).map(function (x) { return x[0]; }).join("").toUpperCase();
}

function grad(name) {
var h = 0;
var s = String(name || "?");
for (var i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) % 360;
var h2 = (h + 60) % 360;
return "linear-gradient(135deg, hsl(" + h + " 75% 42%), hsl(" + h2 + " 70% 26%))";
}

var _heroCache = null;

window.getHeroes = async function () {
if (_heroCache) return _heroCache;
try {
if (typeof apiGet === "function") {
var data = await apiGet("/heroes");
if (Array.isArray(data) && data.length > 0) {
_heroCache = data.map(function (h) {
var slug = h.name.replace("npc_dota_hero_", "");
return { id: h.id, name: h.localized_name, slug: slug, img: heroImgUrl(slug) };
});
return _heroCache;
}
}
} catch (e) { console.warn("API heroes unavailable, using fallback"); }
_heroCache = HEROES_FALLBACK.map(function (h) {
return { id: h.id, name: h.name, slug: h.slug, img: heroImgUrl(h.slug) };
});
return _heroCache;
};

window.findHeroId = async function (q) {
if (!q) return null;
var s = q.trim().toLowerCase();
if (!s) return null;
var alias = ALIASES[s];
var needle = alias ? alias.toLowerCase() : s;
var list = await window.getHeroes();
for (var i = 0; i < list.length; i++) if (list[i].name.toLowerCase() === needle) return list[i];
for (var j = 0; j < list.length; j++) if (needle.length >= 3 && list[j].name.toLowerCase().indexOf(needle) >= 0) return list[j];
if (needle.length >= 4) for (var k = 0; k < list.length; k++) if (list[k].name.toLowerCase().indexOf(needle.slice(0, 4)) === 0) return list[k];
return null;
};

window.heroShort = shortName;
window.heroGradient = grad;

window.heroImgEl = function (hero, size, extra) {
size = size || 64;
var r = Math.max(8, Math.round(size * 0.14));
var wrap = document.createElement("div");
wrap.style.cssText = "position:relative;flex-shrink:0;overflow:hidden;width:" + size + "px;height:" + size + "px;border-radius:" + r + "px;border:2px solid rgba(167,139,250,0.55);background:" + grad(hero ? hero.name : "?") + ";display:flex;align-items:center;justify-content:center;" + (extra || "");
var fb = document.createElement("div");
fb.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:" + Math.round(size * 0.34) + "px;font-weight:800;color:rgba(255,255,255,0.92);font-family:'JetBrains Mono',monospace;text-shadow:0 2px 6px rgba(0,0,0,0.55);pointer-events:none;user-select:none;z-index:0;";
fb.textContent = shortName(hero ? hero.name : "?");
wrap.appendChild(fb);
if (hero && hero.img) {
var img = document.createElement("img");
img.alt = "";
img.loading = "lazy";
img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;display:block;";
img.onerror = function () { img.style.display = "none"; };
img.src = hero.img;
wrap.appendChild(img);
}
return wrap;
};

window.heroTileEl = function (hero, opts) {
opts = opts || {};
var wrap = document.createElement("div");
wrap.style.cssText = "position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;overflow:hidden;background:" + grad(hero ? hero.name : "?") + ";border:2px solid " + (opts.borderColor || "transparent") + ";";
var fb = document.createElement("div");
fb.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:rgba(255,255,255,0.92);font-family:'JetBrains Mono',monospace;pointer-events:none;z-index:0;";
fb.textContent = shortName(hero ? hero.name : "?");
wrap.appendChild(fb);
if (hero && hero.img) {
var img = document.createElement("img");
img.alt = "";
img.loading = "lazy";
img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;display:block;";
img.onerror = function () { img.style.display = "none"; };
img.src = hero.img;
wrap.appendChild(img);
}
if (opts.kda) {
var kda = document.createElement("div");
kda.style.cssText = "position:absolute;bottom:0;left:0;right:0;padding:4px;background:linear-gradient(0deg,rgba(0,0,0,0.9),transparent);font-size:9px;font-weight:700;color:#fff;text-align:center;font-family:'JetBrains Mono',monospace;z-index:2;";
kda.textContent = opts.kda;
wrap.appendChild(kda);
}
return wrap;
};

window.itemImgEl = function (item) {
var wrap = document.createElement("div");
wrap.style.cssText = "position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;overflow:hidden;background:var(--bg-elev);border:1px solid var(--border);display:flex;align-items:center;justify-content:center;";
if (!item) return wrap;
var short = item.short || (function () {
var w = String(item.name || "?").split(/\s+/).filter(Boolean);
if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
return w.slice(0, 3).map(function (x) { return x[0]; }).join("").toUpperCase();
})();
var fb = document.createElement("div");
fb.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;color:rgba(255,255,255,0.55);font-family:'JetBrains Mono',monospace;text-align:center;padding:2px;z-index:0;";
fb.textContent = short;
wrap.appendChild(fb);
if (item.img) {
var img = document.createElement("img");
img.alt = "";
img.loading = "lazy";
img.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:contain;padding:4px;z-index:1;display:block;";
img.onerror = function () { img.style.display = "none"; };
img.src = item.img;
wrap.appendChild(img);
}
if (item.name) wrap.title = item.name;
return wrap;
};

var _itemCache = null;

window.getItemCatalog = async function () {
if (_itemCache) return _itemCache;
try {
if (typeof apiGet === "function") {
var data = await apiGet("/constants/items");
if (data && typeof data === "object" && Object.keys(data).length > 0) {
var map = {};
for (var key in data) {
if (!data.hasOwnProperty(key)) continue;
var val = data[key];
if (val && val.id) {
map[val.id] = { id: val.id, name: val.dname || key, slug: key, img: itemImgUrl(key), short: shortName(val.dname || key) };
}
}
_itemCache = map;
return map;
}
}
} catch (e) { console.warn("API items unavailable, using fallback"); }
var fallback = {};
for (var id in ITEMS_FALLBACK) {
if (!ITEMS_FALLBACK.hasOwnProperty(id)) continue;
var n = ITEMS_FALLBACK[id][0], sl = ITEMS_FALLBACK[id][1];
fallback[id] = { id: parseInt(id, 10), name: n, slug: sl, img: itemImgUrl(sl), short: shortName(n) };
}
_itemCache = fallback;
return fallback;
};

window.cdnUrlVariants = function () { return []; };
window.makeSmartImg = function () { return null; };
window.normalizeCdnPath = function (p) { return p || ""; };
window.cdnEnabled = function () { return true; };

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

window.pctGrade = function (p) {
if (p === null || p === undefined) return "-";
if (p >= 90) return "S";
if (p >= 75) return "A";
if (p >= 50) return "B";
if (p >= 25) return "C";
return "D";
};

window.pctColor = function (p) {
if (p === null || p === undefined) return "var(--text-dim)";
if (p >= 75) return "var(--green)";
if (p >= 50) return "var(--yellow)";
if (p >= 25) return "var(--orange)";
return "var(--red)";
};

console.log("fallback v11 ready (no syntax errors, OpenDota CDN)");
})();
