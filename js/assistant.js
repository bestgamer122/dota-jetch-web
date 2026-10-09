/* DOTA JETCH — ИИ-АССИСТЕНТ v22.0
   Выбор матча из истории + блокировка чата до выбора.
   Mistral получает контекст выбранного матча. */

var chatHistory = [];
var isResponding = false;

async function loadChatMatchContext(matchId, heroName) {
  var match = await apiGet("/matches/" + matchId);
  if (!match || !match.players) throw new Error("Матч не найден");
  var heroes = await getHeroes();
  if (!heroes || !heroes.length) throw new Error("Герои недоступны");

  var hero = null;
  for (var i = 0; i < heroes.length; i++) {
    if (heroes[i].name === heroName) { hero = heroes[i]; break; }
  }
  if (!hero) throw new Error("Герой не найден: " + heroName);

  var player = null;
  for (var j = 0; j < match.players.length; j++) {
    if (match.players[j].hero_id === hero.id) { player = match.players[j]; break; }
  }
  if (!player) throw new Error("Игрок не найден в матче");

  var isRadiant = player.player_slot < 128;
  var won = (match.radiant_win && isRadiant) || (!match.radiant_win && !isRadiant);
  var durMin = (match.duration || 0) / 60;

  return {
    match: match,
    player: player,
    hero: hero,
    heroes: heroes,
    won: won,
    durMin: durMin,
    position: null
  };
}

function buildMatchOption(m) {
  var won = m.won ? "🏆" : "💀";
  var kda = (m.kills || 0) + "/" + (m.deaths || 0) + "/" + (m.assists || 0);
  var dt = m.ts ? new Date(m.ts) : null;
  var dateStr = dt ? (String(dt.getDate()).padStart(2,"0") + "." + String(dt.getMonth()+1).padStart(2,"0")) : "?";
  return won + " " + (m.heroName || "?") + " · " + kda + " · " + dateStr;
}

