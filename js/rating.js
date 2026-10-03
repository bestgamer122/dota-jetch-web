/* DOTA JETCH — RATING v10.0
   Форма иконок Dota 2:
   - Верхняя "корона" с заострёнными углами
   - Основной ромб с 4 ромбиками по углам
   - Боковые "крылья"
   - Острый V-кончик снизу
   + уникальный символ у каждого ранга */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0, dark: "#0a2210", mid: "#2a5a20", light: "#6ea84a", accent: "#a8e06a", glow: "#d8ffa0", stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1, dark: "#1a1a1c", mid: "#4a4a50", light: "#8a8a92", accent: "#c0c0c8", glow: "#e8e8f0", stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2, dark: "#0a2838", mid: "#1a5a70", light: "#3a9eb8", accent: "#60c8e0", glow: "#a8ecff", stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3, dark: "#0a3010", mid: "#2a6a20", light: "#5aa83a", accent: "#88d058", glow: "#b8f088", stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4, dark: "#3a0818", mid: "#7a1a38", light: "#c04070", accent: "#e87098", glow: "#ffa8c0", stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5, dark: "#2a1058", mid: "#5a2aa0", light: "#8858d0", accent: "#b088e8", glow: "#d8b8ff", stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",    ru: "Божество",  rankIdx: 6, dark: "#3a0818", mid: "#8a1a28", light: "#c04848", accent: "#e87878", glow: "#ffb0b0", stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal",  ru: "Титан",     rankIdx: 7, dark: "#0a2048", mid: "#2058a0", light: "#4890d8", accent: "#78b8f0", glow: "#b0d8ff", stars: [5620, 5800, 6000, 6200, 6500] }
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

/* ─── Верхняя "корона" с заострёнными углами ─── */
function topCrownPath() {
  /* Горизонтальная фигура сверху, как в Dota 2 */
  return "M35 68 L50 60 L68 52 L85 58 L100 48 L115 58 L132 52 L150 60 L165 68 L172 82 L28 82 Z";
}

/* ─── Основной ромб (щит) ─── */
function mainDiamondPath() {
  return "M100 68 L162 118 L100 172 L38 118 Z";
}

/* ─── Нижний V-кончик ─── */
function bottomSpikePath() {
  return "M78 168 L100 195 L122 168 L114 168 L100 180 L86 168 Z";
}

/* ─── Боковые "крылья" — острые выступы ─── */
function sideWings(rankIdx, cfg) {
  var a = cfg.accent;
  var hl = cfg.glow;
  var intensity = 0.7 + rankIdx * 0.04;

  /* Два уровня крыльев, как в Dota 2 */
  return '' +
    /* Верхние углы короны */
    '<path d="M35 68 L20 62 L30 78 L22 84 L38 82 Z" fill="' + a + '" opacity="' + intensity + '"/>' +
    '<path d="M165 68 L180 62 L170 78 L178 84 L162 82 Z" fill="' + a + '" opacity="' + intensity + '"/>' +
    /* Боковые "шипы" вдоль ромба (для высоких рангов) */
    (rankIdx >= 3 ?
      '<path d="M38 118 L15 110 L25 125 L15 140 L38 130 Z" fill="' + a + '" opacity="' + (intensity - 0.1).toFixed(2) + '"/>' +
      '<path d="M162 118 L185 110 L175 125 L185 140 L162 130 Z" fill="' + a + '" opacity="' + (intensity - 0.1).toFixed(2) + '"/>' : '') +
    /* Уровень "перьев" для высоких */
    (rankIdx >= 5 ?
      '<path d="M30 90 L8 82 L18 96 L8 108 L32 102 Z" fill="' + hl + '" opacity="0.6"/>' +
      '<path d="M170 90 L192 82 L182 96 L192 108 L168 102 Z" fill="' + hl + '" opacity="0.6"/>' : '');
}

