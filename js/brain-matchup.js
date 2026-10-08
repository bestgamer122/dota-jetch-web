/* DOTA JETCH — BRAIN MATCHUP v1.0
   Разбор конкретных матчапов: "как играть Pudge против Anti-Mage". */

var BrainMatchup = {

  heroAliases: {
    "ам": "Anti-Mage", "антимаг": "Anti-Mage",
    "па": "Phantom Assassin", "фантомка": "Phantom Assassin",
    "пудж": "Pudge", "инвокер": "Invoker",
    "жугер": "Juggernaut", "сларк": "Slark", "шторм": "Storm Spirit",
    "сф": "Shadow Fiend", "зевс": "Zeus", "лина": "Lina",
    "дров": "Drow Ranger", "снайпер": "Sniper", "свен": "Sven",
    "цм": "Crystal Maiden", "лк": "Wraith King", "тини": "Tiny",
    "тимбер": "Timbersaw", "магнус": "Magnus", "медуза": "Medusa",
    "луна": "Luna", "войд": "Faceless Void", "урса": "Ursa",
    "цк": "Chaos Knight", "дк": "Dragon Knight", "тролль": "Troll Warlord",
    "эмбер": "Ember Spirit", "морф": "Morphling", "лайфстил": "Lifestealer",
    "пак": "Puck", "разор": "Razor", "течис": "Techies",
    "туск": "Tusk", "вивер": "Winter Wyvern", "вено": "Venomancer",
    "аба": "Abaddon", "алх": "Alchemist", "бейн": "Bane",
    "дуза": "Medusa", "горгона": "Medusa", "спектра": "Spectre",
    "пл": "Phantom Lancer", "рики": "Riki", "нага": "Naga Siren",
    "мипо": "Meepo", "клок": "Clockwerk", "нюкс": "Nyx Assassin",
    "tb": "Terrorblade", "террорблейд": "Terrorblade", "террор": "Terrorblade"
  },

  matchups: {
    "Anti-Mage|Storm Spirit": "🟢 **AM выигрывает матчап.**\n\n• Mana Void бьёт больно — Storm без маны мёртв\n• Не дерись 1-в-1 до BKB, фарми\n• Предметы: Manta, Abyssal, BKB",
    "Anti-Mage|Medusa": "🟢 **AM выигрывает матчап.**\n\n• Сжигаешь ману — нет Mana Shield\n• Manta + Abyssal = выключаешь её\n• Предметы: Diffusal Blade, Manta, Abyssal",
    "Phantom Assassin|Axe": "🔴 **PA проигрывает матчап.**\n\n• Call + Blade Mail = ты умираешь\n• Не атакуй его без BKB\n• Купи BKB, Silver Edge",
    "Phantom Assassin|Sniper": "🟢 **PA выигрывает матчап.**\n\n• Прыгаешь + криты = Sniper мёртв\n• Blur даёт уклонение от его атак\n• Предметы: Blink, Desolator, BKB",
    "Pudge|Anti-Mage": "🟡 **Ровный матчап.**\n\n• AM сжигает ману — Dismember не работает\n• Поймай его до BKB — он хрупкий\n• Предметы: Blink, Aether Lens, Aghs",
    "Pudge|Slark": "🟡 **Ровный матчап.**\n\n• Slark может Dark Pact — снимает Rot\n• Ловь его до 6 уровня — он слаб\n• Предметы: Blink, Force Staff",
    "Juggernaut|Legion Commander": "🔴 **Jugg проигрывает матчап.**\n\n• Duel во время Omnislash = смерть\n• Жди когда LC уйдёт на другую линию\n• Предметы: Manta, Linken's, BKB",
    "Juggernaut|Sniper": "🟢 **Jugg выигрывает матчап.**\n\n• Прыгаешь в него + Omni = смерть\n• Blade Fury снимает дебаффы\n• Предметы: Blink, Manta, Aghs",
    "Storm Spirit|Anti-Mage": "🔴 **Storm проигрывает матчап.**\n\n• AM сжигает ману — Ball Lightning не работает\n• Купи Linken's, BKB\n• Фарми безопасно, не дерись 1-в-1",
    "Storm Spirit|Sniper": "🟢 **Storm выигрывает матчап.**\n\n• Ball Lightning = прыжок на Sniper = смерть\n• Ловь его на линии до 6\n• Предметы: Orchid, Bloodstone, BKB",
    "Terrorblade|Phantom Assassin": "🟡 **Ровный матчап.**\n\n• TB без иллюзий умирает — Sunder спасает\n• PA прыгает + криты = TB мёртв до BKB\n• Предметы: Manta, BKB, Butterfly",
    "Terrorblade|Axe": "🔴 **TB проигрывает матчап.**\n\n• Call + Blade Mail = ты умираешь\n• Держи Sunder на готове\n• Предметы: BKB, Manta, Butterfly",
    "Phantom Lancer|Earthshaker": "🔴 **PL проигрывает матчап.**\n\n• Echo Slam убивает всех иллюзий\n• Рассеивай иллюзии, не стой толпой\n• Предметы: Diffusal Blade, Heart",
    "Wraith King|Anti-Mage": "🔴 **WK проигрывает матчап.**\n\n• AM сжигает ману — нет реинкарнации\n• Играй вокруг команды, не 1-в-1\n• Предметы: Radiance, Armlet, Blade Mail",
    "Sniper|Spirit Breaker": "🔴 **Sniper проигрывает матчап.**\n\n• Charge of Darkness = прыгает на тебя\n• Стой под башней, не ходи в лес\n• Предметы: Manta, Silver Edge, BKB"
  },

  generic: {
    "counter": "🎯 **{hero1} контрит {hero2}.**\n\n{hero1} имеет преимущество в этом матчапе.\n\n💡 **Стратегия:**\n• Играй агрессивно на линии\n• Покупай ключевые предметы\n• Не давай {hero2} фармить",
    "countered": "⚠️ **{hero1} проигрывает {hero2}.**\n\n{hero2} имеет преимущество против {hero1}.\n\n💡 **Стратегия:**\n• Играй безопасно на линии\n• Покупай защитные предметы\n• Ищи помощи у команды",
    "even": "🟡 **Ровный матчап {hero1} vs {hero2}.**\n\nНет явного преимущества.\n\n💡 **Стратегия:**\n• Играй от своих сильных сторон\n• Смотри по ситуации\n• Координируйся с саппортом"
  },

  normalizeHero: function (name) {
    if (!name) return null;
    var s = String(name).toLowerCase().trim();
    if (this.heroAliases[s]) return this.heroAliases[s];
    for (var key in this.matchups) {
      if (!this.matchups.hasOwnProperty(key)) continue;
      var parts = key.split("|");
      for (var i = 0; i < parts.length; i++) {
        if (parts[i].toLowerCase() === s) return parts[i];
      }
    }
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  },

  findMatchup: function (hero1, hero2) {
    var key1 = hero1 + "|" + hero2;
    var key2 = hero2 + "|" + hero1;
    if (this.matchups[key1]) return { text: this.matchups[key1], order: "hero1_first" };
    if (this.matchups[key2]) return { text: this.matchups[key2], order: "hero2_first" };
    return null;
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase().trim();
    if (s.indexOf("как играть") >= 0 && s.indexOf("против") >= 0) return "matchup";
    if (s.indexOf("что делать") >= 0 && s.indexOf("против") >= 0) return "matchup";
    if (/^[\wа-яё]+\s+против\s+[\wа-яё]+/i.test(s)) return "matchup";
    if (/^[\wа-яё]+\s+(vs|вс)\s+[\wа-яё]+/i.test(s)) return "matchup";
    if (s.indexOf("как контрить") >= 0) return "matchup";
    if (s.indexOf("матчап") >= 0) return "matchup";
    return null;
  },

  extractTwoHeroes: function (q) {
    var s = String(q || "").toLowerCase().trim();
    s = s.replace(/^(как играть|что делать|матчап|как контрить|что против)\s+/i, "").trim();
    var parts = s.split(/\s+(?:против|vs|вс)\s+/i);
    if (parts.length < 2) return null;
    var h1 = parts[0].trim().split(/\s+/).slice(-1)[0];
    var h2 = parts[1].trim().split(/\s+/)[0];
    var hero1 = this.normalizeHero(h1);
    var hero2 = this.normalizeHero(h2);
    if (!hero1 || !hero2) return null;
    return { hero1: hero1, hero2: hero2 };
  },

  answer: function (kind, q) {
    if (kind !== "matchup") return null;
    var heroes = this.extractTwoHeroes(q);
    if (!heroes) return "🎯 Назови двух героев — например, «как играть пуджом против антимага».";

    var h1 = heroes.hero1, h2 = heroes.hero2;

    var exact = this.findMatchup(h1, h2);
    if (exact) {
      return "⚔ **Матчап: " + h1 + " vs " + h2 + "**\n\n" + exact.text;
    }

    var advice = "⚔ **Матчап: " + h1 + " vs " + h2 + "**\n\n";
    if (typeof BrainCounters !== "undefined") {
      var c1 = BrainCounters.getCountersFor(h1);
      var c2 = BrainCounters.getCountersFor(h2);
      if (c2 && c2.counters && c2.counters.indexOf(h1) >= 0) {
        return advice + this.generic.counter.replace(/{hero1}/g, h1).replace(/{hero2}/g, h2);
      }
      if (c1 && c1.counters && c1.counters.indexOf(h2) >= 0) {
        return advice + this.generic.countered.replace(/{hero1}/g, h1).replace(/{hero2}/g, h2);
      }
    }
    return advice + this.generic.even.replace(/{hero1}/g, h1).replace(/{hero2}/g, h2);
  }
};

console.log("brain-matchup v1.0 ready");
