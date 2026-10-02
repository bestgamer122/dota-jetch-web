/* DOTA JETCH — MINI-GAMES v3.0
   - Взлом замка (canvas, стрелка, зоны, комбо)
   - Атака автоматонов (печать слов Dota 2)
   - Викторина */

var QUIZ = [
  { q: "Какая способность у Juggernaut даёт неуязвимость?", a: "Omnislash", opts: ["Omnislash", "Blade Fury", "Blade Dance", "Healing Ward"] },
  { q: "Сколько стоит Black King Bar?", a: "4050", opts: ["3900", "4050", "4200", "5000"] },
  { q: "Какой предмет даёт иммунитет к магии?", a: "Black King Bar", opts: ["Linken's", "Black King Bar", "Lotus", "Eul's"] },
  { q: "Кто имеет Blink на 3 заряда?", a: "Anti-Mage", opts: ["Anti-Mage", "QoP", "Void", "Storm"] },
  { q: "Какой предмет снимает сайленс?", a: "Eul's Scepter", opts: ["Manta", "Eul's Scepter", "Force", "Glimmer"] },
  { q: "Что делает Rune of Wisdom?", a: "Даёт опыт", opts: ["Золото", "Опыт", "Ману", "HP"] },
  { q: "Кто невидим в ульте?", a: "Slark", opts: ["Riki", "Slark", "BH", "Clinkz"] },
  { q: "Сколько длится стан Hex?", a: "3.5 сек", opts: ["2", "3", "3.5", "5"] },
  { q: "Что даёт Aegis?", a: "Возрождение", opts: ["HP", "Ману", "Возрождение", "Урон"] },
  { q: "Когда респавн Roshan?", a: "8-11 мин", opts: ["5", "8-11", "12", "15"] },
  { q: "Что такое KDA?", a: "Kills/Deaths/Assists", opts: ["K/D/A", "K/Damage/A", "K/Deny/A", "K/Dmg/A"] },
  { q: "Какая роль у Crystal Maiden?", a: "Pos 5", opts: ["Pos 1", "Pos 2", "Pos 4", "Pos 5"] }
];

var WORD_BANK = [
  "Aegis", "Blink Dagger", "Black King Bar", "Manta Style", "Battle Fury",
  "Butterfly", "Monkey King Bar", "Satanic", "Diffusal Blade", "Glimmer Cape",
  "Force Staff", "Shiva's Guard", "Scythe of Vyse", "Rod of Atos", "Orchid Malevolence",
  "Bloodthorn", "Aeon Disk", "Heart of Tarrasque", "Eye of Skadi", "Radiance",
  "Juggernaut", "Invoker", "Pudge", "Anti-Mage", "Shadow Fiend", "Phantom Assassin",
  "Storm Spirit", "Faceless Void", "Medusa", "Slark", "Tinker", "Zeus",
  "Omnislash", "Ball Lightning", "Chronosphere", "Ravage", "Black Hole",
  "Reverse Polarity", "Meat Hook", "Dream Coil", "Sonic Wave",
  "Roshan", "Aghanim's Scepter", "Refresher Orb", "Octarine Core", "Blade Mail",
  "Silver Edge", "Desolator", "Daedalus", "Mjollnir", "Maelstrom",
  "Assault Cuirass", "Crimson Guard", "Pipe of Insight", "Mekansm", "Guardian Greaves"
];

