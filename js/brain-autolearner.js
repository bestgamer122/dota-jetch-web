/* DOTA JETCH — BRAIN AUTO LEARNER v1.0 */

var BrainAutoLearner = {
  key: "brain_autolearner",

  load: function () {
    var raw = Store.get(this.key, null);
    if (!raw || typeof raw !== "object") {
      raw = { intents: {}, questions: [], weakSpots: [], strengths: [], totalAnswered: 0, totalCorrect: 0, totalWrong: 0, accuracy: 0.0, firstSeen: Date.now() };
    }
    if (!raw.intents) raw.intents = {};
    if (!Array.isArray(raw.questions)) raw.questions = [];
    if (!Array.isArray(raw.weakSpots)) raw.weakSpots = [];
    if (!Array.isArray(raw.strengths)) raw.strengths = [];
    return raw;
  },

  save: function (d) {
    if (d.questions.length > 100) d.questions = d.questions.slice(-100);
    if (d.weakSpots.length > 10) d.weakSpots = d.weakSpots.slice(-10);
    if (d.strengths.length > 10) d.strengths = d.strengths.slice(-10);
    Store.set(this.key, d);
  },

  recordAnswer: function (q, answer) {
    var d = this.load();
    var intent = (answer && answer.kind) ? answer.kind : "unknown";
    var conf = (answer && answer.confidence) ? answer.confidence : 0.5;
    d.questions.push({ q: String(q).slice(0, 200), intent: intent, confidence: conf, score: null, ts: Date.now() });
    if (!d.intents[intent]) d.intents[intent] = { total: 0, correct: 0, wrong: 0, sumConfidence: 0 };
    d.intents[intent].total++;
    d.intents[intent].sumConfidence += conf;
    d.totalAnswered = (d.totalAnswered || 0) + 1;
    this._recalc(d);
    this._detect(d);
    this.save(d);
    return d;
  },

  markLast: function (isCorrect) {
    var d = this.load();
    if (!d.questions.length) return null;
    var last = d.questions[d.questions.length - 1];
    if (last.score !== null) return null;
    last.score = isCorrect ? "correct" : "wrong";
    var i = last.intent;
    if (d.intents[i]) {
      if (isCorrect) { d.intents[i].correct++; d.totalCorrect = (d.totalCorrect || 0) + 1; }
      else { d.intents[i].wrong++; d.totalWrong = (d.totalWrong || 0) + 1; }
    }
    this._recalc(d);
    this._detect(d);
    this.save(d);
    return { intent: i, correct: isCorrect, accuracy: d.accuracy, message: isCorrect ? "Отлично! Уверенность повышена." : "Понял, буду аккуратнее." };
  },

  _recalc: function (d) {
    var t = (d.totalCorrect || 0) + (d.totalWrong || 0);
    d.accuracy = t === 0 ? 0 : (d.totalCorrect / t) * 100;
  },

  _detect: function (d) {
    d.weakSpots = [];
    d.strengths = [];
    for (var i in d.intents) {
      if (!d.intents.hasOwnProperty(i)) continue;
      var st = d.intents[i];
      if (st.total < 3) continue;
      var tot = st.correct + st.wrong;
      if (tot === 0) continue;
      var acc = (st.correct / tot) * 100;
      var ac = st.sumConfidence / st.total;
      if (acc < 50 && tot >= 3) d.weakSpots.push({ intent: i, accuracy: acc, total: tot, reason: "Точность " + acc.toFixed(0) + "%" });
      else if (acc >= 80 && tot >= 3) d.strengths.push({ intent: i, accuracy: acc, total: tot, reason: "Точность " + acc.toFixed(0) + "%" });
      if (ac < 0.4 && st.total >= 3) d.weakSpots.push({ intent: i, accuracy: ac * 100, total: st.total, reason: "Средняя уверенность " + (ac * 100).toFixed(0) + "%" });
    }
    d.weakSpots.sort(function (a, b) { return a.accuracy - b.accuracy; });
    d.strengths.sort(function (a, b) { return b.accuracy - a.accuracy; });
    if (d.weakSpots.length > 10) d.weakSpots = d.weakSpots.slice(0, 10);
    if (d.strengths.length > 10) d.strengths = d.strengths.slice(0, 10);
  },

  getAdjustedConfidence: function (intent, base) {
    var d = this.load();
    var st = d.intents[intent];
    if (!st || st.total < 3) return base;
    var tot = st.correct + st.wrong;
    if (tot === 0) return base;
    return (base + st.correct / tot) / 2;
  },

  formatReport: function () {
    var d = this.load();
    if (d.totalAnswered < 5) return "📈 Мало данных. Задай ещё вопросы.";
    var ls = ["📈 Мой отчёт:", ""];
    ls.push("Всего отвечено: " + d.totalAnswered);
    var tot = d.totalCorrect + d.totalWrong;
    if (tot > 0) {
      ls.push("Оценено: " + tot);
      ls.push("Точность: " + d.accuracy.toFixed(0) + "%");
      ls.push("Правильных: " + d.totalCorrect);
      ls.push("Ошибок: " + d.totalWrong);
    }
    if (d.strengths.length) {
      ls.push(""); ls.push("✅ Сильные стороны:");
      for (var i = 0; i < Math.min(d.strengths.length, 3); i++) ls.push("• " + d.strengths[i].intent + " — " + d.strengths[i].reason);
    }
    if (d.weakSpots.length) {
      ls.push(""); ls.push("⚠️ Слабые места:");
      for (var j = 0; j < Math.min(d.weakSpots.length, 3); j++) ls.push("• " + d.weakSpots[j].intent + " — " + d.weakSpots[j].reason);
    }
    return ls.join("\n");
  },

  getRecentQuestions: function (l) { return this.load().questions.slice(-(l || 10)); },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("твой отчёт") >= 0 || s.indexOf("твоя точность") >= 0 || s.indexOf("как ты учишься") >= 0) return "report";
    if (s.indexOf("правильно") >= 0 && s.length < 30) return "mark_correct";
    if (s.indexOf("не то") >= 0 || s.indexOf("неправильно") >= 0) return "mark_wrong";
    if (s.indexOf("твои слабые") >= 0 || s.indexOf("что ты не умеешь") >= 0) return "weakness";
    if (s.indexOf("твои сильные") >= 0 || s.indexOf("что ты умеешь лучше всего") >= 0) return "strength";
    return null;
  },

  answer: function (kind) {
    if (kind === "report") return this.formatReport();
    if (kind === "weakness") {
      var d = this.load();
      if (!d.weakSpots.length) return "🎯 Слабых мест не выявлено.";
      var ls = ["⚠️ Что хуже:", ""];
      for (var i = 0; i < Math.min(d.weakSpots.length, 5); i++) ls.push("• " + d.weakSpots[i].intent + " — " + d.weakSpots[i].reason);
      return ls.join("\n");
    }
    if (kind === "strength") {
      var d2 = this.load();
      if (!d2.strengths.length) return "💪 Статистики мало.";
      var ls2 = ["✅ Что лучше всего:", ""];
      for (var j = 0; j < Math.min(d2.strengths.length, 5); j++) ls2.push("• " + d2.strengths[j].intent + " — " + d2.strengths[j].reason);
      return ls2.join("\n");
    }
    return null;
  },

  clear: function () { Store.set(this.key, null); }
};
