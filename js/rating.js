/* DOTA JETCH — RATING v7.4
   - Перьевидные крылья в стиле Dota 2
   - Крупные символы, мягкое свечение внутри ромба
   - Властелин: золотые акценты, увеличенные крылья
   - Полностью SVG, без CDN */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0, dark: "#0f2a08", light: "#5a8a40", accent: "#7ab85a", glow: "#a8e080", stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1, dark: "#25252a", light: "#8a8a94", accent: "#b8b8c0", glow: "#e0e0e8", stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2, dark: "#082838", light: "#3a9eb0", accent: "#4ac8e0", glow: "#80e8ff", stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3, dark: "#0a3a1a", light: "#5aa030", accent: "#9ad050", glow: "#c8f080", stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4, dark: "#3a0518", light: "#b04868", accent: "#e05a80", glow: "#ff88a8", stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5, dark: "#220a4a", light: "#6a3ab0", accent: "#a86ae8", glow: "#d8a8ff", stars: [3850, 4000, 4150, 4300, 4460], gold: true },
  { name: "Divine",    ru: "Божество",  rankIdx: 6, dark: "#0a1a4a", light: "#3a6ab0", accent: "#5a8ae0", glow: "#90b8ff", stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal",  ru: "Титан",     rankIdx: 7, dark: "#3a0202", light: "#a03030", accent: "#e04040", glow: "#ff7070", stars: [5620, 5800, 6000, 6200, 6500] }
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
    "@keyframes medalPulse{0%,100%{filter:drop-shadow(0 0 10px var(--mglow))}50%{filter:drop-shadow(0 0 20px var(--mglow))}}" +
    ".medal-svg{animation:medalPulse 3s ease-in-out infinite}";
  document.head.appendChild(s);
}

/* ─── Перьевидные крылья ─── */
function rankWingsSVG(rankIdx, cfg) {
  if (rankIdx < 2) return "";
  var a = cfg.accent;
  var g = cfg.gold ? "#fbbf24" : cfg.accent;
  var opacity = 0.55 + rankIdx * 0.05;
  var wings = "";

  /* Сколько "перьев" у крыла: зависит от ранга */
  var feathers = rankIdx - 1; /* 1..6 */
  if (feathers > 5) feathers = 5;

  /* Левое крыло */
  wings += '<g opacity="' + opacity + '" fill="' + a + '">';
  for (var i = 0; i < feathers; i++) {
    var scale = 1 - i * 0.13;
    var yOff = -20 + i * 12;
    var len = 38 + i * 3;
    wings += '<path d="M0 ' + yOff + ' Q-' + (len * 0.6) + ' ' + (yOff - 6) + ' -' + len + ' ' + (yOff + 4) + ' Q-' + (len * 0.5) + ' ' + (yOff + 2) + ' 0 ' + (yOff + 6) + ' Z" transform="translate(60 100) scale(' + scale.toFixed(2) + ')" />';
  }
  wings += '</g>';

  /* Правое крыло — зеркальное */
  wings += '<g opacity="' + opacity + '" fill="' + a + '">';
  for (var j = 0; j < feathers; j++) {
    var scale2 = 1 - j * 0.13;
    var yOff2 = -20 + j * 12;
    var len2 = 38 + j * 3;
    wings += '<path d="M0 ' + yOff2 + ' Q' + (len2 * 0.6) + ' ' + (yOff2 - 6) + ' ' + len2 + ' ' + (yOff2 + 4) + ' Q' + (len2 * 0.5) + ' ' + (yOff2 + 2) + ' 0 ' + (yOff2 + 6) + ' Z" transform="translate(140 100) scale(' + scale2.toFixed(2) + ')" />';
  }
  wings += '</g>';

  /* Золотой контур для Властелина */
  if (cfg.gold) {
    wings += '<g opacity="' + (opacity + 0.15) + '" fill="' + g + '">';
    for (var k = 0; k < feathers; k++) {
      var s3 = (1 - k * 0.13) * 0.95;
      var yO3 = -19 + k * 12;
      var l3 = 34 + k * 3;
      wings += '<path d="M0 ' + yO3 + ' L-' + l3 + ' ' + (yO3 + 5) + ' L0 ' + (yO3 + 3) + ' Z" transform="translate(60 100) scale(' + s3.toFixed(2) + ')" opacity="0.6"/>';
      wings += '<path d="M0 ' + yO3 + ' L' + l3 + ' ' + (yO3 + 5) + ' L0 ' + (yO3 + 3) + ' Z" transform="translate(140 100) scale(' + s3.toFixed(2) + ')" opacity="0.6"/>';
    }
    wings += '</g>';
  }

  return wings;
}

