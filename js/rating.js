/* DOTA JETCH — RATING v22.0
   - Детализация медалей: объёмные крылья, гравировка, больше орнамента
   - Усложнённые центральные символы
   - Фиксы: уникальные ID градиентов, animate-параметр
   - Сохранены: цвета, ранги, формы, попапы */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0,
    d: "#043818", m: "#0a8040", l: "#28c050", a: "#40e870", g: "#a0ffb8",
    stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1,
    d: "#384048", m: "#687078", l: "#a8b0b8", a: "#d8e0e8", g: "#ffffff",
    stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2,
    d: "#04303a", m: "#08788c", l: "#20b8d8", a: "#38e0f0", g: "#b0f8ff",
    stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3,
    d: "#3a1804", m: "#a85808", l: "#e89018", a: "#f8b830", g: "#ffe080",
    stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4,
    d: "#2a0848", m: "#6a18a0", l: "#a040e0", a: "#c868f8", g: "#e8b8ff",
    stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5,
    d: "#3a0428", m: "#a01860", l: "#e02880", a: "#f85898", g: "#ffb8d0",
    stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",    ru: "Божество",  rankIdx: 6,
    d: "#3a0404", m: "#a01010", l: "#e82828", a: "#f85858", g: "#ffb0b0",
    stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal",  ru: "Титан",     rankIdx: 7,
    d: "#1a0404", m: "#6a0a0a", l: "#a81818", a: "#d83828",
    g: "#ffe080",
    gold: "#fbbf24", goldLight: "#fff8d0", marble: "#f0e8d8", marbleDark: "#a09880",
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
    "@keyframes medalPulse{0%,100%{filter:drop-shadow(0 0 3px var(--mglow))}50%{filter:drop-shadow(0 0 7px var(--mglow))}}" +
    "@keyframes medalFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}" +
    "@keyframes medalSparkle{0%,100%{opacity:0.15;transform:scale(0.7)}50%{opacity:0.6;transform:scale(1.05)}}" +
    ".medal-svg{animation:medalPulse 3.4s ease-in-out infinite;will-change:filter}" +
    ".medal-svg.medal-float{animation:medalPulse 3.4s ease-in-out infinite, medalFloat 4s ease-in-out infinite}" +
    ".medal-svg.medal-float-high{animation:medalPulse 2.8s ease-in-out infinite, medalFloat 3.4s ease-in-out infinite}" +
    ".medal-svg .sparkle{animation:medalSparkle 2.6s ease-in-out infinite;transform-origin:center;transform-box:fill-box}" +
    ".medal-svg .sparkle.d1{animation-delay:0s}" +
    ".medal-svg .sparkle.d2{animation-delay:0.65s}" +
    ".medal-svg .sparkle.d3{animation-delay:1.3s}" +
    ".medal-svg .sparkle.d4{animation-delay:1.95s}" +
    "@keyframes rankArrowPulse{0%,100%{transform:translateX(0);opacity:0.7}50%{transform:translateX(4px);opacity:1}}" +
    "@keyframes rankNewPop{0%{transform:scale(0.6);opacity:0}60%{transform:scale(1.18);opacity:1}100%{transform:scale(1.15);opacity:1}}" +
    ".rank-arrow-anim{animation:rankArrowPulse 1.2s ease-in-out infinite}" +
    ".rank-new-pop{animation:rankNewPop 0.7s cubic-bezier(0.34,1.56,0.64,1) both}";
  document.head.appendChild(s);
}

