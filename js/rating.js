/* DOTA JETCH — RATING v7.3
   - Полностью SVG-медали в стиле Dota 2 (без CDN)
   - Уникальный дизайн: цвет, форма, символ у каждого ранга
   - Боковые "крылья" усиливаются с рангом
   - Анимация модалок, курсор поверх окон */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0, dark: "#0f2a08", light: "#5a8a40", accent: "#7ab85a", stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1, dark: "#25252a", light: "#8a8a94", accent: "#b8b8c0", stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2, dark: "#082838", light: "#3a9eb0", accent: "#4ac8e0", stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3, dark: "#0a3a1a", light: "#5aa030", accent: "#9ad050", stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4, dark: "#3a0518", light: "#b04868", accent: "#e05a80", stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5, dark: "#220a4a", light: "#6a3aB0", accent: "#9a6ae0", stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",    ru: "Божество",  rankIdx: 6, dark: "#0a1a4a", light: "#3a6ab0", accent: "#5a8ae0", stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal",  ru: "Титан",     rankIdx: 7, dark: "#3a0202", light: "#a03030", accent: "#e04040", stars: [5620, 5800, 6000, 6200, 6500] }
];

var CALIBRATION_GAMES = 10;

function ensureRatingStyles() {
  if (document.getElementById("ratingStyles")) return;
  var s = document.createElement("style");
  s.id = "ratingStyles";
  s.textContent = ".cursor-dot,.cursor-ring{z-index:99999999 !important}" +
    "@keyframes ratingOvIn{from{opacity:0}to{opacity:1}}" +
    "@keyframes ratingBoxIn{0%{opacity:0;transform:scale(0.85) translateY(30px)}60%{opacity:1;transform:scale(1.02) translateY(-4px)}100%{opacity:1;transform:scale(1) translateY(0)}}" +
    ".rating-overlay-anim{animation:ratingOvIn 0.25s ease both}" +
    ".rating-box-anim{animation:ratingBoxIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both}" +
    "@keyframes ratingTileIn{from{opacity:0;transform:translateY(15px) scale(0.92)}to{opacity:1;transform:translateY(0) scale(1)}}" +
    ".rating-tile-anim{animation:ratingTileIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both}" +
    "@keyframes medalSpin{0%,100%{transform:rotate(0deg)}50%{transform:rotate(2deg)}}";
  document.head.appendChild(s);
}

