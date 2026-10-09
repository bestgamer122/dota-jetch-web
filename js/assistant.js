/* DOTA JETCH — ИИ-АССИСТЕНТ v25.0 FINAL
   Сохранение матча, фоновые запросы, красивый скролл, кнопка вниз, анимация */

var chatHistory = [];
var isResponding = false;

if (typeof window !== "undefined") {
  window.__chatPending = null;
}

async function loadChatMatchContext(matchId, heroName) {
  var match = await apiGet("/matches/" + matchId);
  if (!match || !match.players) throw new Error("Матч не найден");
  var heroes = await getHeroes();
  if (!heroes || !heroes.length) throw new Error("Герои недоступны");
  var hero = null;
  for (var i = 0; i < heroes.length; i++) {
    if (heroes[i].name === heroName) { hero = heroes[i]; break; }
  }
  if (!hero) throw new Error("Герой не найден");
  var player = null;
  for (var j = 0; j < match.players.length; j++) {
    if (match.players[j].hero_id === hero.id) { player = match.players[j]; break; }
  }
  if (!player) throw new Error("Игрок не найден");
  var isRadiant = player.player_slot < 128;
  var won = (match.radiant_win && isRadiant) || (!match.radiant_win && !isRadiant);
  var durMin = (match.duration || 0) / 60;
  return { match: match, player: player, hero: hero, heroes: heroes, won: won, durMin: durMin, position: null };
}

function isChatAtBottom(log) {
  if (!log) return true;
  return (log.scrollHeight - log.scrollTop - log.clientHeight) < 40;
}

function scrollChatToBottom(log) {
  if (!log) return;
  log.scrollTop = log.scrollHeight;
  var btn = qs("#chatScrollDownBtn");
  if (btn) { btn.style.opacity = "0"; btn.style.pointerEvents = "none"; }
}

function updateScrollDownBtn(log) {
  var btn = qs("#chatScrollDownBtn");
  if (!btn || !log) return;
  if (isChatAtBottom(log)) {
    btn.style.opacity = "0";
    btn.style.pointerEvents = "none";
  } else {
    btn.style.opacity = "1";
    btn.style.pointerEvents = "auto";
  }
}