/* ─── КРЫЛЬЯ: многослойные с прожилками ─── */
function sideFeathers(rankIdx, cfg) {
  if (rankIdx < 2) return "";
  var a = cfg.a;
  var l = cfg.l;
  var g = cfg.g;
  var fill1 = cfg.gold || a;
  var fill2 = cfg.goldLight || l;
  var darkEdge = cfg.d;

  var count = Math.min(6 + (rankIdx - 2), 10); // больше перьев
  var baseLen = 26 + rankIdx * 2.2;
  var baseWidth = 9 + rankIdx * 0.7;

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
    // Основная лопасть
    out += '<path d="M ' + bAx.toFixed(1) + ' ' + bAy.toFixed(1) +
      ' Q ' + (midX - px * 1.15).toFixed(1) + ' ' + (midY - py * 1.15).toFixed(1) + ' ' + tipX.toFixed(1) + ' ' + tipY.toFixed(1) +
      ' Q ' + (midX + px * 1.15).toFixed(1) + ' ' + (midY + py * 1.15).toFixed(1) + ' ' + bBx.toFixed(1) + ' ' + bBy.toFixed(1) +
      ' Z" fill="' + color + '" stroke="' + darkEdge + '" stroke-width="0.8" stroke-opacity="0.9"/>';
    // Центральная прожилка
    out += '<path d="M ' + (p.x - px * 0.35).toFixed(1) + ' ' + (p.y - py * 0.35).toFixed(1) +
      ' Q ' + (midX - px * 0.35).toFixed(1) + ' ' + (midY - py * 0.35).toFixed(1) + ' ' + (tipX - ux * 2).toFixed(1) + ' ' + (tipY - uy * 2).toFixed(1) +
      ' L ' + (tipX - ux * 2 + px * 0.4).toFixed(1) + ' ' + (tipY - uy * 2 + py * 0.4).toFixed(1) +
      ' Q ' + (midX + px * 0.1).toFixed(1) + ' ' + (midY + py * 0.1).toFixed(1) + ' ' + (p.x + px * 0.15).toFixed(1) + ' ' + (p.y + py * 0.15).toFixed(1) +
      ' Z" fill="' + g + '" opacity="0.35"/>';
    // Дополнительные прожилки
    out += '<path d="M ' + (p.x - px * 0.2).toFixed(1) + ' ' + (p.y - py * 0.2).toFixed(1) +
      ' Q ' + (midX - px * 0.2).toFixed(1) + ' ' + (midY - py * 0.2).toFixed(1) + ' ' + (tipX - ux * 3).toFixed(1) + ' ' + (tipY - uy * 3).toFixed(1) +
      '" stroke="' + g + '" stroke-width="0.5" fill="none" opacity="0.5"/>';
    out += '<path d="M ' + (p.x + px * 0.1).toFixed(1) + ' ' + (p.y + py * 0.1).toFixed(1) +
      ' Q ' + (midX + px * 0.1).toFixed(1) + ' ' + (midY + py * 0.1).toFixed(1) + ' ' + (tipX - ux * 3).toFixed(1) + ' ' + (tipY - uy * 3).toFixed(1) +
      '" stroke="' + g + '" stroke-width="0.5" fill="none" opacity="0.5"/>';
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
    var lenF = 0.7 + Math.sin(tL * Math.PI) * 0.35;
    var W = baseWidth * (0.85 + Math.sin(tL * Math.PI) * 0.3);
    out += drawFeather(pL, baseLen * lenF, W, (li % 2 === 0) ? fill1 : fill2);
  }
  out += '</g>';

  out += '<g>';
  for (var ri = 0; ri < leftOrder.length; ri++) {
    var tR = leftOrder[ri];
    var pR = rightPoint(tR);
    var lenFR = 0.7 + Math.sin(tR * Math.PI) * 0.35;
    var W2 = baseWidth * (0.85 + Math.sin(tR * Math.PI) * 0.3);
    out += drawFeather(pR, baseLen * lenFR, W2, (ri % 2 === 0) ? fill1 : fill2);
  }
  out += '</g>';

  return out;
}

/* ─── УГЛОВЫЕ ПИКИ (усложнённые) ─── */
function cornerSpikes(cfg) {
  var a = cfg.a;
  var g = cfg.g;
  var edge = cfg.gold || g;
  var edgeLight = cfg.goldLight || "#fff";
  return '' +
    // Верхний
    '<path d="M100 14 L114 44 L100 52 L86 44 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.8"/>' +
    '<path d="M100 20 L108 40 L100 46 L92 40 Z" fill="' + edgeLight + '" opacity="0.7"/>' +
    '<path d="M100 26 L103 38 L100 42 L97 38 Z" fill="#fff" opacity="0.6"/>' +
    '<circle cx="100" cy="30" r="1.5" fill="' + edge + '"/>' +
    // Нижний
    '<path d="M100 186 L114 156 L100 148 L86 156 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.8"/>' +
    '<path d="M100 180 L108 160 L100 154 L92 160 Z" fill="' + edgeLight + '" opacity="0.7"/>' +
    '<path d="M100 174 L103 162 L100 158 L97 162 Z" fill="#fff" opacity="0.6"/>' +
    '<circle cx="100" cy="170" r="1.5" fill="' + edge + '"/>' +
    // Левый
    '<path d="M14 100 L44 86 L52 100 L44 114 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.8"/>' +
    '<path d="M20 100 L40 92 L46 100 L40 108 Z" fill="' + edgeLight + '" opacity="0.7"/>' +
    '<path d="M26 100 L38 97 L42 100 L38 103 Z" fill="#fff" opacity="0.6"/>' +
    '<circle cx="30" cy="100" r="1.5" fill="' + edge + '"/>' +
    // Правый
    '<path d="M186 100 L156 86 L148 100 L156 114 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.8"/>' +
    '<path d="M180 100 L160 92 L154 100 L160 108 Z" fill="' + edgeLight + '" opacity="0.7"/>' +
    '<path d="M174 100 L162 97 L158 100 L162 103 Z" fill="#fff" opacity="0.6"/>' +
    '<circle cx="170" cy="100" r="1.5" fill="' + edge + '"/>';
}