/* ─── Уникальный символ для каждого ранга (крупнее) ─── */
function rankSymbolSVG(rankIdx, cfg) {
  var a = cfg.accent;
  var d = cfg.dark;
  var glow = cfg.glow;
  var sym = "";

  if (rankIdx === 0) {
    sym = '<path d="M0 -20 L16 -13 L16 5 Q16 16 0 24 Q-16 16 -16 5 L-16 -13 Z" fill="none" stroke="' + a + '" stroke-width="3"/>' +
          '<path d="M0 -9 L0 11 M-7 1 L7 1" stroke="' + a + '" stroke-width="3" stroke-linecap="round"/>' +
          '<circle cx="0" cy="-13" r="2" fill="' + a + '"/>';
  } else if (rankIdx === 1) {
    sym = '<rect x="-4" y="-22" width="8" height="30" fill="' + a + '" rx="1.5"/>' +
          '<rect x="-15" y="-24" width="30" height="12" fill="' + a + '" rx="2.5"/>' +
          '<rect x="-15" y="8" width="30" height="5" fill="' + a + '" rx="1.5"/>' +
          '<circle cx="0" cy="-18" r="2" fill="' + d + '"/>';
  } else if (rankIdx === 2) {
    sym = '<path d="M0 -26 L4 -10 L4 16 L8 20 L8 24 L-8 24 L-8 20 L-4 16 L-4 -10 Z" fill="' + a + '"/>' +
          '<rect x="-13" y="12" width="26" height="4" fill="' + a + '" rx="1.5"/>' +
          '<circle cx="0" cy="18" r="2.5" fill="' + glow + '"/>';
  } else if (rankIdx === 3) {
    sym = '<path d="M-20 -22 L20 22 M20 -22 L-20 22" stroke="' + a + '" stroke-width="5" stroke-linecap="round"/>' +
          '<circle cx="-20" cy="-22" r="5" fill="' + a + '"/>' +
          '<circle cx="20" cy="-22" r="5" fill="' + a + '"/>' +
          '<circle cx="0" cy="0" r="6" fill="' + d + '" stroke="' + a + '" stroke-width="2.5"/>' +
          '<circle cx="0" cy="0" r="2" fill="' + glow + '"/>';
  } else if (rankIdx === 4) {
    sym = '<path d="M-22 16 L-22 -8 L-11 3 L0 -16 L11 3 L22 -8 L22 16 Z" fill="' + a + '"/>' +
          '<rect x="-22" y="16" width="44" height="5" fill="' + a + '" rx="1.5"/>' +
          '<circle cx="-22" cy="-10" r="3.5" fill="' + glow + '"/>' +
          '<circle cx="0" cy="-18" r="3.5" fill="' + glow + '"/>' +
          '<circle cx="22" cy="-10" r="3.5" fill="' + glow + '"/>';
  } else if (rankIdx === 5) {
    /* Властелин — крупная корона с рубинами и золотом */
    sym = '<path d="M-24 18 L-24 -12 L-13 1 L0 -18 L13 1 L24 -12 L24 18 Z" fill="' + a + '"/>' +
          '<rect x="-24" y="18" width="48" height="6" fill="' + a + '" rx="2"/>' +
          /* Золотые акценты */
          '<path d="M-24 -12 L-13 1 L0 -18 L13 1 L24 -12" stroke="#fbbf24" stroke-width="2" fill="none"/>' +
          '<rect x="-24" y="18" width="48" height="6" fill="none" stroke="#fbbf24" stroke-width="1"/>' +
          /* Рубины */
          '<circle cx="-24" cy="-14" r="4.5" fill="#dc2626" stroke="#fbbf24" stroke-width="1.5"/>' +
          '<circle cx="0" cy="-20" r="4.5" fill="#dc2626" stroke="#fbbf24" stroke-width="1.5"/>' +
          '<circle cx="24" cy="-14" r="4.5" fill="#dc2626" stroke="#fbbf24" stroke-width="1.5"/>' +
          '<path d="M0 -2 L6 6 L0 14 L-6 6 Z" fill="#fbbf24"/>' +
          '<path d="M0 0 L4 6 L0 12 L-4 6 Z" fill="#fef3c7"/>';
  } else if (rankIdx === 6) {
    sym = '<circle cx="0" cy="0" r="13" fill="' + a + '"/>' +
          '<circle cx="0" cy="0" r="7" fill="' + glow + '" opacity="0.9"/>' +
          '<circle cx="0" cy="0" r="3" fill="#fff"/>';
    for (var i = 0; i < 12; i++) {
      var ang = i * 30 * Math.PI / 180;
      var x1 = Math.cos(ang) * 17;
      var y1 = Math.sin(ang) * 17;
      var x2 = Math.cos(ang) * 26;
      var y2 = Math.sin(ang) * 26;
      var w = i % 3 === 0 ? "3.5" : "2";
      sym += '<line x1="' + x1.toFixed(1) + '" y1="' + y1.toFixed(1) + '" x2="' + x2.toFixed(1) + '" y2="' + y2.toFixed(1) + '" stroke="' + a + '" stroke-width="' + w + '" stroke-linecap="round"/>';
    }
  } else {
    /* Титан — череп с рогами, крупный */
    sym = '<path d="M-18 -8 Q-18 -24 0 -24 Q18 -24 18 -8 L18 8 Q18 14 12 14 L8 14 L8 20 L-8 20 L-8 14 L-12 14 Q-18 14 -18 8 Z" fill="' + a + '"/>' +
          /* Глаза */
          '<circle cx="-7" cy="-4" r="5" fill="' + d + '"/>' +
          '<circle cx="7" cy="-4" r="5" fill="' + d + '"/>' +
          '<circle cx="-7" cy="-4" r="2" fill="' + glow + '"/>' +
          '<circle cx="7" cy="-4" r="2" fill="' + glow + '"/>' +
          /* Нос и зубы */
          '<path d="M-3 7 L0 11 L3 7 Z" fill="' + d + '"/>' +
          '<line x1="-5" y1="17" x2="-5" y2="20" stroke="' + d + '" stroke-width="1.5"/>' +
          '<line x1="0" y1="17" x2="0" y2="20" stroke="' + d + '" stroke-width="1.5"/>' +
          '<line x1="5" y1="17" x2="5" y2="20" stroke="' + d + '" stroke-width="1.5"/>' +
          /* Рога */
          '<path d="M-24 -18 Q-28 -24 -30 -20" stroke="' + a + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
          '<path d="M24 -18 Q28 -24 30 -20" stroke="' + a + '" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
  }

  return '<g transform="translate(100 100)">' + sym + '</g>';
}

