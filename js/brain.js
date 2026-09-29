/* DOTA JETCH — BRAIN v7.0 (рассуждения, выводы, граф) */

function brainAnswer(query) {
  var q = String(query || "").trim();
  if (!q) return { kind: "empty", text: "Спроси что-нибудь.", confidence: 1, trace: [] };

  var lang = (typeof BrainLang !== "undefined") ? BrainLang.detect(q) : "ru";

  if (typeof BrainFeedback !== "undefined") {
    var fb = BrainFeedback.detect(q);
    if (fb) return { kind: "feedback", text: BrainFeedback.respond(fb), confidence: 1, trace: ["Распознал фидбек: " + fb] };
  }

  if (typeof BrainEmotion !== "undefined") {
    var emo = BrainEmotion.detect(q);
    if (emo && (emo.mood === "sad" || emo.mood === "angry" || emo.mood === "tired")) {
      if (typeof BrainPersonality !== "undefined") BrainPersonality.adapt(emo);
      if (typeof BrainUser !== "undefined") {
        var prof = BrainUser.load();
        prof.mood = emo.mood;
        BrainUser.save(prof);
      }
      var eText = BrainEmotion.respond(emo);
      if (eText) {
        if (typeof BrainContext !== "undefined") BrainContext.remember(q, eText, "emotion");
        return { kind: "emotion", text: eText, emotion: emo.mood, confidence: 0.85, trace: ["Определил эмоцию: " + emo.mood] };
      }
    }
  }

  if (typeof BrainPersonality !== "undefined") BrainPersonality.adapt(null);

  var analysis = BrainThink.analyze(q);
  if (typeof BrainChain !== "undefined" && BrainChain.isComplex(analysis)) {
    var chain = BrainChain.run(q);
    if (chain) {
      if (typeof BrainContext !== "undefined") BrainContext.remember(q, chain.text, "chain");
      if (typeof BrainSelfCheck !== "undefined") chain = BrainSelfCheck.run(chain, q);
      if (typeof BrainVariation !== "undefined") BrainVariation.remember("chain", chain.text);
      if (typeof BrainSuggest !== "undefined") { var s = BrainSuggest.format("chain"); if (s) chain.suggestion = s; }
      return chain;
    }
  }

  var answer = BrainThink.run(q);

  if (typeof BrainPersonality !== "undefined" && answer.text && answer.kind !== "kb" && answer.kind !== "learn") {
    answer.text = BrainPersonality.apply(answer.text);
  }

  if (typeof BrainSelfCheck !== "undefined") answer = BrainSelfCheck.run(answer, q);

  if (answer.kind === "none" && typeof BrainEmotion !== "undefined") {
    var emo2 = BrainEmotion.detect(q);
    if (emo2) {
      var reaction = BrainEmotion.respond(emo2);
      if (reaction) answer.text = reaction + "\n\n" + answer.text;
      answer.emotion = emo2.mood;
    }
  }

  if (lang === "en" && typeof BrainLang !== "undefined") answer.text = BrainLang.translate(answer.text, "en");

  if (typeof BrainMemoryLong !== "undefined") BrainMemoryLong.bumpMessage();

  return answer;
}

/* Запуск новой сессии */
if (typeof BrainMemoryLong !== "undefined") {
  setTimeout(function () { try { BrainMemoryLong.startSession(); } catch (e) {} }, 500);
}
