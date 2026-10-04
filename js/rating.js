/* DOTA JETCH — RATING v23.0
   - Металлический блеск (5-стоповые градиенты)
   - Тонкие гравировки вместо жирных линий
   - Внутренние тени для объёма
   - Больше деталей в крыльях и символах
   - Уникальные ID всех градиентов и паттернов */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0,
    d: "#041a0a", m: "#0a5a20", l: "#3a9a48", a: "#7ed468", g: "#c8f0a8",
    metal1: "#0a2010", metal2: "#1a6025", metal3: "#5ac858", metal4: "#208038", metal5: "#0d3018",
    stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1,
    d: "#181c22", m: "#454850", l: "#8a8e98", a: "#c8ccd4", g: "#ffffff",
    metal1: "#1c2028", metal2: "#5a5e68", metal3: "#d8dce4", metal4: "#7a7e88", metal5: "#30343c",
    stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2,
    d: "#021a24", m: "#085068", l: "#1e90b8", a: "#58d0f0", g: "#c0f0ff",
    metal1: "#042030", metal2: "#0a6888", metal3: "#58c8e8", metal4: "#1a90b0", metal5: "#062a38",
    stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3,
    d: "#20100a", m: "#784818", l: "#d09838", a: "#f8c860", g: "#fff0a8",
    metal1: "#2a1808", metal2: "#a86820", metal3: "#f8c860", metal4: "#c08830", metal5: "#3a200a",
    stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4,
    d: "#160828", m: "#5a1a88", l: "#9a48d0", a: "#c880f0", g: "#ead8ff",
    metal1: "#1a0c30", metal2: "#6a20a0", metal3: "#b878e8", metal4: "#8038c0", metal5: "#240e40",
    stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5,
    d: "#20041c", m: "#801848", l: "#d02878", a: "#f868a8", g: "#ffd0e4",
    metal1: "#280828", metal2: "#a01858", metal3: "#e870a0", metal4: "#a82868", metal5: "#380820",
    stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",    ru: "Божество",  rankIdx: 6,
    d: "#240404", m: "#8a1010", l: "#d82828", a: "#f06868", g: "#ffc0c0",
    metal1: "#2a0808", metal2: "#a81818", metal3: "#f04848", metal4: "#a82020", metal5: "#400a0a",
    stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal",  ru: "Титан",     rankIdx: 7,
    d: "#180404", m: "#5a0a0a", l: "#9a1818", a: "#c83828",
    g: "#ffe080",
    metal1: "#200606", metal2: "#7a1010", metal3: "#c83828", metal4: "#8a1818", metal5: "#2a0606",
    gold: "#fbbf24", goldLight: "#fff8d0", goldDark: "#8a5a08",
    marble: "#f4ecdc", marbleDark: "#8a8270", marbleShadow: "#c0b8a8",
    stars: [5620, 5800, 6000, 6200, 6500] }
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
    "@keyframes medalPulse{0%,100%{filter:drop-shadow(0 0 3px var(--mglow))}50%{filter:drop-shadow(0 0 6px var(--mglow))}}" +
    "@keyframes medalFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}" +
    "@keyframes medalSparkle{0%,100%{opacity:0.12;transform:scale(0.7)}50%{opacity:0.5;transform:scale(1)}}" +
    ".medal-svg{animation:medalPulse 3.4s ease-in-out infinite;will-change:filter}" +
    ".medal-svg.medal-float{animation:medalPulse 3.4s ease-in-out infinite, medalFloat 4s ease-in-out infinite}" +
    ".medal-svg.medal-float-high{animation:medalPulse 2.8s ease-in-out infinite, medalFloat 3.4s ease-in-out infinite}" +
    ".medal-svg .sparkle{animation:medalSparkle 2.8s ease-in-out infinite;transform-origin:center;transform-box:fill-box}" +
    ".medal-svg .sparkle.d1{animation-delay:0s}" +
    ".medal-svg .sparkle.d2{animation-delay:0.7s}" +
    ".medal-svg .sparkle.d3{animation-delay:1.4s}" +
    ".medal-svg .sparkle.d4{animation-delay:2.1s}" +
    "@keyframes rankArrowPulse{0%,100%{transform:translateX(0);opacity:0.7}50%{transform:translateX(4px);opacity:1}}" +
    "@keyframes rankNewPop{0%{transform:scale(0.6);opacity:0}60%{transform:scale(1.18);opacity:1}100%{transform:scale(1.15);opacity:1}}" +
    ".rank-arrow-anim{animation:rankArrowPulse 1.2s ease-in-out infinite}" +
    ".rank-new-pop{animation:rankNewPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both}";
  document.head.appendChild(s);
}

