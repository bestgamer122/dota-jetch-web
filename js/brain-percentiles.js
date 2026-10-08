/* DOTA JETCH — BRAIN PERCENTILES v1.0
   Сравнение метрик игрока с процентилями OpenDota benchmarks. */

var BrainPercentiles = {

  METRICS: [
    { key: "gold_per_min",    name: "GPM",              bench: "gold_per_min" },
    { key: "xp_per_min",      name: "XPM",              bench: "xp_per_min" },
    { key: "last_hits",       name: "Ластхиты",         bench: "last_hits" },
    { key: "denies",          name: "Денаи",            bench: "denies" },
    { key: "kills",           name: "Убийства",         bench: "kills" },
    { key: "deaths",          name: "Смерти",           bench: "deaths", invert: true },
    { key: "assists",         name: "Ассисты",          bench: "assists" },
    { key: "hero_damage",     name: "Урон героям",      bench: "hero_damage" },
    { key: "tower_damage",    name: "Урон строениям",   bench: "tower_damage" },
    { key: "hero_healing",    name: "Хил",              bench: "hero_healing" }
  ],

  grade: function (pct) {
    if (pct === null || pct === undefined) return "?";
    if (pct >= 90) return "S";
    if (pct >= 75) return "A";
    if (pct >= 50) return "B";
    if (pct >= 25) return "C";
    return "D";
  },

  color: function (pct) {
    if (pct === null || pct === undefined) return "var(--text-dim)";
    if (pct >= 75) return "var(--green)";
    if (pct >= 50) return "var(--yellow)";
    if (pct >= 25) return "var(--orange)";
    return "var(--red)";
  },

  getAll: function (res) {
    if (!res || !res.bench || !res.player) return null;
    var p = res.player;
    var bench = res.bench;
    var out = [];
    for (var i = 0; i < this.METRICS.length; i++) {
      var m = this.METRICS[i];
      var value = p[m.key];
      if (value === undefined || value === null) continue;
      var pct = null;
      try {
        if (typeof percentileOf === "function") {
          pct = percentileOf(bench, m.bench, value);
        }
      } catch (e) {}
      if (pct === null || pct === undefined) continue;
      if (m.invert) pct = 100 - pct;
      pct = Math.max(0, Math.min(100, pct));
      out.push({
        metric: m.name,
        value: m.invert ? value : Math.round(value),
        percentile: Math.round(pct),
        grade: this.grade(pct)
      });
    }
    return out;
  },

  getOverall: function (res) {
    var all = this.getAll(res);
    if (!all || !all.length) return null;
    var sum = 0;
    for (var i = 0; i < all.length; i++) sum += all[i].percentile;
    return Math.round(sum / all.length);
  },

  formatReport: function (res) {
    if (!res) return "🤔 Нет данных последнего матча. Сначала разбери матч.";
    if (!res.bench) return "🤔 OpenDota не вернула benchmarks для этого героя.";

    var all = this.getAll(res);
    if (!all || !all.length) return "🤔 Не удалось посчитать процентили.";

    var heroName = res.hero ? res.hero.name : "героя";
    var overall = this.getOverall(res);
    var overallGrade = this.grade(overall);

    var l = [];
    l.push("📊 **Процентили на " + heroName + "**");
    l.push("");
    l.push("**Общая оценка:** " + overallGrade + " (" + overall + "/100)");
    l.push("");
    l.push("**По метрикам:**");
    for (var i = 0; i < all.length; i++) {
      var m = all[i];
      var icon = m.percentile >= 75 ? "🟢" : (m.percentile >= 50 ? "🟡" : (m.percentile >= 25 ? "🟠" : "🔴"));
      l.push(icon + " **" + m.metric + ":** " + m.value + " — топ-" + (100 - m.percentile) + "% (" + m.grade + ")");
    }
    l.push("");

    var weak = all.filter(function (x) { return x.percentile < 25; });
    var strong = all.filter(function (x) { return x.percentile >= 75; });

    if (strong.length) {
      l.push("✅ **Твои сильные стороны:**");
      for (var s = 0; s < strong.length; s++) l.push("• " + strong[s].metric + " (" + strong[s].grade + ")");
      l.push("");
    }

    if (weak.length) {
      l.push("⚠️ **Слабые места:**");
      for (var w = 0; w < weak.length; w++) l.push("• " + weak[w].metric + " (" + weak[w].grade + ") — ниже 75% игроков");
      l.push("");
      l.push("💡 Работай над: " + weak[0].metric);
    }

    return l.join("\n");
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("процентиль") >= 0 || s.indexOf("перцентиль") >= 0) return "percentile";
    if (s.indexOf("топ-") >= 0 || s.indexOf("топ %") >= 0) return "percentile";
    if (s.indexOf("сравни с другими") >= 0) return "percentile";
    if (s.indexOf("как я на фоне") >= 0) return "percentile";
    if (s.indexOf("моя оценка") >= 0) return "percentile";
    if (s.indexOf("я в топ") >= 0) return "percentile";
    return null;
  },

  answer: function (kind) {
    if (kind !== "percentile") return null;
    if (typeof lastAnalysis === "undefined" || !lastAnalysis) return null;
    return this.formatReport(lastAnalysis);
  }
};

console.log("brain-percentiles v1.0 ready");
