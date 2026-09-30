/* DOTA JETCH — BRAIN CHAIN V2 v1.0 */

var BrainChainV2 = {
  patterns: [
    { match: /(?:сравни|что лучше|или|vs|против)\s+(.+?)\s+(?:и|или|vs|против)\s+(.+)/i,
      split: function (m) { return ["Расскажи про " + m[1].trim(), "Расскажи про " + m[2].trim()]; },
      combine: function (a, b) { return "**Сравнение:**\n\n" + a + "\n\n---\n\n" + b; } },
    { match: /^как\s+(.+?)\s+(?:и|а также|,)\s+(.+)/i,
      split: function (m) { return ["Как " + m[1].trim(), "Как " + m[2].trim()]; },
      combine: function (a, b) { return "**Первое:**\n" + a + "\n\n**Второе:**\n" + b; } },
    { match: /почему\s+(.+?)\s*,?\s*а не\s+(.+)/i,
      split: function (m) { return ["Почему " + m[1].trim(), "Расскажи про " + m[2].trim()]; },
      combine: function (a, b) { return a + "\n\n---\n\n**А что насчёт альтернативы:**\n" + b; } }
  ],

  isComplex: function (q) {
    if (!q || q.length < 15) return false;
    var s = String(q).toLowerCase();
    if (/(?:сравни|vs|против|что лучше).{3,}\s+(?:и|или|vs|против)\s+/.test(s)) return true;
    if (s.indexOf("а также") >= 0 || s.indexOf("и ещё") >= 0) return true;
    var ac = (s.match(/\s+(?:и|а также|или)\s+/g) || []).length;
    if (ac >= 2) return true;
    if (s.indexOf("разбери подробно") >= 0 || s.indexOf("расскажи всё") >= 0) return true;
    return false;
  },

  run: function (q) {
    if (!this.isComplex(q)) return null;
    for (var i = 0; i < this.patterns.length; i++) {
      var p = this.patterns[i];
      var m = String(q).match(p.match);
      if (!m) continue;
      var subs = p.split(m);
      if (!subs || subs.length < 2) continue;
      var answers = [];
      var traces = [];
      for (var j = 0; j < subs.length; j++) {
        var sq = subs[j];
        if (!sq || sq.length < 3) continue;
        try {
          var sa = (typeof window._brainAnswerNoChain === "function") ? window._brainAnswerNoChain(sq) : (typeof brainAnswer === "function" ? brainAnswer(sq) : null);
          if (sa && sa.text && sa.text.indexOf("не знаю") < 0) {
            answers.push(sa.text);
            if (sa.trace) traces = traces.concat(sa.trace);
          }
        } catch (e) {}
      }
      if (answers.length < 2) continue;
      var combined = p.combine.apply(null, answers);
      return {
        kind: "chain_v2", text: combined, confidence: 0.85,
        trace: ["ChainV2: " + answers.length + " подвопросов"].concat(traces),
        subQuestions: subs, subAnswers: answers
      };
    }
    return null;
  },

  detect: function (q) { return this.isComplex(q) ? "chain" : null; },
  answer: function (k, q) { if (k === "chain") return this.run(q); return null; }
};