/* ─── КРЫЛЬЯ: тонкие, многослойные, с текстурой ─── */
function sideFeathers(rankIdx, cfg) {
  if (rankIdx < 2) return "";
  var a = cfg.a;
  var l = cfg.l;
  var g = cfg.g;
  var fill1 = cfg.gold || a;
  var fill2 = cfg.goldLight || l;
  var dark = cfg.d;

  var count = Math.min(7 + (rankIdx - 2), 12);
  var baseLen = 28 + rankIdx * 2.4;
  var baseWidth = 7 + rankIdx * 0.5;

  function leftPoint(t) {
    if (t <= 0.5) { var u = t * 2; return { x: 100 - 62 * u, y: 38 + 62 * u }; }
    var u = (t - 0.5) * 2; return { x: 38 + 62 * u, y: 100 + 62 * u };
  }
  function rightPoint(t) {
    if (t <= 0.5) { var u = t * 2; return { x: 100 + 62 * u, y: 38 + 62 * u }; }
    var u = (t - 0.5) * 2; return { x: 162 - 62 * u, y: 100 + 62 * u };
  }

  function drawFeather(p, L, W, color) {
    var dx = p.x - 100, dy = p.y - 100;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 1) return "";
    var ux = dx / dist, uy = dy / dist;
    var px = -uy * W / 2, py = ux * W / 2;
    var tipX = p.x + ux * L, tipY = p.y + uy * L;
    var midX = (p.x + tipX) / 2, midY = (p.y + tipY) / 2;
    var bAx = p.x - px, bAy = p.y - py;
    var bBx = p.x + px, bBy = p.y + py;

    var out = "";
    // Основное тело пера (заострённый лист)
    out += '<path d="M ' + bAx.toFixed(1) + ' ' + bAy.toFixed(1) +
      ' Q ' + (midX - px * 1.25).toFixed(1) + ' ' + (midY - py * 1.25).toFixed(1) + ' ' + tipX.toFixed(1) + ' ' + tipY.toFixed(1) +
      ' Q ' + (midX + px * 1.25).toFixed(1) + ' ' + (midY + py * 1.25).toFixed(1) + ' ' + bBx.toFixed(1) + ' ' + bBy.toFixed(1) +
      ' Z" fill="' + color + '" stroke="' + dark + '" stroke-width="0.5" stroke-opacity="0.85"/>';
    // Тонкая светлая кромка сверху
    out += '<path d="M ' + bAx.toFixed(1) + ' ' + bAy.toFixed(1) +
      ' Q ' + (midX - px * 1.25).toFixed(1) + ' ' + (midY - py * 1.25).toFixed(1) + ' ' + tipX.toFixed(1) + ' ' + tipY.toFixed(1) +
      '" stroke="' + g + '" stroke-width="0.4" fill="none" opacity="0.7"/>';
    // Центральная ось
    out += '<path d="M ' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) +
      ' Q ' + midX.toFixed(1) + ' ' + midY.toFixed(1) + ' ' + tipX.toFixed(1) + ' ' + tipY.toFixed(1) +
      '" stroke="' + dark + '" stroke-width="0.5" fill="none" opacity="0.5"/>';
    // Мелкие боковые щетинки (по 2 с каждой стороны)
    var step1 = 0.35, step2 = 0.7;
    // Левая сторона
    var m1x = p.x + (tipX - p.x) * step1, m1y = p.y + (tipY - p.y) * step1;
    var m2x = p.x + (tipX - p.x) * step2, m2y = p.y + (tipY - p.y) * step2;
    out += '<path d="M' + m1x.toFixed(1) + ' ' + m1y.toFixed(1) + ' L' + (m1x - px * 0.9).toFixed(1) + ' ' + (m1y - py * 0.9).toFixed(1) + '" stroke="' + dark + '" stroke-width="0.35" opacity="0.5" fill="none"/>';
    out += '<path d="M' + m2x.toFixed(1) + ' ' + m2y.toFixed(1) + ' L' + (m2x - px * 0.7).toFixed(1) + ' ' + (m2y - py * 0.7).toFixed(1) + '" stroke="' + dark + '" stroke-width="0.35" opacity="0.5" fill="none"/>';
    // Правая сторона
    out += '<path d="M' + m1x.toFixed(1) + ' ' + m1y.toFixed(1) + ' L' + (m1x + px * 0.9).toFixed(1) + ' ' + (m1y + py * 0.9).toFixed(1) + '" stroke="' + dark + '" stroke-width="0.35" opacity="0.5" fill="none"/>';
    out += '<path d="M' + m2x.toFixed(1) + ' ' + m2y.toFixed(1) + ' L' + (m2x + px * 0.7).toFixed(1) + ' ' + (m2y + py * 0.7).toFixed(1) + '" stroke="' + dark + '" stroke-width="0.35" opacity="0.5" fill="none"/>';
    // Блик в центре
    out += '<ellipse cx="' + midX.toFixed(1) + '" cy="' + midY.toFixed(1) + '" rx="' + (W * 0.25).toFixed(1) + '" ry="1.2" fill="' + g + '" opacity="0.4"/>';
    return out;
  }

  var out = "";
  var leftOrder = [];
  for (var i = 0; i < count; i++) leftOrder.push(0.06 + (i / (count - 1)) * 0.88);
  leftOrder.sort(function (x, y) { return Math.abs(x - 0.5) - Math.abs(y - 0.5); });
  leftOrder.reverse();

  out += '<g>';
  for (var li = 0; li < leftOrder.length; li++) {
    var tL = leftOrder[li];
    var pL = leftPoint(tL);
    var lenF = 0.7 + Math.sin(tL * Math.PI) * 0.4;
    var W = baseWidth * (0.85 + Math.sin(tL * Math.PI) * 0.35);
    out += drawFeather(pL, baseLen * lenF, W, (li % 2 === 0) ? fill1 : fill2);
  }
  out += '</g>';

  out += '<g>';
  for (var ri = 0; ri < leftOrder.length; ri++) {
    var tR = leftOrder[ri];
    var pR = rightPoint(tR);
    var lenFR = 0.7 + Math.sin(tR * Math.PI) * 0.4;
    var W2 = baseWidth * (0.85 + Math.sin(tR * Math.PI) * 0.35);
    out += drawFeather(pR, baseLen * lenFR, W2, (ri % 2 === 0) ? fill1 : fill2);
  }
  out += '</g>';

  return out;
}

/* ─── УГЛОВЫЕ ПИКИ: тонкая резьба ─── */
function cornerSpikes(cfg) {
  var a = cfg.a;
  var g = cfg.g;
  var edge = cfg.gold || g;
  var edgeLight = cfg.goldLight || "#fff";
  var dark = cfg.d;
  return '' +
    // Верхний пик — детальная 4-слойная резьба
    '<path d="M100 12 L116 46 L100 54 L84 46 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.7"/>' +
    '<path d="M100 18 L109 42 L100 48 L91 42 Z" fill="' + edgeLight + '" opacity="0.6"/>' +
    '<path d="M100 24 L104 40 L100 44 L96 40 Z" fill="#fff" opacity="0.55"/>' +
    '<line x1="100" y1="16" x2="100" y2="50" stroke="' + dark + '" stroke-width="0.4" opacity="0.6"/>' +
    '<circle cx="100" cy="30" r="1.3" fill="' + edge + '" stroke="' + dark + '" stroke-width="0.3"/>' +
    // Нижний пик
    '<path d="M100 188 L116 154 L100 146 L84 154 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.7"/>' +
    '<path d="M100 182 L109 158 L100 152 L91 158 Z" fill="' + edgeLight + '" opacity="0.6"/>' +
    '<path d="M100 176 L104 160 L100 156 L96 160 Z" fill="#fff" opacity="0.55"/>' +
    '<line x1="100" y1="184" x2="100" y2="150" stroke="' + dark + '" stroke-width="0.4" opacity="0.6"/>' +
    '<circle cx="100" cy="170" r="1.3" fill="' + edge + '" stroke="' + dark + '" stroke-width="0.3"/>' +
    // Левый пик
    '<path d="M12 100 L46 84 L54 100 L46 116 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.7"/>' +
    '<path d="M18 100 L42 91 L48 100 L42 109 Z" fill="' + edgeLight + '" opacity="0.6"/>' +
    '<path d="M24 100 L40 96 L44 100 L40 104 Z" fill="#fff" opacity="0.55"/>' +
    '<line x1="16" y1="100" x2="50" y2="100" stroke="' + dark + '" stroke-width="0.4" opacity="0.6"/>' +
    '<circle cx="30" cy="100" r="1.3" fill="' + edge + '" stroke="' + dark + '" stroke-width="0.3"/>' +
    // Правый пик
    '<path d="M188 100 L154 84 L146 100 L154 116 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.7"/>' +
    '<path d="M182 100 L158 91 L152 100 L158 109 Z" fill="' + edgeLight + '" opacity="0.6"/>' +
    '<path d="M176 100 L160 96 L156 100 L160 104 Z" fill="#fff" opacity="0.55"/>' +
    '<line x1="184" y1="100" x2="150" y2="100" stroke="' + dark + '" stroke-width="0.4" opacity="0.6"/>' +
    '<circle cx="170" cy="100" r="1.3" fill="' + edge + '" stroke="' + dark + '" stroke-width="0.3"/>';
}

