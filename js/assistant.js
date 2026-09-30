/* DOTA JETCH — ИИ-АССИСТЕНТ v13.1 (антиспам + анимация печати + таймаут) */

var chatHistory = [];
var isResponding = false;

function renderChat() {
  var plus = Store.get("license.active", false) === true;
  if (!plus) return renderChatLocked();

  var frag = document.createDocumentFragment();
  var chatCard = UI.card("Чат");
  var log = el("div", { id: "chatLog", style: "max-height:520px;overflow-y:auto;padding:4px 0;display:flex;flex-direction:column;gap:10px;" });
  chatCard.appendChild(log);
  frag.appendChild(chatCard);

  var inputCard = el("div", { class: "card" });
  var row = el("div", { class: "row" });
  var inp = UI.input("Напиши что-нибудь...");
  inp.id = "chatInput";
  inp.style.flex = "1";
  inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); onChatSend(); } });
  var btn = UI.btn("Отправить", { id: "chatSendBtn" });
  btn.addEventListener("click", onChatSend);
  row.appendChild(inp);
  row.appendChild(btn);
  inputCard.appendChild(row);
  frag.appendChild(inputCard);

  setTimeout(function () {
    var saved = Store.get("chathistory", []);
    chatHistory = Array.isArray(saved) ? saved : [];
    var l = qs("#chatLog");
    if (!l) return;
    if (!chatHistory.length) {
      addChatMessage(l, "assistant", "Привет. Чем помочь?");
    } else {
      for (var i = 0; i < chatHistory.length; i++) addChatMessage(l, chatHistory[i].role, chatHistory[i].text, false);
    }
    l.scrollTop = l.scrollHeight;
  }, 0);

  return frag;
}

function renderChatLocked() {
  var frag = document.createDocumentFragment();
  var card = UI.card("ИИ-ассистент");
  var wrap = el("div", { style: "text-align:center;padding:40px 20px;" });
  wrap.appendChild(el("div", { style: "font-size:52px;margin-bottom:16px;font-weight:800;color:var(--text-dim);" }, "X"));
  wrap.appendChild(el("div", { style: "font-size:18px;font-weight:700;color:var(--text);margin-bottom:10px;" }, "Только в JETCH+"));
  wrap.appendChild(el("div", { class: "dim", style: "font-size:13px;line-height:1.6;max-width:440px;margin:0 auto 20px;" }, "Доступно с подпиской JETCH+."));
  var btn = UI.btn("Активировать JETCH+");
  btn.addEventListener("click", function () { switchPage("settings"); });
  wrap.appendChild(btn);
  card.appendChild(wrap);
  frag.appendChild(card);
  return frag;
}

function addChatMessage(log, role, text, scroll) {
  if (scroll === undefined) scroll = true;
  var isUser = role === "user";
  var row = el("div", { style: "display:flex;gap:10px;align-items:flex-start;" + (isUser ? "flex-direction:row-reverse;" : "") });
  var avatar = el("div", {
    style: "width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;background:" + (isUser ? "var(--accent-bg)" : "var(--cyan-bg)") + ";color:" + (isUser ? "var(--accent-light)" : "var(--cyan)") + ";border:1px solid var(--border);"
  }, isUser ? "Я" : "AI");
  var bubble = el("div", {
    style: "max-width:80%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word;background:var(--bg-elev);border:1px solid var(--border);"
  }, text);
  row.appendChild(avatar);
  row.appendChild(bubble);
  log.appendChild(row);
  if (scroll) log.scrollTop = log.scrollHeight;
  return bubble;
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

function typeWriter(el, text, speed, callback) {
  speed = speed || 20;
  var i = 0;
  el.textContent = "";
  function tick() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      var log = qs("#chatLog");
      if (log) log.scrollTop = log.scrollHeight;
      setTimeout(tick, speed);
    } else {
      if (callback) callback();
    }
  }
  tick();
}

