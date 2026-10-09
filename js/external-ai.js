/* DOTA JETCH — EXTERNAL AI v25.0 FINAL
   + УБРАН slangDict — ИИ сам знает сленг, промпт ему всё объясняет
   + applySlang = только дедуп "Форс (Форс)" → "Форс"
   + Авто-поиск в интернете если ИИ тупанул
   + max_tokens 2500, этапы, защита от крашей */

var ExternalAI = {
  enabled: true,
  busy: false,
  lastError: null,
  TIMEOUT_MS: 30000,

  mistralKey: "mstrl_fmvy3EYwtaIGtaLRiqrwMK2RRFOZtVcb_1McbHV",
  mistralUrl: "https://api.mistral.ai/v1/chat/completions",
  mistralModels: ["mistral-small-latest", "open-mistral-nemo"],

  rateLimitedUntil: 0,  currentModelIdx: 0,

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
    "Drow Ranger": "Frost Arrows (фрост арроуз), Gust (густ), Multishot (мультишот), Marksmanship (маркманшип)."
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
      "Juggernaut": ["жугер", "джага", "джагернаут"],
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

  /* ═══ РЕЧЕВЫЕ ПРАВИЛА (только русские опечатки, не сленг) ═══ */
  speechFixes: [
    [/\bденан(?:ы|ов|а|у|ом|е)?\b/gi, "денаи"],
    [/\bденануть\b/gi, "заденаить"],
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

  /* ═══ МИНИМАЛЬНАЯ чистка: только дедуп "Форс (Форс)" → "Форс" ═══
     Никаких словарей. ИИ сам знает сленг. Мы только убираем дубли. */
  applySlang: function (text) {
    var out = String(text);

    /* Жирный: одиночные * → ** */
    out = out.replace(/(^|[\s.,!?:;])\*([^\*\n]{1,60})\*(?=[\s.,!?:;]|$)/g, "$1**$2**");

    /* Дедуп "X (X)" → "X" — латиница или кириллица, слово/фраза до 50 символов */
    out = out.replace(/([A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё0-9'’\-\s]{0,50}?)\s*\(\s*\1\s*\)/g, "$1");

    /* Дедуп "English (Русский)" где English уже переведён → убираем скобку с переводом
       Пример: "Force Staff (Форс)" → "Force Staff". НО мы НЕ переводим,
       оставляем как написал ИИ. Смысл: не дублировать перевод.
       Однако если ИИ написал "Force Staff (Форс)" — оставляем как есть,
       потому что это ОК: английское название + сленг в скобках. */
    /* (не трогаем, чтобы не ломать нормальный формат) */

    out = this.applySpeechFixes(out);
    return out;
  },

  systemPrompt: function (matchContext, heroAbilitiesInfo, searchData) {
    var base = [
      "Ты — DotaJetch AI, ИИ-АССИСТЕНТ. Ты НЕ играешь в Dota 2. Ты НЕ герой.",
      "Твоя задача — помогать игроку советами. Ты тренер, не игрок.",
      "",
      "🚨 НЕ ВЫДУМЫВАЙ:",
      "• Не выдумывай способности ('удар по голове', 'удар ногами' — запрещено).",
      "• Не выдумывай предметы (Клинок, Молот — не существуют).",
      "• Не выдумывай тайминги если их нет в контексте.",
      "• Если не знаешь — честно скажи 'Не знаю точно'.",
      "",
      "🚨 Dota 2 — MOBA с видом сверху. Способности — клики, AoE, снаряды.",
      "",
      "🚫 ЧИТЫ: НЕ помогай с читами, хаками, скриптами.",
      "",
      "═══ СЛЕНГ И НАЗВАНИЯ ═══",
      "• Пиши как дотер — используй сленг: БКБ, МКБ, БФ, Радик, Манта, Дезоль, Дифуза, Хекс, Еул, Гост, Линка, Тараска, Атос, Сосуд, Блудорн, Аганим, Шард, Треды, Фейзы, Арканы.",
      "• Если НЕ уверен в сленге — пиши английское название как есть (Blade Mail, Force Staff), БЕЗ перевода в скобках.",
      "• НЕ дублируй название и перевод: не пиши 'Black King Bar (БКБ)'. Пиши 'БКБ' ИЛИ 'Black King Bar'.",
      "• Правильные термины: денаи (не 'денан'), ластхиты (не 'ластхитс'), крипы (не 'крипс'), варды (не 'вардс').",
      "",
      "═══ ФОРМАТ ОТВЕТА ═══",
      "• **Жирный** через ДВОЙНЫЕ звёздочки.",
      "• Списки через `• `. Эмодзи для разделов. Пустая строка между блоками.",
      "• Заголовки через `###`.",
      "• НЕ пиши вступления 'Конечно!' / 'Отличный вопрос!' — сразу к делу.",
      "",
      "═══ ДЛИНА ═══",
      "• Короткий вопрос (до 10 слов) → 2-4 предложения.",
      "• Вопрос про матч → до 350 слов.",
      "• Общий вопрос → 150-250 слов.",
      "• Подробно (сборка, гайд) — до 500 слов, БЕЗ обрывов.",
      "",
      "═══ СТИЛЬ ═══",
      "• Пиши как дотер: керри, мид, сап, фармить, ганкать, руинить.",
      "• Правильно: 'Твой KDA', 'Ты играл на Spectre', НЕ 'Я Спектра'."
    ].join("\n");

    if (heroAbilitiesInfo) {
      base += "\n\n══════ РЕАЛЬНЫЕ СПОСОБНОСТИ " + heroAbilitiesInfo.hero.toUpperCase() + " ══════\n" +
        heroAbilitiesInfo.abilities +
        "\n⚠️ Используй ТОЛЬКО эти способности.";
    }

    if (searchData && typeof WebSearch !== "undefined" && WebSearch && typeof WebSearch.formatForPrompt === "function") {
      var formatted = WebSearch.formatForPrompt(searchData);
      if (formatted) {
        base += "\n\n══════ РЕЗУЛЬТАТЫ ПОИСКА ══════\n" +
          formatted +
          "\n⚠️ Используй ТОЛЬКО эту информацию. Не добавляй от себя.";
      }
    }

    if (matchContext) {
      base += "\n\n══════ ДАННЫЕ ИГРОКА ══════\n" + matchContext +
        "\n⚠️ Все данные — про ИГРОКА. Ты ассистент.";
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
    if (!res || !res.player || !res.match) return null;
    var p = res.player, m = res.match;
    var heroName = res.hero ? res.hero.name : "?";
    var durMin = (m.duration || 0) / 60;
    var position = res.position ? ("Pos " + res.position) : this.detectPosition(p, durMin);
    var modeName = this.MODE_NAMES[m.game_mode] || ("Режим #" + m.game_mode);
    var ctx = [];
    ctx.push("🎮 ИГРОК ИГРАЛ НА ГЕРОЕ: " + heroName.toUpperCase());
    ctx.push("РЕЖИМ: " + modeName);
    if (position) ctx.push("ПОЗИЦИЯ: " + position);
    ctx.push("РЕЗУЛЬТАТ: " + (res.won ? "ПОБЕДА 🏆" : "ПОРАЖЕНИЕ 💀"));
    ctx.push("МАТЧ #" + (m.match_id || "?") + ", " + durMin.toFixed(0) + " мин");
    ctx.push("KDA игрока: " + p.kills + "/" + p.deaths + "/" + p.assists);
    ctx.push("GPM: " + Math.round(p.gold_per_min || 0) + " | XPM: " + Math.round(p.xp_per_min || 0));
    ctx.push("Ластхиты: " + (p.last_hits || 0) + " | Денаи: " + (p.denies || 0));
    ctx.push("Урон: " + Math.round(p.hero_damage || 0) + " | Нетворс: " + Math.round(p.total_gold || 0));
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
        var item = hn + " (" + (mp.kills||0) + "/" + (mp.deaths||0) + "/" + (mp.assists||0) + ")";
        if ((mp.player_slot < 128) === isRad) allies.push(item);
        else enemies.push(item);
      }
      if (allies.length) ctx.push("Союзники: " + allies.join(", "));
      if (enemies.length) ctx.push("Враги: " + enemies.join(", "));
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

  mistralRequest: function (model, userQuery, matchContext, heroAbilitiesInfo, searchData) {
    var self = this;
    var body = {
      model: model,
      messages: [
        { role: "system", content: self.systemPrompt(matchContext, heroAbilitiesInfo, searchData) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.3,
      max_tokens: 2500
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
      if (!res.ok) return res.text().then(function () { throw { code: res.status, message: "HTTP " + res.status }; });
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

  askMistral: async function (userQuery, matchContext, heroAbilitiesInfo, searchData) {
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
        console.log("Mistral [" + model + "]" + (searchData ? " +search" : ""));
        var text = await self.mistralRequest(model, userQuery, matchContext, heroAbilitiesInfo, searchData);
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

  isWeakAnswer: function (text) {
    if (!text) return true;
    var t = String(text).toLowerCase();
    var words = t.split(/\s+/).filter(function (w) { return w.length > 0; }).length;
    if (t.indexOf("не знаю") >= 0) return true;
    if (t.indexOf("не уверен") >= 0) return true;
    if (t.indexOf("не могу точно") >= 0) return true;
    if (t.indexOf("попробуй переформулировать") >= 0) return true;
    if (t.indexOf("уточни") >= 0 && words < 30) return true;
    if (t.indexOf("извини") >= 0 && words < 25) return true;
    if (words < 15) return true;
    return false;
  },

  /* ═══ Автоматический поиск (ИИ сам смотрит в интернет когда тупит) ═══ */
  ask: async function (query, matchContext, onStage) {
    if (!this.enabled) throw new Error("external-ai-disabled");
    if (this.busy) throw new Error("busy");

    var blocked = this.isBlacklisted(query);
    if (blocked) {
      return "🚫 Не помогаю с читами, хаками и скриптами для Dota 2. За такое банят аккаунт.\n\nСпроси что-нибудь по игре.";
    }

    var heroAbilitiesInfo = this.findHeroAbilities(query);

    this.busy = true;
    this.lastError = null;

    try {
      if (onStage) onStage("first");
      var text1 = await this.askMistral(query, matchContext, heroAbilitiesInfo, null);

      /* Авто-поиск в интернете если ответ слабый */
      var canSearch = (typeof WebSearch !== "undefined") && WebSearch && (typeof WebSearch.search === "function");
      if (this.isWeakAnswer(text1) && canSearch) {
        if (onStage) onStage("search");
        console.log("[AutoSearch] Слабый ответ, ищу в интернете...");
        var searchData = null;
        try { searchData = await WebSearch.search(query); } catch (e) { console.warn("Search failed:", e.message); }

        if (searchData && searchData.results && searchData.results.length) {
          if (onStage) onStage("second");
          try {
            var text2 = await this.askMistral(query, matchContext, heroAbilitiesInfo, searchData);
            if (text2 && text2.length > text1.length) return text2;
          } catch (e2) { console.warn("Второй запрос упал:", e2.message); }
        }
      }

      return text1;
    } catch (err) {
      console.warn("Mistral упал:", err.message);
      throw new Error("Сервис перегружен. Попробуй через минуту.");
    } finally {
      this.busy = false;
    }
  },

  shouldUseExternal: function () { return true; },
  init: function () { console.log("external-ai v25.0 · БЕЗ словаря сленга — всё через промпт + интернет"); }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 