/* ─── ВНУТРЕННИЙ ОРНАМЕНТ: тонкая гравировка ─── */
function innerOrnament(cfg, uid) {
  var g = cfg.g;
  var d = cfg.d;
  var out = "";
  // Тонкое внутреннее кольцо-гравировка
  out += '<path d="M100 72 L140 100 L100 128 L60 100 Z" fill="none" stroke="' + g + '" stroke-width="0.35" opacity="0.5"/>';
  // 4 ромба по осям с двойным контуром
  var pts = [
    { x: 100, y: 76 }, { x: 152, y: 122 },
    { x: 100, y: 168 }, { x: 48, y: 122 }
  ];
  for (var i = 0; i < pts.length; i++) {
    var p = pts[i];
    // Тонкий внешний ромб
    out += '<path d="M ' + p.x + ' ' + (p.y - 7) + ' L ' + (p.x + 7) + ' ' + p.y + ' L ' + p.x + ' ' + (p.y + 7) + ' L ' + (p.x - 7) + ' ' + p.y + ' Z" fill="' + g + '" fill-opacity="0.15" stroke="' + g + '" stroke-width="0.4"/>';
    // Внутренний ромб
    out += '<path d="M ' + p.x + ' ' + (p.y - 4) + ' L ' + (p.x + 4) + ' ' + p.y + ' L ' + p.x + ' ' + (p.y + 4) + ' L ' + (p.x - 4) + ' ' + p.y + ' Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.4"/>';
    // Центральная точка
    out += '<circle cx="' + p.x + '" cy="' + p.y + '" r="1" fill="#fff" opacity="0.9"/>';
  }
  // 8 диагональных точек
  var diag = [
    { x: 128, y: 92 }, { x: 128, y: 152 },
    { x: 72, y: 92 }, { x: 72, y: 152 },
    { x: 88, y: 86 }, { x: 112, y: 86 },
    { x: 88, y: 158 }, { x: 112, y: 158 }
  ];
  for (var k = 0; k < diag.length; k++) {
    var q = diag[k];
    out += '<circle cx="' + q.x + '" cy="' + q.y + '" r="1.6" fill="none" stroke="' + g + '" stroke-width="0.4" opacity="0.8"/>';
    out += '<circle cx="' + q.x + '" cy="' + q.y + '" r="0.7" fill="' + g + '" opacity="0.9"/>';
  }
  // Тонкие соединительные линии
  out += '<path d="M100 76 L128 92 M100 76 L72 92 M100 168 L128 152 M100 168 L72 152" stroke="' + g + '" stroke-width="0.25" opacity="0.4" fill="none"/>';
  return out;
}

/* ─── ИСКРЫ: тонкие, со свечением ─── */
function sparklesAround(rankIdx, cfg) {
  if (rankIdx < 3) return "";
  var g = cfg.g || cfg.gold;
  var out = '<g class="sparkles">';
  var positions = [
    { x: 100, y: 22, d: "d1" }, { x: 178, y: 100, d: "d2" },
    { x: 100, y: 178, d: "d3" }, { x: 22, y: 100, d: "d4" },
    { x: 60, y: 60, d: "d2" }, { x: 140, y: 60, d: "d3" },
    { x: 60, y: 140, d: "d4" }, { x: 140, y: 140, d: "d1" },
    { x: 84, y: 40, d: "d3" }, { x: 116, y: 40, d: "d4" },
    { x: 84, y: 160, d: "d1" }, { x: 116, y: 160, d: "d2" }
  ];
  var limit = rankIdx >= 6 ? 12 : (rankIdx >= 5 ? 9 : 6);
  for (var i = 0; i < limit && i < positions.length; i++) {
    var p = positions[i];
    var r = rankIdx >= 6 ? 1.8 : 1.4;
    out += '<circle class="sparkle ' + p.d + '" cx="' + p.x + '" cy="' + p.y + '" r="' + r + '" fill="' + g + '"/>';
    if (rankIdx >= 5) {
      out += '<path d="M' + (p.x - r * 2.2) + ' ' + p.y + ' L' + (p.x + r * 2.2) + ' ' + p.y + ' M' + p.x + ' ' + (p.y - r * 2.2) + ' L' + p.x + ' ' + (p.y + r * 2.2) + '" stroke="' + g + '" stroke-width="0.35" opacity="0.55"/>';
    }
  }
  out += '</g>';
  return out;
}

