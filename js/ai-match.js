/* DOTA JETCH — AI MATCH v1.0 */

(function () {
  "use strict";

  var AI_BLOCK_ID = "aiMatchBlock";

  function addAiBlock() {
    if (!Store.get("ai.enabled", true) !== false) return;
    if (!Store.get("license.active", false)) return;

    var page = qs("#pageContent");
    if (!page) return;

    var html = page.innerHTML || "";
    if (html.indexOf("KDA") < 0 && html.indexOf("Анализ матча") < 0) return;
    if (document.getElementById(AI_BLOCK_ID)) return;

    var card = UI.card("🤖 ИИ-разбор матча");
    card.id = AI_BLOCK_ID;

    var log = el("div", {
      id: "aiMatchLog",
      style: "max-height:240px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;padding:4px 0;margin-bottom:10px;"
    });

    var autoDiv = el("div", {
      style: "padding:10px 12px;background:var(--bg-elev);border-radius:10px;font-size:13px;line-height:1.55;white-space:pre-wrap;"
    }, "Задай вопрос про этот матч — ИИ разберёт твою игру.");
    log.appendChild(autoDiv);

    card.appendChild(log);

    var row = el("div", { class: "row", style: "gap:8px;" });
    var inp = UI.input("Спроси про матч...");
    inp.style.flex = "1";
    var btn = UI.btn("Спросить");
    row.appendChild(inp);
    row.appendChild(btn);
    card.appendChild(row);
        function ask() {
      var q = (inp.value || "").trim();
      if (!q) return;
      inp.value = "";
      var userDiv = el("div", {
        style: "padding:8px 12px;background:var(--accent-bg);border-radius:10px;font-size:13px;align-self:flex-end;max-width:80%;"
      }, q);
      log.appendChild(userDiv);
      var ctx = "Разбери матч. Вопрос: " + q;
      var ans = typeof brainAnswer === "function" ? brainAnswer(ctx) : { text: "ИИ недоступен." };
      var botDiv = el("div", {
        style: "padding:10px 12px;background:var(--bg-elev);border-radius:10px;font-size:13px;line-height:1.55;white-space:pre-wrap;max-width:85%;"
      }, ans.text);
      log.appendChild(botDiv);
      log.scrollTop = log.scrollHeight;
    }

    btn.addEventListener("click", ask);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); ask(); } });

    page.appendChild(card);
  }

  var origSwitch = window.switchPage;
  if (typeof origSwitch === "function") {
    window.switchPage = function (name) {
      origSwitch.apply(this, arguments);
      setTimeout(addAiBlock, 500);
    };
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(addAiBlock, 1000);
  });

  console.log("ai-match v1.0 ready");
})();
