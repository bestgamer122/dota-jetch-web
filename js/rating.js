/* DOTA JETCH — RATING v6.0
   - Уникальные медали (у каждой свой символ)
   - Анимация модалок
   - Курсор поверх окон */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0, bg: "#4a4a4a", accent: "#9ca3af", stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1, bg: "#4a5a5a", accent: "#a5b4c4", stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2, bg: "#6a3a10", accent: "#cd7f32", stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3, bg: "#1e3a6a", accent: "#3b82f6", stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4, bg: "#3a1a5a", accent: "#8b5cf6", stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5, bg: "#0a3a2a", accent: "#10b981", stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",    ru: "Божество",  rankIdx: 6, bg: "#5a4a10", accent: "#fbbf24", stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal",  ru: "Титан",     rankIdx: 7, bg: "#5a0a0a", accent: "#dc2626", stars: [5620, 5800, 6000, 6200, 6500] }
];

var CALIBRATION_GAMES = 10;

/* Уникальные медали — каждая со своим символом */
function buildMedalSVG(rankIdx, size) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 10px " + cfg.accent + "99);";

  var shield = document.createElementNS(ns, "path");
  shield.setAttribute("d", "M50 6 L88 20 L88 52 Q88 78 50 94 Q12 78 12 52 L12 20 Z");
  shield.setAttribute("fill", cfg.bg);
  shield.setAttribute("stroke", cfg.accent);
  shield.setAttribute("stroke-width", "3");
  svg.appendChild(shield);

  var inner = document.createElementNS(ns, "path");
  inner.setAttribute("d", "M50 14 L80 26 L80 52 Q80 72 50 86 Q20 72 20 52 L20 26 Z");
  inner.setAttribute("fill", "rgba(0,0,0,0.35)");
  svg.appendChild(inner);

  var g = document.createElementNS(ns, "g");
  g.setAttribute("fill", cfg.accent);
  g.setAttribute("stroke", cfg.accent);
  g.setAttribute("stroke-width", "1.8");
  g.setAttribute("stroke-linejoin", "round");
  g.setAttribute("stroke-linecap", "round");

  if (rankIdx === 0) {
    /* Recruit: пустой круг */
    var c = document.createElementNS(ns, "circle");
    c.setAttribute("cx", "50"); c.setAttribute("cy", "50"); c.setAttribute("r", "10");
    c.setAttribute("fill", "none");
    c.setAttribute("stroke-width", "2.5");
    g.appendChild(c);
    var dot = document.createElementNS(ns, "circle");
    dot.setAttribute("cx", "50"); dot.setAttribute("cy", "50"); dot.setAttribute("r", "2.5");
    g.appendChild(dot);

  } else if (rankIdx === 1) {
    /* Guardian: крест */
    var p1 = document.createElementNS(ns, "path");
    p1.setAttribute("d", "M50 30 L50 70 M30 50 L70 50");
    p1.setAttribute("stroke-width", "6");
    g.appendChild(p1);

  } else if (rankIdx === 2) {
    /* Crusader: меч */
    var p2 = document.createElementNS(ns, "path");
    p2.setAttribute("d", "M50 26 L54 32 L54 62 L58 64 L58 68 L42 68 L42 64 L46 62 L46 32 Z");
    g.appendChild(p2);

  } else if (rankIdx === 3) {
    /* Archon: два скрещённых меча */
    var p3a = document.createElementNS(ns, "path");
    p3a.setAttribute("d", "M30 30 L70 70");
    p3a.setAttribute("stroke-width", "5");
    g.appendChild(p3a);
    var p3b = document.createElementNS(ns, "path");
    p3b.setAttribute("d", "M70 30 L30 70");
    p3b.setAttribute("stroke-width", "5");
    g.appendChild(p3b);
    var ring = document.createElementNS(ns, "circle");
    ring.setAttribute("cx", "50"); ring.setAttribute("cy", "50"); ring.setAttribute("r", "6");
    ring.setAttribute("fill", cfg.bg);
    ring.setAttribute("stroke-width", "2.5");
    g.appendChild(ring);

  } else if (rankIdx === 4) {
    /* Legend: корона */
    var p4 = document.createElementNS(ns, "path");
    p4.setAttribute("d", "M32 62 L32 40 L42 52 L50 34 L58 52 L68 40 L68 62 Z");
    g.appendChild(p4);
    var base = document.createElementNS(ns, "path");
    base.setAttribute("d", "M32 62 L68 62");
    base.setAttribute("stroke-width", "2.5");
    g.appendChild(base);
    /* Точки на зубцах */
    for (var gi = 0; gi < 3; gi++) {
      var gx = 32 + gi * 18;
      var d = document.createElementNS(ns, "circle");
      d.setAttribute("cx", gx); d.setAttribute("cy", "34"); d.setAttribute("r", "2.5");
      if (gi === 1) { d.setAttribute("cy", "30"); }
      g.appendChild(d);
    }

  } else if (rankIdx === 5) {
    /* Ancient: лавровый венок */
    var w1 = document.createElementNS(ns, "path");
    w1.setAttribute("d", "M42 34 Q30 50 42 68");
    w1.setAttribute("fill", "none");
    w1.setAttribute("stroke-width", "2.5");
    g.appendChild(w1);
    var w2 = document.createElementNS(ns, "path");
    w2.setAttribute("d", "M58 34 Q70 50 58 68");
    w2.setAttribute("fill", "none");
    w2.setAttribute("stroke-width", "2.5");
    g.appendChild(w2);
    /* Листья */
    for (var li = 0; li < 4; li++) {
      var ly = 38 + li * 8;
      var leaf1 = document.createElementNS(ns, "ellipse");
      leaf1.setAttribute("cx", "36"); leaf1.setAttribute("cy", ly);
      leaf1.setAttribute("rx", "3"); leaf1.setAttribute("ry", "1.8");
      g.appendChild(leaf1);
      var leaf2 = document.createElementNS(ns, "ellipse");
      leaf2.setAttribute("cx", "64"); leaf2.setAttribute("cy", ly);
      leaf2.setAttribute("rx", "3"); leaf2.setAttribute("ry", "1.8");
      g.appendChild(leaf2);
    }
    var top = document.createElementNS(ns, "circle");
    top.setAttribute("cx", "50"); top.setAttribute("cy", "32"); top.setAttribute("r", "3");
    g.appendChild(top);

  } else if (rankIdx === 6) {
    /* Divine: солнце с лучами */
    var sun = document.createElementNS(ns, "circle");
    sun.setAttribute("cx", "50"); sun.setAttribute("cy", "50"); sun.setAttribute("r", "9");
    g.appendChild(sun);
    for (var ri = 0; ri < 8; ri++) {
      var a = ri * 45 * Math.PI / 180;
      var x1 = 50 + Math.cos(a) * 13;
      var y1 = 50 + Math.sin(a) * 13;
      var x2 = 50 + Math.cos(a) * 20;
      var y2 = 50 + Math.sin(a) * 20;
      var ray = document.createElementNS(ns, "line");
      ray.setAttribute("x1", x1); ray.setAttribute("y1", y1);
      ray.setAttribute("x2", x2); ray.setAttribute("y2", y2);
      ray.setAttribute("stroke-width", "2.5");
      g.appendChild(ray);
    }

  } else if (rankIdx === 7) {
    /* Immortal: череп */
    var skull = document.createElementNS(ns, "path");
    skull.setAttribute("d", "M36 40 Q36 26 50 26 Q64 26 64 40 L64 54 Q64 60 58 60 L56 60 L56 64 L44 64 L44 60 L42 60 Q36 60 36 54 Z");
    g.appendChild(skull);
    /* Глаза */
    var eye1 = document.createElementNS(ns, "circle");
    eye1.setAttribute("cx", "43"); eye1.setAttribute("cy", "44"); eye1.setAttribute("r", "3.5");
    eye1.setAttribute("fill", cfg.bg);
    eye1.setAttribute("stroke", "none");
    g.appendChild(eye1);
    var eye2 = document.createElementNS(ns, "circle");
    eye2.setAttribute("cx", "57"); eye2.setAttribute("cy", "44"); eye2.setAttribute("r", "3.5");
    eye2.setAttribute("fill", cfg.bg);
    eye2.setAttribute("stroke", "none");
    g.appendChild(eye2);
    /* Нос */
    var nose = document.createElementNS(ns, "path");
    nose.setAttribute("d", "M50 50 L48 55 L52 55 Z");
    nose.setAttribute("fill", cfg.bg);
    nose.setAttribute("stroke", "none");
    g.appendChild(nose);
  }

  svg.appendChild(g);

  var rankLetters = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  var letter = document.createElementNS(ns, "text");
  letter.setAttribute("x", "50"); letter.setAttribute("y", "88");
  letter.setAttribute("text-anchor", "middle");
  letter.setAttribute("font-size", "6");
  letter.setAttribute("fill", cfg.accent);
  letter.setAttribute("font-weight", "700");
  letter.textContent = rankLetters[rankIdx] || "?";
  svg.appendChild(letter);

  return svg;
}

