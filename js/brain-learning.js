/* DOTA JETCH — BRAIN LEARNING v1.0 */

var BrainLearning = {
  key: "brain_learning",

  load: function () {
    var raw = Store.get(this.key, null);
    if (!raw || typeof raw !== "object") {
      raw = {
        facts: {}, corrections: [], preferences: {}, patterns: {}, qaPairs: [],
        stats: { totalQuestions: 0, corrections: 0, learnedFacts: 0, matchesAnalyzed: 0 },
        firstSeen: Date.now()
      };
    }
    if (!raw.facts) raw.facts = {};
    if (!raw.corrections) raw.corrections = [];
    if (!raw.preferences) raw.preferences = {};
    if (!raw.patterns) raw.patterns = {};
    if (!raw.qaPairs) raw.qaPairs = [];
    if (!raw.stats) raw.stats = { totalQuestions: 0, corrections: 0, learnedFacts: 0, matchesAnalyzed: 0 };
    return raw;
  },

  save: function (d) { Store.set(this.key, d); },

  parseLearnCommand: function (q) {
    var s = String(q || "").trim();
    var m = s.match(/^запомни[:\s]+(.+?)\s*=\s*(.+)$/i);
    if (m) return { q: m[1].trim().toLowerCase(), a: m[2].trim() };
    return null;
  },

  addFact: function (q, a) {
    var d = this.load();
    var existed = d.facts[q] !== undefined;
    d.facts[q] = a;
    d.stats.learnedFacts = Object.keys(d.facts).length;
    this.save(d);
    return existed ? "updated" : "added";
  },

  findFact: function (q) {
    var s = String(q || "").trim().toLowerCase();
    var d = this.load();
    if (d.facts[s]) return { entry: { q: s, a: d.facts[s] }, score: 1.0, type: "exact" };
    if (s.length < 3) return null;
    for (var k in d.facts) {
      if (!d.facts.hasOwnProperty(k)) continue;
      if (k.indexOf(s) >= 0 || s.indexOf(k) >= 0) {
        return { entry: { q: k, a: d.facts[k] }, score: 0.7, type: "partial" };
      }
    }
    var w = s.split(/\s+/).filter(function (x) { return x.length >= 4; });
    if (!w.length) return null;
    var best = null, bs = 0;
    for (var k2 in d.facts) {
      if (!d.facts.hasOwnProperty(k2)) continue;
      var m = 0;
      for (var i = 0; i < w.length; i++) if (k2.indexOf(w[i]) >= 0) m++;
      var sc = m / w.length;
      if (sc > bs && sc >= 0.5) { bs = sc; best = { entry: { q: k2, a: d.facts[k2] }, score: 0.5 + sc * 0.4, type: "word" }; }
    }
    return best;
  },

  parseCorrection: function (q) {
    var s = String(q || "").trim();
    var m = s.match(/^(?:не\s*то|неправильно|неверно)[,:\s]+(?:правильно\s*[:\-]?\s*)?(.+)$/i);
    if (m) return { correction: m[1].trim() };
    return null;
  },

  recordCorrection: function (lastQ, wrongA, rightA) {
    var d = this.load();
    d.corrections.unshift({ q: lastQ, wrongA: wrongA, rightA: rightA, ts: Date.now() });
    if (d.corrections.length > 30) d.corrections = d.corrections.slice(0, 30);
    d.stats.corrections = (d.stats.corrections || 0) + 1;
    if (lastQ) { d.facts[lastQ.toLowerCase()] = rightA; d.stats.learnedFacts = Object.keys(d.facts).length; }
    this.save(d);
  },

  findCorrection: function (q) {
    var s = String(q || "").toLowerCase().trim();
    var d = this.load();
    for (var i = 0; i < d.corrections.length; i++) {
      var c = d.corrections[i];
      if (!c.q) continue;
      var ql = c.q.toLowerCase();
      if (ql === s || ql.indexOf(s) >= 0 || s.indexOf(ql) >= 0) return c;
    }
    return null;
  },

  bumpQuestion: function () { var d = this.load(); d.stats.totalQuestions = (d.stats.totalQuestions || 0) + 1; this.save(d); },
  bumpMatch: function () { var d = this.load(); d.stats.matchesAnalyzed = (d.stats.matchesAnalyzed || 0) + 1; this.save(d); },

  trackHour: function () {
    var d = this.load();
    var h = new Date().getHours();
    var p = "ночь";
    if (h >= 6 && h < 12) p = "утро";
    else if (h >= 12 && h < 18) p = "день";
    else if (h >= 18 && h < 23) p = "вечер";
    d.patterns[p] = (d.patterns[p] || 0) + 1;
    this.save(d);
  },

  getHabits: function () {
    var d = this.load();
    var out = [];
    var st = d.stats;
    if (st.totalQuestions > 20) out.push("Ты задал мне уже " + st.totalQuestions + " вопросов.");
    if (st.corrections > 0) out.push("Ты исправлял меня " + st.corrections + " раз(а).");
    if (st.learnedFacts > 0) out.push("Я запомнил " + st.learnedFacts + " фактов(а) от тебя.");
    var fav = null, mx = 0;
    for (var p in d.patterns) if (d.patterns.hasOwnProperty(p) && d.patterns[p] > mx) { mx = d.patterns[p]; fav = p; }
    if (fav && mx >= 5) out.push("Чаще всего играешь " + fav + " (" + mx + " раз).");
    return out;
  },

  exportData: function () { return this.load(); },
  importData: function (d) { if (d && typeof d === "object") this.save(d); },
  clear: function () { Store.set(this.key, null); }
};
