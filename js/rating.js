/* DOTA JETCH — RATING v11.0 */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0, d: "#0d2a10", m: "#1e5a22", l: "#5ca03c", a: "#8ed468", g: "#c8f0a0", stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1, d: "#1c1c20", m: "#3a3a42", l: "#7a7a88", a: "#b0b0bc", g: "#e0e0e8", stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2, d: "#0a2630", m: "#1a5268", l: "#3894ac", a: "#5cc0dc", g: "#a8e8ff", stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3, d: "#0a2810", m: "#1a5a20", l: "#529c30", a: "#7ecc50", g: "#b8f088", stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4, d: "#2a0810", m: "#6a1028", l: "#b03058", a: "#e05878", g: "#ff90a8", stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5, d: "#1c0a3a", m: "#401a78", l: "#7a48c0", a: "#a87ee0", g: "#d0b0ff", stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",    ru: "Божество",  rankIdx: 6, d: "#2a0808", m: "#701818", l: "#b83838", a: "#e06060", g: "#ff9898", stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal",  ru: "Титан",     rankIdx: 7, d: "#0a1a38", m: "#1a4878", l: "#3880c0", a: "#60a8e8", g: "#a0d0ff", stars: [5620, 5800, 6000, 6200, 6500] }
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

/* ─── ГЛАВНЫЙ СИЛУЭТ (одна замкнутая форма — щит с короной) ─── */
function mainShieldPath() {
  /* Единая форма:
     - сверху 3-пиковая корона
     - с боков плавно переходит в широкий ромб
     - снизу острый кончик V
  */
  return [
    "M 22 92",           // левый нижний угол короны
    "L 42 72",           // левый пик
    "L 60 82",           // левая впадина
    "L 80 66",           // средний левый пик
    "L 100 60",          // центральный верх
    "L 120 66",          // средний правый пик
    "L 140 82",          // правая впадина
    "L 158 72",          // правый пик
    "L 178 92",          // правый нижний угол короны
    "L 178 102",         // вниз
    "L 100 178",         // главный нижний угол (ромб)
    "L 22 102",          // левый нижний угол ромба
    "Z"
  ].join(" ");
}

/* ─── ВНУТРЕННИЙ РОМБ (щит) ─── */
function innerDiamondPath() {
  return "M 100 72 L 162 122 L 100 168 L 38 122 Z";
}

/* ─── БОКОВЫЕ КРЫЛЬЯ (перья) ─── */
function sideFeathers(rankIdx, cfg) {
  if (rankIdx < 2) return "";
  var a = cfg.a;
  var g = cfg.g;
  var opacity = 0.65 + rankIdx * 0.03;
  var levels = Math.min(rankIdx, 4);
  var out = "";

  /* Левое крыло */
  out += '<g opacity="' + opacity.toFixed(2) + '">';
  for (var i = 0; i < levels; i++) {
    var yStart = 88 + i * 14;
    var xStart = 30 - i * 3;
    var xEnd = 4 - i * 2;
    var yCurve = yStart - 6;
    var yEnd = yStart + 8;
    out += '<path d="M ' + xStart + ' ' + yStart + ' Q ' + (xStart - 12) + ' ' + yCurve + ' ' + xEnd + ' ' + (yStart + 4) + ' Q ' + (xStart - 14) + ' ' + (yStart + 6) + ' ' + xStart + ' ' + yEnd + ' Z" fill="' + (i % 2 === 0 ? a : cfg.l) + '"/>';
    out += '<line x1="' + xStart + '" y1="' + (yStart + 4) + '" x2="' + xEnd + '" y2="' + (yStart + 4) + '" stroke="' + g + '" stroke-width="0.8" opacity="0.6"/>';
  }
  out += '</g>';

  /* Правое крыло (зеркально) */
  out += '<g opacity="' + opacity.toFixed(2) + '">';
  for (var j = 0; j < levels; j++) {
    var yS = 88 + j * 14;
    var xS = 170 + j * 3;
    var xE = 196 + j * 2;
    var yC = yS - 6;
    var yE = yS + 8;
    out += '<path d="M ' + xS + ' ' + yS + ' Q ' + (xS + 12) + ' ' + yC + ' ' + xE + ' ' + (yS + 4) + ' Q ' + (xS + 14) + ' ' + (yS + 6) + ' ' + xS + ' ' + yE + ' Z" fill="' + (j % 2 === 0 ? a : cfg.l) + '"/>';
    out += '<line x1="' + xS + '" y1="' + (yS + 4) + '" x2="' + xE + '" y2="' + (yS + 4) + '" stroke="' + g + '" stroke-width="0.8" opacity="0.6"/>';
  }
  out += '</g>';

  return out;
}

