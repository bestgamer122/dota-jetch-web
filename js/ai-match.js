/* DOTA JETCH — AI MATCH v1.4 (антиспам + анимация печати) */

(function () {
  "use strict";

  var AI_BLOCK_ID = "aiMatchBlock";
  var isAiMatchResponding = false;

  function collectMatchContext() {
    var report = qs("#analyzeReport");
    if (!report) return null;
    var text = report.innerText || "";
    var ctx = {};
    var heroMatch = text.match(/([A-Z][a-z]+(?: [A-Z][a-z]+)?)\n/);
    if (heroMatch) ctx.hero = heroMatch[1];
    var kdaMatch = text.match(/(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)/);
    if (kdaMatch) { ctx.kills = kdaMatch[1]; ctx.deaths = kdaMatch[2]; ctx.assists = kdaMatch[3]; }
    var gpmMatch = text.match(/GPM\s*(\d+)/i);
    if (gpmMatch) ctx.gpm = gpmMatch[1];
    var xpmMatch = text.match(/XPM\s*(\d+)/i);
    if (xpmMatch) ctx.xpm = xpmMatch[1];
    var deathsMatch = text.match(/Смертей:\s*(\d+)/i);
    if (deathsMatch) ctx.deathsCount = deathsMatch[1];
    if (text.indexOf("ПОБЕДА") >= 0) ctx.result = "победа";
    else if (text.indexOf("ПОРАЖЕНИЕ") >= 0) ctx.result = "поражение";
    return ctx;
  }

  function buildContextString(ctx) {
    if (!ctx) return "";
    var parts = [];
    if (ctx.hero) parts.push("Герой: " + ctx.hero);
    if (ctx.kills) parts.push("KDA: " + ctx.kills + "/" + ctx.deaths + "/" + ctx.assists);
    if (ctx.gpm) parts.push("GPM: " + ctx.gpm);
    if (ctx.xpm) parts.push("XPM: " + ctx.xpm);
    if (ctx.deathsCount) parts.push("Смертей: " + ctx.deathsCount);
    if (ctx.result) parts.push("Результат: " + ctx.result);
    return parts.join(". ");
  }

  function typeWriter(el, text, speed, callback) {
    speed = speed || 12;
    var i = 0;
    el.textContent = "";
    function tick() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        var log = qs("#aiMatchLog");
        if (log) log.scrollTop = log.scrollHeight;
        setTimeout(tick, speed);
      } else {
        if (callback) callback();
      }
    }
    tick();
  }

  function addAiBlockToReport() {
    if (document.getElementById(AI_BLOCK_ID)) return;
    if (Store.get("ai.enabled", true) === false) return;
    if (!Store.get("license.active", false)) return;

    var report = qs("#analyzeReport");
    if (!report || !report.children || report.children.length === 0) return;

    var card = UI.card("🤖 ИИ-разбор матча");
    card.id = AI_BLOCK_ID;

    var log = el("div", {
      id: "aiMatchLog",
      style: "max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 0;margin-bottom:10px;"
    });

    log.appendChild(el("div", {
      style: "padding:10px 12px;background:var(--bg-elev);border-radius:10px;font-size:13px;line-height:1.55;white-space:pre-wrap;"
    }, "Задай вопрос про этот матч — ИИ разберёт твою игру."));

    card.appendChild(log);

    var row = el("div", { class: "row", style: "gap:8px;" });
    var inp = UI.input("Спроси про матч...");
    inp.style.flex = "1";
    var btn = UI.btn("Спросить");
    row.appendChild(inp);
    row.appendChild(btn);
    card.appendChild(row);

    function ask() {
      if (isAiMatchResponding) return;
      var q = (inp.value || "").trim();
      if (!q) return;

      isAiMatchResponding = true;
      inp.disabled = true;
      btn.disabled = true;
      inp.value = "";

      log.appendChild(el("div", {
        style: "padding:8px 12px;background:var(--accent-bg);border-radius:10px;font-size:13px;align-self:flex-end;max-width:80%;"
      }, q));

      var ctx = collectMatchContext();
      var ctxStr = buildContextString(ctx);
      var fullQ = "Контекст матча: " + ctxStr + ". Вопрос: " + q;

      var ans = typeof brainAnswer === "function" ? brainAnswer(fullQ) : { text: "ИИ недоступен." };

      var botDiv = el("div", {
        style: "padding:10px 12px;background:var(--bg-elev);border-radius:10px;font-size:13px;line-height:1.55;white-space:pre-wrap;max-width:85%;"
      });
      log.appendChild(botDiv);
      log.scrollTop = log.scrollHeight;

      typeWriter(botDiv, ans.text, 12, function () {
        isAiMatchResponding = false;
        inp.disabled = false;
        btn.disabled = false;
        inp.focus();
      });
    }

    btn.addEventListener("click", ask);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); ask(); } });

    report.appendChild(card);
  }

  window.addAiBlockToReport = addAiBlockToReport;

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function () {
      if (qs("#analyzeReport") && qs("#analyzeReport").children.length > 0) {
        addAiBlockToReport();
      }
    }, 1500);
  });

  console.log("ai-match v1.4 ready");
})();
