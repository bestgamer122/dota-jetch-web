/* DOTA JETCH — BRAIN PREDICTOR v1.0 */

var BrainPredictor = {
  getFormScore: function () {
    if (typeof BrainSharedMemory === "undefined") return null;
    var sh = BrainSharedMemory.load();
    var pl = sh.player;
    if (!pl || pl.totalMatches < 3) return null;
    var sc = 50, r = [];
    var wr = (pl.wins / pl.totalMatches) * 100;
    if (wr >= 60) { sc += 15; r.push("винрейт " + wr.toFixed(0) + "%"); }
    else if (wr >= 50) sc += 5;
    else if (wr >= 40) sc -= 5;
    else { sc -= 15; r.push("низкий винрейт " + wr.toFixed(0) + "%"); }
    var kda = pl.avgKda || 0;
    if (kda >= 4) { sc += 12; r.push("отличный KDA " + kda.toFixed(2)); }
    else if (kda >= 2.5) sc += 5;
    else if (kda < 1.5) { sc -= 12; r.push("низкий KDA"); }
    var gpm = pl.avgGpm || 0;
    if (gpm >= 550) { sc += 10; r.push("высокий GPM"); }
    else if (gpm < 350) { sc -= 10; r.push("низкий GPM"); }
    var d = pl.avgDeaths || 0;
    if (d <= 3) { sc += 8; r.push("мало смертей"); }
    else if (d >= 7) { sc -= 12; r.push("много смертей"); }
    if (pl.tiltStreak >= 3) { sc -= 20; r.push("лузстрик " + pl.tiltStreak); }
    else if (pl.tiltStreak === 0 && pl.totalMatches >= 5) sc += 5;
    sc = Math.max(0, Math.min(100, sc));
    var lb, col;
    if (sc >= 80) { lb = "Отличная форма"; col = "var(--green)"; }
    else if (sc >= 65) { lb = "Хорошая форма"; col = "var(--cyan)"; }
    else if (sc >= 45) { lb = "Средняя форма"; col = "var(--yellow)"; }
    else if (sc >= 25) { lb = "Плохая форма"; col = "var(--orange)"; }
    else { lb = "Критическая форма"; col = "var(--red)"; }
    return { score: sc, label: lb, color: col, reasons: r };
  },

  predictNextMatch: function (heroName) {
    if (typeof BrainSharedMemory === "undefined") return null;
    var sh = BrainSharedMemory.load();
    var pl = sh.player;
    if (!pl || pl.totalMatches < 3) return null;
    var form = this.getFormScore();
    if (!form) return null;
    var prob = form.score, heroInfo = null;
    if (heroName && sh.heroes[heroName]) {
      heroInfo = sh.heroes[heroName];
      var hwr = (heroInfo.wins / heroInfo.matches) * 100;
      prob = (prob + hwr) / 2;
    }
    prob = Math.max(5, Math.min(95, prob));
    var v;
    if (prob >= 65) v = "Скорее всего победа 🏆";
    else if (prob >= 50) v = "Слегка в твою пользу";
    else if (prob >= 35) v = "Слегка против тебя";
    else v = "Скорее всего поражение";
    return { probability: Math.round(prob), verdict: v, advice: this._advice(form, heroInfo, pl), form: form };
  },

  _advice: function (form, hi, pl) {
    var t = [];
    if (pl.tiltStreak >= 3) t.push("Сделай паузу 15-30 мин — лузстрик давит.");
    if (pl.avgDeaths > 6) t.push("Играй осторожнее: не фарми без вижена.");
    if (pl.avgGpm < 400) t.push("Стакай лагеря и фарми между драками.");
    if (hi && (hi.wins / Math.max(hi.matches, 1)) < 0.4) t.push("На этом герое низкий винрейт — рассмотри замену.");
    if (!t.length) t.push("Продолжай в том же духе!");
    return t;
  },

  suggestHero: function () {
    if (typeof BrainSharedMemory === "undefined") return null;
    var sh = BrainSharedMemory.load();
    var hs = sh.heroes, list = [];
    for (var n in hs) {
      if (hs.hasOwnProperty(n)) {
        var h = hs[n];
        if (h.matches >= 2) {
          var wr = h.wins / h.matches;
          var kda = h.totalKda / h.matches;
          list.push({ name: n, score: wr * 100 + kda * 10, matches: h.matches, wr: wr });
        }
      }
    }
    if (!list.length) return null;
    list.sort(function (a, b) { return b.score - a.score; });
    return list.slice(0, 3);
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("моя форма") >= 0 || s.indexOf("оцени мою форму") >= 0 || s.indexOf("как я играю") >= 0) return "form";
    if (s.indexOf("прогноз") >= 0 && (s.indexOf("матч") >= 0 || s.indexOf("игра") >= 0)) return "predict";
    if (s.indexOf("прогноз") >= 0 || s.indexOf("предскажи") >= 0) return "predict";
    if (s.indexOf("кого пикать") >= 0 || s.indexOf("кого брать") >= 0 || s.indexOf("какого героя") >= 0) return "suggest";
    if (s.indexOf("советуешь героя") >= 0 || s.indexOf("посоветуй героя") >= 0) return "suggest";
    return null;
  },

  answer: function (kind, heroName) {
    if (kind === "form") {
      var f = this.getFormScore();
      if (!f) return "📊 Мало данных. Разбери хотя бы 3 матча.";
      var l = ["📊 Твоя форма: " + f.label + " (" + f.score + "/100)", ""];
      if (f.reasons.length) {
        l.push("Что влияет:");
        for (var i = 0; i < f.reasons.length; i++) l.push("• " + f.reasons[i]);
      }
      return l.join("\n");
    }
    if (kind === "predict") {
      var p = this.predictNextMatch(heroName);
      if (!p) return "🔮 Нужно минимум 3 матча.";
      var l2 = ["🔮 Прогноз:", "", "Вероятность победы: **" + p.probability + "%**", "Вывод: " + p.verdict, "", "Форма: " + p.form.label + " (" + p.form.score + "/100)"];
      if (p.advice.length) { l2.push(""); l2.push("💡 Советы:"); for (var j = 0; j < p.advice.length; j++) l2.push("• " + p.advice[j]); }
      return l2.join("\n");
    }
    if (kind === "suggest") {
      var s = this.suggestHero();
      if (!s) return "🤔 Мало данных.";
      var l3 = ["🎯 Топ героев:", ""];
      for (var k = 0; k < s.length; k++) l3.push("**" + (k + 1) + ". " + s[k].name + "** — матчей: " + s[k].matches + ", винрейт: " + (s[k].wr * 100).toFixed(0) + "%");
      return l3.join("\n");
    }
    return null;
  }
};