/* ─── 4 РОМБИКА ПО УГЛАМ ─── */
function cornerDiamonds(cfg) {
  var positions = [
    { x: 100, y: 78, c: cfg.g },
    { x: 156, y: 122, c: cfg.a },
    { x: 100, y: 162, c: cfg.g },
    { x: 44, y: 122, c: cfg.a }
  ];
  var out = "";
  for (var i = 0; i < positions.length; i++) {
    var p = positions[i];
    var sz = 5;
    out += '<path d="M ' + p.x + ' ' + (p.y - sz) + ' L ' + (p.x + sz) + ' ' + p.y + ' L ' + p.x + ' ' + (p.y + sz) + ' L ' + (p.x - sz) + ' ' + p.y + ' Z" fill="' + p.c + '" stroke="' + cfg.d + '" stroke-width="0.8"/>';
  }
  return out;
}

/* ─── СИМВОЛ В ЦЕНТРЕ ─── */
function rankSymbol(rankIdx, cfg) {
  var a = cfg.a;
  var g = cfg.g;
  var d = cfg.d;

  /* 0 — Рекрут: три листа (Tango) */
  if (rankIdx === 0) {
    return '' +
      '<path d="M100 90 Q94 78 84 82 Q90 94 98 100 Q84 100 84 112 Q94 108 100 102 Q106 108 116 112 Q116 100 102 100 Q110 94 116 82 Q106 78 100 90 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1"/>' +
      '<line x1="100" y1="90" x2="100" y2="78" stroke="' + g + '" stroke-width="1.5"/>';
  }
  /* 1 — Страж: щит с крестом */
  if (rankIdx === 1) {
    return '' +
      '<path d="M100 78 Q82 80 80 96 L80 110 Q80 124 100 130 Q120 124 120 110 L120 96 Q118 80 100 78 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.2"/>' +
      '<line x1="100" y1="86" x2="100" y2="122" stroke="' + g + '" stroke-width="3"/>' +
      '<line x1="84" y1="104" x2="116" y2="104" stroke="' + g + '" stroke-width="3"/>' +
      '<circle cx="100" cy="104" r="2" fill="' + d + '"/>';
  }
  /* 2 — Рыцарь: кольцо с 4 лучами */
  if (rankIdx === 2) {
    return '' +
      '<circle cx="100" cy="104" r="17" fill="none" stroke="' + a + '" stroke-width="3"/>' +
      '<circle cx="100" cy="104" r="10" fill="none" stroke="' + a + '" stroke-width="1.2" opacity="0.6"/>' +
      '<path d="M100 92 L103 101 L112 104 L103 107 L100 116 L97 107 L88 104 L97 101 Z" fill="' + g + '"/>' +
      '<circle cx="100" cy="104" r="2.5" fill="' + d + '"/>';
  }
  /* 3 — Герой: посох с кристаллом-ромбом */
  if (rankIdx === 3) {
    return '' +
      '<path d="M100 74 L110 86 L100 94 L90 86 Z" fill="' + g + '" stroke="' + a + '" stroke-width="1.2"/>' +
      '<path d="M100 78 L105 86 L100 90 L95 86 Z" fill="#fff" opacity="0.5"/>' +
      '<rect x="97" y="94" width="6" height="36" fill="' + a + '" rx="2"/>' +
      '<ellipse cx="100" cy="134" rx="5" ry="2" fill="' + a + '"/>' +
      '<circle cx="100" cy="146" r="3" fill="' + g + '"/>';
  }
  /* 4 — Легенда: молот */
  if (rankIdx === 4) {
    return '' +
      '<path d="M86 82 Q100 76 114 82 L114 94 Q100 100 86 94 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.2"/>' +
      '<circle cx="100" cy="88" r="4" fill="' + g + '"/>' +
      '<circle cx="100" cy="88" r="1.8" fill="#fff"/>' +
      '<rect x="97" y="94" width="6" height="38" fill="' + a + '" rx="2"/>' +
      '<ellipse cx="100" cy="136" rx="5" ry="2.5" fill="' + a + '"/>';
  }
  /* 5 — Властелин: 3 ромба (Manta) */
  if (rankIdx === 5) {
    return '' +
      '<path d="M84 104 L92 86 L100 104 L92 122 Z" fill="' + a + '" opacity="0.5"/>' +
      '<path d="M116 104 L108 86 L100 104 L108 122 Z" fill="' + a + '" opacity="0.5"/>' +
      '<path d="M100 82 L118 104 L100 126 L82 104 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.2"/>' +
      '<path d="M100 90 L110 104 L100 118 L90 104 Z" fill="' + d + '" opacity="0.6"/>' +
      '<path d="M100 96 L105 104 L100 112 L95 104 Z" fill="' + g + '"/>';
  }
  /* 6 — Божество: рапира */
  if (rankIdx === 6) {
    return '' +
      '<path d="M100 74 L103 88 L103 118 L97 118 L97 88 Z" fill="' + g + '"/>' +
      '<path d="M100 74 L101.5 88 L101.5 118 L100 118 Z" fill="#fff" opacity="0.6"/>' +
      '<rect x="86" y="118" width="28" height="4" fill="' + a + '" rx="2"/>' +
      '<circle cx="86" cy="120" r="2.5" fill="' + g + '"/>' +
      '<circle cx="114" cy="120" r="2.5" fill="' + g + '"/>' +
      '<rect x="97" y="122" width="6" height="12" fill="' + a + '" rx="2"/>' +
      '<circle cx="100" cy="140" r="3.5" fill="' + g + '"/>' +
      '<circle cx="100" cy="140" r="1.5" fill="#fff"/>';
  }
  /* 7 — Титан: голова в щите (Aegis) */
  return '' +
    '<path d="M100 78 Q82 80 80 98 L80 112 Q80 124 100 132 Q120 124 120 112 L120 98 Q118 80 100 78 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.2"/>' +
    '<circle cx="100" cy="104" r="10" fill="' + g + '" opacity="0.9"/>' +
    '<circle cx="100" cy="104" r="6.5" fill="' + d + '" opacity="0.85"/>' +
    '<circle cx="97" cy="103" r="1.5" fill="' + g + '"/>' +
    '<circle cx="103" cy="103" r="1.5" fill="' + g + '"/>' +
    '<path d="M97 108 L100 111 L103 108" stroke="' + g + '" stroke-width="1" fill="none"/>' +
    '<line x1="100" y1="88" x2="100" y2="84" stroke="' + g + '" stroke-width="1.5" stroke-linecap="round"/>' +
    '<line x1="88" y1="94" x2="85" y2="91" stroke="' + g + '" stroke-width="1.5" stroke-linecap="round"/>' +
    '<line x1="112" y1="94" x2="115" y2="91" stroke="' + g + '" stroke-width="1.5" stroke-linecap="round"/>';
}