function buildQuestionMedalSVG(size) {
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 10px rgba(139,92,246,0.7));";

  var shield = document.createElementNS(ns, "path");
  shield.setAttribute("d", "M50 6 L88 20 L88 52 Q88 78 50 94 Q12 78 12 52 L12 20 Z");
  shield.setAttribute("fill", "#2a2d36");
  shield.setAttribute("stroke", "#8b5cf6");
  shield.setAttribute("stroke-width", "3");
  shield.setAttribute("stroke-dasharray", "4 3");
  svg.appendChild(shield);

  var q = document.createElementNS(ns, "text");
  q.setAttribute("x", "50"); q.setAttribute("y", "58");
  q.setAttribute("text-anchor", "middle");
  q.setAttribute("dominant-baseline", "middle");
  q.setAttribute("font-size", "42");
  q.setAttribute("font-weight", "900");
  q.setAttribute("fill", "#8b5cf6");
  q.setAttribute("font-family", "sans-serif");
  q.textContent = "?";
  svg.appendChild(q);

  return svg;
}

function getMedalForMMR(mmr) {
  for (var i = RATING_TABLE.length - 1; i >= 0; i--) {
    var m = RATING_TABLE[i];
    if (mmr >= m.stars[0]) {
      var star = 1;
      for (var s = 4; s >= 0; s--) {
        if (mmr >= m.stars[s]) { star = s + 1; break; }
      }
      return { medal: m, stars: star, mmr: mmr };
    }
  }
  return { medal: RATING_TABLE[0], stars: 1, mmr: mmr };
}
window.getMedalForMMR = getMedalForMMR;

