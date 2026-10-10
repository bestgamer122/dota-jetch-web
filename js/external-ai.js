/* DOTA JETCH — EXTERNAL AI v31.0 (OpenRouter через Cloudflare Worker)
   + DeepSeek V3 → Llama 3.3 70B → Qwen 2.5 72B (фолбэки)
   + CORS-прокси через собственный Worker
   + Авто-поиск, этапы, способности, чёрный список */

/* ═══════════════════════════════════════════════════════════
   НАСТРОЙКА
   ═══════════════════════════════════════════════════════════ */
var OPENROUTER_KEY = "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";
var OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
var OPENROUTER_MODELS = [
  "deepseek/deepseek-chat-v3.1:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free"
];

/* Твой Cloudflare Worker (прокси для обхода CORS) */
var PROXY_URL = "https://gigachatwork.yiiwarsssss.workers.dev/?url=";
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
      "Ты — DotaJetch AI, ИИ-АССИСТЕНТ. Ты НЕ играешь в Dota 2. Ты НЕ герой.",
      "Твоя задача — помогать игроку советами. Ты тренер, не игрок.",
      "",
      "🚨 НЕ ВЫДУМЫВАЙ:",
      "• Не выдумывай способности ('удар по голове' — запрещено).",
      "• Не выдумывай предметы (Клинок, Молот — не существуют).",
      "• Если не знаешь — честно скажи 'Не знаю точно'.",
      "",
      "🚨 Dota 2 — MOBA с видом сверху. Способности — клики, AoE, снаряды.",
      "",
      "🚫 ЧИТЫ: НЕ помогай с читами, хаками, скриптами.",
      "",
      "═══ СЛЕНГ И НАЗВАНИЯ ═══",
      "• Пиши как дотер: БКБ, МКБ, БФ, Радик, Манта, Дезоль, Дифуза, Хекс, Еул, Гост, Линка, Тараска, Атос, Сосуд, Блудорн, Аганим, Шард, Треды, Фейзы, Арканы.",
      "• Если НЕ уверен в сленге — пиши английское название как есть (Blade Mail, Force Staff), БЕЗ перевода в скобках.",
      "• НЕ дублируй: не пиши 'Black King Bar (БКБ)'. Пиши 'БКБ' ИЛИ 'Black King Bar'.",
      "• Термины: денаи (не 'денан'), ластхиты (не 'ластхитс'), крипы, варды.",
      "",
      "═══ ФОРМАТ ═══",
      "• **Жирный** через ДВОЙНЫЕ звёздочки.",
      "• Списки через `• `. Эмодзи для разделов.",
      "• Заголовки через `###`.",
      "• НЕ пиши 'Конечно!' / 'Отличный вопрос!' — сразу к делу.",
      "",
      "═══ ДЛИНА ═══",
      "• Короткий вопрос → 2-4 предложения.",
      "• Про матч → до 350 слов.",
      "• Общий → 150-250 слов.",
      "• Подробно (сборка, гайд) — до 500 слов, БЕЗ обрывов.",
      "",
      "═══ СТИЛЬ ═══",
      "• Керри, мид, сап, фармить, ганкать, руинить.",
      "• 'Твой KDA', 'Ты играл на Spectre', НЕ 'Я Спектра'."
    ].join("\n");

    if (heroAbilitiesInfo) {
      base += "\n\n══════ СПОСОБНОСТИ " + heroAbilitiesInfo.hero.toUpperCase() + " ══════\n" +
        heroAbilitiesInfo.abilities +
        "\n⚠️ Используй ТОЛЬКО эти способности.";
    }

    if (searchData && typeof WebSearch !== "undefined" && WebSearch && typeof WebSearch.formatForPrompt === "function") {
      var formatted = WebSearch.formatForPrompt(searchData);
      if (formatted) {
        base += "\n\n══════ РЕЗУЛЬТАТЫ ПОИСКА ══════\n" + formatted + "\n⚠️ Используй ТОЛЬКО это.";
      }
    }

    if (matchContext) {
      base += "\n\n══════ ДАННЫЕ ИГРОКА ══════\n" + matchContext + "\n⚠️ Данные про ИГРОКА. Ты ассистент.";
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
    ctx.push("🎮 ГЕРОЙ: " + heroName.toUpperCase());
    ctx.push("РЕЖИМ: " + modeName);
    if (position) ctx.push("ПОЗИЦИЯ: " + position);
    ctx.push("РЕЗУЛЬТАТ: " + (res.won ? "ПОБЕДА 🏆" : "ПОРАЖЕНИЕ 💀"));
    ctx.push("МАТЧ #" + (m.match_id || "?") + ", " + durMin.toFixed(0) + " мин");
    ctx.push("KDA: " + p.kills + "/" + p.deaths + "/" + p.assists);
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

  _proxied: function (url) {
    return PROXY_URL + encodeURIComponent(url);
  },

  openrouter: async function (model, userQuery, matchContext, heroAbilitiesInfo, searchData) {
    var body = {
      model: model,
      messages: [
        { role: "system", content: this.systemPrompt(matchContext, heroAbilitiesInfo, searchData) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.3,
      max_tokens: 2500
    };
    var headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + OPENROUTER_KEY
    };
    var res = await this.fetchWithTimeout(this._proxied(OPENROUTER_URL), {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    }, this.TIMEOUT_MS);

    if (res.status === 429) throw { code: 429, message: "Rate limit" };
    if (res.status === 401) throw new Error("OpenRouter 401 — неверный ключ");
    if (res.status === 402) throw new Error("OpenRouter 402 — закончились бесплатные запросы");
    if (!res.ok) {
      var errBody = await res.text();
      throw new Error("OpenRouter HTTP " + res.status + ": " + errBody.slice(0, 150));
    }
    var text = await res.text();
    var json = JSON.parse(text);
    if (json.error) throw new Error("OpenRouter: " + (json.error.message || "неизвестная ошибка"));
    if (json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content) {
      return this.applySlang(json.choices[0].message.content);
    }
    throw new Error("Пустой ответ OpenRouter");
  },

  askOpenRouter: async function (userQuery, matchContext, heroAbilitiesInfo, searchData) {
    var now = Date.now();
    if (now < this.rateLimitedUntil) {
      var waitMs = this.rateLimitedUntil - now;
      if (waitMs > 20000) throw new Error("Подожди " + Math.ceil(waitMs / 1000) + " сек.");
      await this.sleep(Math.min(waitMs, 20000));
    }
    var lastErr = null;
    for (var i = 0; i < OPENROUTER_MODELS.length; i++) {
      var model = OPENROUTER_MODELS[i];
      try {
        console.log("OpenRouter [" + model + "]" + (searchData ? " +search" : ""));
        return await this.openrouter(model, userQuery, matchContext, heroAbilitiesInfo, searchData);
      } catch (err) {
        lastErr = err;
        if (err.code === 429) {
          console.warn("429 на " + model + ", пробую следующую");
          continue;
        }
        throw err;
      }
    }
    this.rateLimitedUntil = Date.now() + 30000;
    throw new Error("Все модели OpenRouter перегружены. Подожди 30 сек.");
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

  ask: async function (query, matchContext, onStage) {
    if (!this.enabled) throw new Error("external-ai-disabled");
    if (this.busy) throw new Error("busy");

    var blocked = this.isBlacklisted(query);
    if (blocked) {
      return "🚫 Не помогаю с читами, хаками и скриптами для Dota 2. За такое банят аккаунт.\n\nСпроси что-нибудь по игре.";
    }

    var heroAbilities = this.findHeroAbilities(query);

    this.busy = true;
    this.lastError = null;

    try {
      if (onStage) onStage("first");
      var text1 = await this.askOpenRouter(query, matchContext, heroAbilities, null);

      var canSearch = (typeof WebSearch !== "undefined") && WebSearch && (typeof WebSearch.search === "function");
      if (this.isWeakAnswer(text1) && canSearch) {
        if (onStage) onStage("search");
        console.log("[AutoSearch] Слабый ответ, ищу в интернете...");
        var searchData = null;
        try { searchData = await WebSearch.search(query); } catch (e) { console.warn("Search failed:", e.message); }

        if (searchData && searchData.results && searchData.results.length) {
          if (onStage) onStage("second");
          try {
            var text2 = await this.askOpenRouter(query, matchContext, heroAbilities, searchData);
            if (text2 && text2.length > text1.length) return text2;
          } catch (e2) { console.warn("Второй запрос упал:", e2.message); }
        }
      }

      return text1;
    } catch (err) {
      console.warn("OpenRouter упал:", err.message);
      throw new Error(err.message || "Сервис перегружен. Попробуй через минуту.");
    } finally {
      this.busy = false;
    }
  },

  shouldUseExternal: function () { return true; },
  init: function () { console.log("external-ai v31.0 · OpenRouter через прокси: " + PROXY_URL.split("?")[0]); }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}

