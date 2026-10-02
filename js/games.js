/* DOTA JETCH — MINI-GAMES v4.0
   - Экран-заставка с кнопкой «Играть» (нет автозапуска)
   - Улучшенный геймплей:
     * Взлом замка — нормальные зоны, комбо, счёт
     * Атака автоматонов — 3 жизни, прогресс HP робота, нарастающая сложность */

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
  "Aegis", "Blink", "Manta", "Butterfly", "Satanic", "Radiance",
  "Desolator", "Daedalus", "Mjollnir", "Maelstrom", "Sange",
  "Juggernaut", "Invoker", "Pudge", "Anti-Mage", "Slark", "Tinker", "Zeus",
  "Omnislash", "Ravage", "Black Hole", "Hook", "Roshan",
  "Refresher", "Octarine", "Aghanim", "Skadi", "Shiva",
  "Cuirass", "Crimson", "Mekansm", "Greaves", "Kunkka",
  "Silencer", "Puck", "Lina", "Lion", "Crystal", "Medusa",
  "Sniper", "Storm", "Phantom", "Terrorblade", "Spectre",
  "Ember", "Void", "Slardar", "Ursa", "Tidehunter", "Magnus"
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

/* ─── Главный рендер страницы ─── */
function renderGames() {
  var frag = document.createDocumentFragment();
  frag.appendChild(UI.heroBanner("Мини-игры", "Выбери игру и покажи лучший результат", []));

  /* Табы */
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
        showIntro(tab.id);
      });
      tabs.appendChild(b);
    })(tabDefs[t]);
  }
  frag.appendChild(tabs);

  /* Рейтинг */
  if (typeof window.renderRatingWidget === "function") {
    try { frag.appendChild(window.renderRatingWidget()); } catch (e) { console.warn("rating widget:", e); }
  }

  /* Статистика */
  var stats = el("div", { class: "stat-grid" });
  var lpBest = Store.get("lockpickbest", 0) || 0;
  var autoBest = Store.get("automatonbest", 0) || 0;
  var q = Store.get("quizbest", 0) || 0;
  stats.appendChild(UI.statCard("🔓", "var(--yellow)", "var(--yellow-bg)", "Взлом замка", lpBest ? lpBest.toLocaleString() : "—", "лучший"));
  stats.appendChild(UI.statCard("⌨️", "var(--cyan)", "var(--cyan-bg)", "Автоматоны", autoBest ? autoBest.toLocaleString() : "—", "лучший"));
  stats.appendChild(UI.statCard("🧠", "var(--green)", "var(--green-bg)", "Викторина", q ? q + "/10" : "—", "лучший"));
  frag.appendChild(stats);

  /* Область игры — НЕ автозапуск, а заставка */
  var area = el("div", { id: "gameArea" });
  frag.appendChild(area);

  setTimeout(function () { showIntro(CURRENT_GAME); }, 50);
  return frag;
}

/* ─── Заставка (intro) ─── */
function showIntro(kind) {
  var area = qs("#gameArea");
  if (!area) return;
  area.innerHTML = "";
  if (kind === "lockpick") area.appendChild(buildLockpickIntro());
  else if (kind === "automaton") area.appendChild(buildAutomatonIntro());
  else if (kind === "quiz") area.appendChild(buildQuizIntro());
}

/* ─── Запуск игры ─── */
function startGame(kind) {
  var area = qs("#gameArea");
  if (!area) return;
  area.innerHTML = "";
  if (kind === "lockpick") area.appendChild(renderLockpick());
  else if (kind === "automaton") area.appendChild(renderAutomaton());
  else if (kind === "quiz") area.appendChild(renderQuiz());

  Store.set("gamesplayed", (Store.get("gamesplayed", 0) || 0) + 1);
  if (typeof Daily !== "undefined") Daily.bump("game");
  if (typeof Achievements !== "undefined") Achievements.check();
}

/* ═══════════════════════════════════════
   ЗАСТАВКИ ИГР
   ═══════════════════════════════════════ */

function buildRulesBlock(title, items) {
  var box = el("div", { style: "background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;padding:16px 18px;margin-top:16px;" });
  box.appendChild(el("div", { style: "font-size:13px;font-weight:700;color:var(--text);margin-bottom:10px;" }, title));
  for (var i = 0; i < items.length; i++) {
    box.appendChild(el("div", { style: "font-size:12px;color:var(--text-muted);line-height:1.7;display:flex;gap:8px;" },
      el("span", { style: "color:var(--accent-light);" }, "•"),
      el("span", {}, items[i])
    ));
  }
  return box;
}