function shuffle(a) {
  var arr = a.slice();
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

var CURRENT_GAME = "lockpick";

function renderGames() {
  var frag = document.createDocumentFragment();
  frag.appendChild(UI.heroBanner("Мини-игры", "Взлом замка · Атака автоматонов · Викторина", []));
  var tabs = el("div", { class: "row", style: "margin-bottom:16px;gap:8px;flex-wrap:wrap;" });
  var tabDefs = [
    { id: "lockpick", label: "🔓 Взлом замка" },
    { id: "automaton", label: "⌨️ Атака автоматонов" },
    { id: "quiz", label: "🧠 Викторина" }
  ];
  for (var t = 0; t < tabDefs.length; t++) {
    (function (tab) {
      var isActive = tab.id === CURRENT_GAME;
      var b = UI.btn(tab.label, { variant: isActive ? undefined : "ghost", id: "gameTab_" + tab.id });
      b.addEventListener("click", function () {
        CURRENT_GAME = tab.id;
        qsa("#gameTab_lockpick, #gameTab_automaton, #gameTab_quiz").forEach(function (btn) {
          btn.classList.remove("active");
          btn.classList.add("btn-ghost");
        });
        b.classList.add("active");
        b.classList.remove("btn-ghost");
        openGame(tab.id);
      });
      tabs.appendChild(b);
    })(tabDefs[t]);
  }
  frag.appendChild(tabs);
  if (typeof window.renderRatingWidget === "function") {
    try { frag.appendChild(window.renderRatingWidget()); } catch (e) {}
  }
  var stats = el("div", { class: "stat-grid" });
  var lpBest = Store.get("lockpickbest", 0) || 0;
  var autoBest = Store.get("automatonbest", 0) || 0;
  var q = Store.get("quizbest", 0) || 0;
  stats.appendChild(UI.statCard("🔓", "var(--yellow)", "var(--yellow-bg)", "Взлом замка", lpBest ? lpBest.toLocaleString() : "-", "лучший"));
  stats.appendChild(UI.statCard("⌨️", "var(--cyan)", "var(--cyan-bg)", "Автоматоны", autoBest ? autoBest.toLocaleString() : "-", "лучший"));
  stats.appendChild(UI.statCard("🧠", "var(--green)", "var(--green-bg)", "Викторина", q ? q + "/10" : "-", "лучший"));
  frag.appendChild(stats);
  var area = el("div", { id: "gameArea" });
  frag.appendChild(area);
  setTimeout(function () { openGame(CURRENT_GAME); }, 50);
  return frag;
}

async function openGame(kind) {
  var area = qs("#gameArea");
  if (!area) return;
  area.innerHTML = "";
  try {
    if (kind === "lockpick") area.appendChild(renderLockpick());
    else if (kind === "automaton") area.appendChild(renderAutomaton());
    else if (kind === "quiz") area.appendChild(renderQuiz());
  } catch (e) {
    area.innerHTML = "";
    var err = UI.card("Ошибка");
    err.appendChild(el("div", { style: "color:var(--red);padding:20px;" }, e.message || String(e)));
    area.appendChild(err);
  }
  Store.set("gamesplayed", (Store.get("gamesplayed", 0) || 0) + 1);
  if (typeof Daily !== "undefined") Daily.bump("game");
  if (typeof Achievements !== "undefined") Achievements.check();
}

function renderLockpick() {
  var card = UI.card("🔓 Взлом замка");
  var rules = el("div", { style: "background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:16px;font-size:12px;line-height:1.6;color:var(--text-muted);" });
  rules.appendChild(el("div", { style: "color:var(--text);font-weight:700;margin-bottom:6px;" }, "Как играть"));
  rules.appendChild(el("div", {}, "• Нажимай ЛКМ, когда стрелка попадает в жёлтую зону"));
  rules.appendChild(el("div", {}, "• Жёлтая зона = 1 000 очков"));
  rules.appendChild(el("div", {}, "• Синяя зона = +2 секунды"));
  rules.appendChild(el("div", {}, "• Промах = -0.5 секунды"));
  card.appendChild(rules);
  var canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 400;
  canvas.style.cssText = "display:block;width:100%;max-width:400px;margin:0 auto;border-radius:16px;background:var(--bg-elev);border:1px solid var(--border);cursor:pointer;";
  card.appendChild(canvas);
  var hud = el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding:12px 16px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;" });
  var scoreEl = el("div", { style: "text-align:center;" });
  scoreEl.appendChild(el("div", { class: "dim", style: "font-size:10px;text-transform:uppercase;letter-spacing:0.08em;" }, "Очки"));
  var scoreVal = el("div", { style: "font-size:22px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--text);" }, "0");
  scoreEl.appendChild(scoreVal);
  var timeEl = el("div", { style: "text-align:center;" });
  timeEl.appendChild(el("div", { class: "dim", style: "font-size:10px;text-transform:uppercase;letter-spacing:0.08em;" }, "Время"));
  var timeVal = el("div", { style: "font-size:22px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--cyan);" }, "30.0");
  timeEl.appendChild(timeVal);
  var comboEl = el("div", { style: "text-align:center;" });
  comboEl.appendChild(el("div", { class: "dim", style: "font-size:10px;text-transform:uppercase;letter-spacing:0.08em;" }, "Комбо"));
  var comboVal = el("div", { style: "font-size:22px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);" }, "x1");
  comboEl.appendChild(comboVal);
  hud.appendChild(scoreEl); hud.appendChild(timeEl); hud.appendChild(comboEl);
  card.appendChild(hud);
  var statusEl = el("div", { style: "text-align:center;margin-top:12px;font-size:13px;font-weight:600;color:var(--text-muted);min-height:20px;" }, "");
  card.appendChild(statusEl);

  var state = {
    score: 0, timeLeft: 30, combo: 1, maxCombo: 1, angle: 0, speed: 0.035,
    running: false, lastFrame: 0, zones: [], flash: null, spawnTimer: 0, missCount: 0
  };

  function spawnZones() {
    state.zones = [];
    var count = 1 + Math.floor(Math.random() * 2);
    for (var i = 0; i < count; i++) {
      var isBlue = Math.random() < 0.25;
      var size = isBlue ? 0.15 + Math.random() * 0.1 : 0.12 + Math.random() * 0.18;
      state.zones.push({ start: Math.random() * Math.PI * 2, size: size, blue: isBlue });
    }
  }

  function draw() {
    var ctx = canvas.getContext("2d");
    var cx = canvas.width / 2, cy = canvas.height / 2, r = 150;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#1e2129";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(139,92,246,0.3)"; ctx.lineWidth = 30; ctx.stroke();
    for (var i = 0; i < state.zones.length; i++) {
      var z = state.zones[i];
      ctx.beginPath(); ctx.arc(cx, cy, r, z.start, z.start + z.size * Math.PI * 2);
      ctx.strokeStyle = z.blue ? "rgba(34,211,238,0.85)" : "rgba(251,191,36,0.85)";
      ctx.lineWidth = 30; ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, r, z.start, z.start + z.size * Math.PI * 2);
      ctx.strokeStyle = z.blue ? "rgba(34,211,238,0.3)" : "rgba(251,191,36,0.3)";
      ctx.lineWidth = 44; ctx.stroke();
    }
    var ax = cx + Math.cos(state.angle) * r, ay = cy + Math.sin(state.angle) * r;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(ax, ay);
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(139,92,246,0.15)"; ctx.fill();
    ctx.strokeStyle = "rgba(139,92,246,0.5)"; ctx.lineWidth = 2; ctx.stroke();
    if (state.flash) {
      ctx.fillStyle = state.flash.color;
      ctx.globalAlpha = state.flash.alpha;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }
  }

  function checkHit() {
    if (!state.running) return;
    var hit = false;
    for (var i = 0; i < state.zones.length; i++) {
      var z = state.zones[i];
      var angle = state.angle;
      var zoneStart = z.start % (Math.PI * 2);
      var zoneEnd = (z.start + z.size * Math.PI * 2) % (Math.PI * 2);
      var a = angle % (Math.PI * 2);
      if (a < 0) a += Math.PI * 2;
      var inZone = (zoneStart < zoneEnd) ? (a >= zoneStart && a <= zoneEnd) : (a >= zoneStart || a <= zoneEnd);
      if (inZone) {
        hit = true;
        if (z.blue) {
          state.timeLeft = Math.min(60, state.timeLeft + 2);
          state.flash = { color: "rgba(34,211,238,0.25)", alpha: 0.4 };
          statusEl.textContent = "+2 сек"; statusEl.style.color = "var(--cyan)";
        } else {
          var pts = 1000 * state.combo;
          state.score += pts;
          state.combo = Math.min(10, state.combo + 1);
          state.maxCombo = Math.max(state.maxCombo, state.combo);
          state.flash = { color: "rgba(251,191,36,0.2)", alpha: 0.3 };
          statusEl.textContent = "+" + pts.toLocaleString() + (state.combo > 1 ? " (x" + state.combo + ")" : "");
          statusEl.style.color = "var(--gold)";
        }
        spawnZones();
        state.speed = Math.min(0.08, 0.035 + (state.maxCombo * 0.004));
        break;
      }
    }
    if (!hit) {
      state.timeLeft -= 0.5;
      state.combo = 1;
      state.missCount++;
      state.flash = { color: "rgba(239,68,68,0.15)", alpha: 0.3 };
      statusEl.textContent = "Промах! -0.5 сек"; statusEl.style.color = "var(--red)";
    }
    updateHUD();
  }

  function updateHUD() {
    scoreVal.textContent = state.score.toLocaleString();
    timeVal.textContent = Math.max(0, state.timeLeft).toFixed(1);
    comboVal.textContent = "x" + state.combo;
    if (state.timeLeft <= 5) timeVal.style.color = "var(--red)";
    else timeVal.style.color = "var(--cyan)";
  }

  function loop(ts) {
    if (!state.running) return;
    var dt = (ts - state.lastFrame) / 1000;
    state.lastFrame = ts;
    state.angle += state.speed;
    state.timeLeft -= dt;
    state.spawnTimer -= dt;
    if (state.spawnTimer <= 0) { spawnZones(); state.spawnTimer = 1.5 + Math.random() * 1.5; }
    if (state.flash) { state.flash.alpha -= dt * 2; if (state.flash.alpha <= 0) state.flash = null; }
    draw();
    updateHUD();
    if (state.timeLeft <= 0) { endGame(); return; }
    requestAnimationFrame(loop);
  }

  function startGame() {
    state = { score: 0, timeLeft: 30, combo: 1, maxCombo: 1, angle: 0, speed: 0.035, running: true, lastFrame: performance.now(), zones: [], flash: null, spawnTimer: 1, missCount: 0 };
    spawnZones();
    statusEl.textContent = "Игра пошла!"; statusEl.style.color = "var(--green)";
    requestAnimationFrame(loop);
  }

  function endGame() {
    state.running = false;
    var best = Store.get("lockpickbest", 0) || 0;
    var isRecord = state.score > best;
    if (isRecord) Store.set("lockpickbest", state.score);
    draw();
    if (typeof window.submitGameScore === "function") {
      try { window.submitGameScore("lockpick", state.score); } catch (e) {}
    }
    var overlay = el("div", { style: "position:absolute;inset:0;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;padding:24px;text-align:center;" });
    overlay.appendChild(el("div", { style: "font-size:48px;margin-bottom:8px;" }, isRecord ? "🏆" : "🔓"));
    overlay.appendChild(el("div", { style: "font-size:16px;font-weight:700;color:var(--text);margin-bottom:4px;" }, isRecord ? "Новый рекорд!" : "Замок взломан!"));
    overlay.appendChild(el("div", { style: "font-size:32px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);margin:12px 0;" }, state.score.toLocaleString()));
    overlay.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:16px;" }, "Макс. комбо: x" + state.maxCombo + " · Промахов: " + state.missCount));
    var retryBtn = UI.btn("Ещё раз");
    retryBtn.addEventListener("click", function () { overlay.remove(); startGame(); });
    overlay.appendChild(retryBtn);
    canvas.parentElement.style.position = "relative";
    card.appendChild(overlay);
  }

  canvas.addEventListener("mousedown", function (e) { e.preventDefault(); if (state.running) checkHit(); });
  canvas.addEventListener("touchstart", function (e) { e.preventDefault(); if (state.running) checkHit(); }, { passive: false });
  setTimeout(function () { startGame(); }, 100);
  return card;
}