function getMMRFromGame(game, rawScore) {
  var config = {
    lockpick: { base: 4, perPoint: 0.0007 },
    automaton: { base: 4, perPoint: 0.001 }
  };
  var c = config[game];
  if (!c) return 0;
  return Math.round(c.base + rawScore * c.perPoint);
}

/* Стили модалок + поднять курсор */
function ensureRatingStyles() {
  if (document.getElementById("ratingStyles")) return;
  var s = document.createElement("style");
  s.id = "ratingStyles";
  s.textContent = `
    .cursor-dot, .cursor-ring { z-index: 99999999 !important; }
    @keyframes ratingOvIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes ratingBoxIn {
      0% { opacity: 0; transform: scale(0.85) translateY(30px); }
      60% { opacity: 1; transform: scale(1.02) translateY(-4px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .rating-overlay-anim { animation: ratingOvIn 0.25s ease both; }
    .rating-box-anim { animation: ratingBoxIn 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
    @keyframes ratingTileIn {
      from { opacity: 0; transform: translateY(15px) scale(0.92); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .rating-tile-anim { animation: ratingTileIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
  `;
  document.head.appendChild(s);
}

window.getRatingData = function () {
  return {
    mmr: Store.get("minigames_mmr", 0) || 0,
    gamesPlayed: Store.get("minigames_games", 0) || 0,
    calibrated: Store.get("minigames_calibrated", false) === true,
    calibrationGames: Store.get("minigames_calibration_games", 0) || 0,
    wins: Store.get("minigames_wins", 0) || 0,
    bestScores: {
      lockpick: Store.get("lockpickbest", 0) || 0,
      automaton: Store.get("automatonbest", 0) || 0,
      quiz: Store.get("quizbest", 0) || 0
    }
  };
};

