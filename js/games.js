/* DOTA JETCH — МИНИ-ИГРЫ */

const QUIZ_QUESTIONS = [
  { q: "Какая способность у Juggernaut даёт неуязвимость во время атаки?", a: "Omnislash", opts: ["Omnislash", "Blade Fury", "Blade Dance", "Healing Ward"] },
  { q: "Сколько стоит Black King Bar?", a: "4050", opts: ["3900", "4050", "4200", "5000"] },
  { q: "Какая роль у Crystal Maiden обычно?", a: "Позиция 5 (хард сапорт)", opts: ["Позиция 1", "Позиция 2", "Позиция 4", "Позиция 5 (хард сапорт)"] },
  { q: "Какой предмет даёт иммунитет к магии?", a: "Black King Bar", opts: ["Linken's Sphere", "Black King Bar", "Lotus Orb", "Eul's"] },
  { q: "Какой герой имеет способность Blink на 3 заряда?", a: "Anti-Mage", opts: ["Anti-Mage", "Queen of Pain", "Faceless Void", "Storm Spirit"] },
  { q: "Какой предмет снимает сайленс?", a: "Eul's Scepter", opts: ["Manta Style", "Eul's Scepter", "Force Staff", "Glimmer Cape"] },
  { q: "Что делает Rune of Wisdom?", a: "Даёт опыт", opts: ["Даёт золото", "Даёт опыт", "Даёт ману", "Даёт HP"] },
  { q: "Кто из героев может стать невидимым в своей ульте?", a: "Slark", opts: ["Riki", "Slark", "Bounty Hunter", "Clinkz"] },
  { q: "Сколько секунд длится стан от Scythe of Vyse?", a: "3.5 сек", opts: ["2 сек", "3 сек", "3.5 сек", "5 сек"] },
  { q: "Какой герой НЕ может быть саппортом 5?", a: "Medusa", opts: ["Crystal Maiden", "Warlock", "Medusa", "Lion"] },
  { q: "Что даёт Aegis of the Immortal?", a: "Возрождение после смерти", opts: ["+HP", "+ману", "Возрождение после смерти", "+урон"] },
  { q: "Когда респавнится Roshan (примерно)?", a: "8-11 минут", opts: ["5 минут", "8-11 минут", "12 минут", "15 минут"] },
  { q: "Какой предмет даёт +45 Strength?", a: "Heart of Tarrasque", opts: ["Sange", "Reaver", "Heart of Tarrasque", "Satanic"] },
  { q: "Какая способность Invoker наносит глобальный урон?", a: "Sunstrike", opts: ["Sunstrike", "Meteor", "Deafening Blast", "Chaos Meteor"] },
  { q: "Что такое Deny?", a: "Убийство своего юнита", opts: ["Убийство врага", "Убийство своего юнита", "Побег", "Возврат"] },
  { q: "Сколько золота даёт Bounty Rune всей команде?", a: "~40 за каждого", opts: ["~40 за каждого", "~100", "~200", "Бесплатно"] },
  { q: "Кто из героев имеет способность Mana Shield?", a: "Medusa", opts: ["Anti-Mage", "Medusa", "Morphling", "Razor"] },
  { q: "Какой герой может скопировать ульту врага?", a: "Rubick", opts: ["Rubick", "Morphling", "Doppelganger", "Puck"] },
  { q: "Что делает Refresher Orb?", a: "Сбрасывает кулдауны", opts: ["Восстанавливает HP", "Сбрасывает кулдауны", "Даёт ману", "Телепорт"] },
  { q: "Сколько секунд длится действие Smoke of Deceit?", a: "35 сек", opts: ["20 сек", "35 сек", "45 сек", "60 сек"] },
  { q: "Какой герой ставит Remote Mine?", a: "Techies", opts: ["Techies", "Tinker", "Clockwerk", "Sniper"] },
  { q: "Что такое Creep Stacking?", a: "Агр крипов для увеличения лагеря", opts: ["Убийство крипов", "Агр крипов для увеличения лагеря", "Пул крипов на линию", "Побег от крипов"] },
  { q: "Какой стат даёт +7 HP за единицу?", a: "Strength", opts: ["Agility", "Intelligence", "Strength", "Универсальный"] },
  { q: "Какая способность Zeus даёт вижен на карте?", a: "Thundergod's Wrath", opts: ["Lightning Bolt", "Thundergod's Wrath", "Arc Lightning", "Static Field"] },
  { q: "Что такое KDA?", a: "Kills / Deaths / Assists", opts: ["Kills / Damage / Armor", "Kills / Deaths / Assists", "Kills / Denies / Assists", "Kills / Damage / Assists"] },
];