/* ─── СИМВОЛЫ: тонкие линии, тени, объём ─── */
function rankSymbol(rankIdx, cfg) {
  var a = cfg.a;
  var g = cfg.g;
  var d = cfg.d;
  var gold = cfg.gold || null;
  var goldLight = cfg.goldLight || "#fff";
  var goldDark = cfg.goldDark || "#8a5a08";

  /* 0 — Tango: тонкий рисунок */
  if (rankIdx === 0) {
    return '' +
      '<line x1="100" y1="70" x2="100" y2="114" stroke="' + g + '" stroke-width="1.6" stroke-linecap="round"/>' +
      '<path d="M100 80 Q86 72 80 84 Q88 96 100 98 Q112 96 120 84 Q114 72 100 80 Z" fill="' + a + '" stroke="' + g + '" stroke-width="0.7"/>' +
      '<path d="M100 82 L100 96" stroke="' + d + '" stroke-width="0.35" opacity="0.7"/>' +
      '<path d="M88 82 L96 88 M104 88 L112 82" stroke="' + d + '" stroke-width="0.3" opacity="0.6"/>' +
      '<path d="M100 98 Q80 96 74 110 Q84 124 100 114 Z" fill="' + a + '" stroke="' + g + '" stroke-width="0.7"/>' +
      '<path d="M100 100 L82 110" stroke="' + d + '" stroke-width="0.35" opacity="0.7"/>' +
      '<path d="M100 98 Q120 96 126 110 Q116 124 100 114 Z" fill="' + a + '" stroke="' + g + '" stroke-width="0.7"/>' +
      '<path d="M100 100 L118 110" stroke="' + d + '" stroke-width="0.35" opacity="0.7"/>' +
      '<circle cx="100" cy="68" r="2.2" fill="' + g + '" stroke="' + d + '" stroke-width="0.4"/>' +
      '<circle cx="100" cy="68" r="0.9" fill="#fff" opacity="0.9"/>' +
      // блики
      '<ellipse cx="94" cy="86" rx="3" ry="1.5" fill="#fff" opacity="0.3"/>' +
      '<ellipse cx="94" cy="104" rx="3" ry="1.5" fill="#fff" opacity="0.3"/>';
  }
  /* 1 — Stout Shield: тонкая гравировка */
  if (rankIdx === 1) {
    return '' +
      '<path d="M100 74 Q74 78 72 98 L72 112 Q72 128 100 138 Q128 128 128 112 L128 98 Q126 78 100 74 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.2"/>' +
      '<path d="M100 82 Q84 86 83 100 L83 112 Q83 122 100 130 Q117 122 117 112 L117 100 Q116 86 100 82 Z" fill="' + d + '" opacity="0.55"/>' +
      // Крест тонкий
      '<line x1="100" y1="84" x2="100" y2="128" stroke="' + g + '" stroke-width="2.4"/>' +
      '<line x1="80" y1="104" x2="120" y2="104" stroke="' + g + '" stroke-width="2.4"/>' +
      '<line x1="100" y1="84" x2="100" y2="128" stroke="#fff" stroke-width="0.7" opacity="0.7"/>' +
      '<line x1="80" y1="104" x2="120" y2="104" stroke="#fff" stroke-width="0.7" opacity="0.7"/>' +
      // Заклёпки
      '<circle cx="80" cy="84" r="1.8" fill="' + g + '" stroke="' + d + '" stroke-width="0.3"/>' +
      '<circle cx="120" cy="84" r="1.8" fill="' + g + '" stroke="' + d + '" stroke-width="0.3"/>' +
      '<circle cx="80" cy="124" r="1.8" fill="' + g + '" stroke="' + d + '" stroke-width="0.3"/>' +
      '<circle cx="120" cy="124" r="1.8" fill="' + g + '" stroke="' + d + '" stroke-width="0.3"/>' +
      '<circle cx="80" cy="84" r="0.6" fill="#fff" opacity="0.9"/>' +
      '<circle cx="120" cy="84" r="0.6" fill="#fff" opacity="0.9"/>' +
      // Гравировка
      '<path d="M86 92 L114 92" stroke="' + d + '" stroke-width="0.3" opacity="0.5"/>' +
      '<path d="M86 116 L114 116" stroke="' + d + '" stroke-width="0.3" opacity="0.5"/>' +
      '<path d="M88 74 Q100 78 112 74" stroke="' + g + '" stroke-width="0.4" fill="none" opacity="0.6"/>' +
      '<path d="M88 138 Q100 134 112 138" stroke="' + g + '" stroke-width="0.4" fill="none" opacity="0.6"/>';
  }
  /* 2 — Ring of Aquila: тонкие лучи */
  if (rankIdx === 2) {
    return '' +
      '<circle cx="100" cy="104" r="24" fill="none" stroke="' + a + '" stroke-width="2.4"/>' +
      '<circle cx="100" cy="104" r="22" fill="none" stroke="' + g + '" stroke-width="0.6" opacity="0.7"/>' +
      '<circle cx="100" cy="104" r="20" fill="none" stroke="' + a + '" stroke-width="0.4" opacity="0.5"/>' +
      // Орёл
      '<path d="M100 84 L95 96 L82 96 L92 105 L88 118 L100 108 L112 118 L108 105 L118 96 L105 96 Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.5"/>' +
      '<circle cx="100" cy="101" r="2.2" fill="' + d + '"/>' +
      '<circle cx="100" cy="101" r="0.9" fill="' + g + '"/>' +
      // Точки по осям
      '<circle cx="100" cy="78" r="2" fill="' + g + '" stroke="' + d + '" stroke-width="0.3"/>' +
      '<circle cx="100" cy="130" r="2" fill="' + g + '" stroke="' + d + '" stroke-width="0.3"/>' +
      '<circle cx="74" cy="104" r="2" fill="' + g + '" stroke="' + d + '" stroke-width="0.3"/>' +
      '<circle cx="126" cy="104" r="2" fill="' + g + '" stroke="' + d + '" stroke-width="0.3"/>' +
      // Тонкие лучи
      '<path d="M100 78 L100 70 M100 130 L100 138 M74 104 L66 104 M126 104 L134 104" stroke="' + g + '" stroke-width="0.5" opacity="0.6"/>' +
      '<path d="M83 87 L78 82 M117 87 L122 82 M83 121 L78 126 M117 121 L122 126" stroke="' + g + '" stroke-width="0.4" opacity="0.45"/>';
  }
  /* 3 — Eul's: тонкие грани */
  if (rankIdx === 3) {
    return '' +
      // Кристалл с 4 гранями
      '<path d="M100 62 L114 84 L100 100 L86 84 Z" fill="' + g + '" stroke="' + a + '" stroke-width="1"/>' +
      '<path d="M100 68 L108 84 L100 94 L92 84 Z" fill="#fff" opacity="0.5"/>' +
      '<path d="M100 62 L100 100" stroke="' + a + '" stroke-width="0.35" opacity="0.7"/>' +
      '<path d="M86 84 L114 84" stroke="' + a + '" stroke-width="0.35" opacity="0.7"/>' +
      '<path d="M92 76 L108 76" stroke="' + a + '" stroke-width="0.25" opacity="0.5"/>' +
      // Рукоять с гравировкой
      '<rect x="95" y="100" width="10" height="40" fill="' + a + '" rx="2" stroke="' + g + '" stroke-width="0.7"/>' +
      '<line x1="97" y1="102" x2="97" y2="138" stroke="' + g + '" stroke-width="0.3" opacity="0.7"/>' +
      '<line x1="103" y1="102" x2="103" y2="138" stroke="' + g + '" stroke-width="0.3" opacity="0.7"/>' +
      '<line x1="100" y1="102" x2="100" y2="138" stroke="' + d + '" stroke-width="0.3" opacity="0.5"/>' +
      // Ручки (мини-крылышки)
      '<path d="M85 84 Q75 80 76 94 Q82 96 85 92" fill="' + a + '" fill-opacity="0.5" stroke="' + a + '" stroke-width="1.4" stroke-linecap="round"/>' +
      '<path d="M115 84 Q125 80 124 94 Q118 96 115 92" fill="' + a + '" fill-opacity="0.5" stroke="' + a + '" stroke-width="1.4" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="142" rx="6" ry="2.4" fill="' + a + '" stroke="' + g + '" stroke-width="0.6"/>' +
      // Верхние искры
      '<circle cx="100" cy="60" r="1" fill="' + g + '"/>' +
      '<circle cx="78" cy="76" r="0.8" fill="' + g + '"/>' +
      '<circle cx="122" cy="76" r="0.8" fill="' + g + '"/>';
  }
  /* 4 — BKB: тонкий молот */
  if (rankIdx === 4) {
    return '' +
      // Рукоять с гравировкой
      '<rect x="95" y="94" width="10" height="46" fill="' + a + '" rx="2" stroke="' + g + '" stroke-width="0.7"/>' +
      '<line x1="97" y1="96" x2="97" y2="138" stroke="' + g + '" stroke-width="0.3" opacity="0.7"/>' +
      '<line x1="103" y1="96" x2="103" y2="138" stroke="' + g + '" stroke-width="0.3" opacity="0.7"/>' +
      // Навершие
      '<path d="M78 78 Q100 66 122 78 L122 96 Q100 106 78 96 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1"/>' +
      '<path d="M82 82 Q100 74 118 82 L118 94 Q100 100 82 94 Z" fill="' + d + '" opacity="0.5"/>' +
      // Светящееся ядро (3 слоя)
      '<circle cx="100" cy="86" r="6" fill="' + g + '"/>' +
      '<circle cx="100" cy="86" r="3.5" fill="' + a + '"/>' +
      '<circle cx="100" cy="86" r="1.5" fill="#fff"/>' +
      // Тонкие лучи
      '<line x1="86" y1="76" x2="84" y2="71" stroke="' + g + '" stroke-width="1" stroke-linecap="round"/>' +
      '<line x1="114" y1="76" x2="116" y2="71" stroke="' + g + '" stroke-width="1" stroke-linecap="round"/>' +
      // Гравировка
      '<path d="M90 80 L110 80" stroke="' + d + '" stroke-width="0.3" opacity="0.5"/>' +
      '<path d="M90 92 L110 92" stroke="' + d + '" stroke-width="0.3" opacity="0.5"/>' +
      '<ellipse cx="100" cy="142" rx="6" ry="2.4" fill="' + a + '" stroke="' + g + '" stroke-width="0.6"/>';
  }
  /* 5 — Manta: тонкие ромбы */
  if (rankIdx === 5) {
    return '' +
      // Фоновые ромбы (полупрозрачные)
      '<path d="M66 104 L74 90 L82 104 L74 118 Z" fill="' + a + '" opacity="0.2"/>' +
      '<path d="M134 104 L126 90 L118 104 L126 118 Z" fill="' + a + '" opacity="0.2"/>' +
      // Боковые ромбы
      '<path d="M74 104 L82 88 L90 104 L82 120 Z" fill="' + a + '" opacity="0.5" stroke="' + g + '" stroke-width="0.6"/>' +
      '<path d="M77 104 L82 94 L87 104 L82 114 Z" fill="' + g + '" opacity="0.5"/>' +
      '<path d="M126 104 L118 88 L110 104 L118 120 Z" fill="' + a + '" opacity="0.5" stroke="' + g + '" stroke-width="0.6"/>' +
      '<path d="M123 104 L118 94 L113 104 L118 114 Z" fill="' + g + '" opacity="0.5"/>' +
      // Центральный ромб
      '<path d="M100 74 L128 104 L100 134 L72 104 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.2"/>' +
      '<path d="M100 82 L120 104 L100 126 L80 104 Z" fill="' + d + '" opacity="0.65"/>' +
      '<path d="M100 90 L110 104 L100 118 L90 104 Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.5"/>' +
      '<path d="M100 96 L104 104 L100 112 L96 104 Z" fill="#fff" opacity="0.8"/>' +
      // Точки на углах
      '<circle cx="100" cy="74" r="2.2" fill="' + g + '" stroke="' + d + '" stroke-width="0.4"/>' +
      '<circle cx="100" cy="134" r="2.2" fill="' + g + '" stroke="' + d + '" stroke-width="0.4"/>' +
      '<circle cx="72" cy="104" r="2.2" fill="' + g + '" stroke="' + d + '" stroke-width="0.4"/>' +
      '<circle cx="128" cy="104" r="2.2" fill="' + g + '" stroke="' + d + '" stroke-width="0.4"/>';
  }
  /* 6 — Divine Rapier: тонкая рапира */
  if (rankIdx === 6) {
    return '' +
      // Клинок с гранями
      '<path d="M100 60 L104 80 L104 118 L96 118 L96 80 Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.6"/>' +
      '<path d="M100 60 L102 80 L102 118 L100 118 Z" fill="#fff" opacity="0.6"/>' +
      '<line x1="100" y1="60" x2="100" y2="118" stroke="' + d + '" stroke-width="0.25" opacity="0.6"/>' +
      // Гарда
      '<rect x="82" y="118" width="36" height="5" fill="' + a + '" rx="2.5" stroke="' + g + '" stroke-width="0.7"/>' +
      '<circle cx="82" cy="120.5" r="2.8" fill="' + g + '" stroke="' + a + '" stroke-width="0.5"/>' +
      '<circle cx="118" cy="120.5" r="2.8" fill="' + g + '" stroke="' + a + '" stroke-width="0.5"/>' +
      '<circle cx="82" cy="120.5" r="1" fill="#fff" opacity="0.9"/>' +
      '<circle cx="118" cy="120.5" r="1" fill="#fff" opacity="0.9"/>' +
      // Рукоять
      '<rect x="96" y="123" width="8" height="14" fill="' + a + '" rx="2" stroke="' + g + '" stroke-width="0.5"/>' +
      '<line x1="98" y1="124" x2="98" y2="136" stroke="' + g + '" stroke-width="0.4" opacity="0.7"/>' +
      '<line x1="100" y1="124" x2="100" y2="136" stroke="' + g + '" stroke-width="0.4" opacity="0.7"/>' +
      '<line x1="102" y1="124" x2="102" y2="136" stroke="' + g + '" stroke-width="0.4" opacity="0.7"/>' +
      // Алмаз-навершие
      '<path d="M100 138 L104 145 L100 152 L96 145 Z" fill="' + g + '" stroke="' + a + '" stroke-width="0.6"/>' +
      '<path d="M100 141 L102 145 L100 149 L98 145 Z" fill="#fff" opacity="0.8"/>' +
      // Блики вдоль клинка
      '<ellipse cx="99" cy="90" rx="0.8" ry="4" fill="#fff" opacity="0.5"/>' +
      '<ellipse cx="101" cy="105" rx="0.6" ry="3" fill="#fff" opacity="0.4"/>';
  }
  /* 7 — Aegis (Титан): максимально детальная мраморная маска */
  var goldStroke = gold || g;
  var goldGlow = goldLight || g;
  var marble = cfg.marble || "#f4ecdc";
  var marbleDark = cfg.marbleDark || "#8a8270";
  var marbleShadow = cfg.marbleShadow || "#c0b8a8";

  return '' +
    // Внешний щит
    '<path d="M100 62 Q100 58 100 56 L100 56 Q80 62 72 80 L70 100 L70 116 Q70 136 100 148 Q130 136 130 116 L130 100 L128 80 Q120 62 100 56 Z" fill="' + a + '" stroke="' + goldStroke + '" stroke-width="1.6" stroke-linejoin="round"/>' +
    // Внутренний тёмный щит
    '<path d="M100 72 Q90 76 84 90 L82 100 L82 114 Q82 130 100 140 Q118 130 118 114 L118 100 L116 90 Q110 76 100 72 Z" fill="' + d + '" opacity="0.7"/>' +
    // Двойной контур
    '<path d="M100 72 Q90 76 84 90 L82 100 L82 114 Q82 130 100 140 Q118 130 118 114 L118 100 L116 90 Q110 76 100 72 Z" fill="none" stroke="' + goldStroke + '" stroke-width="0.6" opacity="0.85"/>' +
    // Свод
    '<path d="M84 82 Q100 70 116 82" fill="none" stroke="' + goldStroke + '" stroke-width="1.1" opacity="0.9"/>' +
    '<path d="M84 80 Q100 68 116 80" fill="none" stroke="' + goldGlow + '" stroke-width="0.3" opacity="0.7"/>' +
    // Мраморная голова — овал
    '<ellipse cx="100" cy="108" rx="14" ry="17" fill="' + marble + '" stroke="' + marbleDark + '" stroke-width="0.7"/>' +
    // Тень справа
    '<path d="M100 91 Q113 93 116 108 Q116 122 100 125 Z" fill="' + marbleShadow + '" opacity="0.5"/>' +
    // Блик слева
    '<path d="M100 91 Q89 93 86 106 Q87 115 95 121 Q91 112 93 102 Q95 94 100 91 Z" fill="#fff" opacity="0.5"/>' +
    // Мраморные прожилки
    '<path d="M94 98 Q97 102 94 108 Q92 112 94 118" stroke="' + marbleDark + '" stroke-width="0.3" fill="none" opacity="0.5"/>' +
    '<path d="M107 100 Q105 105 107 110" stroke="' + marbleDark + '" stroke-width="0.3" fill="none" opacity="0.4"/>' +
    '<path d="M91 110 Q93 112 95 110" stroke="' + marbleDark + '" stroke-width="0.2" fill="none" opacity="0.35"/>' +
    // Закрытые глаза
    '<path d="M89 106 Q92 103 95 106" stroke="' + marbleDark + '" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
    '<path d="M105 106 Q108 103 111 106" stroke="' + marbleDark + '" stroke-width="1.1" fill="none" stroke-linecap="round"/>' +
    '<path d="M89.5 107.5 Q92 109 94.5 107.5" stroke="' + marbleDark + '" stroke-width="0.4" fill="none" opacity="0.6"/>' +
    '<path d="M105.5 107.5 Q108 109 110.5 107.5" stroke="' + marbleDark + '" stroke-width="0.4" fill="none" opacity="0.6"/>' +
    // Нос
    '<path d="M100 104 L100 113" stroke="' + marbleDark + '" stroke-width="0.6" fill="none" opacity="0.7"/>' +
    '<path d="M97 114 Q100 115 103 114" stroke="' + marbleDark + '" stroke-width="0.5" fill="none" opacity="0.7"/>' +
    // Рот
    '<path d="M97 119 L103 119" stroke="' + marbleDark + '" stroke-width="0.6" fill="none" stroke-linecap="round" opacity="0.75"/>' +
    '<path d="M97 120.5 L103 120.5" stroke="' + marbleDark + '" stroke-width="0.25" fill="none" stroke-linecap="round" opacity="0.4"/>' +
    // Скулы
    '<path d="M89 115 Q91 119 93 121" stroke="' + marbleDark + '" stroke-width="0.3" fill="none" opacity="0.45"/>' +
    '<path d="M111 115 Q109 119 107 121" stroke="' + marbleDark + '" stroke-width="0.3" fill="none" opacity="0.45"/>' +
    // Диадема
    '<path d="M86 90 Q100 84 114 90 L114 91.5 Q100 85.5 86 91.5 Z" fill="' + goldStroke + '" opacity="0.9"/>' +
    '<path d="M86 88 Q100 82 114 88" fill="none" stroke="' + goldGlow + '" stroke-width="0.4" opacity="0.7"/>' +
    '<circle cx="100" cy="87" r="1.6" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.4"/>' +
    '<circle cx="100" cy="87" r="0.6" fill="#fff" opacity="0.9"/>' +
    // Крылья Aegis — 3 уровня
    '<path d="M84 92 Q70 82 62 92 Q72 96 82 96 Z" fill="' + goldGlow + '" opacity="0.85" stroke="' + goldStroke + '" stroke-width="0.4"/>' +
    '<path d="M84 96 Q72 92 64 100 Q74 102 82 100 Z" fill="' + goldGlow + '" opacity="0.65" stroke="' + goldStroke + '" stroke-width="0.35"/>' +
    '<path d="M84 100 Q75 97 70 102 Q78 104 82 102 Z" fill="' + goldGlow + '" opacity="0.45" stroke="' + goldStroke + '" stroke-width="0.3"/>' +
    '<path d="M116 92 Q130 82 138 92 Q128 96 118 96 Z" fill="' + goldGlow + '" opacity="0.85" stroke="' + goldStroke + '" stroke-width="0.4"/>' +
    '<path d="M116 96 Q128 92 136 100 Q126 102 118 100 Z" fill="' + goldGlow + '" opacity="0.65" stroke="' + goldStroke + '" stroke-width="0.35"/>' +
    '<path d="M116 100 Q125 97 130 102 Q122 104 118 102 Z" fill="' + goldGlow + '" opacity="0.45" stroke="' + goldStroke + '" stroke-width="0.3"/>' +
    // Лучи славы — тонкие
    '<line x1="100" y1="54" x2="100" y2="47" stroke="' + goldStroke + '" stroke-width="1.2" stroke-linecap="round"/>' +
    '<line x1="88" y1="58" x2="84" y2="52" stroke="' + goldStroke + '" stroke-width="1" stroke-linecap="round"/>' +
    '<line x1="112" y1="58" x2="116" y2="52" stroke="' + goldStroke + '" stroke-width="1" stroke-linecap="round"/>' +
    '<line x1="78" y1="68" x2="73" y2="64" stroke="' + goldStroke + '" stroke-width="0.8" stroke-linecap="round"/>' +
    '<line x1="122" y1="68" x2="127" y2="64" stroke="' + goldStroke + '" stroke-width="0.8" stroke-linecap="round"/>' +
    '<line x1="72" y1="80" x2="67" y2="78" stroke="' + goldStroke + '" stroke-width="0.7" stroke-linecap="round"/>' +
    '<line x1="128" y1="80" x2="133" y2="78" stroke="' + goldStroke + '" stroke-width="0.7" stroke-linecap="round"/>' +
    // Заклёпки с бликами
    '<circle cx="80" cy="94" r="1.6" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.4"/>' +
    '<circle cx="120" cy="94" r="1.6" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.4"/>' +
    '<circle cx="80" cy="126" r="1.6" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.4"/>' +
    '<circle cx="120" cy="126" r="1.6" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.4"/>' +
    '<circle cx="80" cy="94" r="0.5" fill="#fff" opacity="0.9"/>' +
    '<circle cx="120" cy="94" r="0.5" fill="#fff" opacity="0.9"/>' +
    // Тонкие золотые линии на щите
    '<path d="M78 84 Q76 96 76 108" stroke="' + goldStroke + '" stroke-width="0.3" fill="none" opacity="0.5"/>' +
    '<path d="M122 84 Q124 96 124 108" stroke="' + goldStroke + '" stroke-width="0.3" fill="none" opacity="0.5"/>';
}