function renderChat() {
  var plus = Store.get("license.active", false) === true;
  if (!plus) return renderChatLocked();

  var frag = document.createDocumentFragment();
  var chatCard = UI.card("Чат с ИИ");
  var log = el("div", { id: "chatLog", style: "max-height:480px;overflow-y:auto;padding:4px 0;display:flex;flex-direction:column;gap:10px;" });
  chatCard.appendChild(log);
  frag.appendChild(chatCard);

  var inputCard = el("div", { class: "card" });

  var selectLabel = el("div", { class: "dim", style: "font-size:11px;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.08em;" }, "📊 Выбери матч для контекста");
  inputCard.appendChild(selectLabel);

  var history = Store.get("recentmatches", []) || [];
  var selectWrap = el("div", { style: "margin-bottom:12px;position:relative;" });
  var select = el("select", {
    id: "chatMatchSelect",
    style: "width:100%;padding:11px 14px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;font-family:inherit;font-weight:600;cursor:pointer;outline:none;"
  });

  var placeholder = el("option", { value: "" }, history.length ? "— Выбери матч из истории —" : "— История матчей пуста —");
  select.appendChild(placeholder);

  for (var i = 0; i < history.length; i++) {
    var opt = el("option", { value: String(history[i].matchId) }, buildMatchOption(history[i]));
    opt.setAttribute("data-hero", history[i].heroName || "");
    select.appendChild(opt);
  }
  selectWrap.appendChild(select);
  inputCard.appendChild(selectWrap);

  var statusEl = el("div", { id: "chatMatchStatus", style: "font-size:11px;margin-bottom:10px;min-height:14px;line-height:1.4;" }, "");
  inputCard.appendChild(statusEl);

  var row = el("div", { class: "row" });
  var inp = UI.input(history.length ? "Сначала выбери матч сверху..." : "История матчей пуста. Разбери матч сначала.");
  inp.id = "chatInput";
  inp.style.flex = "1";
  inp.disabled = true;
  inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); onChatSend(); } });
  var btn = UI.btn("Отправить", { id: "chatSendBtn" });
  btn.addEventListener("click", onChatSend);
  btn.disabled = true;
  row.appendChild(inp);
  row.appendChild(btn);
  inputCard.appendChild(row);

  frag.appendChild(inputCard);

  select.addEventListener("change", async function () {
    var val = select.value;
    var statusMsg = qs("#chatMatchStatus");
    var inputEl = qs("#chatInput");
    var sendBtn = qs("#chatSendBtn");

    if (!val) {
      window.chatMatchContext = null;
      inputEl.disabled = true;
      sendBtn.disabled = true;
      inputEl.placeholder = "Сначала выбери матч сверху...";
      if (statusMsg) { statusMsg.textContent = ""; statusMsg.style.color = ""; }
      return;
    }

    var hero = "";
    for (var k = 0; k < select.options.length; k++) {
      if (select.options[k].value === val) { hero = select.options[k].getAttribute("data-hero") || ""; break; }
    }

    if (statusMsg) {
      statusMsg.textContent = "⏳ Загружаю матч...";
      statusMsg.style.color = "var(--text-muted)";
    }
    inputEl.disabled = true;
    sendBtn.disabled = true;

    try {
      var ctx = await loadChatMatchContext(parseInt(val, 10), hero);
      window.chatMatchContext = ctx;
      inputEl.disabled = false;
      sendBtn.disabled = false;
      inputEl.placeholder = "Спроси про матч...";
      inputEl.focus();
      if (statusMsg) {
        statusMsg.textContent = "✓ Контекст загружен: " + ctx.hero.name + " (" + (ctx.won ? "победа" : "поражение") + ") — можешь спрашивать";
        statusMsg.style.color = "var(--green)";
      }
    } catch (e) {
      console.error("loadChatMatchContext:", e);
      window.chatMatchContext = null;
      inputEl.disabled = true;
      sendBtn.disabled = true;
      if (statusMsg) {
        statusMsg.textContent = "✕ Ошибка загрузки: " + (e.message || e);
        statusMsg.style.color = "var(--red)";
      }
    }
  });

  setTimeout(function () {
    var l = qs("#chatLog");
    if (!l) return;
    if (!history.length) {
      addChatMessage(l, "assistant", "Привет. Чтобы я мог отвечать с учётом твоей игры — сначала разбери матч на вкладке «Анализ». После этого он появится в списке выше.");
    } else {
      addChatMessage(l, "assistant", "Привет. Выбери матч из списка выше — я загружу его контекст (герой, KDA, врагов, союзников) и буду отвечать с учётом этой игры.");
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

function addThinkingBlock(log, label) {
  var wrap = el("div", { style: "display:flex;gap:10px;align-items:flex-start;opacity:0.7;" });
  var avatar = el("div", { style: "width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;background:var(--accent-bg);color:var(--accent-light);border:1px solid var(--accent);" }, "AI");
  var box = el("div", { style: "flex:1;padding:10px 14px;border-radius:12px;font-size:12px;line-height:1.6;background:var(--bg-card);border:1px dashed var(--accent);color:var(--text-muted);font-family:'JetBrains Mono',monospace;white-space:pre-wrap;" });
  var line = el("div", {}, label || "Думаю...");
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
  speed = speed || 12;
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

async function onChatSend() {
  if (isResponding) return;
  var plus = Store.get("license.active", false) === true;
  if (!plus) return;

  if (!window.chatMatchContext) {
    var log0 = qs("#chatLog");
    if (log0) addChatMessage(log0, "assistant", "⚠ Сначала выбери матч из списка сверху — без него я не могу отвечать.");
    return;
  }

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

  var think = addThinkingBlock(log, "Думаю...");

  try {
    think.setStep("Читаю выбранный матч...");
    await new Promise(function (r) { setTimeout(r, 250 + Math.random() * 200); });

    think.addStep("Передаю Mistral с контекстом матча...");
    var matchCtx = ExternalAI.buildMatchContext();
    var externalText = await ExternalAI.ask(q, matchCtx);

    think.addStep("✓ Mistral ответил");
    think.setStep("Формулирую ответ...");
    await new Promise(function (r) { setTimeout(r, 200 + Math.random() * 200); });
    think.finalize();

    var finalText = externalText || "Не удалось получить ответ.";
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
    console.warn("External AI failed:", err);
    think.finalize();
    var errBubble = addChatMessage(log, "assistant", "", false);
    typeWriter(errBubble, "⚠ Не смог получить ответ от Mistral.\n\nОшибка: " + (err.message || err) + "\n\nПопробуй ещё раз через несколько секунд.", 12, function () {
      isResponding = false;
      inp.disabled = false;
      btn.disabled = false;
      btn.textContent = "Отправить";
      inp.focus();
    });
  }
}
