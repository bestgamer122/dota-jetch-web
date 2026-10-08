/* DOTA JETCH — BRAIN TRENDS v1.0
   Анализ динамики: сравнение двух половин истории матчей. */

var BrainTrends = {

  getHistory: function () {
    if (typeof BrainSharedMemory !== "undefined") {
      var sh = BrainSharedMemory.load();
      if (sh && sh.matchLog && sh.matchLog.length >= 4) {
        return sh.matchLog.map(function (m) {
          return {
            heroName: m.hero || "?",
            kills: m.kills || 0,
            deaths: m.deaths || 0,
            assists: m.assists || 0,
            won: !!m.won,
            gpm: m.gpm || 0,
            xpm: m.xpm || 0,
            durMin: m.durMin || 0,
            ts: m.ts || 0
          };
        });
      }
    }
    var list = (typeof Store !== "undefined" ? Store.get("recentmatches", []) : []) || [];
    return list.map(function (m) {
      return {
        heroName: m.heroName || "?",
        kills: m.kills || 0,
        deaths: m.deaths || 0,
        assists: m.assists || 0,
        won: !!m.won,
        gpm: 0, xpm: 0,
        durMin: m.durMin || 0,
        ts: m.ts || 0
      };
    });
  },

  avg: function (list) {
    if (!list || !list.length) return null;
    var s = { wins: 0, kills: 0, deaths: 0, assists: 0, gpm: 0, xpm: 0, kda: 0, games: list.length };
    var gpmCount = 0;
    for (var i = 0; i < list.length; i++) {
      var m = list[i];
      if (m.won) s.wins++;
      s.kills += m.kills;
      s.deaths += m.deaths;
      s.assists += m.assists;
      s.kda += (m.kills + m.assists) / Math.max(m.deaths, 1);
      if (m.gpm) { s.gpm += m.gpm; gpmCount++; }
      if (m.xpm) { s.xpm += m.xpm; }
    }
    var n = list.length;
    return {
      games: n,
      winRate: (s.wins / n) * 100,
      avgKills: s.kills / n,
      avgDeaths: s.deaths / n,
      avgAssists: s.assists / n,
      avgKDA: s.kda / n,
      avgGPM: gpmCount > 0 ? s.gpm / gpmCount : 0,
      avgXPM: gpmCount > 0 ? s.xpm / gpmCount : 0,
      wins: s.wins
    };
  },

  split: function (list) {
    if (!list || list.length < 4) return null;
    var sorted = list.slice().sort(function (a, b) { return (a.ts || 0) - (b.ts || 0); });
    var half = Math.floor(sorted.length / 2);
    return {
      older: sorted.slice(0, half),
      recent: sorted.slice(half)
    };
  },

  fmtDiff: function (val, diff, suffix, invert) {
    var sign = diff > 0 ? "+" : "";
    var absDiff = Math.abs(diff);
    var better = invert ? diff < 0 : diff > 0;
    var icon = absDiff < 0.1 ? "➖" : (better ? "📈" : "📉");
    return icon + " " + val + ": " + sign + diff.toFixed(1) + (suffix || "");
  },

  formatReport: function () {
    var history = this.getHistory();
    if (!history || history.length < 4) {
      return "📊 Мало данных для анализа трендов. Разбери минимум 4 матча.";
    }

    var split = this.split(history);
    if (!split) return "📊 Не удалось разбить историю.";

    var oldStats = this.avg(split.older);
    var newStats = this.avg(split.recent);

    var l = [];
    l.push("📈 **Тренды: динамика за " + history.length + " матчей**");
    l.push("");
    l.push("Сравниваю первые " + oldStats.games + " матчей vs последние " + newStats.games + ".");
    l.push("");

    var wrDiff = newStats.winRate - oldStats.winRate;
    l.push("**🏆 Винрейт:**");
    l.push("• Было: " + oldStats.winRate.toFixed(0) + "%");
    l.push("• Стало: " + newStats.winRate.toFixed(0) + "%");
    l.push(this.fmtDiff("Изменение", wrDiff, "%", false));
    l.push("");

    var kdaDiff = newStats.avgKDA - oldStats.avgKDA;
    l.push("**⚔ Средний KDA:**");
    l.push("• Было: " + oldStats.avgKDA.toFixed(2));
    l.push("• Стало: " + newStats.avgKDA.toFixed(2));
    l.push(this.fmtDiff("Изменение", kdaDiff, "", false));
    l.push("");

    var deathsDiff = newStats.avgDeaths - oldStats.avgDeaths;
    l.push("**💀 Средние смерти:**");
    l.push("• Было: " + oldStats.avgDeaths.toFixed(1));
    l.push("• Стало: " + newStats.avgDeaths.toFixed(1));
    l.push(this.fmtDiff("Изменение", deathsDiff, "", true));
    l.push("");

    if (newStats.avgGPM > 0 && oldStats.avgGPM > 0) {
      var gpmDiff = newStats.avgGPM - oldStats.avgGPM;
      l.push("**💰 Средний GPM:**");
      l.push("• Было: " + Math.round(oldStats.avgGPM));
      l.push("• Стало: " + Math.round(newStats.avgGPM));
      l.push(this.fmtDiff("Изменение", gpmDiff, "", false));
      l.push("");
    }

    l.push("**🎯 Итог:**");
    if (wrDiff > 10) l.push("✅ Ты **растёшь** — винрейт вырос на " + wrDiff.toFixed(0) + "%.");
    else if (wrDiff < -10) l.push("⚠️ Ты **сдаёшь позиции** — винрейт упал.");
    else l.push("➖ Винрейт **стабилен**.");

    if (deathsDiff < -1) l.push("✅ Стал меньше умирать");
    else if (deathsDiff > 1) l.push("⚠️ Стал больше умирать — работай над позиционированием");

    return l.join("\n");
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("тренд") >= 0 || s.indexOf("динамик") >= 0) return "trends";
    if (s.indexOf("прогресс") >= 0 || s.indexOf("расту ли") >= 0) return "trends";
    if (s.indexOf("стал хуже") >= 0 || s.indexOf("стал лучше") >= 0) return "trends";
    if (s.indexOf("за последние") >= 0 && s.indexOf("матч") >= 0) return "trends";
    if (s.indexOf("мои последние игры") >= 0) return "trends";
    return null;
  },

  answer: function (kind) {
    if (kind !== "trends") return null;
    return this.formatReport();
  }
};

console.log("brain-trends v1.0 ready");