function buildMatchDropdown(history, onSelect) {
  var wrap = el("div", { style: "position:relative;user-select:none;" });
  var btn = el("button", {
    type: "button",
    style: "width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;color:var(--text);font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;text-align:left;transition:all 0.2s ease;"
  });
  var btnContent = el("div", { style: "flex:1;display:flex;align-items:center;gap:10px;min-width:0;" });
  var btnIcon = el("span", { style: "font-size:16px;" }, "🎯");
  var btnLabel = el("span", { style: "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" },
    history.length ? "Выбери матч из истории" : "История матчей пуста");
  btnContent.appendChild(btnIcon); btnContent.appendChild(btnLabel);
  btn.appendChild(btnContent);
  var arrow = el("span", { style: "color:var(--text-muted);font-size:10px;transition:transform 0.2s ease;" }, "▼");
  btn.appendChild(arrow);

  var list = el("div", {
    style: "position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:100;background:var(--bg-card);border:1px solid var(--accent);border-radius:12px;padding:6px;max-height:280px;overflow-y:auto;box-shadow:0 20px 60px -20px rgba(0,0,0,0.9);opacity:0;transform:translateY(-6px) scale(0.98);pointer-events:none;transition:opacity 0.2s,transform 0.2s;"
  });

  var currentValue = "";
  function renderItems() {
    list.innerHTML = "";
    if (!history.length) {
      list.appendChild(el("div", { style: "padding:14px;text-align:center;color:var(--text-muted);font-size:12px;" }, "Разбери матч на вкладке «Анализ»"));
      return;
    }
    for (var i = 0; i < history.length; i++) {
      (function (m) {
        var isActive = String(m.matchId) === currentValue;
        var row = el("button", {
          type: "button",
          style: "display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;background:" + (isActive ? "var(--accent-bg)" : "transparent") + ";border:none;border-radius:9px;color:var(--text);font-family:inherit;font-size:12px;cursor:pointer;text-align:left;"
        });
        row.addEventListener("mouseenter", function () { if (!isActive) row.style.background = "var(--bg-hover)"; });
        row.addEventListener("mouseleave", function () { if (!isActive) row.style.background = "transparent"; });
        row.appendChild(el("span", { style: "font-size:16px;flex-shrink:0;" }, m.won ? "🏆" : "💀"));
        var info = el("div", { style: "flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;" });
        var heroLine = el("div", { style: "display:flex;align-items:center;gap:6px;" });
        heroLine.appendChild(el("span", { style: "font-weight:700;color:" + (m.won ? "var(--green)" : "var(--red)") + ";" }, m.heroName || "?"));
        var kdaColor = (m.kills || 0) + (m.assists || 0) >= (m.deaths || 0) * 3 ? "var(--green)" : (m.deaths >= 8 ? "var(--red)" : "var(--text-muted)");
        heroLine.appendChild(el("span", { style: "font-family:'JetBrains Mono',monospace;font-size:11px;color:" + kdaColor + ";" }, (m.kills||0) + "/" + (m.deaths||0) + "/" + (m.assists||0)));
        info.appendChild(heroLine);
        var dt = m.ts ? new Date(m.ts) : null;
        if (dt) info.appendChild(el("span", { style: "font-size:10px;color:var(--text-dim);" }, String(dt.getDate()).padStart(2,"0") + "." + String(dt.getMonth()+1).padStart(2,"0") + "." + dt.getFullYear()));
        row.appendChild(info);
        if (isActive) row.appendChild(el("span", { style: "color:var(--green);font-weight:700;" }, "✓"));
        row.addEventListener("click", function () {
          currentValue = String(m.matchId);
          btnIcon.textContent = m.won ? "🏆" : "💀";
          btnLabel.textContent = (m.heroName || "?") + " · " + (m.kills||0) + "/" + (m.deaths||0) + "/" + (m.assists||0);
          btnLabel.style.color = m.won ? "var(--green)" : "var(--red)";
          btn.style.borderColor = "var(--accent)";
          closeList();
          onSelect(String(m.matchId), m.heroName || "");
        });
        list.appendChild(row);
      })(history[i]);
    }
  }
  function openList() {
    renderItems();
    list.style.opacity = "1"; list.style.transform = "translateY(0) scale(1)"; list.style.pointerEvents = "auto";
    arrow.style.transform = "rotate(180deg)";
    btn.style.borderColor = "var(--accent)"; btn.style.background = "var(--accent-bg)";
  }
  function closeList() {
    list.style.opacity = "0"; list.style.transform = "translateY(-6px) scale(0.98)"; list.style.pointerEvents = "none";
    arrow.style.transform = "rotate(0deg)";
    btn.style.background = currentValue ? "var(--accent-bg)" : "var(--bg-elev)";
    btn.style.borderColor = currentValue ? "var(--accent)" : "var(--border)";
  }
  btn.addEventListener("click", function (e) { e.stopPropagation(); if (list.style.pointerEvents === "auto") closeList(); else openList(); });
  document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) closeList(); });
  wrap.appendChild(btn); wrap.appendChild(list);
  return { wrap: wrap, setValue: function (m) {
    currentValue = String(m.matchId);
    btnIcon.textContent = m.won ? "🏆" : "💀";
    btnLabel.textContent = (m.heroName || "?") + " · " + (m.kills||0) + "/" + (m.deaths||0) + "/" + (m.assists||0);
    btnLabel.style.color = m.won ? "var(--green)" : "var(--red)";
    btn.style.borderColor = "var(--accent)";
    btn.style.background = "var(--accent-bg)";
  } };
}

