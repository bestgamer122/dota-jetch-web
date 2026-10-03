/* DOTA JETCH — RATING v13.0
   Финальная версия иконок рангов:
   - Крылья: аккуратные, не накладываются на ромб (от Рыцаря и выше)
   - Цвета: по Dota 2 (Титан — красно-золотой, не просто золото)
   - Титан: щит Aegis с мраморной головой, БЕЗ черепных черт
   - Символы: Tango, Stout, Aquila, Eul's, BKB, Manta, Rapier, Aegis */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0, d: "#0a2810", m: "#1e6025", l: "#5aa83a", a: "#8ed468", g: "#c8f0a0", stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1, d: "#1c1c20", m: "#4a4a52", l: "#90909a", a: "#c0c0c8", g: "#e8e8f0", stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2, d: "#0a2630", m: "#1a5268", l: "#3a96b0", a: "#60c0d8", g: "#a8ecff", stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3, d: "#0a2810", m: "#1e6a20", l: "#5cb838", a: "#88d858", g: "#b8f088", stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4, d: "#1a0a3a", m: "#3a1a70", l: "#7040c8", a: "#9870e8", g: "#c8a8ff", stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5, d: "#0a1a3a", m: "#1a4070", l: "#3880c8", a: "#60a8e8", g: "#a0d0ff", stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",    ru: "Божество",  rankIdx: 6, d: "#2a0808", m: "#701818", l: "#c83838", a: "#e86868", g: "#ffa0a0", stars: [4620, 4820, 5020, 5220, 5420] },
  /* Титан — красно-золотой: тёмно-красная основа + золотые акценты */
  { name: "Immortal",  ru: "Титан",     rankIdx: 7, d: "#2a0808", m: "#7a1414", l: "#c03028", a: "#e85040", g: "#ffd060", gold: "#fbbf24", stars: [5620, 5800, 6000, 6200, 6500] }
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

/* ─── Боковые перья: аккуратные, ПОВЕРХ внешнего ромба, не залезают на символ ─── */
function sideFeathers(rankIdx, cfg) {
  if (rankIdx < 2) return ""; /* только от Рыцаря и выше */
  var a = cfg.a;
  var l = cfg.l;
  var g = cfg.g;
  var opacity = Math.min(0.95, 0.55 + rankIdx * 0.05);
  var levels = Math.min(rankIdx - 1, 4); /* 1..4: Рыцарь=1, Титан=4 */
  var out = "";

  /* ЛЕВОЕ крыло — начинается от левого угла внешнего ромба (40,100) и уходит наружу */
  out += '<g opacity="' + opacity.toFixed(2) + '">';
  for (var i = 0; i < levels; i++) {
    var yS = 88 + i * 12;         /* начало по вертикали */
    var xS = 38 - i * 1;          /* чуть левее ромба */
    var xE = 4 - i * 1.5;         /* конец — далеко влево */
    out += '<path d="M ' + xS + ' ' + yS +
      ' Q ' + (xS - 12) + ' ' + (yS - 8) + ' ' + xE + ' ' + (yS - 3) +
      ' Q ' + (xS - 14) + ' ' + (yS + 5) + ' ' + xS + ' ' + (yS + 7) + ' Z" fill="' + (i % 2 === 0 ? a : l) + '"/>';
    out += '<path d="M ' + xS + ' ' + (yS + 3) + ' L ' + (xE + 3) + ' ' + (yS - 1) + '" stroke="' + g + '" stroke-width="0.8" opacity="0.65" fill="none"/>';
  }
  out += '</g>';

  /* ПРАВОЕ крыло — зеркально */
  out += '<g opacity="' + opacity.toFixed(2) + '">';
  for (var j = 0; j < levels; j++) {
    var yS2 = 88 + j * 12;
    var xS2 = 162 + j * 1;
    var xE2 = 196 + j * 1.5;
    out += '<path d="M ' + xS2 + ' ' + yS2 +
      ' Q ' + (xS2 + 12) + ' ' + (yS2 - 8) + ' ' + xE2 + ' ' + (yS2 - 3) +
      ' Q ' + (xS2 + 14) + ' ' + (yS2 + 5) + ' ' + xS2 + ' ' + (yS2 + 7) + ' Z" fill="' + (j % 2 === 0 ? a : l) + '"/>';
    out += '<path d="M ' + xS2 + ' ' + (yS2 + 3) + ' L ' + (xE2 - 3) + ' ' + (yS2 - 1) + '" stroke="' + g + '" stroke-width="0.8" opacity="0.65" fill="none"/>';
  }
  out += '</g>';

  return out;
}