/* Уникальный символ для каждого ранга */
function rankSymbolSVG(rankIdx, cfg) {
  var a = cfg.accent;
  var d = cfg.dark;
  var sym = "";

  if (rankIdx === 0) {
    /* Рекрут: маленький щит с крестом */
    sym = '<path d="M0 -14 L11 -9 L11 4 Q11 12 0 17 Q-11 12 -11 4 L-11 -9 Z" fill="none" stroke="' + a + '" stroke-width="2.2"/>' +
          '<path d="M0 -6 L0 8 M-5 1 L5 1" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/>';
  } else if (rankIdx === 1) {
    /* Страж: молот */
    sym = '<rect x="-3" y="-16" width="6" height="22" fill="' + a + '" rx="1"/>' +
          '<rect x="-11" y="-18" width="22" height="9" fill="' + a + '" rx="2"/>' +
          '<rect x="-11" y="6" width="22" height="4" fill="' + a + '" rx="1"/>';
  } else if (rankIdx === 2) {
    /* Рыцарь: меч вертикальный */
    sym = '<path d="M0 -20 L3 -8 L3 12 L6 16 L6 20 L-6 20 L-6 16 L-3 12 L-3 -8 Z" fill="' + a + '"/>' +
          '<rect x="-10" y="10" width="20" height="3" fill="' + a + '" rx="1"/>';
  } else if (rankIdx === 3) {
    /* Герой: два меча скрещённых */
    sym = '<path d="M-15 -16 L15 16 M15 -16 L-15 16" stroke="' + a + '" stroke-width="3.5" stroke-linecap="round"/>' +
          '<circle cx="-15" cy="-16" r="3.5" fill="' + a + '"/>' +
          '<circle cx="15" cy="-16" r="3.5" fill="' + a + '"/>' +
          '<circle cx="0" cy="0" r="4" fill="' + d + '" stroke="' + a + '" stroke-width="2"/>';
  } else if (rankIdx === 4) {
    /* Легенда: корона */
    sym = '<path d="M-16 12 L-16 -6 L-8 2 L0 -12 L8 2 L16 -6 L16 12 Z" fill="' + a + '"/>' +
          '<rect x="-16" y="12" width="32" height="4" fill="' + a + '" rx="1"/>' +
          '<circle cx="-16" cy="-8" r="2.5" fill="' + a + '"/>' +
          '<circle cx="0" cy="-14" r="2.5" fill="' + a + '"/>' +
          '<circle cx="16" cy="-8" r="2.5" fill="' + a + '"/>';
  } else if (rankIdx === 5) {
    /* Властелин: корона с рубинами */
    sym = '<path d="M-17 13 L-17 -8 L-9 1 L0 -13 L9 1 L17 -8 L17 13 Z" fill="' + a + '"/>' +
          '<rect x="-17" y="13" width="34" height="4" fill="' + a + '" rx="1"/>' +
          '<circle cx="-17" cy="-10" r="3" fill="#fff" opacity="0.9"/>' +
          '<circle cx="0" cy="-15" r="3" fill="#fff" opacity="0.9"/>' +
          '<circle cx="17" cy="-10" r="3" fill="#fff" opacity="0.9"/>' +
          '<path d="M0 -3 L4 3 L0 9 L-4 3 Z" fill="#fff" opacity="0.7"/>';
  } else if (rankIdx === 6) {
    /* Божество: солнце */
    sym = '<circle cx="0" cy="0" r="9" fill="' + a + '"/>' +
          '<circle cx="0" cy="0" r="5" fill="#fff" opacity="0.5"/>';
    for (var i = 0; i < 8; i++) {
      var ang = i * 45 * Math.PI / 180;
      var x1 = Math.cos(ang) * 13;
      var y1 = Math.sin(ang) * 13;
      var x2 = Math.cos(ang) * 20;
      var y2 = Math.sin(ang) * 20;
      sym += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + a + '" stroke-width="3" stroke-linecap="round"/>';
    }
  } else if (rankIdx === 7) {
    /* Титан: череп */
    sym = '<path d="M-13 -6 Q-13 -18 0 -18 Q13 -18 13 -6 L13 6 Q13 11 8 11 L6 11 L6 15 L-6 15 L-6 11 L-8 11 Q-13 11 -13 6 Z" fill="' + a + '"/>' +
          '<circle cx="-5" cy="-3" r="3.5" fill="' + d + '"/>' +
          '<circle cx="5" cy="-3" r="3.5" fill="' + d + '"/>' +
          '<path d="M-2 6 L0 9 L2 6 Z" fill="' + d + '"/>' +
          '<path d="M-18 -14 L-14 -10 M18 -14 L14 -10" stroke="' + a + '" stroke-width="2.5" stroke-linecap="round"/>';
  }

  return '<g transform="translate(100 100)">' + sym + '</g>';
}

/* Крылья (боковые) в зависимости от ранга */
function rankWingsSVG(rankIdx, cfg) {
  if (rankIdx < 2) return "";
  var a = cfg.accent;
  var opacity = 0.5 + rankIdx * 0.06;
  var wings = "";

  /* Левое крыло */
  wings += '<g opacity="' + opacity + '">';
  wings += '<path d="M35 100 Q20 90 5 95 Q15 100 5 105 Q20 110 35 100 Z" fill="' + a + '"/>';
  if (rankIdx >= 3) {
    wings += '<path d="M35 100 Q15 82 0 88 Q12 94 0 100 Q12 106 0 112 Q15 118 35 100 Z" fill="' + a + '" opacity="0.85"/>';
  }
  if (rankIdx >= 5) {
    wings += '<path d="M35 100 Q10 72 -5 78 Q8 88 -5 100 Q8 112 -5 122 Q10 128 35 100 Z" fill="' + a + '" opacity="0.7"/>';
  }
  if (rankIdx >= 7) {
    wings += '<path d="M35 100 Q5 60 -15 68 Q0 84 -15 100 Q0 116 -15 132 Q5 140 35 100 Z" fill="' + a + '" opacity="0.55"/>';
  }
  wings += '</g>';

  /* Правое крыло (зеркальное) */
  wings += '<g opacity="' + opacity + '">';
  wings += '<path d="M165 100 Q180 90 195 95 Q185 100 195 105 Q180 110 165 100 Z" fill="' + a + '"/>';
  if (rankIdx >= 3) {
    wings += '<path d="M165 100 Q185 82 200 88 Q188 94 200 100 Q188 106 200 112 Q185 118 165 100 Z" fill="' + a + '" opacity="0.85"/>';
  }
  if (rankIdx >= 5) {
    wings += '<path d="M165 100 Q190 72 205 78 Q192 88 205 100 Q192 112 205 122 Q190 128 165 100 Z" fill="' + a + '" opacity="0.7"/>';
  }
  if (rankIdx >= 7) {
    wings += '<path d="M165 100 Q195 60 215 68 Q200 84 215 100 Q200 116 215 132 Q195 140 165 100 Z" fill="' + a + '" opacity="0.55"/>';
  }
  wings += '</g>';

  return wings;
}

