/* DOTA JETCH — BRAIN THINK v1.4 (исправлен regex ? на \?) */

var BrainThink = {
  analyze: function (query) {
    var raw = String(query || "").trim();
    var norm = raw.toLowerCase().replace(/[^a-zа-яё0-9\s]/g, " ").replace(/\s+/g, " ").trim();
    var tokens = norm.split(" ").filter(function (t) { return t.length >= 2; });
    var isQuestion = /\?/.test(raw);
    var isCommand = norm.indexOf("запомни") === 0 || norm.indexOf("забудь") === 0 || norm.indexOf("посчитай") === 0 || norm.indexOf("брось") === 0 || norm.indexOf("сгенерируй") === 0;
    var lang = (typeof BrainLang !== "undefined") ? BrainLang.detect(raw) : "ru";
    return { raw: raw, norm: norm, tokens: tokens, isQuestion: isQuestion, isCommand: isCommand, length: tokens.length, lang: lang };
  },

  gather: function (query) {
    var c = [];
    if (typeof BrainUser !== "undefined") {
      var up = BrainUser.detect(query);
      if (up) c.push({ source: "user", priority: 95, kind: up, data: query });
    }
    if (typeof BrainMemoryLong !== "undefined") {
      var mp = BrainMemoryLong.detect(query);
      if (mp) c.push({ source: "longmem", priority: 94, kind: mp, data: query });
    }
    if (typeof BrainInfer !== "undefined") {
      var inf = BrainInfer.detect(query);
      if (inf) c.push({ source: "infer", priority: 92, kind: inf, data: query });
    }
    if (typeof BrainReason !== "undefined") {
      var rs = BrainReason.detect(query);
      if (rs) c.push({ source: "reason", priority: 91, kind: rs, data: query });
    }
    if (typeof BrainGraph !== "undefined") {
      var gr = BrainGraph.infer(query);
      if (gr) c.push({ source: "graph", priority: 90, text: gr });
    }
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
    if (c.source === "user") {
      if (c.kind === "profile") return { kind: "user", text: BrainUser.formatProfile(), confidence: 1 };
      if (c.kind === "clear") { BrainUser.clear(); return { kind: "user", text: "Забыл всё о тебе.", confidence: 1 }; }
    }
    if (c.source === "longmem") {
      if (c.kind === "stats") return { kind: "longmem", text: BrainMemoryLong.formatStats(), confidence: 1 };
      if (c.kind === "clear") { BrainMemoryLong.clear(); return { kind: "longmem", text: "История общения очищена.", confidence: 1 }; }
    }
    if (c.source === "infer") return { kind: "infer", text: BrainInfer.answer(c.kind), confidence: 0.85 };
    if (c.source === "reason") {
      var topic = BrainReason.extractTopic(analysis.raw);
      var rtext = BrainReason.answer(c.kind, topic);
      if (rtext) return { kind: "reason", text: rtext, confidence: 0.85 };
    }
    if (c.source === "graph") return { kind: "graph", text: c.text, confidence: 0.9 };
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
      if (map[c.kind]) {
        var baseText = BrainCoreIntent.pick(map[c.kind]);
        if (typeof BrainVariation !== "undefined") {
          var alt = BrainVariation.pick(map[c.kind]);
          if (alt) baseText = alt;
        }
        return { kind: c.kind, text: baseText, confidence: 0.9 };
      }
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

    if (typeof BrainUser !== "undefined") {
      var extracted = BrainUser.extract(query);
      if (extracted) trace.push("Запомнил факт о тебе: " + extracted.type + " = " + extracted.value);
    }

    trace.push("Ищу варианты ответа...");
    var candidates = this.gather(query);
    for (var i = 0; i < candidates.length; i++) candidates[i].score = this.score(candidates[i], analysis);
    candidates.sort(function (a, b) { return b.score - a.score; });

    if (!candidates.length) {
      return { kind: "none", text: "Хм, не знаю что ответить на это.\n\nПопробуй переформулировать или научи меня: «запомни: вопрос = ответ».", confidence: 0, trace: trace };
    }

    trace.push("Рассуждаю...");
    var answer = this.synthesize(candidates[0], analysis);
    if (!answer) return { kind: "none", text: "Не смог сформулировать ответ.", confidence: 0.1, trace: trace };

    if (typeof BrainVariation !== "undefined") BrainVariation.remember(answer.kind, answer.text);
    if (typeof BrainSuggest !== "undefined" && answer.kind !== "none") {
      var sugg = BrainSuggest.format(answer.kind);
      if (sugg) answer.suggestion = sugg;
    }
    if (typeof BrainContext !== "undefined") BrainContext.remember(query, answer.text, answer.kind);
    if (typeof BrainMemoryLong !== "undefined") BrainMemoryLong.trackTopic(answer.kind);

    answer.trace = trace;
    answer.topSource = candidates[0].source;
    return answer;
  }
};
