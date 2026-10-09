/* DOTA JETCH — ИИ-АССИСТЕНТ v23.0
   Красивый селектор матча + нейтральные сообщения. */

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

/* ─── Кастомный красивый dropdown ─── */
function buildMatchDropdown(history, onSelect) {
  var wrap = el("div", { style: "position:relative;user-select:none;" });

  var btn = el("button", {
    type: "button",
    style: "width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 16px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;color:var(--text);font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;text-align:left;transition:border-color 0.2s ease,background 0.2s ease;"
  });

  var btnContent = el("div", { style: "flex:1;display:flex;align-items:center;gap:10px;min-width:0;" });
  var btnIcon = el("span", { style: "font-size:16px;" }, "🎯");
  var btnLabel = el("span", { style: "overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" },
    history.length ? "Выбери матч из истории" : "История матчей пуста");
  btnContent.appendChild(btnIcon);
  btnContent.appendChild(btnLabel);
  btn.appendChild(btnContent);
  var arrow = el("span", { style: "color:var(--text-muted);font-size:10px;transition:transform 0.2s ease;" }, "▼");
  btn.appendChild(arrow);

  var list = el("div", {
    style: "position:absolute;top:calc(100% + 6px);left:0;right:0;z-index:100;background:var(--bg-card);border:1px solid var(--accent);border-radius:12px;padding:6px;max-height:280px;overflow-y:auto;box-shadow:0 20px 60px -20px rgba(0,0,0,0.9);opacity:0;transform:translateY(-6px) scale(0.98);pointer-events:none;transition:opacity 0.2s,transform 0.2s;"
  });

  var currentValue = "";
  var currentHero = "";

  function renderItems() {
    list.innerHTML = "";
    if (!history.length) {
      list.appendChild(el("div", {
        style: "padding:14px;text-align:center;color:var(--text-muted);font-size:12px;"
      }, "Разбери матч на вкладке «Анализ», чтобы он появился здесь"));
      return;
    }
    for (var i = 0; i < history.length; i++) {
      (function (m) {
        var isActive = String(m.matchId) === currentValue;
        var row = el("button", {
          type: "button",
          style: "display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;background:" + (isActive ? "var(--accent-bg)" : "transparent") + ";border:none;border-radius:9px;color:var(--text);font-family:inherit;font-size:12px;cursor:pointer;text-align:left;transition:background 0.15s ease;"
        });
        row.addEventListener("mouseenter", function () { if (!isActive) row.style.background = "var(--bg-hover)"; });
        row.addEventListener("mouseleave", function () { if (!isActive) row.style.background = "transparent"; });

        var icon = el("span", { style: "font-size:16px;flex-shrink:0;" }, m.won ? "🏆" : "💀");
        row.appendChild(icon);

        var info = el("div", { style: "flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;" });
        var heroLine = el("div", { style: "display:flex;align-items:center;gap:6px;" });
        heroLine.appendChild(el("span", { style: "font-weight:700;color:" + (m.won ? "var(--green)" : "var(--red)") + ";" }, m.heroName || "?"));
        var kdaColor = (m.kills || 0) + (m.assists || 0) >= (m.deaths || 0) * 3 ? "var(--green)" : (m.deaths >= 8 ? "var(--red)" : "var(--text-muted)");
        heroLine.appendChild(el("span", { style: "font-family:'JetBrains Mono',monospace;font-size:11px;color:" + kdaColor + ";" },
          (m.kills||0) + "/" + (m.deaths||0) + "/" + (m.assists||0)));
        info.appendChild(heroLine);

        var dt = m.ts ? new Date(m.ts) : null;
        var dateStr = dt ? (String(dt.getDate()).padStart(2,"0") + "." + String(dt.getMonth()+1).padStart(2,"0") + "." + dt.getFullYear()) : "";
        if (dateStr) {
          info.appendChild(el("span", { style: "font-size:10px;color:var(--text-dim);" }, dateStr));
        }
        row.appendChild(info);

        if (isActive) {
          row.appendChild(el("span", { style: "color:var(--green);font-weight:700;font-size:12px;" }, "✓"));
        }

        row.addEventListener("click", function () {
          currentValue = String(m.matchId);
          currentHero = m.heroName || "";
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
    list.style.opacity = "1";
    list.style.transform = "translateY(0) scale(1)";
    list.style.pointerEvents = "auto";
    arrow.style.transform = "rotate(180deg)";
    btn.style.borderColor = "var(--accent)";
    btn.style.background = "var(--accent-bg)";
  }
  function closeList() {
    list.style.opacity = "0";
    list.style.transform = "translateY(-6px) scale(0.98)";
    list.style.pointerEvents = "none";
    arrow.style.transform = "rotate(0deg)";
    if (!currentValue) btn.style.background = "var(--bg-elev)";
    btn.style.borderColor = currentValue ? "var(--accent)" : "var(--border)";
  }

  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var isOpen = list.style.pointerEvents === "auto";
    if (isOpen) closeList(); else openList();
  });
  document.addEventListener("click", function (e) {
    if (!wrap.contains(e.target)) closeList();
  });

  wrap.appendChild(btn);
  wrap.appendChild(list);
  return { wrap: wrap, reset: function () { currentValue = ""; currentHero = ""; btnIcon.textContent = "🎯"; btnLabel.textContent = history.length ? "Выбери матч из истории" : "История матчей пуста"; btnLabel.style.color = ""; closeList(); } };
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
  inputCard.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.08em;" }, "Выбери матч для контекста"));

  var history = Store.get("recentmatches", []) || [];

  var statusEl = el("div", { id: "chatMatchStatus", style: "font-size:11px;margin:10px 0 10px;min-height:14px;line-height:1.4;" }, "");

  var inp = UI.input(history.length ? "Сначала выбери матч сверху..." : "История матчей пуста.");
  inp.id = "chatInput";
  inp.style.flex = "1";
  inp.disabled = true;
  inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); onChatSend(); } });

  var btn = UI.btn("Отправить", { id: "chatSendBtn" });
  btn.addEventListener("click", onChatSend);
  btn.disabled = true;

  var row = el("div", { class: "row" });
  row.appendChild(inp);
  row.appendChild(btn);

  var dropdown = buildMatchDropdown(history, async function (matchId, heroName) {
    var inputEl = qs("#chatInput");
    var sendBtn = qs("#chatSendBtn");

    if (!matchId) {
      window.chatMatchContext = null;
      inputEl.disabled = true;
      sendBtn.disabled = true;
      inputEl.placeholder = "Сначала выбери матч сверху...";
      if (statusEl) { statusEl.textContent = ""; statusEl.style.color = ""; }
      return;
    }

    if (statusEl) { statusEl.textContent = "Загружаю матч..."; statusEl.style.color = "var(--text-muted)"; }
    inputEl.disabled = true;
    sendBtn.disabled = true;

    try {
      var ctx = await loadChatMatchContext(parseInt(matchId, 10), heroName);
      window.chatMatchContext = ctx;
      inputEl.disabled = false;
      sendBtn.disabled = false;
      inputEl.placeholder = "Спроси про матч...";
      inputEl.focus();
      if (statusEl) {
        statusEl.textContent = "Готово. Спрашивай.";
        statusEl.style.color = "var(--green)";
      }
    } catch (e) {
      console.error("loadChatMatchContext:", e);
      window.chatMatchContext = null;
      inputEl.disabled = true;
      sendBtn.disabled = true;
      if (statusEl) {
        statusEl.textContent = "Ошибка загрузки матча. Попробуй другой.";
        statusEl.style.color = "var(--red)";
      }
    }
  });

  inputCard.appendChild(dropdown.wrap);
  inputCard.appendChild(statusEl);
  inputCard.appendChild(row);

  frag.appendChild(inputCard);

  setTimeout(function () {
    var l = qs("#chatLog");
    if (!l) return;
    if (!history.length) {
      addChatMessage(l, "assistant", "Привет. Чтобы я мог отвечать с учётом твоей игры — сначала разбери матч на вкладке «Анализ». После этого он появится в списке выше.");
    } else {
      addChatMessage(l, "assistant", "Привет. Выбери матч из списка выше — я загружу его данные и буду отвечать с учётом этой игры.");
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
  var wrap = el("div", { style: "display:flex;gap:10px;align-items:flex-start;opacity:0.8;" });
  var avatar = el("div", { style: "width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;background:var(--accent-bg);color:var(--accent-light);border:1px solid var(--accent);" }, "AI");
  var box = el("div", { style: "flex:1;padding:10px 14px;border-radius:12px;font-size:12px;line-height:1.6;background:var(--bg-card);border:1px dashed var(--accent);color:var(--text-muted);font-family:'JetBrains Mono',monospace;" });
  box.textContent = "Думаю...";
  wrap.appendChild(avatar); wrap.appendChild(box);
  log.appendChild(wrap); log.scrollTop = log.scrollHeight;
  return {
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
  inp.disabled = true;
  btn.disabled = true;
  inp.value = "";
  btn.textContent = "Думаю...";

  addChatMessage(log, "user", q);
  chatHistory.push({ role: "user", text: q });
  Store.set("aiquestions", (Store.get("aiquestions", 0) || 0) + 1);
  if (typeof Daily !== "undefined") Daily.bump("chat");
  if (typeof Achievements !== "undefined") Achievements.check();

  var think = addThinkingBlock(log);

  try {
    var matchCtx = ExternalAI.buildMatchContext();
    var externalText = await ExternalAI.ask(q, matchCtx);
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
    typeWriter(errBubble, "Не получилось получить ответ. Попробуй ещё раз через несколько секунд.", 12, function () {
      isResponding = false;
      inp.disabled = false;
      btn.disabled = false;
      btn.textContent = "Отправить";
      inp.focus();
    });
  }
}