function buildMedalSVG(rankIdx, size, animate) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  if (animate === undefined) animate = true;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "-30 -30 260 260");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  var glowColor = cfg.gold || cfg.g;
  svg.style.cssText = "display:block;flex-shrink:0;";
  svg.style.setProperty("--mglow", glowColor);
  if (animate) {
    if (rankIdx >= 6) svg.classList.add("medal-svg", "medal-float-high");
    else if (rankIdx >= 3) svg.classList.add("medal-svg", "medal-float");
    else svg.classList.add("medal-svg");
  }

  var uid = Math.random().toString(36).slice(2, 8);
  var gid = "g" + rankIdx + "_" + uid;
  var gidIn = "gi" + rankIdx + "_" + uid;
  var gidShine = "gs" + rankIdx + "_" + uid;
  var gidRad = "gr" + rankIdx + "_" + uid;
  var gidEdge = "ge" + rankIdx + "_" + uid;
  var gidInner = "gin" + rankIdx + "_" + uid;
  var gidMesh = "gm" + rankIdx + "_" + uid;
  var gidMeshDark = "gmd" + rankIdx + "_" + uid;
  var strokeOuter = cfg.gold || cfg.g;
  var strokeInner = cfg.goldLight || cfg.g;

  var svgStr = '' +
    '<defs>' +
      // Металлический блеск — 5 стопов
      '<linearGradient id="' + gid + '" x1="20%" y1="0%" x2="80%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.metal1 + '"/>' +
        '<stop offset="18%" stop-color="' + cfg.metal3 + '"/>' +
        '<stop offset="42%" stop-color="' + cfg.metal2 + '"/>' +
        '<stop offset="65%" stop-color="' + cfg.metal4 + '"/>' +
        '<stop offset="88%" stop-color="' + cfg.metal3 + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.metal5 + '"/>' +
      '</linearGradient>' +
      // Внутренний ромб — металлический
      '<linearGradient id="' + gidIn + '" x1="20%" y1="0%" x2="80%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.metal5 + '"/>' +
        '<stop offset="30%" stop-color="' + cfg.metal1 + '"/>' +
        '<stop offset="55%" stop-color="' + cfg.metal4 + '"/>' +
        '<stop offset="80%" stop-color="' + cfg.metal5 + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.d + '"/>' +
      '</linearGradient>' +
      // Внутренний свет
      '<linearGradient id="' + gidInner + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.l + '"/>' +
        '<stop offset="50%" stop-color="' + cfg.a + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.m + '"/>' +
      '</linearGradient>' +
      // Блик сверху
      '<linearGradient id="' + gidShine + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#fff" stop-opacity="0.55"/>' +
        '<stop offset="35%" stop-color="#fff" stop-opacity="0.15"/>' +
        '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
      '</linearGradient>' +
      // Радиальное свечение
      '<radialGradient id="' + gidRad + '" cx="50%" cy="50%" r="55%">' +
        '<stop offset="0%" stop-color="' + cfg.g + '" stop-opacity="0.35"/>' +
        '<stop offset="100%" stop-color="' + cfg.g + '" stop-opacity="0"/>' +
      '</radialGradient>' +
      // Сетка-гравировка
      '<pattern id="' + gidMesh + '" width="4" height="4" patternUnits="userSpaceOnUse">' +
        '<path d="M0 0 L4 4 M4 0 L0 4" stroke="' + cfg.g + '" stroke-width="0.15" opacity="0.18"/>' +
      '</pattern>' +
      '<pattern id="' + gidMeshDark + '" width="3" height="3" patternUnits="userSpaceOnUse">' +
        '<circle cx="1.5" cy="1.5" r="0.4" fill="' + cfg.d + '" opacity="0.4"/>' +
      '</pattern>' +
      // Тень по краю
      '<filter id="' + gidEdge + '" x="-15%" y="-15%" width="130%" height="130%">' +
        '<feDropShadow dx="0" dy="0.5" stdDeviation="0.6" flood-color="' + cfg.d + '" flood-opacity="0.9"/>' +
      '</filter>' +
      // Внутренняя тень для вогнутости
      '<filter id="' + gidRad + '_in" x="-10%" y="-10%" width="120%" height="120%">' +
        '<feGaussianBlur in="SourceAlpha" stdDeviation="2"/>' +
        '<feOffset dx="0" dy="2" result="offsetblur"/>' +
        '<feComponentTransfer><feFuncA type="linear" slope="0.5"/></feComponentTransfer>' +
        '<feComposite in2="SourceAlpha" operator="in"/>' +
      '</filter>' +
    '</defs>' +
    (animate ? sparklesAround(rankIdx, cfg) : "") +
    sideFeathers(rankIdx, cfg) +
    cornerSpikes(cfg) +
    // Внешний ромб — металлический градиент
    '<path d="M100 38 L162 100 L100 162 L38 100 Z" fill="url(#' + gid + ')" stroke="' + strokeOuter + '" stroke-width="1.2" filter="url(#' + gidEdge + ')"/>' +
    // Сетка-гравировка
    '<path d="M100 38 L162 100 L100 162 L38 100 Z" fill="url(#' + gidMesh + ')" opacity="0.7"/>' +
    // Блик сверху (для объёма)
    '<path d="M100 40 L160 100 L100 100 Z" fill="url(#' + gidShine + ')"/>' +
    // Тонкая внешняя обводка (светлая)
    '<path d="M100 38 L162 100 L100 162 L38 100 Z" fill="none" stroke="' + strokeInner + '" stroke-width="0.4" opacity="0.6"/>' +
    // Тонкая внутренняя обводка (тёмная)
    '<path d="M100 42 L158 100 L100 158 L42 100 Z" fill="none" stroke="' + cfg.d + '" stroke-width="0.5" opacity="0.7"/>' +
    // Вторая внутренняя обводка (светлая)
    '<path d="M100 46 L154 100 L100 154 L46 100 Z" fill="none" stroke="' + strokeInner + '" stroke-width="0.35" opacity="0.5"/>' +
    // Внутренний ромб — металл + свечение
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + gidIn + ')" stroke="' + cfg.a + '" stroke-width="0.8"/>' +
    // Внутреннее свечение
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + gidRad + ')"/>' +
    // Сетка внутри
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + gidMeshDark + ')" opacity="0.8"/>' +
    // Тонкая гравировка
    '<path d="M100 68 L136 100 L100 132 L64 100 Z" fill="none" stroke="' + strokeOuter + '" stroke-width="0.5" opacity="0.7"/>' +
    '<path d="M100 72 L132 100 L100 128 L68 100 Z" fill="none" stroke="' + strokeInner + '" stroke-width="0.3" opacity="0.5"/>' +
    innerOrnament(cfg, uid) +
    rankSymbol(rankIdx, cfg);

  var doc = new DOMParser().parseFromString('<svg xmlns="' + ns + '" viewBox="-30 -30 260 260">' + svgStr + '</svg>', "image/svg+xml");
  var parsed = doc.documentElement;
  while (parsed.firstChild) svg.appendChild(parsed.firstChild);
  return svg;
}
window.buildMedalSVG = buildMedalSVG;