window.submitGameScore = function (game, rawScore) {
  if (game === "quiz") return { gained: 0, newMMR: Store.get("minigames_mmr", 0) || 0 };
  var data = window.getRatingData();
  var gained = getMMRFromGame(game, rawScore);
  data.gamesPlayed++;
  data.mmr += gained;
  if (data.mmr < 0) data.mmr = 0;

  var wasJustCalibrated = false;
  var finalMedal = null;

  if (!data.calibrated) {
    data.calibrationGames++;
    if (data.calibrationGames >= CALIBRATION_GAMES) {
      data.calibrated = true;
      wasJustCalibrated = true;
      finalMedal = getMedalForMMR(data.mmr);
    }
  }

  if (gained >= 10) data.wins++;
  Store.set("minigames_mmr", data.mmr);
  Store.set("minigames_games", data.gamesPlayed);
  Store.set("minigames_calibrated", data.calibrated);
  Store.set("minigames_calibration_games", data.calibrationGames);
  Store.set("minigames_wins", data.wins);

  if (typeof window.syncPublicProfileMMR === "function") {
    try { window.syncPublicProfileMMR(data.mmr); } catch (e) {}
  }
  if (typeof window.submitToLeaderboard === "function") {
    try { window.submitToLeaderboard(game, rawScore, data.mmr); } catch (e) {}
  }
  if (wasJustCalibrated && finalMedal) {
    setTimeout(function () {
      showCalibrationCompleteDialog(finalMedal.medal, finalMedal.stars, data.mmr);
    }, 500);
  }

  return { gained: gained, newMMR: data.mmr, medal: finalMedal };
};

function showCalibrationCompleteDialog(medal, stars, mmr) {
  ensureRatingStyles();
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(2,3,8,0.85);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;";
  ov.classList.add("rating-overlay-anim");

  var box = document.createElement("div");
  box.style.cssText = "max-width:380px;width:100%;background:var(--bg-card);border:1px solid " + medal.accent + ";border-radius:18px;padding:28px 24px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 60px -20px " + medal.accent + ";text-align:center;";
  box.classList.add("rating-box-anim");

  var head = document.createElement("div");
  head.style.cssText = "font-size:14px;font-weight:700;letter-spacing:0.12em;color:" + medal.accent + ";text-transform:uppercase;margin-bottom:18px;";
  head.textContent = "Калибровка завершена";
  box.appendChild(head);

  box.appendChild(buildMedalSVG(medal.rankIdx, 110));

  var starsRow = document.createElement("div");
  starsRow.style.cssText = "display:flex;gap:4px;justify-content:center;margin-top:12px;";
  for (var s = 0; s < 5; s++) {
    var star = document.createElement("span");
    star.style.cssText = "font-size:16px;color:" + (s < stars ? medal.accent : "var(--border)") + ";text-shadow:" + (s < stars ? "0 0 8px " + medal.accent + "88" : "none") + ";";
    star.textContent = "★";
    starsRow.appendChild(star);
  }
  box.appendChild(starsRow);

  var rankName = document.createElement("div");
  rankName.style.cssText = "font-size:26px;font-weight:900;color:" + medal.accent + ";margin-top:16px;";
  rankName.textContent = medal.ru;
  box.appendChild(rankName);

  var mmrText = document.createElement("div");
  mmrText.style.cssText = "font-size:15px;color:var(--text-muted);margin-top:6px;font-family:'JetBrains Mono', monospace;";
  mmrText.textContent = mmr + " MMR";
  box.appendChild(mmrText);

  var sub = document.createElement("div");
  sub.style.cssText = "font-size:11px;color:var(--text-dim);margin-top:14px;line-height:1.5;";
  sub.textContent = "Ты сыграл 10 игр. Теперь твой ранг отображается точно.";
  box.appendChild(sub);

  var btn = document.createElement("button");
  btn.type = "button";
  btn.style.cssText = "margin-top:20px;padding:12px 24px;border-radius:10px;background:" + medal.accent + ";color:#0b0c10;border:none;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;letter-spacing:0.03em;";
  btn.textContent = "Отлично!";
  btn.addEventListener("click", function () { ov.remove(); });
  box.appendChild(btn);

  ov.appendChild(box);
  document.body.appendChild(ov);
}

