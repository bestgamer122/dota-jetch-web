/* DOTA JETCH — EXTERNAL AI v20.0 FINAL
   Глубокое мышление + реальные способности + режим игры + чёрный список */

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

  isMatchQuestion: function (query) {
    var q = String(query || "").toLowerCase();
    var words = ["матч", "проигра", "победил", "выиграл", "луз",
      "кда", "kda", "гпм", "gpm", "хпм", "xpm",
      "ластхит", "денай", "нетфорс", "нетворс",
      "руинер", "заруинил", "виноват", "слабый игрок",
      "смерт", "умира", "фарм", "харасил", "ганкал",
      "этот матч", "этой игре", "в этой игре", "моя игра",
      "мой герой", "моя позиция",
      "собрать", "собрал", "билд", "предметы в",
      "почему я", "как я", "что я",
      "разбери", "разбор", "анализ",
      "совет по игре", "что делать в игре"];
    for (var i = 0; i < words.length; i++) if (q.indexOf(words[i]) >= 0) return true;
    return false;
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
    "Solar Crest": "Солярка", "Aeon Disk": "Аеон"
  },

  applySlang: function (text) {
    var out = String(text);
    /* Одиночные * → ** только если рядом нет звёздочек */
    out = out.replace(/(^|[\s.,!?:;])\*([^\*\n]{1,60})\*(?=[\s.,!?:;]|$)/g, "$1**$2**");
    var keys = Object.keys(this.slangDict).sort(function (a, b) { return b.length - a.length; });
    for (var k = 0; k < keys.length; k++) {
      var en = keys[k]; var ru = this.slangDict[en];
      var escaped = en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      var re = new RegExp("\\b" + escaped + "\\b", "g");
      out = out.replace(re, ru);
    }
    return out;
  },

  systemPrompt: function (matchContext, useMatchContext, heroAbilitiesInfo, searchData, deepThinkMode) {
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
      "═══ ФОРМАТ ОТВЕТА ═══",
      "• Используй **жирный** для ключевых слов (ДВОЙНЫЕ звёздочки, не одинарные).",
      "• Списки через `• `. Эмодзи для разделов. Пустая строка между блоками.",
      "• Заголовки через `###` для разделов.",
      "• НЕ пиши вступления 'Конечно!' / 'Отличный вопрос!' — сразу к делу.",
      "",
      "═══ ДЛИНА ═══",
      "• Короткий вопрос (до 10 слов) → 2-4 предложения.",
      "• Вопрос про матч → до 250 слов.",
      "• Общий вопрос → 100-150 слов.",
      "",
      "═══ СТИЛЬ ═══",
      "• Пиши как дотер: керри, мид, сап, фармить, ганкать, руинить.",
      "• Сокращения: БКБ, МКБ, БФ, Радик, Манта, Дезоль, Дифуза, Хекс, Еул, Гост, Линка, Тараска.",
      "• Правильно: 'Твой KDA', 'Ты играл на Spectre', НЕ 'Я Спектра'."
    ].join("\n");

    if (heroAbilitiesInfo) {
      base += "\n\n══════ РЕАЛЬНЫЕ СПОСОБНОСТИ " + heroAbilitiesInfo.hero.toUpperCase() + " ══════\n" +
        heroAbilitiesInfo.abilities +
        "\n⚠️ Используй ТОЛЬКО эти способности.";
    }

    if (searchData && typeof WebSearch !== "undefined") {
      base += "\n\n══════ РЕЗУЛЬТАТЫ ПОИСКА ══════\n" +
        WebSearch.formatForPrompt(searchData) +
        "\n⚠️ Используй ТОЛЬКО эту информацию.";
    }

    if (deepThinkMode && !searchData && !heroAbilitiesInfo) {
      base += "\n\n⚠️ РЕЖИМ ГЛУБОКОГО МЫШЛЕНИЯ, но поиск не дал результатов. Если не знаешь — скажи 'Не знаю точно'.";
    }

    if (useMatchContext && matchContext) {
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
    if (!res) return null;
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

  mistralRequest: function (model, userQuery, matchContext, useMatchContext, heroAbilitiesInfo, searchData, deepThinkMode) {
    var self = this;
    var body = {
      model: model,
      messages: [
        { role: "system", content: self.systemPrompt(matchContext, useMatchContext, heroAbilitiesInfo, searchData, deepThinkMode) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.3,
      max_tokens: 900
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

  askMistral: async function (userQuery, matchContext, useMatchContext, heroAbilitiesInfo, searchData, deepThinkMode) {
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
        var text = await self.mistralRequest(model, userQuery, matchContext, useMatchContext, heroAbilitiesInfo, searchData, deepThinkMode);
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

  ask: async function (query, matchContext, deepThinkMode) {
    if (!this.enabled) throw new Error("external-ai-disabled");
    if (this.busy) throw new Error("busy");

    var blocked = this.isBlacklisted(query);
    if (blocked) {
      return "🚫 Не помогаю с читами, хаками и скриптами для Dota 2. За такое банят аккаунт.\n\nСпроси что-нибудь по игре.";
    }

    var useMatchContext = this.isMatchQuestion(query);
    var heroAbilitiesInfo = this.findHeroAbilities(query);
    var searchData = null;

    if (deepThinkMode && typeof WebSearch !== "undefined") {
      if (!heroAbilitiesInfo && !useMatchContext) {
        console.log("[DeepThink] Ищу: " + query);
        try { searchData = await WebSearch.search(query); } catch (e) { console.warn("Search failed:", e.message); }
      }
    }

    this.busy = true;
    this.lastError = null;
    try {
      return await this.askMistral(query, matchContext, useMatchContext, heroAbilitiesInfo, searchData, deepThinkMode);
    } catch (err) {
      console.warn("Mistral упал:", err.message);
      if (searchData) {
        var fallback = "📚 Нашёл в интернете:\n\n";
        for (var i = 0; i < searchData.results.length; i++) {
          var r = searchData.results[i];
          fallback += "**" + r.title + "**\n" + r.snippet + "\n\n";
        }
        return fallback;
      }
      throw new Error("Сервис перегружен. Попробуй через минуту.");
    } finally {
      this.busy = false;
    }
  },

  shouldUseExternal: function () { return true; },
  init: function () { console.log("external-ai v20.0 FINAL"); }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}
