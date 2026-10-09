/* DOTA JETCH — EXTERNAL AI v9.0
   Использует window.chatMatchContext (выбранный матч в чате).
   Fallback: lastAnalysis. Mistral + CORS-прокси. */

var ExternalAI = {
  enabled: true,
  busy: false,
  lastError: null,
  TIMEOUT_MS: 15000,

  mistralKey: "mstrl_fmvy3EYwtaIGtaLRiqrwMK2RRFOZtVcb_1McbHV",
  mistralModel: "mistral-small-latest",
  mistralUrl: "https://api.mistral.ai/v1/chat/completions",
  corsProxies: [
    "https://api.allorigins.win/raw?url=",
    "https://corsproxy.io/?",
    "https://api.codetabs.com/v1/proxy?quest="
  ],

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

  askMistral: function (userQuery, matchContext) {
    var self = this;
    var body = {
      model: self.mistralModel,
      messages: [
        { role: "system", content: self.systemPrompt(matchContext) },
        { role: "user", content: userQuery }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    var directHeaders = {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + self.mistralKey,
      "Accept": "application/json"
    };

    var direct = self.fetchWithTimeout(self.mistralUrl, {
      method: "POST",
      headers: directHeaders,
      body: JSON.stringify(body)
    }, self.TIMEOUT_MS)
    .then(function (res) {
      if (!res.ok) {
        return res.text().then(function (t) {
          throw new Error("Mistral direct HTTP " + res.status + ": " + t.slice(0, 150));
        });
      }
      return res.text();
    });

    var proxyChain = Promise.reject(new Error("start"));
    for (var i = 0; i < self.corsProxies.length; i++) {
      (function (proxy) {
        proxyChain = proxyChain.catch(function () {
          var proxiedUrl = proxy + encodeURIComponent(self.mistralUrl);
          console.log("Trying CORS proxy:", proxy);
          return self.fetchWithTimeout(proxiedUrl, {
            method: "POST",
            headers: directHeaders,
            body: JSON.stringify(body)
          }, self.TIMEOUT_MS)
          .then(function (res) {
            if (!res.ok) throw new Error("Proxy HTTP " + res.status);
            return res.text();
          });
        });
      })(self.corsProxies[i]);
    }

    return direct
      .catch(function (err) {
        console.warn("Mistral direct failed:", err.message, "→ CORS-прокси");
        return proxyChain;
      })
      .then(function (text) {
        try {
          var json = JSON.parse(text);
          if (json.choices && json.choices[0]) {
            if (json.choices[0].message && json.choices[0].message.content) {
              return json.choices[0].message.content;
            }
            if (json.choices[0].text) return json.choices[0].text;
          }
          if (json.contents) return String(json.contents);
        } catch (e) {}
        if (text && text.length > 10) return text;
        throw new Error("Mistral: пустой ответ");
      });
  },

  ask: function (query, matchContext) {
    var self = this;
    if (!this.enabled) return Promise.reject(new Error("external-ai-disabled"));
    if (this.busy) return Promise.reject(new Error("busy"));
    this.busy = true;
    this.lastError = null;

    return this.askMistral(query, matchContext)
      .catch(function (err) {
        self.lastError = err;
        throw err;
      })
      .finally(function () { self.busy = false; });
  },

  shouldUseExternal: function () {
    return true;
  },

  init: function () {
    console.log("external-ai v9.0 ready · Mistral + chatMatchContext");
  }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}
