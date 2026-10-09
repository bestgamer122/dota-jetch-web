/* DOTA JETCH — EXTERNAL AI v17.0 FINAL
   ИИ не герой + режим игры + без выдумок + чёрный список + умный контекст */

var ExternalAI = {
  enabled: true,
  busy: false,
  lastError: null,
  TIMEOUT_MS: 30000,

  mistralKey: "mstrl_fmvy3EYwtaIGtaLRiqrwMK2RRFOZtVcb_1McbHV",
  mistralUrl: "https://api.mistral.ai/v1/chat/completions",

  mistralModels: ["mistral-small-latest", "open-mistral-nemo"],

  rateLimitedUntil: 0,
  currentModelIdx: 0,

  MODE_NAMES: {
    1: "All Pick", 2: "Captains Mode", 3: "Random Draft", 4: "Single Draft",
    5: "All Random", 11: "Mid Only", 12: "Least Played", 13: "Limited Heroes",
    16: "Captains Draft", 18: "Ability Draft", 20: "All Random Death Match",
    21: "1v1 Mid", 22: "Ranked All Pick", 23: "Turbo", 24: "Mutation"
  },

  blacklist: [
    "чит", "читы", "читак", "читер",
    "абрелл", "abrella", "breach",
    "hake", "хак", "хакер", "hack", "cheat",
    "script", "скрипт для дота", "script для доты",
    "autohotkey", "ahk", "macro", "макрос",
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

  isMatchQuestion: function (query) {
    var q = String(query || "").toLowerCase();
    var matchWords = [
      "матч", "проигра", "победил", "выиграл", "луз",
      "кда", "kda", "гпм", "gpm", "хпм", "xpm",
      "ластхит", "денай", "нетфорс", "нетворс",
      "руинер", "заруинил", "виноват", "слабый игрок",
      "смерт", "умира", "фарм", "харасил", "ганкал",
      "этот матч", "этой игре", "в этой игре", "моя игра",
      "мой герой", "моя позиция",
      "собрать", "собрал", "билд", "предметы в",
      "почему я", "как я", "что я",
      "разбери", "разбор", "анализ",
      "совет по игре", "что делать в игре"
    ];
    for (var i = 0; i < matchWords.length; i++) {
      if (q.indexOf(matchWords[i]) >= 0) return true;
    }
    return false;
  },

  slangDict: {
    "Aghanim's Scepter": "Аганим", "Aghanim's Shard": "Шард",
    "Black King Bar": "БКБ", "Monkey King Bar": "МКБ",
    "Battle Fury": "БФ", "Manta Style": "Манта",
    "Radiance": "Радик", "Scythe of Vyse": "Хекс",
    "Blink Dagger": "Блинк", "Heart of Tarrasque": "Тараска",
    "Linken's Sphere": "Линка", "Eye of Skadi": "Скади",
    "Force Staff": "Форс", "Ghost Scepter": "Гост",
    "Glimmer Cape": "Глиммер", "Desolator": "Дезоль",
    "Diffusal Blade": "Дифуза", "Satanic": "Сатаник",
    "Shiva's Guard": "Шива", "Butterfly": "Бабочка",
    "Silver Edge": "Сильвер", "Shadow Blade": "ШБ",
    "Power Treads": "Треды", "Phase Boots": "Фейзы",
    "Arcane Boots": "Арканы", "Town Portal Scroll": "ТП",
    "Smoke of Deceit": "Смок", "Dust of Appearance": "Даст",
    "Sentry Ward": "Сентри", "Observer Ward": "Вард",
    "Gem of True Sight": "Гем", "Divine Rapier": "Рапира",
    "Blade Mail": "БМ", "Mask of Madness": "МоМ",
    "Urn of Shadows": "Урна", "Pipe of Insight": "Пайп",
    "Guardian Greaves": "Грейвы", "Hand of Midas": "Мидас",
    "Refresher Orb": "Рефрешер", "Octarine Core": "Октарин",
    "Abyssal Blade": "Абиссал", "Crimson Guard": "Кримсон",
    "Solar Crest": "Солярка", "Aeon Disk": "Аеон",
    "Meat Hook": "хук", "Omnislash": "омни",
    "Black Hole": "чёрная дыра", "Ravage": "раваж",
    "Finger of Death": "палец", "Culling Blade": "казнь",
    "Berserker's Call": "колл", "Chronosphere": "хроно",
    "Laguna Blade": "лагуна", "Mana Void": "мана войд",
    "Requiem": "реквием", "Ball Lightning": "болт",
    "Charge of Darkness": "чардж", "Sonic Wave": "волна",
    "Primal Roar": "роар", "Toss": "тосс",
    "Avalanche": "аваланч", "Spell Steal": "спелл стил",
    "Telekinesis": "телекинез"
  },

  applySlang: function (text) {
    var out = String(text);
    out = out.replace(/(^|\s)\*([^\*\n]{1,60})\*(?=\s|$|[.,!?:;])/g, "$1**$2**");
    var keys = Object.keys(this.slangDict).sort(function (a, b) { return b.length - a.length; });
    for (var k = 0; k < keys.length; k++) {
      var en = keys[k];
      var ru = this.slangDict[en];
      var escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re = new RegExp("\\b" + escaped + "\\b", "g");
      out = out.replace(re, ru);
    }
    return out;
  },

  systemPrompt: function (matchContext, useMatchContext) {
    var base = [
      "Ты — DotaJetch AI, ИИ-АССИСТЕНТ. Ты НЕ играешь в Dota 2. Ты НЕ герой.",
      "Твоя задача — помогать игроку советами. Ты — тренер, а не игрок.",
      "",
      "🚨 САМОЕ ВАЖНОЕ:",
      "   • НИКОГДА не говори 'я играл', 'мой KDA', 'я Spectre' и подобное.",
      "   • Ты — ассистент. Игрок — твой собеседник. Он играл, а не ты.",
      "   • Все данные в контексте матча — это данные ИГРОКА, не твои.",
      "   • Правильно: 'Твой KDA 13/9/16', 'Ты играл на Spectre', НЕ 'Я Спектра'.",
      "",
      "🚫 ЗАПРЕЩЕНО отвечать на:",
      "   • Просьбы написать читы, хаки, скрипты, макросы для Dota 2",
      "   • Обход античита, инжекторы, aimbot, wallhack, maphack",
      "   Если спросят — ответь: 'Не помогаю с читами и нечестной игрой. Спроси что-нибудь по Dota 2.'",
      "",
      "🚨 НЕ ВЫДУМЫВАЙ:",
      "   • Предметы, которых нет в Dota 2 ('Клинок', 'Молот' — запрещены).",
      "   • Тайминги покупок, если их нет в контексте.",
      "   • Способности, которых нет у героя.",
      "",
      "🎯 КОНТЕКСТ МАТЧА:",
      "   • Если вопрос про героя/предмет/механику В ОБЩЕМ — отвечай БЕЗ контекста.",
      "   • Если вопрос про конкретный матч игрока — используй данные из блока ДАННЫЕ.",
      "",
      "═══ ФОРМАТ ═══",
      "• Markdown. **Жирный** через ДВОЙНЫЕ звёздочки.",
      "• Списки через `• `. Эмодзи для разделов. Пустая строка между блоками.",
      "• Не пиши вступления типа 'Конечно!' / 'Отличный вопрос!' Сразу к делу.",
      "",
      "═══ ДЛИНА ═══",
      "• Короткий вопрос (до 10 слов) → 2-4 предложения.",
      "• Вопрос про матч → до 250 слов.",
      "• Общий вопрос → 100-150 слов.",
      "",
      "═══ СЛЕНГ ═══",
      "Пиши как дотер: керри, мид, сап, оффлейн, фармить, крипы, ганкать, руинить, лузать, изи, имба, ГГ.",
      "Сокращения: БКБ, МКБ, БФ, Радик, Манта, Дезоль, Дифуза, Хекс, Еул,",
      "Гост, Линка, Тараска, Шива, Аганим, Абиссал, Форс, Глиммер, Блинк."
    ].join("\n");

    if (useMatchContext && matchContext) {
      base += "\n\n══════ ДАННЫЕ ИГРОКА ══════\n" + matchContext +
        "\n══════════════════════════\n\n" +
        "⚠️ Все данные выше — про ИГРОКА, не про тебя. Ты ассистент.\n" +
        "Используй эти данные ТОЛЬКО для вопросов про этот матч.";
    } else if (matchContext) {
      base += "\n\n⚠️ Вопрос НЕ про конкретный матч — отвечай в общем, БЕЗ упоминания игры игрока.";
    }

    return base;
  },

  getContextSource: function () {
    if (typeof window !== "undefined" && window.chatMatchContext && window.chatMatchContext.match) {
      return window.chatMatchContext;
    }
    if (typeof lastAnalysis !== "undefined" && lastAnalysis && lastAnalysis.match) {
      return lastAnalysis;
    }
    return null;
  },

  detectPosition: function (p, durMin) {
    if (!p) return null;
    var lane = p.lane_role;
    var isRoaming = p.is_roaming === true;
    var lhPerMin = (p.last_hits || 0) / Math.max(durMin, 1);
    if (isRoaming) return "Pos 4 (роум)";
    if (lane === 1) return lhPerMin >= 4 ? "Pos 1 (керри)" : "Pos 5 (сапорт)";
    if (lane === 2) return "Pos 2 (мид)";
    if (lane === 3) return lhPerMin >= 3 ? "Pos 3 (оффлейн)" : "Pos 4 (роум)";
    if (lane === 4) return "Pos 4 (роум)";
    var gpm = p.gold_per_min || 0;
    if (gpm >= 550 && lhPerMin >= 6) return "Pos 1 (керри)";
    if (gpm >= 480 && lhPerMin >= 4) return "Pos 2 (мид)";
    if (gpm >= 380 && lhPerMin >= 2.5) return "Pos 3 (оффлейн)";
    if (gpm >= 280) return "Pos 4 (роум)";
    return "Pos 5 (сапорт)";
  },

  buildMatchContext: function () {
    var res = this.getContextSource();
    if (!res) return null;
    var p = res.player, m = res.match;
    var heroName = res.hero ? res.hero.name : "?";
    var durMin = (m.duration || 0) / 60;
    var position = res.position ? ("Pos " + res.position) : this.detectPosition(p, durMin);
    var modeName = this.MODE_NAMES[m.game_mode] || ("Режим #" + m.game_mode);

    var ctx = [];
    ctx.push("🎮 ИГРОК ИГРАЛ НА ГЕРОЕ: " + heroName.toUpperCase());
    ctx.push("РЕЖИМ ИГРЫ: " + modeName);
    if (position) ctx.push("ПОЗИЦИЯ ИГРОКА: " + position);
    ctx.push("РЕЗУЛЬТАТ: " + (res.won ? "ПОБЕДА 🏆" : "ПОРАЖЕНИЕ 💀"));
    ctx.push("МАТЧ #" + (m.match_id || "?") + ", длительность " + durMin.toFixed(0) + " мин");
    ctx.push("");
    ctx.push("KDA игрока: " + p.kills + "/" + p.deaths + "/" + p.assists +
      " (" + ((p.kills + p.assists) / Math.max(p.deaths, 1)).toFixed(2) + ")");
    ctx.push("GPM: " + Math.round(p.gold_per_min || 0) + " | XPM: " + Math.round(p.xp_per_min || 0));
    ctx.push("Ластхиты: " + (p.last_hits || 0) + " | Денаи: " + (p.denies || 0));
    ctx.push("Урон: " + Math.round(p.hero_damage || 0) + " по героям, " + Math.round(p.tower_damage || 0) + " по строениям");
    ctx.push("Хил: " + Math.round(p.hero_healing || 0) + " | Нетворс: " + Math.round(p.total_gold || p.gold || 0));
    if (res.performance) ctx.push("Оценка: " + res.performance.grade + " (" + res.performance.score + "/100)");

    if (res.heroes && m.players) {
      var isRadiant = p.player_slot < 128;
      var allies = [], enemies = [];
      for (var i = 0; i < m.players.length; i++) {
        var mp = m.players[i];
        if (mp.player_slot === p.player_slot) continue;
        var hn = "?";
        for (var j = 0; j < res.heroes.length; j++) {
          if (res.heroes[j].id === mp.hero_id) { hn = res.heroes[j].name; break; }
        }
        var isAlly = (mp.player_slot < 128) === isRadiant;
        var item = hn + " (" + (mp.kills||0) + "/" + (mp.deaths||0) + "/" + (mp.assists||0) + ")";
        if (isAlly) allies.push(item);
        else enemies.push(item);
      }
      if (allies.length) ctx.push("Союзники игрока: " + allies.join(", "));
      if (enemies.length) ctx.push("Враги игрока: " + enemies.join(", "));
    }
    return ctx.join("\n");
  },

  fetchWithTimeout: function (url, options, timeoutMs) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, timeoutMs);
    options.signal = controller.signal;
    return fetch(url, options).finally(function () { clearTimeout(timeoutId); });
  },

  sleep: function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); },

  mistralRequest: function (model, userQuery, matchContext, useMatchContext) {
    var self = this;
    var body = {
      model: model,
      messages: [
        { role: "system", content: self.systemPrompt(matchContext, useMatchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.4,
      max_tokens: 800
    };
    var headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + self.mistralKey,
      "Accept": "application/json"
    };

    return self.fetchWithTimeout(self.mistralUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    }, self.TIMEOUT_MS)
    .then(function (res) {
      if (res.status === 429) throw { code: 429, message: "Rate limit" };
      if (res.status === 401) throw { code: 401, message: "Неверный API-ключ" };
      if (!res.ok) {
        return res.text().then(function () {
          throw { code: res.status, message: "HTTP " + res.status };
        });
      }
      return res.text();
    })
    .then(function (text) {
      var json = JSON.parse(text);
      if (json.choices && json.choices[0] && json.choices[0].message) {
        return self.applySlang(json.choices[0].message.content);
      }
      throw { code: -1, message: "Пустой ответ" };
    });
  },

  askMistral: async function (userQuery, matchContext, useMatchContext) {
    var self = this;
    var now = Date.now();
    if (now < self.rateLimitedUntil) {
      var waitMs = self.rateLimitedUntil - now;
      if (waitMs > 20000) throw new Error("Mistral cooldown");
      await self.sleep(Math.min(waitMs, 20000));
    }
    var lastError = null;
    for (var i = 0; i < self.mistralModels.length; i++) {
      var model = self.mistralModels[i];
      try {
        console.log("Mistral [" + model + "] context=" + (useMatchContext ? "yes" : "no"));
        var text = await self.mistralRequest(model, userQuery, matchContext, useMatchContext);
        self.rateLimitedUntil = 0;
        return text;
      } catch (err) {
        lastError = err;
        if (err.code === 429) { console.warn("429 " + model); continue; }
        if (err.code === 401) throw new Error("Неверный API-ключ");
        console.warn(model + " failed: " + err.message);
      }
    }
    self.rateLimitedUntil = Date.now() + 60000;
    throw new Error("Mistral исчерпан");
  },

  askPollinations: function (userQuery, matchContext, useMatchContext) {
    var self = this;
    var body = {
      model: "openai",
      messages: [
        { role: "system", content: self.systemPrompt(matchContext, useMatchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.4,
      max_tokens: 800
    };
    return self.fetchWithTimeout("https://text.pollinations.ai/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    }, self.TIMEOUT_MS)
    .then(function (res) {
      if (!res.ok) throw new Error("Pollinations HTTP " + res.status);
      return res.text();
    })
    .then(function (text) {
      try {
        var json = JSON.parse(text);
        if (json.choices && json.choices[0] && json.choices[0].message) {
          return self.applySlang(json.choices[0].message.content);
        }
      } catch (e) {}
      if (text && text.length > 10) return self.applySlang(text);
      throw new Error("Pollinations пусто");
    });
  },

  ask: async function (query, matchContext) {
    if (!this.enabled) throw new Error("external-ai-disabled");
    if (this.busy) throw new Error("busy");

    var blocked = this.isBlacklisted(query);
    if (blocked) {
      console.warn("Заблокировано: " + blocked);
      return "🚫 Не помогаю с читами, хаками и скриптами для Dota 2. Это нечестная игра — за такое банят аккаунт.\n\nСпроси что-нибудь по игре: герои, предметы, механики, разбор матча.";
    }

    var useMatchContext = this.isMatchQuestion(query);
    console.log("Контекст матча: " + (useMatchContext ? "ДА" : "НЕТ"));

    this.busy = true;
    this.lastError = null;
    try {
      return await this.askMistral(query, matchContext, useMatchContext);
    } catch (err) {
      console.warn("Mistral упал:", err.message, "→ Pollinations");
      try {
        return await this.askPollinations(query, matchContext, useMatchContext);
      } catch (err2) {
        this.lastError = err2;
        throw new Error("Сервис перегружен. Попробуй через минуту.");
      }
    } finally {
      this.busy = false;
    }
  },

  shouldUseExternal: function () { return true; },

  init: function () {
    console.log("external-ai v17.0 FINAL · AI не герой + режим игры + без выдумок");
  }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}
