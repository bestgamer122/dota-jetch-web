/* DOTA JETCH — RATING v9.0
   SVG-иконки рангов в стиле Dota 2 (без CDN)
   - Ромбы с 3D-градиентом
   - Боковые крылья у каждого ранга
   - Внутренний символ уникальный для каждого ранга
   - Реальные цвета из игры */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0, d1: "#0d2818", d2: "#1a4a28", light: "#6ea850", accent: "#8ecf5c", hglow: "#a8e880", stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1, d1: "#2a2820", d2: "#4a4438", light: "#a89880", accent: "#c8b898", hglow: "#e8dcc0", stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2, d1: "#0a2028", d2: "#1a5060", light: "#3a8898", accent: "#5ab8d0", hglow: "#80e0f8", stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3, d1: "#0a2810", d2: "#1a5020", light: "#5aa840", accent: "#7ed050", hglow: "#a8e878", stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4, d1: "#2a0818", d2: "#500a2a", light: "#a03058", accent: "#d05880", hglow: "#f888a8", stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5, d1: "#1a0838", d2: "#301560", light: "#5a30a0", accent: "#8858c8", hglow: "#b888f0", stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",    ru: "Божество",  rankIdx: 6, d1: "#2a0808", d2: "#501010", light: "#b03030", accent: "#e05050", hglow: "#ff8080", stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal",  ru: "Титан",     rankIdx: 7, d1: "#08182a", d2: "#102a50", light: "#3070b0", accent: "#5890e0", hglow: "#88b8ff", stars: [5620, 5800, 6000, 6200, 6500] }
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
    ".rating-tile-anim{animation:ratingTileIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both}";
  document.head.appendChild(s);
}

/* ─── Форма ромба с "вырезами" ─── */
function diamondPath() {
  return "M100 10 L190 100 L100 190 L10 100 Z";
}
function innerDiamondPath() {
  return "M100 35 L165 100 L100 165 L35 100 Z";
}

/* ─── Боковые "рога" / шипы (для Рыцаря и выше) ─── */
function sideSpikes(rankIdx, cfg) {
  if (rankIdx < 2) return "";
  var a = cfg.accent;
  var len = 15 + rankIdx * 3;
  var op = 0.7 + rankIdx * 0.03;
  return '' +
    /* Левый */
    '<path d="M20 100 L' + (20 - len) + ' 90 L' + (20 - len) + ' 110 Z" fill="' + a + '" opacity="' + op + '"/>' +
    /* Правый */
    '<path d="M180 100 L' + (180 + len) + ' 90 L' + (180 + len) + ' 110 Z" fill="' + a + '" opacity="' + op + '"/>';
}

/* ─── Крылья (для высоких рангов, за ромбом) ─── */
function bigWings(rankIdx, cfg) {
  if (rankIdx < 4) return "";
  var a = cfg.accent;
  var hl = cfg.hglow;
  var wings = "";

  /* ЛАВРОВЫЕ крылья (Легенда, Властелин) — золото/цвет */
  var featherColor = cfg.light;
  var featherDark = cfg.d2;

  /* Сколько слоёв крыла */
  var layers = rankIdx - 3; /* Легенда=1, Властелин=2, Божество=3, Титан=4 */

  /* ЛЕВОЕ крыло */
  wings += '<g>';
  for (var i = 0; i < layers; i++) {
    var s = 1 - i * 0.15;
    var yOff = -18 + i * 12;
    var xStart = 55;
    var len = 45 + i * 5;
    wings += '<path d="M' + xStart + ' ' + (100 + yOff) + ' Q' + (xStart - len * 0.7) + ' ' + (100 + yOff - 8) + ' ' + (xStart - len) + ' ' + (100 + yOff + 4) + ' Q' + (xStart - len * 0.5) + ' ' + (100 + yOff + 10) + ' ' + xStart + ' ' + (100 + yOff + 8) + ' Z" fill="' + (i % 2 === 0 ? featherColor : featherDark) + '" opacity="' + (0.75 - i * 0.1) + '"/>';
    wings += '<path d="M' + xStart + ' ' + (100 + yOff) + ' L' + (xStart - len * 0.9) + ' ' + (100 + yOff - 2) + '" stroke="' + hl + '" stroke-width="1" opacity="0.5" fill="none"/>';
  }
  wings += '</g>';

  /* ПРАВОЕ крыло */
  wings += '<g>';
  for (var j = 0; j < layers; j++) {
    var s2 = 1 - j * 0.15;
    var yOff2 = -18 + j * 12;
    var xStart2 = 145;
    var len2 = 45 + j * 5;
    wings += '<path d="M' + xStart2 + ' ' + (100 + yOff2) + ' Q' + (xStart2 + len2 * 0.7) + ' ' + (100 + yOff2 - 8) + ' ' + (xStart2 + len2) + ' ' + (100 + yOff2 + 4) + ' Q' + (xStart2 + len2 * 0.5) + ' ' + (100 + yOff2 + 10) + ' ' + xStart2 + ' ' + (100 + yOff2 + 8) + ' Z" fill="' + (j % 2 === 0 ? featherColor : featherDark) + '" opacity="' + (0.75 - j * 0.1) + '"/>';
    wings += '<path d="M' + xStart2 + ' ' + (100 + yOff2) + ' L' + (xStart2 + len2 * 0.9) + ' ' + (100 + yOff2 - 2) + '" stroke="' + hl + '" stroke-width="1" opacity="0.5" fill="none"/>';
  }
  wings += '</g>';

  return wings;
}

