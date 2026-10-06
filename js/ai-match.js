/* DOTA JETCH — AI MATCH v4.1 (UNIFIED BRAIN + FIXED MARKDOWN)
   Фикс: склеивание слов в рендере Markdown
   Один brainAnswer для чата и матча + глубокий контекст */

(function () {
  "use strict";
  var AI_BLOCK_ID = "aiMatchBlock";
  var isAiMatchResponding = false;

  /* ─── Сбор полного контекста матча ─── */
  function collectFullContext() {
    if (typeof lastAnalysis === "undefined" || !lastAnalysis || !lastAnalysis.match) return null;
    var res = lastAnalysis;
    var p = res.player, m = res.match;
    var isRadiant = p.player_slot < 128;
    var dm = (m.duration || 0) / 60;

    var ctx = {
      hero: res.hero ? res.hero.name : "?",
      kills: p.kills || 0,
      deaths: p.deaths || 0,
      assists: p.assists || 0,
      gpm: Math.round(p.gold_per_min || 0),
      xpm: Math.round(p.xp_per_min || 0),
      lastHits: p.last_hits || 0,
      denies: p.denies || 0,
      heroDamage: Math.round(p.hero_damage || 0),
      towerDamage: Math.round(p.tower_damage || 0),
      heroHealing: Math.round(p.hero_healing || 0),
      netWorth: Math.round(p.total_gold || p.gold || 0),
      duration: dm,
      won: res.won,
      position: res.position,
      gameMode: m.game_mode,
      matchId: m.match_id,
      isRadiant: isRadiant,
      kda: (p.kills + p.assists) / Math.max(p.deaths, 1)
    };

    if (typeof BrainMatchAnalyzer !== "undefined") {
      ctx.deepReport = BrainMatchAnalyzer.buildFullReport(m, p.player_slot, isRadiant);
    }

    if (res.heroes && m.players) {
      ctx.enemies = [];
      ctx.allies = [];
      for (var i = 0; i < m.players.length; i++) {
        var mp = m.players[i];
        var mpR = mp.player_slot < 128;
        var heroName = "?";
        for (var j = 0; j < res.heroes.length; j++) {
          if (res.heroes[j].id === mp.hero_id) { heroName = res.heroes[j].name; break; }
        }
        var entry = {
          name: heroName,
          kills: mp.kills, deaths: mp.deaths, assists: mp.assists,
          gpm: Math.round(mp.gold_per_min || 0),
          player_slot: mp.player_slot,
          isMe: mp.player_slot === p.player_slot
        };
        if (mpR === isRadiant) ctx.allies.push(entry);
        else ctx.enemies.push(entry);
      }
    }

    return ctx;
  }

  function ctxToText(ctx) {
    if (!ctx) return "";
    var parts = [];
    parts.push("Герой: " + ctx.hero);
    parts.push("KDA: " + ctx.kills + "/" + ctx.deaths + "/" + ctx.assists);
    parts.push("GPM/XPM: " + ctx.gpm + "/" + ctx.xpm);
    parts.push("Ластхиты: " + ctx.lastHits);
    parts.push("Длительность: " + ctx.duration.toFixed(0) + " мин");
    parts.push("Результат: " + (ctx.won ? "победа" : "поражение"));
    return parts.join(". ");
  }

  /* ─── Поиск союзника по player_slot ─── */
  function findAllyBySlot(ctx, slot) {
    if (!ctx || !ctx.allies) return null;
    for (var i = 0; i < ctx.allies.length; i++) {
      if (ctx.allies[i].player_slot === slot) return ctx.allies[i];
    }
    return null;
  }

  /* ─── Специализированные ответы про матч ─── */
  function getMatchAnswer(q, ctx) {
    if (!ctx) return null;
    var s = String(q || "").toLowerCase();

    if (s.indexOf("руинер") >= 0 || s.indexOf("заруинил") >= 0 || s.indexOf("виноват") >= 0 || s.indexOf("слабый игрок") >= 0) {
      if (!ctx.deepReport || !ctx.deepReport.ruiner) {
        return "🎯 **Руинера не нашёл.**\n\nМатч либо не распарсен, либо все сыграли ровно." + (ctx.won ? "\n\n🏆 Победа — и это главное!" : "");
      }
      var rp = ctx.deepReport.ruiner.player;
      var ally = findAllyBySlot(ctx, rp.player_slot);
      var heroName = ally ? ally.name : "Игрок #" + rp.player_slot;
      var isMe = rp.player_slot === (ctx.isRadiant ? 0 : 128) || (ally && ally.isMe);

      var l = [];
      l.push("🎯 **Разбор руинера**");
      l.push("");
      l.push("**Игрок:** " + heroName + (isMe ? " (это ты)" : ""));
      l.push("**KDA:** " + rp.kills + "/" + rp.deaths + "/" + rp.assists);
      l.push("**GPM:** " + Math.round(rp.gold_per_min || 0));
      l.push("");
      l.push("**Причина:** " + ctx.deepReport.ruiner.reason);
      if (isMe) {
        l.push("");
        l.push("⚠️ Честный разбор. Работай над ошибками — будешь расти.");
      }
      return l.join("\n");
    }

    if (s.indexOf("почему") >= 0 && (s.indexOf("проиграл") >= 0 || s.indexOf("потерял") >= 0 || s.indexOf("луз") >= 0)) {
      if (ctx.won) return "🏆 Ты **выиграл** этот матч!\n\nРазбери проигранную игру — там больше пользы.";
      var l2 = [];
      l2.push("📉 **Почему ты проиграл на " + ctx.hero + "**");
      l2.push("");
      if (ctx.deepReport && ctx.deepReport.turningPoints && ctx.deepReport.turningPoints.length) {
        l2.push("**⚡ Ключевые моменты:**");
        for (var j = 0; j < Math.min(ctx.deepReport.turningPoints.length, 3); j++) {
          var tp = ctx.deepReport.turningPoints[j];
          var sign = tp.goldSwing > 0 ? "+" : "";
          l2.push("• **" + tp.time + " мин** — " + tp.reason + " (" + sign + tp.goldSwing + ")");
        }
        l2.push("");
      }
      if (ctx.deepReport && ctx.deepReport.ruiner) {
        l2.push("**🎯 Руинер:** " + ctx.deepReport.ruiner.reason);
        l2.push("");
      }
      l2.push("**📊 Твои слабые места:**");
      if (ctx.kda < 2) l2.push("• Низкий KDA (" + ctx.kda.toFixed(2) + ")");
      if (ctx.deaths >= 6) l2.push("• Много смертей (" + ctx.deaths + ")");
      if (ctx.gpm < 450) l2.push("• Слабый фарм (" + ctx.gpm + " GPM)");
      l2.push("");
      l2.push("💡 Спроси «что надо было сделать» — разберу подробнее.");
      return l2.join("\n");
    }

    if (s.indexOf("что надо было") >= 0 || s.indexOf("что нужно было") >= 0 || s.indexOf("как победить") >= 0 || s.indexOf("чтобы победить") >= 0) {
      var l3 = [];
      l3.push("💡 **Что нужно было сделать на " + ctx.hero + "**");
      l3.push("");

      if (ctx.deepReport && ctx.deepReport.farming && ctx.deepReport.farming.phases && ctx.deepReport.farming.phases.length) {
        l3.push("**📈 Фарм по фазам:**");
        for (var k = 0; k < ctx.deepReport.farming.phases.length; k++) {
          var ph = ctx.deepReport.farming.phases[k];
          l3.push("• " + ph.phase + " — не хватало " + ph.deficit + " зол/мин");
        }
        l3.push("");
      }

      if (ctx.deepReport && ctx.deepReport.farming && ctx.deepReport.farming.holes && ctx.deepReport.farming.holes.length) {
        l3.push("**🔴 Минуты остановки фарма:**");
        for (var m2 = 0; m2 < Math.min(ctx.deepReport.farming.holes.length, 3); m2++) {
          var h = ctx.deepReport.farming.holes[m2];
          l3.push("• " + h.minute + " мин — " + h.reason);
        }
        l3.push("");
      }

      if (ctx.deepReport && ctx.deepReport.fights && ctx.deepReport.fights.length) {
        l3.push("**⚔ Ошибки в драках:**");
        for (var f = 0; f < Math.min(ctx.deepReport.fights.length, 3); f++) {
          var fight = ctx.deepReport.fights[f];
          var mm = Math.floor(fight.time / 60);
          var ss = fight.time % 60;
          l3.push("• " + (mm < 10 ? "0" : "") + mm + ":" + (ss < 10 ? "0" : "") + ss + " — " + fight.advice);
        }
        l3.push("");
      }

      l3.push("**🎯 Базовые советы:**");
      if (ctx.deaths >= 5) l3.push("• Смотри мини-карту каждые 3-5 сек");
      if (ctx.gpm < 500) l3.push("• Стакай лагеря на 53-й секунде");
      if (ctx.kda < 2.5) l3.push("• Не заходи первым в драку");
      if (ctx.lastHits / Math.max(ctx.duration, 1) < 5) l3.push("• Тренируй ластхиты в Demo Hero");
      l3.push("• Пуш волну перед рунами (3:00, 6:00, 9:00, 12:00)");
      return l3.join("\n");
    }

    if (s.indexOf("фарм") >= 0 || s.indexOf("гпм") >= 0 || s.indexOf("gpm") >= 0) {
      var l4 = [];
      l4.push("💰 **Разбор фарма на " + ctx.hero + "**");
      l4.push("");
      l4.push("**Средний GPM:** " + ctx.gpm);
      l4.push("**Ластхиты:** " + ctx.lastHits + " за " + ctx.duration.toFixed(0) + " мин");
      l4.push("**LH/мин:** " + (ctx.lastHits / Math.max(ctx.duration, 1)).toFixed(1));
      l4.push("");
      if (ctx.deepReport && ctx.deepReport.farming && ctx.deepReport.farming.phases) {
        for (var ph2 = 0; ph2 < ctx.deepReport.farming.phases.length; ph2++) {
          var p2 = ctx.deepReport.farming.phases[ph2];
          l4.push("• **" + p2.phase + "**: " + p2.avgGrowth + " зол/мин (норма " + p2.target + ")");
        }
        l4.push("");
      }
      if (ctx.deepReport && ctx.deepReport.farming && ctx.deepReport.farming.holes) {
        l4.push("**🔴 Провалы фарма:**");
        for (var h2 = 0; h2 < Math.min(ctx.deepReport.farming.holes.length, 5); h2++) {
          var ho = ctx.deepReport.farming.holes[h2];
          l4.push("• " + ho.minute + " мин — " + ho.reason);
        }
        l4.push("");
      }
      l4.push("**💡 Как поднять GPM:**");
      l4.push("• Стакай лагеря на 53-й секунде");
      l4.push("• Фарми между драками");
      l4.push("• Пуш волну перед рунами");
      l4.push("• Забирай вардовые лагеря у врага");
      return l4.join("\n");
    }

    if (s.indexOf("перелом") >= 0 || s.indexOf("момент") >= 0) {
      if (!ctx.deepReport || !ctx.deepReport.turningPoints || !ctx.deepReport.turningPoints.length) {
        return "🤔 Не нашёл резких переломов — либо игра шла ровно, либо матч не распарсен.";
      }
      var l5 = ["⚡ **Переломные моменты матча**", ""];
      for (var t = 0; t < ctx.deepReport.turningPoints.length; t++) {
        var tp2 = ctx.deepReport.turningPoints[t];
        var s2 = tp2.goldSwing > 0 ? "+" : "";
        l5.push("**" + tp2.time + " мин** — " + tp2.reason);
        l5.push("Скачок: " + s2 + tp2.goldSwing + " золота");
        l5.push("");
      }
      l5.push("💡 Смотри реплей в эти минуты.");
      return l5.join("\n");
    }

    if (s.indexOf("разбери") >= 0 || s.indexOf("как я сыграл") >= 0 || s.indexOf("оцени") >= 0) {
      return buildFullReview(ctx);
    }

    if (s.indexOf("кда") >= 0 || s.indexOf("kda") >= 0) {
      return "📊 **KDA:** " + ctx.kills + "/" + ctx.deaths + "/" + ctx.assists + " (" + ctx.kda.toFixed(2) + ")";
    }
    if (s.indexOf("урон") >= 0 || s.indexOf("дамаг") >= 0) {
      return "⚔ **Урон по героям:** " + ctx.heroDamage + "\n**По строениям:** " + ctx.towerDamage;
    }

    return null;
  }

  function buildFullReview(ctx) {
    var l = [];
    l.push("📊 **Разбор матча: " + ctx.hero + "**");
    l.push("");
    l.push("**Результат:** " + (ctx.won ? "победа 🏆" : "поражение"));
    l.push("**KDA:** " + ctx.kills + "/" + ctx.deaths + "/" + ctx.assists + " (" + ctx.kda.toFixed(2) + ")");
    l.push("**GPM/XPM:** " + ctx.gpm + " / " + ctx.xpm);
    l.push("**Длительность:** " + ctx.duration.toFixed(1) + " мин");
    l.push("");

    if (ctx.deepReport && ctx.deepReport.turningPoints && ctx.deepReport.turningPoints.length) {
      l.push("**⚡ Ключевой момент:**");
      var tp = ctx.deepReport.turningPoints[0];
      l.push("• " + tp.time + " мин — " + tp.reason);
      l.push("");
    }

    var good = [];
    if (ctx.won) good.push("Победа");
    if (ctx.kda >= 4) good.push("Отличный KDA");
    if (ctx.gpm >= 550) good.push("Высокий GPM");
    if (ctx.deaths <= 3) good.push("Мало смертей");
    if (good.length) {
      l.push("✅ **Хорошо:**");
      for (var i = 0; i < good.length; i++) l.push("• " + good[i]);
      l.push("");
    }

    var bad = [];
    if (!ctx.won) bad.push("Поражение");
    if (ctx.kda < 2) bad.push("Низкий KDA");
    if (ctx.deaths >= 6) bad.push("Много смертей (" + ctx.deaths + ")");
    if (ctx.gpm < 450) bad.push("Слабый GPM");
    if (bad.length) {
      l.push("⚠️ **Улучшить:**");
      for (var j = 0; j < bad.length; j++) l.push("• " + bad[j]);
      l.push("");
    }

    l.push("_Спроси: «почему проиграл», «кто руинер», «как фармить»._");
    return l.join("\n");
  }

  function isSmallTalk(q) {
    var s = String(q || "").toLowerCase().trim();
    var hw = ["привет","прив","здарова","здоров","хай","ку","hi","hello","hey","здравствуй"];
    for (var i = 0; i < hw.length; i++) if (s.indexOf(hw[i]) === 0) return true;
    var tw = ["спасиб","благодар","спс","thanks","thx"];
    for (var j = 0; j < tw.length; j++) if (s.indexOf(tw[j]) === 0) return true;
    return false;
  }

  function generateAutoReview(ctx) {
    if (!ctx) return null;
    return buildFullReview(ctx) + "\n\n---\n\n_Можешь задать любой вопрос про матч ниже._";
  }

  function typeWriter(el, text, speed, cb) {
    speed = speed || 8;
    var i = 0; el.textContent = "";
    var ch = text.split("");
    function tick() {
      if (i < ch.length) {
        el.textContent += ch[i++];
        if (i % 5 === 0) { var l = qs("#aiMatchLog"); if (l) l.scrollTop = l.scrollHeight; }
        setTimeout(tick, speed);
      } else if (cb) cb();
    }
    tick();
  }

  /* ─── ФИКС: простой рендер без удаления переносов ─── */
  function renderMarkdown(text) {
    if (!text) return "";
    var h = String(text);
    h = h.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    /* Заголовки */
    h = h.replace(/^### (.+)$/gm, '<strong style="display:block;margin-top:12px;font-size:14px;color:var(--accent-light);">$1</strong>');
    h = h.replace(/^## (.+)$/gm, '<strong style="display:block;margin-top:14px;font-size:15px;color:var(--accent-light);">$1</strong>');
    /* Жирный и курсив */
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/_(.+?)_/g, '<em style="color:var(--text-muted);">$1</em>');
    /* HR */
    h = h.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:10px 0;">');
    /* Списки */
    h = h.replace(/^- (.+)$/gm, '<div style="padding:3px 0 3px 14px;">• $1</div>');
    /* Перенос строк — БЕЗ агрессивной очистки */
    h = h.replace(/\n/g, '<br>');
    return h;
  }

  function addThinkingBlock(log) {
    var wrap = el("div", { style: "display:flex;gap:10px;align-items:flex-start;opacity:0.7;" });
    var avatar = el("div", { style: "width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;background:var(--accent-bg);color:var(--accent-light);border:1px solid var(--accent);" }, "AI");
    var box = el("div", { style: "flex:1;padding:10px 14px;border-radius:12px;font-size:12px;line-height:1.6;background:var(--bg-card);border:1px dashed var(--accent);color:var(--text-muted);font-family:'JetBrains Mono',monospace;white-space:pre-wrap;" });
    var line = el("div", {}, "Думаю...");
    box.appendChild(line);
    wrap.appendChild(avatar); wrap.appendChild(box);
    log.appendChild(wrap); log.scrollTop = log.scrollHeight;
    return {
      addStep: function (text) { box.appendChild(el("div", { style: "margin-top:2px;padding-left:10px;opacity:0.75;" }, "→ " + text)); log.scrollTop = log.scrollHeight; },
      setStep: function (text) { line.textContent = text; log.scrollTop = log.scrollHeight; },
      finalize: function () { wrap.remove(); }
    };
  }

  window.addAiBlockToReport = function () {
    if (document.getElementById(AI_BLOCK_ID)) return;
    if (Store.get("ai.enabled", true) === false) return;
    if (!Store.get("license.active", false)) return;
    var report = qs("#analyzeReport");
    if (!report || !report.children || report.children.length === 0) return;

    var card = UI.card("🤖 ИИ-разбор матча");
    card.id = AI_BLOCK_ID;
    var log = el("div", { id: "aiMatchLog", style: "max-height:520px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 0;margin-bottom:10px;" });

    var ctx = collectFullContext();
    if (ctx) {
      var autoText = generateAutoReview(ctx);
      var autoBubble = el("div", { style: "padding:14px 16px;background:var(--bg-elev);border-radius:10px;font-size:13px;line-height:1.65;color:var(--text);max-width:100%;" });
      autoBubble.innerHTML = renderMarkdown(autoText);
      log.appendChild(autoBubble);
    }
    card.appendChild(log);

    var row = el("div", { class: "row", style: "gap:8px;" });
    var inp = UI.input("Спроси про матч...");
    inp.style.flex = "1";
    var btn = UI.btn("Спросить");
    row.appendChild(inp); row.appendChild(btn);
    card.appendChild(row);

    async function ask() {
      if (isAiMatchResponding) return;
      var q = (inp.value || "").trim();
      if (!q) return;
      isAiMatchResponding = true;
      inp.disabled = true; btn.disabled = true; inp.value = "";

      log.appendChild(el("div", { style: "padding:8px 12px;background:var(--accent-bg);border-radius:10px;font-size:13px;align-self:flex-end;max-width:80%;color:var(--text);" }, q));

      var think = addThinkingBlock(log);

      try {
        think.setStep("Читаю данные матча...");
        await new Promise(function (r) { setTimeout(r, 400 + Math.random() * 300); });

        var ctxNow = collectFullContext();
        if (!ctxNow) {
          think.finalize();
          log.appendChild(el("div", { style: "padding:10px 12px;background:var(--bg-elev);border-radius:10px;font-size:13px;color:var(--text);max-width:85%;" }, "⚠ Нет данных матча. Сначала разбери матч на странице «Анализ»."));
          isAiMatchResponding = false; inp.disabled = false; btn.disabled = false; inp.focus();
          return;
        }

        think.addStep("Герой: " + ctxNow.hero + ", KDA: " + ctxNow.kills + "/" + ctxNow.deaths + "/" + ctxNow.assists);

        if (isSmallTalk(q)) {
          think.setStep("Это small talk...");
          await new Promise(function (r) { setTimeout(r, 300); });
          think.finalize();
          var stAns = typeof brainAnswer === "function" ? brainAnswer(q) : { text: "Привет!" };
          var stBubble = el("div", { style: "padding:10px 12px;background:var(--bg-elev);border-radius:10px;font-size:13px;line-height:1.55;color:var(--text);max-width:85%;" });
          log.appendChild(stBubble);
          typeWriter(stBubble, stAns.text || "Привет!", 10, function () {
            isAiMatchResponding = false; inp.disabled = false; btn.disabled = false; inp.focus();
          });
          return;
        }

        think.setStep("Анализирую матч через BrainMatchAnalyzer...");
        await new Promise(function (r) { setTimeout(r, 500 + Math.random() * 300); });

        if (ctxNow.deepReport) {
          if (ctxNow.deepReport.turningPoints && ctxNow.deepReport.turningPoints.length) {
            think.addStep("Нашёл " + ctxNow.deepReport.turningPoints.length + " переломных моментов");
          }
          if (ctxNow.deepReport.ruiner) {
            think.addStep("Определил руинера");
          }
        }

        var matchAnswer = getMatchAnswer(q, ctxNow);

        if (matchAnswer) {
          think.setStep("Формулирую ответ...");
          await new Promise(function (r) { setTimeout(r, 400 + Math.random() * 300); });
          think.finalize();

          var bubble = el("div", { style: "padding:10px 12px;background:var(--bg-elev);border-radius:10px;font-size:13px;line-height:1.55;color:var(--text);max-width:85%;" });
          log.appendChild(bubble);
          bubble.innerHTML = renderMarkdown(matchAnswer);
          log.scrollTop = log.scrollHeight;
          isAiMatchResponding = false; inp.disabled = false; btn.disabled = false; inp.focus();
          return;
        }

        think.setStep("Общий вопрос — использую полный brain...");
        await new Promise(function (r) { setTimeout(r, 400); });
        think.finalize();

        var contextStr = ctxToText(ctxNow);
        var fullQuery = contextStr ? "Контекст матча: " + contextStr + ". Вопрос: " + q : q;
        var ans = typeof brainAnswer === "function" ? brainAnswer(fullQuery) : { text: "ИИ недоступен." };
        var txt = (ans && ans.text) ? ans.text : "Не удалось получить ответ.";

        var fbubble = el("div", { style: "padding:10px 12px;background:var(--bg-elev);border-radius:10px;font-size:13px;line-height:1.55;color:var(--text);max-width:85%;" });
        log.appendChild(fbubble);
        if (txt.length > 200) {
          fbubble.innerHTML = renderMarkdown(txt);
          isAiMatchResponding = false; inp.disabled = false; btn.disabled = false; inp.focus();
          log.scrollTop = log.scrollHeight;
        } else {
          typeWriter(fbubble, txt, 10, function () {
            isAiMatchResponding = false; inp.disabled = false; btn.disabled = false; inp.focus();
          });
        }
      } catch (err) {
        try { think.finalize(); } catch (e) {}
        log.appendChild(el("div", { style: "padding:10px 12px;background:var(--bg-elev);border-radius:10px;font-size:13px;color:var(--red);max-width:85%;" }, "⚠ Ошибка: " + (err.message || err)));
        isAiMatchResponding = false; inp.disabled = false; btn.disabled = false; inp.focus();
      }
    }
    btn.addEventListener("click", ask);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); ask(); } });
    report.appendChild(card);
  };
  console.log("ai-match v4.1 ready (FIXED markdown + unified brain)");
})();
