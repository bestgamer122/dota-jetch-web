/* DOTA JETCH — BRAIN v10.0 (все модули) */

function _brainAnswerNoChain(query) {
  var q = String(query || "").trim();
  if (!q) return { kind: "empty", text: "", confidence: 0, trace: [] };
  if (typeof BrainUniversal !== "undefined") {
    var u = BrainUniversal.respond(q);
    if (u) return u;
  }
  if (typeof BrainLearning !== "undefined") {
    var f = BrainLearning.findFact(q);
    if (f && f.score >= 0.6) return { kind: "learned", text: f.entry.a, confidence: f.score, trace: ["noChain"] };
  }
  return null;
}
window._brainAnswerNoChain = _brainAnswerNoChain;

function brainAnswer(query) {
  var q = String(query || "").trim();
  if (!q) return { kind: "empty", text: "Спроси что-нибудь.", confidence: 1, trace: [] };

  /* CHAIN V2 */
  if (typeof BrainChainV2 !== "undefined") {
    var chainRes = BrainChainV2.run(q);
    if (chainRes) return chainRes;
  }

  /* АВТООБУЧЕНИЕ */
  if (typeof BrainAutoLearner !== "undefined") {
    var alKind = BrainAutoLearner.detect(q);
    if (alKind === "report" || alKind === "weakness" || alKind === "strength") {
      var alAns = BrainAutoLearner.answer(alKind);
      if (alAns) return { kind: "autolearner_" + alKind, text: alAns, confidence: 0.95, trace: ["AutoLearner." + alKind] };
    }
    if (alKind === "mark_correct") {
      var r1 = BrainAutoLearner.markLast(true);
      if (r1) return { kind: "autolearner_mark", text: "✅ " + r1.message + "\n\nОбщая точность: " + r1.accuracy.toFixed(0) + "%", confidence: 1.0 };
    }
    if (alKind === "mark_wrong") {
      var r2 = BrainAutoLearner.markLast(false);
      if (r2) return { kind: "autolearner_mark", text: "📝 " + r2.message + "\n\nОбщая точность: " + r2.accuracy.toFixed(0) + "%", confidence: 1.0 };
    }
  }

  /* ОБУЧАЕМАЯ ПАМЯТЬ */
  if (typeof BrainLearning !== "undefined") {
    var lc = BrainLearning.parseLearnCommand(q);
    if (lc) {
      var res = BrainLearning.addFact(lc.q, lc.a);
      return { kind: "learn", text: res === "updated" ? "Обновил: «" + lc.q + "» = «" + lc.a + "»" : "Запомнил: «" + lc.q + "» = «" + lc.a + "»", confidence: 1.0 };
    }
    var corr = BrainLearning.parseCorrection(q);
    if (corr) {
      var ctx = (typeof BrainContext !== "undefined") ? BrainContext.load() : null;
      var lastQ = ctx && ctx.history && ctx.history.length ? ctx.history[ctx.history.length-1].q : "";
      var lastA = ctx && ctx.history && ctx.history.length ? ctx.history[ctx.history.length-1].a : "";
      BrainLearning.recordCorrection(lastQ, lastA, corr.correction);
      return { kind: "learn_correction", text: "Понял, исправил. Теперь буду отвечать: «" + corr.correction + "»", confidence: 1.0 };
    }
    BrainLearning.bumpQuestion();
    BrainLearning.trackHour();
  }

  /* РУСИФИКАЦИЯ */
  var originalQ = q;
  if (typeof BrainRus !== "undefined") {
    var rusKind = BrainRus.detect(q);
    if (rusKind) {
      var rusAns = BrainRus.answer(rusKind, q);
      if (rusAns) return { kind: "rus_" + rusKind, text: rusAns, confidence: 0.95, trace: ["BrainRus." + rusKind] };
    }
    if (BrainRus.hasSlang(q)) q = BrainRus.normalize(q);
  }

  /* ЛИЧНОСТЬ */
  if (typeof BrainPersonality !== "undefined") {
    var moodKind = BrainPersonality.detect(q);
    if (moodKind) {
      var moodAns = BrainPersonality.answer(moodKind);
      if (moodAns) return { kind: "personality_" + moodKind, text: moodAns, confidence: 0.95 };
    }
    if (typeof BrainEmotion !== "undefined") {
      var emo = BrainEmotion.detect(q);
      if (emo) BrainPersonality.adapt(emo);
    }
  }

  /* META */
  if (typeof BrainMeta !== "undefined") {
    var metaKind = BrainMeta.detect(q);
    if (metaKind) {
      var metaAns = BrainMeta.answer(metaKind);
      if (metaAns) return { kind: "meta_" + metaKind, text: metaAns, confidence: 0.98 };
    }
  }

  /* MMR */
  if (typeof BrainMMR !== "undefined") {
    var mmrKind = BrainMMR.detect(q);
    if (mmrKind) {
      var mmrAns = BrainMMR.answer(mmrKind);
      if (mmrAns) return { kind: "mmr_" + mmrKind, text: mmrAns, confidence: 0.85 };
    }
  }

  /* HEROES FULL */
  if (typeof BRAIN_HEROES !== "undefined") {
    var heroLow = q.toLowerCase();
    if (heroLow.indexOf("расскажи про") >= 0 || heroLow.indexOf("что за герой") >= 0) {
      var hName = q.replace(/^(расскажи про|что за герой)\s*/i, "").trim();
      var hero = findHeroByName(hName);
      if (hero) {
        var attrMap = { str: "Сила", agi: "Ловкость", int: "Интеллект", all: "Универсал" };
        return { kind: "hero_full", text: "🎯 **" + hero.name + "**\n\nАтрибут: " + (attrMap[hero.attr]||hero.attr) + "\nТип: " + hero.atk + "\nРоли: " + hero.roles.join(", "), confidence: 0.95 };
      }
    }
    if (heroLow.indexOf("сколько героев") >= 0) {
      return { kind: "heroes_count", text: "🎯 В Dota 2 на 2026 год **" + BRAIN_HEROES.length + " героев**.", confidence: 1.0 };
    }
  }

  /* DRAFT */
  if (typeof BrainDraft !== "undefined") {
    var drKind = BrainDraft.detect(q);
    if (drKind) {
      var enemies = [];
      if (drKind === "suggest" && typeof findHeroByAlias === "function") {
        var wds = q.toLowerCase().split(/[\s,]+/);
        for (var wi = 0; wi < wds.length; wi++) {
          var w = wds[wi].replace(/[^а-яёa-z\-]/g, "");
          if (w.length < 3) continue;
          var h = findHeroByAlias(w);
          if (h && enemies.indexOf(h) === -1) enemies.push(h);
        }
      }
      var drAns = BrainDraft.answer(drKind, enemies);
      if (drAns) return { kind: "draft_" + drKind, text: drAns, confidence: 0.9 };
    }
  }

  /* BUILDS */
  if (typeof BrainBuilds !== "undefined") {
    if (BrainBuilds.detect(q) === "build") {
      var heroForBuild = null;
      if (typeof findHeroByAlias === "function") {
        var wds2 = q.toLowerCase().split(/[\s,]+/);
        for (var bi = 0; bi < wds2.length; bi++) {
          var w2 = wds2[bi].replace(/[^а-яёa-z\-]/g, "");
          if (w2.length < 3) continue;
          var hh = findHeroByAlias(w2);
          if (hh) { heroForBuild = hh; break; }
        }
      }
      var enemiesForBuild = [];
      if (typeof lastAnalysis !== "undefined" && lastAnalysis && lastAnalysis.match && lastAnalysis.heroes) {
        var m = lastAnalysis.match, p = lastAnalysis.player;
        var isRad = p.player_slot < 128;
        for (var mi = 0; mi < m.players.length; mi++) {
          var mp = m.players[mi];
          if ((mp.player_slot < 128) === isRad) continue;
          for (var hj = 0; hj < lastAnalysis.heroes.length; hj++) {
            if (lastAnalysis.heroes[hj].id === mp.hero_id) { enemiesForBuild.push(lastAnalysis.heroes[hj].name); break; }
          }
        }
      }
      var bAns = BrainBuilds.answer("build", heroForBuild, null, enemiesForBuild);
      if (bAns) return { kind: "builds", text: bAns, confidence: 0.9 };
    }
  }

  /* TIMINGS */
  if (typeof BrainTimings !== "undefined") {
    var timKind = BrainTimings.detect(q);
    if (timKind) {
      var timAns = BrainTimings.answer(timKind);
      if (timAns) return { kind: "timings_" + timKind, text: timAns, confidence: 0.95 };
    }
  }

  /* SITUATIONS */
  if (typeof BrainSituations !== "undefined") {
    if (q.toLowerCase().indexOf("все ситуации") >= 0) return { kind: "situations_list", text: BrainSituations.list(), confidence: 0.95 };
    var sitKey = BrainSituations.detect(q);
    if (sitKey) {
      var sitAns = BrainSituations.answer(sitKey);
      if (sitAns) return { kind: "situations", text: sitAns, confidence: 0.92 };
    }
  }

  /* MINDSET */
  if (typeof BrainMindset !== "undefined") {
    var mindKind = BrainMindset.detect(q);
    if (mindKind) {
      var mindAns = BrainMindset.answer(mindKind);
      if (mindAns) return { kind: "mindset_" + mindKind, text: mindAns, confidence: 0.92 };
    }
  }

  /* LANES */
  if (typeof BrainLanes !== "undefined") {
    var lanesKind = BrainLanes.detect(q);
    if (lanesKind) {
      var lanesAns = BrainLanes.answer(lanesKind);
      if (lanesAns) return { kind: "lanes_" + lanesKind, text: lanesAns, confidence: 0.92 };
    }
  }

  /* PROKASTS */
  if (typeof BrainProkasts !== "undefined") {
    var prokKind = BrainProkasts.detect(q);
    if (prokKind) {
      var prokAns = BrainProkasts.answer(prokKind, q);
      if (prokAns) return { kind: "prokasts", text: prokAns, confidence: 0.95 };
    }
  }

  /* COUNTERS */
  if (typeof BrainCounters !== "undefined") {
    var cKind = BrainCounters.detect(q);
    if (cKind) {
      var cAns = BrainCounters.answer(cKind, q);
      if (cAns) return { kind: "counters_" + cKind, text: cAns, confidence: 0.92 };
    }
  }

  /* ITEMS FULL */
  if (typeof BrainItemsFull !== "undefined") {
    var itemsKind = BrainItemsFull.detect(q);
    if (itemsKind) {
      var itemsAns = BrainItemsFull.answer(itemsKind, q);
      if (itemsAns) return { kind: "items_full_" + itemsKind, text: itemsAns, confidence: 0.92 };
    }
  }

  /* COMPARE */
  if (typeof BrainCompare !== "undefined") {
    var cmpKind = BrainCompare.detect(q);
    if (cmpKind) {
      var cmpAns = BrainCompare.answer(cmpKind, q);
      if (cmpAns) return { kind: "compare_" + cmpKind, text: cmpAns, confidence: 0.9 };
    }
  }

  /* MATCH REVIEW */
  if (typeof BrainMatchReview !== "undefined") {
    var mrKind = BrainMatchReview.detect(q);
    if (mrKind) {
      var mrAns = BrainMatchReview.answer(mrKind);
      if (mrAns) return { kind: "match_review", text: mrAns, confidence: 0.95 };
    }
  }

  /* ПРОГНОЗ */
  if (typeof BrainPredictor !== "undefined") {
    var predKind = BrainPredictor.detect(q);
    if (predKind) {
      var heroMatch = q.match(/(?:на|за)\s+([A-Z][a-z]+)/);
      var heroForPredict = heroMatch ? heroMatch[1] : null;
      var predAns = BrainPredictor.answer(predKind, heroForPredict);
      if (predAns) return { kind: "predictor_" + predKind, text: predAns, confidence: 0.9 };
    }
  }

  /* ИНСАЙТЫ */
  if (typeof BrainInsights !== "undefined") {
    var insKind = BrainInsights.detect(q);
    if (insKind) {
      var insAns = BrainInsights.answer(insKind);
      if (insAns) return { kind: "insights_" + insKind, text: insAns, confidence: 0.92 };
    }
  }

  /* FEEDBACK */
  if (typeof BrainFeedback !== "undefined") {
    var fb = BrainFeedback.detect(q);
    if (fb) return { kind: "feedback", text: BrainFeedback.respond(fb), confidence: 1.0 };
  }

  /* ЭМОЦИЯ */
  if (typeof BrainEmotion !== "undefined") {
    var emo2 = BrainEmotion.detect(q);
    if (emo2 && (emo2.mood === "sad" || emo2.mood === "angry" || emo2.mood === "tired")) {
      var eText = BrainEmotion.respond(emo2);
      if (eText) return { kind: "emotion", text: eText, confidence: 0.85 };
    }
  }

  /* ОСНОВНОЙ ЦИКЛ */
  var analysis = BrainThink.analyze(q);
  var answer = BrainThink.run(q);

  if (typeof BrainPersonality !== "undefined" && answer.text && answer.kind !== "kb" && answer.kind !== "learn") {
    answer.text = BrainPersonality.apply(answer.text);
  }

  /* УНИВЕРСАЛ — когда всё не сработало */
  if (answer.kind === "none" || answer.kind === "unknown" || !answer.text || answer.text.indexOf("не знаю") >= 0) {
    if (typeof BrainUniversal !== "undefined") {
      var uni = BrainUniversal.respond(originalQ);
      if (uni) {
        uni.confidence = BrainAutoLearner && BrainAutoLearner.getAdjustedConfidence ? BrainAutoLearner.getAdjustedConfidence(uni.kind, uni.confidence || 0.5) : (uni.confidence || 0.5);
        if (BrainAutoLearner) BrainAutoLearner.recordAnswer(originalQ, uni);
        return uni;
      }
    }
  }

  /* ЛОКАЛИЗАЦИЯ */
  if (typeof BrainRus !== "undefined" && answer && answer.text) {
    answer.text = BrainRus.localize(answer.text);
  }

  /* СТАТИСТИКА */
  if (typeof BrainAutoLearner !== "undefined" && answer && answer.kind !== "empty") {
    if (answer.confidence !== undefined && answer.kind) {
      answer.confidence = BrainAutoLearner.getAdjustedConfidence(answer.kind, answer.confidence);
    }
    BrainAutoLearner.recordAnswer(originalQ, answer);
  }

  if (typeof BrainMemoryLong !== "undefined") BrainMemoryLong.bumpMessage();

  return answer;
}

if (typeof BrainMemoryLong !== "undefined") {
  setTimeout(function () { try { BrainMemoryLong.startSession(); } catch (e) {} }, 500);
}