/* ─── Символ внутри ромба ─── */
function rankSymbol(rankIdx, cfg) {
  var a = cfg.accent;
  var hl = cfg.hglow;
  var d1 = cfg.d1;

  /* 0 — РЕКРУТ: два листа Tango (зелёные) */
  if (rankIdx === 0) {
    return '' +
      '<path d="M100 95 Q92 78 78 80 Q82 92 94 100 Q84 106 84 120 Q94 116 100 106 Q106 116 116 120 Q116 106 106 100 Q118 92 122 80 Q108 78 100 95 Z" fill="' + a + '" stroke="' + hl + '" stroke-width="1"/>' +
      '<path d="M100 95 L100 78" stroke="' + hl + '" stroke-width="1.5" opacity="0.7" fill="none"/>' +
      '<circle cx="100" cy="76" r="2.5" fill="' + hl + '"/>';
  }

  /* 1 — СТРАЖ: Stout Shield (деревянный щит) */
  if (rankIdx === 1) {
    return '' +
      '<path d="M100 72 Q82 72 82 88 L82 100 Q82 116 100 124 Q118 116 118 100 L118 88 Q118 72 100 72 Z" fill="' + a + '" stroke="' + hl + '" stroke-width="1.5"/>' +
      '<path d="M100 78 Q88 78 88 90 L88 100 Q88 110 100 116 Q112 110 112 100 L112 90 Q112 78 100 78 Z" fill="' + d1 + '" opacity="0.6"/>' +
      /* Крест */
      '<line x1="100" y1="82" x2="100" y2="114" stroke="' + hl + '" stroke-width="2.5" opacity="0.85"/>' +
      '<line x1="88" y1="98" x2="112" y2="98" stroke="' + hl + '" stroke-width="2.5" opacity="0.85"/>';
  }

  /* 2 — РЫЦАРЬ: Ring of Aquila (кольцо с мечом-звездой) */
  if (rankIdx === 2) {
    return '' +
      '<circle cx="100" cy="100" r="22" fill="none" stroke="' + a + '" stroke-width="3.5"/>' +
      '<circle cx="100" cy="100" r="16" fill="none" stroke="' + hl + '" stroke-width="1" opacity="0.7"/>' +
      /* Меч по центру */
      '<path d="M100 82 L103 96 L103 108 L100 112 L97 108 L97 96 Z" fill="' + hl + '"/>' +
      /* Звёздочка */
      '<path d="M100 90 L101.5 95 L107 95 L102.5 98 L104 103 L100 100 L96 103 L97.5 98 L93 95 L98.5 95 Z" fill="' + a + '"/>' +
      /* Декоративные точки по сторонам */
      '<circle cx="100" cy="80" r="2" fill="' + hl + '"/>' +
      '<circle cx="100" cy="120" r="2" fill="' + hl + '"/>' +
      '<circle cx="80" cy="100" r="2" fill="' + hl + '"/>' +
      '<circle cx="120" cy="100" r="2" fill="' + hl + '"/>';
  }

  /* 3 — ГЕРОЙ: Eul's Scepter (посох с кристаллом) */
  if (rankIdx === 3) {
    return '' +
      '<rect x="97" y="94" width="6" height="40" fill="' + a + '" rx="2"/>' +
      /* Кристалл сверху */
      '<path d="M100 76 L110 90 L100 96 L90 90 Z" fill="' + hl + '" stroke="' + a + '" stroke-width="1.5"/>' +
      '<path d="M100 80 L105 88 L100 92 L95 88 Z" fill="#fff" opacity="0.4"/>' +
      /* Малые "крылья" посоха */
      '<path d="M86 90 Q78 86 82 96" stroke="' + a + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M114 90 Q122 86 118 96" stroke="' + a + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      /* Основание */
      '<ellipse cx="100" cy="136" rx="6" ry="2.5" fill="' + a + '"/>';
  }

  /* 4 — ЛЕГЕНДА: Black King Bar (молот) */
  if (rankIdx === 4) {
    return '' +
      '<rect x="97" y="90" width="6" height="42" fill="' + a + '" rx="2"/>' +
      /* Навершие */
      '<path d="M82 76 Q100 68 118 76 L118 90 Q100 96 82 90 Z" fill="' + a + '" stroke="' + hl + '" stroke-width="1.5"/>' +
      /* Светящееся ядро */
      '<circle cx="100" cy="83" r="5" fill="' + hl + '"/>' +
      '<circle cx="100" cy="83" r="2.5" fill="#fff" opacity="0.85"/>' +
      /* Ободок снизу */
      '<ellipse cx="100" cy="134" rx="6" ry="3" fill="' + a + '"/>';
  }

  /* 5 — ВЛАСТЕЛИН: Manta Style (три ромба — иллюзии) */
  if (rankIdx === 5) {
    return '' +
      /* Боковые (иллюзии) */
      '<path d="M82 100 L88 82 L94 100 L88 118 Z" fill="' + a + '" opacity="0.55"/>' +
      '<path d="M118 100 L112 82 L106 100 L112 118 Z" fill="' + a + '" opacity="0.55"/>' +
      /* Центральный (основной) */
      '<path d="M100 74 L120 100 L100 126 L80 100 Z" fill="' + a + '" stroke="' + hl + '" stroke-width="1.5"/>' +
      '<path d="M100 84 L112 100 L100 116 L88 100 Z" fill="' + d1 + '"/>' +
      '<path d="M100 92 L106 100 L100 108 L94 100 Z" fill="' + hl + '"/>' +
      /* Золотые точки по углам */
      '<circle cx="100" cy="74" r="2.5" fill="' + hl + '"/>' +
      '<circle cx="100" cy="126" r="2.5" fill="' + hl + '"/>' +
      '<circle cx="80" cy="100" r="2.5" fill="' + hl + '"/>' +
      '<circle cx="120" cy="100" r="2.5" fill="' + hl + '"/>';
  }

  /* 6 — БОЖЕСТВО: Divine Rapier (рапира с золотом) */
  if (rankIdx === 6) {
    return '' +
      /* Клинок */
      '<path d="M100 70 L103 84 L103 118 L97 118 L97 84 Z" fill="' + hl + '"/>' +
      '<path d="M100 70 L101.5 84 L101.5 118 L100 118 Z" fill="#fff" opacity="0.5"/>' +
      /* Гарда */
      '<rect x="88" y="118" width="24" height="4" fill="' + a + '" rx="2"/>' +
      '<circle cx="88" cy="120" r="2.5" fill="' + hl + '"/>' +
      '<circle cx="112" cy="120" r="2.5" fill="' + hl + '"/>' +
      /* Рукоять */
      '<rect x="97" y="122" width="6" height="12" fill="' + a + '" rx="2"/>' +
      /* Навершие */
      '<circle cx="100" cy="138" r="4" fill="' + hl + '"/>' +
      '<circle cx="100" cy="138" r="2" fill="#fff" opacity="0.8"/>';
  }

  /* 7 — ТИТАН: Aegis of the Immortal (щит с головой) */
  return '' +
    /* Щит */
    '<path d="M100 70 Q80 72 78 92 L78 108 Q78 122 100 130 Q122 122 122 108 L122 92 Q120 72 100 70 Z" fill="' + a + '" stroke="' + hl + '" stroke-width="1.5"/>' +
    '<path d="M100 76 Q86 78 84 94 L84 106 Q84 116 100 124 Q116 116 116 106 L116 94 Q114 78 100 76 Z" fill="' + d1 + '" opacity="0.55"/>' +
    /* Голова */
    '<circle cx="100" cy="98" r="9" fill="' + hl + '" opacity="0.9"/>' +
    '<circle cx="100" cy="98" r="6" fill="' + d1 + '" opacity="0.8"/>' +
    '<circle cx="97" cy="97" r="1.3" fill="' + hl + '"/>' +
    '<circle cx="103" cy="97" r="1.3" fill="' + hl + '"/>' +
    '<path d="M97 102 L100 105 L103 102" stroke="' + hl + '" stroke-width="1" fill="none"/>' +
    /* Лучи вокруг головы */
    '<line x1="100" y1="86" x2="100" y2="82" stroke="' + hl + '" stroke-width="1.5" stroke-linecap="round"/>' +
    '<line x1="88" y1="92" x2="85" y2="89" stroke="' + hl + '" stroke-width="1.5" stroke-linecap="round"/>' +
    '<line x1="112" y1="92" x2="115" y2="89" stroke="' + hl + '" stroke-width="1.5" stroke-linecap="round"/>';
}