function renderChat() {
  var plus = Store.get("license.active", false) === true;
  if (!plus) return renderChatLocked();

  var frag = document.createDocumentFragment();
  var chatCard = UI.card("Чат с ИИ");

  var logWrap = el("div", { style: "position:relative;" });
  var log = el("div", { id: "chatLog", style: "max-height:480px;overflow-y:auto;padding:4px 0;display:flex;flex-direction:column;gap:10px;scroll-behavior:auto;" });
  logWrap.appendChild(log);

  var scrollBtn = el("button", {
    id: "chatScrollDownBtn",
    type: "button",
    style: "opacity:0;pointer-events:none;position:absolute;bottom:12px;right:16px;width:36px;height:36px;border-radius:50%;background:rgba(139,92,246,0.15);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:var(--accent-light);border:1px solid var(--accent);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:50;transition:opacity 0.25s ease,transform 0.15s ease;font-family:inherit;"
  }, "↓");
  scrollBtn.addEventListener("mouseenter", function () { scrollBtn.style.transform = "scale(1.08)"; scrollBtn.style.background = "rgba(139,92,246,0.3)"; });
  scrollBtn.addEventListener("mouseleave", function () { scrollBtn.style.transform = "scale(1)"; scrollBtn.style.background = "rgba(139,92,246,0.15)"; });
  scrollBtn.addEventListener("click", function () { scrollChatToBottom(log); });
  logWrap.appendChild(scrollBtn);
  chatCard.appendChild(logWrap);
  frag.appendChild(chatCard);

  log.addEventListener("scroll", function () { updateScrollDownBtn(log); });

  var inputCard = el("div", { class: "card" });
  inputCard.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em;" }, "Выбери матч для контекста"));

  var history = Store.get("recentmatches", []) || [];
  var statusEl = el("div", { id: "chatMatchStatus", style: "font-size:11px;margin:10px 0;min-height:14px;line-height:1.4;" }, "");

  var inp = UI.input(history.length ? "Сначала выбери матч сверху..." : "История матчей пуста.");
  inp.id = "chatInput"; inp.style.flex = "1"; inp.disabled = true;
  inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); onChatSend(); } });
  var btn = UI.btn("Отправить", { id: "chatSendBtn" });
  btn.addEventListener("click", onChatSend);
  btn.disabled = true;
  var row = el("div", { class: "row" });
  row.appendChild(inp); row.appendChild(btn);

  var savedMatchId = Store.get("chatselectedmatch", null);

  var dropdown = buildMatchDropdown(history, async function (matchId, heroName) {
    Store.set("chatselectedmatch", { matchId: matchId, heroName: heroName });
    var inputEl = qs("#chatInput"), sendBtn = qs("#chatSendBtn");
    if (!matchId) {
      window.chatMatchContext = null;
      inputEl.disabled = true; sendBtn.disabled = true;
      inputEl.placeholder = "Сначала выбери матч сверху...";
      if (statusEl) { statusEl.textContent = ""; }
      return;
    }
    if (statusEl) { statusEl.textContent = "Загружаю матч..."; statusEl.style.color = "var(--text-muted)"; }
    inputEl.disabled = true; sendBtn.disabled = true;
    try {
      var ctx = await loadChatMatchContext(parseInt(matchId, 10), heroName);
      window.chatMatchContext = ctx;
      inputEl.disabled = false; sendBtn.disabled = false;
      inputEl.placeholder = "Спроси про матч..."; inputEl.focus();
      if (statusEl) { statusEl.textContent = "Готово. Спрашивай."; statusEl.style.color = "var(--green)"; }
    } catch (e) {
      console.error("loadChatMatchContext:", e);
      window.chatMatchContext = null;
      inputEl.disabled = true; sendBtn.disabled = true;
      if (statusEl) { statusEl.textContent = "Ошибка загрузки. Попробуй другой."; statusEl.style.color = "var(--red)"; }
    }
  });

  inputCard.appendChild(dropdown.wrap);
  inputCard.appendChild(statusEl);
  inputCard.appendChild(row);
  frag.appendChild(inputCard);

  setTimeout(async function () {
    var l = qs("#chatLog");
    if (!l) return;
    var saved = Store.get("chathistory", []);
    if (Array.isArray(saved) && saved.length) {
      chatHistory = saved;
      for (var i = 0; i < chatHistory.length; i++) {
        addChatMessage(l, chatHistory[i].role, chatHistory[i].text, false);
      }
    } else {
      chatHistory = [];
      if (!history.length) {
        addChatMessage(l, "assistant", "Привет. Чтобы я мог отвечать с учётом твоей игры — сначала разбери матч на вкладке «Анализ».", false);
      } else {
        addChatMessage(l, "assistant", "Привет. Выбери матч из списка выше — я загружу его данные.", false);
      }
    }
    l.scrollTop = l.scrollHeight;

    if (savedMatchId && savedMatchId.matchId) {
      var m = null;
      for (var k = 0; k < history.length; k++) {
        if (String(history[k].matchId) === String(savedMatchId.matchId)) { m = history[k]; break; }
      }
      if (m) {
        dropdown.setValue(m);
        try {
          var ctx = await loadChatMatchContext(parseInt(savedMatchId.matchId, 10), savedMatchId.heroName || m.heroName);
          window.chatMatchContext = ctx;
          var inputEl = qs("#chatInput");
          var sendBtn = qs("#chatSendBtn");
          if (inputEl) { inputEl.disabled = false; inputEl.placeholder = "Спроси про матч..."; }
          if (sendBtn) sendBtn.disabled = false;
          if (statusEl) { statusEl.textContent = "Готово. Спрашивай."; statusEl.style.color = "var(--green)"; }
        } catch (e) {
          console.warn("Не удалось восстановить контекст:", e);
          Store.set("chatselectedmatch", null);
        }
      }
    }

    if (window.__chatPending && window.__chatPending.result) {
      var pending = window.__chatPending;
      window.__chatPending = null;
      addChatMessage(l, "user", pending.query, false);
      var bubble = addChatMessage(l, "assistant", "", false);
      bubble.innerHTML = renderMarkdownFull(pending.result);
      l.scrollTop = l.scrollHeight;
    }
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
  row.appendChild(avatar); row.appendChild(bubble);
  log.appendChild(row);
  if (scroll) log.scrollTop = log.scrollHeight;
  return bubble;
}

function addThinkingBlock(log) {
  var wrap = el("div", { style: "display:flex;gap:10px;align-items:flex-start;opacity:0.85;" });
  var avatar = el("div", { style: "width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;background:var(--accent-bg);color:var(--accent-light);border:1px solid var(--accent);" }, "AI");
  var box = el("div", { style: "flex:1;padding:12px 16px;border-radius:12px;font-size:12px;line-height:1.7;background:var(--bg-card);border:1px dashed var(--accent);color:var(--text-muted);font-family:'JetBrains Mono',monospace;" });
  var stepsContainer = el("div");
  box.appendChild(stepsContainer);
  wrap.appendChild(avatar); wrap.appendChild(box);
  log.appendChild(wrap);
  if (isChatAtBottom(log)) log.scrollTop = log.scrollHeight;

  var steps = [];
  var currentStepIdx = -1;
  function renderSteps() {
    stepsContainer.innerHTML = "";
    for (var i = 0; i < steps.length; i++) {
      var isCurrent = i === currentStepIdx;
      var isDone = i < currentStepIdx;
      var icon = isDone ? "✓" : (isCurrent ? "⏳" : "○");
      var color = isDone ? "var(--green)" : (isCurrent ? "var(--accent-light)" : "var(--text-dim)");
      var opacity = isCurrent ? 1 : (isDone ? 0.75 : 0.4);
      var line = el("div", { style: "display:flex;align-items:center;gap:8px;padding:3px 0;color:" + color + ";opacity:" + opacity + ";transition:all 0.3s ease;" });
      line.appendChild(el("span", { style: "font-size:11px;width:14px;text-align:center;" }, icon));
      line.appendChild(el("span", {}, steps[i]));
      stepsContainer.appendChild(line);
    }
    if (steps.length > 0) {
      var pct = ((currentStepIdx + 1) / steps.length) * 100;
      var bar = el("div", { style: "margin-top:8px;height:3px;background:var(--bg-elev);border-radius:2px;overflow:hidden;" });
      bar.appendChild(el("div", { style: "height:100%;width:" + pct + "%;background:linear-gradient(90deg,var(--accent),var(--cyan));border-radius:2px;transition:width 0.4s ease;" }));
      stepsContainer.appendChild(bar);
    }
  }
  return {
    addStep: function (text) {
      steps.push(text); currentStepIdx = steps.length - 1;
      renderSteps();
      if (isChatAtBottom(log)) log.scrollTop = log.scrollHeight;
    },
    finalize: function () { wrap.remove(); }
  };
}

function renderInline(text) {
  var h = text;
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(^|[^\w])_(.+?)_([^\w]|$)/g, '$1<em style="color:var(--text-muted);">$2</em>$3');
  return h;
}

