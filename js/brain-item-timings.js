/* DOTA JETCH — BRAIN ITEM TIMINGS v1.0
   Сравнение таймингов покупки ключевых предметов с нормативами по позиции. */

var BrainItemTimings = {

  BENCHMARKS: {
    "Black King Bar": { 1: 28, 2: 24, 3: 22, 4: 35, 5: 40 },
    "Blink Dagger":   { 1: 22, 2: 18, 3: 14, 4: 20, 5: 25 },
    "Battle Fury":    { 1: 18, 2: 20, 3: 25, 4: 30, 5: 35 },
    "Manta Style":    { 1: 22, 2: 24, 3: 30, 4: 35, 5: 40 },
    "Aghanim's Scepter": { 1: 25, 2: 20, 3: 22, 4: 24, 5: 22 },
    "Force Staff":    { 1: 30, 2: 25, 3: 20, 4: 16, 5: 15 },
    "Glimmer Cape":   { 1: 35, 2: 30, 3: 25, 4: 18, 5: 16 },
    "Pipe of Insight":{ 1: 35, 2: 30, 3: 20, 4: 25, 5: 28 },
    "Vanguard":       { 1: 20, 2: 22, 3: 15, 4: 25, 5: 30 },
    "Radiance":       { 1: 20, 2: 22, 3: 25, 4: 30, 5: 35 },
    "Satanic":        { 1: 40, 2: 42, 3: 45, 4: 50, 5: 55 },
    "Butterfly":      { 1: 38, 2: 40, 3: 42, 4: 48, 5: 52 },
    "Scythe of Vyse": { 1: 35, 2: 30, 3: 32, 4: 28, 5: 30 },
    "Orchid Malevolence": { 1: 25, 2: 20, 3: 22, 4: 24, 5: 26 },
    "Mekansm":        { 1: 35, 2: 30, 3: 22, 4: 18, 5: 15 },
    "Guardian Greaves":{ 1: 40, 2: 35, 3: 28, 4: 22, 5: 20 },
    "Aghanim's Shard":{ 1: 22, 2: 18, 3: 15, 4: 14, 5: 12 }
  },

  getPlayerItemTimings: function (match, playerSlot) {
    if (!match || !match.players) return null;
    var p = null;
    for (var i = 0; i < match.players.length; i++) {
      if (match.players[i].player_slot === playerSlot) { p = match.players[i]; break; }
    }
    if (!p || !p.purchase_log) return null;

    var timings = {};
    for (var j = 0; j < p.purchase_log.length; j++) {
      var entry = p.purchase_log[j];
      var itemName = entry.key;
      if (!itemName) continue;
      var min = Math.floor((entry.time || 0) / 60);
      if (!timings[itemName] || min < timings[itemName]) {
        timings[itemName] = min;
      }
    }
    return timings;
  },

  compareWithBenchmarks: function (timings, position) {
    if (!timings || !position) return [];
    var results = [];
    for (var item in this.BENCHMARKS) {
      if (!this.BENCHMARKS.hasOwnProperty(item)) continue;
      if (timings[item] === undefined) continue;
      var actual = timings[item];
      var benchmark = this.BENCHMARKS[item][position];
      if (benchmark === undefined) continue;
      var diff = actual - benchmark;
      results.push({
        item: item,
        actual: actual,
        benchmark: benchmark,
        diff: diff,
        early: diff < -3,
        late: diff > 3
      });
    }
    results.sort(function (a, b) { return a.diff - b.diff; });
    return results;
  },

  formatReport: function (match, playerSlot, position) {
    var timings = this.getPlayerItemTimings(match, playerSlot);
    if (!timings) return "🤔 Нет данных о покупках (матч не распарсен).";
    if (!position) return "🤔 Не могу определить позицию — нужен анализ матча.";

    var results = this.compareWithBenchmarks(timings, position);
    if (!results.length) return "🤔 Нет ключевых предметов для сравнения.";

    var l = [];
    l.push("⏱ **Тайминги предметов** (позиция " + position + ")");
    l.push("");

    var lateCount = 0, earlyCount = 0, onTime = 0;
    for (var i = 0; i < results.length; i++) {
      var r = results[i];
      var icon = r.late ? "🔴" : (r.early ? "🟢" : "🟡");
      var diffText = r.late ? ("+" + r.diff + " мин позже") : (r.early ? (Math.abs(r.diff) + " мин раньше") : "в норме");
      l.push(icon + " **" + r.item + "**: " + r.actual + " мин (норма " + r.benchmark + ") — " + diffText);
      if (r.late) lateCount++;
      else if (r.early) earlyCount++;
      else onTime++;
    }

    l.push("");
    l.push("**Итого:** " + onTime + " в норме, " + earlyCount + " раньше, " + lateCount + " позже");
    l.push("");

    if (lateCount > 0) {
      l.push("💡 **Советы:**");
      if (lateCount >= 2) l.push("• Ты поздно собираешь ключевые предметы — фарми эффективнее");
      l.push("• Не умирай перед покупкой важного предмета — теряешь золото");
    }

    return l.join("\n");
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("тайминг") >= 0 && s.indexOf("предмет") >= 0) return "timings";
    if (s.indexOf("когда купил") >= 0) return "timings";
    if (s.indexOf("поздно") >= 0 && s.indexOf("предмет") >= 0) return "timings";
    if (s.indexOf("билд") >= 0 && s.indexOf("тайминг") >= 0) return "timings";
    if (s.indexOf("бкб") >= 0 || s.indexOf("bkb") >= 0) return "timings";
    if (s.indexOf("блинк") >= 0 && (s.indexOf("когда") >= 0 || s.indexOf("тайминг") >= 0)) return "timings";
    return null;
  },

  answer: function (kind) {
    if (kind !== "timings") return null;
    if (typeof lastAnalysis === "undefined" || !lastAnalysis || !lastAnalysis.match) return null;
    return this.formatReport(lastAnalysis.match, lastAnalysis.player.player_slot, lastAnalysis.position);
  }
};

console.log("brain-item-timings v1.0 ready");
