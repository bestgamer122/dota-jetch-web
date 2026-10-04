/* DOTA JETCH — MINI-GAMES v8.4
   - Плавная прогрессия сложности по времени в обеих играх
   - Lockpick: скорость растёт линейно за 20 сек (+ бонус за попадания)
   - Automaton: скорость слов и темп спавна растут линейно за 60 сек
   - Fix: multiplier сбрасывается при неверном вводе
   - Fix: lockpick/automaton останавливаются при уходе со страницы */

var QUIZ = [
  { q: "Какая способность у Juggernaut даёт неуязвимость во время каста?", a: "Omnislash", opts: ["Omnislash", "Blade Fury", "Blade Dance", "Healing Ward"] },
  { q: "Сколько стоит Black King Bar?", a: "4050", opts: ["3900", "4050", "4200", "5000"] },
  { q: "Какой предмет даёт иммунитет к большинству магии?", a: "Black King Bar", opts: ["Linken's Sphere", "Black King Bar", "Lotus Orb", "Eul's Scepter"] },
  { q: "Кто может блинкаться без задержки и кулдауна (Blink)?", a: "Anti-Mage", opts: ["Anti-Mage", "Queen of Pain", "Faceless Void", "Storm Spirit"] },
  { q: "Какой предмет снимает сайленс с себя при использовании?", a: "Eul's Scepter", opts: ["Manta Style", "Eul's Scepter", "Force Staff", "Glimmer Cape"] },
  { q: "Что даёт Rune of Wisdom?", a: "Опыт", opts: ["Золото", "Опыт", "Ману", "HP"] },
  { q: "Кто становится невидимым в ульте (Shadow Dance)?", a: "Slark", opts: ["Riki", "Slark", "Bounty Hunter", "Clinkz"] },
  { q: "Сколько длится Hex от Scythe of Vyse?", a: "3.5 сек", opts: ["2 сек", "3 сек", "3.5 сек", "5 сек"] },
  { q: "Что даёт Aegis of the Immortal?", a: "Возрождение", opts: ["HP", "Ману", "Возрождение", "Урон"] },
  { q: "Через сколько минут респавнится Roshan?", a: "8-11 мин", opts: ["5 мин", "8-11 мин", "12 мин", "15 мин"] },
  { q: "Что такое KDA?", a: "Kills / Deaths / Assists", opts: ["Kills / Deaths / Assists", "Kills / Damage / Assists", "Kills / Denies / Assists", "Kills / Damage / Armor"] },
  { q: "Какая роль чаще всего у Crystal Maiden?", a: "Pos 5", opts: ["Pos 1", "Pos 2", "Pos 4", "Pos 5"] },
  { q: "Сколько тиров нейтральных предметов сейчас в игре?", a: "5", opts: ["3", "4", "5", "6"] },
  { q: "Какой атрибут даёт +1 HP за единицу (у большинства героев)?", a: "Сила (Strength)", opts: ["Сила (Strength)", "Ловкость (Agility)", "Интеллект (Intelligence)", "Универсальность (Universal)"] },
  { q: "Сколько героев в Dota 2 (на 2026 год)?", a: "127", opts: ["112", "120", "127", "135"] },
  { q: "Какой предмет блокирует точечные заклинания?", a: "Linken's Sphere", opts: ["Black King Bar", "Linken's Sphere", "Lotus Orb", "Aeon Disk"] },
  { q: "Что делает Smoke of Deceit?", a: "Скрывает союзников от вардов", opts: ["Даёт невидимость на 30 сек", "Скрывает союзников от вардов", "Увеличивает скорость", "Восстанавливает HP"] },
  { q: "Какой предмет даёт иммунитет к физатакам?", a: "Ghost Scepter", opts: ["Ghost Scepter", "Ethereal Blade", "BKB", "Blade Mail"] },
  { q: "Как называется нейтральный босс в центре карты?", a: "Roshan", opts: ["Roshan", "Aegis", "Tormentor", "Ancient"] },
  { q: "Сколько золота даёт один крип на старте?", a: "~40", opts: ["~20", "~30", "~40", "~60"] }
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
var _activeLockpick = null;
var _activeAutomaton = null;

function renderGames() {
  var frag = document.createDocumentFragment();
  frag.appendChild(UI.heroBanner("Мини-игры", "Выбери игру и покажи лучший результат", []));

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
        stopActiveGames();
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

  if (typeof window.renderRatingWidget === "function") {
    try { frag.appendChild(window.renderRatingWidget()); } catch (e) { console.warn("rating widget:", e); }
  }

  var stats = el("div", { class: "stat-grid" });
  var lpBest = Store.get("lockpickbest", 0) || 0;
  var autoBest = Store.get("automatonbest", 0) || 0;
  var q = Store.get("quizbest", 0) || 0;
  stats.appendChild(UI.statCard("🔓", "var(--yellow)", "var(--yellow-bg)", "Взлом замка", lpBest ? lpBest.toLocaleString() : "—", "лучший"));
  stats.appendChild(UI.statCard("⌨️", "var(--cyan)", "var(--cyan-bg)", "Автоматоны", autoBest ? autoBest.toLocaleString() : "—", "лучший"));
  stats.appendChild(UI.statCard("🧠", "var(--green)", "var(--green-bg)", "Викторина", q ? q + "/10" : "—", "лучший"));
  frag.appendChild(stats);

  var area = el("div", { id: "gameArea" });
  frag.appendChild(area);

  setTimeout(function () { showIntro(CURRENT_GAME); }, 50);
  return frag;
}

function stopActiveGames() {
  if (_activeLockpick && typeof _activeLockpick.stop === "function") { try { _activeLockpick.stop(); } catch (e) {} }
  if (_activeAutomaton && typeof _activeAutomaton.stop === "function") { try { _activeAutomaton.stop(); } catch (e) {} }
  _activeLockpick = null;
  _activeAutomaton = null;
}

function showIntro(kind) {
  stopActiveGames();
  var area = qs("#gameArea");
  if (!area) return;
  area.innerHTML = "";
  if (kind === "lockpick") area.appendChild(buildLockpickIntro());
  else if (kind === "automaton") area.appendChild(buildAutomatonIntro());
  else if (kind === "quiz") area.appendChild(buildQuizIntro());
}

function startGame(kind) {
  var area = qs("#gameArea");
  if (!area) return;
  area.innerHTML = "";
  if (kind === "lockpick") { var c = renderLockpick(); area.appendChild(c); }
  else if (kind === "automaton") { var c2 = renderAutomaton(); area.appendChild(c2); }
  else if (kind === "quiz") area.appendChild(renderQuiz());

  Store.set("gamesplayed", (Store.get("gamesplayed", 0) || 0) + 1);
  if (typeof Daily !== "undefined") Daily.bump("game");
  if (typeof Achievements !== "undefined") Achievements.check();
}

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
  visual.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-top:14px;letter-spacing:0.08em;text-transform:uppercase;" }, "Стрелка · Зоны · Промах"));
  card.appendChild(visual);
  card.appendChild(buildRulesBlock("Как играть", [
    "ЛКМ — кликнуть когда стрелка в жёлтой или синей зоне",
    "Жёлтая зона = 1 000 очков",
    "Синяя зона = +1.5 секунды",
    "Скорость плавно растёт со временем",
    "ПКМ (удерживай) — ускорить стрелку",
    "Промах — стрелка замедляется на 0.6 сек",
    "Цель — 6 000 очков"
  ]));
  card.appendChild(buildPlayButton("🎮 Играть", "lockpick"));
  return card;
}