function renderMarkdownFull(text) {
  if (!text) return "";
  var lines = String(text).split("\n");
  var out = [];
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    line = line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    if (line.trim() === "") { out.push('<div style="height:8px;"></div>'); continue; }
    if (/^---+$/.test(line.trim())) { out.push('<hr style="border:none;border-top:1px solid var(--border);margin:8px 0;">'); continue; }
    var h3 = line.match(/^###\s+(.+)$/);
    if (h3) { out.push('<div style="margin-top:10px;font-size:13px;font-weight:700;color:var(--accent-light);">' + renderInline(h3[1]) + '</div>'); continue; }
    var h2 = line.match(/^##\s+(.+)$/);
    if (h2) { out.push('<div style="margin-top:12px;font-size:14px;font-weight:700;color:var(--accent-light);">' + renderInline(h2[1]) + '</div>'); continue; }
    var li = line.match(/^[-•]\s+(.+)$/);
    if (li) { out.push('<div style="padding:2px 0 2px 14px;">• ' + renderInline(li[1]) + '</div>'); continue; }
    out.push('<div>' + renderInline(line) + '</div>');
  }
  return out.join("");
}

async function onChatSend() {
  if (isResponding) return;
  var plus = Store.get("license.active", false) === true;
  if (!plus) return;
  if (!window.chatMatchContext) {
    var log0 = qs("#chatLog");
    if (log0) addChatMessage(log0, "assistant", "Сначала выбери матч из списка сверху.");
    return;
  }

  var inp = qs("#chatInput");
  var log = qs("#chatLog");
  var btn = qs("#chatSendBtn");
  if (!inp || !log) return;
  var q = (inp.value || "").trim();
  if (!q) return;

  isResponding = true;
  inp.disabled = true; btn.disabled = true; inp.value = "";
  btn.textContent = "Думаю...";

  addChatMessage(log, "user", q);
  chatHistory.push({ role: "user", text: q });
  Store.set("aiquestions", (Store.get("aiquestions", 0) || 0) + 1);
  Store.set("chathistory", chatHistory.slice(-100));
  if (typeof Daily !== "undefined") Daily.bump("chat");
  if (typeof Achievements !== "undefined") Achievements.check();

  scrollChatToBottom(log);

  var think = addThinkingBlock(log);
  think.addStep("Читаю данные матча...");

  try {
    var matchCtx = ExternalAI.buildMatchContext();
    think.addStep("Анализирую контекст игры...");
    await new Promise(function (r) { setTimeout(r, 400); });
    think.addStep("Формулирую ответ...");

    window.__chatPending = { query: q, matchContext: matchCtx, result: null };

    var externalText = await ExternalAI.ask(q, matchCtx);

    if (window.__chatPending) window.__chatPending.result = externalText;

    think.finalize();
    var finalText = externalText || "Не удалось получить ответ.";
    var bubble = addChatMessage(log, "assistant", "", false);
    var fullHTML = renderMarkdownFull(finalText);
    var plainText = finalText;
    var i = 0;
    function typeTick() {
      if (i < plainText.length) {
        i += 3;
        if (i > plainText.length) i = plainText.length;
        bubble.innerHTML = renderMarkdownFull(plainText.slice(0, i));
        if (isChatAtBottom(log)) log.scrollTop = log.scrollHeight;
        if (i % 6 === 0) updateScrollDownBtn(log);
        setTimeout(typeTick, 12);
      } else {
        bubble.innerHTML = fullHTML;
        if (isChatAtBottom(log)) log.scrollTop = log.scrollHeight;
        updateScrollDownBtn(log);
        chatHistory.push({ role: "assistant", text: finalText });
        Store.set("chathistory", chatHistory.slice(-100));
        window.__chatPending = null;
        isResponding = false;
        inp.disabled = false; btn.disabled = false;
        btn.textContent = "Отправить";
        inp.focus();
      }
    }
    typeTick();
  } catch (err) {
    console.warn("External AI failed:", err);
    think.finalize();
    var errBubble = addChatMessage(log, "assistant", "", false);
    errBubble.textContent = err.message || "Не удалось получить ответ. Попробуй через минуту.";
    chatHistory.push({ role: "assistant", text: errBubble.textContent });
    Store.set("chathistory", chatHistory.slice(-100));
    window.__chatPending = null;
    isResponding = false;
    inp.disabled = false; btn.disabled = false;
    btn.textContent = "Отправить";
    inp.focus();
  }
}