/* Декоративные "пики" на углах ромба */
function rankCornersSVG(rankIdx, cfg) {
  var a = cfg.accent;
  return '' +
    '<path d="M100 22 L110 42 L90 42 Z" fill="' + a + '" opacity="0.9"/>' +
    '<path d="M100 178 L110 158 L90 158 Z" fill="' + a + '" opacity="0.9"/>' +
    '<path d="M178 100 L158 90 L158 110 Z" fill="' + a + '" opacity="0.9"/>' +
    '<path d="M22 100 L42 90 L42 110 Z" fill="' + a + '" opacity="0.9"/>';
}

function buildMedalSVG(rankIdx, size) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 10px " + cfg.accent + "99);";

  var gid = "grad" + rankIdx;
  var svgStr = '<defs>' +
    '<linearGradient id="' + gid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="' + cfg.light + '"/>' +
      '<stop offset="55%" stop-color="' + cfg.accent + '"/>' +
      '<stop offset="100%" stop-color="' + cfg.dark + '"/>' +
    '</linearGradient>' +
    '<linearGradient id="' + gid + 'i" x1="0%" y1="0%" x2="0%" y2="100%">' +
      '<stop offset="0%" stop-color="#000" stop-opacity="0.2"/>' +
      '<stop offset="100%" stop-color="#000" stop-opacity="0.75"/>' +
    '</linearGradient>' +
    '</defs>' +
    rankWingsSVG(rankIdx, cfg) +
    /* Внешний ромб с полным градиентом */
    '<path d="M100 20 L180 100 L100 180 L20 100 Z" fill="url(#' + gid + ')" stroke="' + cfg.accent + '" stroke-width="2.5"/>' +
    /* Внутренний ромб — тёмный фон под символом */
    '<path d="M100 42 L158 100 L100 158 L42 100 Z" fill="url(#' + gid + 'i)" stroke="' + cfg.accent + '" stroke-width="2"/>' +
    /* Тонкая внутренняя обводка */
    '<path d="M100 52 L148 100 L100 148 L52 100 Z" fill="none" stroke="' + cfg.accent + '" stroke-width="0.8" opacity="0.5"/>' +
    rankCornersSVG(rankIdx, cfg) +
    rankSymbolSVG(rankIdx, cfg);

  var doc = new DOMParser().parseFromString('<svg xmlns="' + ns + '" viewBox="0 0 200 200">' + svgStr + '</svg>', "image/svg+xml");
  var parsed = doc.documentElement;
  /* Копируем атрибуты и содержимое */
  svg.setAttribute("viewBox", parsed.getAttribute("viewBox") || "0 0 200 200");
  while (parsed.firstChild) svg.appendChild(parsed.firstChild);

  return svg;
}