function buildPlayButton(label, kind) {
  var btn = UI.btn(label);
  btn.style.cssText = "width:100%;padding:16px;font-size:16px;font-weight:800;margin-top:16px;letter-spacing:0.03em;";
  btn.addEventListener("click", function () { startGame(kind); });
  return btn;
}

function buildLockpickIntro() {
  var card = UI.card("🔓 Взлом замка");
  var visual = el("div", { style: "text-align:center;padding:24px 0 8px;" });
  visual.appendChild(el("div", { style: "font-size:90px;line-height:1;filter:drop-shadow(0 0 20px rgba(251,191,36,0.4));" }, "🔒"));
  visual.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-top:14px;letter-spacing:0.08em;text-transform:uppercase;" }, "Замочная скважина · Стрелка · Зоны"));
  card.appendChild(visual);

  card.appendChild(buildRulesBlock("Как играть", [
    "Кликни ЛКМ (или тапни), когда стрелка в жёлтой зоне",
    "Жёлтая зона = 1 000 очков",
    "Синяя зона = +2 секунды",
    "Промах = −1 секунда, комбо сбрасывается",
    "Комбо x2..x10 — каждая серия растёт",
    "Начальное время: 30 секунд"
  ]));

  card.appendChild(buildPlayButton("🎮 Играть", "lockpick"));
  return card;
}

function buildAutomatonIntro() {
  var card = UI.card("⌨️ Атака автоматонов");
  var visual = el("div", { style: "text-align:center;padding:24px 0 8px;" });
  visual.appendChild(el("div", { style: "font-size:90px;line-height:1;filter:drop-shadow(0 0 20px rgba(34,211,238,0.4));" }, "🤖"));
  visual.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-top:14px;letter-spacing:0.08em;text-transform:uppercase;" }, "Печатай слова · Защити Прохвостку"));
  card.appendChild(visual);

  card.appendChild(buildRulesBlock("Как играть", [
    "Печатай слова Dota 2, которые летят к автоматону",
    "Правильно напечатал — слово сбито, +очки",
    "Пропустил слово — автоматон бьёт по HP (3 жизни)",
    "Комбо-множитель до x5 за серию",
    "Очки зависят от длины слова",
    "Скорость нарастает с каждой секундой"
  ]));

  card.appendChild(buildPlayButton("🎮 Играть", "automaton"));
  return card;
}

function buildQuizIntro() {
  var card = UI.card("🧠 Викторина");
  var visual = el("div", { style: "text-align:center;padding:24px 0 8px;" });
  visual.appendChild(el("div", { style: "font-size:90px;line-height:1;filter:drop-shadow(0 0 20px rgba(34,197,94,0.4));" }, "🧠"));
  visual.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-top:14px;letter-spacing:0.08em;text-transform:uppercase;" }, "10 вопросов · 4 варианта"));
  card.appendChild(visual);

  card.appendChild(buildRulesBlock("Как играть", [
    "10 случайных вопросов про Dota 2",
    "4 варианта ответа — выбери правильный",
    "Счёт: 1 балл за верный ответ",
    "Рекорд сохраняется в лидерборде"
  ]));

  card.appendChild(buildPlayButton("🎮 Играть", "quiz"));
  return card;
}

/* ═══════════════════════════════════════
   ИГРА 1: ВЗЛОМ ЗАМКА
   ═══════════════════════════════════════ */