function shuffle(a) {
  const arr = a.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

function renderGames() {
  const frag = document.createDocumentFragment();

  const head = UI.heroBanner(
    "Мини-игры",
    "Тренируй реакцию, знания и память",
    [
      UI.btn("Реакция", { onclick: function() { openGame("reaction"); } }),
      UI.btn("Викторина", { onclick: function() { openGame("quiz"); }, variant: "ghost" }),
      UI.btn("Угадай героя", { onclick: function() { openGame("guess"); }, variant: "ghost" }),
    ]
  );
  frag.appendChild(head);

  const stats = el("div", { class: "stat-grid" });
  const rBest = Store.get("reaction_best", 0) || 0;
  const qBest = Store.get("quiz_best", 0) || 0;
  const gBest = Store.get("guess_best_streak", 0) || 0;
  stats.appendChild(UI.statCard("R", "var(--yellow)", "var(--yellow-bg)", "Реакция", rBest ? rBest + " мс" : "-", "лучший"));
  stats.appendChild(UI.statCard("Q", "var(--cyan)", "var(--cyan-bg)", "Викторина", qBest ? qBest + "/10" : "-", "лучший"));
  stats.appendChild(UI.statCard("G", "var(--green)", "var(--green-bg)", "Стрик героев", gBest ? String(gBest) : "-", "макс. подряд"));
  frag.appendChild(stats);

  const info = UI.card("Как играть");
  info.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.7;" },
    "Реакция — жди зелёный сигнал, жми как можно быстрее.",
    el("br"),
    "Викторина — 10 вопросов по Dota 2.",
    el("br"),
    "Угадай героя — выбери правильное имя по иконке."
  ));
  frag.appendChild(info);

  const area = el("div", { id: "gameArea" });
  frag.appendChild(area);

  return frag;
}

function openGame(kind) {
  const area = qs("#gameArea");
  if (!area) return;
  area.innerHTML = "";
  if (kind === "reaction") area.appendChild(renderReactionGame());
  else if (kind === "quiz") area.appendChild(renderQuizGame());
  else if (kind === "guess") area.appendChild(renderGuessGame());
  area.scrollIntoView({ behavior: "smooth", block: "start" });
  Store.set("games_played", (Store.get("games_played", 0) || 0) + 1);
  if (typeof Achievements !== "undefined") Achievements.check();
}

function renderReactionGame() {
  const card = UI.card("Тест реакции");
  card.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;" },
    "Кликни по полю, когда оно станет зелёным."));

  const pad = el("div", {
    style: "height:240px;border-radius:14px;background:var(--red);display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none;transition:background 0.15s ease;"
  });
  const label = el("div", { style: "color:white;font-size:20px;font-weight:bold;text-align:center;padding:20px;" }, "КЛИКНИ, ЧТОБЫ НАЧАТЬ");
  pad.appendChild(label);
  card.appendChild(pad);

  const result = el("div", { style: "text-align:center;padding:16px;font-size:14px;color:var(--text-muted);" }, "-");
  card.appendChild(result);

  let state = "idle";
  let goTs = 0;
  let timer = null;

  pad.addEventListener("click", function() {
    if (state === "idle" || state === "done") {
      state = "waiting";
      pad.style.background = "var(--orange)";
      label.textContent = "ЖДИ ЗЕЛЁНОГО...";
      result.textContent = "-";
      timer = setTimeout(function() {
        state = "go";
        pad.style.background = "var(--green)";
        label.textContent = "ЖМИ!";
        goTs = performance.now();
      }, 1000 + Math.random() * 2500);
    } else if (state === "waiting") {
      clearTimeout(timer);
      state = "idle";
      pad.style.background = "var(--red)";
      label.textContent = "ФАЛЬСТАРТ! Кликни заново";
      result.textContent = "Слишком рано...";
    } else if (state === "go") {
      const dt = Math.round(performance.now() - goTs);
      state = "done";
      pad.style.background = "var(--accent)";
      label.textContent = dt + " мс";
      const best = Store.get("reaction_best", 0) || 0;
      const isBest = !best || dt < best;
      if (isBest) Store.set("reaction_best", dt);
      result.textContent = isBest
        ? "Новый рекорд! Кликни, чтобы попробовать ещё."
        : "Твой результат: " + dt + " мс. Лучший: " + best + " мс.";
      if (typeof Achievements !== "undefined") Achievements.check();
    }
  });

  return card;
}

