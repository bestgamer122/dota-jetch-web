/* DOTA JETCH — BRAIN MATCH REVIEW v1.0 */

var BrainMatchReview = {
  detect: function (q) {
    var s = String(q || "").toLowerCase().trim();
    if (s.length > 60) return null;
    if (s.indexOf("разбери мой матч") >= 0) return "review";
    if (s.indexOf("разбери матч") >= 0) return "review";
    if (s.indexOf("как я сыграл") >= 0) return "review";
    if (s.indexOf("как я отыграл") >= 0) return "review";
    if (s.indexOf("оцени мою игру") >= 0) return "review";
    if (s.indexOf("оцени мой матч") >= 0) return "review";
    if (s.indexOf("мой последний матч") >= 0) return "review";
    if (s.indexOf("что не так с моей игрой") >= 0) return "review";
    if (s.indexOf("что улучшить") >= 0) return "advice";
    if (s.indexOf("что было хорошо") >= 0) return "good";
    if (s.indexOf("что было плохо") >= 0) return "bad";
    if (s.indexOf("мой кда") >= 0 || s.indexOf("мой kda") >= 0) return "kda";
    if (s.indexOf("мой гпм") >= 0 || s.indexOf("мой gpm") >= 0) return "gpm";
    if (s.indexOf("мой урон") >= 0 || s.indexOf("мой дамаг") >= 0) return "damage";
    if (s.indexOf("мои предметы") >= 0 || s.indexOf("мой билд") >= 0) return "build";
    return null;
  },

  _getLast: function () {
    if (typeof lastAnalysis !== "undefined" && lastAnalysis && lastAnalysis.match) return lastAnalysis;
    return null;
  },

  answer: function (kind) {
    var res = this._getLast();
    if (!res) return "🤔 Нет данных последнего матча. Открой вкладку **«Анализ матча»**, введи ID и героя — потом спрашивай.";
    var p = res.player, m = res.match;
    var hn = res.hero ? res.hero.name : "?";
    var won = res.won;
    var dm = (m.duration || 0) / 60;
    var kda = (p.kills + p.assists) / Math.max(p.deaths, 1);
    if (kind === "review") return this._full(res, p, m, hn, won, dm, kda);
    if (kind === "advice") return "🎯 **Как улучшить игру на " + hn + ":**\n\n" + this._getAdvice(p, dm, kda, won);
    if (kind === "good") return this._good(res, p, hn, won, dm, kda);
    if (kind === "bad") return this._bad(res, p, hn, won, dm, kda);
    if (kind === "kda") return "📊 **KDA:** " + p.kills + "/" + p.deaths + "/" + p.assists + " (" + kda.toFixed(2) + ")";
    if (kind === "gpm") return "💰 **GPM:** " + Math.round(p.gold_per_min || 0) + "\n**XPM:** " + Math.round(p.xp_per_min || 0) + "\n**Ластхиты:** " + (p.last_hits || 0);
    if (kind === "damage") return "⚔ **Урон по героям:** " + Math.round(p.hero_damage || 0) + "\n**По строениям:** " + Math.round(p.tower_damage || 0);
    if (kind === "build") {
      var items = res.items || {};
      var l = ["🎒 **Финальный инвентарь:**", ""];
      for (var i = 0; i < 6; i++) {
        var id = p["item_" + i] || 0;
        if (id > 0) { var it = items[id]; l.push("• " + (it ? it.name : "Предмет #" + id)); }
      }
      return l.join("\n");
    }
    return null;
  },

  _full: function (res, p, m, hn, won, dm, kda) {
    var l = [];
    l.push("📊 **Разбор матча " + hn + "**"); l.push("");
    l.push("**Результат:** " + (won ? "победа 🏆" : "поражение"));
    l.push("**KDA:** " + p.kills + "/" + p.deaths + "/" + p.assists + " (" + kda.toFixed(2) + ")");
    l.push("**Длительность:** " + dm.toFixed(1) + " мин");
    l.push("**GPM/XPM:** " + Math.round(p.gold_per_min || 0) + " / " + Math.round(p.xp_per_min || 0));
    l.push("");
    if (res.performance) {
      l.push("**Оценка:** " + res.performance.grade + " (" + res.performance.score + "/100)");
      if (res.performance.reasons) for (var i = 0; i < res.performance.reasons.length; i++) l.push("• " + res.performance.reasons[i]);
      l.push("");
    }
    var good = this._collectGood(p, dm, kda, won);
    if (good.length) {
      l.push("✅ **Хорошо:**");
      for (var g = 0; g < good.length; g++) l.push("• " + good[g]);
      l.push("");
    }
    var bad = this._collectBad(p, dm, kda, won);
    if (bad.length) {
      l.push("⚠️ **Улучшить:**");
      for (var b = 0; b < bad.length; b++) l.push("• " + bad[b]);
      l.push("");
    }
    l.push("💡 **Совет:** " + this._getAdvice(p, dm, kda, won));
    return l.join("\n");
  },

  _good: function (r, p, hn, won, dm, kda) {
    var g = this._collectGood(p, dm, kda, won);
    if (!g.length) return "Особенно хорошего мало, но это опыт.";
    var l = ["✅ **Хорошо в матче " + hn + ":**", ""];
    for (var i = 0; i < g.length; i++) l.push("• " + g[i]);
    return l.join("\n");
  },

  _bad: function (r, p, hn, won, dm, kda) {
    var b = this._collectBad(p, dm, kda, won);
    if (!b.length) return "⚠️ Слабых мест не видно.";
    var l = ["⚠️ **Улучшить в матче " + hn + ":**", ""];
    for (var i = 0; i < b.length; i++) l.push("• " + b[i]);
    return l.join("\n");
  },

  _collectGood: function (p, dm, kda, won) {
    var o = [];
    if (won) o.push("Победа");
    if (kda >= 4) o.push("Отличный KDA " + kda.toFixed(2));
    else if (kda >= 3) o.push("Хороший KDA " + kda.toFixed(2));
    if (p.gold_per_min >= 550) o.push("Высокий GPM (" + Math.round(p.gold_per_min) + ")");
    var lh = (p.last_hits || 0) / Math.max(dm, 1);
    if (lh >= 7) o.push("Отличный фарм (" + lh.toFixed(1) + " LH/мин)");
    if (p.deaths <= 3) o.push("Мало смертей (" + p.deaths + ")");
    if ((p.hero_damage || 0) / Math.max(dm, 1) >= 700) o.push("Высокий урон");
    if ((p.tower_damage || 0) >= 3000) o.push("Хороший урон по строениям");
    return o;
  },

  _collectBad: function (p, dm, kda, won) {
    var o = [];
    if (!won) o.push("Поражение");
    if (kda < 1.5) o.push("Низкий KDA " + kda.toFixed(2));
    else if (kda < 2.5) o.push("Средний KDA " + kda.toFixed(2));
    if (p.deaths >= 8) o.push("Много смертей (" + p.deaths + ")");
    else if (p.deaths >= 5) o.push("Смертей " + p.deaths);
    if (p.gold_per_min < 350) o.push("Низкий GPM (" + Math.round(p.gold_per_min) + ")");
    var lh = (p.last_hits || 0) / Math.max(dm, 1);
    if (lh < 4 && p.lane_role !== 4 && p.lane_role !== 5) o.push("Слабый фарм");
    if ((p.hero_damage || 0) / Math.max(dm, 1) < 300) o.push("Низкий урон");
    return o;
  },

  _getAdvice: function (p, dm, kda, won) {
    if (p.deaths >= 8) return "Много смертей. Не фарми без вижена, следи за миникартой.";
    if (p.gold_per_min < 350) return "Низкий фарм. Стакай лагеря на 53-й секунде.";
    if (kda < 2) return "Работай над KDA. Больше ассистов, меньше смертей.";
    if (!won) return "Проанализируй, где команда потеряла темп. Смотри реплей.";
    return "Отличная игра! Продолжай.";
  }
};