/* ─── Угловые пики (маленькие ромбики на остриях внешнего ромба) ─── */
function cornerSpikes(cfg) {
  var a = cfg.a;
  var g = cfg.g;
  var goldEdge = cfg.gold || g;
  return '' +
    '<path d="M100 18 L110 42 L100 48 L90 42 Z" fill="' + a + '"/>' +
    '<path d="M100 18 L105 38 L100 42 L95 38 Z" fill="' + goldEdge + '" opacity="0.75"/>' +
    '<path d="M100 182 L110 158 L100 152 L90 158 Z" fill="' + a + '"/>' +
    '<path d="M100 182 L105 162 L100 158 L95 162 Z" fill="' + goldEdge + '" opacity="0.75"/>' +
    '<path d="M18 100 L42 90 L48 100 L42 110 Z" fill="' + a + '"/>' +
    '<path d="M18 100 L38 95 L42 100 L38 105 Z" fill="' + goldEdge + '" opacity="0.75"/>' +
    '<path d="M182 100 L158 90 L152 100 L158 110 Z" fill="' + a + '"/>' +
    '<path d="M182 100 L162 95 L158 100 L162 105 Z" fill="' + goldEdge + '" opacity="0.75"/>';
}

/* ─── 4 ромбика на углах внутреннего ромба ─── */
function innerCorners(cfg) {
  var g = cfg.g;
  var d = cfg.d;
  var pts = [
    { x: 100, y: 80, c: g },
    { x: 148, y: 122, c: g },
    { x: 100, y: 164, c: g },
    { x: 52, y: 122, c: g }
  ];
  var out = "";
  for (var i = 0; i < pts.length; i++) {
    var p = pts[i];
    out += '<path d="M ' + p.x + ' ' + (p.y - 4) + ' L ' + (p.x + 4) + ' ' + p.y + ' L ' + p.x + ' ' + (p.y + 4) + ' L ' + (p.x - 4) + ' ' + p.y + ' Z" fill="' + p.c + '" stroke="' + d + '" stroke-width="0.6"/>';
  }
  return out;
}

