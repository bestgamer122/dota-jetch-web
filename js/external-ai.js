/* DOTA JETCH — EXTERNAL AI v14.0 FINAL
   ВСЕ ФИКСЫ: без выдумок, чистый сленг, точная позиция, запрет таймингов. */

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

  /* ═══ СЛЕНГ — ТОЛЬКО УНИВЕРСАЛЬНЫЕ СОКРАЩЕНИЯ ═══ */
  slangDict: {
    /* Предметы */
    "Aghanim's Scepter": "Аганим",
    "Aghanim's Shard": "Шард",
    "Abyssal Blade": "Абиссал",
    "Battle Fury": "БФ",
    "Black King Bar": "БКБ",
    "Blade Mail": "БМ",
    "Blink Dagger": "Блинк",
    "Butterfly": "Бабочка",
    "Crimson Guard": "Кримсон",
    "Dagon": "Дагон",
    "Desolator": "Дезоль",
    "Diffusal Blade": "Дифуза",
    "Divine Rapier": "Рапира",
    "Eul's Scepter of Divinity": "Еул",
    "Eye of Skadi": "Скади",
    "Force Staff": "Форс",
    "Ghost Scepter": "Гост",
    "Glimmer Cape": "Глиммер",
    "Hand of Midas": "Мидас",
    "Heart of Tarrasque": "Тараска",
    "Linken's Sphere": "Линка",
    "Maelstrom": "Маель",
    "Manta Style": "Манта",
    "Mask of Madness": "МоМ",
    "Magic Wand": "Стик",
    "Mekansm": "Мека",
    "Monkey King Bar": "МКБ",
    "Octarine Core": "Октарин",
    "Orchid Malevolence": "Орчид",
    "Power Treads": "Треды",
    "Radiance": "Радик",
    "Refresher Orb": "Рефрешер",
    "Satanic": "Сатаник",
    "Scythe of Vyse": "Хекс",
    "Shadow Blade": "ШБ",
    "Shiva's Guard": "Шива",
    "Silver Edge": "Сильвер",
    "Spirit Vessel": "Вессел",
    "Urn of Shadows": "Урна",
    "Vanguard": "Вангард",
    "Wraith Band": "Бэнд",
    "Boots of Travel": "Тревела",
    "Smoke of Deceit": "Смок",
    "Gem of True Sight": "Гем",
    "Dust of Appearance": "Даст",
    "Phase Boots": "Фейзы",
    "Arcane Boots": "Арканы",
    "Tranquil Boots": "Транквилы",
    "Pipe of Insight": "Пайп",
    "Sentry Ward": "Сентри",
    "Observer Ward": "Вард",
    "Town Portal Scroll": "ТП",
    "Solar Crest": "Солярка",
    "Bloodthorn": "Бладорн",
    "Aeon Disk": "Аеон",
    "Guardian Greaves": "Грейвы",

    /* Spectre */
    "Spectral Dagger": "даггер",
    "Desolate": "десолейт",
    "Dispersion": "дисперсия",
    "Haunt": "хаунт",
    "Reality": "прыжок",

    /* Скиллы */
    "Meat Hook": "хук",
    "Rot": "гниль",
    "Dismember": "расчленение",
    "Omnislash": "омни",
    "Blade Fury": "вертушка",
    "Healing Ward": "вард",
    "Ravage": "раваж",
    "Black Hole": "чёрная дыра",
    "Reverse Polarity": "РП",
    "Chronosphere": "хроно",
    "Laguna Blade": "лагуна",
    "Finger of Death": "палец",
    "Mana Void": "мана войд",
    "Culling Blade": "казнь",
    "Berserker's Call": "колл",
    "Epicenter": "эпицентр",
    "Charge of Darkness": "чардж",
    "Static Remnant": "ремант",
    "Ball Lightning": "болт",
    "Sleight of Fist": "слейт",
    "Sun Strike": "санстрайк",
    "Chaos Meteor": "метеор",
    "Tornado": "торнадо",
    "Alacrity": "алакрити",
    "Stifling Dagger": "даггер",
    "Phantom Strike": "прыжок",
    "Coup de Grace": "криты",
    "Dark Pact": "пакт",
    "Frost Arrows": "фрост арроуз",
    "Gust": "густ",
    "Life Break": "лайф брейк",
    "Rupture": "разрыв",
    "Reaper's Scythe": "коса",
    "Death Pulse": "пульс",
    "Hand of God": "хэнд оф гад",
    "Timber Chain": "чейн",
    "Sonic Wave": "волна",
    "Primal Roar": "роар",
    "Wild Axes": "топоры",
    "Toss": "тосс",
    "Avalanche": "аваланч",
    "Walrus Punch": "панч",
    "Snowball": "сноуболл",
    "Spell Steal": "спелл стил",
    "Telekinesis": "телекинез",
    "Fade Bolt": "фейд болт",
    "Life Drain": "дрейн",
    "Soul Rip": "соул рип",
    "Decay": "декей",
    "Tombstone": "томбстоун",
    "Requiem": "реквием",
    "Shadowraze": "рейзы",
    "Chakram": "чакрам",
    "Astral Step": "астрал",
    "Pounce": "прыжок",
    "Essence Shift": "эссенс шифт"
  },

  applySlang: function (text) {
    var out = String(text);
    /* *текст* → **текст** */
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

  systemPrompt: function (matchContext) {
    var base = [
      "Ты DotaJetch AI — дотерский тренер. Общаешься как опытный игрок 7000+ MMR с другом.",
      "",
      "🚨 КРИТИЧЕСКИЕ ПРАВИЛА:",
      "",
      "1. **НИКОГДА не выдумывай факты о матче.**",
      "   • НЕ упоминай предметы, если их нет в контексте.",
      "   • НЕ упоминай тайминги покупки предметов ('радик на 40-й минуте'),",
      "     если их нет в контексте. Ты НЕ видишь когда игрок что купил.",
      "   • Пиши только ОБЩИЕ рекомендации: 'собери МКБ против уклонения'.",
      "",
      "2. **Все названия — коротко, как говорят дотеры:**",
      "   Black King Bar → БКБ, Monkey King Bar → МКБ, Battle Fury → БФ,",
      "   Manta Style → Манта, Radiance → Радик, Scythe of Vyse → Хекс,",
      "   Blink Dagger → Блинк, Heart of Tarrasque → Тараска, Linken's → Линка.",
      "   НЕ используй непонятные сокращения. Если сомневаешься — пиши полное название.",
      "",
      "3. **Формат**: markdown. **Жирный** через **ДВОЙНЫЕ** звёздочки.",
      "   Списки через `• `. Эмодзи для разделов. Пустая строка между блоками.",
      "",
      "4. **Длина ответа:**",
      "   • Короткий вопрос (до 10 слов) → 2-4 предложения, БЕЗ разбора KDA.",
      "   • Вопрос про матч → до 250 слов.",
      "   • Общий вопрос → 100-150 слов.",
      "",
      "5. **Сленг**: керри, мид, сап, оффлейн, фармить, крипы, ганкать,",
      "   руинить, харасить, килить, лузать, изи, имба, ГГ.",
      "",
      "6. **Не пиши вступления** типа 'Конечно!' / 'Отличный вопрос!' Сразу к делу.",
      "",
      "7. **Позиция игрока** указана в контексте. Учитывай её:",
      "   Pos 1 (керри) — фарм, криты, лейт.",
      "   Pos 2 (мид) — соло, ганги, руны.",
      "   Pos 3 (оффлейн) — инициация, дизейбл, танк.",
      "   Pos 4 (роум) — ганги, варды, помощь всем.",
      "   Pos 5 (сапорт) — сейв керри, варды, хил."
    ].join("\n");

    if (matchContext) {
      base += "\n\n══════ ДАННЫЕ МАТЧА ══════\n" + matchContext +
        "\n══════════════════════════\n\n" +
        "⚠️ Используй ТОЛЬКО данные выше. Ничего не придумывай.";
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

    var ctx = [];
    ctx.push("🎮 ГЕРОЙ ИГРОКА: " + heroName.toUpperCase());
    if (position) ctx.push("ПОЗИЦИЯ: " + position);
    ctx.push("Результат: " + (res.won ? "ПОБЕДА 🏆" : "ПОРАЖЕНИЕ 💀"));
    ctx.push("Матч #" + (m.match_id || "?") + ", " + durMin.toFixed(0) + " мин");

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
      temperature: 0.5,
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

  askMistral: async function (userQuery, matchContext) {
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
        console.log("Mistral [" + model + "]");
        var text = await self.mistralRequest(model, userQuery, matchContext);
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

  askPollinations: function (userQuery, matchContext) {
    var self = this;
    var body = {
      model: "openai",
      messages: [
        { role: "system", content: self.systemPrompt(matchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.5,
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
        throw new Error("Сервис перегружен. Попробуй через минуту.");
      }
    } finally {
      this.busy = false;
    }
  },

  shouldUseExternal: function () { return true; },

  init: function () {
    console.log("external-ai v14.0 FINAL · без выдумок, чистый сленг");
  }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}
