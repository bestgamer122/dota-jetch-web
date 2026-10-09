/* DOTA JETCH — EXTERNAL AI v11.0
   FIX: убраны CORS-прокси (не нужны — Mistral CORS открыт).
   FIX: 429 обрабатывается с exponential backoff.
   FIX: промпт переписан — императив на короткие ответы, русские скиллы, дотерский сленг. */

var ExternalAI = {
  enabled: true,
  busy: false,
  lastError: null,
  TIMEOUT_MS: 25000,

  mistralKey: "mstrl_fmvy3EYwtaIGtaLRiqrwMK2RRFOZtVcb_1McbHV",
  mistralUrl: "https://api.mistral.ai/v1/chat/completions",

  /* Только рабочие модели (без открытых моделей типа mixtral — они тоже под rate limit) */
  mistralModels: [
    "mistral-small-latest",
    "open-mistral-nemo"
  ],

  rateLimitedUntil: 0,
  currentModelIdx: 0,

  /* ─── Переименования скиллов: EN → RU ─── */
  skillTranslations: {
    "Shadowraze": "Тень-разряд (Q/W/E)",
    "Necromastery": "Некромастери",
    "Presence of the Dark Lord": "Присутствие Тёмного Лорда",
    "Requiem": "Реквием",
    "Spectral Dagger": "Призрачный клинок",
    "Desolate": "Опустошение",
    "Dispersion": "Рассеивание",
    "Haunt": "Преследование",
    "Reality": "Реальность",
    "Spectral Dash": "Призрачный клинок",
    "Ghost Scepter": "Скипетр призрака",
    "Manta Style": "Стиль манты",
    "Linken's Sphere": "Сфера Линкена",
    "Aghanim's Shard": "Осколок Аганима",
    "Aghanim's Scepter": "Скипетр Аганима",
    "Black King Bar": "БКБ",
    "Blink Dagger": "Блинк",
    "Battle Fury": "Батл Фьюри",
    "Radiance": "Радианс",
    "Butterfly": "Бабочка",
    "Satanic": "Сатаник",
    "Skadi": "Скади",
    "Eye of Skadi": "Око Скади",
    "Heart of Tarrasque": "Сердце Тарраска",
    "Assault Cuirass": "Асу",
    "Silver Edge": "Сильвер Эдж",
    "Monkey King Bar": "МКБ",
    "Daedalus": "Дедалус",
    "Diffusal Blade": "Дифуза",
    "Abyssal Blade": "Абиссал",
    "Sange and Yasha": "СнЯ",
    "BKB": "БКБ"
  },

  translateSkills: function (text) {
    var out = String(text);
    for (var en in this.skillTranslations) {
      if (!this.skillTranslations.hasOwnProperty(en)) continue;
      var ru = this.skillTranslations[en];
      var re = new RegExp("\\b" + en.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", "g");
      out = out.replace(re, ru);
    }
    return out;
  },

  /* ─── НОВЫЙ жёсткий промпт ─── */
  systemPrompt: function (matchContext) {
    var base = [
      "Ты DotaJetch AI — дотерский тренер. Общаешься как опытный игрок 7000+ MMR с другом.",
      "",
      "🚨 ЖЁСТКИЕ ПРАВИЛА:",
      "",
      "1. **Все названия способностей — ТОЛЬКО по-русски**, если есть общепринятый перевод.",
      "   Пример: Shadowraze → Тень-разряд, Spectral Dagger → Призрачный клинок, Requiem → Реквием, Dispersion → Рассеивание, Haunt → Преследование.",
      "   Пример: Ghost Scepter → Скипетр призрака, Manta Style → Манта, BKB → БКБ, Blink Dagger → Блинк.",
      "   Английские аббревиатуры (BKB, MKB, BKB) — можно оставить, их все знают.",
      "",
      "2. **Длина ответа — 150-350 слов МАКСИМУМ**. Не пиши трактаты. Коротко, по делу.",
      "",
      "3. **Формат ответа** (markdown обязателен):",
      "   • **Жирный** для важного",
      "   • Эмодзи для разделов (⚔️ 🛡 💰 🎯 ⚠️ ✅)",
      "   • Списки через `• `",
      "   • Пустая строка между блоками",
      "",
      "4. **Сленг дотеров приветствуется**: керри, мид, сап, оффлейн, фармить, крипы, ганкать, руинить, харасить, дизенгейджить, килить, лузать, изи, имба, ГГ.",
      "",
      "5. **Не используй сложные термины без пояснения**. Если пишешь 'дизенгейдж' — поясни '(выход из файта)'.",
      "",
      "6. **Если игрок спрашивает про свой матч** — опирайся на данные ниже и отвечай про ЭТОГО героя и ЭТУ игру.",
      "",
      "7. **Не пиши вступления типа 'Конечно!' или 'Отличный вопрос!'**. Сразу к делу.",
      "",
      "8. **Не используй 'ты' с маленькой буквы в уничижительном смысле**. Обращайся по-дружески."
    ].join("\n");

    if (matchContext) {
      base += "\n\n══════ ДАННЫЕ МАТЧА ══════\n" + matchContext +
        "\n══════════════════════════\n\n" +
        "⚠️ ВАЖНО: игрок играл на герое, указанном в самом верху. Все советы, разборы и рекомендации — именно про этого героя и эту игру. Не пиши общих фраз.";
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

  /* ─── Контекст: герой идёт ПЕРВОЙ строкой и капсом ─── */
  buildMatchContext: function () {
    var res = this.getContextSource();
    if (!res) return null;
    var p = res.player, m = res.match;
    var heroName = res.hero ? res.hero.name : "?";

    var ctx = [];
    ctx.push("🎮 ИГРОК ИГРАЛ НА ГЕРОЕ: " + heroName.toUpperCase());
    ctx.push("Результат: " + (res.won ? "ПОБЕДА 🏆" : "ПОРАЖЕНИЕ 💀"));
    ctx.push("Матч: #" + (m.match_id || "?") + ", длительность: " + ((m.duration || 0) / 60).toFixed(0) + " мин");
    if (res.position) ctx.push("Позиция: " + res.position);

    ctx.push("KDA: " + p.kills + "/" + p.deaths + "/" + p.assists +
      " (" + ((p.kills + p.assists) / Math.max(p.deaths, 1)).toFixed(2) + ")");
    ctx.push("GPM: " + Math.round(p.gold_per_min || 0) + " | XPM: " + Math.round(p.xp_per_min || 0));
    ctx.push("Ластхиты: " + (p.last_hits || 0) + " | Денаи: " + (p.denies || 0));
    ctx.push("Урон по героям: " + Math.round(p.hero_damage || 0) + " | по строениям: " + Math.round(p.tower_damage || 0));
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

    /* Последние предметы игрока */
    if (res.items && m.players) {
      var meItems = [];
      for (var k = 0; k < 6; k++) {
        var itemId = p["item_" + k] || 0;
        if (itemId > 0 && res.items[itemId]) meItems.push(res.items[itemId].name);
      }
      if (meItems.length) ctx.push("Финальный инвентарь игрока: " + meItems.join(", "));
    }

    return ctx.join("\n");
  },

  fetchWithTimeout: function (url, options, timeoutMs) {
    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, timeoutMs);
    options.signal = controller.signal;
    return fetch(url, options).finally(function () { clearTimeout(timeoutId); });
  },

  sleep: function (ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  },

  /* ─── Прямой запрос к Mistral ─── */
  mistralRequest: function (model, userQuery, matchContext) {
    var self = this;
    var body = {
      model: model,
      messages: [
        { role: "system", content: self.systemPrompt(matchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.6,
      max_tokens: 700
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
      if (res.status === 429) {
        throw { code: 429, message: "Rate limit" };
      }
      if (res.status === 401) {
        throw { code: 401, message: "Неверный API-ключ" };
      }
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
        return self.translateSkills(json.choices[0].message.content);
      }
      throw { code: -1, message: "Пустой ответ" };
    });
  },

  /* ─── Mistral с правильным backoff ─── */
  askMistral: async function (userQuery, matchContext) {
    var self = this;

    /* Если ещё в cooldown — сразу пропускаем */
    var now = Date.now();
    if (now < self.rateLimitedUntil) {
      var waitMs = self.rateLimitedUntil - now;
      console.log("Mistral cooldown, жду " + Math.round(waitMs/1000) + " сек...");
      if (waitMs > 5000) {
        throw new Error("Mistral в cooldown " + Math.round(waitMs/1000) + " сек");
      }
      await self.sleep(waitMs);
    }

    var startIdx = self.currentModelIdx;
    var lastError = null;

    for (var i = 0; i < self.mistralModels.length; i++) {
      var modelIdx = (startIdx + i) % self.mistralModels.length;
      var model = self.mistralModels[modelIdx];

      /* 3 попытки на модель с exponential backoff */
      for (var attempt = 0; attempt < 3; attempt++) {
        try {
          console.log("Mistral [" + model + "] попытка " + (attempt+1));
          var text = await self.mistralRequest(model, userQuery, matchContext);
          self.currentModelIdx = modelIdx;
          self.rateLimitedUntil = 0;
          return text;
        } catch (err) {
          lastError = err;

          if (err.code === 429) {
            console.warn("Mistral " + model + " 429, attempt " + (attempt+1));
            /* Exponential backoff: 2s, 4s, 8s */
            var backoff = 2000 * Math.pow(2, attempt);
            if (attempt < 2) {
              await self.sleep(backoff);
              continue;
            }
            /* После 3 попыток на модели — переключаемся на следующую */
            self.rateLimitedUntil = Date.now() + 10000;
            break;
          }

          if (err.code === 401) {
            throw new Error("Неверный API-ключ Mistral");
          }

          /* Другие ошибки — 1 попытка и переключение */
          console.warn("Mistral " + model + " failed:", err.message);
          break;
        }
      }
    }

    throw new Error("Mistral исчерпан: " + (lastError ? lastError.message : "?"));
  },

  /* ─── Pollinations (fallback) ─── */
  askPollinations: function (userQuery, matchContext) {
    var self = this;
    var body = {
      model: "openai",
      messages: [
        { role: "system", content: self.systemPrompt(matchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.6,
      max_tokens: 700
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
          return self.translateSkills(json.choices[0].message.content);
        }
      } catch (e) {}
      if (text && text.length > 10) return self.translateSkills(text);
      throw new Error("Pollinations пусто");
    });
  },

  /* ─── Главный вызов ─── */
  ask: async function (query, matchContext) {
    if (!this.enabled) throw new Error("external-ai-disabled");
    if (this.busy) throw new Error("busy");
    this.busy = true;
    this.lastError = null;

    try {
      return await this.askMistral(query, matchContext);
    } catch (err) {
      console.warn("Mistral полностью упал:", err.message, "→ Pollinations");
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
    console.log("external-ai v11.0 ready · Mistral (backoff) → Pollinations · RU skill names");
  }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}