function buildMedalSVG(rankIdx, size) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 8px " + cfg.hglow + "88);";

  var gid = "g" + rankIdx;
  var gid2 = "gi" + rankIdx;

  var svgStr = '' +
    '<defs>' +
      '<linearGradient id="' + gid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.light + '"/>' +
        '<stop offset="50%" stop-color="' + cfg.accent + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.d2 + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + gid2 + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.d2 + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.d1 + '"/>' +
      '</linearGradient>' +
      '<radialGradient id="glow' + rankIdx + '" cx="50%" cy="50%" r="50%">' +
        '<stop offset="0%" stop-color="' + cfg.hglow + '" stop-opacity="0.4"/>' +
        '<stop offset="100%" stop-color="' + cfg.hglow + '" stop-opacity="0"/>' +
      '</radialGradient>' +
    '</defs>' +
    /* Большие крылья (за ромбом) */
    bigWings(rankIdx, cfg) +
    /* Внешний ромб */
    '<path d="' + diamondPath() + '" fill="url(#' + gid + ')" stroke="' + cfg.hglow + '" stroke-width="1.5"/>' +
    /* Внутренний ромб */
    '<path d="' + innerDiamondPath() + '" fill="url(#' + gid2 + ')" stroke="' + cfg.accent + '" stroke-width="1.5"/>' +
    /* Свечение внутри */
    '<path d="' + innerDiamondPath() + '" fill="url(#glow' + rankIdx + ')"/>' +
    /* Боковые шипы */
    sideSpikes(rankIdx, cfg) +
    /* Символ в центре */
    rankSymbol(rankIdx, cfg);

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
      '<linearGradient id="qq1" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#4a3f5a"/>' +
        '<stop offset="100%" stop-color="#1a1226"/>' +
      '</linearGradient>' +
      '<linearGradient id="qq2" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#2a1e3a"/>' +
        '<stop offset="100%" stop-color="#0b0810"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<path d="M100 10 L190 100 L100 190 L10 100 Z" fill="url(#qq1)" stroke="#8b5cf6" stroke-width="2" stroke-dasharray="6 5"/>' +
    '<path d="M100 35 L165 100 L100 165 L35 100 Z" fill="url(#qq2)" stroke="#8b5cf6" stroke-width="1.5"/>' +
    '<text x="100" y="124" text-anchor="middle" font-size="80" font-weight="900" fill="#a78bfa" font-family="sans-serif">?</text>';

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
  box.style.cssText = "max-width:900px;width:100%;background:var(--bg-card);border:1px solid var(--accent);border-radius:18px;padding:26px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.7);max-height:88vh;overflow-y:auto;position:relative;";
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
      medalWrap.appendChild(buildMedalSVG(idx, 140));
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

console.log("rating v9.0 ready");
