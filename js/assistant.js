/* DOTA JETCH — ИИ-АССИСТЕНТ v3.4.0 — FREE блокирован */

var chatHistory = [];

function renderChat() {
  var plus = Store.get("license.active", false) === true;
  if (!plus) return renderChatLocked();

  var frag = document.createDocumentFragment();
  var head = UI.card("ИИ-ассистент · JETCH+");
  head.appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "Спроси про героя, предмет или механику."));
  frag.appendChild(head);

  var chatCard = UI.card("Чат");
  var log = el("div", { id: "chatLog", style: "max-height:420px;overflow-y:auto;padding:4px 0;display:flex;flex-direction:column;gap:10px;" });
  chatCard.appendChild(log);
  frag.appendChild(chatCard);

  var inputCard = el("div", { class: "card" });
  var row = el("div", { class: "row" });
  var inp = UI.input("Спроси...");
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
      addChatMessage(l, "assistant", "Привет! Спроси что-нибудь: «что делает BKB», «как играть на пудже».");
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
  wrap.appendChild(el("div", { style: "font-size:52px;margin-bottom:16px;" }, "🔒"));
  wrap.appendChild(el("div", { style: "font-size:18px;font-weight:700;color:var(--text);margin-bottom:10px;" }, "Доступно только в JETCH+"));
  wrap.appendChild(el("div", { class: "dim", style: "font-size:13px;line-height:1.6;max-width:440px;margin:0 auto 20px;" },
    "ИИ-ассистент с локальной базой (герои, предметы, механики) открывается с подпиской JETCH+."));
  var upBtn = UI.btn("Активировать JETCH+");
  upBtn.addEventListener("click", function () { switchPage("settings"); });
  wrap.appendChild(upBtn);
  card.appendChild(wrap);
  frag.appendChild(card);
  return frag;
}

function addChatMessage(log, role, text, scroll) {
  if (scroll === undefined) scroll = true;
  var isUser = role === "user";
  var row = el("div", { style: "display:flex;gap:10px;align-items:flex-start;" + (isUser ? "flex-direction:row-reverse;" : "") });
  var avatar = el("div", {
    style: "width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;background:" + (isUser ? "var(--accent-bg)" : "var(--cyan-bg)") + ";color:" + (isUser ? "var(--accent-light)" : "var(--cyan)") + ";"
  }, isUser ? "Я" : "AI");
  var bubble = el("div", {
    style: "max-width:80%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word;background:" + (isUser ? "var(--accent-bg)" : "var(--bg-elev)") + ";border:1px solid var(--border);"
  }, text);
  row.appendChild(avatar);
  row.appendChild(bubble);
  log.appendChild(row);
  if (scroll) log.scrollTop = log.scrollHeight;
}

async function onChatSend() {
  var plus = Store.get("license.active", false) === true;
  if (!plus) return;
  var inp = qs("#chatInput");
  var log = qs("#chatLog");
  var btn = qs("#chatSendBtn");
  if (!inp || !log) return;
  var q = (inp.value || "").trim();
  if (!q) return;
  inp.value = "";
  addChatMessage(log, "user", q);
  chatHistory.push({ role: "user", text: q });
  Store.set("aiquestions", (Store.get("aiquestions", 0) || 0) + 1);
  if (typeof Achievements !== "undefined") Achievements.check();
  btn.disabled = true;
  btn.textContent = "Думаю...";
  await new Promise(function (r) { setTimeout(r, 300); });
  var answer;
  try { answer = kbAnswer(q); } catch (e) { answer = { text: "Ошибка: " + (e.message || e) }; }
  addChatMessage(log, "assistant", answer.text);
  chatHistory.push({ role: "assistant", text: answer.text });
  Store.set("chathistory", chatHistory.slice(-100));
  btn.disabled = false;
  btn.textContent = "Отправить";
  inp.focus();
}