function showAllRanksDialog() {
  ensureRatingStyles();
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(2,3,8,0.85);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;overflow-y:auto;";
  ov.classList.add("rating-overlay-anim");

  var box = document.createElement("div");
  box.style.cssText = "max-width:720px;width:100%;background:var(--bg-card);border:1px solid var(--accent);border-radius:18px;padding:26px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 60px -20px var(--accent);max-height:88vh;overflow-y:auto;position:relative;";
  box.classList.add("rating-box-anim");

  var close = document.createElement("button");
  close.type = "button";
  close.style.cssText = "position:absolute;top:12px;right:12px;width:32px;height:32px;border-radius:8px;background:transparent;border:1px solid var(--border);color:var(--text-muted);font-size:14px;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;";
  close.textContent = "✕";
  close.addEventListener("click", function () { ov.remove(); });
  box.appendChild(close);

  var title = document.createElement("div");
  title.style.cssText = "font-size:20px;font-weight:900;color:var(--text);text-align:center;margin-bottom:6px;";
  title.textContent = "Все ранги";
  box.appendChild(title);

  var sub = document.createElement("div");
  sub.style.cssText = "font-size:12px;color:var(--text-muted);text-align:center;margin-bottom:20px;line-height:1.5;";
  sub.textContent = "8 медалей, по 5 звёзд в каждой. Ранг зависит от MMR.";
  box.appendChild(sub);

  var grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;";

  for (var i = 0; i < RATING_TABLE.length; i++) {
    (function (idx) {
      var m = RATING_TABLE[idx];
      var tile = document.createElement("div");
      tile.style.cssText = "background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;padding:14px 10px;text-align:center;";
      tile.classList.add("rating-tile-anim");
      tile.style.animationDelay = (idx * 60) + "ms";

      var medalWrap = document.createElement("div");
      medalWrap.style.cssText = "display:flex;justify-content:center;";
      medalWrap.appendChild(buildMedalSVG(idx, 72));
      tile.appendChild(medalWrap);

      var name = document.createElement("div");
      name.style.cssText = "font-size:14px;font-weight:800;color:" + m.accent + ";margin-top:10px;";
      name.textContent = m.ru;
      tile.appendChild(name);

      var nameEn = document.createElement("div");
      nameEn.style.cssText = "font-size:10px;color:var(--text-dim);letter-spacing:0.05em;text-transform:uppercase;margin-top:2px;";
      nameEn.textContent = m.name;
      tile.appendChild(nameEn);

      var mmrRange = document.createElement("div");
      mmrRange.style.cssText = "font-size:11px;color:var(--text-muted);margin-top:8px;font-family:'JetBrains Mono', monospace;";
      mmrRange.textContent = m.stars[0] + " – " + (m.stars[4] + 199) + " MMR";
      tile.appendChild(mmrRange);

      var starsRow = document.createElement("div");
      starsRow.style.cssText = "display:flex;gap:2px;justify-content:center;margin-top:8px;";
      for (var s = 0; s < 5; s++) {
        var st = document.createElement("span");
        st.style.cssText = "font-size:10px;color:" + m.accent + ";";
        st.textContent = "★";
        starsRow.appendChild(st);
      }
      tile.appendChild(starsRow);

      grid.appendChild(tile);
    })(i);
  }
  box.appendChild(grid);

  ov.appendChild(box);
  document.body.appendChild(ov);
}

window.showAllRanksDialog = showAllRanksDialog;

