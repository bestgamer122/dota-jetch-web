/* DOTA JETCH — BRAIN THINK v1.1 (без подсказок в fallback) */

var BrainThink = {
  analyze: function (query) {
    var raw = String(query || "").trim();
    var norm = raw.toLowerCase().replace(/[^a-zа-яё0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    var tokens = norm.split(" ").filter(function (t) { return t.length >= 2; });
    var isQuestion = /\?/.test(raw) || (norm.indexOf("кто ") === 0) || (norm.indexOf("что ") === 0) || (norm.indexOf("где ") === 0) || (norm.indexOf("когда ") === 0) || (norm.indexOf("как ") === 0) || (norm.indexOf("почему ") === 0) || (norm.indexOf("зачем ") === 0) || (norm.indexOf("сколько ") === 0);
    var isCommand = norm.indexOf("запомни") === 0 || norm.indexOf("забудь") === 0 || norm.indexOf("посчитай") === 0 || norm.indexOf("брось") === 0 || norm.indexOf("сгенерируй") === 0;
    return { raw: raw, norm: norm, tokens: tokens, isQuestion: isQuestion, isCommand: isCommand, length: tokens.length };
  },

  gather: function (query) {
    var c = [];
    if (typeof BrainLearn !== "undefined") {
      var lc = BrainLearn.parseLearnCommand(query);
      if (lc) c.push({ source: "learn", priority: 100, data: lc });
      var fc = BrainLearn.parseForgetCommand(query);
      if (fc) c.push({ source: "forget", priority: 100, data: fc });
    }
    if (typeof BrainTools !== "undefined") {
      var t = BrainTools.detect(query);
      if (t) c.push({ source: "tool", priority: 90, kind: t, data: query });
    }
    if (typeof BrainTime !== "undefined") {
      var ti = BrainTime.detect(query);
      if (ti) c.push({ source: "time", priority: 85, kind: ti, data: query });
    }
    if (typeof BrainMood !== "undefined") {
      var mo = BrainMood.detect(query);
      if (mo) c.push({ source: "mood", priority: 80, kind: mo, data: query });
    }
    if (typeof BrainStats !== "undefined") {
      var st = BrainStats.detect(query);
      if (st) c.push({ source: "stats", priority: 75, kind: st, data: query });
    }
    if (typeof BrainFacts !== "undefined") {
      var fa = BrainFacts.detect(query);
      if (fa) c.push({ source: "fact", priority: 70, kind: fa, data: query });
    }
    if (typeof BrainOpinions !== "undefined") {
      var op = BrainOpinions.detect(query);
      if (op) c.push({ source: "opinion", priority: 65, kind: op, data: query });
    }
    if (typeof BrainCoreIntent !== "undefined") {
      var bc = BrainCoreIntent.detect(query);
      if (bc) c.push({ source: "core", priority: 60, kind: bc, data: query });
    }
    if (typeof BrainLearn !== "undefined") {
      var found = BrainLearn.find(query);
      if (found) c.push({ source: "learned", priority: 55, data: found });
    }
    if (typeof kbSearch === "function") {
      var kb = kbSearch(query);
      if (kb) c.push({ source: "kb", priority: 50, data: kb });
    }
    return c;
  },

  score: function (c, analysis) {
    var base = c.priority || 50;
    if (analysis.isCommand && c.source === "tool") base += 10;
    if (analysis.isQuestion && (c.source === "kb" || c.source === "learned" || c.source === "time")) base += 5;
    if (analysis.length >= 4 && c.source === "learned") base += 15;
    if (analysis.length <= 1 && c.source === "core") base += 10;
    return base;
  },

  synthesize: function (c, analysis) {
    if (c.source === "learn") {
      var res = BrainLearn.add(c.data.q, c.data.a);
      return { kind: "learn", text: res === "updated" ? "Обновил:\n• " + c.data.q + " → " + c.data.a : "Запомнил:\n• " + c.data.q + " → " + c.data.a + "\n\nВсего: " + BrainLearn.count(), confidence: 1 };
    }
    if (c.source === "forget") {
      var ok = BrainLearn.remove(c.data);
      return { kind: "forget", text: ok ? "Забыл про «" + c.data + "»." : "Не нашёл «" + c.data + "».", confidence: 1 };
    }
    if (c.source === "tool") return { kind: "tool", text: BrainTools.answer(c.kind, c.data), confidence: 0.95 };
    if (c.source === "time") return { kind: "time", text: BrainTime.answer(c.kind), confidence: 0.98 };
    if (c.source === "mood") return { kind: "mood", text: BrainMood.answer(c.kind), confidence: 0.9 };
    if (c.source === "stats") return { kind: "stats", text: c.kind === "self" ? BrainStats.selfText() : BrainStats.userText(), confidence: 0.9 };
    if (c.source === "fact") return { kind: "fact", text: BrainFacts.answer(c.kind), confidence: 0.85 };
    if (c.source === "opinion") { var ot = BrainOpinions.answer(c.kind); if (ot) return { kind: "opinion", text: ot, confidence: 0.8 }; }
    if (c.source === "core") {
      var map = { greeting: BrainCore.greetings, howareyou: BrainCore.howAreYou, thanks: BrainCore.thanks, farewell: BrainCore.farewell, whoareyou: BrainCore.whoAreYou, whatcanyoudo: BrainCore.whatCanYouDo, help: BrainCore.help, joke: BrainCore.jokes };
      if (c.kind === "whatknow") return { kind: "know", text: BrainLearn.formatList(), confidence: 1 };
      if (c.kind === "feedbackstats") return { kind: "feedback", text: (typeof BrainFeedback !== "undefined" ? BrainFeedback.stats() : "-"), confidence: 1 };
      if (c.kind === "reflect") return { kind: "reflect", text: (typeof BrainSelfCheck !== "undefined" ? BrainSelfCheck.reflect() : "-"), confidence: 1 };
      if (map[c.kind]) return { kind: c.kind, text: BrainCoreIntent.pick(map[c.kind]), confidence: 0.9 };
    }
    if (c.source === "learned") return { kind: "learned", text: c.data.entry.a, confidence: c.data.score, score: c.data.score };
    if (c.source === "kb") {
      var kb = kbAnswer(analysis.raw);
      return { kind: "kb", text: kb.text, match: kb.match, confidence: 0.85 };
    }
    return null;
  },

  run: function (query) {
    var trace = [];
    trace.push("Анализирую запрос...");
    var analysis = this.analyze(query);
    trace.push("Ищу варианты ответа...");
    var candidates = this.gather(query);
    for (var i = 0; i < candidates.length; i++) candidates[i].score = this.score(candidates[i], analysis);
    candidates.sort(function (a, b) { return b.score - a.score; });
    if (!candidates.length) {
      return { kind: "none", text: "Хм, не знаю что ответить на это.\n\nПопробуй переформулировать или научи меня: «запомни: вопрос = ответ».", confidence: 0, trace: trace };
    }
    trace.push("Формулирую ответ...");
    var answer = this.synthesize(candidates[0], analysis);
    if (!answer) return { kind: "none", text: "Не смог сформулировать ответ.", confidence: 0.1, trace: trace };
    if (typeof BrainContext !== "undefined") BrainContext.remember(query, answer.text, answer.kind);
    answer.trace = trace;
    answer.topSource = candidates[0].source;
    return answer;
  }
};