function buildMedalSVG(rankIdx, size) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 8px " + cfg.g + "88);";

  var gid = "g" + rankIdx;
  var gidIn = "gi" + rankIdx;

  var svgStr = '' +
    '<defs>' +
      /* Градиент главной формы */
      '<linearGradient id="' + gid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.l + '"/>' +
        '<stop offset="50%" stop-color="' + cfg.a + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.m + '"/>' +
      '</linearGradient>' +
      /* Градиент внутреннего ромба */
      '<linearGradient id="' + gidIn + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.m + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.d + '"/>' +
      '</linearGradient>' +
    '</defs>' +
    /* 1. Боковые перья (позади) */
    sideFeathers(rankIdx, cfg) +
    /* 2. Главный силуэт (корона + ромб + V) */
    '<path d="' + mainShieldPath() + '" fill="url(#' + gid + ')" stroke="' + cfg.g + '" stroke-width="1.5" stroke-linejoin="round"/>' +
    /* 3. Внутренний ромб */
    '<path d="' + innerDiamondPath() + '" fill="url(#' + gidIn + ')" stroke="' + cfg.a + '" stroke-width="1.2"/>' +
    /* 4. Тонкая внутренняя обводка ромба */
    '<path d="M100 82 L150 122 L100 158 L50 122 Z" fill="none" stroke="' + cfg.g + '" stroke-width="0.6" opacity="0.45"/>' +
    /* 5. Ромбики по углам */
    cornerDiamonds(cfg) +
    /* 6. Символ */
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
    '<path d="' + mainShieldPath() + '" fill="url(#qa)" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="5 4" stroke-linejoin="round"/>' +
    '<path d="' + innerDiamondPath() + '" fill="url(#qai)" stroke="#8b5cf6" stroke-width="1.2"/>' +
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

console.log("rating v11.0 ready");