/* ─── 4 маленьких ромбика по углам главного ромба ─── */
function cornerDots(cfg, isActive) {
  var colors = isActive ? ['#ffffff', cfg.accent, cfg.glow, cfg.accent] : [cfg.glow, cfg.accent, cfg.glow, cfg.accent];
  var positions = [
    { x: 100, y: 78 },  /* верх */
    { x: 145, y: 120 }, /* право */
    { x: 100, y: 160 }, /* низ */
    { x: 55, y: 120 }   /* лево */
  ];
  var out = "";
  for (var i = 0; i < 4; i++) {
    var p = positions[i];
    out += '<path d="M' + p.x + ' ' + (p.y - 5) + ' L' + (p.x + 5) + ' ' + p.y + ' L' + p.x + ' ' + (p.y + 5) + ' L' + (p.x - 5) + ' ' + p.y + ' Z" fill="' + colors[i] + '"/>';
  }
  return out;
}

/* ─── Центральный символ ─── */
function rankSymbol(rankIdx, cfg) {
  var a = cfg.accent;
  var hl = cfg.glow;
  var dk = cfg.dark;

  /* 0 — Рекрут: Tango (лист) */
  if (rankIdx === 0) {
    return '' +
      '<path d="M100 92 Q92 80 82 84 Q86 96 98 100 Q88 104 88 116 Q96 112 100 104 Q104 112 112 116 Q112 104 102 100 Q114 96 118 84 Q108 80 100 92 Z" fill="' + a + '" stroke="' + hl + '" stroke-width="1.2"/>' +
      '<line x1="100" y1="92" x2="100" y2="80" stroke="' + hl + '" stroke-width="1.5"/>' +
      '<circle cx="100" cy="78" r="2.5" fill="' + hl + '"/>';
  }
  /* 1 — Страж: щит с крестом */
  if (rankIdx === 1) {
    return '' +
      '<path d="M100 82 Q84 82 82 96 L82 108 Q82 122 100 128 Q118 122 118 108 L118 96 Q116 82 100 82 Z" fill="' + a + '" stroke="' + hl + '" stroke-width="1.2"/>' +
      '<line x1="100" y1="88" x2="100" y2="120" stroke="' + hl + '" stroke-width="2.5"/>' +
      '<line x1="86" y1="104" x2="114" y2="104" stroke="' + hl + '" stroke-width="2.5"/>';
  }
  /* 2 — Рыцарь: Ring of Aquila (кольцо с крылом) */
  if (rankIdx === 2) {
    return '' +
      '<circle cx="100" cy="105" r="18" fill="none" stroke="' + a + '" stroke-width="3.5"/>' +
      '<path d="M100 92 L103 100 L110 102 L104 108 L105 116 L100 111 L95 116 L96 108 L90 102 L97 100 Z" fill="' + hl + '"/>' +
      '<circle cx="100" cy="105" r="3" fill="' + hl + '" opacity="0.7"/>';
  }
  /* 3 — Герой: Eul's (посох с кристаллом) */
  if (rankIdx === 3) {
    return '' +
      '<rect x="97" y="98" width="6" height="32" fill="' + a + '" rx="2"/>' +
      '<path d="M100 86 L110 96 L100 102 L90 96 Z" fill="' + hl + '" stroke="' + a + '" stroke-width="1.2"/>' +
      '<path d="M100 88 L105 95 L100 99 L95 95 Z" fill="#fff" opacity="0.5"/>' +
      '<ellipse cx="100" cy="132" rx="5" ry="2" fill="' + a + '"/>';
  }
  /* 4 — Легенда: BKB (молот) */
  if (rankIdx === 4) {
    return '' +
      '<rect x="97" y="98" width="6" height="32" fill="' + a + '" rx="2"/>' +
      '<path d="M86 88 Q100 82 114 88 L114 98 Q100 104 86 98 Z" fill="' + a + '" stroke="' + hl + '" stroke-width="1.2"/>' +
      '<circle cx="100" cy="93" r="4" fill="' + hl + '"/>' +
      '<circle cx="100" cy="93" r="2" fill="#fff"/>';
  }
  /* 5 — Властелин: Manta (три ромба) */
  if (rankIdx === 5) {
    return '' +
      '<path d="M88 105 L94 92 L100 105 L94 118 Z" fill="' + a + '" opacity="0.6"/>' +
      '<path d="M112 105 L106 92 L100 105 L106 118 Z" fill="' + a + '" opacity="0.6"/>' +
      '<path d="M100 88 L114 105 L100 122 L86 105 Z" fill="' + a + '" stroke="' + hl + '" stroke-width="1.2"/>' +
      '<path d="M100 96 L107 105 L100 114 L93 105 Z" fill="' + hl + '"/>';
  }
  /* 6 — Божество: Rapier (меч) */
  if (rankIdx === 6) {
    return '' +
      '<path d="M100 82 L103 94 L103 118 L97 118 L97 94 Z" fill="' + hl + '"/>' +
      '<path d="M100 82 L101.5 94 L101.5 118 L100 118 Z" fill="#fff" opacity="0.5"/>' +
      '<rect x="88" y="118" width="24" height="4" fill="' + a + '" rx="2"/>' +
      '<rect x="97" y="122" width="6" height="10" fill="' + a + '" rx="2"/>' +
      '<circle cx="100" cy="136" r="3.5" fill="' + hl + '"/>';
  }
  /* 7 — Титан: Aegis (голова) */
  return '' +
    '<path d="M100 82 Q84 84 82 100 L82 112 Q82 122 100 128 Q118 122 118 112 L118 100 Q116 84 100 82 Z" fill="' + a + '" stroke="' + hl + '" stroke-width="1.2"/>' +
    '<circle cx="100" cy="104" r="8" fill="' + hl + '"/>' +
    '<circle cx="100" cy="104" r="5" fill="' + dk + '"/>' +
    '<circle cx="97.5" cy="103" r="1.2" fill="' + hl + '"/>' +
    '<circle cx="102.5" cy="103" r="1.2" fill="' + hl + '"/>';
}

