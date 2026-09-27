/* ═══════════════════════════════════════════════════════════════════
DOTA JETCH — HEROES v3
Многослойный fallback: CDN → прокси → красивый градиент по имени.
═══════════════════════════════════════════════════════════════════ */

const HEROES_CACHE_VERSION = 6;
const HEROES_CACHE_KEY = 'heroes_cache_v' + HEROES_CACHE_VERSION;
const ITEMS_CACHE_KEY = 'items_catalog_v4';
const CDN_TRY_ENABLED_KEY = 'cdn_try_enabled';

/* Основные зеркала Steam CDN */
const CDN_MIRRORS = [
"https://cdn.cloudflare.steamstatic.com",
"https://cdn.fastly.steamstatic.com",
"https://cdn.akamai.steamstatic.com",
"https://steamcdn-a.akamaihd.net",
];

/* Прокси */
const IMAGE_PROXIES = [
function (raw) { return "https://wsrv.nl/?url=" + encodeURIComponent(raw) + "&n=-1"; },
function (raw) { return "https://images.weserv.nl/?url=" + encodeURIComponent(raw); },
];

function normalizeCdnPath(path) {
if (!path) return "";
let p = String(path).trim();
const q = p.indexOf("?");
if (q >= 0) p = p.slice(0, q);
if (/^https?:///i.test(p)) return p;
if (!p.startsWith("/")) p = "/" + p;
return p;
}

function cdnUrlVariants(path) {
if (!path) return [];
const p = normalizeCdnPath(path);
if (/^https?:///i.test(p)) return [p];
const urls = [];
for (const base of CDN_MIRRORS) urls.push(base + p);
const raw = "cdn.cloudflare.steamstatic.com" + p;
for (const fn of IMAGE_PROXIES) urls.push(fn(raw));
return urls;
}

function cdnEnabled() {
return Store.get(CDN_TRY_ENABLED_KEY, true) !== false;
}

/* ─── Детерминированный градиент по имени героя ─── */
function heroHue(name) {
let h = 0;
for (let i = 0; i < name.length; i++) {
h = (h * 31 + name.charCodeAt(i)) % 360;
}
return h;
}

function heroGradient(name) {
const h = heroHue(name || "?");
const h2 = (h + 60) % 360;
return "linear-gradient(135deg, hsl(" + h + " 75% 42%), hsl(" + h2 + " 70% 26%))";
}

/* Короткие инициалы для иконки */
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
"Techies":"TECH","Void Spirit":"VS","Warlock":"WL","Weaver":"WEA",
"Mars":"MARS","Hoodwink":"HOOD","Dawnbreaker":"DAWN","Marci":"MARCI",
"Muerta":"MUERTA","Ringmaster":"RING","Kez":"KEZ",
};

function heroShort(name) {
if (!name) return "?";
if (HERO_SHORT[name]) return HERO_SHORT[name];
const words = name.split(/\s+/).filter(Boolean);
if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
return words.slice(0, 3).map(w => w[0]).join("").toUpperCase();
}

/* ─── Универсальный img с перебором ─── */
function makeSmartImg(urls, title, style) {
if (!urls || !urls.length) return null;
if (!cdnEnabled()) return null;
let idx = 0;
const img = document.createElement("img");
img.alt = "";
img.loading = "lazy";
img.decoding = "async";
img.referrerPolicy = "no-referrer";
if (title) img.title = title;
img.style.cssText = style || "width:100%;height:100%;object-fit:cover;display:block;";
img.src = urls[0];
let dead = false;
function next() {
if (dead) return;
idx++;
if (idx < urls.length) img.src = urls[idx];
else { dead = true; img.style.visibility = "hidden"; img.removeAttribute("src"); }
}
img.addEventListener("error", next);
img.addEventListener("load", () => { if (img.naturalWidth === 0) next(); });
return img;
}

/* ─── Красивая hero-иконка ─── */
function heroImgEl(hero, size, extraStyle) {
size = size || 64;
const r = Math.max(8, Math.round(size * 0.14));
const wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;flex-shrink:0;overflow:hidden;" +
"width:" + size + "px;height:" + size + "px;" +
"border-radius:" + r + "px;" +
"border:2px solid rgba(167,139,250,0.55);" +
"background:" + heroGradient(hero ? hero.name : "?") + ";" +
"display:flex;align-items:center;justify-content:center;" +
"box-shadow:inset 0 1px 0 rgba(255,255,255,0.15), 0 4px 14px -6px rgba(0,0,0,0.7);" +
(extraStyle || "");

const short = heroShort(hero ? hero.name : "?");
const fb = document.createElement("div");
fb.className = "smart-fallback";
fb.style.cssText =
"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
"font-size:" + Math.round(size * 0.34) + "px;font-weight:800;" +
"color:rgba(255,255,255,0.92);font-family:'JetBrains Mono',monospace;" +
"letter-spacing:0.02em;text-shadow:0 2px 6px rgba(0,0,0,0.55);" +
"pointer-events:none;user-select:none;z-index:0;";
fb.textContent = short;
wrap.appendChild(fb);

const path = (hero && (hero.imgPath || hero.img)) || "";
const urls = cdnUrlVariants(path);
const img = makeSmartImg(urls, hero ? hero.name : "",
"position:relative;z-index:1;width:100%;height:100%;object-fit:cover;display:block;");
if (img) wrap.appendChild(img);
return wrap;
}

/* ─── Item image ─── */
function itemImgEl(item) {
const wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;" +
"overflow:hidden;background:var(--bg-elev);border:1px solid var(--border);" +
"display:flex;align-items:center;justify-content:center;";
if (!item) return wrap;

// Fallback буквы для предмета
if (!cdnEnabled() || !item.imgPath) {
const fb = document.createElement("div");
fb.style.cssText =
"font-size:10px;font-weight:800;color:rgba(255,255,255,0.45);" +
"font-family:'JetBrains Mono',monospace;text-align:center;padding:2px;letter-spacing:-0.03em;";
fb.textContent = (item.name || "?").split(/\s+/).map(w => w[0]).join("").slice(0, 3).toUpperCase();
wrap.appendChild(fb);
return wrap;
}
const urls = cdnUrlVariants(item.imgPath);
const img = makeSmartImg(urls, item.name || "",
"width:100%;height:100%;object-fit:contain;display:block;padding:4px;");
if (img) wrap.appendChild(img);
return wrap;
}

/* ─── Hero tile для состава команд ─── */
function heroTileEl(hero, opts) {
opts = opts || {};
const wrap = document.createElement("div");
wrap.style.cssText =
"position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;" +
"overflow:hidden;background:" + heroGradient(hero ? hero.name : "?") + ";" +
"border:2px solid " + (opts.borderColor || "transparent") + ";" +
"box-shadow:inset 0 1px 0 rgba(255,255,255,0.12);";

const short = heroShort(hero ? hero.name : "?");
const fb = document.createElement("div");
fb.className = "smart-fallback";
fb.style.cssText =
"position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
"font-size:15px;font-weight:800;color:rgba(255,255,255,0.92);" +
"font-family:'JetBrains Mono',monospace;text-shadow:0 2px 5px rgba(0,0,0,0.5);" +
"pointer-events:none;z-index:0;letter-spacing:0.02em;";
fb.textContent = short;
wrap.appendChild(fb);

const path = (hero && (hero.imgPath || hero.img)) || "";
const urls = cdnUrlVariants(path);
const img = makeSmartImg(urls, hero ? hero.name : "",
"position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;");
if (img) wrap.appendChild(img);

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
}

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

let _heroCache = null;
let _heroLoading = null;

async function getHeroes() {
if (_heroCache) return _heroCache;
try {
const cached = Store.get(HEROES_CACHE_KEY);
if (cached && Array.isArray(cached) && cached.length > 100) {
_heroCache = cached;
return cached;
}
} catch (e) {}
if (_heroLoading) return _heroLoading;
_heroLoading = (async () => {
try {
const data = await apiGet("/heroes");
if (!Array.isArray(data)) { _heroLoading = null; return []; }
const heroes = data.map(h => ({
id: h.id,
name: h.localized_name,
imgPath: normalizeCdnPath(h.img),
iconPath: normalizeCdnPath(h.icon),
}));
_heroCache = heroes;
Store.set(HEROES_CACHE_KEY, heroes);
_heroLoading = null;
return heroes;
} catch (e) {
_heroLoading = null;
throw e;
}
})();
return _heroLoading;
}

let _itemCatalog = null;
let _itemLoading = null;

async function getItemCatalog() {
if (_itemCatalog) return _itemCatalog;
try {
const cached = Store.get(ITEMS_CACHE_KEY);
if (cached && typeof cached === "object" && Object.keys(cached).length > 100) {
_itemCatalog = cached;
return cached;
}
} catch (e) {}
if (_itemLoading) return _itemLoading;
_itemLoading = (async () => {
try {
const data = await apiGet("/constants/items");
const map = {};
if (data && typeof data === "object") {
for (const [key, val] of Object.entries(data)) {
if (val && typeof val === "object" && val.id) {
map[val.id] = {
id: val.id,
name: val.dname || key,
imgPath: normalizeCdnPath(val.img || ""),
cost: val.cost || 0,
};
}
}
}
_itemCatalog = map;
Store.set(ITEMS_CACHE_KEY, map);
_itemLoading = null;
return map;
} catch (e) {
_itemLoading = null;
return {};
}
})();
return _itemLoading;
}

async function findHeroId(nameOrAlias) {
if (!nameOrAlias) return null;
const q = nameOrAlias.trim().toLowerCase();
if (!q) return null;
const alias = HERO_ALIASES[q];
const needle = alias ? alias.toLowerCase() : q;
const heroes = await getHeroes();
if (!heroes.length) return null;
for (const h of heroes) if (h.name.toLowerCase() === needle) return h;
for (const h of heroes) if (needle.length >= 3 && h.name.toLowerCase().includes(needle)) return h;
if (needle.length >= 4) for (const h of heroes) if (h.name.toLowerCase().startsWith(needle.slice(0, 4))) return h;
return null;
}

function findHeroById(id, heroes) {
if (!heroes) return null;
return heroes.find(h => h.id === id) || null;
}

function percentileOf(bench, key, value) {
if (!bench || !bench[key] || !Array.isArray(bench[key])) return null;
const arr = bench[key].slice().sort((a, b) => (a.percentile || 0) - (b.percentile || 0));
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
}

function pctGrade(pct) {
if (pct === null || pct === undefined) return "—";
if (pct >= 90) return "S";
if (pct >= 75) return "A";
if (pct >= 50) return "B";
if (pct >= 25) return "C";
return "D";
}

function pctColor(pct) {
if (pct === null || pct === undefined) return "var(--text-dim)";
if (pct >= 75) return "var(--green)";
if (pct >= 50) return "var(--yellow)";
if (pct >= 25) return "var(--orange)";
return "var(--red)";
}