/* ─── Угловые пики ромба ─── */
function rankCornersSVG(rankIdx, cfg) {
  var a = cfg.accent;
  return '' +
    '<path d="M100 20 L112 44 L88 44 Z" fill="' + a + '" opacity="0.95"/>' +
    '<path d="M100 180 L112 156 L88 156 Z" fill="' + a + '" opacity="0.95"/>' +
    '<path d="M180 100 L156 88 L156 112 Z" fill="' + a + '" opacity="0.95"/>' +
    '<path d="M20 100 L44 88 L44 112 Z" fill="' + a + '" opacity="0.95"/>';
}

/* ─── Основная сборка медали ─── */
function buildMedalSVG(rankIdx, size) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;flex-shrink:0;";
  svg.style.setProperty("--mglow", cfg.glow);
  svg.classList.add("medal-svg");

  var gid = "grad" + rankIdx;
  var qid = "glow" + rankIdx;
  var goldLine = cfg.gold ? "#fbbf24" : cfg.accent;

  var svgStr = '' +
    '<defs>' +
      '<linearGradient id="' + gid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.light + '"/>' +
        '<stop offset="55%" stop-color="' + cfg.accent + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.dark + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + gid + 'i" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#000" stop-opacity="0.15"/>' +
        '<stop offset="100%" stop-color="#000" stop-opacity="0.8"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + qid + '" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="' + cfg.glow + '" stop-opacity="0.6"/>' +
        '<stop offset="100%" stop-color="' + cfg.glow + '" stop-opacity="0"/>' +
      '</radialGradient>' +
    '</defs>' +
    /* Крылья (позади) */
    rankWingsSVG(rankIdx, cfg) +
    /* Мягкое свечение внутри ромба */
    '<path d="M100 42 L158 100 L100 158 L42 100 Z" fill="url(#' + qid + ')"/>' +
    /* Внешний ромб */
    '<path d="M100 20 L180 100 L100 180 L20 100 Z" fill="url(#' + gid + ')" stroke="' + goldLine + '" stroke-width="2.5"/>' +
    /* Внутренний ромб (тёмный) */
    '<path d="M100 42 L158 100 L100 158 L42 100 Z" fill="url(#' + gid + 'i)" stroke="' + goldLine + '" stroke-width="2"/>' +
    /* Тонкая внутренняя обводка */
    '<path d="M100 52 L148 100 L100 148 L52 100 Z" fill="none" stroke="' + goldLine + '" stroke-width="0.8" opacity="0.5"/>' +
    /* Углы */
    rankCornersSVG(rankIdx, cfg) +
    /* Символ в центре */
    rankSymbolSVG(rankIdx, cfg);

  var doc = new DOMParser().parseFromString('<svg xmlns="' + ns + '" viewBox="0 0 200 200">' + svgStr + '</svg>', "image/svg+xml");
  var parsed = doc.documentElement;
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
        '<stop offset="0%" stop-color="#4a3f5a"/>' +
        '<stop offset="100%" stop-color="#0f0a18"/>' +
      '</linearGradient>' +
      '<radialGradient id="qglow" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.5"/>' +
        '<stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>' +
      '</radialGradient>' +
    '</defs>' +
    '<path d="M100 42 L158 100 L100 158 L42 100 Z" fill="url(#qglow)"/>' +
    '<path d="M100 20 L180 100 L100 180 L20 100 Z" fill="url(#qg)" stroke="#8b5cf6" stroke-width="2.5" stroke-dasharray="6 4"/>' +
    '<path d="M100 42 L158 100 L100 158 L42 100 Z" fill="#0b0c10" stroke="#8b5cf6" stroke-width="2" opacity="0.9"/>' +
    '<text x="100" y="122" text-anchor="middle" font-size="76" font-weight="900" fill="#8b5cf6" font-family="sans-serif" opacity="0.9">?</text>';

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
  medalWrap.appendChild(buildMedalSVG(medal.rankIdx, 150));
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
  box.style.cssText = "max-width:860px;width:100%;background:var(--bg-card);border:1px solid var(--accent);border-radius:18px;padding:26px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.7);max-height:88vh;overflow-y:auto;position:relative;";
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
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:14px;";

  for (var i = 0; i < RATING_TABLE.length; i++) {
    (function (idx) {
      var m = RATING_TABLE[idx];
      var tile = document.createElement("div");
      tile.style.cssText = "background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;padding:14px 10px;text-align:center;";
      tile.classList.add("rating-tile-anim");
      tile.style.animationDelay = (idx * 60) + "ms";

      var medalWrap = document.createElement("div");
      medalWrap.style.cssText = "display:flex;justify-content:center;";
      medalWrap.appendChild(buildMedalSVG(idx, 130));
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
    medalBox.appendChild(buildMedalSVG(medal.medal.rankIdx, 140));
  } else {
    medalBox.appendChild(buildQuestionMedalSVG(140));
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

console.log("rating v7.4 ready (feathered wings, glow, gold accents)");