/* Обёртка с таймаутом для вызова ИИ */
function brainAnswerWithTimeout(question, timeoutMs) {
  return new Promise(function (resolve) {
    var done = false;
    var timer = setTimeout(function () {
      if (!done) {
        done = true;
        resolve({ text: "⚠ ИИ не ответил вовремя. Попробуй ещё раз.", confidence: 0, trace: [] });
      }
    }, timeoutMs || 15000);
    try {
      var result = brainAnswer(question);
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve(result);
      }
    } catch (e) {
      if (!done) {
        done = true;
        clearTimeout(timer);
        resolve({ text: "⚠ Ошибка ИИ: " + (e.message || e), confidence: 0, trace: [] });
      }
    }
  });
}

async function onChatSend() {
  if (isResponding) return;
  var plus = Store.get("license.active", false) === true;
  if (!plus) return;
  var inp = qs("#chatInput");
  var log = qs("#chatLog");
  var btn = qs("#chatSendBtn");
  if (!inp || !log) return;
  var q = (inp.value || "").trim();
  if (!q) return;

  isResponding = true;
  inp.disabled = true;
  btn.disabled = true;
  inp.value = "";
  btn.textContent = "Думаю...";

  addChatMessage(log, "user", q);
  chatHistory.push({ role: "user", text: q });
  Store.set("aiquestions", (Store.get("aiquestions", 0) || 0) + 1);
  if (typeof Daily !== "undefined") Daily.bump("chat");
  if (typeof Achievements !== "undefined") Achievements.check();

  /* Фидбек — обрабатываем отдельно, без таймаута */
  if (typeof BrainFeedback !== "undefined" && BrainFeedback.detect(q)) {
    var fbAnswer = brainAnswer(q);
    var fbBubble = addChatMessage(log, "assistant", "", false);
    typeWriter(fbBubble, fbAnswer.text, 15, function () {
      chatHistory.push({ role: "assistant", text: fbAnswer.text });
      Store.set("chathistory", chatHistory.slice(-100));
      isResponding = false;
      inp.disabled = false;
      btn.disabled = false;
      btn.textContent = "Отправить";
      inp.focus();
    });
    return;
  }

  var think = addThinkingBlock(log);

  try {
    think.setStep("Анализирую запрос...");
    await new Promise(function (r) { setTimeout(r, 500 + Math.random() * 400); });

    var answer = await brainAnswerWithTimeout(q, 15000);

    if (answer.trace && answer.trace.length) {
      for (var i = 0; i < answer.trace.length; i++) {
        think.addStep(answer.trace[i]);
        await new Promise(function (r) { setTimeout(r, 350 + Math.random() * 250); });
      }
    }

    think.setStep("Формулирую ответ...");
    await new Promise(function (r) { setTimeout(r, 500 + Math.random() * 400); });

    think.finalize();

    var finalText = answer.text || "Не удалось получить ответ.";
    if (typeof answer.confidence === "number" && answer.confidence < 0.6 && answer.confidence > 0) {
      finalText += "\n\n(уверенность: " + Math.round(answer.confidence * 100) + "%)";
    }

    var bubble = addChatMessage(log, "assistant", "", false);
    typeWriter(bubble, finalText, 12, function () {
      chatHistory.push({ role: "assistant", text: finalText });
      Store.set("chathistory", chatHistory.slice(-100));
      isResponding = false;
      inp.disabled = false;
      btn.disabled = false;
      btn.textContent = "Отправить";
      inp.focus();
    });
  } catch (err) {
    think.finalize();
    var errBubble = addChatMessage(log, "assistant", "", false);
    typeWriter(errBubble, "⚠ Произошла ошибка: " + (err.message || err), 12, function () {
      isResponding = false;
      inp.disabled = false;
      btn.disabled = false;
      btn.textContent = "Отправить";
      inp.focus();
    });
  }
}