window.renderRatingWidget = function () {
  var data = window.getRatingData();
  var calibrated = data.calibrated;
  var medal = getMedalForMMR(data.mmr);
  var card = UI.card("🏆 Рейтинг мини-игр");

  var main = el("div", { style: "display:flex;align-items:center;gap:20px;margin-bottom:16px;flex-wrap:wrap;" });

  var medalBox = el("div", { style: "text-align:center;flex-shrink:0;" });
  if (calibrated) {
    medalBox.appendChild(buildMedalSVG(medal.medal.rankIdx, 96));
  } else {
    medalBox.appendChild(buildQuestionMedalSVG(96));
  }
  main.appendChild(medalBox);

  var info = el("div", { style: "flex:1;min-width:180px;" });
  if (calibrated) {
    var rankName = el("div", { style: "font-size:24px;font-weight:900;color:" + medal.medal.accent + ";" });
    rankName.textContent = medal.medal.ru;
    info.appendChild(rankName);

    var starsRow = el("div", { style: "display:flex;gap:3px;margin-top:6px;" });
    for (var s = 0; s < 5; s++) {
      var star = el("span", { style: "font-size:12px;color:" + (s < medal.stars ? medal.medal.accent : "var(--border)") + ";" }, "★");
      starsRow.appendChild(star);
    }
    info.appendChild(starsRow);

    info.appendChild(el("div", { style: "font-size:12px;color:var(--text-muted);margin-top:6px;font-family:'JetBrains Mono', monospace;" },
      data.mmr + " MMR"));
  } else {
    var calName = el("div", { style: "font-size:22px;font-weight:900;color:var(--text);" });
    calName.textContent = "Калибровка";
    info.appendChild(calName);
    info.appendChild(el("div", { style: "font-size:12px;color:var(--text-muted);margin-top:6px;" },
      "Сыграно: " + data.calibrationGames + " / " + CALIBRATION_GAMES));
    info.appendChild(el("div", { style: "font-size:11px;color:var(--text-dim);margin-top:6px;line-height:1.5;" },
      "Пока неизвестно. Ранг откроется после 10 игр."));
  }

  info.appendChild(el("div", { style: "font-size:11px;color:var(--text-dim);margin-top:8px;" },
    "Игр: " + data.gamesPlayed + " · Побед: " + data.wins));

  if (calibrated) {
    var nextStarMMR = null;
    for (var i = 0; i < RATING_TABLE.length; i++) {
      var m = RATING_TABLE[i];
      for (var st = 0; st < 5; st++) {
        if (m.stars[st] > data.mmr) { nextStarMMR = m.stars[st]; break; }
      }
      if (nextStarMMR) break;
    }
    if (nextStarMMR) {
      var currBase = medal.medal.stars[medal.stars - 1] || 0;
      var pct = Math.max(0, Math.min(100, ((data.mmr - currBase) / (nextStarMMR - currBase)) * 100));
      var barWrap = el("div", { style: "margin-top:10px;" });
      barWrap.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-bottom:4px;" }, "До следующей звезды: " + (nextStarMMR - data.mmr) + " MMR"));
      var bar = el("div", { style: "height:6px;background:var(--bg-elev);border-radius:3px;overflow:hidden;" });
      var fill = el("div", { style: "height:100%;width:" + pct + "%;background:linear-gradient(90deg," + medal.medal.accent + ",var(--cyan));border-radius:3px;transition:width 0.6s ease;" });
      bar.appendChild(fill);
      barWrap.appendChild(bar);
      info.appendChild(barWrap);
    } else {
      info.appendChild(el("div", { style: "font-size:11px;color:var(--gold);margin-top:10px;font-weight:700;" }, "★ Максимальный ранг!"));
    }
  }

  if (!calibrated) {
    var calWrap = el("div", { style: "margin-top:12px;" });
    var calBar = el("div", { style: "height:6px;background:var(--bg-elev);border-radius:3px;overflow:hidden;" });
    var calFill = el("div", { style: "height:100%;width:" + ((data.calibrationGames / CALIBRATION_GAMES) * 100) + "%;background:linear-gradient(90deg,var(--accent),var(--cyan));border-radius:3px;transition:width 0.6s ease;" });
    calBar.appendChild(calFill);
    calWrap.appendChild(calBar);
    info.appendChild(calWrap);
  }

  main.appendChild(info);
  card.appendChild(main);

  var btnRow = el("div", { style: "display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;" });
  var allRanksBtn = UI.btn("📊 Все ранги", { variant: "ghost" });
  allRanksBtn.style.flex = "1";
  allRanksBtn.addEventListener("click", function () { showAllRanksDialog(); });
  btnRow.appendChild(allRanksBtn);
  card.appendChild(btnRow);

  var scores = el("div", { style: "display:grid;grid-template-columns:repeat(2,1fr);gap:8px;" });
  var scoreDefs = [
    { icon: "🔓", name: "Взлом", val: data.bestScores.lockpick, color: "var(--gold)" },
    { icon: "⌨️", name: "Автоматоны", val: data.bestScores.automaton, color: "var(--cyan)" }
  ];
  for (var sd = 0; sd < scoreDefs.length; sd++) {
    var sb = el("div", { style: "text-align:center;padding:10px 6px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;" });
    sb.appendChild(el("div", { style: "font-size:18px;" }, scoreDefs[sd].icon));
    sb.appendChild(el("div", { style: "font-size:11px;font-weight:700;color:" + scoreDefs[sd].color + ";font-family:'JetBrains Mono',monospace;margin-top:4px;" }, scoreDefs[sd].val ? scoreDefs[sd].val.toLocaleString() : "—"));
    sb.appendChild(el("div", { class: "dim", style: "font-size:9px;text-transform:uppercase;margin-top:2px;" }, scoreDefs[sd].name));
    scores.appendChild(sb);
  }
  card.appendChild(scores);

  var note = el("div", { class: "dim", style: "font-size:10px;margin-top:12px;text-align:center;line-height:1.5;" }, "Викторина не влияет на рейтинг.");
  card.appendChild(note);

  return card;
};

console.log("rating v6.0 ready (unique medals)");