/* ─── Символ предмета в центре ─── */
function rankSymbol(rankIdx, cfg) {
  var a = cfg.a;
  var g = cfg.g;
  var d = cfg.d;
  var gold = cfg.gold || null;

  /* 0 — Рекрут: Tango (зелёные листья) */
  if (rankIdx === 0) {
    return '' +
      '<path d="M100 88 Q92 74 80 78 Q86 92 98 100 Q82 102 82 116 Q92 112 100 104 Q108 112 118 116 Q118 102 102 100 Q114 92 120 78 Q108 74 100 88 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1"/>' +
      '<line x1="100" y1="88" x2="100" y2="74" stroke="' + g + '" stroke-width="1.5"/>' +
      '<circle cx="100" cy="72" r="2" fill="' + g + '"/>';
  }
  /* 1 — Страж: Stout Shield (деревянный щит с крестом и заклёпками) */
  if (rankIdx === 1) {
    return '' +
      '<path d="M100 76 Q80 78 78 96 L78 110 Q78 124 100 132 Q122 124 122 110 L122 96 Q120 78 100 76 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.4"/>' +
      '<path d="M100 84 Q88 86 87 98 L87 108 Q87 118 100 124 Q113 118 113 108 L113 98 Q112 86 100 84 Z" fill="' + d + '" opacity="0.5"/>' +
      '<line x1="100" y1="86" x2="100" y2="124" stroke="' + g + '" stroke-width="3"/>' +
      '<line x1="84" y1="104" x2="116" y2="104" stroke="' + g + '" stroke-width="3"/>' +
      '<circle cx="84" cy="86" r="1.8" fill="' + g + '"/>' +
      '<circle cx="116" cy="86" r="1.8" fill="' + g + '"/>' +
      '<circle cx="84" cy="122" r="1.8" fill="' + g + '"/>' +
      '<circle cx="116" cy="122" r="1.8" fill="' + g + '"/>';
  }
  /* 2 — Рыцарь: Ring of Aquila (кольцо с орлом) */
  if (rankIdx === 2) {
    return '' +
      '<circle cx="100" cy="104" r="20" fill="none" stroke="' + a + '" stroke-width="3.5"/>' +
      '<circle cx="100" cy="104" r="14" fill="none" stroke="' + g + '" stroke-width="1" opacity="0.6"/>' +
      '<path d="M100 90 L96 98 L86 98 L92 104 L88 114 L100 108 L112 114 L108 104 L114 98 L104 98 Z" fill="' + g + '"/>' +
      '<circle cx="100" cy="104" r="2" fill="' + d + '"/>' +
      '<circle cx="100" cy="84" r="2" fill="' + g + '"/>' +
      '<circle cx="100" cy="124" r="2" fill="' + g + '"/>' +
      '<circle cx="80" cy="104" r="2" fill="' + g + '"/>' +
      '<circle cx="120" cy="104" r="2" fill="' + g + '"/>';
  }
  /* 3 — Герой: Eul's Scepter (посох с кристаллом) */
  if (rankIdx === 3) {
    return '' +
      '<path d="M100 72 L112 88 L100 98 L88 88 Z" fill="' + g + '" stroke="' + a + '" stroke-width="1.5"/>' +
      '<path d="M100 76 L106 88 L100 94 L94 88 Z" fill="#fff" opacity="0.55"/>' +
      '<rect x="96" y="98" width="8" height="34" fill="' + a + '" rx="2"/>' +
      '<path d="M82 88 Q76 84 78 96" stroke="' + a + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<path d="M118 88 Q124 84 122 96" stroke="' + a + '" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="134" rx="6" ry="2.5" fill="' + a + '"/>';
  }
  /* 4 — Легенда: Black King Bar (молот с светящимся ядром) */
  if (rankIdx === 4) {
    return '' +
      '<rect x="96" y="98" width="8" height="36" fill="' + a + '" rx="2"/>' +
      '<path d="M84 82 Q100 74 116 82 L116 96 Q100 102 84 96 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.4"/>' +
      '<circle cx="100" cy="88" r="4.5" fill="' + g + '"/>' +
      '<circle cx="100" cy="88" r="2" fill="#fff"/>' +
      '<ellipse cx="100" cy="134" rx="6" ry="2.5" fill="' + a + '"/>';
  }
  /* 5 — Властелин: Manta Style (3 ромба — иллюзии) */
  if (rankIdx === 5) {
    return '' +
      '<path d="M78 104 L86 88 L94 104 L86 120 Z" fill="' + a + '" opacity="0.5"/>' +
      '<path d="M122 104 L114 88 L106 104 L114 120 Z" fill="' + a + '" opacity="0.5"/>' +
      '<path d="M100 82 L120 104 L100 126 L80 104 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.4"/>' +
      '<path d="M100 90 L110 104 L100 118 L90 104 Z" fill="' + d + '" opacity="0.65"/>' +
      '<path d="M100 96 L105 104 L100 112 L95 104 Z" fill="' + g + '"/>';
  }
  /* 6 — Божество: Divine Rapier (рапира с золотой гардой) */
  if (rankIdx === 6) {
    return '' +
      '<path d="M100 72 L103 86 L103 118 L97 118 L97 86 Z" fill="' + g + '"/>' +
      '<path d="M100 72 L101.5 86 L101.5 118 L100 118 Z" fill="#fff" opacity="0.55"/>' +
      '<rect x="86" y="118" width="28" height="4" fill="' + a + '" rx="2"/>' +
      '<circle cx="86" cy="120" r="2.5" fill="' + g + '"/>' +
      '<circle cx="114" cy="120" r="2.5" fill="' + g + '"/>' +
      '<rect x="97" y="122" width="6" height="12" fill="' + a + '" rx="2"/>' +
      '<circle cx="100" cy="140" r="3.5" fill="' + g + '"/>' +
      '<circle cx="100" cy="140" r="1.5" fill="#fff"/>';
  }
  /* 7 — Титан: Aegis of the Immortal (щит с мраморной ГОЛОВОЙ, БЕЗ черепа) */
  var goldStroke = gold || g;
  return '' +
    /* Щит Aegis */
    '<path d="M100 76 Q78 78 76 98 L76 114 Q76 128 100 136 Q124 128 124 114 L124 98 Q122 78 100 76 Z" fill="' + a + '" stroke="' + goldStroke + '" stroke-width="1.6"/>' +
    '<path d="M100 82 Q86 84 84 100 L84 112 Q84 122 100 128 Q116 122 116 112 L116 100 Q114 84 100 82 Z" fill="' + d + '" opacity="0.55"/>' +
    /* МРАМОРНАЯ ГОЛОВА — овал + мягкие черты лица */
    '<ellipse cx="100" cy="102" rx="10" ry="12" fill="' + g + '" opacity="0.95"/>' +
    '<ellipse cx="100" cy="102" rx="8" ry="10" fill="' + d + '" opacity="0.55"/>' +
    /* Глаза — закрытые (мраморная статуя) */
    '<path d="M95 100 Q97 102 99 100" stroke="' + goldStroke + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
    '<path d="M101 100 Q103 102 105 100" stroke="' + goldStroke + '" stroke-width="1.2" fill="none" stroke-linecap="round"/>' +
    /* Лёгкая линия рта */
    '<path d="M97 109 L103 109" stroke="' + goldStroke + '" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.7"/>' +
    /* Крылья Aegis (маленькие, по бокам головы) */
    '<path d="M90 96 Q84 90 82 96 Q86 100 90 100" fill="' + g + '" opacity="0.7"/>' +
    '<path d="M110 96 Q116 90 118 96 Q114 100 110 100" fill="' + g + '" opacity="0.7"/>' +
    /* Лучи славы вокруг головы */
    '<line x1="100" y1="88" x2="100" y2="85" stroke="' + goldStroke + '" stroke-width="1.4" stroke-linecap="round"/>' +
    '<line x1="90" y1="90" x2="88" y2="87" stroke="' + goldStroke + '" stroke-width="1.2" stroke-linecap="round"/>' +
    '<line x1="110" y1="90" x2="112" y2="87" stroke="' + goldStroke + '" stroke-width="1.2" stroke-linecap="round"/>';
}