function renderAutomaton() {
  var card = UI.card("⌨️ Атака автоматонов");
  var rules = el("div", { style: "background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;padding:14px 16px;margin-bottom:16px;font-size:12px;line-height:1.6;color:var(--text-muted);" });
  rules.appendChild(el("div", { style: "color:var(--text);font-weight:700;margin-bottom:6px;" }, "Как играть"));
  rules.appendChild(el("div", {}, "• Печатай слова из мира Dota 2"));
  rules.appendChild(el("div", {}, "• Чем длиннее слово — тем больше очков"));
  rules.appendChild(el("div", {}, "• Множитель растёт с каждым словом (макс x5)"));
  rules.appendChild(el("div", {}, "• Пропуск врага = множитель сбрасывается"));
  card.appendChild(rules);
  var field = el("div", { style: "position:relative;height:320px;border-radius:16px;background:var(--bg-elev);border:1px solid var(--border);overflow:hidden;margin-bottom:14px;" });
  var automaton = el("div", { style: "position:absolute;left:50%;bottom:20px;transform:translateX(-50%);text-align:center;" });
  automaton.appendChild(el("div", { style: "font-size:64px;line-height:1;" }, "🤖"));
  automaton.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-top:4px;" }, "Автоматон-Акс"));
  field.appendChild(automaton);
  var wordsLayer = el("div", { id: "wordsLayer", style: "position:absolute;inset:0;pointer-events:none;" });
  field.appendChild(wordsLayer);
  var multiBadge = el("div", { style: "position:absolute;top:12px;right:12px;background:var(--accent-bg);border:1px solid var(--accent);border-radius:10px;padding:6px 12px;font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:900;color:var(--accent-light);" }, "x1");
  field.appendChild(multiBadge);
  card.appendChild(field);
  var hud = el("div", { style: "display:flex;justify-content:space-between;margin-bottom:14px;" });
  var scoreBox = el("div", { style: "text-align:center;flex:1;" });
  scoreBox.appendChild(el("div", { class: "dim", style: "font-size:10px;text-transform:uppercase;" }, "Очки"));
  var scoreVal2 = el("div", { style: "font-size:24px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);" }, "0");
  scoreBox.appendChild(scoreVal2);
  hud.appendChild(scoreBox);
  var timeBox = el("div", { style: "text-align:center;flex:1;" });
  timeBox.appendChild(el("div", { class: "dim", style: "font-size:10px;text-transform:uppercase;" }, "Время"));
  var timeVal2 = el("div", { style: "font-size:24px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--cyan);" }, "60.0");
  timeBox.appendChild(timeVal2);
  hud.appendChild(timeBox);
  var hitsBox = el("div", { style: "text-align:center;flex:1;" });
  hitsBox.appendChild(el("div", { class: "dim", style: "font-size:10px;text-transform:uppercase;" }, "Слов"));
  var hitsVal = el("div", { style: "font-size:24px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--green);" }, "0");
  hitsBox.appendChild(hitsVal);
  hud.appendChild(hitsBox);
  card.appendChild(hud);
  var inputRow = el("div", { class: "row", style: "gap:8px;" });
  var inp = UI.input("Начни печатать...");
  inp.id = "automatonInput"; inp.style.flex = "1";
  inp.autocomplete = "off"; inp.autocorrect = "off"; inp.autocapitalize = "off"; inp.spellcheck = false;
  var startBtn = UI.btn("Старт");
  inputRow.appendChild(inp); inputRow.appendChild(startBtn);
  card.appendChild(inputRow);
  var statusEl2 = el("div", { style: "text-align:center;margin-top:12px;font-size:13px;font-weight:600;color:var(--text-muted);min-height:20px;" }, "");
  card.appendChild(statusEl2);

  var st = { score: 0, timeLeft: 60, multiplier: 1, hits: 0, running: false, words: [], lastFrame: 0, spawnTimer: 0 };

  function spawnWord() {
    var word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    var el_ = document.createElement("div");
    el_.style.cssText = "position:absolute;background:rgba(139,92,246,0.15);border:1px solid rgba(139,92,246,0.4);border-radius:8px;padding:6px 12px;font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:var(--accent-light);white-space:nowrap;";
    el_.textContent = word;
    var x = 20 + Math.random() * (field.clientWidth - 140);
    el_.style.left = x + "px";
    el_.style.top = "-40px";
    wordsLayer.appendChild(el_);
    var speed = 40 + Math.random() * 30;
    st.words.push({ el: el_, word: word, y: -40, speed: speed });
  }

  function updateWords(dt) {
    for (var i = st.words.length - 1; i >= 0; i--) {
      var w = st.words[i];
      w.y += w.speed * dt;
      w.el.style.top = w.y + "px";
      if (w.y > field.clientHeight - 80) {
        w.el.remove(); st.words.splice(i, 1);
        st.multiplier = 1; multiBadge.textContent = "x1";
        statusEl2.textContent = "Пропуск! Множитель сброшен"; statusEl2.style.color = "var(--red)";
      }
    }
  }

  function checkInput(val) {
    if (!st.running) return;
    var typed = val.toLowerCase().trim();
    if (!typed) return;
    for (var i = 0; i < st.words.length; i++) {
      var w = st.words[i];
      var target = w.word.toLowerCase().replace(/[^a-z0-9]/g, "");
      var typedClean = typed.replace(/[^a-z0-9]/g, "");
      if (target === typedClean) {
        var base = w.word.length * 20;
        var pts = base * st.multiplier;
        st.score += pts; st.hits++;
        st.multiplier = Math.min(5, st.multiplier + 1);
        multiBadge.textContent = "x" + st.multiplier;
        scoreVal2.textContent = st.score.toLocaleString();
        hitsVal.textContent = st.hits;
        w.el.style.background = "rgba(34,197,94,0.3)";
        w.el.style.borderColor = "var(--green)";
        w.el.style.color = "var(--green)";
        var captured = w.el;
        setTimeout(function () { captured.remove(); }, 200);
        st.words.splice(i, 1);
        inp.value = "";
        statusEl2.textContent = "+" + pts.toLocaleString() + " (x" + st.multiplier + ")";
        statusEl2.style.color = "var(--green)";
        return;
      }
    }
    for (var j = 0; j < st.words.length; j++) {
      var w2 = st.words[j];
      var t2 = w2.word.toLowerCase().replace(/[^a-z0-9]/g, "");
      var tc = typed.replace(/[^a-z0-9]/g, "");
      if (t2.indexOf(tc) === 0) {
        w2.el.style.background = "rgba(251,191,36,0.15)";
        w2.el.style.borderColor = "var(--gold)";
      } else {
        w2.el.style.background = "rgba(139,92,246,0.15)";
        w2.el.style.borderColor = "rgba(139,92,246,0.4)";
      }
    }
  }

  function loop2(ts) {
    if (!st.running) return;
    var dt = (ts - st.lastFrame) / 1000;
    st.lastFrame = ts;
    st.timeLeft -= dt;
    st.spawnTimer -= dt;
    if (st.spawnTimer <= 0) {
      spawnWord();
      st.spawnTimer = Math.max(0.7, 1.5 - (st.hits * 0.02));
    }
    updateWords(dt);
    timeVal2.textContent = Math.max(0, st.timeLeft).toFixed(1);
    if (st.timeLeft <= 10) timeVal2.style.color = "var(--red)";
    if (st.timeLeft <= 0) { endGame2(); return; }
    requestAnimationFrame(loop2);
  }

  function startGame2() {
    st = { score: 0, timeLeft: 60, multiplier: 1, hits: 0, running: true, words: [], lastFrame: performance.now(), spawnTimer: 0.5 };
    wordsLayer.innerHTML = "";
    scoreVal2.textContent = "0"; hitsVal.textContent = "0";
    timeVal2.textContent = "60.0"; timeVal2.style.color = "var(--cyan)";
    multiBadge.textContent = "x1";
    statusEl2.textContent = "Печатай слова!"; statusEl2.style.color = "var(--green)";
    inp.disabled = false; inp.value = ""; inp.focus();
    startBtn.disabled = true; startBtn.textContent = "Идёт...";
    requestAnimationFrame(loop2);
  }

  function endGame2() {
    st.running = false;
    inp.disabled = true;
    startBtn.disabled = false;
    startBtn.textContent = "Ещё раз";
    var best = Store.get("automatonbest", 0) || 0;
    var isRecord = st.score > best;
    if (isRecord) Store.set("automatonbest", st.score);
    if (typeof window.submitGameScore === "function") {
      try { window.submitGameScore("automaton", st.score); } catch (e) {}
    }
    var overlay = el("div", { style: "position:absolute;inset:0;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;padding:24px;text-align:center;z-index:10;" });
    overlay.appendChild(el("div", { style: "font-size:48px;margin-bottom:8px;" }, isRecord ? "🏆" : "⌨️"));
    overlay.appendChild(el("div", { style: "font-size:16px;font-weight:700;color:var(--text);margin-bottom:4px;" }, isRecord ? "Новый рекорд!" : "Автоматоны повержены!"));
    overlay.appendChild(el("div", { style: "font-size:32px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);margin:12px 0;" }, st.score.toLocaleString()));
    overlay.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:16px;" }, "Слов напечатано: " + st.hits));
    var retry = UI.btn("Ещё раз");
    retry.addEventListener("click", function () { overlay.remove(); startGame2(); });
    overlay.appendChild(retry);
    field.appendChild(overlay);
  }

  startBtn.addEventListener("click", startGame2);
  inp.addEventListener("input", function () { checkInput(inp.value); });
  inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); checkInput(inp.value); } });
  setTimeout(function () { startGame2(); }, 100);
  return card;
}

