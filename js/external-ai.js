/* DOTA JETCH — EXTERNAL AI v37.2
   + Фикс дословных переводов предметов
   + Минимальный промпт + мощный контекст */

var WORKER_URL = "https://gigachatwork.yiiwarsssss.workers.dev/";
var WORKER_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

var POS_BENCHMARKS = {
  1: { name: "керри (Pos 1)",   gpm: 600, xpm: 700, lh10: 70, kda: 3.5, heroDmgMin: 700, deathsMax: 5 },
  2: { name: "мид (Pos 2)",     gpm: 580, xpm: 720, lh10: 60, kda: 4.0, heroDmgMin: 850, deathsMax: 5 },
  3: { name: "оффлейн (Pos 3)", gpm: 480, xpm: 560, lh10: 45, kda: 3.0, heroDmgMin: 750, deathsMax: 7 },
  4: { name: "роум (Pos 4)",    gpm: 380, xpm: 480, lh10: 20, kda: 2.8, heroDmgMin: 550, deathsMax: 8 },
  5: { name: "саппорт (Pos 5)", gpm: 320, xpm: 420, lh10: 12, kda: 2.5, heroDmgMin: 400, deathsMax: 9 }
};

var ExternalAI = {
  enabled: true,
  busy: false,
  lastError: null,
  TIMEOUT_MS: 60000,
  rateLimitedUntil: 0,

  MODE_NAMES: {
    1: "All Pick", 2: "Captains Mode", 3: "Random Draft", 4: "Single Draft",
    5: "All Random", 11: "Mid Only", 12: "Least Played", 13: "Limited Heroes",
    16: "Captains Draft", 18: "Ability Draft", 20: "All Random Death Match",
    21: "1v1 Mid", 22: "Ranked All Pick", 23: "Turbo", 24: "Mutation"
  },

  heroAbilities: {
    "Nyx Assassin": "Impale, Mana Burn, Spiked Carapace, Vendetta.",
    "Pudge": "Meat Hook, Rot, Flesh Heap, Dismember.",
    "Invoker": "Quas/Wex/Exort + Sunstrike, Chaos Meteor, EMP, Tornado, Deafening Blast, Cold Snap, Ghost Walk, Ice Wall, Forge Spirit, Alacrity.",
    "Juggernaut": "Blade Fury, Healing Ward, Blade Dance, Omnislash.",
    "Phantom Assassin": "Stifling Dagger, Phantom Strike, Blur, Coup de Grace.",
    "Spectre": "Spectral Dagger, Desolate, Dispersion, Haunt.",
    "Slark": "Dark Pact, Pounce, Essence Shift, Shadow Dance.",
    "Shadow Fiend": "Shadowraze, Necromastery, Presence of the Dark Lord, Requiem.",
    "Storm Spirit": "Static Remnant, Electric Vortex, Overload, Ball Lightning.",
    "Tinker": "Laser, Heat-Seeking Missile, March of the Machines, Rearm.",
    "Anti-Mage": "Mana Break, Blink, Counterspell, Mana Void.",
    "Zeus": "Arc Lightning, Lightning Bolt, Heavenly Jump, Thundergod's Wrath.",
    "Crystal Maiden": "Crystal Nova, Frostbite, Arcane Aura, Freezing Field.",
    "Lion": "Earth Spike, Hex, Mana Drain, Finger of Death.",
    "Axe": "Berserker's Call, Counter Helix, Battle Hunger, Culling Blade.",
    "Lina": "Dragon Slave, Light Strike Array, Fiery Soul, Laguna Blade.",
    "Riki": "Smoke Screen, Blink Strike, Tricks of the Trade, Cloak and Dagger.",
    "Sniper": "Shrapnel, Headshot, Take Aim, Assassinate.",
    "Drow Ranger": "Frost Arrows, Gust, Multishot, Marksmanship."
  },

  blacklist: [
    "чит", "читы", "читак", "читер", "абрелл", "abrella", "breach",
    "hake", "хак", "хакер", "hack", "cheat",
    "script", "скрипт для дота", "autohotkey", "ahk", "macro", "макрос",
    "чит-мод", "читмод", "чит-меню", "aimbot", "аимбот", "wallhack", "волхак",
    "map hack", "maphack", "мапхак", "инжект", "injector",
    "античит обход", "обход античита", "бот для доты", "автоматизация дота"
  ],

  isBlacklisted: function (query) {
    var q = String(query || "").toLowerCase();
    for (var i = 0; i < this.blacklist.length; i++) {
      if (q.indexOf(this.blacklist[i]) >= 0) return this.blacklist[i];
    }
    return null;
  },

  findHeroAbilities: function (query) {
    var q = String(query || "").toLowerCase();
    var aliases = {
      "Nyx Assassin": ["никс", "nyx", "нюкса", "нюкс", "никса"],
      "Pudge": ["пудж", "мясник"],
      "Invoker": ["инвокер", "вокер"],
      "Juggernaut": ["джагер", "джага", "жугер", "джагернаут", "jugg"],
      "Phantom Assassin": ["па", "фантомка", "мортра"],
      "Spectre": ["спектра"],
      "Slark": ["сларк", "рыба"],
      "Shadow Fiend": ["сф"],
      "Storm Spirit": ["шторм"],
      "Tinker": ["тинкер"],
      "Anti-Mage": ["ам", "антимаг"],
      "Zeus": ["зевс"],
      "Crystal Maiden": ["цм", "кристалка"],
      "Lion": ["лайон"],
      "Axe": ["акс"],
      "Lina": ["лина"],
      "Riki": ["рики"],
      "Sniper": ["снайпер"],
      "Drow Ranger": ["дров", "дровка"]
    };
    for (var hero in this.heroAbilities) {
      if (!this.heroAbilities.hasOwnProperty(hero)) continue;
      if (q.indexOf(hero.toLowerCase()) >= 0) return { hero: hero, abilities: this.heroAbilities[hero] };
      if (aliases[hero]) {
        for (var i = 0; i < aliases[hero].length; i++) {
          if (q.indexOf(aliases[hero][i]) >= 0) return { hero: hero, abilities: this.heroAbilities[hero] };
        }
      }
    }
    return null;
  },

  isMatchQuestion: function (query) {
    var q = String(query || "").toLowerCase().trim();
    if (!q) return false;

    var noMatch = [
      "ты кто", "кто ты", "а ты кто", "что ты", "кто вы", "ты чё", "ты че",
      "как тебя зовут", "как звать", "представься", "твое имя", "твоё имя",
      "что ты умеешь", "что умеешь", "твои возможности", "чем можешь помочь",
      "привет", "здравствуй", "хай", "здоров", "здарова", "дарова", "ку",
      "пока", "бай", "спс", "спасибо", "благодарю",
      "как дела", "как ты", "что делаешь", "как жизнь",
      "стоп", "хватит", "остановись", "замолчи",
      "help", "помощь", "команды", "что делать"
    ];
    for (var i = 0; i < noMatch.length; i++) {
      if (q === noMatch[i] || q.indexOf(noMatch[i]) === 0) return false;
    }

    var words = q.split(/\s+/).filter(function (w) { return w.length > 0; });
    if (words.length <= 2 && q.length < 20) {
      var hasMatchWord = /матч|проигр|побед|луз|кда|kda|гпм|gpm|фарм|руинер|смерт|билд|керри|сап|мид/i.test(q);
      if (!hasMatchWord) return false;
    }

    var matchWords = [
      "матч", "проигр", "побед", "выигр", "луз", "затащ",
      "кда", "kda", "гпм", "gpm", "хпм", "xpm",
      "ластхит", "денай", "нетфорс", "нетворс",
      "руинер", "заруинил", "виноват", "слабый игрок",
      "смерт", "умира", "фарм", "харасил", "ганкал",
      "этот матч", "этой игре", "в этой игре", "моя игра",
      "мой герой", "моя позиция",
      "собрать", "собрал", "билд", "предметы в",
      "почему я", "как я", "что я",
      "разбери", "разбор", "анализ",
      "моя игра", "мои ошибки"
    ];
    for (var j = 0; j < matchWords.length; j++) {
      if (q.indexOf(matchWords[j]) >= 0) return true;
    }
    return false;
  },

  /* ═══ ФИКСЫ ═══
     Автозамены дословных переводов, которые Llama иногда выдает. */
  speechFixes: [
    [/\bденан(?:ы|ов|а|у|ом|е)?\b/gi, "денаи"],
    [/\bластхитс\b/gi, "ластхиты"],
    [/\bкрипс\b/gi, "крипы"],
    [/\bвардс\b/gi, "варды"],
    /* Предметы — дословные переводы */
    [/Ботинки скорости|ботинки скорости/gi, "Треды"],
    [/Ботинки путешественника|ботинки путешественника/gi, "БоТ"],
    [/Кольцо Базилиуса|кольцо Базилиуса/gi, "Базиль"],
    [/Меч Maelstrom|меч Maelstrom/gi, "Маелстром"],
    [/Меч Маэльштрома|меч Маэльштрома/gi, "Маелстром"],
    [/Клинок Мьёльнира|клинок Мьёльнира/gi, "Мьёльнир"],
    [/Клинок молнии|клинок молнии/gi, "Маелстром"],
    [/Посох силы|посох силы/gi, "Форс"],
    [/Жезл Eul'?а|жезл Eul'?а|жезл Эула/gi, "Еул"],
    [/Скипетр Агани|скипетр Агани|Скипетр Агани/gi, "Аганим"],
    [/Клинок битвы|клинок битвы/gi, "БФ"],
    [/Клинок ярости битвы|клинок ярости битвы/gi, "БФ"],
    [/Клинок бабочки|клинок бабочки/gi, "Бабочка"],
    [/Сердце Тарраски|сердце Тарраски/gi, "Тараска"],
    [/Шлем доминатора|шлем доминатора/gi, "Хелм"],
    [/Посох Линки|посох Линки|Сфера Линки/gi, "Линка"],
    [/Кольцо Аквамена|кольцо Аквамена/gi, "Урна"],
    [/Мантия дискорда|мантия дискорда/gi, "Вейл"],
    [/Жезл Атоса|жезл Атоса|Посох Атоса/gi, "Атос"],
    [/Клинок Диффуза|клинок Диффуза/gi, "Дифуза"],
    [/Кираса Шивы|кираса Шивы/gi, "Шива"],
    [/Маска безумия|маска безумия/gi, "МоМ"],
    [/Клинок МКБ|клинок МКБ/gi, "МКБ"],
    [/Молот МКБ|молот МКБ/gi, "МКБ"],
    [/Топор Абиссал|топор Абиссал/gi, "Абиссал"],
    [/Клинок Абиссала/gi, "Абиссал"],
    [/Посох сияния|посох сияния/gi, "Радик"],
    [/Светящийся клинок|светящийся клинок/gi, "Радик"],
    [/Пылающий клинок|пылающий клинок/gi, "Радик"],
    [/Клинок Эха|клинок Эха/gi, "Эхо"],
    [/Волшебная палочка|волшебная палочка/gi, "Ванд"],
    [/Волшебный посох|волшебный посох/gi, "Ванд"]
  ],

  applySpeechFixes: function (text) {
    var out = String(text);
    for (var i = 0; i < this.speechFixes.length; i++) {
      out = out.replace(this.speechFixes[i][0], this.speechFixes[i][1]);
    }
    return out;
  },

  applySlang: function (text) {
    var out = String(text);
    out = out.replace(/(^|[\s.,!?:;])\*([^\*\n]{1,60})\*(?=[\s.,!?:;]|$)/g, "$1**$2**");
    out = out.replace(/([A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё0-9'’\-\s]{0,50}?)\s*\(\s*\1\s*\)/g, "$1");
    out = this.applySpeechFixes(out);
    return out;
  },

  systemPrompt: function (matchContext, heroAbilitiesInfo, searchData) {
    var base = [
      "Ты — DotaJetch, тренер по Dota 2 и ИИ-ассистент проекта DOTA JETCH. Отвечай на русском.",
      "",
      "ВАЖНО: НЕ ПЕРЕВОДИ английские названия предметов дословно.",
      "Пиши как принято в ру-доте: БКБ, Радик, Манта, Дезоль, Дифуза, Хекс, Еул, Гост, Линка, Тараска, Аганим, Шард, Треды, Фейзы, Арканы, Атос, Сосуд, Блудорн.",
      "Если не уверен в сленге — пиши английское название как есть (Blade Mail, Force Staff).",
      "НЕ пиши 'Ботинки скорости' — это Треды. НЕ пиши 'Меч Maelstrom' — это Маелстром. НЕ пиши 'Кольцо Базилиуса' — это Базиль."
    ].join("\n");

    if (heroAbilitiesInfo) {
      base += "\n\nСпособности " + heroAbilitiesInfo.hero + " (реальные, не выдумывай других):\n" + heroAbilitiesInfo.abilities;
    }
    if (searchData && typeof WebSearch !== "undefined" && WebSearch && typeof WebSearch.formatForPrompt === "function") {
      var formatted = WebSearch.formatForPrompt(searchData);
      if (formatted) base += "\n\nРезультаты поиска:\n" + formatted;
    }
    if (matchContext) base += "\n\n" + matchContext;
    return base;
  },

  getContextSource: function () {
    if (typeof window !== "undefined" && window.chatMatchContext && window.chatMatchContext.match) return window.chatMatchContext;
    if (typeof lastAnalysis !== "undefined" && lastAnalysis && lastAnalysis.match) return lastAnalysis;
    return null;
  },

  detectPosition: function (p, durMin) {
    if (!p) return null;
    var lane = p.lane_role;
    var isRoaming = p.is_roaming === true;
    var lhPerMin = (p.last_hits || 0) / Math.max(durMin, 1);
    if (isRoaming) return 4;
    if (lane === 1) return lhPerMin >= 4 ? 1 : 5;
    if (lane === 2) return 2;
    if (lane === 3) return lhPerMin >= 3 ? 3 : 4;
    if (lane === 4) return 4;
    var gpm = p.gold_per_min || 0;
    if (gpm >= 550 && lhPerMin >= 6) return 1;
    if (gpm >= 480 && lhPerMin >= 4) return 2;
    if (gpm >= 380 && lhPerMin >= 2.5) return 3;
    if (gpm >= 280) return 4;
    return 5;
  },

  buildMatchContext: function () {
    var res = this.getContextSource();
    if (!res || !res.player || !res.match) return null;

    var p = res.player;
    var m = res.match;
    var heroName = res.hero ? res.hero.name : "?";
    var durMin = (m.duration || 0) / 60;
    if (durMin < 1) durMin = 1;

    var posNum = res.position || this.detectPosition(p, durMin);
    var pos = POS_BENCHMARKS[posNum] || POS_BENCHMARKS[1];
    var modeName = this.MODE_NAMES[m.game_mode] || ("Режим #" + m.game_mode);

    var lines = [];

    lines.push("=== МАТЧ ===");
    lines.push("Игрок: " + heroName + " · " + pos.name + " · " + (res.won ? "ПОБЕДА 🏆" : "ПОРАЖЕНИЕ 💀"));
    lines.push("Режим: " + modeName + " · Длительность: " + durMin.toFixed(0) + " мин");
    lines.push("");

    lines.push("=== СТАТИСТИКА ===");

    var kda = p.kills + "/" + p.deaths + "/" + p.assists;
    var kdaRatio = (p.kills + p.assists) / Math.max(p.deaths, 1);
    var kdaMark = kdaRatio >= pos.kda ? "🟢" : (kdaRatio >= pos.kda * 0.6 ? "🟡" : "🔴");
    lines.push("KDA: " + kda + " (" + kdaRatio.toFixed(2) + ") · норма " + pos.kda + " " + kdaMark);

    var gpm = Math.round(p.gold_per_min || 0);
    var gpmMark = gpm >= pos.gpm ? "🟢" : (gpm >= pos.gpm * 0.7 ? "🟡" : "🔴");
    lines.push("GPM: " + gpm + " · норма " + pos.gpm + " " + gpmMark);

    var xpm = Math.round(p.xp_per_min || 0);
    var xpmMark = xpm >= pos.xpm ? "🟢" : (xpm >= pos.xpm * 0.7 ? "🟡" : "🔴");
    lines.push("XPM: " + xpm + " · норма " + pos.xpm + " " + xpmMark);

    var lh = p.last_hits || 0;
    var lhPerMin = lh / Math.max(durMin, 1);
    var lh10 = Math.round(lhPerMin * 10);
    var lhMark = lh10 >= pos.lh10 ? "🟢" : (lh10 >= pos.lh10 * 0.7 ? "🟡" : "🔴");
    lines.push("Ластхиты: " + lh + " (~" + lh10 + " за 10 мин) · норма " + pos.lh10 + " " + lhMark);

    lines.push("Денаи: " + (p.denies || 0));

    var deaths = p.deaths || 0;
    var dMark = deaths <= pos.deathsMax ? "🟢" : (deaths <= pos.deathsMax * 1.5 ? "🟡" : "🔴");
    lines.push("Смертей: " + deaths + " · норма до " + pos.deathsMax + " " + dMark);

    var hd = Math.round(p.hero_damage || 0);
    var hdPerMin = hd / Math.max(durMin, 1);
    var hdMark = hdPerMin >= pos.heroDmgMin ? "🟢" : (hdPerMin >= pos.heroDmgMin * 0.7 ? "🟡" : "🔴");
    lines.push("Урон по героям: " + hd + " (" + Math.round(hdPerMin) + "/мин) · норма " + pos.heroDmgMin + " " + hdMark);

    var td = Math.round(p.tower_damage || 0);
    if (td > 0) lines.push("Урон по строениям: " + td);

    var heal = Math.round(p.hero_healing || 0);
    if (heal > 0) lines.push("Хил: " + heal);

    var nw = Math.round(p.total_gold || p.net_worth || 0);
    if (nw > 0) lines.push("Нетворс: " + nw);

    lines.push("");

    if (res.performance && res.performance.grade) {
      lines.push("=== ОЦЕНКА ===");
      lines.push("Балл: " + res.performance.grade + " (" + res.performance.score + "/100)");
      if (res.performance.reasons && res.performance.reasons.length) {
        for (var r = 0; r < res.performance.reasons.length; r++) {
          lines.push("• " + res.performance.reasons[r]);
        }
      }
      lines.push("");
    }

    if (res.items) {
      var invItems = [];
      for (var ii = 0; ii < 6; ii++) {
        var itemId = p["item_" + ii];
        if (itemId && itemId > 0 && res.items[itemId]) {
          invItems.push(res.items[itemId].name);
        }
      }
      if (invItems.length) {
        lines.push("=== ИНВЕНТАРЬ ===");
        lines.push(invItems.join(", "));
        lines.push("");
      }
    }

    if (res.heroes && m.players) {
      var isRad = p.player_slot < 128;
      var allies = [], enemies = [];
      for (var i = 0; i < m.players.length; i++) {
        var mp = m.players[i];
        if (mp.player_slot === p.player_slot) continue;
        var hn = "?";
        for (var j = 0; j < res.heroes.length; j++) {
          if (res.heroes[j].id === mp.hero_id) { hn = res.heroes[j].name; break; }
        }
        var k = mp.kills || 0, d = mp.deaths || 0, a = mp.assists || 0;
        var g = Math.round(mp.gold_per_min || 0);
        var entry = hn + " (" + k + "/" + d + "/" + a + ", GPM " + g + ")";
        if ((mp.player_slot < 128) === isRad) allies.push(entry);
        else enemies.push(entry);
      }
      if (allies.length) {
        lines.push("=== СОЮЗНИКИ ===");
        for (var al = 0; al < allies.length; al++) lines.push("• " + allies[al]);
        lines.push("");
      }
      if (enemies.length) {
        lines.push("=== ВРАГИ ===");
        for (var en = 0; en < enemies.length; en++) lines.push("• " + enemies[en]);
      }
    }

    return lines.join("\n");
  },

  fetchWithTimeout: function (url, options, timeoutMs) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, timeoutMs);
    options.signal = controller.signal;
    return fetch(url, options).finally(function () { clearTimeout(timeoutId); });
  },

  sleep: function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); },

  cloudflareAI: async function (userQuery, matchContext, heroAbilitiesInfo, searchData) {
    var body = {
      model: WORKER_MODEL,
      messages: [
        { role: "system", content: this.systemPrompt(matchContext, heroAbilitiesInfo, searchData) },
        { role: "user", content: userQuery }
      ]
    };
    var res = await this.fetchWithTimeout(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }, this.TIMEOUT_MS);

    if (res.status === 429) throw { code: 429, message: "Дневной лимит исчерпан. Сброс в 03:00 МСК." };
    if (!res.ok) {
      var errBody = await res.text();
      throw new Error("Cloudflare AI HTTP " + res.status + ": " + errBody.slice(0, 200));
    }
    var text = await res.text();
    var json = JSON.parse(text);
    if (json.error) throw new Error("Cloudflare AI: " + json.error);
    if (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) {
      return this.applySlang(json.choices[0].message.content);
    }
    throw new Error("Пустой ответ Cloudflare AI");
  },

  isWeakAnswer: function (text) {
    if (!text) return true;
    var t = String(text).toLowerCase();
    var words = t.split(/\s+/).filter(function (w) { return w.length > 0; }).length;
    if (t.indexOf("не знаю") >= 0) return true;
    if (t.indexOf("не уверен") >= 0) return true;
    if (t.indexOf("не могу точно") >= 0) return true;
    if (t.indexOf("i don't know") >= 0) return true;
    if (t.indexOf("i'm not sure") >= 0) return true;
    if (t.indexOf("попробуй переформулировать") >= 0) return true;
    if (t.indexOf("уточни") >= 0 && words < 30) return true;
    if (words < 15) return true;
    return false;
  },

  ask: async function (query, matchContext, onStage) {
    if (!this.enabled) throw new Error("external-ai-disabled");
    if (this.busy) throw new Error("busy");

    var blocked = this.isBlacklisted(query);
    if (blocked) {
      return "🚫 Не помогаю с читами, хаками и скриптами для Dota 2. За такое банят аккаунт.\n\nСпроси что-нибудь по игре.";
    }

    var heroAbilities = this.findHeroAbilities(query);
    var useMatchContext = this.isMatchQuestion(query);
    var ctxForPrompt = useMatchContext ? matchContext : null;

    this.busy = true;
    this.lastError = null;

    try {
      if (onStage) onStage("first");
      var text1 = await this.cloudflareAI(query, ctxForPrompt, heroAbilities, null);

      var canSearch = (typeof WebSearch !== "undefined") && WebSearch && (typeof WebSearch.search === "function");
      if (this.isWeakAnswer(text1) && canSearch) {
        if (onStage) onStage("search");
        console.log("[AutoSearch] Слабый ответ, ищу...");
        var searchData = null;
        try { searchData = await WebSearch.search(query); } catch (e) { console.warn("Search failed:", e.message); }

        if (searchData && searchData.results && searchData.results.length) {
          if (onStage) onStage("second");
          try {
            var text2 = await this.cloudflareAI(query, ctxForPrompt, heroAbilities, searchData);
            if (text2 && text2.length > text1.length) return text2;
          } catch (e2) { console.warn("Второй запрос упал:", e2.message); }
        }
      }

      return text1;
    } catch (err) {
      console.warn("Cloudflare AI упал:", err.message);
      throw new Error(err.message || "Сервис перегружен. Попробуй через минуту.");
    } finally {
      this.busy = false;
    }
  },

  shouldUseExternal: function () { return true; },
  init: function () { console.log("external-ai v37.2 · фикс дословных переводов"); }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}