function buildQuestionMedalSVG(size) {
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;filter:drop-shadow(0 0 10px rgba(139,92,246,0.7));";

  var svgStr = '' +
    '<defs>' +
      '<linearGradient id="qg" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#3a2f4a"/>' +
        '<stop offset="100%" stop-color="#0f0a18"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<path d="M100 20 L180 100 L100 180 L20 100 Z" fill="url(#qg)" stroke="#8b5cf6" stroke-width="2.5" stroke-dasharray="6 4"/>' +
    '<path d="M100 42 L158 100 L100 158 L42 100 Z" fill="#0b0c10" stroke="#8b5cf6" stroke-width="2" opacity="0.85"/>' +
    '<text x="100" y="122" text-anchor="middle" font-size="70" font-weight="900" fill="#8b5cf6" font-family="sans-serif">?</text>';

  var doc = new DOMParser().parseFromString('<svg xmlns="' + ns + '" viewBox="0 0 200 200">' + svgStr + '</svg>', "image/svg+xml");
  var parsed = doc.documentElement;
  while (parsed.firstChild) svg.appendChild(parsed.firstChild);
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
  ov.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(2,3,8,0.85);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;";
  ov.classList.add("rating-overlay-anim");

  var box = document.createElement("div");
  box.style.cssText = "max-width:380px;width:100%;background:var(--bg-card);border:1px solid " + medal.accent + ";border-radius:18px;padding:28px 24px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.7);text-align:center;";
  box.classList.add("rating-box-anim");

  var head = document.createElement("div");
  head.style.cssText = "font-size:14px;font-weight:700;letter-spacing:0.12em;color:" + medal.accent + ";text-transform:uppercase;margin-bottom:18px;";
  head.textContent = "Калибровка завершена";
  box.appendChild(head);

  var medalWrap = document.createElement("div");
  medalWrap.style.cssText = "display:flex;justify-content:center;";
  medalWrap.appendChild(buildMedalSVG(medal.rankIdx, 140));
  box.appendChild(medalWrap);

  var starsRow = document.createElement("div");
  starsRow.style.cssText = "display:flex;gap:4px;justify-content:center;margin-top:12px;";
  for (var s = 0; s < 5; s++) {
    var star = document.createElement("span");
    star.style.cssText = "font-size:16px;color:" + (s < stars ? medal.accent : "var(--border)") + ";";
    star.textContent = "★";
    starsRow.appendChild(star);
  }
  box.appendChild(starsRow);

  var rankName = document.createElement("div");
  rankName.style.cssText = "font-size:26px;font-weight:900;color:" + medal.accent + ";margin-top:16px;";
  rankName.textContent = medal.ru;
  box.appendChild(rankName);

  var mmrText = document.createElement("div");
  mmrText.style.cssText = "font-size:15px;color:var(--text-muted);margin-top:6px;font-family:'JetBrains Mono',monospace;";
  mmrText.textContent = mmr + " MMR";
  box.appendChild(mmrText);

  var sub = document.createElement("div");
  sub.style.cssText = "font-size:11px;color:var(--text-dim);margin-top:14px;line-height:1.5;";
  sub.textContent = "Ты сыграл 10 игр. Теперь твой ранг отображается точно.";
  box.appendChild(sub);

  var btn = document.createElement("button");
  btn.type = "button";
  btn.style.cssText = "margin-top:20px;padding:12px 24px;border-radius:10px;background:" + medal.accent + ";color:#0b0c10;border:none;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;";
  btn.textContent = "Отлично!";
  btn.addEventListener("click", function () { ov.remove(); });
  box.appendChild(btn);

  ov.appendChild(box);
  document.body.appendChild(ov);
}

function showAllRanksDialog() {
  ensureRatingStyles();
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(2,3,8,0.85);backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;overflow-y:auto;";
  ov.classList.add("rating-overlay-anim");

  var box = document.createElement("div");
  box.style.cssText = "max-width:820px;width:100%;background:var(--bg-card);border:1px solid var(--accent);border-radius:18px;padding:26px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.7);max-height:88vh;overflow-y:auto;position:relative;";
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
  sub.style.cssText = "font-size:12px;color:var(--text-muted);text-align:center;margin-bottom:22px;line-height:1.5;";
  sub.textContent = "8 медалей, по 5 звёзд в каждой. Ранг зависит от MMR.";
  box.appendChild(sub);

  var grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;";

  for (var i = 0; i < RATING_TABLE.length; i++) {
    (function (idx) {
      var m = RATING_TABLE[idx];
      var tile = document.createElement("div");
      tile.style.cssText = "background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;padding:14px 10px;text-align:center;";
      tile.classList.add("rating-tile-anim");
      tile.style.animationDelay = (idx * 60) + "ms";

      var medalWrap = document.createElement("div");
      medalWrap.style.cssText = "display:flex;justify-content:center;";
      medalWrap.appendChild(buildMedalSVG(idx, 120));
      tile.appendChild(medalWrap);

      var name = document.createElement("div");
      name.style.cssText = "font-size:14px;font-weight:800;color:" + m.accent + ";margin-top:8px;";
      name.textContent = m.ru;
      tile.appendChild(name);

      var nameEn = document.createElement("div");
      nameEn.style.cssText = "font-size:10px;color:var(--text-dim);letter-spacing:0.05em;text-transform:uppercase;margin-top:2px;";
      nameEn.textContent = m.name;
      tile.appendChild(nameEn);

      var mmrRange = document.createElement("div");
      mmrRange.style.cssText = "font-size:11px;color:var(--text-muted);margin-top:8px;font-family:'JetBrains Mono',monospace;";
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
    medalBox.appendChild(buildMedalSVG(medal.medal.rankIdx, 130));
  } else {
    medalBox.appendChild(buildQuestionMedalSVG(130));
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

    info.appendChild(el("div", { style: "font-size:12px;color:var(--text-muted);margin-top:6px;font-family:'JetBrains Mono',monospace;" },
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

console.log("rating v7.3 ready (full SVG medals)");
