/* DOTA JETCH — BRAIN UNIVERSAL v1.2
   ФИКС: не отвечает заглушкой, если есть lastAnalysis и вопрос про матч. */

var BrainUniversal = {
  respond: function (q) {
    var s = String(q || "").trim();
    if (!s) return null;
    var low = s.toLowerCase();

    /* ─── ФИКС: если есть матч и вопрос про него — НЕ отвечаем заглушкой ─── */
    if (typeof lastAnalysis !== "undefined" && lastAnalysis && lastAnalysis.match) {
      /* Вопрос явно про матч — отдаём сигнал что нужен MatchReview */
      if (low.indexOf("матч") >= 0 || low.indexOf("анализ") >= 0 ||
          low.indexOf("анализируй") >= 0 || low.indexOf("разбор") >= 0 ||
          low.indexOf("игра") >= 0 || low.indexOf("руинер") >= 0 ||
          low.indexOf("проиграл") >= 0 || low.indexOf("победил") >= 0) {
        /* Возвращаем null — пусть верхний уровень вызовет ExternalAI */
        return null;
      }
    }

    /* MMR — делегируем в BrainMMR */
    if (typeof BrainMMR !== "undefined" && (low.indexOf("ммр") >= 0 || low.indexOf("рейтинг") >= 0 || low.indexOf("ранг") >= 0)) {
      var r = BrainMMR.predictFromLastMatch();
      if (r) return { kind: "universal_mmr", text: r.text, confidence: 0.9, trace: ["Universal.MMR"] };
      return { kind: "universal_mmr", text: "🤔 Нет данных последнего матча. Разбери матч — потом покажу прогноз MMR.", confidence: 0.8 };
    }

    /* Выученные факты */
    if (typeof BrainLearning !== "undefined") {
      var l = BrainLearning.findFact(s);
      if (l && l.score >= 0.5) return { kind: "universal_learned", text: l.entry.a, confidence: l.score, trace: ["Universal.Learning"] };
    }

    /* Общая память */
    if (typeof BrainSharedMemory !== "undefined") {
      var sh = BrainSharedMemory.load();
      if (sh && sh.player && sh.player.totalMatches >= 1 && (low.indexOf("мой") >= 0 || low.indexOf("моя") >= 0)) {
        var sum = BrainSharedMemory.getPlayerSummary();
        if (sum) return { kind: "universal_stats", text: "📊 " + sum, confidence: 0.8 };
      }
    }

    /* Инсайты */
    if (typeof BrainInsights !== "undefined") {
      var ins = BrainInsights.getTop(3);
      if (ins && ins.length && (low.indexOf("ошибк") >= 0 || low.indexOf("проблем") >= 0 || low.indexOf("улучш") >= 0)) {
        var ls = ["🔬 Заметил по твоим матчам:", ""];
        for (var i = 0; i < ins.length; i++) {
          var ic = ins[i].type === "warning" ? "⚠️" : ins[i].type === "positive" ? "✅" : "ℹ️";
          ls.push(ic + " " + ins[i].text);
        }
        return { kind: "universal_insights", text: ls.join("\n"), confidence: 0.85 };
      }
    }

    /* Прогноз */
    if (typeof BrainPredictor !== "undefined") {
      if (low.indexOf("побед") >= 0 || low.indexOf("проигр") >= 0 || low.indexOf("шанс") >= 0) {
        var pr = BrainPredictor.predictNextMatch(null);
        if (pr) return { kind: "universal_predict", text: "🔮 Прогноз: **" + pr.probability + "%** победы.\n\n" + pr.verdict, confidence: 0.85 };
      }
    }

    /* Dota */
    if (this._isDota(low)) {
      var d = this._dotaAnswer(s);
      if (d) return { kind: "universal_dota", text: d, confidence: 0.7 };
    }

    /* Злость/поддержка */
    if (low.indexOf("туп") >= 0 || low.indexOf("хуйн") >= 0 || low.indexOf("плох") >= 0 || low.indexOf("бесит") >= 0 || low.indexOf("надоел") >= 0) {
      return { kind: "universal_support", text: "Понимаю. Давай разберёмся вместе.\n\n• Что именно не работает?\n• В какой момент?\n• Что ожидал увидеть?\n\nИли спроси про Dota.", confidence: 0.9 };
    }

    return this._univ(s);
  },

  _isDota: function (low) {
    var kw = ["дота","dota","герой","предмет","билд","фарм","крип","руна","рошан","аегис","пудж","инвокер","сф","антимаг","фантомка","сларк","шторм","мирана","дров","лейнинг","мид","оффлейн","керри","саппорт","ганг","вижен","вард","сентри","бкб","линка","манта","дифуза","бабочка","хекс","атос","ульта","ульт","скилл","каст","прокаст","стак","денай","агро","лейт","драфт","пик","контрпик","синергия","тайминг","гпм","хпм","кда","нетфорс","ластхит","камп","лагерь"];
    for (var i = 0; i < kw.length; i++) if (low.indexOf(kw[i]) >= 0) return true;
    return false;
  },

  _dotaAnswer: function (q) {
    var low = q.toLowerCase();
    if (typeof HEROES_DB !== "undefined") {
      for (var hero in HEROES_DB) {
        if (HEROES_DB.hasOwnProperty(hero) && low.indexOf(hero.toLowerCase()) >= 0) {
          var info = HEROES_DB[hero];
          var ls = ["🎯 " + hero, ""];
          if (info.pos) ls.push("Роли: pos " + info.pos.join(", "));
          if (info.diff) ls.push("Сложность: " + info.diff + "/5");
          if (info.tip) ls.push("💡 " + info.tip);
          if (info.strong_against && info.strong_against.length) ls.push("🛡 Сильный против: " + info.strong_against.join(", "));
          if (info.weak_against && info.weak_against.length) ls.push("❌ Слабый против: " + info.weak_against.join(", "));
          return ls.join("\n");
        }
      }
    }
    if (typeof ITEM_NOTES !== "undefined") {
      for (var item in ITEM_NOTES) {
        if (ITEM_NOTES.hasOwnProperty(item) && low.indexOf(item.toLowerCase()) >= 0) {
          var n = ITEM_NOTES[item];
          return "🎒 " + item + " — " + n[0] + ": " + n[1] + ".";
        }
      }
    }
    if (typeof MECHANICS_KB !== "undefined") {
      for (var topic in MECHANICS_KB) {
        if (!MECHANICS_KB.hasOwnProperty(topic)) continue;
        var kb = MECHANICS_KB[topic];
        if (kb.keywords) {
          for (var k = 0; k < kb.keywords.length; k++) {
            if (low.indexOf(kb.keywords[k]) >= 0) {
              var ls2 = ["📘 " + kb.title, ""];
              if (kb.facts) for (var f = 0; f < kb.facts.length; f++) ls2.push("• " + kb.facts[f]);
              if (kb.tips && kb.tips.length) { ls2.push(""); ls2.push("💡 " + kb.tips[Math.floor(Math.random() * kb.tips.length)]); }
              return ls2.join("\n");
            }
          }
        }
      }
    }
    return "Это интересный вопрос по Dota. Знаю много о героях, предметах, механиках.\n\nСпроси конкретнее:\n• «расскажи про [герой]»\n• «билд на [герой]»\n• «что такое [механика]»\n• «когда стакать лагеря»";
  },

  _univ: function (q) {
    var low = q.toLowerCase().trim();
    if (low.split(/\s+/).length === 1 && low.length >= 3) {
      if (typeof findHeroByAlias === "function") {
        var h = findHeroByAlias(low);
        if (h && typeof HEROES_DB !== "undefined" && HEROES_DB[h]) {
          return { kind: "universal_hero", text: "🎯 **" + h + "**\n\n" + (HEROES_DB[h].tip || ""), confidence: 0.8 };
        }
      }
    }
    var res = [
      "Интересно. Расскажи подробнее — что тебя интересует? Могу разобрать матч, дать совет по герою или прогноз.",
      "Я слышу тебя. Могу:\n• разобрать матч\n• дать совет по герою\n• показать прогноз\n• рассказать про механики Dota",
      "Не уверен, что понял. Попробуй переформулировать или спроси «билд на пуджа», «когда стакать лагеря».",
      "Давай разберёмся. Расскажи подробнее, что тебя интересует."
    ];
    return { kind: "universal", text: res[Math.floor(Math.random() * res.length)], confidence: 0.6 };
  }
};
