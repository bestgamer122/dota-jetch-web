/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — HEROES
   Алиасы + кэш героев из OpenDota + поиск по имени.
   ═══════════════════════════════════════════════════════════════════ */

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
        const cached = Store.get("heroes_cache");
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
                img: "https://cdn.cloudflare.steamstatic.com" + (h.img || ""),
                icon: "https://cdn.cloudflare.steamstatic.com" + (h.icon || ""),
            }));
            _heroCache = heroes;
            Store.set("heroes_cache", heroes);
            _heroLoading = null;
            return heroes;
        } catch (e) {
            _heroLoading = null;
            throw e;
        }
    })();
    return _heroLoading;
}

async function findHeroId(nameOrAlias) {
    if (!nameOrAlias) return null;
    const q = nameOrAlias.trim().toLowerCase();
    if (!q) return null;
    const alias = HERO_ALIASES[q];
    const needle = alias ? alias.toLowerCase() : q;
    const heroes = await getHeroes();
    if (!heroes.length) return null;
    for (const h of heroes) {
        if (h.name.toLowerCase() === needle) return h;
    }
    for (const h of heroes) {
        if (needle.length >= 3 && h.name.toLowerCase().includes(needle)) return h;
    }
    if (needle.length >= 4) {
        for (const h of heroes) {
            if (h.name.toLowerCase().startsWith(needle.slice(0, 4))) return h;
        }
    }
    return null;
}

function findHeroById(id, heroes) {
    if (!heroes) return null;
    return heroes.find(h => h.id === id) || null;
}

/* ─── Percentile из benchmarks OpenDota ─── */
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
