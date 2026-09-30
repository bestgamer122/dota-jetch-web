/* DOTA JETCH — AI MATCH v2.0 */

(function () {
  "use strict";
  var AI_BLOCK_ID = "aiMatchBlock";
  var isAiMatchResponding = false;

  function collectMatchContext() {
    var report = qs("#analyzeReport");
    if (!report) return null;
    var text = report.innerText || "";
    var ctx = {};
    var hm = text.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)?)\n/);
    if (hm) ctx.hero = hm[1];
    var kda = text.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/);
    if (kda) { ctx.kills = +kda[1]; ctx.deaths = +kda[2]; ctx.assists = +kda[3]; }
    var g = text.match(/GPM\s*(\d+)/i); if (g) ctx.gpm = +g[1];
    var x = text.match(/XPM\s*(\d+)/i); if (x) ctx.xpm = +x[1];
    var l = text.match(/Ластхиты\s*(\d+)/i); if (l) ctx.lastHits = +l[1];
    var d = text.match(/(\d+\.?\d*)\s*мин/); if (d) ctx.duration = +d[1];
    var hd = text.match(/Урон героям\s*(\d+)/i); if (hd) ctx.heroDmg = +hd[1];
    if (text.indexOf("ПОБЕДА") >= 0) ctx.result = "победа";
    else if (text.indexOf("ПОРАЖЕНИЕ") >= 0) ctx.result = "поражение";
    return ctx;
  }

  function buildContextString(c) {
    if (!c) return "";
    var p = [];
    if (c.hero) p.push("Герой: " + c.hero);
    if (c.kills !== undefined) p.push("KDA: " + c.kills + "/" + c.deaths + "/" + c.assists);
    if (c.gpm) p.push("GPM: " + c.gpm);
    if (c.duration) p.push("Длительность: " + c.duration + " мин");
    if (c.result) p.push("Результат: " + c.result);
    return p.join(". ");
  }

  function generateAutoReview(c) {
    if (!c || !c.hero) return null;
    var L = [];
    L.push("## 📋 Автоматический разбор матча");
    L.push("");
    L.push("**Герой:** " + c.hero);
    L.push("**Результат:** " + (c.result || "?").toUpperCase());
    L.push("**KDA:** " + c.kills + "/" + c.deaths + "/" + c.assists + " (" + ((c.kills + c.assists) / Math.max(c.deaths, 1)).toFixed(2) + ")");
    if (c.gpm) L.push("**GPM/XPM:** " + c.gpm + " / " + (c.xpm || "?"));
    if (c.duration) L.push("**Длительность:** " + c.duration + " мин");
    L.push(""); L.push("---"); L.push("");

    var kda = (c.kills + c.assists) / Math.max(c.deaths, 1);
    var good = [];
    if (c.result === "победа") good.push("Победа в матче");
    if (kda >= 4) good.push("Отличный KDA (" + kda.toFixed(2) + ")");
    else if (kda >= 3) good.push("Хороший KDA (" + kda.toFixed(2) + ")");
    if (c.gpm >= 550) good.push("Высокий GPM (" + c.gpm + ")");
    if (c.deaths <= 3 && c.duration > 15) good.push("Мало смертей (" + c.deaths + ")");
    if (c.lastHits && c.duration && c.lastHits / c.duration >= 7) good.push("Отличный фарм (" + (c.lastHits / c.duration).toFixed(1) + " LH/мин)");
    if (c.heroDmg && c.duration && c.heroDmg / c.duration >= 700) good.push("Высокий урон по героям");
    if (good.length) {
      L.push("### ✅ Что было хорошо"); L.push("");
      for (var i = 0; i < good.length; i++) L.push("- " + good[i]);
      L.push("");
    }

    var bad = [];
    if (c.result === "поражение") bad.push("Поражение — разбери, где потеряли темп");
    if (kda < 1.5) bad.push("Низкий KDA (" + kda.toFixed(2) + ")");
    else if (kda < 2.5) bad.push("Средний KDA (" + kda.toFixed(2) + ")");
    if (c.deaths >= 8) bad.push("Много смертей (" + c.deaths + ") — играй осторожнее");
    else if (c.deaths >= 5) bad.push("Смертей " + c.deaths + " — можно уменьшить");
    if (c.gpm < 350) bad.push("Низкий GPM (" + c.gpm + ")");
    else if (c.gpm < 450) bad.push("GPM ниже среднего (" + c.gpm + ")");
    if (c.lastHits && c.duration && c.lastHits / c.duration < 4) bad.push("Слабый фарм");
    if (c.heroDmg && c.duration && c.heroDmg / c.duration < 300) bad.push("Низкий урон по героям");
    if (bad.length) {
      L.push("### ⚠️ Что было не так"); L.push("");
      for (var j = 0; j < bad.length; j++) L.push("- " + bad[j]);
      L.push("");
    }

    var adv = [];
    if (c.deaths >= 5) adv.push("**Больше смотри мини-карту** — каждые 3-5 секунд");
    if (c.gpm < 450) adv.push("**Стакай лагеря на 53-й секунде** — цель 600+ GPM");
    if (c.lastHits && c.duration && c.lastHits / c.duration < 6) adv.push("**Тренируй ластхиты** в Demo Hero");
    if (kda < 2.5) adv.push("**Не заходи первым в драку** — жди инициатора");
    if (c.heroDmg && c.duration && c.heroDmg / c.duration < 500) adv.push("**Будь активнее в драках**");
    if (c.result === "поражение") adv.push("**Разбери реплей** — запиши в дневник");
    if (!adv.length) adv.push("Продолжай в том же духе!");
    L.push("### 💡 Что нужно было сделать"); L.push("");
    for (var k = 0; k < adv.length; k++) L.push("- " + adv[k]);
    L.push(""); L.push("---"); L.push("");
    L.push("_Можешь задать вопрос про этот матч._");
    return L.join("\n");
  }

  function isSmallTalk(q) {
    var s = String(q || "").toLowerCase().trim();
    var hw = ["привет","прив","здарова","здоров","хай","ку","hi","hello","hey","здравствуй","добрый день","добрый вечер","доброе утро"];
    for (var i = 0; i < hw.length; i++) if (s.indexOf(hw[i]) === 0) return true;
    var tw = ["спасиб","благодар","спс","thanks","thx"];
    for (var j = 0; j < tw.length; j++) if (s.indexOf(tw[j]) === 0) return true;
    if (s.indexOf("как дела") >= 0 || s.indexOf("как ты") >= 0 || s.indexOf("как жизнь") >= 0) return true;
    return false;
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

  function renderMarkdown(text) {
    if (!text) return "";
    var h = String(text);
    h = h.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    h = h.replace(/^### (.+)$/gm, '<strong style="display:block;margin-top:12px;font-size:14px;color:var(--accent-light);">$1</strong>');
    h = h.replace(/^## (.+)$/gm, '<strong style="display:block;margin-top:14px;font-size:15px;color:var(--accent-light);">$1</strong>');
    h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    h = h.replace(/_(.+?)_/g, '<em style="color:var(--text-muted);">$1</em>');
    h = h.replace(/^---$/gm, '<hr style="border:none;border-top:1px solid var(--border);margin:10px 0;">');
    h = h.replace(/^- (.+)$/gm, '<div style="padding:3px 0 3px 14px;">• $1</div>');
    h = h.replace(/\n/g, '<br>');
    h = h.replace(/(<br>)+(<strong)/g, '$2');
    h = h.replace(/(<\/strong>)(<br>)+/g, '$1');
    h = h.replace(/(<hr[^>]*>)(<br>)+/g, '$1');
    h = h.replace(/(<div[^>]*>)/g, '<br>$1');
    return h;
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

    var ctx = collectMatchContext();
    if (ctx && ctx.hero) {
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

    function ask() {
      if (isAiMatchResponding) return;
      var q = (inp.value || "").trim();
      if (!q) return;
      isAiMatchResponding = true;
      inp.disabled = true; btn.disabled = true; inp.value = "";

      log.appendChild(el("div", { style: "padding:8px 12px;background:var(--accent-bg);border-radius:10px;font-size:13px;align-self:flex-end;max-width:80%;color:var(--text);" }, q));

      var ans;
      if (isSmallTalk(q)) {
        ans = typeof brainAnswer === "function" ? brainAnswer(q) : { text: "ИИ недоступен." };
      } else {
        var c2 = collectMatchContext();
        var cs = buildContextString(c2);
        ans = typeof brainAnswer === "function" ? brainAnswer(cs ? "Контекст: " + cs + ". Вопрос: " + q : q) : { text: "ИИ недоступен." };
      }

      var botDiv = el("div", { style: "padding:10px 12px;background:var(--bg-elev);border-radius:10px;font-size:13px;line-height:1.55;color:var(--text);max-width:85%;" });
      log.appendChild(botDiv);
      log.scrollTop = log.scrollHeight;

      var txt = (ans && ans.text) ? ans.text : "Не удалось получить ответ.";
      if (txt.length > 200) {
        botDiv.innerHTML = renderMarkdown(txt);
        isAiMatchResponding = false; inp.disabled = false; btn.disabled = false; inp.focus();
        log.scrollTop = log.scrollHeight;
      } else {
        typeWriter(botDiv, txt, 10, function () {
          isAiMatchResponding = false; inp.disabled = false; btn.disabled = false; inp.focus();
        });
      }
    }
    btn.addEventListener("click", ask);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); ask(); } });
    report.appendChild(card);
  };
  console.log("ai-match v2.0 ready");
})();