function buildQuestionMedalSVG(size) {
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "-30 -30 260 260");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;";
  svg.style.setProperty("--mglow", "#8b5cf6");
  svg.classList.add("medal-svg");

  var uid = Math.random().toString(36).slice(2, 8);
  var qid = "qa_" + uid;
  var qidIn = "qai_" + uid;

  var svgStr = '' +
    '<defs>' +
      '<linearGradient id="' + qid + '" x1="20%" y1="0%" x2="80%" y2="100%">' +
        '<stop offset="0%" stop-color="#2a2038"/>' +
        '<stop offset="50%" stop-color="#4a3a5a"/>' +
        '<stop offset="100%" stop-color="#1a1226"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + qidIn + '" x1="20%" y1="0%" x2="80%" y2="100%">' +
        '<stop offset="0%" stop-color="#1a1226"/>' +
        '<stop offset="100%" stop-color="#0b0810"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<path d="M100 38 L162 100 L100 162 L38 100 Z" fill="url(#' + qid + ')" stroke="#8b5cf6" stroke-width="1.2" stroke-dasharray="5 4"/>' +
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + qidIn + ')" stroke="#8b5cf6" stroke-width="0.8"/>' +
    '<text x="100" y="122" text-anchor="middle" font-size="60" font-weight="900" fill="#a78bfa" font-family="sans-serif" opacity="0.9">?</text>';

  var doc = new DOMParser().parseFromString('<svg xmlns="' + ns + '" viewBox="-30 -30 260 260">' + svgStr + '</svg>', "image/svg+xml");
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

  var oldRankIdx = getMedalForMMR(data.mmr).medal.rankIdx;

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

  var newMedalForRank = getMedalForMMR(data.mmr);
  var newRankIdx = newMedalForRank.medal.rankIdx;

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
  else if (newRankIdx > oldRankIdx) {
    setTimeout(function () {
      showRankUpDialog(oldRankIdx, newMedalForRank.medal, newMedalForRank.stars, data.mmr);
    }, 700);
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

function showRankUpDialog(oldRankIdx, newMedal, stars, mmr) {
  ensureRatingStyles();
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;z-index:999999;background:rgba(2,3,8,0.9);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;";
  ov.classList.add("rating-overlay-anim");

  var box = document.createElement("div");
  box.style.cssText = "max-width:440px;width:100%;background:var(--bg-card);border:2px solid " + newMedal.a + ";border-radius:20px;padding:32px 26px 24px;box-shadow:0 24px 80px rgba(0,0,0,0.85), 0 0 80px -20px " + newMedal.a + ";text-align:center;position:relative;overflow:hidden;";
  box.classList.add("rating-box-anim");

  var head = document.createElement("div");
  head.style.cssText = "font-size:14px;font-weight:800;letter-spacing:0.2em;color:" + newMedal.a + ";text-transform:uppercase;margin-bottom:6px;";
  head.textContent = "🎉 Новый ранг!";
  box.appendChild(head);

  var sub = document.createElement("div");
  sub.style.cssText = "font-size:11.5px;color:var(--text-muted);margin-bottom:22px;";
  sub.textContent = "Ты повысил свой ранг";
  box.appendChild(sub);

  var transRow = document.createElement("div");
  transRow.style.cssText = "display:flex;align-items:center;justify-content:center;gap:10px;margin-bottom:20px;min-height:130px;";

  var oldWrap = document.createElement("div");
  oldWrap.style.cssText = "opacity:0.4;filter:grayscale(0.5);";
  oldWrap.appendChild(buildMedalSVG(oldRankIdx, 76, false));
  transRow.appendChild(oldWrap);

  var arrow = document.createElement("div");
  arrow.className = "rank-arrow-anim";
  arrow.style.cssText = "font-size:30px;color:" + newMedal.a + ";font-weight:900;line-height:1;";
  arrow.textContent = "→";
  transRow.appendChild(arrow);

  var newWrap = document.createElement("div");
  newWrap.className = "rank-new-pop";
  newWrap.appendChild(buildMedalSVG(newMedal.rankIdx, 120));
  transRow.appendChild(newWrap);

  box.appendChild(transRow);

  var rankName = document.createElement("div");
  rankName.style.cssText = "font-size:30px;font-weight:900;color:" + newMedal.a + ";letter-spacing:0.02em;";
  rankName.textContent = newMedal.ru;
  box.appendChild(rankName);

  var starsRow = document.createElement("div");
  starsRow.style.cssText = "display:flex;gap:5px;justify-content:center;margin-top:10px;";
  for (var s = 0; s < 5; s++) {
    var star = document.createElement("span");
    star.style.cssText = "font-size:18px;color:" + (s < stars ? newMedal.a : "var(--border)") + ";";
    star.textContent = "★";
    starsRow.appendChild(star);
  }
  box.appendChild(starsRow);

  var mmrText = document.createElement("div");
  mmrText.style.cssText = "font-size:15px;color:var(--text-muted);margin-top:10px;font-family:'JetBrains Mono',monospace;";
  mmrText.textContent = mmr + " MMR";
  box.appendChild(mmrText);

  var sub2 = document.createElement("div");
  sub2.style.cssText = "font-size:11px;color:var(--text-dim);margin-top:14px;line-height:1.5;";
  sub2.textContent = "Продолжай в том же духе!";
  box.appendChild(sub2);

  var btn = document.createElement("button");
  btn.type = "button";
  btn.style.cssText = "margin-top:22px;padding:13px 32px;border-radius:11px;background:" + newMedal.a + ";color:#0b0c10;border:none;font-size:15px;font-weight:800;cursor:pointer;font-family:inherit;";
  btn.textContent = "Круто!";
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

console.log("rating v23.0 ready (metallic finish, thin engraving, more depth)");
