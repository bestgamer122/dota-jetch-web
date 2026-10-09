/* DOTA JETCH — EXTERNAL AI v10.0
   Mistral с retry (429 fix) + ротация моделей + рабочие CORS-прокси + Pollinations fallback. */

var ExternalAI = {
  enabled: true,
  busy: false,
  lastError: null,
  TIMEOUT_MS: 20000,

  mistralKey: "mstrl_fmvy3EYwtaIGtaLRiqrwMK2RRFOZtVcb_1McbHV",
  mistralUrl: "https://api.mistral.ai/v1/chat/completions",

  /* Модели по приоритету — если одна упирается в лимит, берём следующую */
  mistralModels: [
    "mistral-small-latest",
    "open-mistral-nemo",
    "open-mixtral-8x7b",
    "mistral-tiny"
  ],

  /* Рабочие CORS-прокси для POST с headers (2026) */
  corsProxies: [
    "https://cors.eu.org/",
    "https://test.cors.workers.dev/?"
  ],

  /* Внутреннее состояние: блокировка после 429 */
  rateLimitedUntil: 0,
  currentModelIdx: 0,

  systemPrompt: function (matchContext) {
    var base = "Ты DotaJetch AI — эксперт по Dota 2 на патче 7.38+. " +
      "Отвечай на русском, кратко и конкретно. Используй реальные факты из Dota 2. " +
      "Не выдумывай героев, предметы или механики. Давай конкретные советы с таймингами, предметами и цифрами. " +
      "Если не уверен — скажи честно. Пиши понятно, без воды.";
    if (matchContext) {
      base += "\n\n=== КОНТЕКСТ МАТЧА ИГРОКА ===\n" + matchContext +
        "\n=== КОНЕЦ КОНТЕКСТА ===\n\n" +
        "Отвечай как тренер, который смотрел этот матч. " +
        "Если игрок спрашивает про матч — учитывай героя, KDA, GPM, врагов и союзников из контекста выше.";
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

  buildMatchContext: function () {
    var res = this.getContextSource();
    if (!res) return null;
    var p = res.player, m = res.match;
    var ctx = [];

    ctx.push("Герой игрока: " + (res.hero ? res.hero.name : "?"));
    ctx.push("Матч #" + (m.match_id || "?"));
    ctx.push("Результат: " + (res.won ? "ПОБЕДА" : "ПОРАЖЕНИЕ"));
    ctx.push("Длительность: " + ((m.duration || 0) / 60).toFixed(0) + " мин");
    if (res.position) ctx.push("Позиция: " + res.position);

    ctx.push("KDA: " + p.kills + "/" + p.deaths + "/" + p.assists +
      " (" + ((p.kills + p.assists) / Math.max(p.deaths, 1)).toFixed(2) + ")");
    ctx.push("GPM: " + Math.round(p.gold_per_min || 0) + ", XPM: " + Math.round(p.xp_per_min || 0));
    ctx.push("Ластхиты: " + (p.last_hits || 0) + ", Денаи: " + (p.denies || 0));
    ctx.push("Урон по героям: " + Math.round(p.hero_damage || 0));
    ctx.push("Урон по строениям: " + Math.round(p.tower_damage || 0));
    ctx.push("Хил: " + Math.round(p.hero_healing || 0));
    ctx.push("Нетворс: " + Math.round(p.total_gold || p.gold || 0));

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

  /* ─── Пауза ─── */
  sleep: function (ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  },

  /* ─── Один запрос к Mistral (с указанной моделью) ─── */
  mistralRequest: function (model, userQuery, matchContext) {
    var self = this;
    var body = {
      model: model,
      messages: [
        { role: "system", content: self.systemPrompt(matchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.7,
      max_tokens: 1000
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
      if (!res.ok) {
        return res.text().then(function (t) {
          throw { code: res.status, message: "HTTP " + res.status + ": " + t.slice(0, 150) };
        });
      }
      return res.text();
    })
    .then(function (text) {
      var json = JSON.parse(text);
      if (json.choices && json.choices[0] && json.choices[0].message) {
        return json.choices[0].message.content;
      }
      throw { code: -1, message: "Пустой ответ" };
    });
  },

  /* ─── Через CORS-прокси ─── */
  mistralViaProxy: function (proxy, model, userQuery, matchContext) {
    var self = this;
    var body = {
      model: model,
      messages: [
        { role: "system", content: self.systemPrompt(matchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };
    var headers = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + self.mistralKey,
      "Accept": "application/json"
    };
    var proxiedUrl = proxy + self.mistralUrl;

    return self.fetchWithTimeout(proxiedUrl, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(body)
    }, self.TIMEOUT_MS)
    .then(function (res) {
      if (res.status === 429) throw { code: 429, message: "Rate limit" };
      if (!res.ok) throw { code: res.status, message: "Proxy HTTP " + res.status };
      return res.text();
    })
    .then(function (text) {
      var json = JSON.parse(text);
      if (json.choices && json.choices[0] && json.choices[0].message) {
        return json.choices[0].message.content;
      }
      throw { code: -1, message: "Пустой ответ" };
    });
  },

  /* ─── Полный цикл Mistral с retry и ротацией моделей ─── */
  askMistral: async function (userQuery, matchContext) {
    var self = this;

    /* Если недавно был 429 — сразу переходим к следующей модели */
    var now = Date.now();
    if (now < self.rateLimitedUntil) {
      var waitMs = self.rateLimitedUntil - now;
      console.log("Rate limited, жду " + Math.round(waitMs/1000) + " сек...");
      await self.sleep(Math.min(waitMs, 4000));
    }

    /* Пробуем каждую модель по очереди */
    var startIdx = self.currentModelIdx;
    for (var i = 0; i < self.mistralModels.length; i++) {
      var modelIdx = (startIdx + i) % self.mistralModels.length;
      var model = self.mistralModels[modelIdx];

      /* 2 попытки прямого запроса к Mistral */
      for (var attempt = 0; attempt < 2; attempt++) {
        try {
          console.log("Mistral [" + model + "] попытка " + (attempt+1));
          var text = await self.mistralRequest(model, userQuery, matchContext);
          self.currentModelIdx = modelIdx;
          self.rateLimitedUntil = 0;
          return text;
        } catch (err) {
          if (err.code === 429) {
            console.warn("Mistral " + model + " 429 (rate limit)");
            self.rateLimitedUntil = Date.now() + 3000;
            if (attempt === 0) {
              await self.sleep(2000);
              continue;
            }
            /* Переходим к следующей модели */
            break;
          }
          /* Другие ошибки (сеть, CORS) — пробуем через прокси */
          console.warn("Mistral direct [" + model + "] failed:", err.message || err);
          break;
        }
      }

      /* Пробуем через CORS-прокси */
      for (var p = 0; p < self.corsProxies.length; p++) {
        try {
          console.log("Proxy [" + self.corsProxies[p] + "] model [" + model + "]");
          var ptext = await self.mistralViaProxy(self.corsProxies[p], model, userQuery, matchContext);
          self.currentModelIdx = modelIdx;
          return ptext;
        } catch (err) {
          if (err.code === 429) {
            self.rateLimitedUntil = Date.now() + 3000;
            break;
          }
          console.warn("Proxy failed:", err.message || err);
        }
      }
    }

    throw new Error("Все модели Mistral исчерпаны");
  },

  /* ─── Pollinations ─── */
  askPollinations: function (userQuery, matchContext) {
    var self = this;
    var body = {
      model: "openai",
      messages: [
        { role: "system", content: self.systemPrompt(matchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.7,
      max_tokens: 1000
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
        if (json.choices && json.choices[0] && json.choices[0].message) return json.choices[0].message.content;
      } catch (e) {}
      if (text && text.length > 10) return text;
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
      console.warn("Mistral exhausted:", err.message, "→ Pollinations");
      try {
        return await this.askPollinations(query, matchContext);
      } catch (err2) {
        this.lastError = err2;
        throw new Error("Все внешние ИИ недоступны");
      }
    } finally {
      this.busy = false;
    }
  },

  shouldUseExternal: function () { return true; },

  init: function () {
    console.log("external-ai v10.0 ready · Mistral (4 модели + retry) + 2 CORS-прокси + Pollinations");
  }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}
