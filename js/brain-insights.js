/* DOTA JETCH — BRAIN INSIGHTS v1.0 */

var BrainInsights = {
  key: "brain_insights",

  load: function () {
    var raw = Store.get(this.key, null);
    if (!raw || typeof raw !== "object") raw = { matchLog: [], insights: [] };
    if (!Array.isArray(raw.matchLog)) raw.matchLog = [];
    if (!Array.isArray(raw.insights)) raw.insights = [];
    return raw;
  },

  save: function (d) {
    if (d.matchLog.length > 100) d.matchLog = d.matchLog.slice(-100);
    if (d.insights.length > 30) d.insights = d.insights.slice(0, 30);
    Store.set(this.key, d);
  },

  recordMatch: function (a) {
    if (!a || !a.match || !a.player) return;
    var d = this.load();
    var p = a.player, m = a.match;
    var dm = (m.duration || 0) / 60;
    var dbp = { early: 0, mid: 0, late: 0 };
    var td = p.deaths || 0;
    if (dm > 0) {
      dbp.early = Math.floor(td * 0.25);
      dbp.mid = Math.floor(td * 0.5);
      dbp.late = td - dbp.early - dbp.mid;
    }
    d.matchLog.push({
      hero: a.hero ? a.hero.name : "?", won: !!a.won,
      kills: p.kills || 0, deaths: p.deaths || 0, assists: p.assists || 0,
      gpm: p.gold_per_min || 0, xpm: p.xp_per_min || 0,
      durMin: dm, deathsByPhase: dbp, ts: Date.now()
    });
    this._gen(d);
    this.save(d);
  },

  _gen: function (d) {
    var log = d.matchLog;
    if (log.length < 5) return;
    var ins = [];
    var wins = 0;
    for (var i = 0; i < log.length; i++) if (log[i].won) wins++;
    var wr = (wins / log.length) * 100;
    if (wr >= 60) ins.push({ text: "Винрейт " + wr.toFixed(0) + "% на последних " + log.length + " матчах — отличная стабильность.", type: "positive" });
    else if (wr < 40) ins.push({ text: "Винрейт " + wr.toFixed(0) + "% — низковато.", type: "warning" });

    var hs = {};
    for (var j = 0; j < log.length; j++) {
      var h = log[j].hero;
      if (!hs[h]) hs[h] = { matches: 0, wins: 0 };
      hs[h].matches++;
      if (log[j].won) hs[h].wins++;
    }
    var bh = null, bw = 0, wh = null, ww = 1;
    for (var n in hs) {
      if (hs[n].matches >= 3) {
        var w = hs[n].wins / hs[n].matches;
        if (w > bw) { bw = w; bh = n; }
        if (w < ww) { ww = w; wh = n; }
      }
    }
    if (bh && bw >= 0.6) ins.push({ text: "Лучший герой — " + bh + " (" + (bw * 100).toFixed(0) + "% винрейт).", type: "positive" });
    if (wh && ww <= 0.35) ins.push({ text: "На " + wh + " винрейт " + (ww * 100).toFixed(0) + "% — рассмотри замену.", type: "warning" });

    var te = 0, tm = 0, tl = 0;
    for (var k = 0; k < log.length; k++) {
      te += log[k].deathsByPhase.early || 0;
      tm += log[k].deathsByPhase.mid || 0;
      tl += log[k].deathsByPhase.late || 0;
    }
    var mp = "mid", md = tm;
    if (te > md) { mp = "early"; md = te; }
    if (tl > md) { mp = "late"; md = tl; }
    if (md >= log.length * 2) {
      var pt = mp === "early" ? "в ранней игре (0-15 мин)" : mp === "mid" ? "в середине (15-30 мин)" : "в лейте (30+ мин)";
      ins.push({ text: "Ты чаще умираешь " + pt + ".", type: "info" });
    }

    var tg = 0;
    for (var g = 0; g < log.length; g++) tg += log[g].gpm;
    var ag = tg / log.length;
    if (ag < 350) ins.push({ text: "Средний GPM " + ag.toFixed(0) + " — ниже нормы.", type: "warning" });
    else if (ag > 550) ins.push({ text: "Средний GPM " + ag.toFixed(0) + " — отличный фарм.", type: "positive" });

    var tk = 0;
    for (var c = 0; c < log.length; c++) {
      var l = log[c];
      tk += (l.kills + l.assists) / Math.max(l.deaths, 1);
    }
    var ak = tk / log.length;
    if (ak < 2) ins.push({ text: "Средний KDA " + ak.toFixed(2) + " — старайся чаще ассистить.", type: "warning" });
    else if (ak >= 4) ins.push({ text: "Средний KDA " + ak.toFixed(2) + " — отличная эффективность.", type: "positive" });

    for (var s = 0; s < ins.length; s++) {
      ins[s].ts = Date.now();
      ins[s].importance = ins[s].type === "warning" ? 3 : ins[s].type === "positive" ? 2 : 1;
    }
    ins.sort(function (a, b) { return b.importance - a.importance; });
    d.insights = ins.slice(0, 10);
  },

  getTop: function (l) { return this.load().insights.slice(0, l || 5); },

  formatReport: function () {
    var d = this.load();
    if (!d.matchLog.length) return "🔍 Разбери несколько матчей — дам анализ.";
    var ins = this.getTop(6);
    if (!ins.length) return "🔍 Разобрано " + d.matchLog.length + " матчей, но пока мало данных.";
    var l = ["🔬 Долгосрочный анализ (" + d.matchLog.length + " матчей):", ""];
    for (var i = 0; i < ins.length; i++) {
      var ic = ins[i].type === "warning" ? "⚠️" : ins[i].type === "positive" ? "✅" : "ℹ️";
      l.push(ic + " " + ins[i].text);
      if (i < ins.length - 1) l.push("");
    }
    return l.join("\n");
  },

  compareWithPrevious: function () {
    var d = this.load();
    var log = d.matchLog;
    if (log.length < 10) return null;
    var half = Math.floor(log.length / 2);
    var f = log.slice(0, half), s = log.slice(half);
    var w1 = 0, w2 = 0;
    for (var i = 0; i < f.length; i++) if (f[i].won) w1++;
    for (var j = 0; j < s.length; j++) if (s[j].won) w2++;
    w1 = (w1 / f.length) * 100;
    w2 = (w2 / s.length) * 100;
    var l = ["📈 Сравнение прогресса:", ""];
    var df = w2 - w1;
    if (df > 10) l.push("✅ Винрейт вырос с " + w1.toFixed(0) + "% до " + w2.toFixed(0) + "% (+" + df.toFixed(0) + "%).");
    else if (df < -10) l.push("⚠️ Винрейт упал с " + w1.toFixed(0) + "% до " + w2.toFixed(0) + "%.");
    else l.push("➖ Винрейт стабильный: " + w1.toFixed(0) + "% → " + w2.toFixed(0) + "%.");
    var g1 = 0, g2 = 0;
    for (var a = 0; a < f.length; a++) g1 += f[a].gpm;
    for (var b = 0; b < s.length; b++) g2 += s[b].gpm;
    g1 /= f.length; g2 /= s.length;
    if (Math.abs(g2 - g1) > 40) {
      l.push("");
      if (g2 > g1) l.push("💰 GPM вырос: " + g1.toFixed(0) + " → " + g2.toFixed(0));
      else l.push("📉 GPM упал: " + g1.toFixed(0) + " → " + g2.toFixed(0));
    }
    return l.join("\n");
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("анализ всех матчей") >= 0 || s.indexOf("разбор всех игр") >= 0) return "report";
    if (s.indexOf("долгосрочн") >= 0 || s.indexOf("глобальн") >= 0) return "report";
    if (s.indexOf("мой прогресс") >= 0 || s.indexOf("как я улучшил") >= 0) return "progress";
    if (s.indexOf("мои ошибки") >= 0 || s.indexOf("что я делаю не так") >= 0) return "report";
    return null;
  },

  answer: function (kind) {
    if (kind === "report") return this.formatReport();
    if (kind === "progress") {
      var c = this.compareWithPrevious();
      if (!c) return "📈 Нужно минимум 10 матчей.";
      return c;
    }
    return null;
  },

  clear: function () { Store.set(this.key, null); }
};
