/* DOTA JETCH — AI MATCH v1.2
   Не требует правок в analyze.js. Использует MutationObserver. */

(function () {
  "use strict";

  var AI_BLOCK_ID = "aiMatchBlock";
  var observer = null;

  function addAiBlock() {
    if (document.getElementById(AI_BLOCK_ID)) return;
    if (Store.get("ai.enabled", true) === false) return;
    if (!Store.get("license.active", false)) return;

    /* Ищем контейнер с отчётом. Пробуем разные варианты ID. */
    var report = qs("#analyzeReport") || qs("#pageContent");
    if (!report) return;

    /* Проверяем, что отчёт уже построен (есть карточки) */
    if (!report.children || report.children.length === 0) return;

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
      var q = (inp.value || "").trim();
      if (!q) return;
      inp.value = "";

      log.appendChild(el("div", {
        style: "padding:8px 12px;background:var(--accent-bg);border-radius:10px;font-size:13px;align-self:flex-end;max-width:80%;"
      }, q));

      var ans = typeof brainAnswer === "function"
        ? brainAnswer("Разбери матч. Вопрос: " + q)
        : { text: "ИИ недоступен." };

      log.appendChild(el("div", {
        style: "padding:10px 12px;background:var(--bg-elev);border-radius:10px;font-size:13px;line-height:1.55;white-space:pre-wrap;max-width:85%;"
      }, ans.text));

      log.scrollTop = log.scrollHeight;
    }

    btn.addEventListener("click", ask);
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); ask(); }
    });

    report.appendChild(card);
    console.log("ai-match: блок добавлен");
  }

  /* Наблюдаем за изменениями в #pageContent */
  function startObserver() {
    var target = qs("#pageContent");
    if (!target) {
      setTimeout(startObserver, 500);
      return;
    }

    if (observer) observer.disconnect();

    observer = new MutationObserver(function () {
      /* Небольшая задержка, чтобы отчёт успел построиться */
      setTimeout(addAiBlock, 200);
    });

    observer.observe(target, { childList: true, subtree: true });
    console.log("ai-match: observer запущен");
  }

  /* Запускаем при загрузке */
  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(startObserver, 1000);
  });

  /* Также пробуем добавить блок при переключении страниц */
  var origSwitch = window.switchPage;
  if (typeof origSwitch === "function") {
    window.switchPage = function (name) {
      origSwitch.apply(this, arguments);
      setTimeout(addAiBlock, 1500);
    };
  }

  console.log("ai-match v1.2 ready");
})();