/* ─── ВНУТРЕННИЙ ОРНАМЕНТ (детальнее) ─── */
function innerOrnament(cfg) {
  var g = cfg.g;
  var d = cfg.d;
  var out = "";
  // 4 ромба по осям
  var pts = [
    { x: 100, y: 76 }, { x: 152, y: 122 },
    { x: 100, y: 168 }, { x: 48, y: 122 }
  ];
  for (var i = 0; i < pts.length; i++) {
    var p = pts[i];
    out += '<path d="M ' + p.x + ' ' + (p.y - 6) + ' L ' + (p.x + 6) + ' ' + p.y + ' L ' + p.x + ' ' + (p.y + 6) + ' L ' + (p.x - 6) + ' ' + p.y + ' Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.8"/>';
    out += '<path d="M ' + p.x + ' ' + (p.y - 3) + ' L ' + (p.x + 3) + ' ' + p.y + ' L ' + p.x + ' ' + (p.y + 3) + ' L ' + (p.x - 3) + ' ' + p.y + ' Z" fill="#fff" opacity="0.85"/>';
    out += '<circle cx="' + p.x + '" cy="' + p.y + '" r="1" fill="' + d + '"/>';
  }
  // Диагональные точки (8 штук)
  var diag = [
    { x: 128, y: 92 }, { x: 128, y: 152 },
    { x: 72, y: 92 }, { x: 72, y: 152 },
    { x: 90, y: 84 }, { x: 110, y: 84 },
    { x: 90, y: 160 }, { x: 110, y: 160 }
  ];
  for (var k = 0; k < diag.length; k++) {
    var q = diag[k];
    out += '<circle cx="' + q.x + '" cy="' + q.y + '" r="2.2" fill="' + g + '" stroke="' + d + '" stroke-width="0.6"/>';
    out += '<circle cx="' + q.x + '" cy="' + q.y + '" r="0.9" fill="#fff" opacity="0.9"/>';
  }
  // Соединительные линии
  out += '<path d="M100 76 L128 92 M100 76 L72 92 M100 168 L128 152 M100 168 L72 152" stroke="' + g + '" stroke-width="0.4" opacity="0.3"/>';
  return out;
}

/* ─── МЕРЦАЮЩИЕ ИСКРЫ (усложнённые) ─── */
function sparklesAround(rankIdx, cfg) {
  if (rankIdx < 4) return "";
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
  var limit = rankIdx >= 6 ? 12 : (rankIdx >= 5 ? 8 : 6);
  for (var i = 0; i < limit && i < positions.length; i++) {
    var p = positions[i];
    var r = rankIdx >= 6 ? 2.2 : 1.8;
    out += '<circle class="sparkle ' + p.d + '" cx="' + p.x + '" cy="' + p.y + '" r="' + r + '" fill="' + g + '"/>';
    if (rankIdx >= 6) {
      out += '<path d="M' + (p.x - r * 2) + ' ' + p.y + ' L' + (p.x + r * 2) + ' ' + p.y + ' M' + p.x + ' ' + (p.y - r * 2) + ' L' + p.x + ' ' + (p.y + r * 2) + '" stroke="' + g + '" stroke-width="0.5" opacity="0.5"/>';
    }
  }
  out += '</g>';
  return out;
}