function buildMedalSVG(rankIdx, size) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 8px " + cfg.glow + "88);";

  var gMain = "gm" + rankIdx;
  var gDia = "gd" + rankIdx;

  var svgStr = '' +
    '<defs>' +
      /* Градиент для главной формы (щит+корона) */
      '<linearGradient id="' + gMain + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.light + '"/>' +
        '<stop offset="45%" stop-color="' + cfg.accent + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.mid + '"/>' +
      '</linearGradient>' +
      /* Градиент для ромба */
      '<linearGradient id="' + gDia + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.mid + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.dark + '"/>' +
      '</linearGradient>' +
    '</defs>' +
    /* Боковые крылья */
    sideWings(rankIdx, cfg) +
    /* Нижний V-кончик (за ромбом) */
    '<path d="' + bottomSpikePath() + '" fill="' + cfg.mid + '" stroke="' + cfg.accent + '" stroke-width="1"/>' +
    /* Верхняя корона */
    '<path d="' + topCrownPath() + '" fill="url(#' + gMain + ')" stroke="' + cfg.accent + '" stroke-width="1.5"/>' +
    /* Основной ромб (щит) */
    '<path d="' + mainDiamondPath() + '" fill="url(#' + gDia + ')" stroke="' + cfg.accent + '" stroke-width="1.5"/>' +
    /* 4 ромбика по углам */
    cornerDots(cfg, false) +
    /* Центральный символ */
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
      '<linearGradient id="qa1" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#5a4a6a"/>' +
        '<stop offset="100%" stop-color="#2a1e3a"/>' +
      '</linearGradient>' +
      '<linearGradient id="qa2" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#3a2a4a"/>' +
        '<stop offset="100%" stop-color="#0f0a18"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<path d="' + topCrownPath() + '" fill="url(#qa1)" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="5 4"/>' +
    '<path d="' + bottomSpikePath() + '" fill="#2a1e3a" stroke="#8b5cf6" stroke-width="1"/>' +
    '<path d="' + mainDiamondPath() + '" fill="url(#qa2)" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="5 4"/>' +
    '<path d="M100 78 L105 78 L105 73 L100 73 Z M100 78 L105 78 L105 83 L100 83 Z M100 160 L95 160 L95 165 L100 165 Z M145 120 L140 120 L140 125 L145 125 Z M55 120 L60 120 L60 125 L55 125 Z" fill="#8b5cf6" opacity="0.5"/>' +
    '<text x="100" y="122" text-anchor="middle" font-size="60" font-weight="900" fill="#a78bfa" font-family="sans-serif">?</text>';

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

console.log("rating v10.0 ready");