function renderQuiz() {
  var card = UI.card("🧠 Викторина");
  var bank = shuffle(QUIZ).slice(0, 10);
  var idx = 0, score = 0;
  var content = el("div");
  card.appendChild(content);
  function show() {
    content.innerHTML = "";
    if (idx >= bank.length) {
      content.appendChild(el("div", { style: "text-align:center;padding:20px;font-size:32px;font-weight:bold;" }, score + " / " + bank.length));
      var b = Store.get("quizbest", 0) || 0;
      if (score > b) Store.set("quizbest", score);
      if (typeof window.submitGameScore === "function") {
        try { window.submitGameScore("quiz", score * 100); } catch (e) {}
      }
      if (typeof Achievements !== "undefined") Achievements.check();
      return;
    }
    var q = bank[idx];
    content.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "Вопрос " + (idx + 1) + "/" + bank.length + " · Счёт: " + score));
    content.appendChild(el("div", { style: "font-size:14px;font-weight:bold;margin:10px 0 14px;" }, q.q));
    var opts = shuffle(q.opts);
    for (var i = 0; i < opts.length; i++) {
      (function (o) {
        var b = el("button", { style: "display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;color:var(--text);cursor:pointer;font-family:inherit;" }, o);
        b.addEventListener("click", function () {
          var ok = o === q.a;
          b.style.background = ok ? "var(--green-bg)" : "var(--red-bg)";
          if (ok) score++;
          var all = content.querySelectorAll("button");
          for (var k = 0; k < all.length; k++) all[k].disabled = true;
          setTimeout(function () { idx++; show(); }, 700);
        });
        content.appendChild(b);
      })(opts[i]);
    }
  }
  show();
  return card;
}
