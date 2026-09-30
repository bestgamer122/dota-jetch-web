/* DOTA JETCH — BRAIN COMPARE v1.0 */

var BrainCompare = {
  stats: {
    "Anti-Mage":{damage:7,survivability:6,difficulty:4,farmSpeed:10,teamFight:5,mobility:9,laneStage:4,lateGame:9},
    "Axe":{damage:6,survivability:9,difficulty:3,farmSpeed:6,teamFight:9,mobility:4,laneStage:7,lateGame:6},
    "Bane":{damage:4,survivability:5,difficulty:4,farmSpeed:2,teamFight:7,mobility:3,laneStage:6,lateGame:5},
    "Bloodseeker":{damage:7,survivability:6,difficulty:3,farmSpeed:7,teamFight:6,mobility:6,laneStage:6,lateGame:6},
    "Bristleback":{damage:6,survivability:10,difficulty:2,farmSpeed:6,teamFight:8,mobility:3,laneStage:8,lateGame:5},
    "Crystal Maiden":{damage:5,survivability:3,difficulty:2,farmSpeed:2,teamFight:7,mobility:1,laneStage:5,lateGame:4},
    "Doom":{damage:7,survivability:8,difficulty:3,farmSpeed:6,teamFight:8,mobility:3,laneStage:6,lateGame:7},
    "Drow Ranger":{damage:9,survivability:4,difficulty:3,farmSpeed:8,teamFight:6,mobility:3,laneStage:5,lateGame:9},
    "Faceless Void":{damage:8,survivability:6,difficulty:6,farmSpeed:7,teamFight:10,mobility:6,laneStage:5,lateGame:10},
    "Invoker":{damage:9,survivability:5,difficulty:10,farmSpeed:6,teamFight:9,mobility:6,laneStage:6,lateGame:9},
    "Juggernaut":{damage:8,survivability:6,difficulty:2,farmSpeed:8,teamFight:7,mobility:6,laneStage:7,lateGame:8},
    "Legion Commander":{damage:6,survivability:7,difficulty:4,farmSpeed:5,teamFight:8,mobility:4,laneStage:7,lateGame:7},
    "Lina":{damage:9,survivability:4,difficulty:4,farmSpeed:6,teamFight:7,mobility:3,laneStage:6,lateGame:7},
    "Lion":{damage:7,survivability:4,difficulty:2,farmSpeed:3,teamFight:8,mobility:2,laneStage:5,lateGame:6},
    "Medusa":{damage:8,survivability:10,difficulty:4,farmSpeed:8,teamFight:8,mobility:2,laneStage:3,lateGame:10},
    "Meepo":{damage:9,survivability:4,difficulty:10,farmSpeed:10,teamFight:6,mobility:8,laneStage:5,lateGame:7},
    "Morphling":{damage:8,survivability:8,difficulty:8,farmSpeed:8,teamFight:7,mobility:10,laneStage:4,lateGame:9},
    "Naga Siren":{damage:6,survivability:7,difficulty:7,farmSpeed:10,teamFight:8,mobility:5,laneStage:4,lateGame:9},
    "Phantom Assassin":{damage:9,survivability:5,difficulty:3,farmSpeed:8,teamFight:6,mobility:7,laneStage:4,lateGame:9},
    "Phantom Lancer":{damage:8,survivability:6,difficulty:6,farmSpeed:9,teamFight:6,mobility:7,laneStage:5,lateGame:9},
    "Pudge":{damage:6,survivability:8,difficulty:5,farmSpeed:4,teamFight:8,mobility:5,laneStage:5,lateGame:6},
    "Queen of Pain":{damage:8,survivability:5,difficulty:5,farmSpeed:6,teamFight:7,mobility:9,laneStage:7,lateGame:6},
    "Shadow Fiend":{damage:9,survivability:5,difficulty:6,farmSpeed:8,teamFight:7,mobility:4,laneStage:7,lateGame:7},
    "Slark":{damage:7,survivability:7,difficulty:5,farmSpeed:6,teamFight:6,mobility:9,laneStage:5,lateGame:8},
    "Sniper":{damage:8,survivability:3,difficulty:2,farmSpeed:8,teamFight:6,mobility:2,laneStage:6,lateGame:9},
    "Storm Spirit":{damage:8,survivability:6,difficulty:7,farmSpeed:7,teamFight:8,mobility:10,laneStage:7,lateGame:8},
    "Sven":{damage:10,survivability:7,difficulty:3,farmSpeed:8,teamFight:8,mobility:4,laneStage:5,lateGame:9},
    "Templar Assassin":{damage:8,survivability:5,difficulty:5,farmSpeed:8,teamFight:6,mobility:4,laneStage:7,lateGame:7},
    "Tidehunter":{damage:5,survivability:10,difficulty:3,farmSpeed:5,teamFight:10,mobility:4,laneStage:6,lateGame:7},
    "Timbersaw":{damage:7,survivability:9,difficulty:6,farmSpeed:7,teamFight:8,mobility:6,laneStage:6,lateGame:6},
    "Tinker":{damage:9,survivability:4,difficulty:7,farmSpeed:7,teamFight:7,mobility:5,laneStage:5,lateGame:8},
    "Ursa":{damage:9,survivability:6,difficulty:3,farmSpeed:7,teamFight:6,mobility:4,laneStage:7,lateGame:6},
    "Wraith King":{damage:7,survivability:9,difficulty:1,farmSpeed:7,teamFight:7,mobility:3,laneStage:7,lateGame:8},
    "Zeus":{damage:9,survivability:3,difficulty:3,farmSpeed:5,teamFight:8,mobility:2,laneStage:6,lateGame:7}
  },

  getStats: function (hn) {
    if (!hn) return null;
    if (this.stats[hn]) return this.stats[hn];
    if (typeof findHeroByAlias === "function") {
      var f = findHeroByAlias(hn);
      if (f && this.stats[f]) return this.stats[f];
    }
    return null;
  },

  compare: function (a, b) {
    var sa = this.getStats(a), sb = this.getStats(b);
    if (!sa || !sb) return "🎯 Нет данных для **" + (!sa ? a : b) + "**.";
    var l = ["⚖ **" + a + " vs " + b + "**", ""];
    var p = [
      { k: "damage", n: "Урон" }, { k: "survivability", n: "Выживаемость" },
      { k: "difficulty", n: "Сложность" }, { k: "farmSpeed", n: "Фарм" },
      { k: "teamFight", n: "Влияние в драках" }, { k: "mobility", n: "Мобильность" },
      { k: "laneStage", n: "Сила на линии" }, { k: "lateGame", n: "Сила в лейте" }
    ];
    var ta = 0, tb = 0;
    for (var i = 0; i < p.length; i++) {
      var va = sa[p[i].k] || 0, vb = sb[p[i].k] || 0;
      var w = va > vb ? "🟢 " + a : (vb > va ? "🟢 " + b : "⚪ =");
      l.push("**" + p[i].n + ":** " + va + " vs " + vb + " — " + w);
      ta += va; tb += vb;
    }
    l.push("");
    var oa = Math.round(ta / p.length * 10);
    var ob = Math.round(tb / p.length * 10);
    l.push("**Итог:**");
    l.push("• " + a + ": **" + oa + "/100**");
    l.push("• " + b + ": **" + ob + "/100**");
    l.push("");
    if (oa > ob + 5) l.push("🏆 **" + a + " сильнее**.");
    else if (ob > oa + 5) l.push("🏆 **" + b + " сильнее**.");
    else l.push("⚖ Герои примерно равны.");
    return l.join("\n");
  },

  recommend: function (style) {
    var map = {
      "агрессивный": { damage: 8, survivability: 6, difficulty: 4, mobility: 7, teamFight: 7 },
      "осторожный": { damage: 7, survivability: 8, difficulty: 3, mobility: 5, teamFight: 6 },
      "фарм": { farmSpeed: 9, lateGame: 9, damage: 8, survivability: 6 },
      "мид": { damage: 8, teamFight: 7, mobility: 6, difficulty: 5 },
      "поддержка": { teamFight: 8, damage: 5, survivability: 5, difficulty: 3 },
      "инициация": { teamFight: 10, survivability: 8, mobility: 5, damage: 6 },
      "керри": { farmSpeed: 9, lateGame: 9, damage: 8, survivability: 6 },
      "новичок": { difficulty: 2, survivability: 7, damage: 6 }
    };
    var t = map[style.toLowerCase()];
    if (!t) return null;
    var scores = [];
    for (var h in this.stats) {
      if (!this.stats.hasOwnProperty(h)) continue;
      var s = this.stats[h], sc = 0, c = 0;
      for (var k in t) {
        if (t.hasOwnProperty(k) && s[k] !== undefined) {
          if (k === "difficulty") sc += (10 - Math.abs(s[k] - t[k])) * 1.5;
          else sc += s[k] * (t[k] / 10);
          c++;
        }
      }
      if (c > 0) scores.push({ hero: h, score: sc / c });
    }
    scores.sort(function (a, b) { return b.score - a.score; });
    return scores.slice(0, 5);
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("сравни") >= 0) return "compare";
    if (s.indexOf("кто сильнее") >= 0) return "compare";
    if (s.indexOf("vs") >= 0 && s.length < 50) return "compare";
    if (s.indexOf("против") >= 0 && s.indexOf("кто") >= 0) return "compare";
    if (s.indexOf("посоветуй героя") >= 0 || s.indexOf("какой герой под") >= 0) return "recommend";
    if (s.indexOf("герой под стиль") >= 0) return "recommend";
    return null;
  },

  answer: function (kind, q) {
    if (kind === "compare") {
      var a = null, b = null;
      if (typeof findHeroByAlias === "function") {
        var w = q.toLowerCase().split(/[\s,?]+/);
        for (var i = 0; i < w.length; i++) {
          var c = w[i].replace(/[^а-яёa-z\-]/g, "");
          if (c.length < 3) continue;
          var h = findHeroByAlias(c);
          if (h) { if (!a) a = h; else if (!b && h !== a) { b = h; break; } }
        }
      }
      if (!a || !b) return "⚖ Назови двух героев — например, «сравни пуджа и инвокера».";
      return this.compare(a, b);
    }
    if (kind === "recommend") {
      var st = null, sts = ["агрессивный","осторожный","фарм","мид","поддержка","инициация","керри","новичок"];
      for (var j = 0; j < sts.length; j++) if (q.toLowerCase().indexOf(sts[j]) >= 0) { st = sts[j]; break; }
      if (!st) return "🎯 Расскажи про свой стиль. Например: «посоветуй героя для агрессивного стиля».";
      var r = this.recommend(st);
      if (!r) return "🎯 Не нашёл героев.";
      var l = ["🎯 **Топ под стиль: " + st + "**", ""];
      for (var k = 0; k < r.length; k++) l.push((k + 1) + ". **" + r[k].hero + "** — " + Math.round(r[k].score * 10) + "/100");
      return l.join("\n");
    }
    return null;
  }
};
