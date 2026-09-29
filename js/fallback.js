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

  var ALIASES = {
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
    "Marci":"MARCI","Muerta":"MUERTA","Sniper":"SNIP","Juggernaut":"JUG",
    "Pudge":"PUD","Invoker":"INV","Lina":"LINA","Zeus":"ZEUS","Sven":"SVEN",
    "Luna":"LUNA","Tiny":"TINY","Axe":"AXE","Disruptor":"DISR","Silencer":"SIL",
    "Doom":"DOOM","Dazzle":"DZ","Tusk":"TUSK"
  };

  function shortName(name) {
    if (!name) return "?";
    if (SHORT[name]) return SHORT[name];
    var w = String(name).split(/\s+/).filter(Boolean);
    if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
    return w.slice(0, 3).map(function (x) { return x[0]; }).join("").toUpperCase();
  }

  function hue(name) {
    var h = 0;
    for (var i = 0; i < name.length; i++) h = (Math.imul(h, 31) + name.charCodeAt(i)) % 360;
    return h;
  }

  function grad(name) {
    var h = hue(name || "?");
    var h2 = (h + 60) % 360;
    return "linear-gradient(135deg, hsl(" + h + " 75% 42%), hsl(" + h2 + " 70% 26%))";
  }

  window.getHeroes = async function () { return FALLBACK_HEROES.slice(); };

  window.findHeroId = async function (q) {
    if (!q) return null;
    var s = q.trim().toLowerCase();
    if (!s) return null;
    var alias = ALIASES[s];
    var needle = alias ? alias.toLowerCase() : s;
    var list = await window.getHeroes();
    if (!list.length) return null;
    for (var i = 0; i < list.length; i++) if (list[i].name.toLowerCase() === needle) return list[i];
    for (var j = 0; j < list.length; j++) if (needle.length >= 3 && list[j].name.toLowerCase().indexOf(needle) >= 0) return list[j];
    if (needle.length >= 4) for (var k = 0; k < list.length; k++) if (list[k].name.toLowerCase().indexOf(needle.slice(0, 4)) === 0) return list[k];
    return null;
  };

  window.heroShort = shortName;
  window.heroGradient = grad;

  window.heroImgEl = function (hero, size, extraStyle) {
    size = size || 64;
    var r = Math.max(8, Math.round(size * 0.14));
    var wrap = document.createElement("div");
    wrap.style.cssText =
      "position:relative;flex-shrink:0;overflow:hidden;" +
      "width:" + size + "px;height:" + size + "px;" +
      "border-radius:" + r + "px;border:2px solid rgba(167,139,250,0.55);" +
      "background:" + grad(hero ? hero.name : "?") + ";" +
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
      "overflow:hidden;background:" + grad(hero ? hero.name : "?") + ";" +
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

  window.itemImgEl = function (item) {
    var wrap = document.createElement("div");
    wrap.style.cssText =
      "position:relative;width:100%;aspect-ratio:1/1;border-radius:10px;" +
      "overflow:hidden;background:var(--bg-elev);border:1px solid var(--border);" +
      "display:flex;align-items:center;justify-content:center;";
    if (!item) return wrap;
    var short = item.short || (function () {
      var w = String(item.name || "?").split(/\s+/).filter(Boolean);
      if (w.length === 1) return w[0].slice(0, 3).toUpperCase();
      return w.slice(0, 3).map(function (x) { return x[0]; }).join("").toUpperCase();
    })();
    var fb = document.createElement("div");
    fb.style.cssText =
      "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;" +
      "font-size:11px;font-weight:800;color:rgba(255,255,255,0.35);" +
      "font-family:'JetBrains Mono',monospace;text-align:center;padding:2px;z-index:0;";
    fb.textContent = short;
    wrap.appendChild(fb);
    if (item.imgUrl) {
      var img = document.createElement("img");
      img.alt = "";
      img.loading = "lazy";
      img.referrerPolicy = "no-referrer";
      img.style.cssText = "position:relative;z-index:1;width:100%;height:100%;object-fit:contain;padding:4px;";
      img.onerror = function () { img.style.display = "none"; };
      img.onload = function () { if (img.naturalWidth === 0) img.style.display = "none"; };
      img.src = item.imgUrl;
      wrap.appendChild(img);
    }
    if (item.name) wrap.title = item.name;
    return wrap;
  };

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

  window.getItemCatalog = async function () {
    var FALLBACK_ITEMS = {
      1: { name: "Blink Dagger", short: "BLNK" }, 29: { name: "Boots of Speed", short: "BOOT" },
      36: { name: "Magic Wand", short: "WAND" }, 50: { name: "Phase Boots", short: "PHS" },
      63: { name: "Power Treads", short: "TRDS" }, 65: { name: "Hand of Midas", short: "MIDS" },
      79: { name: "Aghanim's Scepter", short: "AGHS" }, 96: { name: "Sheepstick", short: "HEX" },
      108: { name: "Aghanim's Shard", short: "SHRD" }, 116: { name: "Black King Bar", short: "BKB" },
      119: { name: "Force Staff", short: "FORC" }, 127: { name: "Blade Mail", short: "BM" },
      133: { name: "Linken's Sphere", short: "LNKN" }, 141: { name: "Scythe of Vyse", short: "HEX" },
      145: { name: "Battle Fury", short: "BF" }, 147: { name: "Manta Style", short: "MNTA" },
      149: { name: "Crystalys", short: "CRYS" }, 151: { name: "Daedalus", short: "DAED" },
      154: { name: "Abyssal Blade", short: "ABYS" }, 156: { name: "Satanic", short: "SATN" },
      158: { name: "Mithril Hammer", short: "MTHR" }, 160: { name: "Radiance", short: "RADN" },
      168: { name: "Desolator", short: "DSOL" }, 174: { name: "Diffusal Blade", short: "DIFF" },
      185: { name: "Basher", short: "BASH" }, 188: { name: "Smoke of Deceit", short: "SMK" },
      201: { name: "Dagon", short: "DGON" }, 206: { name: "Ethereal Blade", short: "ETHR" },
      208: { name: "Eye of Skadi", short: "SKDI" }, 212: { name: "Heart of Tarrasque", short: "HRT" },
      214: { name: "Tranquil Boots", short: "TRQL" }, 220: { name: "Mekansm", short: "MEKA" },
      231: { name: "Mjollnir", short: "MJOL" }, 235: { name: "Octarine Core", short: "OCTA" },
      236: { name: "Dragon Lance", short: "LNCE" }, 237: { name: "Bloodthorn", short: "BLTH" },
      238: { name: "Nullifier", short: "NULL" }, 242: { name: "Crimson Guard", short: "CG" },
      247: { name: "Moon Shard", short: "MOON" }, 249: { name: "Silver Edge", short: "SLVR" },
      250: { name: "Sange and Yasha", short: "S&Y" }, 252: { name: "Echo Sabre", short: "ECHO" },
      254: { name: "Glimmer Cape", short: "GLIM" }, 255: { name: "Pipe of Insight", short: "PIPE" },
      256: { name: "Solar Crest", short: "SOLR" }, 257: { name: "Lotus Orb", short: "LOTS" },
      259: { name: "Aether Lens", short: "AETH" }, 263: { name: "Hurricane Pike", short: "HURR" },
      266: { name: "Spirit Vessel", short: "VESS" }, 267: { name: "Bloodstone", short: "BLSR" },
      271: { name: "Veil of Discord", short: "VEIL" }, 273: { name: "Aeon Disk", short: "AEON" },
      277: { name: "Shiva's Guard", short: "SHIV" }, 279: { name: "Kaya", short: "KAYA" },
      280: { name: "Sange", short: "SANG" }, 281: { name: "Yasha", short: "YASH" },
      282: { name: "Mage Slayer", short: "MAGE" }, 597: { name: "Eternal Shroud", short: "ETRN" },
      603: { name: "Overwhelming Blink", short: "OBLK" }, 604: { name: "Swift Blink", short: "SBLK" },
      605: { name: "Arcane Blink", short: "ABLK" }, 607: { name: "Fallen Sky", short: "SKY" },
      608: { name: "Pirate Hat", short: "PIR" }, 609: { name: "Dandelion Amulet", short: "DAND" },
      610: { name: "Telescope", short: "TLSC" }, 611: { name: "Magic Lamp", short: "LAMP" }
    };
    var map = {};
    for (var id in FALLBACK_ITEMS) {
      map[id] = { id: parseInt(id, 10), name: FALLBACK_ITEMS[id].name, short: FALLBACK_ITEMS[id].short };
    }
    return map;
  };

  console.log("[fallback.js] Готов");
})();
