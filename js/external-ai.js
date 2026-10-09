/* DOTA JETCH — EXTERNAL AI v7.0
   Mistral AI (основной, с ключом) + Pollinations (fallback).
   CORS открыт, работает из браузера напрямую. */

var ExternalAI = {
  enabled: true,
  busy: false,
  lastError: null,
  TIMEOUT_MS: 12000,

  /* ─── Ключ Mistral ─── */
  mistralKey: "mstrl_fmvy3EYwtaIGtaLRiqrwMK2RRFOZtVcb_1McbHV",
  mistralModel: "mistral-small-latest",
  mistralUrl: "https://api.mistral.ai/v1/chat/completions",

  providers: [
    {
      name: "Mistral",
      url: "https://api.mistral.ai/v1/chat/completions",
      model: "mistral-small-latest",
      headers: null, // строится динамически из ключа
      useMistralKey: true
    },
    {
      name: "Pollinations",
      url: "https://text.pollinations.ai/openai",
      model: "openai",
      headers: { "Content-Type": "application/json" }
    }
  ],

  systemPrompt: function (matchContext) {
    var base = "Ты DotaJetch AI — эксперт по Dota 2. Отвечай кратко, конкретно, на русском. " +
      "Используй реальные факты из Dota 2 (патч 7.38+). Не выдумывай. " +
      "Если не знаешь — скажи честно. Давай конкретные советы, не общие фразы.";
    if (matchContext) {
      base += "\n\nКонтекст последнего матча игрока: " + matchContext;
    }
    return base;
  },

  buildHeaders: function (provider) {
    if (provider.useMistralKey) {
      return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + this.mistralKey,
        "Accept": "application/json"
      };
    }
    return provider.headers || { "Content-Type": "application/json" };
  },

  askProvider: function (provider, userQuery, matchContext) {
    var self = this;
    var body = {
      model: provider.model,
      messages: [
        { role: "system", content: self.systemPrompt(matchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.7,
      max_tokens: 800
    };

    var controller = new AbortController();
    var timeoutId = setTimeout(function () { controller.abort(); }, self.TIMEOUT_MS);

    return fetch(provider.url, {
      method: "POST",
      headers: self.buildHeaders(provider),
      body: JSON.stringify(body),
      signal: controller.signal
    })
    .then(function (res) {
      clearTimeout(timeoutId);
      if (!res.ok) {
        return res.text().then(function (errText) {
          throw new Error(provider.name + " HTTP " + res.status + ": " + errText.slice(0, 200));
        });
      }
      return res.text();
    })
    .then(function (text) {
      try {
        var json = JSON.parse(text);
        if (json.choices && json.choices[0] && json.choices[0].message) {
          return json.choices[0].message.content;
        }
      } catch (e) {}
      if (text && text.length > 10) return text;
      throw new Error(provider.name + ": пустой ответ");
    })
    .catch(function (err) {
      clearTimeout(timeoutId);
      throw err;
    });
  },

  ask: function (query, matchContext) {
    var self = this;
    if (!this.enabled) return Promise.reject(new Error("external-ai-disabled"));
    if (this.busy) return Promise.reject(new Error("busy"));
    this.busy = true;
    this.lastError = null;

    var chain = Promise.reject(new Error("start"));
    for (var i = 0; i < this.providers.length; i++) {
      (function (provider) {
        chain = chain.catch(function (err) {
          if (err && err.message !== "start") {
            console.warn("Provider " + provider.name + " failed:", err.message);
          }
          return self.askProvider(provider, query, matchContext);
        });
      })(this.providers[i]);
    }

    return chain
      .catch(function (err) {
        self.lastError = err;
        throw new Error("Все внешние ИИ недоступны: " + err.message);
      })
      .finally(function () { self.busy = false; });
  },

  shouldUseExternal: function (query, localAnswer) {
    if (!this.enabled) return false;
    if (this.busy) return false;

    if (localAnswer && localAnswer.confidence >= 0.85) return false;
    if (!localAnswer || !localAnswer.text) return true;

    if (localAnswer.kind && localAnswer.kind.indexOf("universal") === 0) return true;
    if (localAnswer.kind === "none" || localAnswer.kind === "unknown") return true;

    var t = localAnswer.text.toLowerCase();
    if (t.indexOf("не знаю") >= 0) return true;
    if (t.indexOf("не уверен") >= 0) return true;
    if (t.indexOf("попробуй переформулировать") >= 0) return true;
    if (t.indexOf("не смог") >= 0) return true;
    if (t.indexOf("это интересный вопрос") >= 0) return true;
    if (t.indexOf("расскажи подробнее") >= 0) return true;
    if (t.indexOf("что тебя интересует") >= 0) return true;
    if (t.indexOf("давай разберёмся") >= 0) return true;
    if (t.indexOf("давай разберемся") >= 0) return true;
    if (t.indexOf("я слышу тебя") >= 0) return true;
    if (t.indexOf("могу разобрать матч") >= 0) return true;

    if (localAnswer.text.length < 100 && localAnswer.confidence < 0.7) return true;

    return false;
  },

  buildMatchContext: function () {
    if (typeof lastAnalysis === "undefined" || !lastAnalysis || !lastAnalysis.match) return null;
    var res = lastAnalysis;
    var p = res.player, m = res.match;
    var ctx = "Герой: " + (res.hero ? res.hero.name : "?") + ". ";
    ctx += "KDA: " + p.kills + "/" + p.deaths + "/" + p.assists + ". ";
    ctx += "GPM: " + Math.round(p.gold_per_min || 0) + ". ";
    ctx += "Длительность: " + ((m.duration || 0) / 60).toFixed(0) + " мин. ";
    ctx += "Результат: " + (res.won ? "победа" : "поражение") + ". ";
    return ctx;
  },

  init: function () {
    console.log("external-ai v7.0 ready · Mistral (mistral-small-latest) + Pollinations fallback");
  }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}
