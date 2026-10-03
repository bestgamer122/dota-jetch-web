/* DOTA JETCH — RATING v6.1
   - Иконки рангов в стиле Dota 2: ромб + крылья + уникальный символ
   - Уникальные цвета у каждого ранга
   - Анимация модалок
   - Курсор поверх окон */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0, c1: "#1a3a10", c2: "#3a7a25", accent: "#7ab85a", stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1, c1: "#3a3a42", c2: "#6a6a78", accent: "#b8b8c0", stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2, c1: "#0a3a4a", c2: "#1a7a8a", accent: "#4ac8e0", stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3, c1: "#1a5a2a", c2: "#4a9a3a", accent: "#9ad050", stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4, c1: "#5a0a2a", c2: "#9a1a4a", accent: "#e05a80", stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5, c1: "#1a0a5a", c2: "#4a1a9a", accent: "#9a6ae0", stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",    ru: "Божество",  rankIdx: 6, c1: "#0a2a6a", c2: "#1a4aa0", accent: "#5a8ae0", stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal",  ru: "Титан",     rankIdx: 7, c1: "#4a0505", c2: "#8a1515", accent: "#e04040", stars: [5620, 5800, 6000, 6200, 6500] }
];

var CALIBRATION_GAMES = 10;

/* Стили модалок + курсор поверх */
function ensureRatingStyles() {
  if (document.getElementById("ratingStyles")) return;
  var s = document.createElement("style");
  s.id = "ratingStyles";
  s.textContent = `
    .cursor-dot, .cursor-ring { z-index: 99999999 !important; }
    @keyframes ratingOvIn { from { opacity: 0; } to { opacity: 1; } }
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

/* Уникальные SVG в стиле Dota 2 для каждой медали */
function buildMedalSVG(rankIdx, size) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  var id = "m" + rankIdx;

  /* Символ в центре ромба */
  var sym = "";
  if (rankIdx === 0) {
    /* Рекрут: точка с кольцом */
    sym = '<circle cx="100" cy="105" r="14" fill="none" stroke="#ffffff" stroke-width="4" opacity="0.85"/>' +
          '<circle cx="100" cy="105" r="5" fill="#ffffff" opacity="0.9"/>';
  } else if (rankIdx === 1) {
    /* Страж: крест */
    sym = '<path d="M100 80 L100 130 M75 105 L125 105" stroke="#ffffff" stroke-width="9" stroke-linecap="round" opacity="0.85"/>';
  } else if (rankIdx === 2) {
    /* Рыцарь: меч-крест */
    sym = '<path d="M100 78 L100 128 M82 96 L100 78 L118 96 M85 118 L115 118" stroke="#ffffff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" fill="none" opacity="0.9"/>';
  } else if (rankIdx === 3) {
    /* Герой: скрещённые мечи */
    sym = '<path d="M75 80 L125 130" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.9"/>' +
          '<path d="M125 80 L75 130" stroke="#ffffff" stroke-width="8" stroke-linecap="round" opacity="0.9"/>' +
          '<circle cx="70" cy="75" r="6" fill="#ffffff" opacity="0.9"/>' +
          '<circle cx="130" cy="75" r="6" fill="#ffffff" opacity="0.9"/>';
  } else if (rankIdx === 4) {
    /* Легенда: пятиконечная звезда */
    sym = '<path d="M100 78 L108 98 L130 100 L113 114 L118 136 L100 124 L82 136 L87 114 L70 100 L92 98 Z" fill="#ffffff" opacity="0.9"/>';
  } else if (rankIdx === 5) {
    /* Властелин: большая звезда с лучами */
    sym = '<path d="M100 72 L107 95 L130 96 L112 112 L118 135 L100 121 L82 135 L88 112 L70 96 L93 95 Z" fill="#ffffff" opacity="0.9"/>' +
          '<path d="M100 60 L100 68 M100 142 L100 150 M62 105 L70 105 M130 105 L138 105" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.8"/>';
  } else if (rankIdx === 6) {
    /* Божество: солнце с лучами */
    sym = '<circle cx="100" cy="105" r="16" fill="#ffffff" opacity="0.9"/>' +
          '<path d="M100 78 L100 90 M100 120 L100 132 M73 105 L85 105 M115 105 L127 105 M80 85 L88 93 M112 117 L120 125 M120 85 L112 93 M88 117 L80 125" stroke="#ffffff" stroke-width="4" stroke-linecap="round" opacity="0.85"/>';
  } else {
    /* Титан: череп с рогами */
    sym = '<path d="M78 88 Q100 68 122 88 L122 118 Q100 138 78 118 Z" fill="#ffffff" opacity="0.9"/>' +
          '<circle cx="90" cy="103" r="5" fill="' + cfg.c2 + '"/>' +
          '<circle cx="110" cy="103" r="5" fill="' + cfg.c2 + '"/>' +
          '<path d="M96 116 L100 122 L104 116 Z" fill="' + cfg.c2 + '"/>' +
          '<path d="M70 78 Q78 72 84 76 M130 78 Q122 72 116 76" stroke="#ffffff" stroke-width="3" fill="none" opacity="0.85"/>';
  }

  /* Боковые крылья (усиливаются с рангом) */
  var wings = "";
  if (rankIdx >= 2) {
    /* Маленькие боковые "плечи" */
    wings += '<path d="M40 105 L15 90 L20 105 L15 120 Z" fill="' + cfg.accent + '" opacity="0.7"/>';
    wings += '<path d="M160 105 L185 90 L180 105 L185 120 Z" fill="' + cfg.accent + '" opacity="0.7"/>';
  }
  if (rankIdx >= 4) {
    /* Средние крылья */
    wings += '<path d="M45 100 Q20 80 10 85 Q15 95 25 100 Q15 105 10 115 Q20 120 45 100" fill="' + cfg.accent + '" opacity="0.6"/>';
    wings += '<path d="M155 100 Q180 80 190 85 Q185 95 175 100 Q185 105 190 115 Q180 120 155 100" fill="' + cfg.accent + '" opacity="0.6"/>';
  }
  if (rankIdx >= 6) {
    /* Большие внешние крылья */
    wings += '<path d="M35 95 Q5 60 0 75 Q5 90 15 100 Q5 110 0 125 Q5 140 35 105" fill="' + cfg.accent + '" opacity="0.45"/>';
    wings += '<path d="M165 95 Q195 60 200 75 Q195 90 185 100 Q195 110 200 125 Q195 140 165 105" fill="' + cfg.accent + '" opacity="0.45"/>';
  }

  /* Основание снизу (для высоких рангов) */
  var base = "";
  if (rankIdx >= 5) {
    base += '<path d="M85 172 L100 188 L115 172 L100 178 Z" fill="' + cfg.accent + '" opacity="0.8"/>';
  }
  if (rankIdx >= 6) {
    base += '<circle cx="100" cy="192" r="3" fill="' + cfg.accent + '" opacity="0.9"/>';
  }

  var svgStr = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="' + size + '" height="' + size + '">' +
    '<defs>' +
      '<linearGradient id="g1' + id + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.c2 + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.c1 + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="g2' + id + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#000000" stop-opacity="0.5"/>' +
        '<stop offset="100%" stop-color="#000000" stop-opacity="0.85"/>' +
      '</linearGradient>' +
    '</defs>' +
    wings +
    /* Внешний ромб с градиентом */
    '<path d="M100 15 L185 100 L100 185 L15 100 Z" fill="url(#g1' + id + ')" stroke="' + cfg.accent + '" stroke-width="3"/>' +
    /* Внутренний ромб с обводкой */
    '<path d="M100 35 L165 100 L100 165 L35 100 Z" fill="url(#g2' + id + ')" stroke="' + cfg.accent + '" stroke-width="2" opacity="0.95"/>' +
    /* Дополнительные декоративные углы */
    '<path d="M100 20 L108 35 L92 35 Z" fill="' + cfg.accent + '" opacity="0.9"/>' +
    '<path d="M100 180 L108 165 L92 165 Z" fill="' + cfg.accent + '" opacity="0.9"/>' +
    '<path d="M180 100 L165 92 L165 108 Z" fill="' + cfg.accent + '" opacity="0.9"/>' +
    '<path d="M20 100 L35 92 L35 108 Z" fill="' + cfg.accent + '" opacity="0.9"/>' +
    /* Символ в центре */
    sym +
    /* Основание */
    base +
  '</svg>';

  var doc = new DOMParser().parseFromString(svgStr, "image/svg+xml");
  var node = doc.documentElement;
  node.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 10px " + cfg.accent + "88);";
  return node;
}

function buildQuestionMedalSVG(size) {
  size = size || 96;
  var svgStr = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="' + size + '" height="' + size + '">' +
    '<path d="M100 15 L185 100 L100 185 L15 100 Z" fill="#1e2129" stroke="#8b5cf6" stroke-width="3" stroke-dasharray="6 5"/>' +
    '<path d="M100 35 L165 100 L100 165 L35 100 Z" fill="#0b0c10" stroke="#8b5cf6" stroke-width="2" opacity="0.7"/>' +
    '<text x="100" y="120" text-anchor="middle" font-size="72" font-weight="900" fill="#8b5cf6" font-family="sans-serif">?</text>' +
  '</svg>';
  var doc = new DOMParser().parseFromString(svgStr, "image/svg+xml");
  var node = doc.documentElement;
  node.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 10px rgba(139,92,246,0.7));";
  return node;
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

  var medalWrap = document.createElement("div");
  medalWrap.style.cssText = "display:flex;justify-content:center;";
  medalWrap.appendChild(buildMedalSVG(medal.rankIdx, 130));
  box.appendChild(medalWrap);

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
  box.style.cssText = "max-width:760px;width:100%;background:var(--bg-card);border:1px solid var(--accent);border-radius:18px;padding:26px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 60px -20px var(--accent);max-height:88vh;overflow-y:auto;position:relative;";
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
      medalWrap.appendChild(buildMedalSVG(idx, 100));
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
    medalBox.appendChild(buildMedalSVG(medal.medal.rankIdx, 110));
  } else {
    medalBox.appendChild(buildQuestionMedalSVG(110));
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