function renderLockpick() {
  var card = UI.card("🔓 Взлом замка");

  /* Верхняя панель: выход */
  var topRow = el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;" });
  topRow.appendChild(el("div", { class: "dim", style: "font-size:11px;text-transform:uppercase;letter-spacing:0.08em;" }, "Взлом замка"));
  var menuBtn = UI.btn("← В меню", { variant: "ghost" });
  menuBtn.style.cssText = "font-size:11px;padding:6px 12px;";
  menuBtn.addEventListener("click", function () { stopLockpick(); showIntro("lockpick"); });
  topRow.appendChild(menuBtn);
  card.appendChild(topRow);

  /* Канвас */
  var canvasWrap = el("div", { style: "position:relative;max-width:440px;margin:0 auto;" });
  var canvas = document.createElement("canvas");
  canvas.width = 440;
  canvas.height = 440;
  canvas.style.cssText = "display:block;width:100%;border-radius:18px;background:#12141a;cursor:pointer;user-select:none;";
  canvasWrap.appendChild(canvas);
  card.appendChild(canvasWrap);

  /* HUD */
  var hud = el("div", { style: "display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:14px;" });
  var scoreBox = el("div", { style: "text-align:center;padding:10px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;" });
  scoreBox.appendChild(el("div", { class: "dim", style: "font-size:9px;text-transform:uppercase;letter-spacing:0.1em;" }, "Очки"));
  var scoreVal = el("div", { style: "font-size:22px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);" }, "0");
  scoreBox.appendChild(scoreVal);
  hud.appendChild(scoreBox);

  var timeBox = el("div", { style: "text-align:center;padding:10px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;" });
  timeBox.appendChild(el("div", { class: "dim", style: "font-size:9px;text-transform:uppercase;letter-spacing:0.1em;" }, "Время"));
  var timeVal = el("div", { style: "font-size:22px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--cyan);" }, "30.0");
  timeBox.appendChild(timeVal);
  hud.appendChild(timeBox);

  var comboBox = el("div", { style: "text-align:center;padding:10px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;" });
  comboBox.appendChild(el("div", { class: "dim", style: "font-size:9px;text-transform:uppercase;letter-spacing:0.1em;" }, "Комбо"));
  var comboVal = el("div", { style: "font-size:22px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--text);" }, "x1");
  comboBox.appendChild(comboVal);
  hud.appendChild(comboBox);
  card.appendChild(hud);

  var statusEl = el("div", { style: "text-align:center;margin-top:12px;font-size:13px;font-weight:600;color:var(--text-muted);min-height:20px;" }, "Жми когда стрелка в жёлтой зоне!");
  card.appendChild(statusEl);

  /* Состояние */
  var state = {
    score: 0, timeLeft: 30, combo: 1, maxCombo: 1,
    angle: -Math.PI / 2, speed: 0.9, running: false,
    lastFrame: 0, zones: [], flash: null, missCount: 0, hitCount: 0
  };
  var rafId = null;
  var cx = canvas.width / 2;
  var cy = canvas.height / 2;
  var r = 165;
  var ringWidth = 38;

  function stopLockpick() {
    state.running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
  }

  function spawnZones() {
    state.zones = [];
    var count = 2 + Math.floor(Math.random() * 2); /* 2-3 зоны */
    var used = [];
    for (var i = 0; i < count; i++) {
      var tries = 0;
      var z;
      do {
        var isBlue = Math.random() < 0.22;
        var size = isBlue ? (0.10 + Math.random() * 0.08) : (0.14 + Math.random() * 0.14);
        z = { start: Math.random() * Math.PI * 2, size: size, blue: isBlue };
        tries++;
      } while (overlaps(z, used) && tries < 30);
      used.push(z);
      state.zones.push(z);
    }
  }

  function overlaps(z, others) {
    for (var i = 0; i < others.length; i++) {
      var a1 = z.start % (Math.PI * 2);
      var a2 = (z.start + z.size * Math.PI * 2) % (Math.PI * 2);
      var b1 = others[i].start % (Math.PI * 2);
      var b2 = (others[i].start + others[i].size * Math.PI * 2) % (Math.PI * 2);
      /* грубая проверка */
      if (Math.abs(norm(a1) - norm(b1)) < 0.4) return true;
    }
    return false;
  }

  function norm(a) {
    a = a % (Math.PI * 2);
    if (a < 0) a += Math.PI * 2;
    return a;
  }

  function draw() {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    /* Фон */
    ctx.fillStyle = "#12141a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    /* Внешнее тонкое кольцо */
    ctx.beginPath();
    ctx.arc(cx, cy, r + ringWidth / 2 + 8, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(139,92,246,0.18)";
    ctx.lineWidth = 1;
    ctx.stroke();

    /* Базовое кольцо */
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(139,92,246,0.28)";
    ctx.lineWidth = ringWidth;
    ctx.stroke();

    /* Зоны */
    for (var i = 0; i < state.zones.length; i++) {
      var z = state.zones[i];
      var startAng = z.start - Math.PI / 2;
      var endAng = startAng + z.size * Math.PI * 2;

      /* Мягкое свечение */
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAng, endAng);
      ctx.strokeStyle = z.blue ? "rgba(34,211,238,0.25)" : "rgba(251,191,36,0.25)";
      ctx.lineWidth = ringWidth + 14;
      ctx.stroke();

      /* Сама зона */
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAng, endAng);
      ctx.strokeStyle = z.blue ? "rgba(34,211,238,0.95)" : "rgba(251,191,36,0.95)";
      ctx.lineWidth = ringWidth;
      ctx.stroke();
    }

    /* Стрелка */
    var ax = cx + Math.cos(state.angle - Math.PI / 2) * (r - ringWidth / 2 - 2);
    var ay = cy + Math.sin(state.angle - Math.PI / 2) * (r - ringWidth / 2 - 2);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ax, ay);
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();

    /* Центральный круг с эмодзи */
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(20,22,30,1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(139,92,246,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "36px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🔒", cx, cy + 3);

    /* Флеш */
    if (state.flash) {
      ctx.fillStyle = state.flash.color;
      ctx.globalAlpha = state.flash.alpha;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }
  }

  function isInZone(angleRad, z) {
    var a = norm(angleRad);
    var s = norm(z.start);
    var e = norm(z.start + z.size * Math.PI * 2);
    if (s <= e) return a >= s && a <= e;
    return a >= s || a <= e;
  }

  function checkHit() {
    if (!state.running) return;
    var hit = false;
    for (var i = 0; i < state.zones.length; i++) {
      var z = state.zones[i];
      if (isInZone(state.angle, z)) {
        hit = true;
        if (z.blue) {
          state.timeLeft = Math.min(60, state.timeLeft + 2);
          state.flash = { color: "rgba(34,211,238,0.20)", alpha: 0.5 };
          statusEl.textContent = "⚡ +2 сек"; statusEl.style.color = "var(--cyan)";
        } else {
          var pts = 1000 * state.combo;
          state.score += pts;
          state.combo = Math.min(10, state.combo + 1);
          state.maxCombo = Math.max(state.maxCombo, state.combo);
          state.hitCount++;
          state.flash = { color: "rgba(251,191,36,0.18)", alpha: 0.4 };
          statusEl.textContent = "✓ +" + pts.toLocaleString() + " · комбо x" + state.combo;
          statusEl.style.color = "var(--gold)";
        }
        /* ускоряем после каждого попадания */
        state.speed = Math.min(2.4, 0.9 + state.hitCount * 0.06);
        spawnZones();
        break;
      }
    }
    if (!hit) {
      state.timeLeft -= 1;
      state.combo = 1;
      state.missCount++;
      state.flash = { color: "rgba(239,68,68,0.18)", alpha: 0.4 };
      statusEl.textContent = "✕ Промах! −1 сек"; statusEl.style.color = "var(--red)";
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
    var dt = Math.min((ts - state.lastFrame) / 1000, 0.1);
    state.lastFrame = ts;
    state.angle += state.speed * dt;
    state.timeLeft -= dt;
    if (state.flash) {
      state.flash.alpha -= dt * 1.5;
      if (state.flash.alpha <= 0) state.flash = null;
    }
    draw();
    updateHUD();
    if (state.timeLeft <= 0) { endGame(); return; }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    state = {
      score: 0, timeLeft: 30, combo: 1, maxCombo: 1,
      angle: -Math.PI / 2, speed: 0.9, running: true,
      lastFrame: performance.now(), zones: [], flash: null,
      missCount: 0, hitCount: 0
    };
    spawnZones();
    statusEl.textContent = "Жми когда стрелка в зоне!"; statusEl.style.color = "var(--text-muted)";
    updateHUD();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function endGame() {
    stopLockpick();
    var best = Store.get("lockpickbest", 0) || 0;
    var isRecord = state.score > best;
    if (isRecord) Store.set("lockpickbest", state.score);
    if (typeof window.submitGameScore === "function") {
      try { window.submitGameScore("lockpick", state.score); } catch (e) {}
    }
    var overlay = el("div", { style: "position:absolute;inset:0;background:rgba(2,3,8,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:18px;padding:24px;text-align:center;" });
    overlay.appendChild(el("div", { style: "font-size:52px;margin-bottom:6px;" }, isRecord ? "🏆" : "🔓"));
    overlay.appendChild(el("div", { style: "font-size:16px;font-weight:700;color:var(--text);margin-bottom:2px;" }, isRecord ? "Новый рекорд!" : "Замок взломан"));
    overlay.appendChild(el("div", { style: "font-size:38px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);margin:14px 0 6px;" }, state.score.toLocaleString()));
    overlay.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:20px;" }, "Попаданий: " + state.hitCount + " · Промахов: " + state.missCount + " · Макс. комбо: x" + state.maxCombo));

    var btnRow = el("div", { style: "display:flex;gap:8px;" });
    var retryBtn = UI.btn("🔄 Ещё раз");
    retryBtn.addEventListener("click", function () { overlay.remove(); start(); });
    btnRow.appendChild(retryBtn);
    var menuBtn2 = UI.btn("← В меню", { variant: "ghost" });
    menuBtn2.addEventListener("click", function () { overlay.remove(); showIntro("lockpick"); });
    btnRow.appendChild(menuBtn2);
    overlay.appendChild(btnRow);

    canvasWrap.appendChild(overlay);
  }

  canvas.addEventListener("mousedown", function (e) { e.preventDefault(); checkHit(); });
  canvas.addEventListener("touchstart", function (e) { e.preventDefault(); checkHit(); }, { passive: false });

  /* Запуск сразу */
  setTimeout(function () { start(); }, 50);

  return card;
}

/* ═══════════════════════════════════════
   ИГРА 2: АТАКА АВТОМАТОНОВ
   ═══════════════════════════════════════ */
function renderAutomaton() {
  var card = UI.card("⌨️ Атака автоматонов");

  var topRow = el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;" });
  topRow.appendChild(el("div", { class: "dim", style: "font-size:11px;text-transform:uppercase;letter-spacing:0.08em;" }, "Защити Прохвостку"));
  var menuBtn = UI.btn("← В меню", { variant: "ghost" });
  menuBtn.style.cssText = "font-size:11px;padding:6px 12px;";
  menuBtn.addEventListener("click", function () { stopAutomaton(); showIntro("automaton"); });
  topRow.appendChild(menuBtn);
  card.appendChild(topRow);

  /* HUD */
  var hud = el("div", { style: "display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px;" });
  function hudBox(label, color) {
    var b = el("div", { style: "text-align:center;padding:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;" });
    b.appendChild(el("div", { class: "dim", style: "font-size:9px;text-transform:uppercase;letter-spacing:0.1em;" }, label));
    var v = el("div", { style: "font-size:18px;font-weight:900;font-family:'JetBrains Mono',monospace;color:" + color + ";margin-top:2px;" }, "—");
    b.appendChild(v);
    return { box: b, val: v };
  }
  var scoreH = hudBox("Очки", "var(--gold)");
  var timeH = hudBox("Время", "var(--cyan)");
  var livesH = hudBox("Жизни", "var(--red)");
  var multiH = hudBox("Множитель", "var(--accent-light)");
  hud.appendChild(scoreH.box); hud.appendChild(timeH.box); hud.appendChild(livesH.box); hud.appendChild(multiH.box);
  card.appendChild(hud);

  /* Игровое поле */
  var field = el("div", { style: "position:relative;height:340px;border-radius:16px;background:linear-gradient(180deg,#0c0e14 0%,#151824 100%);border:1px solid var(--border);overflow:hidden;" });
  var wordsLayer = el("div", { style: "position:absolute;inset:0;pointer-events:none;overflow:hidden;" });
  field.appendChild(wordsLayer);

  /* Автоматон внизу */
  var botWrap = el("div", { style: "position:absolute;left:50%;bottom:12px;transform:translateX(-50%);text-align:center;z-index:5;" });
  var botEmoji = el("div", { style: "font-size:54px;line-height:1;filter:drop-shadow(0 0 12px rgba(34,211,238,0.5));transition:transform 0.15s ease;" }, "🤖");
  botWrap.appendChild(botEmoji);
  var hpBar = el("div", { style: "width:120px;height:6px;background:rgba(239,68,68,0.2);border-radius:3px;overflow:hidden;margin:8px auto 0;" });
  var hpFill = el("div", { style: "height:100%;width:100%;background:linear-gradient(90deg,var(--green),var(--cyan));border-radius:3px;transition:width 0.3s ease;" });
  hpBar.appendChild(hpFill);
  botWrap.appendChild(hpBar);
  field.appendChild(botWrap);
  card.appendChild(field);

  /* Input */
  var inputRow = el("div", { class: "row", style: "gap:8px;margin-top:14px;" });
  var inp = UI.input("Начни печатать...");
  inp.id = "automatonInput";
  inp.style.flex = "1";
  inp.style.fontSize = "15px";
  inp.style.fontFamily = "'JetBrains Mono', monospace";
  inp.autocomplete = "off";
  inp.autocorrect = "off";
  inp.autocapitalize = "off";
  inp.spellcheck = false;
  var startBtn = UI.btn("Старт");
  inputRow.appendChild(inp);
  inputRow.appendChild(startBtn);
  card.appendChild(inputRow);

  var statusEl = el("div", { style: "text-align:center;margin-top:12px;font-size:13px;font-weight:600;color:var(--text-muted);min-height:20px;" }, "");
  card.appendChild(statusEl);

  /* Состояние */
  var st = {
    score: 0, timeLeft: 60, multiplier: 1, hits: 0,
    running: false, words: [], lastFrame: 0, spawnTimer: 0,
    lives: 3, maxLives: 3
  };
  var rafId = null;

  function stopAutomaton() {
    st.running = false;
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
    /* почистить слова */
    for (var i = 0; i < st.words.length; i++) {
      if (st.words[i].el && st.words[i].el.parentNode) st.words[i].el.parentNode.removeChild(st.words[i].el);
    }
    st.words = [];
  }

  function renderHUD() {
    scoreH.val.textContent = st.score.toLocaleString();
    timeH.val.textContent = Math.max(0, st.timeLeft).toFixed(1);
    livesH.val.textContent = st.lives + "/" + st.maxLives;
    multiH.val.textContent = "x" + st.multiplier;
    if (st.lives <= 1) livesH.val.style.color = "var(--red)";
    else livesH.val.style.color = "var(--red)";
    if (st.timeLeft <= 10) timeH.val.style.color = "var(--red)";
    else timeH.val.style.color = "var(--cyan)";
  }

  function spawnWord() {
    var word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    var el_ = document.createElement("div");
    el_.style.cssText = "position:absolute;background:rgba(139,92,246,0.14);border:1px solid rgba(139,92,246,0.4);border-radius:8px;padding:7px 13px;font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:var(--accent-light);white-space:nowrap;transition:background 0.1s, border-color 0.1s;";
    el_.textContent = word;
    var maxX = Math.max(20, field.clientWidth - 160);
    var x = 20 + Math.random() * maxX;
    el_.style.left = x + "px";
    el_.style.top = "-40px";
    wordsLayer.appendChild(el_);
    var speed = 42 + Math.random() * 22 + (60 - st.timeLeft) * 0.4;
    st.words.push({ el: el_, word: word, y: -40, speed: speed });
  }

  function updateWords(dt) {
    var fieldH = field.clientHeight;
    for (var i = st.words.length - 1; i >= 0; i--) {
      var w = st.words[i];
      w.y += w.speed * dt;
      w.el.style.top = w.y + "px";
      if (w.y > fieldH - 90) {
        /* слово дошло до робота */
        if (w.el.parentNode) w.el.parentNode.removeChild(w.el);
        st.words.splice(i, 1);
        st.multiplier = 1;
        st.lives--;
        botEmoji.style.transform = "translateX(-50%) scale(1.15) rotate(-8deg)";
        setTimeout(function () { botEmoji.style.transform = "translateX(-50%) scale(1) rotate(0deg)"; }, 160);
        statusEl.textContent = "💥 Пропуск! −1 жизнь"; statusEl.style.color = "var(--red)";
        var newPct = (st.lives / st.maxLives) * 100;
        hpFill.style.width = Math.max(0, newPct) + "%";
        if (st.lives <= 0) { endGame(); return; }
      }
    }
  }

  function checkInput(rawVal) {
    if (!st.running) return;
    var typed = String(rawVal || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!typed) return;

    /* Точное совпадение? */
    for (var i = 0; i < st.words.length; i++) {
      var w = st.words[i];
      var target = w.word.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (target === typed) {
        var base = 30 + w.word.length * 25;
        var pts = Math.round(base * st.multiplier);
        st.score += pts;
        st.hits++;
        st.multiplier = Math.min(5, st.multiplier + 1);
        w.el.style.background = "rgba(34,197,94,0.35)";
        w.el.style.borderColor = "var(--green)";
        w.el.style.color = "var(--green)";
        w.el.style.transform = "scale(1.15)";
        var captured = w.el;
        setTimeout(function () { if (captured.parentNode) captured.parentNode.removeChild(captured); }, 180);
        st.words.splice(i, 1);
        inp.value = "";
        statusEl.textContent = "✓ +" + pts.toLocaleString() + " (x" + st.multiplier + ")";
        statusEl.style.color = "var(--green)";
        renderHUD();
        return;
      }
    }
    /* Подсветка совпадений по префиксу */
    for (var j = 0; j < st.words.length; j++) {
      var w2 = st.words[j];
      var t2 = w2.word.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (t2.indexOf(typed) === 0) {
        w2.el.style.background = "rgba(251,191,36,0.18)";
        w2.el.style.borderColor = "var(--gold)";
      } else {
        w2.el.style.background = "rgba(139,92,246,0.14)";
        w2.el.style.borderColor = "rgba(139,92,246,0.4)";
      }
    }
  }

  function loop(ts) {
    if (!st.running) return;
    var dt = Math.min((ts - st.lastFrame) / 1000, 0.1);
    st.lastFrame = ts;
    st.timeLeft -= dt;

    st.spawnTimer -= dt;
    if (st.spawnTimer <= 0) {
      spawnWord();
      var baseRate = 1.6 - (st.hits * 0.02) - ((60 - st.timeLeft) * 0.005);
      st.spawnTimer = Math.max(0.55, baseRate + Math.random() * 0.4);
    }

    updateWords(dt);
    renderHUD();

    if (st.timeLeft <= 0) { endGame(); return; }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    /* Полная очистка */
    stopAutomaton();
    st.score = 0;
    st.timeLeft = 60;
    st.multiplier = 1;
    st.hits = 0;
    st.lives = 3;
    st.running = true;
    st.words = [];
    st.spawnTimer = 0.5;
    st.lastFrame = performance.now();
    wordsLayer.innerHTML = "";
    hpFill.style.width = "100%";
    botEmoji.textContent = "🤖";

    inp.disabled = false;
    inp.value = "";
    inp.focus();
    startBtn.disabled = true;
    startBtn.textContent = "Идёт...";
    statusEl.textContent = "Печатай слова!";
    statusEl.style.color = "var(--green)";
    renderHUD();
    rafId = requestAnimationFrame(loop);
  }

  function endGame() {
    st.running = false;
    if (rafId) cancelAnimationFrame(rafId);
    inp.disabled = true;
    startBtn.disabled = false;
    startBtn.textContent = "Ещё раз";

    var best = Store.get("automatonbest", 0) || 0;
    var isRecord = st.score > best;
    if (isRecord) Store.set("automatonbest", st.score);
    if (typeof window.submitGameScore === "function") {
      try { window.submitGameScore("automaton", st.score); } catch (e) {}
    }

    var overlay = el("div", { style: "position:absolute;inset:0;background:rgba(2,3,8,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;padding:24px;text-align:center;z-index:20;" });
    var title = st.lives <= 0 ? "Прохвостка пала" : "Время вышло";
    overlay.appendChild(el("div", { style: "font-size:52px;margin-bottom:6px;" }, isRecord ? "🏆" : (st.lives <= 0 ? "💀" : "⏱")));
    overlay.appendChild(el("div", { style: "font-size:16px;font-weight:700;color:var(--text);margin-bottom:2px;" }, isRecord ? "Новый рекорд!" : title));
    overlay.appendChild(el("div", { style: "font-size:38px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);margin:14px 0 6px;" }, st.score.toLocaleString()));
    overlay.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:20px;" }, "Слов сбито: " + st.hits + " · Жизней осталось: " + Math.max(0, st.lives) + "/3"));

    var btnRow = el("div", { style: "display:flex;gap:8px;" });
    var retryBtn = UI.btn("🔄 Ещё раз");
    retryBtn.addEventListener("click", function () { overlay.remove(); start(); });
    btnRow.appendChild(retryBtn);
    var menuBtn2 = UI.btn("← В меню", { variant: "ghost" });
    menuBtn2.addEventListener("click", function () { overlay.remove(); showIntro("automaton"); });
    btnRow.appendChild(menuBtn2);
    overlay.appendChild(btnRow);

    field.appendChild(overlay);
  }

  inp.addEventListener("input", function () { checkInput(inp.value); });
  inp.addEventListener("keydown", function (e) {
    if (e.key === "Enter") { e.preventDefault(); checkInput(inp.value); }
  });
  startBtn.addEventListener("click", function () { start(); });

  /* Автозапуск */
  setTimeout(function () { start(); }, 50);

  return card;
}

/* ═══════════════════════════════════════
   ИГРА 3: ВИКТОРИНА
   ═══════════════════════════════════════ */
function renderQuiz() {
  var card = UI.card("🧠 Викторина");

  var topRow = el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;" });
  topRow.appendChild(el("div", { class: "dim", style: "font-size:11px;text-transform:uppercase;letter-spacing:0.08em;" }, "Викторина"));
  var menuBtn = UI.btn("← В меню", { variant: "ghost" });
  menuBtn.style.cssText = "font-size:11px;padding:6px 12px;";
  menuBtn.addEventListener("click", function () { showIntro("quiz"); });
  topRow.appendChild(menuBtn);
  card.appendChild(topRow);

  var bank = shuffle(QUIZ).slice(0, 10);
  var idx = 0, score = 0;

  var progressWrap = el("div", { style: "height:6px;background:var(--bg-elev);border-radius:3px;overflow:hidden;margin-bottom:18px;" });
  var progressFill = el("div", { style: "height:100%;width:0%;background:linear-gradient(90deg,var(--accent),var(--cyan));border-radius:3px;transition:width 0.3s ease;" });
  progressWrap.appendChild(progressFill);
  card.appendChild(progressWrap);

  var content = el("div");
  card.appendChild(content);

  function show() {
    content.innerHTML = "";
    progressFill.style.width = ((idx / bank.length) * 100) + "%";

    if (idx >= bank.length) {
      progressFill.style.width = "100%";
      var resultWrap = el("div", { style: "text-align:center;padding:24px 16px;" });
      var emoji = score >= 9 ? "🏆" : score >= 7 ? "🥇" : score >= 5 ? "⭐" : "📘";
      resultWrap.appendChild(el("div", { style: "font-size:56px;margin-bottom:10px;" }, emoji));
      resultWrap.appendChild(el("div", { style: "font-size:16px;font-weight:700;color:var(--text);" }, "Результат"));
      resultWrap.appendChild(el("div", { style: "font-size:44px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);margin:14px 0 6px;" }, score + " / " + bank.length));
      resultWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:20px;" }, "Правильных ответов: " + score + " из " + bank.length));
      var btnRow = el("div", { style: "display:flex;gap:8px;justify-content:center;" });
      var retry = UI.btn("🔄 Ещё раз");
      retry.addEventListener("click", function () {
        idx = 0; score = 0;
        bank = shuffle(QUIZ).slice(0, 10);
        show();
      });
      btnRow.appendChild(retry);
      var menu = UI.btn("← В меню", { variant: "ghost" });
      menu.addEventListener("click", function () { showIntro("quiz"); });
      btnRow.appendChild(menu);
      resultWrap.appendChild(btnRow);

      content.appendChild(resultWrap);

      var b = Store.get("quizbest", 0) || 0;
      if (score > b) Store.set("quizbest", score);
      if (typeof window.submitGameScore === "function") {
        try { window.submitGameScore("quiz", score * 100); } catch (e) {}
      }
      if (typeof Achievements !== "undefined") Achievements.check();
      return;
    }

    var q = bank[idx];
    content.appendChild(el("div", { class: "dim", style: "font-size:11px;letter-spacing:0.06em;text-transform:uppercase;" }, "Вопрос " + (idx + 1) + " из " + bank.length));
    content.appendChild(el("div", { style: "font-size:15px;font-weight:700;margin:10px 0 16px;line-height:1.4;" }, q.q));

    var opts = shuffle(q.opts);
    for (var i = 0; i < opts.length; i++) {
      (function (o) {
        var btn = el("button", { style: "display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:11px;color:var(--text);cursor:pointer;font-family:inherit;font-size:13.5px;font-weight:500;transition:border-color 0.15s, background 0.15s;" }, o);
        btn.addEventListener("mouseenter", function () {
          if (!btn.disabled) btn.style.borderColor = "var(--accent)";
        });
        btn.addEventListener("mouseleave", function () {
          if (!btn.disabled) btn.style.borderColor = "var(--border)";
        });
        btn.addEventListener("click", function () {
          var ok = o === q.a;
          btn.style.background = ok ? "var(--green-bg)" : "var(--red-bg)";
          btn.style.borderColor = ok ? "var(--green)" : "var(--red)";
          btn.style.color = ok ? "var(--green)" : "var(--red)";
          if (ok) score++;
          var all = content.querySelectorAll("button");
          for (var k = 0; k < all.length; k++) all[k].disabled = true;
          setTimeout(function () { idx++; show(); }, 620);
        });
        content.appendChild(btn);
      })(opts[i]);
    }
  }

  show();
  return card;
}