function buildMedalSVG(rankIdx, size) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  var glowColor = cfg.gold || cfg.g;
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 8px " + glowColor + "88);";

  var gid = "g" + rankIdx;
  var gidIn = "gi" + rankIdx;
  var strokeOuter = cfg.gold || cfg.g;

  var svgStr = '' +
    '<defs>' +
      '<linearGradient id="' + gid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.l + '"/>' +
        '<stop offset="50%" stop-color="' + cfg.a + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.m + '"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + gidIn + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.m + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.d + '"/>' +
      '</linearGradient>' +
    '</defs>' +
    /* 1. Боковые перья (за ромбом — они начинаются сразу у края ромба) */
    sideFeathers(rankIdx, cfg) +
    /* 2. Угловые пики */
    cornerSpikes(cfg) +
    /* 3. Внешний ромб */
    '<path d="M100 40 L160 100 L100 160 L40 100 Z" fill="url(#' + gid + ')" stroke="' + strokeOuter + '" stroke-width="1.5"/>' +
    /* 4. Внутренний ромб */
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + gidIn + ')" stroke="' + cfg.a + '" stroke-width="1.2"/>' +
    /* 5. Тонкая обводка внутреннего ромба */
    '<path d="M100 68 L136 100 L100 132 L64 100 Z" fill="none" stroke="' + strokeOuter + '" stroke-width="0.7" opacity="0.55"/>' +
    /* 6. Ромбики по углам */
    innerCorners(cfg) +
    /* 7. Символ предмета */
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
      '<linearGradient id="qa" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#4a3a5a"/>' +
        '<stop offset="100%" stop-color="#1a1226"/>' +
      '</linearGradient>' +
      '<linearGradient id="qai" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#2a1e3a"/>' +
        '<stop offset="100%" stop-color="#0b0810"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<path d="M100 40 L160 100 L100 160 L40 100 Z" fill="url(#qa)" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="5 4"/>' +
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#qai)" stroke="#8b5cf6" stroke-width="1.2"/>' +
    '<text x="100" y="122" text-anchor="middle" font-size="64" font-weight="900" fill="#a78bfa" font-family="sans-serif">?</text>';

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
  box.style.cssText = "max-width:380px;width:100%;background:var(--bg-card);border:1px solid " + medal.a + ";border-radius:18px;padding:28px 24px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.7);text-align:center;";
  box.classList.add("rating-box-anim");

  var head = document.createElement("div");
  head.style.cssText = "font-size:14px;font-weight:700;letter-spacing:0.12em;color:" + medal.a + ";text-transform:uppercase;margin-bottom:18px;";
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
    star.style.cssText = "font-size:16px;color:" + (s < stars ? medal.a : "var(--border)") + ";";
    star.textContent = "★";
    starsRow.appendChild(star);
  }
  box.appendChild(starsRow);

  var rankName = document.createElement("div");
  rankName.style.cssText = "font-size:26px;font-weight:900;color:" + medal.a + ";margin-top:16px;";
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
  btn.style.cssText = "margin-top:20px;padding:12px 24px;border-radius:10px;background:" + medal.a + ";color:#0b0c10;border:none;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;";
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
      name.style.cssText = "font-size:14px;font-weight:800;color:" + m.a + ";margin-top:8px;";
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
        st.style.cssText = "font-size:10px;color:" + m.a + ";";
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
    var rankName = el("div", { style: "font-size:24px;font-weight:900;color:" + medal.medal.a + ";" });
    rankName.textContent = medal.medal.ru;
    info.appendChild(rankName);

    var starsRow = el("div", { style: "display:flex;gap:3px;margin-top:6px;" });
    for (var s = 0; s < 5; s++) {
      var star = el("span", { style: "font-size:12px;color:" + (s < medal.stars ? medal.medal.a : "var(--border)") + ";" }, "★");
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
      var fill = el("div", { style: "height:100%;width:" + pct + "%;background:linear-gradient(90deg," + medal.medal.a + ",var(--cyan));border-radius:3px;transition:width 0.6s ease;" });
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

console.log("rating v13.0 ready (fixed wings, red-gold Immortal, Aegis head)");
