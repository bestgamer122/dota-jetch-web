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

function shuffle(a) {
  var arr = a.slice();
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function renderGames() {
  var frag = document.createDocumentFragment();
  frag.appendChild(UI.heroBanner("Мини-игры", "Реакция, викторина, угадай героя", [
    UI.btn("Реакция", { onclick: function () { openGame("reaction"); } }),
    UI.btn("Викторина", { onclick: function () { openGame("quiz"); }, variant: "ghost" }),
    UI.btn("Угадай", { onclick: function () { openGame("guess"); }, variant: "ghost" })
  ]));
  var stats = el("div", { class: "stat-grid" });
  var r = Store.get("reactionbest", 0) || 0;
  var q = Store.get("quizbest", 0) || 0;
  var g = Store.get("guessbeststreak", 0) || 0;
  stats.appendChild(UI.statCard("R", "var(--yellow)", "var(--yellow-bg)", "Реакция", r ? r + " мс" : "-", "лучший"));
  stats.appendChild(UI.statCard("Q", "var(--cyan)", "var(--cyan-bg)", "Викторина", q ? q + "/10" : "-", "лучший"));
  stats.appendChild(UI.statCard("G", "var(--green)", "var(--green-bg)", "Стрик", g ? String(g) : "-", "макс"));
  frag.appendChild(stats);
  var area = el("div", { id: "gameArea" });
  frag.appendChild(area);
  return frag;
}

async function openGame(kind) {
  var area = qs("#gameArea");
  if (!area) return;
  area.innerHTML = "";
  try {
    if (kind === "reaction") area.appendChild(renderReaction());
    else if (kind === "quiz") area.appendChild(renderQuiz());
    else if (kind === "guess") {
      var load = UI.card("Угадай");
      load.appendChild(el("div", { class: "dim", style: "text-align:center;padding:20px;" }, "Загружаю..."));
      area.appendChild(load);
      var g = await renderGuess();
      area.innerHTML = "";
      area.appendChild(g);
    }
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

function renderReaction() {
  var card = UI.card("Тест реакции");
  card.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;" }, "Кликни, когда поле зелёное."));
  var pad = el("div", { style: "height:240px;border-radius:14px;background:var(--red);display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;" });
  var label = el("div", { style: "color:white;font-size:20px;font-weight:bold;text-align:center;padding:20px;" }, "КЛИКНИ");
  pad.appendChild(label);
  card.appendChild(pad);
  var result = el("div", { style: "text-align:center;padding:16px;color:var(--text-muted);" }, "-");
  card.appendChild(result);
  var state = "idle", goTs = 0, timer = null;
  pad.addEventListener("click", function () {
    if (state === "idle" || state === "done") {
      state = "waiting";
      pad.style.background = "var(--orange)";
      label.textContent = "ЖДИ...";
      timer = setTimeout(function () {
        state = "go";
        pad.style.background = "var(--green)";
        label.textContent = "ЖМИ!";
        goTs = performance.now();
      }, 1000 + Math.random() * 2500);
    } else if (state === "waiting") {
      clearTimeout(timer);
      state = "idle";
      pad.style.background = "var(--red)";
      label.textContent = "РАНО";
    } else if (state === "go") {
      var dt = Math.round(performance.now() - goTs);
      state = "done";
      pad.style.background = "var(--accent)";
      label.textContent = dt + " мс";
      var best = Store.get("reactionbest", 0) || 0;
      if (!best || dt < best) Store.set("reactionbest", dt);
      result.textContent = "Результат: " + dt + " мс";
      if (typeof Achievements !== "undefined") Achievements.check();
    }
  });
  return card;
}

function renderQuiz() {
  var card = UI.card("Викторина");
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
      if (typeof Achievements !== "undefined") Achievements.check();
      return;
    }
    var q = bank[idx];
    content.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "Вопрос " + (idx + 1) + "/" + bank.length + " Счёт: " + score));
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

async function renderGuess() {
  var card = UI.card("Угадай героя");
  var content = el("div", { style: "text-align:center;" });
  card.appendChild(content);
  var heroes = await getHeroes();
  var streak = 0, best = Store.get("guessbeststreak", 0) || 0;
  function next() {
    content.innerHTML = "";
    content.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "Стрик: " + streak + " Лучший: " + best));
    var target = heroes[Math.floor(Math.random() * heroes.length)];
    var opts = [target];
    var tries = 0;
    while (opts.length < 4 && tries < 50) {
      tries++;
      var h = heroes[Math.floor(Math.random() * heroes.length)];
      var dup = false;
      for (var i = 0; i < opts.length; i++) if (opts[i].id === h.id) dup = true;
      if (!dup) opts.push(h);
    }
    opts = shuffle(opts);
    var iw = el("div", { style: "margin:14px auto;max-width:300px;" });
    iw.appendChild(heroImgEl(target, 200));
    content.appendChild(iw);
    for (var j = 0; j < opts.length; j++) {
      (function (h) {
        var b = el("button", { style: "display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;color:var(--text);cursor:pointer;font-family:inherit;" }, h.name);
        b.addEventListener("click", function () {
          var ok = h.id === target.id;
          b.style.background = ok ? "var(--green-bg)" : "var(--red-bg)";
          if (ok) { streak++; if (streak > best) { best = streak; Store.set("guessbeststreak", best); } }
          else streak = 0;
          if (typeof Achievements !== "undefined") Achievements.check();
          var all = content.querySelectorAll("button");
          for (var k = 0; k < all.length; k++) all[k].disabled = true;
          setTimeout(next, 800);
        });
        content.appendChild(b);
      })(opts[j]);
    }
  }
  next();
  return card;
}