function renderQuizGame() {
  const card = UI.card("Викторина");
  const bank = shuffle(QUIZ_QUESTIONS).slice(0, 10);
  let idx = 0;
  let score = 0;

  const content = el("div");
  card.appendChild(content);

  function showQuestion() {
    content.innerHTML = "";
    if (idx >= bank.length) {
      content.appendChild(el("div", { style: "text-align:center;padding:20px;" },
        el("div", { style: "font-size:42px;" }, score >= 8 ? "WIN" : score >= 5 ? "OK" : "MEH"),
        el("div", { style: "font-size:22px;font-weight:bold;margin-top:8px;color:var(--text);" }, score + " / " + bank.length),
        el("div", { class: "dim", style: "font-size:12px;margin-top:6px;" }, score >= 8 ? "Отличный результат!" : score >= 5 ? "Неплохо, но можно лучше." : "Стоит повторить матчасть.")
      ));
      const best = Store.get("quiz_best", 0) || 0;
      if (score > best) Store.set("quiz_best", score);
      if (typeof Achievements !== "undefined") Achievements.check();
      const again = UI.btn("Ещё раз");
      again.addEventListener("click", function() {
        const area = qs("#gameArea");
        area.innerHTML = "";
        area.appendChild(renderQuizGame());
      });
      content.appendChild(el("div", { style: "text-align:center;" }, again));
      return;
    }
    const q = bank[idx];
    content.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "Вопрос " + (idx + 1) + " / " + bank.length + " · Счёт: " + score));
    const bar = el("div", { style: "height:6px;background:var(--bg-elev);border-radius:3px;overflow:hidden;margin:8px 0 14px;" });
    bar.appendChild(el("div", { style: "height:100%;width:" + (idx / bank.length * 100) + "%;background:var(--accent);" }));
    content.appendChild(bar);
    content.appendChild(el("div", { style: "font-size:14px;font-weight:bold;margin-bottom:14px;color:var(--text);" }, q.q));

    const opts = shuffle(q.opts);
    for (const o of opts) {
      const b = el("button", {
        style: "display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;cursor:pointer;font-family:inherit;"
      }, o);
      b.addEventListener("click", function() {
        const correct = o === q.a;
        b.style.background = correct ? "var(--green-bg)" : "var(--red-bg)";
        b.style.borderColor = correct ? "var(--green)" : "var(--red)";
        b.style.color = correct ? "var(--green)" : "var(--red)";
        if (correct) score++;
        const allBtns = content.querySelectorAll("button");
        for (let i = 0; i < allBtns.length; i++) allBtns[i].disabled = true;
        setTimeout(function() { idx++; showQuestion(); }, 700);
      });
      content.appendChild(b);
    }
  }

  showQuestion();
  return card;
}

async function renderGuessGame() {
  const card = UI.card("Угадай героя");
  card.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;" },
    "Выбери правильное имя для показанной иконки."));

  const content = el("div", { style: "text-align:center;" });
  content.appendChild(el("div", { class: "dim", style: "padding:20px;" }, "Загружаю героев..."));
  card.appendChild(content);

  let streak = 0;
  let best = Store.get("guess_best_streak", 0) || 0;
  let heroes = [];

  try {
    heroes = await getHeroes();
  } catch (e) {
    content.innerHTML = "";
    content.appendChild(el("div", { class: "dim", style: "padding:20px;color:var(--red);" }, "Не удалось загрузить героев: " + (e.message || e)));
    return card;
  }
  if (!heroes.length) {
    content.innerHTML = "";
    content.appendChild(el("div", { class: "dim", style: "padding:20px;color:var(--red);" }, "OpenDota не отдал список героев."));
    return card;
  }

  function nextRound() {
    content.innerHTML = "";
    content.appendChild(el("div", { class: "dim", style: "font-size:11px;" },
      "Стрик: " + streak + " · Лучший: " + best));

    const target = heroes[Math.floor(Math.random() * heroes.length)];
    const opts = [target];
    while (opts.length < 4) {
      const h = heroes[Math.floor(Math.random() * heroes.length)];
      let dup = false;
      for (const o of opts) if (o.id === h.id) dup = true;
      if (!dup) opts.push(h);
    }
    const shuffledOpts = shuffle(opts);

    const img = el("img", {
      src: target.img,
      style: "width:220px;height:124px;border-radius:12px;border:1px solid var(--border-hl);margin:14px auto;display:block;"
    });
    content.appendChild(img);

    for (const h of shuffledOpts) {
      const b = el("button", {
        style: "display:block;width:100%;text-align:left;padding:12px 14px;margin-bottom:8px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:13px;cursor:pointer;font-family:inherit;"
      }, h.name);
      b.addEventListener("click", function() {
        const correct = h.id === target.id;
        b.style.background = correct ? "var(--green-bg)" : "var(--red-bg)";
        b.style.borderColor = correct ? "var(--green)" : "var(--red)";
        b.style.color = correct ? "var(--green)" : "var(--red)";
        const allBtns = content.querySelectorAll("button");
        for (let i = 0; i < allBtns.length; i++) allBtns[i].disabled = true;
        if (correct) {
          streak++;
          if (streak > best) { best = streak; Store.set("guess_best_streak", best); }
        } else {
          streak = 0;
        }
        if (typeof Achievements !== "undefined") Achievements.check();
        setTimeout(nextRound, 800);
      });
      content.appendChild(b);
    }
  }

  nextRound();
  return card;
}
