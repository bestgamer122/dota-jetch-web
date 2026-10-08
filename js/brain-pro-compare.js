/* DOTA JETCH — BRAIN PRO COMPARE v1.0
   Сравнение метрик игрока с про-уровнем (топ-10% по OpenDota benchmarks). */

var BrainProCompare = {

  METRICS: [
    { key: "gold_per_min",  name: "GPM",           bench: "gold_per_min" },
    { key: "xp_per_min",    name: "XPM",           bench: "xp_per_min" },
    { key: "last_hits",     name: "Ластхиты",      bench: "last_hits" },
    { key: "denies",        name: "Денаи",         bench: "denies" },
    { key: "hero_damage",   name: "Урон героям",   bench: "hero_damage" },
    { key: "tower_damage",  name: "Урон строениям", bench: "tower_damage" }
  ],

  getBenchValue: function (bench, key, targetPct) {
    if (!bench || !bench[key] || !Array.isArray(bench[key])) return null;
    var arr = bench[key].slice().sort(function (a, b) { return (a.percentile || 0) - (b.percentile || 0); });
    if (!arr.length) return null;
    var target = targetPct || 0.9;
    var best = arr[arr.length - 1];
    for (var i = 0; i < arr.length; i++) {
      if ((arr[i].percentile || 0) >= target) return arr[i].value || 0;
    }
    return best.value || 0;
  },

  formatReport: function (res) {
    if (!res) return "🤔 Нет данных последнего матча. Сначала разбери матч.";
    if (!res.bench) return "🤔 OpenDota не вернула benchmarks для этого героя.";

    var heroName = res.hero ? res.hero.name : "героя";
    var p = res.player;

    var l = [];
    l.push("🏆 **Сравнение с топ-игроками: " + heroName + "**");
    l.push("");
    l.push("_Сравниваю твои метрики с топ-10% игроков._");
    l.push("");

    var table = [];
    for (var i = 0; i < this.METRICS.length; i++) {
      var m = this.METRICS[i];
      var yourValue = p[m.key];
      if (yourValue === undefined || yourValue === null) continue;
      var proValue = this.getBenchValue(res.bench, m.bench, 0.9);
      if (proValue === null) continue;

      var diff = yourValue - proValue;
      var pct = proValue > 0 ? (yourValue / proValue) * 100 : 0;
      table.push({
        metric: m.name,
        yours: Math.round(yourValue),
        pro: Math.round(proValue),
        diff: diff,
        pct: Math.round(pct)
      });
    }

    if (!table.length) return "🤔 Не удалось сравнить метрики.";

    table.sort(function (a, b) { return a.pct - b.pct; });

    var totalGap = 0;
    for (var j = 0; j < table.length; j++) {
      var t = table[j];
      var icon = t.pct >= 95 ? "🟢" : (t.pct >= 80 ? "🟡" : (t.pct >= 60 ? "🟠" : "🔴"));
      var sign = t.diff > 0 ? "+" : "";
      l.push(icon + " **" + t.metric + ":**");
      l.push("• Ты: **" + t.yours + "**");
      l.push("• Топ-10%: **" + t.pro + "**");
      l.push("• Разрыв: " + sign + t.diff + " (" + t.pct + "% от нормы)");
      l.push("");
      totalGap += (100 - t.pct);
    }

    var avgGap = Math.round(totalGap / table.length);
    l.push("**🎯 Общая оценка:**");
    if (avgGap <= 10) l.push("✅ Ты **на уровне топ-игроков**!");
    else if (avgGap <= 25) l.push("💪 Ты **близко к топу** — разрыв " + avgGap + "%.");
    else if (avgGap <= 50) l.push("📈 Средний уровень. Разрыв " + avgGap + "%.");
    else l.push("⚠️ Большой разрыв (" + avgGap + "%).");

    l.push("");
    l.push("💡 **Совет:** самое слабое место — **" + table[0].metric + "**.");

    return l.join("\n");
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("топ-игрок") >= 0 || s.indexOf("топ игрок") >= 0) return "pro";
    if (s.indexOf("про-игрок") >= 0 || s.indexOf("про игрок") >= 0) return "pro";
    if (s.indexOf("сравни с про") >= 0 || s.indexOf("что бы сделал про") >= 0) return "pro";
    if (s.indexOf("как играют топы") >= 0) return "pro";
    if (s.indexOf("уровень топа") >= 0) return "pro";
    if (s.indexOf("миракл") >= 0 || s.indexOf("dendi") >= 0 || s.indexOf("ana") >= 0 || s.indexOf("topson") >= 0) return "pro";
    return null;
  },

  answer: function (kind) {
    if (kind !== "pro") return null;
    if (typeof lastAnalysis === "undefined" || !lastAnalysis) return null;
    return this.formatReport(lastAnalysis);
  }
};

console.log("brain-pro-compare v1.0 ready");
