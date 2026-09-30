/* DOTA JETCH — BRAIN MMR v2.1 (расширенный detect) */

var BrainMMR = {
  positionTargets: {
    1: { name: "Керри (Pos 1)",   gpm: 620, xpm: 700, lhPerMin: 9.0, kda: 4.0, heroDmgPerMin: 700, assistsPerMin: 0.15 },
    2: { name: "Мид (Pos 2)",     gpm: 580, xpm: 720, lhPerMin: 7.5, kda: 4.0, heroDmgPerMin: 850, assistsPerMin: 0.25 },
    3: { name: "Оффлейн (Pos 3)", gpm: 480, xpm: 560, lhPerMin: 6.0, kda: 3.2, heroDmgPerMin: 750, assistsPerMin: 0.30 },
    4: { name: "Роум (Pos 4)",    gpm: 380, xpm: 480, lhPerMin: 3.5, kda: 3.0, heroDmgPerMin: 550, assistsPerMin: 0.55 },
    5: { name: "Саппорт (Pos 5)", gpm: 320, xpm: 420, lhPerMin: 2.0, kda: 2.8, heroDmgPerMin: 400, assistsPerMin: 0.70 }
  },

  predictFromLastMatch: function () {
    if (typeof lastAnalysis === "undefined" || !lastAnalysis) return null;
    return this.predictFromAnalysis(lastAnalysis);
  },

  predictFromAnalysis: function (res) {
    if (!res || !res.player || !res.match) return null;
    var p = res.player, m = res.match;
    var dm = (m.duration || 0) / 60;
    if (dm <= 0) return null;

    if (res.rankTier && res.rankTier > 0) {
      var md = Math.floor(res.rankTier / 10), st = res.rankTier % 10;
      var ns = ["Uncalibrated","Herald","Guardian","Crusader","Archon","Legend","Ancient","Divine","Immortal"];
      var rr = ns[md] || "?";
      var rm = this._rankToMmr(md, st);
      var pi = this.positionTargets[res.position] ? this.positionTargets[res.position].name : "?";
      return { source: "real", text: "📊 **Реальный ранг:**\n\n**" + rr + " " + "★".repeat(st) + "**\nПримерный MMR: **" + rm + "** (±150)\n\n🎯 Позиция: " + pi };
    }
    return this._estimate(p, dm, res);
  },

  _rankToMmr: function (md, st) {
    var b = [0, 0, 770, 1540, 2310, 3080, 3850, 4620, 5420];
    return (b[md] || 0) + st * 150;
  },

  _estimate: function (p, dm, res) {
    var pos = res.position || 1;
    var t = this.positionTargets[pos] || this.positionTargets[1];
    var pn = t.name;
    var gpm = p.gold_per_min || 0;
    var xpm = p.xp_per_min || 0;
    var lh = (p.last_hits || 0) / Math.max(dm, 1);
    var kda = (p.kills + p.assists) / Math.max(p.deaths, 1);
    var hd = (p.hero_damage || 0) / Math.max(dm, 1);
    var apm = (p.assists || 0) / Math.max(dm, 1);
    var dpn = (p.denies || 0) / Math.max(dm, 1);

    var w;
    if (pos === 1) w = { gpm: 40, lh: 25, kda: 15, hd: 15, apm: 0, dpn: 5 };
    else if (pos === 2) w = { gpm: 30, lh: 15, kda: 25, hd: 25, apm: 0, dpn: 5 };
    else if (pos === 3) w = { gpm: 25, lh: 15, kda: 30, hd: 20, apm: 5, dpn: 5 };
    else if (pos === 4) w = { gpm: 15, lh: 5, kda: 30, hd: 20, apm: 25, dpn: 5 };
    else w = { gpm: 10, lh: 0, kda: 30, hd: 15, apm: 30, dpn: 15 };

    var sg = Math.min(100, (gpm / t.gpm) * 70);
    var sx = Math.min(100, (xpm / t.xpm) * 70);
    var sl = Math.min(100, (lh / t.lhPerMin) * 70);
    var sk = Math.min(100, (kda / t.kda) * 70);
    var sh = Math.min(100, (hd / t.heroDmgPerMin) * 70);
    var sa = Math.min(100, (apm / t.assistsPerMin) * 70);
    var sd = Math.min(100, (dpn / 2.5) * 70);

    var total = 0, tw = 0;
    if (w.gpm) { total += sg * w.gpm; tw += w.gpm; }
    if (w.lh) { total += sl * w.lh; tw += w.lh; }
    if (w.kda) { total += sk * w.kda; tw += w.kda; }
    if (w.hd) { total += sh * w.hd; tw += w.hd; }
    if (w.apm) { total += sa * w.apm; tw += w.apm; }
    if (w.dpn) { total += sd * w.dpn; tw += w.dpn; }
    if (tw > 0) { var b = (sx - 50) * 0.05; total = total / tw + b; }
    else total = 50;
    total = Math.max(0, Math.min(100, total));

    var br = this._scoreToBracket(total);
    var mmr = this._scoreToMmr(total);

    var l = [];
    l.push("🎯 **Прогноз MMR**"); l.push("");
    l.push("**Позиция:** " + pn);
    l.push("**Примерный ранг:** " + br + " (" + mmr + " MMR)");
    l.push("**Уверенность:** " + Math.round(total) + "%");
    l.push("");
    l.push("**Метрики:**");
    l.push("• GPM: " + Math.round(gpm) + " (норма: " + t.gpm + ")");
    l.push("• KDA: " + kda.toFixed(2) + " (норма: " + t.kda + ")");
    if (w.lh) l.push("• LH/мин: " + lh.toFixed(1) + " (норма: " + t.lhPerMin + ")");
    if (w.apm) l.push("• Ассисты/мин: " + apm.toFixed(2) + " (норма: " + t.assistsPerMin + ")");
    if (w.dpn) l.push("• Денаи: " + (p.denies || 0));
    if (w.hd) l.push("• Урон/мин: " + Math.round(hd) + " (норма: " + t.heroDmgPerMin + ")");
    l.push("");
    l.push("⚠️ Оценка по одному матчу — точность ±500 MMR.");
    return { source: "estimated", text: l.join("\n") };
  },

  _scoreToBracket: function (s) {
    if (s >= 92) return "Immortal";
    if (s >= 82) return "Divine";
    if (s >= 72) return "Ancient";
    if (s >= 60) return "Legend";
    if (s >= 47) return "Archon";
    if (s >= 33) return "Crusader";
    if (s >= 18) return "Guardian";
    return "Herald";
  },

  _scoreToMmr: function (s) {
    if (s >= 92) return Math.round(5420 + (s - 92) * 100);
    if (s >= 82) return Math.round(4620 + (s - 82) * 80);
    if (s >= 72) return Math.round(3850 + (s - 72) * 77);
    if (s >= 60) return Math.round(3080 + (s - 60) * 64);
    if (s >= 47) return Math.round(2310 + (s - 47) * 59);
    if (s >= 33) return Math.round(1540 + (s - 33) * 55);
    if (s >= 18) return Math.round(770 + (s - 18) * 51);
    return Math.round(s * 43);
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase().trim();
    /* Прямые запросы про MMR */
    if (s.indexOf("ммр") >= 0 || s.indexOf("рейтинг") >= 0 || s.indexOf("птс") >= 0) {
      /* Ключевые фразы */
      if (s.indexOf("угадай") >= 0) return "predict";
      if (s.indexOf("предскажи") >= 0) return "predict";
      if (s.indexOf("определи") >= 0) return "predict";
      if (s.indexOf("какой") >= 0) return "predict";
      if (s.indexOf("мой") >= 0) return "predict";
      if (s.indexOf("по игре") >= 0) return "predict";
      if (s.indexOf("по матчу") >= 0) return "predict";
      if (s.indexOf("по последнему") >= 0) return "predict";
      if (s.indexOf("у меня") >= 0) return "predict";
      if (s.indexOf("сколько") >= 0) return "predict";
      /* Если есть только слово ммр — тоже показываем прогноз */
      if (s.length < 40) return "predict";
    }
    if (s.indexOf("ранг") >= 0 || s.indexOf("медаль") >= 0) {
      if (s.indexOf("мой") >= 0 || s.indexOf("какой") >= 0 || s.indexOf("угадай") >= 0 || s.indexOf("определи") >= 0) return "predict";
    }
    return null;
  },

  answer: function (kind) {
    if (kind === "predict") {
      var r = this.predictFromLastMatch();
      if (!r) return "🤔 Нет данных последнего матча. Разбери матч на вкладке **«Анализ матча»** — потом спрашивай.";
      return r.text;
    }
    return null;
  }
};
