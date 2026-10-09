/* DOTA JETCH — EXTERNAL AI v12.0
   FIX: полный словарь дотерского сленга, исправлен * → **, позиция в контексте,
   короткие ответы на короткие вопросы, улучшенная обработка 429. */

var ExternalAI = {
  enabled: true,
  busy: false,
  lastError: null,
  TIMEOUT_MS: 30000,

  mistralKey: "mstrl_fmvy3EYwtaIGtaLRiqrwMK2RRFOZtVcb_1McbHV",
  mistralUrl: "https://api.mistral.ai/v1/chat/completions",

  mistralModels: [
    "mistral-small-latest",
    "open-mistral-nemo"
  ],

  rateLimitedUntil: 0,
  currentModelIdx: 0,

  /* ═══ ПОЛНЫЙ СЛОВАРЬ ДОТЕРСКОГО СЛЕНГА ═══ */
  slangDict: {
    /* ─── Предметы ─── */
    "Aghanim's Scepter": "Аганим",
    "Aghanim's Shard": "Шард",
    "Ancient Tango of Essifation": "Танго",
    "Animal Courier": "Курица",
    "Assault Cuirass": "АС",
    "Aeon Disk": "Аеон",
    "Abyssal Blade": "Абиссал",
    "Battle Fury": "БФ",
    "Black King Bar": "БКБ",
    "Blade Mail": "БМ",
    "Blink Dagger": "Блинк",
    "Bloodthorn": "Бладорн",
    "Bracer": "Брасер",
    "Butterfly": "Бабочка",
    "Consecrated Wraps": "Бинты",
    "Crimson Guard": "Кримсон",
    "Dagon": "Дагон",
    "Desolator": "Дезоль",
    "Diffusal Blade": "Дифуза",
    "Divine Rapier": "Рапира",
    "Essence Distiller": "Кальян",
    "Eul's Scepter of Divinity": "Еул",
    "Eye of Skadi": "Скади",
    "Force Staff": "Форс",
    "Ghost Scepter": "Гост",
    "Glimmer Cape": "Глиммер",
    "Guardian Greaves": "Грейвы",
    "Hand of Midas": "Мидас",
    "Heart of Tarrasque": "Тараска",
    "Healing Salve": "Сальва",
    "Hurricane Pike": "Пика",
    "Linken's Sphere": "Линка",
    "Lothar's Edge": "Лотар",
    "Maelstrom": "Маель",
    "Manta Style": "Манта",
    "Mask of Madness": "МоМ",
    "Magic Wand": "Стик",
    "Mekansm": "Мека",
    "Monkey King Bar": "МКБ",
    "Necronomicon": "Некро",
    "Null Talisman": "Нуль",
    "Octarine Core": "Октарин",
    "Orchid Malevolence": "Орчид",
    "Observer Ward": "Вард",
    "Phase Boots": "Фейзы",
    "Pipe of Insight": "Пайп",
    "Power Treads": "Треды",
    "Radiance": "Радик",
    "Refresher Orb": "Рефрешер",
    "Sange and Yasha": "СиЯ",
    "Satanic": "Сатаник",
    "Scythe of Vyse": "Хекс",
    "Shadow Blade": "ШБ",
    "Shiva's Guard": "Шива",
    "Silver Edge": "Сильвер",
    "Spirit Vessel": "Вессел",
    "Tranquil Boots": "Транквилы",
    "Urn of Shadows": "Урна",
    "Vanguard": "Вангард",
    "Wraith Band": "Бэнд",
    "Solar Crest": "Солярка",
    "Sentry Ward": "Сентри",
    "Town Portal Scroll": "ТП",
    "Boots of Travel": "Тревела",
    "Smoke of Deceit": "Смок",
    "Gem of True Sight": "Гем",
    "Dust of Appearance": "Даст",
    "Helm of the Dominator": "Домик",

    /* ─── Скиллы ─── */
    "Shadowraze": "Разряд",
    "Necromastery": "Некромастери",
    "Presence of the Dark Lord": "Аура СФ",
    "Requiem": "Реквием",
    "Spectral Dagger": "Клинок",
    "Desolate": "Опустошение",
    "Dispersion": "Рассеивание",
    "Haunt": "Преследование",
    "Reality": "Реальность",
    "Omnislash": "Омни",
    "Blade Fury": "Вертушка",
    "Healing Ward": "Вард",
    "Meat Hook": "Хук",
    "Rot": "Гниль",
    "Dismember": "Расчленение",
    "Ravage": "Раваж",
    "Anchor Smash": "Краш",
    "Black Hole": "Чёрная дыра",
    "Midnight Pulse": "Пульс",
    "Malefice": "Малефис",
    "Reverse Polarity": "РП",
    "Skewer": "Скивер",
    "Empower": "Эмпауэр",
    "Chronosphere": "Хроно",
    "Time Walk": "Тайм вок",
    "Time Lock": "Тайм лок",
    "Laguna Blade": "Лагуна",
    "Dragon Slave": "Драгон слейв",
    "Light Strike Array": "Столб",
    "Finger of Death": "Палец",
    "Earth Spike": "Спайк",
    "Hex": "Хекс",
    "Mana Void": "Мана войд",
    "Mana Break": "Мана брейк",
    "Culling Blade": "Казнь",
    "Berserker's Call": "Колл",
    "Counter Helix": "Вертолёт",
    "Epicenter": "Эпицентр",
    "Burrowstrike": "Бурст",
    "Nether Strike": "Незер",
    "Charge of Darkness": "Чардж",
    "Greater Bash": "Баш",
    "Static Remnant": "Ремнант",
    "Ball Lightning": "Болт",
    "Overload": "Оверлоад",
    "Sleight of Fist": "Слейт",
    "Searing Chains": "Цепи",
    "Flame Guard": "Флейм гард",
    "Fire Remnant": "Ремнант",
    "Sun Strike": "Санстрайк",
    "Chaos Meteor": "Метеор",
    "Deafening Blast": "Бласт",
    "Tornado": "Торнадо",
    "EMP": "ЕМП",
    "Cold Snap": "Колд снап",
    "Forge Spirit": "Фордж",
    "Alacrity": "Алакрити",
    "Ice Wall": "Айс волл",
    "Ghost Walk": "Гост волк",
    "Assassinate": "Ассасинейт",
    "Shrapnel": "Шрапнель",
    "Headshot": "Хедшот",
    "Take Aim": "Тейк эйм",
    "Blur": "Блюр",
    "Stifling Dagger": "Даггер",
    "Phantom Strike": "Прыжок",
    "Coup de Grace": "Криты",
    "Blink Strike": "Блинк страйк",
    "Tricks of the Trade": "Трикс",
    "Smoke Screen": "Смокскрин",
    "Pounce": "Прыжок",
    "Dark Pact": "Пакт",
    "Essence Shift": "Эссенс шифт",
    "Shadow Dance": "Шадоу дэнс",
    "Frost Arrows": "Фрост арроу",
    "Gust": "Густ",
    "Multishot": "Мультишот",
    "Marksmanship": "Маркманшип",
    "Burning Spear": "Копьё",
    "Inner Vitality": "Виталити",
    "Berserker's Blood": "Блад",
    "Life Break": "Лайф брейк",
    "Rupture": "Разрыв",
    "Blood Rite": "Блад райт",
    "Thirst": "Жажда",
    "Reaper's Scythe": "Коса",
    "Death Pulse": "Пульс",
    "Sadist": "Садист",
    "Ghost Shroud": "Шрауд",
    "Soul Assumption": "Соул ассампшн",
    "Grave Chill": "Чилл",
    "Summon Familiars": "Фамильяры",
    "Penitence": "Пенитенс",
    "Holy Persuasion": "Персуэйжн",
    "Hand of God": "Хэнд оф гад",
    "Omnislash": "Омни",
    "Hook": "Хук",
    "Chakram": "Чакрам",
    "Timber Chain": "Чейн",
    "Whirling Death": "Вирл",
    "Reactive Armor": "Броня",
    "Sonic Wave": "Волна",
    "Blink": "Блинк",
    "Scream of Pain": "Скрим",
    "Shadow Strike": "Дарт",
    "Astral Step": "Астрал",
    "Resonant Pulse": "Пульс",
    "Aether Remnant": "Ремнант",
    "Dissimilate": "Диссимилейт",
    "Primal Roar": "Роар",
    "Call of the Wild": "Калл",
    "Wild Axes": "Топоры",
    "Toss": "Тосс",
    "Avalanche": "Аваланч",
    "Tree Grab": "Дерево",
    "Walrus Punch": "Панч",
    "Snowball": "Сноуболл",
    "Ice Shards": "Шарды",
    "Tag Team": "Тэг тим",
    "Spell Steal": "Спелл стил",
    "Telekinesis": "Телекинез",
    "Fade Bolt": "Фейд болт",
    "Nether Ward": "Вард",
    "Life Drain": "Дрейн",
    "Decrepify": "Декреп",
    "Soul Rip": "Соул рип",
    "Decay": "Декей",
    "Tombstone": "Томбстоун",
    "Flesh Golem": "Голем"
  },

  /* ─── Автозамена сленга в ответе ─── */
  applySlang: function (text) {
    var out = String(text);
    /* Сначала убираем одинарные звёздочки-выделения (Mistral иногда использует * вместо **) */
    out = out.replace(/(^|\s)\*([^\*\n]{1,60})\*(?=\s|$|[.,!?:;])/g, "$1**$2**");
    /* Затем заменяем названия на сленг */
    for (var en in this.slangDict) {
      if (!this.slangDict.hasOwnProperty(en)) continue;
      var ru = this.slangDict[en];
      var re = new RegExp("\\b" + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", "g");
      out = out.replace(re, ru);
    }
    return out;
  },

  /* ─── Промпт ─── */
  systemPrompt: function (matchContext) {
    var base = [
      "Ты DotaJetch AI — дотерский тренер. Общаешься как опытный игрок 7000+ MMR с другом.",
      "",
      "🚨 ПРАВИЛА:",
      "",
      "1. **Все названия предметов и способностей — ТОЛЬКО по-русски, коротко, как говорят дотеры.**",
      "   Примеры предметов: Aghanim's Scepter → Аганим, Eul's Scepter → Еул, Black King Bar → БКБ,",
      "   Blink Dagger → Блинк, Ghost Scepter → Гост, Manta Style → Манта, Radiance → Радик,",
      "   Scythe of Vyse → Хекс, Orchid Malevolence → Орчид, Heart of Tarrasque → Тараска,",
      "   Linken's Sphere → Линка, Assault Cuirass → АС, Monkey King Bar → МКБ.",
      "   Примеры скиллов: Shadowraze → Разряд, Spectral Dagger → Клинок, Dispersion → Рассеивание,",
      "   Requiem → Реквием, Haunt → Преследование, Omnislash → Омни, Rot → Гниль, Hook → Хук.",
      "   Английские аббревиатуры (BKB, MKB, DPS, GPM) — можно оставить.",
      "",
      "2. **Формат**: markdown. **Жирный** через ДВОЙНЫЕ звёздочки, НЕ через одинарные.",
      "   Списки через `• `. Эмодзи для разделов. Пустая строка между блоками.",
      "",
      "3. **Длина ответа зависит от вопроса:**",
      "   • Короткий вопрос (до 10 слов) → 2-4 предложения, без разбора KDA.",
      "   • Вопрос про матч → 150-300 слов, разбор по делу.",
      "   • Общий вопрос про героя → 100-200 слов.",
      "   НЕ лей воду. НЕ разбирай KDA если не спрашивают.",
      "",
      "4. **Сленг дотеров**: керри, мид, сап, оффлейн, фармить, крипы, ганкать, руинить,",
      "   харасить, килить, лузать, изи, имба, ГГ, байбек, хайграунд, фейт.",
      "",
      "5. **Не пиши вступления типа 'Конечно!' или 'Отличный вопрос!'**. Сразу к делу.",
      "",
      "6. **Если вопрос про матч** — опирайся на данные ниже. Учитывай позицию игрока (Pos 1-5).",
      "   Если игрок был Pos 5 — не советуй ему фармить крипов и делать БКБ на 20-й минуте.",
      "",
      "7. **Запрещено**: длинные вступления, повторение одного и того же, разбор метрик,",
      "   о которых не спрашивали, объяснение базовых механик (все и так знают)."
    ].join("\n");

    if (matchContext) {
      base += "\n\n══════ ДАННЫЕ МАТЧА ══════\n" + matchContext +
        "\n══════════════════════════";
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

  /* ─── Определение позиции по эвристике ─── */
  detectPosition: function (p, durMin) {
    if (!p || !durMin) return null;
    var lh = (p.last_hits || 0) / durMin;
    var gpm = p.gold_per_min || 0;
    var laneRole = p.lane_role;

    /* Если есть lane_role — используем */
    if (laneRole === 1) {
      return lh >= 4 ? "Pos 1 (керри)" : "Pos 5 (сапорт)";
    }
    if (laneRole === 2) return "Pos 2 (мид)";
    if (laneRole === 3) {
      return lh >= 3 ? "Pos 3 (оффлейн)" : "Pos 4 (роум)";
    }
    if (laneRole === 4) return "Pos 4 (роум)";

    /* Без lane_role — эвристика по GPM/LH */
    if (gpm >= 500 && lh >= 5) return "Pos 1 (керри)";
    if (gpm >= 450 && lh >= 3.5) return "Pos 2 (мид)";
    if (gpm >= 380 && lh >= 2.5) return "Pos 3 (оффлейн)";
    if (gpm >= 280) return "Pos 4 (роум)";
    return "Pos 5 (сапорт)";
  },

  /* ─── Контекст ─── */
  buildMatchContext: function () {
    var res = this.getContextSource();
    if (!res) return null;
    var p = res.player, m = res.match;
    var heroName = res.hero ? res.hero.name : "?";
    var durMin = (m.duration || 0) / 60;
    var position = res.position ? ("Pos " + res.position) : this.detectPosition(p, durMin);

    var ctx = [];
    ctx.push("🎮 ГЕРОЙ ИГРОКА: " + heroName.toUpperCase());
    if (position) ctx.push("ПОЗИЦИЯ: " + position);
    ctx.push("Результат: " + (res.won ? "ПОБЕДА 🏆" : "ПОРАЖЕНИЕ 💀"));
    ctx.push("Матч: #" + (m.match_id || "?") + ", " + durMin.toFixed(0) + " мин");

    ctx.push("KDA: " + p.kills + "/" + p.deaths + "/" + p.assists +
      " (" + ((p.kills + p.assists) / Math.max(p.deaths, 1)).toFixed(2) + ")");
    ctx.push("GPM: " + Math.round(p.gold_per_min || 0) + " | XPM: " + Math.round(p.xp_per_min || 0));
    ctx.push("Ластхиты: " + (p.last_hits || 0) + " | Денаи: " + (p.denies || 0));
    ctx.push("Урон: " + Math.round(p.hero_damage || 0) + " по героям, " + Math.round(p.tower_damage || 0) + " по строениям");
    ctx.push("Хил: " + Math.round(p.hero_healing || 0) + " | Нетворс: " + Math.round(p.total_gold || p.gold || 0));

    if (res.performance) {
      ctx.push("Оценка: " + res.performance.grade + " (" + res.performance.score + "/100)");
    }

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
      if (allies.length) ctx.push("Союзники: " + allies.join(", "));
      if (enemies.length) ctx.push("Враги: " + enemies.join(", "));
    }

    if (res.items && m.players) {
      var meItems = [];
      for (var k = 0; k < 6; k++) {
        var itemId = p["item_" + k] || 0;
        if (itemId > 0 && res.items[itemId]) meItems.push(res.items[itemId].name);
      }
      if (meItems.length) ctx.push("Инвентарь: " + meItems.join(", "));
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

  mistralRequest: function (model, userQuery, matchContext) {
    var self = this;
    var body = {
      model: model,
      messages: [
        { role: "system", content: self.systemPrompt(matchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.6,
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
        return res.text().then(function (t) {
          throw { code: res.status, message: "HTTP " + res.status + ": " + t.slice(0, 200) };
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

  askMistral: async function (userQuery, matchContext) {
    var self = this;

    var now = Date.now();
    if (now < self.rateLimitedUntil) {
      var waitMs = self.rateLimitedUntil - now;
      console.log("Mistral cooldown " + Math.round(waitMs/1000) + " сек...");
      if (waitMs > 8000) throw new Error("Mistral в cooldown");
      await self.sleep(waitMs);
    }

    var startIdx = self.currentModelIdx;
    var lastError = null;

    for (var i = 0; i < self.mistralModels.length; i++) {
      var modelIdx = (startIdx + i) % self.mistralModels.length;
      var model = self.mistralModels[modelIdx];

      for (var attempt = 0; attempt < 3; attempt++) {
        try {
          console.log("Mistral [" + model + "] #" + (attempt+1));
          var text = await self.mistralRequest(model, userQuery, matchContext);
          self.currentModelIdx = modelIdx;
          self.rateLimitedUntil = 0;
          return text;
        } catch (err) {
          lastError = err;

          if (err.code === 429) {
            console.warn("429 " + model + " attempt " + (attempt+1));
            var backoff = 3000 * Math.pow(2, attempt); /* 3s → 6s → 12s */
            if (attempt < 2) {
              await self.sleep(backoff);
              continue;
            }
            self.rateLimitedUntil = Date.now() + 15000;
            break;
          }

          if (err.code === 401) throw new Error("Неверный API-ключ Mistral");

          console.warn(model + " failed:", err.message);
          break;
        }
      }
    }

    throw new Error("Mistral исчерпан: " + (lastError ? lastError.message : "?"));
  },

  askPollinations: function (userQuery, matchContext) {
    var self = this;
    var body = {
      model: "openai",
      messages: [
        { role: "system", content: self.systemPrompt(matchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.6,
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
    this.busy = true;
    this.lastError = null;

    try {
      return await this.askMistral(query, matchContext);
    } catch (err) {
      console.warn("Mistral упал:", err.message, "→ Pollinations");
      try {
        return await this.askPollinations(query, matchContext);
      } catch (err2) {
        this.lastError = err2;
        throw new Error("Не могу получить ответ. Попробуй через 30 секунд.");
      }
    } finally {
      this.busy = false;
    }
  },

  shouldUseExternal: function () { return true; },

  init: function () {
    console.log("external-ai v12.0 ready · полный сленг + позиция + короткие ответы");
  }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}
