/* DOTA JETCH — BRAIN LEARN v1.0 */

var BrainLearn = {
  key: "brainmemory",
  all: function () {
    var m = Store.get(this.key, []);
    return Array.isArray(m) ? m : [];
  },
  save: function (list) { Store.set(this.key, list.slice(0, 500)); },
  add: function (q, a) {
    if (!q || !a) return false;
    var list = this.all();
    var norm = this.norm(q);
    for (var i = 0; i < list.length; i++) {
      if (list[i].q === norm) { list[i].a = a; list[i].ts = Date.now(); this.save(list); return "updated"; }
    }
    list.unshift({ q: norm, raw: q, a: a, ts: Date.now() });
    this.save(list);
    return "added";
  },
  remove: function (q) {
    var list = this.all();
    var norm = this.norm(q);
    var before = list.length;
    list = list.filter(function (x) { return x.q !== norm && x.raw !== q; });
    this.save(list);
    return list.length < before;
  },
  clear: function () { Store.set(this.key, []); },
  count: function () { return this.all().length; },
  norm: function (s) { return String(s || "").toLowerCase().replace(/[^a-zа-яё0-9\s]/g, " ").replace(/\s+/g, " ").trim(); },
  tokens: function (s) { return this.norm(s).split(" ").filter(function (t) { return t.length >= 3; }); },
  score: function (query, stored) {
    var qTokens = this.tokens(query), sTokens = this.tokens(stored);
    if (!qTokens.length || !sTokens.length) return 0;
    var matches = 0;
    for (var i = 0; i < qTokens.length; i++) {
      for (var j = 0; j < sTokens.length; j++) {
        if (qTokens[i] === sTokens[j]) { matches += 3; continue; }
        if (qTokens[i].indexOf(sTokens[j]) === 0 || sTokens[j].indexOf(qTokens[i]) === 0) matches += 1;
      }
    }
    var maxLen = Math.max(qTokens.length, sTokens.length);
    return matches / (maxLen * 3);
  },
  find: function (query) {
    var list = this.all();
    if (!list.length) return null;
    var best = null, bestScore = 0;
    for (var i = 0; i < list.length; i++) {
      var sc = this.score(query, list[i].q);
      if (sc > bestScore) { bestScore = sc; best = list[i]; }
    }
    if (best && bestScore >= 0.5) return { entry: best, score: bestScore };
    return null;
  },
  parseLearnCommand: function (q) {
    var s = String(q || "").trim();
    var m = s.match(/^(?:запомни|выучи|научи|learn|запомнить)\s*[:=]?\s*(.+?)\s*[=:]+\s*(.+)$/i);
    if (m) return { q: m[1].trim(), a: m[2].trim() };
    m = s.match(/^(?:запомни|выучи|научи|learn|запомнить)\s+(.+?)\s+(?:это|значит)\s+(.+)$/i);
    if (m) return { q: m[1].trim(), a: m[2].trim() };
    return null;
  },
  parseForgetCommand: function (q) {
    var s = String(q || "").trim();
    var m = s.match(/^(?:забудь|удали|forget)\s*[:=]?\s*(.+)$/i);
    if (m) return m[1].trim();
    return null;
  },
  formatList: function () {
    var list = this.all();
    if (!list.length) return "Я пока ничего не выучил от тебя. Скажи: «запомни: как дела = отлично», и я запомню.";
    var out = "Мои выученные знания (" + list.length + "):\n\n";
    for (var i = 0; i < Math.min(list.length, 20); i++) out += "• " + list[i].raw + " → " + list[i].a + "\n";
    if (list.length > 20) out += "\n...и ещё " + (list.length - 20) + " записей.";
    return out;
  }
};