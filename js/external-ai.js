/* DOTA JETCH — EXTERNAL AI v2.1
   Pollinations AI — бесплатная нейросеть без ключа.
   ФИКС: агрессивнее определяет, когда нужна внешняя ИИ. */

var ExternalAI = {
  enabled: true,
  busy: false,
  lastError: null,

  systemPrompt: function (matchContext) {
    var base = "Ты DotaJetch AI — эксперт по Dota 2. Отвечай кратко, конкретно, на русском. " +
      "Используй реальные факты из Dota 2 (патч 7.38+). Не выдумывай. " +
      "Если не знаешь — скажи честно. Давай конкретные советы, не общие фразы.";
    if (matchContext) {
      base += "\n\nКонтекст последнего матча игрока: " + matchContext;
    }
    return base;
  },

  askPollinations: function (userQuery, matchContext) {
    var self = this;
    return new Promise(function (resolve, reject) {
      var url = "https://text.pollinations.ai/openai";
      var body = {
        model: "openai",
        messages: [
          { role: "system", content: self.systemPrompt(matchContext) },
          { role: "user", content: userQuery }
        ],
        temperature: 0.7,
        max_tokens: 800
      };
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
      .then(function (res) {
        if (!res.ok) throw new Error("Pollinations HTTP " + res.status);
        return res.text();
      })
      .then(function (text) {
        try {
          var json = JSON.parse(text);
          if (json.choices && json.choices[0] && json.choices[0].message) {
            resolve(json.choices[0].message.content);
            return;
          }
        } catch (e) {}
        if (text && text.length > 5) resolve(text);
        else reject(new Error("Pollinations: пустой ответ"));
      })
      .catch(reject);
    });
  },

  ask: function (query, matchContext) {
    var self = this;
    if (!this.enabled) return Promise.reject(new Error("external-ai-disabled"));
    if (this.busy) return Promise.reject(new Error("busy"));
    this.busy = true;
    this.lastError = null;
    return this.askPollinations(query, matchContext)
      .finally(function () { self.busy = false; });
  },

  /* ─── ФИКС: агрессивнее определяем, когда нужна внешняя ИИ ─── */
  shouldUseExternal: function (query, localAnswer) {
    if (!this.enabled) return false;
    if (this.busy) return false;

    /* Если локальный ответил уверенно (>= 0.85) — не дёргаем */
    if (localAnswer && localAnswer.confidence >= 0.85) return false;

    /* Если ответа нет вообще — нужна */
    if (!localAnswer || !localAnswer.text) return true;

    /* Universal — это всегда заглушка, нужна внешняя */
    if (localAnswer.kind && localAnswer.kind.indexOf("universal") === 0) return true;

    /* Kind = none / unknown — нужна */
    if (localAnswer.kind === "none" || localAnswer.kind === "unknown") return true;

    /* По тексту — шаблонные фразы-заглушки */
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

    /* Короткий ответ (< 100 символов) без конкретики — тоже подозрительно */
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
    console.log("external-ai v2.1 ready · Pollinations (no key needed)");
  }
};

if (typeof Store !== "undefined") {
  setTimeout(function () { ExternalAI.init(); }, 100);
}