/* ─── СИМВОЛЫ (детализированные) ─── */
function rankSymbol(rankIdx, cfg) {
  var a = cfg.a;
  var g = cfg.g;
  var d = cfg.d;
  var gold = cfg.gold || null;
  var goldLight = cfg.goldLight || "#fff";

  /* 0 — Tango (больше листьев и прожилок) */
  if (rankIdx === 0) {
    return '' +
      '<line x1="100" y1="70" x2="100" y2="114" stroke="' + g + '" stroke-width="2.6" stroke-linecap="round"/>' +
      '<path d="M100 80 Q86 72 80 84 Q88 96 100 98 Q112 96 120 84 Q114 72 100 80 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.2"/>' +
      '<line x1="100" y1="82" x2="100" y2="96" stroke="' + d + '" stroke-width="0.8" opacity="0.5"/>' +
      '<path d="M100 98 Q80 96 74 110 Q84 124 100 114 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.2"/>' +
      '<line x1="100" y1="100" x2="82" y2="110" stroke="' + d + '" stroke-width="0.8" opacity="0.5"/>' +
      '<path d="M100 98 Q120 96 126 110 Q116 124 100 114 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.2"/>' +
      '<line x1="100" y1="100" x2="118" y2="110" stroke="' + d + '" stroke-width="0.8" opacity="0.5"/>' +
      '<circle cx="100" cy="68" r="3.2" fill="' + g + '"/>' +
      '<circle cx="100" cy="68" r="1.5" fill="#fff" opacity="0.9"/>' +
      '<path d="M90 90 Q92 88 94 90" stroke="' + g + '" stroke-width="0.6" fill="none" opacity="0.7"/>' +
      '<path d="M106 90 Q108 88 110 90" stroke="' + g + '" stroke-width="0.6" fill="none" opacity="0.7"/>';
  }
  /* 1 — Stout Shield (больше заклёпок и гравировки) */
  if (rankIdx === 1) {
    return '' +
      '<path d="M100 74 Q74 78 72 98 L72 112 Q72 128 100 138 Q128 128 128 112 L128 98 Q126 78 100 74 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.8"/>' +
      '<path d="M100 82 Q84 86 83 100 L83 112 Q83 122 100 130 Q117 122 117 112 L117 100 Q116 86 100 82 Z" fill="' + d + '" opacity="0.55"/>' +
      '<line x1="100" y1="84" x2="100" y2="128" stroke="' + g + '" stroke-width="4"/>' +
      '<line x1="80" y1="104" x2="120" y2="104" stroke="' + g + '" stroke-width="4"/>' +
      '<line x1="100" y1="84" x2="100" y2="128" stroke="#fff" stroke-width="1.4" opacity="0.55"/>' +
      '<line x1="80" y1="104" x2="120" y2="104" stroke="#fff" stroke-width="1.4" opacity="0.55"/>' +
      '<circle cx="80" cy="84" r="2.6" fill="' + g + '"/>' +
      '<circle cx="120" cy="84" r="2.6" fill="' + g + '"/>' +
      '<circle cx="80" cy="124" r="2.6" fill="' + g + '"/>' +
      '<circle cx="120" cy="124" r="2.6" fill="' + g + '"/>' +
      '<circle cx="80" cy="84" r="1" fill="#fff" opacity="0.9"/>' +
      '<circle cx="120" cy="84" r="1" fill="#fff" opacity="0.9"/>' +
      '<path d="M86 92 L114 92" stroke="' + d + '" stroke-width="0.6" opacity="0.6"/>' +
      '<path d="M86 116 L114 116" stroke="' + d + '" stroke-width="0.6" opacity="0.6"/>';
  }
  /* 2 — Ring of Aquila (больше лучей) */
  if (rankIdx === 2) {
    return '' +
      '<circle cx="100" cy="104" r="26" fill="none" stroke="' + a + '" stroke-width="4"/>' +
      '<circle cx="100" cy="104" r="22" fill="none" stroke="' + g + '" stroke-width="1.4" opacity="0.8"/>' +
      '<path d="M100 82 L95 96 L82 96 L92 106 L88 120 L100 110 L112 120 L108 106 L118 96 L105 96 Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.9"/>' +
      '<circle cx="100" cy="102" r="3.5" fill="' + d + '"/>' +
      '<circle cx="100" cy="102" r="1.5" fill="' + g + '"/>' +
      '<circle cx="100" cy="76" r="2.8" fill="' + g + '"/>' +
      '<circle cx="100" cy="132" r="2.8" fill="' + g + '"/>' +
      '<circle cx="72" cy="104" r="2.8" fill="' + g + '"/>' +
      '<circle cx="128" cy="104" r="2.8" fill="' + g + '"/>' +
      // дополнительные лучи
      '<path d="M100 76 L100 68 M100 132 L100 140 M72 104 L64 104 M128 104 L136 104" stroke="' + g + '" stroke-width="1.2" opacity="0.7"/>' +
      '<path d="M85 85 L78 78 M115 85 L122 78 M85 123 L78 130 M115 123 L122 130" stroke="' + g + '" stroke-width="0.8" opacity="0.5"/>';
  }
  /* 3 — Eul's Scepter (больше граней на кристалле) */
  if (rankIdx === 3) {
    return '' +
      '<path d="M100 64 L116 86 L100 100 L84 86 Z" fill="' + g + '" stroke="' + a + '" stroke-width="1.8"/>' +
      '<path d="M100 70 L110 86 L100 96 L90 86 Z" fill="#fff" opacity="0.6"/>' +
      '<path d="M100 64 L100 100 M84 86 L116 86" stroke="' + a + '" stroke-width="0.6" opacity="0.5"/>' +
      '<rect x="94" y="100" width="12" height="40" fill="' + a + '" rx="2.5" stroke="' + g + '" stroke-width="1"/>' +
      '<rect x="98" y="102" width="4" height="36" fill="' + g + '" opacity="0.5"/>' +
      '<path d="M84 84 Q72 80 74 96 Q82 100 84 96" fill="' + a + '" fill-opacity="0.6" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M116 84 Q128 80 126 96 Q118 100 116 96" fill="' + a + '" fill-opacity="0.6" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="142" rx="8" ry="3.2" fill="' + a + '" stroke="' + g + '" stroke-width="1"/>' +
      '<circle cx="76" cy="76" r="1.5" fill="' + g + '"/>' +
      '<circle cx="124" cy="76" r="1.5" fill="' + g + '"/>' +
      '<path d="M90 90 L96 84 M110 90 L104 84" stroke="' + g + '" stroke-width="0.5" opacity="0.6"/>';
  }
  /* 4 — BKB (детализированный молот) */
  if (rankIdx === 4) {
    return '' +
      '<rect x="94" y="94" width="12" height="46" fill="' + a + '" rx="2.5" stroke="' + g + '" stroke-width="1"/>' +
      '<rect x="98" y="96" width="4" height="42" fill="' + g + '" opacity="0.5"/>' +
      '<path d="M78 78 Q100 66 122 78 L122 96 Q100 106 78 96 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.8"/>' +
      '<path d="M82 82 Q100 74 118 82 L118 94 Q100 100 82 94 Z" fill="' + d + '" opacity="0.55"/>' +
      '<circle cx="100" cy="86" r="7" fill="' + g + '"/>' +
      '<circle cx="100" cy="86" r="4" fill="' + a + '"/>' +
      '<circle cx="100" cy="86" r="1.8" fill="#fff"/>' +
      '<line x1="86" y1="76" x2="84" y2="72" stroke="' + g + '" stroke-width="1.6" stroke-linecap="round"/>' +
      '<line x1="114" y1="76" x2="116" y2="72" stroke="' + g + '" stroke-width="1.6" stroke-linecap="round"/>' +
      '<ellipse cx="100" cy="142" rx="8" ry="3.2" fill="' + a + '" stroke="' + g + '" stroke-width="1"/>' +
      '<path d="M92 80 L108 80" stroke="' + d + '" stroke-width="0.6" opacity="0.6"/>' +
      '<path d="M92 92 L108 92" stroke="' + d + '" stroke-width="0.6" opacity="0.6"/>' +
      '<circle cx="100" cy="86" r="10" fill="none" stroke="' + g + '" stroke-width="0.4" opacity="0.4"/>';
  }
  /* 5 — Manta Style (больше иллюзий) */
  if (rankIdx === 5) {
    return '' +
      // 3 ромба (добавлен 4-й как фон)
      '<path d="M64 104 L72 88 L80 104 L72 120 Z" fill="' + a + '" opacity="0.3" stroke="' + g + '" stroke-width="0.5"/>' +
      '<path d="M136 104 L128 88 L120 104 L128 120 Z" fill="' + a + '" opacity="0.3" stroke="' + g + '" stroke-width="0.5"/>' +
      '<path d="M72 104 L82 84 L92 104 L82 124 Z" fill="' + a + '" opacity="0.6" stroke="' + g + '" stroke-width="0.9"/>' +
      '<path d="M76 104 L82 92 L88 104 L82 116 Z" fill="' + g + '" opacity="0.55"/>' +
      '<path d="M79 104 L82 98 L85 104 L82 110 Z" fill="#fff" opacity="0.7"/>' +
      '<path d="M128 104 L118 84 L108 104 L118 124 Z" fill="' + a + '" opacity="0.6" stroke="' + g + '" stroke-width="0.9"/>' +
      '<path d="M124 104 L118 92 L112 104 L118 116 Z" fill="' + g + '" opacity="0.55"/>' +
      '<path d="M121 104 L118 98 L115 104 L118 110 Z" fill="#fff" opacity="0.7"/>' +
      '<path d="M100 74 L128 104 L100 134 L72 104 Z" fill="' + a + '" stroke="' + g + '" stroke-width="2"/>' +
      '<path d="M100 84 L118 104 L100 124 L82 104 Z" fill="' + d + '" opacity="0.7"/>' +
      '<path d="M100 92 L108 104 L100 116 L92 104 Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.8"/>' +
      '<path d="M100 97 L104 104 L100 111 L96 104 Z" fill="#fff" opacity="0.85"/>' +
      '<circle cx="100" cy="74" r="3" fill="' + g + '" stroke="' + d + '" stroke-width="0.7"/>' +
      '<circle cx="100" cy="134" r="3" fill="' + g + '" stroke="' + d + '" stroke-width="0.7"/>' +
      '<circle cx="72" cy="104" r="3" fill="' + g + '" stroke="' + d + '" stroke-width="0.7"/>' +
      '<circle cx="128" cy="104" r="3" fill="' + g + '" stroke="' + d + '" stroke-width="0.7"/>' +
      '<circle cx="64" cy="104" r="2" fill="' + g + '" opacity="0.6"/>' +
      '<circle cx="136" cy="104" r="2" fill="' + g + '" opacity="0.6"/>';
  }
  /* 6 — Divine Rapier (больше граней) */
  if (rankIdx === 6) {
    return '' +
      '<path d="M100 62 L105 82 L105 118 L95 118 L95 82 Z" fill="' + g + '" stroke="' + d + '" stroke-width="1"/>' +
      '<path d="M100 62 L102 82 L102 118 L100 118 Z" fill="#fff" opacity="0.65"/>' +
      '<path d="M100 62 L100 118" stroke="' + a + '" stroke-width="0.6" opacity="0.5"/>' +
      '<rect x="82" y="118" width="36" height="6" fill="' + a + '" rx="3" stroke="' + g + '" stroke-width="1"/>' +
      '<circle cx="82" cy="121" r="3.5" fill="' + g + '" stroke="' + a + '" stroke-width="0.8"/>' +
      '<circle cx="118" cy="121" r="3.5" fill="' + g + '" stroke="' + a + '" stroke-width="0.8"/>' +
      '<circle cx="82" cy="121" r="1.4" fill="#fff" opacity="0.9"/>' +
      '<circle cx="118" cy="121" r="1.4" fill="#fff" opacity="0.9"/>' +
      '<rect x="95" y="124" width="10" height="16" fill="' + a + '" rx="2.5" stroke="' + g + '" stroke-width="0.8"/>' +
      '<line x1="97.5" y1="126" x2="97.5" y2="138" stroke="' + g + '" stroke-width="0.8" opacity="0.7"/>' +
      '<line x1="102.5" y1="126" x2="102.5" y2="138" stroke="' + g + '" stroke-width="0.8" opacity="0.7"/>' +
      '<path d="M100 140 L105 148 L100 156 L95 148 Z" fill="' + g + '" stroke="' + a + '" stroke-width="0.9"/>' +
      '<path d="M100 143 L102.5 148 L100 153 L97.5 148 Z" fill="#fff" opacity="0.8"/>' +
      // грани клинка
      '<path d="M100 64 L101 82 L101 118" stroke="' + d + '" stroke-width="0.3" opacity="0.5"/>' +
      '<path d="M100 64 L99 82 L99 118" stroke="' + d + '" stroke-width="0.3" opacity="0.5"/>' +
      // блики
      '<circle cx="100" cy="90" r="2" fill="#fff" opacity="0.4"/>' +
      '<circle cx="100" cy="105" r="1.5" fill="#fff" opacity="0.3"/>';
  }
  /* 7 — Aegis (максимальная детализация) */
  var goldStroke = gold || g;
  var goldGlow = goldLight || g;
  var marble = cfg.marble || "#f0e8d8";
  var marbleDark = cfg.marbleDark || "#a09880";

  return '' +
    // Щит
    '<path d="M100 62 Q100 58 100 56 L100 56 Q80 62 72 80 L70 100 L70 116 Q70 136 100 148 Q130 136 130 116 L130 100 L128 80 Q120 62 100 56 Z" fill="' + a + '" stroke="' + goldStroke + '" stroke-width="2.4" stroke-linejoin="round"/>' +
    '<path d="M100 72 Q90 76 84 90 L82 100 L82 114 Q82 130 100 140 Q118 130 118 114 L118 100 L116 90 Q110 76 100 72 Z" fill="' + d + '" opacity="0.75"/>' +
    '<path d="M100 72 Q90 76 84 90 L82 100 L82 114 Q82 130 100 140 Q118 130 118 114 L118 100 L116 90 Q110 76 100 72 Z" fill="none" stroke="' + goldStroke + '" stroke-width="1" opacity="0.85"/>' +
    // Свод
    '<path d="M84 82 Q100 70 116 82" fill="none" stroke="' + goldStroke + '" stroke-width="1.6" opacity="0.9"/>' +
    // Голова (мрамор)
    '<ellipse cx="100" cy="108" rx="15" ry="18" fill="' + marble + '" stroke="' + marbleDark + '" stroke-width="1"/>' +
    '<path d="M100 90 Q112 92 115 108 Q115 122 100 126 Z" fill="' + marbleDark + '" opacity="0.35"/>' +
    '<path d="M100 90 Q90 92 87 106 Q88 116 96 122 Q92 112 94 102 Q96 94 100 90 Z" fill="#fff" opacity="0.45"/>' +
    // Глаза (закрытые)
    '<path d="M88 106 Q92 102 96 106" stroke="' + marbleDark + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M104 106 Q108 102 112 106" stroke="' + marbleDark + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M89 108 Q93 110 95 108" stroke="' + marbleDark + '" stroke-width="0.7" fill="none" opacity="0.6"/>' +
    '<path d="M105 108 Q107 110 111 108" stroke="' + marbleDark + '" stroke-width="0.7" fill="none" opacity="0.6"/>' +
    // Нос и рот
    '<path d="M100 104 L100 114" stroke="' + marbleDark + '" stroke-width="0.9" fill="none" opacity="0.7"/>' +
    '<path d="M97 115 Q100 116 103 115" stroke="' + marbleDark + '" stroke-width="0.8" fill="none" opacity="0.7"/>' +
    '<path d="M97 120 L103 120" stroke="' + marbleDark + '" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.7"/>' +
    // Скулы
    '<path d="M88 116 Q90 120 92 122" stroke="' + marbleDark + '" stroke-width="0.5" fill="none" opacity="0.4"/>' +
    '<path d="M112 116 Q110 120 108 122" stroke="' + marbleDark + '" stroke-width="0.5" fill="none" opacity="0.4"/>' +
    // Шлем-повязка
    '<path d="M86 90 Q100 84 114 90 L114 92 Q100 86 86 92 Z" fill="' + goldStroke + '" opacity="0.8"/>' +
    '<circle cx="100" cy="88" r="2" fill="' + goldGlow + '"/>' +
    // Крылья Aegis (больше слоёв)
    '<path d="M84 92 Q70 82 62 92 Q72 96 82 96 Z" fill="' + goldGlow + '" opacity="0.85" stroke="' + goldStroke + '" stroke-width="0.6"/>' +
    '<path d="M84 96 Q72 92 64 100 Q74 102 82 100 Z" fill="' + goldGlow + '" opacity="0.7" stroke="' + goldStroke + '" stroke-width="0.5"/>' +
    '<path d="M116 92 Q130 82 138 92 Q128 96 118 96 Z" fill="' + goldGlow + '" opacity="0.85" stroke="' + goldStroke + '" stroke-width="0.6"/>' +
    '<path d="M116 96 Q128 92 136 100 Q126 102 118 100 Z" fill="' + goldGlow + '" opacity="0.7" stroke="' + goldStroke + '" stroke-width="0.5"/>' +
    '<path d="M84 104 Q74 100 68 106 Q76 108 82 106 Z" fill="' + goldGlow + '" opacity="0.6" stroke="' + goldStroke + '" stroke-width="0.4"/>' +
    '<path d="M116 104 Q126 100 132 106 Q124 108 118 106 Z" fill="' + goldGlow + '" opacity="0.6" stroke="' + goldStroke + '" stroke-width="0.4"/>' +
    // Лучи славы (больше)
    '<line x1="100" y1="54" x2="100" y2="48" stroke="' + goldStroke + '" stroke-width="2" stroke-linecap="round"/>' +
    '<line x1="88" y1="58" x2="84" y2="52" stroke="' + goldStroke + '" stroke-width="1.6" stroke-linecap="round"/>' +
    '<line x1="112" y1="58" x2="116" y2="52" stroke="' + goldStroke + '" stroke-width="1.6" stroke-linecap="round"/>' +
    '<line x1="78" y1="68" x2="72" y2="64" stroke="' + goldStroke + '" stroke-width="1.4" stroke-linecap="round"/>' +
    '<line x1="122" y1="68" x2="128" y2="64" stroke="' + goldStroke + '" stroke-width="1.4" stroke-linecap="round"/>' +
    '<line x1="72" y1="80" x2="66" y2="78" stroke="' + goldStroke + '" stroke-width="1.2" stroke-linecap="round"/>' +
    '<line x1="128" y1="80" x2="134" y2="78" stroke="' + goldStroke + '" stroke-width="1.2" stroke-linecap="round"/>' +
    // Заклёпки
    '<circle cx="80" cy="94" r="2" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.5"/>' +
    '<circle cx="120" cy="94" r="2" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.5"/>' +
    '<circle cx="80" cy="126" r="2" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.5"/>' +
    '<circle cx="120" cy="126" r="2" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.5"/>' +
    '<circle cx="80" cy="94" r="0.7" fill="#fff" opacity="0.9"/>' +
    '<circle cx="120" cy="94" r="0.7" fill="#fff" opacity="0.9"/>' +
    // Текстура мрамора (прожилки)
    '<path d="M95 100 Q98 104 95 110" stroke="' + marbleDark + '" stroke-width="0.3" fill="none" opacity="0.4"/>' +
    '<path d="M105 102 Q102 108 105 114" stroke="' + marbleDark + '" stroke-width="0.3" fill="none" opacity="0.4"/>';
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
  var gidTexture = "gt" + rankIdx + "_" + uid;
  var strokeOuter = cfg.gold || cfg.g;
  var strokeInner = cfg.goldLight || cfg.g;

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
      '<linearGradient id="' + gidShine + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#fff" stop-opacity="0.4"/>' +
        '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
      '</linearGradient>' +
      '<radialGradient id="' + gidRad + '" cx="50%" cy="50%" r="55%">' +
        '<stop offset="0%" stop-color="' + cfg.g + '" stop-opacity="0.4"/>' +
        '<stop offset="100%" stop-color="' + cfg.g + '" stop-opacity="0"/>' +
      '</radialGradient>' +
      '<filter id="' + gidEdge + '" x="-20%" y="-20%" width="140%" height="140%">' +
        '<feDropShadow dx="0" dy="0" stdDeviation="0.8" flood-color="' + cfg.d + '" flood-opacity="1"/>' +
      '</filter>' +
      '<pattern id="' + gidTexture + '" width="4" height="4" patternUnits="userSpaceOnUse">' +
        '<circle cx="2" cy="2" r="0.5" fill="' + cfg.g + '" opacity="0.15"/>' +
      '</pattern>' +
    '</defs>' +
    (animate ? sparklesAround(rankIdx, cfg) : "") +
    sideFeathers(rankIdx, cfg) +
    cornerSpikes(cfg) +
    // Внешний ромб
    '<path d="M100 38 L162 100 L100 162 L38 100 Z" fill="url(#' + gid + ')" stroke="' + strokeOuter + '" stroke-width="2" filter="url(#' + gidEdge + ')"/>' +
    // Текстура
    '<path d="M100 38 L162 100 L100 162 L38 100 Z" fill="url(#' + gidTexture + ')" opacity="0.5"/>' +
    // Блик
    '<path d="M100 40 L160 100 L100 100 Z" fill="url(#' + gidShine + ')"/>' +
    // Внутренняя обводка
    '<path d="M100 48 L152 100 L100 152 L48 100 Z" fill="none" stroke="' + strokeInner + '" stroke-width="0.8" opacity="0.7"/>' +
    // Внутренний ромб
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + gidIn + ')" stroke="' + cfg.a + '" stroke-width="1.6"/>' +
    // Свечение
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + gidRad + ')"/>' +
    // Тонкая обводка внутри
    '<path d="M100 68 L136 100 L100 132 L64 100 Z" fill="none" stroke="' + strokeOuter + '" stroke-width="1" opacity="0.75"/>' +
    innerOrnament(cfg) +
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
      '<linearGradient id="' + qid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#4a3a5a"/>' +
        '<stop offset="100%" stop-color="#1a1226"/>' +
      '</linearGradient>' +
      '<linearGradient id="' + qidIn + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#2a1e3a"/>' +
        '<stop offset="100%" stop-color="#0b0810"/>' +
      '</linearGradient>' +
    '</defs>' +
    '<path d="M100 38 L162 100 L100 162 L38 100 Z" fill="url(#' + qid + ')" stroke="#8b5cf6" stroke-width="1.6" stroke-dasharray="5 4"/>' +
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + qidIn + ')" stroke="#8b5cf6" stroke-width="1.3"/>' +
    '<text x="100" y="122" text-anchor="middle" font-size="64" font-weight="900" fill="#a78bfa" font-family="sans-serif">?</text>';

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

console.log("rating v22.0 ready (detailed medals, more ornament, richer symbols)");
