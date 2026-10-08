/* DOTA JETCH — BRAIN DEATH PATTERNS v1.0
   Анализ смертей: фазы, убийцы, паттерны, советы. */

var BrainDeathPatterns = {

  analyze: function (match, playerSlot) {
    if (!match || !match.players) return null;
    var p = null;
    for (var i = 0; i < match.players.length; i++) {
      if (match.players[i].player_slot === playerSlot) { p = match.players[i]; break; }
    }
    if (!p) return null;

    var deathsLog = p.deaths_log || [];
    if (!deathsLog.length) return null;

    var durMin = (match.duration || 0) / 60;
    var phases = { early: [], mid: [], late: [] };
    var killerCounts = {};
    var totalGoldLost = 0;
    var totalTimeDead = 0;

    for (var j = 0; j < deathsLog.length; j++) {
      var d = deathsLog[j];
      var min = (d.time || 0) / 60;
      var phase = min < 10 ? "early" : (min < 25 ? "mid" : "late");
      phases[phase].push(d);
      var k = (d.key || "unknown").replace("npc_dota_hero_", "").replace(/_/g, " ");
      killerCounts[k] = (killerCounts[k] || 0) + 1;
      totalGoldLost += (d.gold_lost || 0);
      totalTimeDead += (d.time_dead || 0);
    }

    var topKillers = [];
    for (var kk in killerCounts) {
      if (killerCounts.hasOwnProperty(kk)) {
        topKillers.push({ hero: kk, count: killerCounts[kk] });
      }
    }
    topKillers.sort(function (a, b) { return b.count - a.count; });

    return {
      total: deathsLog.length,
      phases: phases,
      topKillers: topKillers.slice(0, 5),
      totalGoldLost: totalGoldLost,
      totalTimeDead: totalTimeDead,
      avgTimeBetweenDeaths: deathsLog.length > 1 ? durMin / deathsLog.length : durMin,
      durMin: durMin
    };
  },

  formatReport: function (match, playerSlot) {
    var a = this.analyze(match, playerSlot);
    if (!a) return "🤔 Нет данных о смертях (матч не распарсен или смертей не было).";

    var l = [];
    l.push("💀 **Анализ смертей**");
    l.push("");
    l.push("Всего смертей: **" + a.total + "**");
    l.push("Потеряно золота: **" + a.totalGoldLost.toLocaleString() + "**");
    l.push("Время в таверне: **" + Math.round(a.totalTimeDead) + " сек** (" + Math.round(a.totalTimeDead / 60) + " мин)");
    l.push("");

    var phaseNames = { early: "0-10 мин", mid: "10-25 мин", late: "25+ мин" };
    var maxPhase = "early", maxCount = a.phases.early.length;
    if (a.phases.mid.length > maxCount) { maxPhase = "mid"; maxCount = a.phases.mid.length; }
    if (a.phases.late.length > maxCount) { maxPhase = "late"; maxCount = a.phases.late.length; }

    l.push("**📊 По фазам:**");
    l.push("• 0-10 мин: " + a.phases.early.length + " смертей");
    l.push("• 10-25 мин: " + a.phases.mid.length + " смертей");
    l.push("• 25+ мин: " + a.phases.late.length + " смертей");
    l.push("");
    l.push("⚠️ Чаще всего умираешь **" + phaseNames[maxPhase] + "** (" + maxCount + " раз)");
    l.push("");

    if (a.topKillers.length) {
      l.push("**🎯 Кто тебя убивает чаще всего:**");
      for (var i = 0; i < Math.min(a.topKillers.length, 3); i++) {
        l.push("• " + a.topKillers[i].hero + " — " + a.topKillers[i].count + " раз");
      }
      l.push("");
    }

    l.push("💡 **Что делать:**");
    if (maxPhase === "early") {
      l.push("• Ты часто умираешь на линии — играй осторожнее");
      l.push("• Держи TP на готове, следи за миникартой");
    } else if (maxPhase === "mid") {
      l.push("• Ты умираешь в середине игры — не фарми без вижена");
      l.push("• После 2 смертей подряд отойди в лес на 1-2 минуты");
    } else {
      l.push("• Ты умираешь в лейте — не ходи один, играй с командой");
      l.push("• Купи BKB или Linken's Sphere");
    }
    if (a.totalGoldLost > 3000) l.push("• Ты теряешь много золота на смертях — играй безопаснее");
    if (a.avgTimeBetweenDeaths < 3 && a.total > 5) l.push("• Смерти слишком частые — смени тактику");

    return l.join("\n");
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("почему я умираю") >= 0) return "deaths";
    if (s.indexOf("как не умирать") >= 0) return "deaths";
    if (s.indexOf("анализ смертей") >= 0) return "deaths";
    if (s.indexOf("где я умираю") >= 0) return "deaths";
    if (s.indexOf("кто меня убивает") >= 0) return "deaths";
    if (s.indexOf("смерти") >= 0 && (s.indexOf("много") >= 0 || s.indexOf("анализ") >= 0)) return "deaths";
    return null;
  },

  answer: function (kind) {
    if (kind !== "deaths") return null;
    if (typeof lastAnalysis === "undefined" || !lastAnalysis || !lastAnalysis.match) return null;
    return this.formatReport(lastAnalysis.match, lastAnalysis.player.player_slot);
  }
};

console.log("brain-death-patterns v1.0 ready");
