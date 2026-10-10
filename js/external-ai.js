/* DOTA JETCH — EXTERNAL AI v36.0
   + УМНАЯ проверка: контекст матча только для вопросов ПРО МАТЧ
   + Список стоп-слов и простых вопросов — без контекста
   + Llama 3.3 70B внутри Cloudflare Worker */

/* ═══════════════════════════════════════════════════════════
   НАСТРОЙКА
   ═══════════════════════════════════════════════════════════ */
var WORKER_URL = "https://gigachatwork.yiiwarsssss.workers.dev/";
var WORKER_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
/* ═══════════════════════════════════════════════════════════ */

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
    "Nyx Assassin": "Impale (штыри, стан), Mana Burn (сжигает ману), Spiked Carapace (отражает урон и станит), Vendetta (невидимость + бонус урона).",
    "Pudge": "Meat Hook (хук), Rot (гниль AoE), Flesh Heap (стаки + магрезист), Dismember (расчленение).",
    "Invoker": "Quas/Wex/Exort + Sunstrike, Chaos Meteor, EMP, Tornado, Deafening Blast, Cold Snap, Ghost Walk, Ice Wall, Forge Spirit, Alacrity.",
    "Juggernaut": "Blade Fury (вертушка), Healing Ward, Blade Dance (криты), Omnislash (неуязвимая ульта).",
    "Phantom Assassin": "Stifling Dagger (даггер), Phantom Strike (прыжок), Blur (уворот), Coup de Grace (криты).",
    "Spectre": "Spectral Dagger (даггер), Desolate (десолейт), Dispersion (дисперсия), Haunt (хаунт + Reality).",
    "Slark": "Dark Pact (пакт), Pounce (прыжок), Essence Shift (эссенс шифт), Shadow Dance (шадоу дэнс).",
    "Shadow Fiend": "Shadowraze (рейзы), Necromastery (некромастери), Presence of the Dark Lord (аура), Requiem (реквием).",
    "Storm Spirit": "Static Remnant (ремант), Electric Vortex (вихрь), Overload (оверлоад), Ball Lightning (болт).",
    "Tinker": "Laser (лазер), Heat-Seeking Missile (ракеты), March of the Machines (марш), Rearm (ресет кулдаунов).",
    "Anti-Mage": "Mana Break (сжигает ману), Blink (блинк), Counterspell (отражает таргет-спеллы), Mana Void (мана войд).",
    "Zeus": "Arc Lightning (цепная молния), Lightning Bolt (болт), Heavenly Jump (прыжок), Thundergod's Wrath (глобальная ульта).",
    "Crystal Maiden": "Crystal Nova (нова), Frostbite (фриз), Arcane Aura (аура маны), Freezing Field (ульта).",
    "Lion": "Earth Spike (спайк), Hex (хекс), Mana Drain (дрейн), Finger of Death (палец).",
    "Axe": "Berserker's Call (колл), Counter Helix (вертолёт), Battle Hunger (голод), Culling Blade (казнь).",
    "Lina": "Dragon Slave (драгон слейв), Light Strike Array (столб), Fiery Soul (фиери соул), Laguna Blade (лагуна).",
    "Riki": "Smoke Screen (смокскрин), Blink Strike (блинк страйк), Tricks of the Trade (трикс), Cloak and Dagger (невидимость).",
    "Sniper": "Shrapnel (шрапнель), Headshot (хедшот), Take Aim (тейк эйм), Assassinate (ассасинейт).",
    "Drow Ranger": "Frost Arrows (фрост арроузы), Gust (густ), Multishot (мультишот), Marksmanship (маркманшип)."
  },

  blacklist: [
    "чит", "читы", "читак", "читер",
    "абрелл", "abrella", "breach",
    "hake", "хак", "хакер", "hack", "cheat",
    "script", "скрипт для дота", "autohotkey", "ahk", "macro", "макрос",
    "чит-мод", "читмод", "чит-меню",
    "aimbot", "аимбот", "wallhack", "волхак",
    "map hack", "maphack", "мапхак",
    "инжект", "injector",
    "античит обход", "обход античита",
    "бот для доты", "автоматизация дота"
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

  /* ═══ УМНАЯ ПРОВЕРКА: относится ли вопрос к матчу ═══
     Если НЕТ — контекст матча не подкладывается.
     Если ДА — подкладывается. */
  isMatchQuestion: function (query) {
    var q = String(query || "").toLowerCase().trim();
    if (!q) return false;

    /* Явные фразы — НЕ про матч (короткие приветствия, identity) */
    var noMatchPhrases = [
      "ты кто", "кто ты", "а ты кто", "что ты", "кто вы", "ты чё", "ты че",
      "как тебя зовут", "как звать", "представься", "твое имя", "твоё имя",
      "что ты умеешь", "что умеешь", "твои возможности", "чем можешь помочь",
      "привет", "здравствуй", "хай", "здоров", "здарова", "дарова", "ку",
      "пока", "бай", "спс", "спасибо", "благодарю",
      "как дела", "как ты", "что делаешь", "как жизнь",
      "стоп", "хватит", "остановись", "замолчи",
      "help", "помощь", "команды", "что делать"
    ];
    for (var i = 0; i < noMatchPhrases.length; i++) {
      if (q === noMatchPhrases[i] || q.indexOf(noMatchPhrases[i]) === 0) return false;
    }

    /* Очень короткие вопросы (1-2 слова) — скорее всего не про матч */
    var words = q.split(/\s+/).filter(function (w) { return w.length > 0; });
    if (words.length <= 2 && q.length < 20) {
      /* Исключение: если есть явные матч-слова */
      var hasMatchWord = /матч|проигр|побед|луз|кда|kda|гпм|gpm|фарм|руинер|смерт|билд|керри|сап|мид/i.test(q);
      if (!hasMatchWord) return false;
    }

    /* Явные матч-слова → ДА, это про матч */
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

    /* По умолчанию — НЕ про матч (лучше без контекста, чем с ним) */
    return false;
  },

  /* Только грамматические фиксы русского */
  speechFixes: [
    [/\bденан(?:ы|ов|а|у|ом|е)?\b/gi, "денаи"],
    [/\bластхитс\b/gi, "ластхиты"],
    [/\bкрипс\b/gi, "крипы"],
    [/\bвардс\b/gi, "варды"]
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
      "Ты — DotaJetch AI, тренер по Dota 2. Помогаешь игроку разбирать матчи и становиться лучше.",
      "Ты ассистент, НЕ игрок. Пиши 'ты играл', 'твой KDA', 'тебе нужно'. НЕ пиши 'я играл', 'мой KDA'.",
      "",
      "🗣 ГОВОРИ КАК НАСТОЯЩИЙ ДОТЕР:",
      "Ты знаешь весь дотерский сленг — используй его естественно, без пояснений.",
      "Все предметы, герои, механики — называй так, как принято в русскоязычном сообществе Dota 2.",
      "БКБ, МКБ, БФ, Радик, Манта, Дезоль, Дифуза, Хекс, Еул, Гост, Линка, Тараска — используй эти названия если речь о них.",
      "Героев называй коротко если принято: АМ, ПА, СФ, ЦМ, Джагер, Пудж, Инвокер, Шторм, Дров.",
      "Используй: 'керри', 'мид', 'сап', 'фармить', 'ганкать', 'руинить', 'фидить', 'пушить', 'денаить', 'харасить', 'стакать', 'пулить', 'файтиться', 'сплитпушить', 'рошить', 'таймить'.",
      "",
      "🇷🇺 ЯЗЫК:",
      "Отвечай ТОЛЬКО на русском. Английские слова — только там где они реально нужны (KDA, GPM).",
      "",
      "🎭 ЕСЛИ СПРАШИВАЮТ КТО ТЫ:",
      "Отвечай честно: ты ИИ-ассистент DotaJetch, помогаешь с Dota 2. НЕ выдумывай биографию, НЕ говори что ты игрок или герой.",
      "НЕ приплетай контекст матча если про него НЕ спрашивают.",
      "",
      "🚫 НИКАКИХ ВСТУПЛЕНИЙ:",
      "Не пиши 'Отличный вопрос!', 'Конечно!', 'Хорошо!', 'Давай разберёмся'. Начинай сразу с ответа.",
      "",
      "🚫 НЕ ДУБЛИРУЙ:",
      "Не пиши 'Black King Bar (БКБ)' или 'Форс (Форс)'. Используй ОДНО название.",
      "",
      "🚫 НЕ ВЫДУМЫВАЙ:",
      "Не придумывай способности, которых нет. Не придумывай предметы. Если не знаешь — скажи 'Не знаю точно'.",
      "",
      "🚫 ЧИТЫ:",
      "Откажи коротко: 'Не помогаю с читами. За такое бан.' Без лекций.",
      "",
      "📝 ФОРМАТ:",
      "• **Жирный** через двойные звёздочки для ключевых слов",
      "• Списки через `• `",
      "• Заголовки через `### ` для больших блоков",
      "• Эмодзи для разделов: 🎯 💡 ⚔ 🛡 📊 💀 🏆 🔥",
      "• Пустая строка между блоками",
      "",
      "📏 ДЛИНА:",
      "• Короткий вопрос → 2-4 предложения",
      "• Вопрос про матч → до 300 слов, с конкретными цифрами",
      "• Общий вопрос → 150-250 слов",
      "• 'Подробно'/'гайд'/'сборка' → до 500 слов",
      "",
      "Пиши как живой дотер. Дружелюбно, но по делу."
    ].join("\n");

    if (heroAbilitiesInfo) {
      base += "\n\n=== СПОСОБНОСТИ " + heroAbilitiesInfo.hero.toUpperCase() + " ===\n" +
        "Используй ТОЛЬКО эти способности (реальные данные):\n" +
        heroAbilitiesInfo.abilities;
    }

    if (searchData && typeof WebSearch !== "undefined" && WebSearch && typeof WebSearch.formatForPrompt === "function") {
      var formatted = WebSearch.formatForPrompt(searchData);
      if (formatted) {
        base += "\n\n=== РЕЗУЛЬТАТЫ ПОИСКА ===\n" +
          "Используй ТОЛЬКО эту информацию:\n\n" + formatted;
      }
    }

    if (matchContext) {
      base += "\n\n=== ДАННЫЕ МАТЧА ИГРОКА ===\n" +
        "Информация ПРО ИГРОКА. Ссылайся на конкретные цифры, не говори 'я играл'.\n" +
        "⚠️ Используй эти данные ТОЛЬКО если вопрос про матч. Если вопрос про другое — игнорируй этот блок.\n\n" +
        matchContext;
    }

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
    if (isRoaming) return "Pos 4 (роум)";
    if (lane === 1) return lhPerMin >= 4 ? "Pos 1 (керри)" : "Pos 5 (саппорт)";
    if (lane === 2) return "Pos 2 (мид)";
    if (lane === 3) return lhPerMin >= 3 ? "Pos 3 (оффлейн)" : "Pos 4 (роум)";
    if (lane === 4) return "Pos 4 (роум)";
    var gpm = p.gold_per_min || 0;
    if (gpm >= 550 && lhPerMin >= 6) return "Pos 1 (керри)";
    if (gpm >= 480 && lhPerMin >= 4) return "Pos 2 (мид)";
    if (gpm >= 380 && lhPerMin >= 2.5) return "Pos 3 (оффлейн)";
    if (gpm >= 280) return "Pos 4 (роум)";
    return "Pos 5 (саппорт)";
  },

  buildMatchContext: function () {
    var res = this.getContextSource();
    if (!res || !res.player || !res.match) return null;
    var p = res.player, m = res.match;
    var heroName = res.hero ? res.hero.name : "?";
    var durMin = (m.duration || 0) / 60;
    var position = res.position ? ("Pos " + res.position) : this.detectPosition(p, durMin);
    var modeName = this.MODE_NAMES[m.game_mode] || ("Режим #" + m.game_mode);

    var lines = [];
    var resultStr = res.won ? "ПОБЕДА 🏆" : "ПОРАЖЕНИЕ 💀";
    lines.push(heroName.toUpperCase() + " · " + resultStr + " · " + durMin.toFixed(0) + " мин · " + modeName);
    if (position) lines.push("Позиция: " + position);
    lines.push("");

    var kda = p.kills + "/" + p.deaths + "/" + p.assists;
    var kdaRatio = ((p.kills + p.assists) / Math.max(p.deaths, 1)).toFixed(2);
    var lhPerMin = ((p.last_hits || 0) / Math.max(durMin, 1)).toFixed(1);
    lines.push("KDA: " + kda + " (" + kdaRatio + ")");
    lines.push("GPM: " + Math.round(p.gold_per_min || 0) + " · XPM: " + Math.round(p.xp_per_min || 0));
    lines.push("Ластхиты: " + (p.last_hits || 0) + " (" + lhPerMin + "/мин) · Денаи: " + (p.denies || 0));
    lines.push("Урон по героям: " + Math.round(p.hero_damage || 0) + " · Нетворс: " + Math.round(p.total_gold || p.net_worth || 0));

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
        var short = hn + " (" + (mp.kills||0) + "/" + (mp.deaths||0) + "/" + (mp.assists||0) + ")";
        if ((mp.player_slot < 128) === isRad) allies.push(short);
        else enemies.push(short);
      }
      if (allies.length) lines.push("Союзники: " + allies.join(", "));
      if (enemies.length) lines.push("Враги: " + enemies.join(", "));
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

    if (res.status === 429) throw { code: 429, message: "Дневной лимит нейронов исчерпан. Сброс в 03:00 МСК." };
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

    /* ═══ ГЛАВНЫЙ ФИКС ═══
       Если вопрос НЕ про матч — не подкладываем контекст */
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
        console.log("[AutoSearch] Слабый ответ, ищу в интернете...");
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
  init: function () { console.log("external-ai v36.0 · контекст только для матч-вопросов"); }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}