function buildAutomatonIntro() {
  var card = UI.card("⌨️ Атака автоматонов");
  var visual = el("div", { style: "text-align:center;padding:24px 0 8px;" });
  visual.appendChild(el("div", { style: "font-size:90px;line-height:1;filter:drop-shadow(0 0 20px rgba(34,211,238,0.4));" }, "🤖"));
  visual.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-top:14px;letter-spacing:0.08em;text-transform:uppercase;" }, "Печатай слова · Получай очки"));
  card.appendChild(visual);
  card.appendChild(buildRulesBlock("Как играть", [
    "Печатай слова Dota 2, которые летят к автоматону",
    "Правильно напечатал — слово сбито, +очки",
    "Пропустил слово — сброс множителя",
    "Комбо-множитель до x5 за серию",
    "Скорость слов плавно растёт со временем",
    "Всего 60 секунд"
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
    "10 случайных вопросов",
    "4 варианта ответа — выбери правильный",
    "Счёт: 1 балл за верный ответ",
    "Без рейтинга — просто проверь знания"
  ]));
  card.appendChild(buildPlayButton("🎮 Играть", "quiz"));
  return card;
}

/* ─── LOCKPICK: плавная прогрессия ─── */
function renderLockpick() {
  var card = UI.card("🔓 Взлом замка");
  var topRow = el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;" });
  topRow.appendChild(el("div", { class: "dim", style: "font-size:11px;text-transform:uppercase;letter-spacing:0.08em;" }, "Взлом замка"));
  var menuBtn = UI.btn("← В меню", { variant: "ghost" });
  menuBtn.style.cssText = "font-size:11px;padding:6px 12px;";
  menuBtn.addEventListener("click", function () { stopLockpick(); showIntro("lockpick"); });
  topRow.appendChild(menuBtn);
  card.appendChild(topRow);

  var canvasWrap = el("div", { style: "position:relative;max-width:360px;margin:0 auto;" });
  var canvas = document.createElement("canvas");
  canvas.width = 360;
  canvas.height = 360;
  canvas.style.cssText = "display:block;width:100%;border-radius:16px;background:#12141a;cursor:pointer;user-select:none;";
  canvasWrap.appendChild(canvas);
  card.appendChild(canvasWrap);

  var progressWrap = el("div", { style: "max-width:360px;margin:12px auto 0;" });
  progressWrap.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-bottom:4px;text-align:right;" }, "Цель: 6 000"));
  var progressBar = el("div", { style: "height:4px;background:var(--bg-elev);border-radius:2px;overflow:hidden;" });
  var progressFill = el("div", { style: "height:100%;width:0%;background:linear-gradient(90deg,var(--gold),var(--cyan));border-radius:2px;transition:width 0.3s ease;" });
  progressBar.appendChild(progressFill);
  progressWrap.appendChild(progressBar);
  card.appendChild(progressWrap);

  var hud = el("div", { style: "display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:12px;max-width:360px;margin-left:auto;margin-right:auto;" });
  var scoreBox = el("div", { style: "text-align:center;padding:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;" });
  scoreBox.appendChild(el("div", { class: "dim", style: "font-size:9px;text-transform:uppercase;letter-spacing:0.1em;" }, "Очки"));
  var scoreVal = el("div", { style: "font-size:18px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);" }, "0");
  scoreBox.appendChild(scoreVal);
  hud.appendChild(scoreBox);

  var timeBox = el("div", { style: "text-align:center;padding:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;" });
  timeBox.appendChild(el("div", { class: "dim", style: "font-size:9px;text-transform:uppercase;letter-spacing:0.1em;" }, "Время"));
  var timeVal = el("div", { style: "font-size:18px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--cyan);" }, "20.0");
  timeBox.appendChild(timeVal);
  hud.appendChild(timeBox);

  var dirBox = el("div", { style: "text-align:center;padding:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;" });
  dirBox.appendChild(el("div", { class: "dim", style: "font-size:9px;text-transform:uppercase;letter-spacing:0.1em;" }, "Скорость"));
  var dirVal = el("div", { style: "font-size:14px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--text);" }, "1.0x");
  dirBox.appendChild(dirVal);
  hud.appendChild(dirBox);
  card.appendChild(hud);

  var statusEl = el("div", { style: "text-align:center;margin-top:12px;font-size:12px;font-weight:600;color:var(--text-muted);min-height:20px;max-width:360px;margin-left:auto;margin-right:auto;" }, "ЛКМ — удар. ПКМ — ускорение.");
  card.appendChild(statusEl);

  var state = {
    score: 0, timeLeft: 20, running: false,
    angle: -Math.PI / 2, direction: 1,
    baseSpeed: 1.6, speedMultiplier: 1,
    lastFrame: 0, zones: [], flash: null, missCount: 0, hitCount: 0,
    missLockUntil: 0, boosting: false
  };
  var rafId = null;
  var cx = canvas.width / 2, cy = canvas.height / 2, r = 138, ringWidth = 32;

  function stop() {
    state.running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }
  _activeLockpick = { stop: stop };

  function stopLockpick() { stop(); _activeLockpick = null; }
  window._stopLockpick = stopLockpick;

  function spawnZones() {
    state.zones = [];
    var count = 1 + Math.floor(Math.random() * 2);
    var used = [];
    for (var i = 0; i < count; i++) {
      var tries = 0, z;
      do {
        var isBlue = Math.random() < 0.18;
        var size = isBlue ? (0.05 + Math.random() * 0.03) : (0.07 + Math.random() * 0.05);
        z = { start: Math.random() * Math.PI * 2, size: size, blue: isBlue };
        tries++;
      } while (overlaps(z, used) && tries < 30);
      used.push(z);
      state.zones.push(z);
    }
  }
  function overlaps(z, others) {
    for (var i = 0; i < others.length; i++) {
      var a1 = norm(z.start), b1 = norm(others[i].start);
      if (Math.abs(a1 - b1) < 0.55) return true;
    }
    return false;
  }
  function norm(a) { a = a % (Math.PI * 2); if (a < 0) a += Math.PI * 2; return a; }

  function draw() {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#12141a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(cx, cy, r + ringWidth / 2 + 6, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(139,92,246,0.15)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(139,92,246,0.28)";
    ctx.lineWidth = ringWidth;
    ctx.stroke();
    for (var i = 0; i < state.zones.length; i++) {
      var z = state.zones[i];
      var startAng = z.start - Math.PI / 2;
      var endAng = startAng + z.size * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAng, endAng);
      ctx.strokeStyle = z.blue ? "rgba(34,211,238,0.25)" : "rgba(251,191,36,0.25)";
      ctx.lineWidth = ringWidth + 10;
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAng, endAng);
      ctx.strokeStyle = z.blue ? "rgba(34,211,238,0.95)" : "rgba(251,191,36,0.95)";
      ctx.lineWidth = ringWidth;
      ctx.stroke();
    }
    var arrowColor = "#fff";
    if (state.missLockUntil > performance.now()) arrowColor = "#ef4444";
    var ax = cx + Math.cos(state.angle - Math.PI / 2) * (r - ringWidth / 2 - 2);
    var ay = cy + Math.sin(state.angle - Math.PI / 2) * (r - ringWidth / 2 - 2);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(ax, ay);
    ctx.strokeStyle = arrowColor;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.stroke();
    if (state.boosting) {
      ctx.beginPath();
      ctx.arc(cx, cy, r - ringWidth - 8, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(34,197,94,0.7)";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 36, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(20,22,30,1)";
    ctx.fill();
    ctx.strokeStyle = "rgba(139,92,246,0.5)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = "28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🔒", cx, cy + 2);
    if (state.flash) {
      ctx.fillStyle = state.flash.color;
      ctx.globalAlpha = state.flash.alpha;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;
    }
  }

  function isInZone(angleRad, z) {
    var a = norm(angleRad), s = norm(z.start), e = norm(z.start + z.size * Math.PI * 2);
    if (s <= e) return a >= s && a <= e;
    return a >= s || a <= e;
  }

  function checkHit() {
    if (!state.running) return;
    var now = performance.now();
    if (state.missLockUntil > now) { statusEl.textContent = "⏸ Заблокировано..."; return; }
    var hit = false;
    for (var i = 0; i < state.zones.length; i++) {
      var z = state.zones[i];
      if (isInZone(state.angle, z)) {
        hit = true;
        if (z.blue) { state.timeLeft = Math.min(60, state.timeLeft + 1.5); state.flash = { color: "rgba(34,211,238,0.20)", alpha: 0.5 }; statusEl.textContent = "⚡ Синяя зона! +1.5 сек"; statusEl.style.color = "var(--cyan)"; }
        else { state.score += 1000; state.hitCount++; state.flash = { color: "rgba(251,191,36,0.18)", alpha: 0.4 }; statusEl.textContent = "✓ Жёлтая! +1 000"; statusEl.style.color = "var(--gold)"; }
        state.direction *= -1;
        spawnZones();
        break;
      }
    }
    if (!hit) {
      state.timeLeft -= 0.6;
      state.missLockUntil = now + 600;
      state.missCount++;
      state.flash = { color: "rgba(239,68,68,0.20)", alpha: 0.5 };
      statusEl.textContent = "✕ Промах! −0.6 сек";
      statusEl.style.color = "var(--red)";
    }
    updateHUD();
  }

  /* ─── ГЛАВНОЕ: плавная прогрессия по времени ─── */
  function updateSpeed() {
    // progress: 0 в начале, 1 в конце (20 сек)
    var elapsed = 20 - state.timeLeft;
    var progress = Math.max(0, Math.min(1, elapsed / 20));
    // Базовый множитель: 1.0 → 2.2 (линейно)
    var timeMultiplier = 1.0 + progress * 1.2;
    // Бонус за попадания: +3% за каждое, но не больше +50%
    var hitBonus = Math.min(0.5, state.hitCount * 0.03);
    state.speedMultiplier = timeMultiplier + hitBonus;
    state.baseSpeed = 1.6 * state.speedMultiplier;
    dirVal.textContent = state.speedMultiplier.toFixed(1) + "x";
  }

  function updateHUD() {
    scoreVal.textContent = state.score.toLocaleString();
    timeVal.textContent = Math.max(0, state.timeLeft).toFixed(1);
    var pct = Math.min(100, (state.score / 6000) * 100);
    progressFill.style.width = pct + "%";
    if (state.timeLeft <= 5) timeVal.style.color = "var(--red)";
    else timeVal.style.color = "var(--cyan)";
  }

  function loop(ts) {
    if (!state.running) return;
    var dt = Math.min((ts - state.lastFrame) / 1000, 0.1);
    state.lastFrame = ts;
    updateSpeed();
    var curSpeed = state.baseSpeed + (state.boosting ? 2.0 : 0);
    state.angle += curSpeed * state.direction * dt;
    state.timeLeft -= dt;
    if (state.flash) { state.flash.alpha -= dt * 1.5; if (state.flash.alpha <= 0) state.flash = null; }
    draw();
    updateHUD();
    if (state.timeLeft <= 0) { endGame(); return; }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    state = { score: 0, timeLeft: 20, running: true, angle: -Math.PI / 2, direction: 1, baseSpeed: 1.6, speedMultiplier: 1, lastFrame: performance.now(), zones: [], flash: null, missCount: 0, hitCount: 0, missLockUntil: 0, boosting: false };
    spawnZones();
    statusEl.textContent = "ЛКМ — удар. ПКМ — ускорение.";
    statusEl.style.color = "var(--text-muted)";
    dirVal.textContent = "1.0x";
    updateHUD();
    draw();
    rafId = requestAnimationFrame(loop);
  }

  function endGame() {
    stopLockpick();
    var best = Store.get("lockpickbest", 0) || 0;
    var isRecord = state.score > best;
    if (isRecord) Store.set("lockpickbest", state.score);
    if (typeof window.submitGameScore === "function") { try { window.submitGameScore("lockpick", state.score); } catch (e) {} }
    var passed = state.score >= 6000;
    var overlay = el("div", { style: "position:absolute;inset:0;background:rgba(2,3,8,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;padding:20px;text-align:center;" });
    overlay.appendChild(el("div", { style: "font-size:46px;margin-bottom:6px;" }, passed ? "🔓" : "🔒"));
    overlay.appendChild(el("div", { style: "font-size:15px;font-weight:700;color:" + (passed ? "var(--green)" : "var(--red)") + ";margin-bottom:2px;" }, passed ? "Замок взломан!" : "Не хватило очков"));
    overlay.appendChild(el("div", { style: "font-size:32px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);margin:12px 0 4px;" }, state.score.toLocaleString()));
    overlay.appendChild(el("div", { class: "dim", style: "font-size:10.5px;margin-bottom:16px;" }, "Попаданий: " + state.hitCount + " · Промахов: " + state.missCount));
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

  canvas.addEventListener("mousedown", function (e) { e.preventDefault(); if (e.button === 2) return; checkHit(); });
  canvas.addEventListener("touchstart", function (e) { e.preventDefault(); checkHit(); }, { passive: false });
  canvas.addEventListener("mousedown", function (e) { if (e.button === 2) { state.boosting = true; } });
  canvas.addEventListener("mouseup", function (e) { if (e.button === 2) { state.boosting = false; } });
  canvas.addEventListener("mouseleave", function () { state.boosting = false; });
  canvas.addEventListener("contextmenu", function (e) { e.preventDefault(); });

  setTimeout(function () { start(); }, 50);
  return card;
}

/* ─── AUTOMATON: плавная прогрессия ─── */
function renderAutomaton() {
  var card = UI.card("⌨️ Атака автоматонов");
  var topRow = el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;" });
  topRow.appendChild(el("div", { class: "dim", style: "font-size:11px;text-transform:uppercase;letter-spacing:0.08em;" }, "Защити Прохвостку"));
  var menuBtn = UI.btn("← В меню", { variant: "ghost" });
  menuBtn.style.cssText = "font-size:11px;padding:6px 12px;";
  menuBtn.addEventListener("click", function () { stopAutomaton(); showIntro("automaton"); });
  topRow.appendChild(menuBtn);
  card.appendChild(topRow);

  var hud = el("div", { style: "display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;" });
  function hudBox(label, color) {
    var b = el("div", { style: "text-align:center;padding:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;" });
    b.appendChild(el("div", { class: "dim", style: "font-size:9px;text-transform:uppercase;letter-spacing:0.1em;" }, label));
    var v = el("div", { style: "font-size:18px;font-weight:900;font-family:'JetBrains Mono',monospace;color:" + color + ";margin-top:2px;" }, "—");
    b.appendChild(v);
    return { box: b, val: v };
  }
  var scoreH = hudBox("Очки", "var(--gold)");
  var timeH = hudBox("Время", "var(--cyan)");
  var multiH = hudBox("Множитель", "var(--accent-light)");
  hud.appendChild(scoreH.box); hud.appendChild(timeH.box); hud.appendChild(multiH.box);
  card.appendChild(hud);

  var field = el("div", { style: "position:relative;height:300px;border-radius:16px;background:linear-gradient(180deg,#0c0e14 0%,#151824 100%);border:1px solid var(--border);overflow:hidden;" });
  var wordsLayer = el("div", { style: "position:absolute;inset:0;pointer-events:none;overflow:hidden;" });
  field.appendChild(wordsLayer);

  var botWrap = el("div", { style: "position:absolute;left:50%;bottom:12px;transform:translateX(-50%);text-align:center;z-index:5;" });
  var botEmoji = el("div", { style: "font-size:48px;line-height:1;filter:drop-shadow(0 0 12px rgba(34,211,238,0.5));transition:transform 0.15s ease;" }, "🤖");
  botWrap.appendChild(botEmoji);
  field.appendChild(botWrap);
  card.appendChild(field);

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

  var st = { score: 0, timeLeft: 60, multiplier: 1, hits: 0, running: false, words: [], lastFrame: 0, spawnTimer: 0, misses: 0, difficulty: 1.0 };
  var rafId = null;

  function stop() {
    st.running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    for (var i = 0; i < st.words.length; i++) {
      if (st.words[i].el && st.words[i].el.parentNode) st.words[i].el.parentNode.removeChild(st.words[i].el);
    }
    st.words = [];
  }
  _activeAutomaton = { stop: stop };

  function stopAutomaton() { stop(); _activeAutomaton = null; }
  window._stopAutomaton = stopAutomaton;

  function renderHUD() {
    scoreH.val.textContent = st.score.toLocaleString();
    timeH.val.textContent = Math.max(0, st.timeLeft).toFixed(1);
    multiH.val.textContent = "x" + st.multiplier;
    if (st.timeLeft <= 10) timeH.val.style.color = "var(--red)";
    else timeH.val.style.color = "var(--cyan)";
  }

  /* ─── ГЛАВНОЕ: расчёт сложности по прогрессу ─── */
  function computeDifficulty() {
    // progress: 0 в начале, 1 в конце (60 сек)
    var elapsed = 60 - st.timeLeft;
    var progress = Math.max(0, Math.min(1, elapsed / 60));
    st.difficulty = 1.0 + progress * 1.5; // 1.0 → 2.5
    return progress;
  }

  function spawnWord() {
    var progress = computeDifficulty();
    var word = WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
    var el_ = document.createElement("div");
    el_.style.cssText = "position:absolute;background:rgba(139,92,246,0.14);border:1px solid rgba(139,92,246,0.4);border-radius:8px;padding:7px 13px;font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:700;color:var(--accent-light);white-space:nowrap;transition:background 0.1s, border-color 0.1s;";
    el_.textContent = word;
    var maxX = Math.max(20, field.clientWidth - 160);
    var x = 20 + Math.random() * maxX;
    el_.style.left = x + "px";
    el_.style.top = "-40px";
    wordsLayer.appendChild(el_);
    // Скорость слов: 45 → 105 (плавно за 60 сек), + небольшой рандом
    var speed = 45 + progress * 60 + Math.random() * 15;
    st.words.push({ el: el_, word: word, y: -40, speed: speed });
  }

  function updateWords(dt) {
    var fieldH = field.clientHeight;
    for (var i = st.words.length - 1; i >= 0; i--) {
      var w = st.words[i];
      w.y += w.speed * dt;
      w.el.style.top = w.y + "px";
      if (w.y > fieldH - 100) {
        if (w.el.parentNode) w.el.parentNode.removeChild(w.el);
        st.words.splice(i, 1);
        st.multiplier = 1;
        st.misses++;
        botEmoji.style.transform = "translateX(-50%) scale(1.15) rotate(-8deg)";
        setTimeout(function () { botEmoji.style.transform = "translateX(-50%) scale(1) rotate(0deg)"; }, 160);
        statusEl.textContent = "💥 Пропуск! Множитель сброшен";
        statusEl.style.color = "var(--red)";
        renderHUD();
      }
    }
  }

  function checkInput(rawVal) {
    if (!st.running) return;
    var typed = String(rawVal || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    if (!typed) return;

    var matched = false;
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
    for (var j = 0; j < st.words.length; j++) {
      var w2 = st.words[j];
      var t2 = w2.word.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (t2.indexOf(typed) === 0) {
        w2.el.style.background = "rgba(251,191,36,0.18)";
        w2.el.style.borderColor = "var(--gold)";
        matched = true;
      } else {
        w2.el.style.background = "rgba(139,92,246,0.14)";
        w2.el.style.borderColor = "rgba(139,92,246,0.4)";
      }
    }
    if (!matched && typed.length >= 3) {
      st.multiplier = 1;
      statusEl.textContent = "✕ Не то слово! Множитель сброшен";
      statusEl.style.color = "var(--red)";
      renderHUD();
      inp.value = "";
    }
  }

  function loop(ts) {
    if (!st.running) return;
    var dt = Math.min((ts - st.lastFrame) / 1000, 0.1);
    st.lastFrame = ts;
    st.timeLeft -= dt;
    st.spawnTimer -= dt;
    var progress = computeDifficulty();
    if (st.spawnTimer <= 0) {
      spawnWord();
      // Интервал спавна: 2.0 → 0.85 (плавно за 60 сек)
      var baseRate = 2.0 - progress * 1.15;
      st.spawnTimer = Math.max(0.75, baseRate + Math.random() * 0.25);
    }
    updateWords(dt);
    renderHUD();
    if (st.timeLeft <= 0) { endGame(); return; }
    rafId = requestAnimationFrame(loop);
  }

  function start() {
    stopAutomaton();
    st.score = 0; st.timeLeft = 60; st.multiplier = 1; st.hits = 0; st.misses = 0; st.difficulty = 1.0;
    st.running = true; st.words = []; st.spawnTimer = 1.2; st.lastFrame = performance.now();
    wordsLayer.innerHTML = "";
    botEmoji.textContent = "🤖";
    inp.disabled = false; inp.value = ""; inp.focus();
    startBtn.disabled = true; startBtn.textContent = "Идёт...";
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
    if (typeof window.submitGameScore === "function") { try { window.submitGameScore("automaton", st.score); } catch (e) {} }
    var overlay = el("div", { style: "position:absolute;inset:0;background:rgba(2,3,8,0.92);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;padding:20px;text-align:center;z-index:20;" });
    overlay.appendChild(el("div", { style: "font-size:46px;margin-bottom:6px;" }, isRecord ? "🏆" : "⏱"));
    overlay.appendChild(el("div", { style: "font-size:15px;font-weight:700;color:var(--text);margin-bottom:2px;" }, isRecord ? "Новый рекорд!" : "Время вышло"));
    overlay.appendChild(el("div", { style: "font-size:32px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);margin:12px 0 4px;" }, st.score.toLocaleString()));
    overlay.appendChild(el("div", { class: "dim", style: "font-size:10.5px;margin-bottom:16px;" }, "Слов сбито: " + st.hits + " · Пропущено: " + st.misses));
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
  inp.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); checkInput(inp.value); } });
  startBtn.addEventListener("click", function () { start(); });

  setTimeout(function () { start(); }, 50);
  return card;
}

/* ─── QUIZ ─── */
function renderQuiz() {
  var card = UI.card("🧠 Викторина");
  var topRow = el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;" });
  topRow.appendChild(el("div", { class: "dim", style: "font-size:11px;text-transform:uppercase;letter-spacing:0.08em;" }, "Викторина · без рейтинга"));
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
        btn.addEventListener("mouseenter", function () { if (!btn.disabled) btn.style.borderColor = "var(--accent)"; });
        btn.addEventListener("mouseleave", function () { if (!btn.disabled) btn.style.borderColor = "var(--border)"; });
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

console.log("games v8.4 ready (smooth difficulty progression)");
