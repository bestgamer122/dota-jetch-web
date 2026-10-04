/* DOTA JETCH — MINI-GAMES v10.0
   - Dire Jumper: swept-коллизия, умный спавн, статичные шипы, лава
   - Заточка с cooldown 300ms
   - Игры останавливаются при смене вкладки сайта
   - Плавная прогрессия сложности в автоматонах и замке */

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

function _snd(name) {
  try { if (typeof Sound !== "undefined" && Sound[name]) Sound[name](); } catch (e) {}
}

var CURRENT_GAME = "lockpick";
var _activeLockpick = null;
var _activeAutomaton = null;
var _activeDireJumper = null;

function renderGames() {
  var frag = document.createDocumentFragment();
  frag.appendChild(UI.heroBanner("Мини-игры", "Выбери игру и покажи лучший результат", []));

  var tabs = el("div", { class: "row", style: "margin-bottom:16px;gap:8px;flex-wrap:wrap;" });
  var tabDefs = [
    { id: "lockpick", label: "🔓 Взлом замка" },
    { id: "automaton", label: "⌨️ Атака автоматонов" },
    { id: "direjumper", label: "🎪 Дири-Джампер" },
    { id: "quiz", label: "🧠 Викторина" }
  ];
  for (var t = 0; t < tabDefs.length; t++) {
    (function (tab) {
      var isActive = tab.id === CURRENT_GAME;
      var b = UI.btn(tab.label, { variant: isActive ? undefined : "ghost", id: "gameTab_" + tab.id });
      b.addEventListener("click", function () {
        stopActiveGames();
        CURRENT_GAME = tab.id;
        qsa("#gameTab_lockpick, #gameTab_automaton, #gameTab_direjumper, #gameTab_quiz").forEach(function (btn) {
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
  var djBest = Store.get("direjumperbest", 0) || 0;
  var q = Store.get("quizbest", 0) || 0;
  stats.appendChild(UI.statCard("🔓", "var(--yellow)", "var(--yellow-bg)", "Взлом замка", lpBest ? lpBest.toLocaleString() : "—", "лучший"));
  stats.appendChild(UI.statCard("⌨️", "var(--cyan)", "var(--cyan-bg)", "Автоматоны", autoBest ? autoBest.toLocaleString() : "—", "лучший"));
  stats.appendChild(UI.statCard("🎪", "var(--accent-light)", "var(--accent-bg)", "Дири-Джампер", djBest ? djBest.toLocaleString() : "—", "лучший"));
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
  if (_activeDireJumper && typeof _activeDireJumper.stop === "function") { try { _activeDireJumper.stop(); } catch (e) {} }
  _activeLockpick = null;
  _activeAutomaton = null;
  _activeDireJumper = null;
}

function showIntro(kind) {
  stopActiveGames();
  var area = qs("#gameArea");
  if (!area) return;
  area.innerHTML = "";
  if (kind === "lockpick") area.appendChild(buildLockpickIntro());
  else if (kind === "automaton") area.appendChild(buildAutomatonIntro());
  else if (kind === "direjumper") area.appendChild(buildDireJumperIntro());
  else if (kind === "quiz") area.appendChild(buildQuizIntro());
}

function startGame(kind) {
  var area = qs("#gameArea");
  if (!area) return;
  area.innerHTML = "";
  if (kind === "lockpick") { var c = renderLockpick(); area.appendChild(c); }
  else if (kind === "automaton") { var c2 = renderAutomaton(); area.appendChild(c2); }
  else if (kind === "direjumper") { var c3 = renderDireJumper(); area.appendChild(c3); }
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

function buildDireJumperIntro() {
  var card = UI.card("🎪 Дири-Джампер");
  var visual = el("div", { style: "text-align:center;padding:24px 0 8px;" });
  visual.appendChild(el("div", { style: "font-size:90px;line-height:1;filter:drop-shadow(0 0 20px rgba(139,92,246,0.4));" }, "🐟"));
  visual.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-top:14px;letter-spacing:0.08em;text-transform:uppercase;" }, "Сларк · Прыжки · Заточки"));
  card.appendChild(visual);
  card.appendChild(buildRulesBlock("Как играть", [
    "A / D или ← → — двигать Сларка влево/вправо",
    "W / ↑ / SPACE — метнуть заточку (КД 0.3 сек)",
    "Прыгай по платформам как можно выше",
    "Экран зациклен по горизонтали",
    "Избегай шипов и голов шутов — они убивают",
    "НЕ КАСАЙСЯ ЛАВЫ внизу — мгновенная смерть",
    "Цель — набрать максимум очков за высоту"
  ]));
  card.appendChild(buildPlayButton("🎮 Играть", "direjumper"));
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

/* ─── LOCKPICK ─── */
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
        if (z.blue) {
          state.timeLeft = Math.min(60, state.timeLeft + 1.5);
          state.flash = { color: "rgba(34,211,238,0.20)", alpha: 0.5 };
          statusEl.textContent = "⚡ Синяя зона! +1.5 сек";
          statusEl.style.color = "var(--cyan)";
          _snd("hit");
        } else {
          state.score += 1000;
          state.hitCount++;
          state.flash = { color: "rgba(251,191,36,0.18)", alpha: 0.4 };
          statusEl.textContent = "✓ Жёлтая! +1 000";
          statusEl.style.color = "var(--gold)";
          _snd("hit");
        }
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
      _snd("miss");
    }
    updateHUD();
  }

  function updateSpeed() {
    var elapsed = 20 - state.timeLeft;
    var progress = Math.max(0, Math.min(1, elapsed / 20));
    var timeMultiplier = 1.0 + progress * 1.2;
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
    if (passed) _snd("win"); else _snd("fail");
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

/* ─── AUTOMATON ─── */
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

  function computeDifficulty() {
    var elapsed = 60 - st.timeLeft;
    var progress = Math.max(0, Math.min(1, elapsed / 60));
    st.difficulty = 1.0 + progress * 1.5;
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
        _snd("miss");
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
        _snd("hit");
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
      _snd("error");
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
    if (isRecord) _snd("win"); else _snd("fail");
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
      if (score >= 7) _snd("win"); else if (score < 5) _snd("fail");
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
          if (ok) { score++; _snd("success"); }
          else { _snd("error"); }
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

/* ─── DIRE JUMPER v10.0 ─── */
function renderDireJumper() {
  var card = UI.card("🎪 Дири-Джампер");
  var topRow = el("div", { style: "display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;" });
  topRow.appendChild(el("div", { class: "dim", style: "font-size:11px;text-transform:uppercase;letter-spacing:0.08em;" }, "Сларк · Прыжки · Заточки"));
  var menuBtn = UI.btn("← В меню", { variant: "ghost" });
  menuBtn.style.cssText = "font-size:11px;padding:6px 12px;";
  menuBtn.addEventListener("click", function () { stopDireJumper(); showIntro("direjumper"); });
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
  var heightH = hudBox("Высота", "var(--cyan)");
  var bestH = hudBox("Рекорд", "var(--accent-light)");
  hud.appendChild(scoreH.box); hud.appendChild(heightH.box); hud.appendChild(bestH.box);
  card.appendChild(hud);

  var canvasWrap = el("div", { style: "position:relative;max-width:420px;margin:0 auto;" });
  var canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 500;
  canvas.tabIndex = 0;
  canvas.style.cssText = "display:block;width:100%;border-radius:16px;background:#0c0e14;border:1px solid var(--border);user-select:none;outline:none;";
  canvasWrap.appendChild(canvas);
  card.appendChild(canvasWrap);

  var statusEl = el("div", { style: "text-align:center;margin-top:12px;font-size:12px;font-weight:600;color:var(--text-muted);min-height:20px;max-width:420px;margin-left:auto;margin-right:auto;" }, "A / D — двигать · W / ↑ / SPACE — заточка");
  card.appendChild(statusEl);

  var W = canvas.width, H = canvas.height;
  var LAVA_HEIGHT = 30;
  var SHOT_COOLDOWN = 300;
  var JUMP_POWER = -13;
  var GRAVITY = 0.5;
  var MAX_VY = 16;
  var STEP_MIN = 65;
  var STEP_MAX = 105;
  var PLATFORM_MIN_W = 70;
  var PLATFORM_MAX_W = 110;

  var lastShotTime = 0;
  var state = {
    running: false, score: 0, best: Store.get("direjumperbest", 0) || 0,
    cameraY: 0, maxHeight: 0,
    player: { x: 0, y: 0, vx: 0, vy: 0, w: 30, h: 30, facing: 1, animT: 0, prevY: 0 },
    platforms: [], obstacles: [], projectiles: [], particles: [], powerups: [],
    keys: { left: false, right: false },
    lastFrame: 0, spawnAcc: 0,
    lastCheckedScore: 0,
    deathReason: ""
  };
  var rafId = null;
  var listenersAttached = false;

  function attachListeners() {
    if (listenersAttached) return;
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp, true);
    listenersAttached = true;
  }
  function detachListeners() {
    if (!listenersAttached) return;
    document.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("keyup", onKeyUp, true);
    listenersAttached = false;
  }

  function stop() {
    state.running = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    detachListeners();
  }
  _activeDireJumper = { stop: stop };

  function stopDireJumper() { stop(); _activeDireJumper = null; }
  window._stopDireJumper = stopDireJumper;

  function findSpawnSpot(baseX, baseY) {
    for (var attempt = 0; attempt < 15; attempt++) {
      var w = PLATFORM_MIN_W + Math.random() * (PLATFORM_MAX_W - PLATFORM_MIN_W);
      var step = STEP_MIN + Math.random() * (STEP_MAX - STEP_MIN);
      var y = baseY - step;
      var xRange = 130;
      var minX = Math.max(10, baseX - xRange);
      var maxX = Math.min(W - w - 10, baseX + xRange);
      if (maxX < minX) { minX = 10; maxX = W - w - 10; }
      var x = minX + Math.random() * (maxX - minX);
      var overlaps = false;
      for (var i = 0; i < state.platforms.length; i++) {
        var p = state.platforms[i];
        if (Math.abs(p.y - y) < 25) {
          if (x < p.x + p.w + 10 && x + w + 10 > p.x) { overlaps = true; break; }
        }
      }
      if (!overlaps) return { x: x, y: y, w: w };
    }
    var wf = 80;
    var xf = Math.max(10, Math.min(W - wf - 10, baseX + (Math.random() - 0.5) * 100));
    return { x: xf, y: baseY - 90, w: wf };
  }

  function spawnPlatformAbove(baseX, baseY) {
    var spot = findSpawnSpot(baseX, baseY);
    var type = "static";
    var r = Math.random();
    if (r < 0.15) type = "moving";
    else if (r < 0.25) type = "fragile";
    else if (r < 0.32) type = "bouncy";

    var p = {
      x: spot.x, y: spot.y, w: spot.w, h: 12,
      type: type,
      dir: Math.random() < 0.5 ? 1 : -1,
      speed: 0.6 + Math.random() * 0.6,
      baseX: spot.x
    };
    state.platforms.push(p);

    if (type !== "bouncy" && Math.random() < 0.18 && spot.y < -200) {
      var obsW = 20;
      var obsX = spot.x + 5 + Math.random() * Math.max(1, spot.w - obsW - 10);
      state.obstacles.push({ x: obsX, y: spot.y - 20, w: obsW, h: 20, type: "spike", alive: true });
    } else if (type === "static" && Math.random() < 0.10 && spot.y < -400) {
      state.obstacles.push({ x: spot.x + spot.w / 2 - 11, y: spot.y - 22, w: 22, h: 22, type: "enemy", alive: true });
    }
    if (Math.random() < 0.05 && spot.y < -300) {
      state.powerups.push({ x: spot.x + spot.w / 2 - 8, y: spot.y - 20, w: 16, h: 16, type: "spring" });
    } else if (Math.random() < 0.02 && spot.y < -800) {
      state.powerups.push({ x: spot.x + spot.w / 2 - 10, y: spot.y - 24, w: 20, h: 24, type: "rocket" });
    }
    return p;
  }

  function reset() {
    state.score = 0;
    state.cameraY = 0;
    state.maxHeight = 0;
    state.platforms = [];
    state.obstacles = [];
    state.projectiles = [];
    state.particles = [];
    state.powerups = [];
    state.keys = { left: false, right: false };
    state.lastFrame = performance.now();
    state.spawnAcc = 0;
    state.lastCheckedScore = 0;
    state.deathReason = "";
    lastShotTime = 0;

    var startX = W / 2 - 15;
    var startY = H - LAVA_HEIGHT - 70;
    state.player = { x: startX, y: startY, vx: 0, vy: 0, w: 30, h: 30, facing: 1, animT: 0, prevY: startY };

    state.platforms.push({ x: W / 2 - 50, y: H - LAVA_HEIGHT - 40, w: 100, h: 12, type: "static", dir: 1, speed: 0, baseX: W / 2 - 50 });

    var lastX = W / 2 - 50;
    var lastY = H - LAVA_HEIGHT - 40;
    for (var i = 0; i < 25; i++) {
      var pl = spawnPlatformAbove(lastX, lastY);
      lastX = pl.x + pl.w / 2;
      lastY = pl.y;
    }
    updateHUD();
  }

  function updateHUD() {
    scoreH.val.textContent = state.score.toLocaleString();
    var h = Math.max(0, Math.floor(state.maxHeight / 10));
    heightH.val.textContent = h + " м";
    bestH.val.textContent = state.best.toLocaleString();
  }

  function onKeyDown(e) {
    if (!state.running) return;
    var code = e.code || "";
    if (code === "ArrowLeft" || code === "KeyA") { state.keys.left = true; e.preventDefault(); }
    else if (code === "ArrowRight" || code === "KeyD") { state.keys.right = true; e.preventDefault(); }
    else if (code === "ArrowUp" || code === "KeyW" || code === "Space") {
      e.preventDefault();
      if (e.repeat) return;
      fireProjectile();
    }
  }
  function onKeyUp(e) {
    var code = e.code || "";
    if (code === "ArrowLeft" || code === "KeyA") state.keys.left = false;
    else if (code === "ArrowRight" || code === "KeyD") state.keys.right = false;
  }

  function fireProjectile() {
    var now = performance.now();
    if (now - lastShotTime < SHOT_COOLDOWN) return;
    lastShotTime = now;
    state.projectiles.push({
      x: state.player.x + state.player.w / 2,
      y: state.player.y,
      vy: -12, animT: 0
    });
    _snd("hit");
  }

  function checkPlatformCollision(p) {
    if (p.vy <= 0) return null;
    var prevBottom = p.prevY + p.h;
    var currBottom = p.y + p.h;
    for (var i = 0; i < state.platforms.length; i++) {
      var pl = state.platforms[i];
      var plTop = pl.y;
      if (prevBottom <= plTop + 1 && currBottom >= plTop) {
        if (p.x + p.w > pl.x && p.x < pl.x + pl.w) return pl;
      }
    }
    return null;
  }

  function loop(ts) {
    if (!state.running) return;
    var dt = Math.min((ts - state.lastFrame) / 16.67, 1.5);
    if (dt < 0) dt = 0;
    state.lastFrame = ts;

    var p = state.player;
    p.animT += dt;
    p.prevY = p.y;

    var accel = 0.7;
    if (state.keys.left) p.vx -= accel;
    if (state.keys.right) p.vx += accel;
    p.vx *= 0.82;
    if (Math.abs(p.vx) < 0.05) p.vx = 0;
    if (p.vx > 0.1) p.facing = 1;
    else if (p.vx < -0.1) p.facing = -1;
    p.x += p.vx * dt;
    if (p.x < -p.w) p.x = W;
    if (p.x > W) p.x = -p.w;

    p.vy += GRAVITY * dt;
    if (p.vy > MAX_VY) p.vy = MAX_VY;
    p.y += p.vy * dt;

    for (var i = 0; i < state.platforms.length; i++) {
      var pl = state.platforms[i];
      if (pl.type === "moving") {
        pl.x += pl.dir * pl.speed * dt;
        if (pl.x < 5) { pl.x = 5; pl.dir = 1; }
        if (pl.x + pl.w > W - 5) { pl.x = W - 5 - pl.w; pl.dir = -1; }
      }
    }

    var hitPlatform = checkPlatformCollision(p);
    if (hitPlatform) {
      p.y = hitPlatform.y - p.h;
      if (hitPlatform.type === "fragile") {
        var idx = state.platforms.indexOf(hitPlatform);
        if (idx >= 0) state.platforms.splice(idx, 1);
        for (var k = 0; k < 8; k++) {
          state.particles.push({
            x: hitPlatform.x + Math.random() * hitPlatform.w,
            y: hitPlatform.y + Math.random() * hitPlatform.h,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 22, color: "#9a4a78"
          });
        }
      } else if (hitPlatform.type === "bouncy") {
        p.vy = JUMP_POWER * 1.7;
        _snd("hit");
      } else {
        p.vy = JUMP_POWER;
      }
    }

    for (var j = state.powerups.length - 1; j >= 0; j--) {
      var pu = state.powerups[j];
      if (p.x + p.w > pu.x && p.x < pu.x + pu.w && p.y + p.h > pu.y && p.y < pu.y + pu.h) {
        if (pu.type === "spring") { p.vy = -22; }
        else if (pu.type === "rocket") { p.vy = -30; }
        state.powerups.splice(j, 1);
        _snd("hit");
      }
    }

    for (var oi = state.obstacles.length - 1; oi >= 0; oi--) {
      var ob = state.obstacles[oi];
      if (!ob.alive) continue;
      if (p.x + p.w > ob.x + 3 && p.x < ob.x + ob.w - 3 && p.y + p.h > ob.y + 3 && p.y < ob.y + ob.h - 3) {
        if (ob.type === "spike") { die("spike"); return; }
        else {
          p.vy = -9;
          p.vx = (p.x < ob.x ? -3.5 : 3.5);
          state.particles.push({ x: ob.x + ob.w / 2, y: ob.y + ob.h / 2, vx: 0, vy: 0, life: 15, color: "#eab308" });
          _snd("hit");
        }
      }
    }

    for (var pi = state.projectiles.length - 1; pi >= 0; pi--) {
      var pr = state.projectiles[pi];
      pr.y -= 12 * dt;
      if (pr.y < state.cameraY - 40 || pr.y > state.cameraY + H + 40) {
        state.projectiles.splice(pi, 1);
        continue;
      }
      for (var oi2 = state.obstacles.length - 1; oi2 >= 0; oi2--) {
        var ob2 = state.obstacles[oi2];
        if (!ob2.alive) continue;
        if (pr.x > ob2.x && pr.x < ob2.x + ob2.w && pr.y > ob2.y && pr.y < ob2.y + ob2.h) {
          ob2.alive = false;
          state.obstacles.splice(oi2, 1);
          state.projectiles.splice(pi, 1);
          _snd("hit");
          break;
        }
      }
    }

    var targetCam = p.y - H * 0.55;
    if (targetCam < state.cameraY) {
      var diff = state.cameraY - targetCam;
      state.cameraY -= diff * 0.08 * dt;
      if (state.maxHeight < state.cameraY * -1) state.maxHeight = state.cameraY * -1;
      state.score = Math.floor(state.maxHeight);
    }

    var lavaTopWorld = state.cameraY + H - LAVA_HEIGHT;
    if (p.y + p.h >= lavaTopWorld) {
      die("lava");
      return;
    }

    if (state.score > state.lastCheckedScore + 500) {
      state.lastCheckedScore = state.score;
      if (typeof Achievements !== "undefined") Achievements.check();
    }

    state.spawnAcc += dt;
    if (state.spawnAcc > 40) {
      state.spawnAcc = 0;
      var topPlatform = null;
      for (var tp = 0; tp < state.platforms.length; tp++) {
        if (!topPlatform || state.platforms[tp].y < topPlatform.y) topPlatform = state.platforms[tp];
      }
      if (topPlatform) spawnPlatformAbove(topPlatform.x + topPlatform.w / 2, topPlatform.y);
    }

    for (var di = state.platforms.length - 1; di >= 0; di--) {
      if (state.platforms[di].y > state.cameraY + H + 100) state.platforms.splice(di, 1);
    }
    for (var di2 = state.obstacles.length - 1; di2 >= 0; di2--) {
      if (state.obstacles[di2].y > state.cameraY + H + 100) state.obstacles.splice(di2, 1);
    }
    for (var di3 = state.powerups.length - 1; di3 >= 0; di3--) {
      if (state.powerups[di3].y > state.cameraY + H + 100) state.powerups.splice(di3, 1);
    }

    for (var qi = state.particles.length - 1; qi >= 0; qi--) {
      var q = state.particles[qi];
      q.x += q.vx * dt;
      q.y += q.vy * dt;
      q.life -= dt;
      if (q.life <= 0) state.particles.splice(qi, 1);
    }

    draw();
    updateHUD();
    rafId = requestAnimationFrame(loop);
  }

  function drawBackground(ctx) {
    var bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, "#080a10");
    bgGrad.addColorStop(0.6, "#0e1420");
    bgGrad.addColorStop(1, "#1a0f14");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);
    var starOffset = state.cameraY * 0.15;
    for (var i = 0; i < 50; i++) {
      var sx = (i * 137) % W;
      var sy = (i * 89 + starOffset) % (H * 2);
      if (sy < 0) sy += H * 2;
      if (sy > H) continue;
      var brightness = 0.2 + ((i * 31) % 100) / 300;
      ctx.fillStyle = "rgba(200,220,255," + brightness.toFixed(2) + ")";
      var size = i % 7 === 0 ? 2 : 1;
      ctx.fillRect(sx, sy, size, size);
    }
  }

  function drawLava(ctx) {
    var screenY = H - LAVA_HEIGHT;
    var grad = ctx.createLinearGradient(0, screenY - 40, 0, screenY);
    grad.addColorStop(0, "rgba(220,38,38,0)");
    grad.addColorStop(1, "rgba(220,38,38,0.6)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, screenY - 40, W, 40);
    var lavaGrad = ctx.createLinearGradient(0, screenY, 0, H);
    lavaGrad.addColorStop(0, "#f97316");
    lavaGrad.addColorStop(0.3, "#dc2626");
    lavaGrad.addColorStop(1, "#7f1d1d");
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, screenY, W, LAVA_HEIGHT);
    var t = performance.now() / 250;
    for (var x = 0; x < W; x += 10) {
      var waveH = 3 + Math.sin(t + x * 0.08) * 3;
      ctx.fillStyle = "#fbbf24";
      ctx.fillRect(x, screenY - waveH, 10, waveH);
    }
    for (var b = 0; b < 8; b++) {
      var bx = (b * 53 + performance.now() / 50) % W;
      var by = screenY + 5 + (b * 3) % (LAVA_HEIGHT - 10);
      ctx.fillStyle = "rgba(251,191,36,0.6)";
      ctx.beginPath();
      ctx.arc(bx, by, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawPlatform(ctx, pl) {
    var sy = pl.y - state.cameraY;
    if (sy < -30 || sy > H + 30) return;
    var colors = {
      static: { base: "#3a4256", top: "#6b7593", shadow: "#1a1f2e" },
      moving: { base: "#2a5a52", top: "#4a9a8a", shadow: "#15302c" },
      fragile: { base: "#5a2a4a", top: "#9a4a78", shadow: "#2d1524" },
      bouncy: { base: "#5a4a2a", top: "#c8a84a", shadow: "#2d2515" }
    };
    var c = colors[pl.type] || colors.static;
    ctx.fillStyle = c.shadow;
    ctx.fillRect(pl.x + 3, sy + pl.h, pl.w - 6, 4);
    ctx.fillStyle = c.base;
    ctx.fillRect(pl.x, sy, pl.w, pl.h);
    ctx.fillStyle = c.top;
    ctx.fillRect(pl.x, sy, pl.w, 4);
    ctx.strokeStyle = "rgba(255,255,255,0.15)";
    ctx.lineWidth = 1;
    ctx.strokeRect(pl.x + 0.5, sy + 0.5, pl.w - 1, pl.h - 1);
    if (pl.type === "moving") {
      var offset = (performance.now() / 25) % 14;
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      for (var x = pl.x + offset; x < pl.x + pl.w; x += 14) {
        if (x < pl.x + 3) continue;
        ctx.fillRect(x, sy + 7, 5, 2);
      }
    } else if (pl.type === "fragile") {
      ctx.strokeStyle = "rgba(255,200,220,0.5)";
      ctx.lineWidth = 1;
      var cracks = [0.2, 0.45, 0.7, 0.9];
      for (var s = 0; s < cracks.length; s++) {
        var cx = pl.x + pl.w * cracks[s];
        ctx.beginPath();
        ctx.moveTo(cx, sy + 4);
        ctx.lineTo(cx + 2, sy + 7);
        ctx.lineTo(cx - 2, sy + 10);
        ctx.stroke();
      }
    } else if (pl.type === "bouncy") {
      ctx.strokeStyle = "rgba(255,220,120,0.9)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pl.x + pl.w / 2 - 8, sy + pl.h - 3);
      ctx.lineTo(pl.x + pl.w / 2, sy + 5);
      ctx.lineTo(pl.x + pl.w / 2 + 8, sy + pl.h - 3);
      ctx.stroke();
    }
  }

  function drawObstacle(ctx, ob) {
    var sy = ob.y - state.cameraY;
    if (sy < -30 || sy > H + 30) return;
    if (ob.type === "spike") {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.moveTo(ob.x + 2, sy + ob.h + 1);
      ctx.lineTo(ob.x + ob.w / 2 + 2, sy + 2);
      ctx.lineTo(ob.x + ob.w + 2, sy + ob.h + 1);
      ctx.closePath();
      ctx.fill();
      var g = ctx.createLinearGradient(ob.x, sy, ob.x, sy + ob.h);
      g.addColorStop(0, "#fef9c3");
      g.addColorStop(0.35, "#f97316");
      g.addColorStop(1, "#7f1d1d");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(ob.x, sy + ob.h);
      ctx.lineTo(ob.x + ob.w / 2, sy);
      ctx.lineTo(ob.x + ob.w, sy + ob.h);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#450a0a";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.beginPath();
      ctx.moveTo(ob.x + ob.w / 2, sy + 2);
      ctx.lineTo(ob.x + ob.w / 2 - 2, sy + 8);
      ctx.lineTo(ob.x + ob.w / 2 - 1, sy + 8);
      ctx.closePath();
      ctx.fill();
    } else {
      var cx = ob.x + ob.w / 2, cy = sy + ob.h / 2;
      var r = ob.w / 2;
      ctx.fillStyle = "rgba(0,0,0,0.4)";
      ctx.beginPath();
      ctx.arc(cx + 2, cy + 2, r, 0, Math.PI * 2);
      ctx.fill();
      var g2 = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.2, cx, cy, r);
      g2.addColorStop(0, "#fef08a");
      g2.addColorStop(0.5, "#eab308");
      g2.addColorStop(1, "#854d0e");
      ctx.fillStyle = g2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 1.3;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(cx - r * 0.35, cy - r * 0.15, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.35, cy - r * 0.15, r * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0a0a0a";
      ctx.beginPath();
      ctx.arc(cx - r * 0.35, cy - r * 0.15, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx + r * 0.35, cy - r * 0.15, r * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#451a03";
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.arc(cx, cy + r * 0.15, r * 0.5, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
      ctx.fillStyle = "#fafafa";
      ctx.fillRect(cx - r * 0.3, cy + r * 0.35, 2, 3);
      ctx.fillRect(cx - r * 0.1, cy + r * 0.42, 2, 3);
      ctx.fillRect(cx + r * 0.1, cy + r * 0.42, 2, 3);
      ctx.fillRect(cx + r * 0.3, cy + r * 0.35, 2, 3);
    }
  }

  function drawPowerup(ctx, pu) {
    var sy = pu.y - state.cameraY;
    if (sy < -30 || sy > H + 30) return;
    var cx = pu.x + pu.w / 2, cy = sy + pu.h / 2;
    var t = performance.now() / 200;
    var pulse = 1 + Math.sin(t) * 0.15;
    var r = (pu.w / 2) * pulse;
    if (pu.type === "rocket") {
      ctx.fillStyle = "rgba(239,68,68,0.35)";
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
      ctx.fill();
      var rg = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.2, cx, cy, r);
      rg.addColorStop(0, "#fca5a5");
      rg.addColorStop(0.6, "#ef4444");
      rg.addColorStop(1, "#991b1b");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#7f1d1d";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🚀", cx, cy + 1);
    } else {
      ctx.fillStyle = "rgba(34,197,94,0.35)";
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.6, 0, Math.PI * 2);
      ctx.fill();
      var gg = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.2, cx, cy, r);
      gg.addColorStop(0, "#86efac");
      gg.addColorStop(0.6, "#22c55e");
      gg.addColorStop(1, "#14532d");
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#14532d";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("⚡", cx, cy + 1);
    }
  }

  function drawProjectile(ctx, pr) {
    var sy = pr.y - state.cameraY;
    if (sy < -40 || sy > H + 40) return;
    ctx.fillStyle = "rgba(196,181,253,0.35)";
    ctx.fillRect(pr.x - 1, sy + 8, 2, 12);
    ctx.fillStyle = "#c4b5fd";
    ctx.fillRect(pr.x - 1.5, sy, 3, 14);
    ctx.fillStyle = "#e9d5ff";
    ctx.beginPath();
    ctx.moveTo(pr.x - 4, sy + 2);
    ctx.lineTo(pr.x + 4, sy + 2);
    ctx.lineTo(pr.x, sy - 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 0.8;
    ctx.stroke();
    ctx.fillStyle = "#a855f7";
    ctx.beginPath();
    ctx.moveTo(pr.x - 3, sy + 10);
    ctx.lineTo(pr.x - 4, sy + 16);
    ctx.lineTo(pr.x, sy + 14);
    ctx.lineTo(pr.x + 4, sy + 16);
    ctx.lineTo(pr.x + 3, sy + 10);
    ctx.closePath();
    ctx.fill();
  }

  function drawSlark(ctx, cx, cy, w, h, facing, animT, vy) {
    var sway = Math.sin(animT * 0.15) * 1.2;
    var squash = 1 + Math.max(-0.15, Math.min(0.15, -vy * 0.012));
    var rw = w / 2;
    var rh = h / 2;
    ctx.save();
    ctx.translate(cx, cy + sway);
    ctx.scale(2 - squash, squash);
    var tailDir = facing === 1 ? -1 : 1;

    ctx.fillStyle = "#0e5a8a";
    ctx.beginPath();
    ctx.moveTo(tailDir * rw * 0.85, 0);
    ctx.quadraticCurveTo(tailDir * rw * 1.9, -rh * 0.5 + Math.sin(animT * 0.2) * 2, tailDir * rw * 1.7, -rh * 1.3);
    ctx.quadraticCurveTo(tailDir * rw * 1.2, -rh * 0.8, tailDir * rw * 0.7, -rh * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(tailDir * rw * 0.85, 0);
    ctx.quadraticCurveTo(tailDir * rw * 1.9, rh * 0.5 + Math.sin(animT * 0.2) * 2, tailDir * rw * 1.7, rh * 1.3);
    ctx.quadraticCurveTo(tailDir * rw * 1.2, rh * 0.8, tailDir * rw * 0.7, rh * 0.3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#0e5a8a";
    ctx.beginPath();
    ctx.moveTo(-rw * 0.5, rh * 0.7);
    ctx.lineTo(-rw * 0.75, rh * 1.25);
    ctx.lineTo(-rw * 0.1, rh * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(rw * 0.5, rh * 0.7);
    ctx.lineTo(rw * 0.75, rh * 1.25);
    ctx.lineTo(rw * 0.1, rh * 0.9);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#0e5a8a";
    ctx.beginPath();
    ctx.moveTo(-rw * 0.35, -rh * 0.9);
    ctx.lineTo(0, -rh * 1.6);
    ctx.lineTo(rw * 0.4, -rh * 0.9);
    ctx.quadraticCurveTo(0, -rh * 0.75, -rw * 0.35, -rh * 0.9);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#082f49";
    ctx.lineWidth = 1;
    ctx.stroke();

    var bodyGrad = ctx.createRadialGradient(-rw * 0.35, -rh * 0.35, 2, 0, 0, rw * 1.2);
    bodyGrad.addColorStop(0, "#93e0ff");
    bodyGrad.addColorStop(0.5, "#38bdf8");
    bodyGrad.addColorStop(1, "#0369a1");
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.moveTo(0, -rh * 1.05);
    ctx.bezierCurveTo(rw * 0.9, -rh * 0.9, rw * 1.0, rh * 0.6, 0, rh * 1.0);
    ctx.bezierCurveTo(-rw * 1.0, rh * 0.6, -rw * 0.9, -rh * 0.9, 0, -rh * 1.05);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#082f49";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    var eyeOff = facing * rw * 0.28;
    var eyeY = -rh * 0.2;
    var eyeR = rw * 0.3;
    ctx.fillStyle = "#fef9c3";
    ctx.beginPath();
    ctx.arc(-rw * 0.35 + eyeOff, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rw * 0.35 + eyeOff, eyeY, eyeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#082f49";
    ctx.lineWidth = 1;
    ctx.stroke();

    var pupilOff = facing * rw * 0.08;
    ctx.fillStyle = "#082f49";
    ctx.beginPath();
    ctx.arc(-rw * 0.35 + eyeOff + pupilOff, eyeY, eyeR * 0.55, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rw * 0.35 + eyeOff + pupilOff, eyeY, eyeR * 0.55, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.beginPath();
    ctx.arc(-rw * 0.35 + eyeOff + pupilOff - eyeR * 0.2, eyeY - eyeR * 0.25, eyeR * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(rw * 0.35 + eyeOff + pupilOff - eyeR * 0.2, eyeY - eyeR * 0.25, eyeR * 0.22, 0, Math.PI * 2);
    ctx.fill();

    var mouthY = rh * 0.5;
    ctx.fillStyle = "#082f49";
    ctx.beginPath();
    ctx.moveTo(-rw * 0.45, mouthY);
    ctx.quadraticCurveTo(0, mouthY + rh * 0.5, rw * 0.45, mouthY);
    ctx.quadraticCurveTo(0, mouthY + rh * 0.25, -rw * 0.45, mouthY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#f8fafc";
    ctx.beginPath();
    ctx.moveTo(-rw * 0.3, mouthY + rh * 0.08);
    ctx.lineTo(-rw * 0.18, mouthY + rh * 0.33);
    ctx.lineTo(-rw * 0.06, mouthY + rh * 0.08);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(rw * 0.06, mouthY + rh * 0.08);
    ctx.lineTo(rw * 0.18, mouthY + rh * 0.33);
    ctx.lineTo(rw * 0.3, mouthY + rh * 0.08);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  function draw() {
    var ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, W, H);
    drawBackground(ctx);
    for (var i = 0; i < state.platforms.length; i++) drawPlatform(ctx, state.platforms[i]);
    for (var j = 0; j < state.powerups.length; j++) drawPowerup(ctx, state.powerups[j]);
    for (var k = 0; k < state.obstacles.length; k++) drawObstacle(ctx, state.obstacles[k]);
    for (var l = 0; l < state.projectiles.length; l++) drawProjectile(ctx, state.projectiles[l]);

    for (var q = 0; q < state.particles.length; q++) {
      var pt = state.particles[q];
      var sy = pt.y - state.cameraY;
      ctx.fillStyle = pt.color;
      ctx.globalAlpha = Math.max(0, pt.life / 22);
      ctx.beginPath();
      ctx.arc(pt.x, sy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    var p = state.player;
    var py = p.y - state.cameraY;
    drawSlark(ctx, p.x + p.w / 2, py + p.h / 2, p.w, p.h, p.facing, p.animT, p.vy);

    drawLava(ctx);

    var progress = Math.min(1, state.maxHeight / 30000);
    ctx.fillStyle = "rgba(139,92,246,0.15)";
    ctx.fillRect(6, 6, 4, H - 12);
    ctx.fillStyle = "#8b5cf6";
    ctx.fillRect(6, 6 + (H - 12) * (1 - progress), 4, (H - 12) * progress);
  }

  function die(reason) {
    state.running = false;
    state.deathReason = reason;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    detachListeners();

    var isRecord = state.score > state.best;
    if (isRecord) {
      state.best = state.score;
      Store.set("direjumperbest", state.score);
    }
    if (typeof window.submitGameScore === "function") {
      try { window.submitGameScore("direjumper", state.score); } catch (e) {}
    }
    if (isRecord) _snd("win"); else _snd("fail");
    if (typeof Achievements !== "undefined") Achievements.check();

    var overlay = el("div", { style: "position:absolute;inset:0;background:rgba(2,3,8,0.93);display:flex;flex-direction:column;align-items:center;justify-content:center;border-radius:16px;padding:20px;text-align:center;z-index:20;" });
    var emoji = isRecord ? "🏆" : (reason === "lava" ? "🔥" : "💀");
    var title;
    if (isRecord) title = "Новый рекорд!";
    else if (reason === "lava") title = "Сларк сгорел в лаве";
    else if (reason === "spike") title = "Сларк напоролся на шип";
    else title = "Сларк упал";

    overlay.appendChild(el("div", { style: "font-size:56px;margin-bottom:8px;" }, emoji));
    overlay.appendChild(el("div", { style: "font-size:16px;font-weight:700;color:var(--text);margin-bottom:4px;" }, title));
    overlay.appendChild(el("div", { style: "font-size:36px;font-weight:900;font-family:'JetBrains Mono',monospace;color:var(--gold);margin:14px 0 6px;" }, state.score.toLocaleString()));
    overlay.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:20px;" }, "Высота: " + Math.floor(state.maxHeight / 10) + " м · Рекорд: " + state.best.toLocaleString()));

    var btnRow = el("div", { style: "display:flex;gap:8px;" });
    var retryBtn = UI.btn("🔄 Ещё раз");
    retryBtn.addEventListener("click", function () { overlay.remove(); start(); });
    btnRow.appendChild(retryBtn);
    var menuBtn2 = UI.btn("← В меню", { variant: "ghost" });
    menuBtn2.addEventListener("click", function () { overlay.remove(); showIntro("direjumper"); });
    btnRow.appendChild(menuBtn2);
    overlay.appendChild(btnRow);
    canvasWrap.appendChild(overlay);
  }

  function start() {
    var oldOverlay = canvasWrap.querySelector("div[style*='position:absolute'][style*='inset:0']");
    if (oldOverlay) oldOverlay.remove();

    reset();
    state.running = true;
    attachListeners();
    canvas.focus();

    var games = (Store.get("direjumpergames", 0) || 0) + 1;
    Store.set("direjumpergames", games);
    if (typeof Achievements !== "undefined") Achievements.check();

    state.lastFrame = performance.now();
    rafId = requestAnimationFrame(loop);
  }

  setTimeout(function () { start(); }, 100);
  return card;
}

/* ─── ГЛОБАЛЬНЫЕ СЛУШАТЕЛИ ─── */
if (!window._gamesGlobalListeners) {
  window._gamesGlobalListeners = true;
  window.addEventListener("hashchange", function () {
    var page = (location.hash || "").slice(1) || "dashboard";
    if (page !== "games") stopActiveGames();
  });
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) stopActiveGames();
  });
  window.addEventListener("popstate", function () {
    var page = (location.hash || "").slice(1) || "dashboard";
    if (page !== "games") stopActiveGames();
  });
}

console.log("games v10.0 ready (Dire Jumper fixed: swept collision, smart spawn, static spikes, lava)");
