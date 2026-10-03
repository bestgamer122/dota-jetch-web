/* DOTA JETCH — RATING v15.0
   РАДИКАЛЬНО разные цвета + крупные детали:
   1. Рекрут    — ИЗУМРУД (зелёный)
   2. Страж     — ПЛАТИНА (светло-серый/белый)
   3. Рыцарь    — МОРСКОЙ (циан)
   4. Герой     — ЯНТАРЬ (золотисто-оранжевый) ← НЕ зелёный!
   5. Легенда   — ПУРПУР (фиолет)
   6. Властелин — МАЛИНА (розово-красный) ← НЕ синий!
   7. Божество  — АЛЫЙ (ярко-красный)
   8. Титан     — БОРДО + ЗОЛОТО
   + Блики, орнамент, многослойные крылья */

var RATING_TABLE = [
  /* 1. РЕКРУТ — изумрудно-зелёный */
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0,
    d: "#043818", m: "#0a8040", l: "#28c050", a: "#40e870", g: "#a0ffb8",
    stars: [0, 150, 300, 460, 610] },
  /* 2. СТРАЖ — платиново-белый (СВЕТЛЫЙ!) */
  { name: "Guardian",  ru: "Страж",     rankIdx: 1,
    d: "#384048", m: "#687078", l: "#a8b0b8", a: "#d8e0e8", g: "#ffffff",
    stars: [770, 920, 1080, 1230, 1400] },
  /* 3. РЫЦАРЬ — морской голубой */
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2,
    d: "#04303a", m: "#08788c", l: "#20b8d8", a: "#38e0f0", g: "#b0f8ff",
    stars: [1540, 1700, 1850, 2000, 2150] },
  /* 4. ГЕРОЙ — ЯНТАРНЫЙ (золотисто-оранжевый) — НЕ зелёный! */
  { name: "Archon",    ru: "Герой",     rankIdx: 3,
    d: "#3a1804", m: "#a85808", l: "#e89018", a: "#f8b830", g: "#ffe080",
    stars: [2310, 2450, 2610, 2770, 2930] },
  /* 5. ЛЕГЕНДА — пурпурный */
  { name: "Legend",    ru: "Легенда",   rankIdx: 4,
    d: "#2a0848", m: "#6a18a0", l: "#a040e0", a: "#c868f8", g: "#e8b8ff",
    stars: [3080, 3230, 3390, 3540, 3700] },
  /* 6. ВЛАСТЕЛИН — малиново-розовый — НЕ синий! */
  { name: "Ancient",   ru: "Властелин", rankIdx: 5,
    d: "#3a0428", m: "#a01860", l: "#e02880", a: "#f85898", g: "#ffb8d0",
    stars: [3850, 4000, 4150, 4300, 4460] },
  /* 7. БОЖЕСТВО — алый ярко-красный */
  { name: "Divine",    ru: "Божество",  rankIdx: 6,
    d: "#3a0404", m: "#a01010", l: "#e82828", a: "#f85858", g: "#ffb0b0",
    stars: [4620, 4820, 5020, 5220, 5420] },
  /* 8. ТИТАН — бордовый + золото */
  { name: "Immortal",  ru: "Титан",     rankIdx: 7,
    d: "#280404", m: "#781010", l: "#b82820", a: "#e04838",
    g: "#ffd860",
    gold: "#fbbf24", goldLight: "#fff4c8",
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
    ".rating-tile-anim{animation:ratingTileIn 0.4s cubic-bezier(0.34,1.56,0.64,1) both}";
  document.head.appendChild(s);
}

/* ─── Крупные боковые перья ─── */
function sideFeathers(rankIdx, cfg) {
  if (rankIdx < 2) return "";
  var a = cfg.a;
  var l = cfg.l;
  var g = cfg.g;
  var opacity = Math.min(1, 0.65 + rankIdx * 0.05);
  var levels = Math.min(rankIdx, 6);
  var out = "";

  /* ЛЕВОЕ крыло */
  out += '<g opacity="' + opacity.toFixed(2) + '">';
  for (var i = 0; i < levels; i++) {
    var yS = 84 + i * 10;
    var xS = 36;
    var xE = 0 - i * 2;
    var h = 10;
    out += '<path d="M ' + xS + ' ' + yS +
      ' Q ' + (xS - 14) + ' ' + (yS - h) + ' ' + xE + ' ' + (yS - 3) +
      ' Q ' + (xS - 16) + ' ' + (yS + h * 0.7) + ' ' + xS + ' ' + (yS + h) + ' Z" fill="' + (i % 2 === 0 ? a : l) + '" stroke="' + g + '" stroke-width="0.5" stroke-opacity="0.7"/>';
    out += '<path d="M ' + (xS - 3) + ' ' + (yS + 3) + ' Q ' + (xS - 12) + ' ' + (yS - 2) + ' ' + (xE + 4) + ' ' + (yS - 1) + '" stroke="' + g + '" stroke-width="1" opacity="0.85" fill="none"/>';
    out += '<circle cx="' + xE + '" cy="' + (yS - 1) + '" r="1.5" fill="' + g + '"/>';
  }
  out += '</g>';

  /* ПРАВОЕ крыло */
  out += '<g opacity="' + opacity.toFixed(2) + '">';
  for (var j = 0; j < levels; j++) {
    var yS2 = 84 + j * 10;
    var xS2 = 164;
    var xE2 = 200 + j * 2;
    var h2 = 10;
    out += '<path d="M ' + xS2 + ' ' + yS2 +
      ' Q ' + (xS2 + 14) + ' ' + (yS2 - h2) + ' ' + xE2 + ' ' + (yS2 - 3) +
      ' Q ' + (xS2 + 16) + ' ' + (yS2 + h2 * 0.7) + ' ' + xS2 + ' ' + (yS2 + h2) + ' Z" fill="' + (j % 2 === 0 ? a : l) + '" stroke="' + g + '" stroke-width="0.5" stroke-opacity="0.7"/>';
    out += '<path d="M ' + (xS2 + 3) + ' ' + (yS2 + 3) + ' Q ' + (xS2 + 12) + ' ' + (yS2 - 2) + ' ' + (xE2 - 4) + ' ' + (yS2 - 1) + '" stroke="' + g + '" stroke-width="1" opacity="0.85" fill="none"/>';
    out += '<circle cx="' + xE2 + '" cy="' + (yS2 - 1) + '" r="1.5" fill="' + g + '"/>';
  }
  out += '</g>';

  return out;
}

/* ─── Угловые пики ─── */
function cornerSpikes(cfg) {
  var a = cfg.a;
  var g = cfg.g;
  var edge = cfg.gold || g;
  var edgeLight = cfg.goldLight || "#fff";
  return '' +
    /* Верх */
    '<path d="M100 14 L114 44 L100 52 L86 44 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.8"/>' +
    '<path d="M100 20 L108 40 L100 46 L92 40 Z" fill="' + edgeLight + '" opacity="0.7"/>' +
    '<path d="M100 26 L103 38 L100 42 L97 38 Z" fill="#fff" opacity="0.6"/>' +
    /* Низ */
    '<path d="M100 186 L114 156 L100 148 L86 156 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.8"/>' +
    '<path d="M100 180 L108 160 L100 154 L92 160 Z" fill="' + edgeLight + '" opacity="0.7"/>' +
    '<path d="M100 174 L103 162 L100 158 L97 162 Z" fill="#fff" opacity="0.6"/>' +
    /* Лево */
    '<path d="M14 100 L44 86 L52 100 L44 114 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.8"/>' +
    '<path d="M20 100 L40 92 L46 100 L40 108 Z" fill="' + edgeLight + '" opacity="0.7"/>' +
    '<path d="M26 100 L38 97 L42 100 L38 103 Z" fill="#fff" opacity="0.6"/>' +
    /* Право */
    '<path d="M186 100 L156 86 L148 100 L156 114 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.8"/>' +
    '<path d="M180 100 L160 92 L154 100 L160 108 Z" fill="' + edgeLight + '" opacity="0.7"/>' +
    '<path d="M174 100 L162 97 L158 100 L162 103 Z" fill="#fff" opacity="0.6"/>';
}

/* ─── Орнамент по внутреннему кольцу (8 точек + 4 ромбика) ─── */
function innerOrnament(cfg) {
  var g = cfg.g;
  var d = cfg.d;
  var out = "";
  /* 4 ромбика на осях */
  var pts = [
    { x: 100, y: 76 }, { x: 152, y: 122 },
    { x: 100, y: 168 }, { x: 48, y: 122 }
  ];
  for (var i = 0; i < pts.length; i++) {
    var p = pts[i];
    out += '<path d="M ' + p.x + ' ' + (p.y - 6) + ' L ' + (p.x + 6) + ' ' + p.y + ' L ' + p.x + ' ' + (p.y + 6) + ' L ' + (p.x - 6) + ' ' + p.y + ' Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.8"/>';
    out += '<path d="M ' + p.x + ' ' + (p.y - 3) + ' L ' + (p.x + 3) + ' ' + p.y + ' L ' + p.x + ' ' + (p.y + 3) + ' L ' + (p.x - 3) + ' ' + p.y + ' Z" fill="#fff" opacity="0.85"/>';
  }
  /* 4 малых точки между ромбиками (диагональные) */
  var diag = [
    { x: 128, y: 92 }, { x: 128, y: 152 },
    { x: 72, y: 92 }, { x: 72, y: 152 }
  ];
  for (var k = 0; k < diag.length; k++) {
    var q = diag[k];
    out += '<circle cx="' + q.x + '" cy="' + q.y + '" r="2.2" fill="' + g + '" stroke="' + d + '" stroke-width="0.6"/>';
    out += '<circle cx="' + q.x + '" cy="' + q.y + '" r="0.9" fill="#fff" opacity="0.9"/>';
  }
  return out;
}

/* ─── Символы предметов (ещё детальнее) ─── */
function rankSymbol(rankIdx, cfg) {
  var a = cfg.a;
  var g = cfg.g;
  var d = cfg.d;
  var gold = cfg.gold || null;
  var goldLight = cfg.goldLight || "#fff";

  /* 0 — Tango (3 листа + стебель + почка) */
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
      '<circle cx="100" cy="68" r="1.5" fill="#fff" opacity="0.9"/>';
  }
  /* 1 — Stout Shield */
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
      '<circle cx="120" cy="84" r="1" fill="#fff" opacity="0.9"/>';
  }
  /* 2 — Ring of Aquila */
  if (rankIdx === 2) {
    return '' +
      '<circle cx="100" cy="104" r="26" fill="none" stroke="' + a + '" stroke-width="4"/>' +
      '<circle cx="100" cy="104" r="22" fill="none" stroke="' + g + '" stroke-width="1.4" opacity="0.8"/>' +
      '<circle cx="100" cy="104" r="16" fill="none" stroke="' + a + '" stroke-width="1" opacity="0.55"/>' +
      '<path d="M100 82 L95 96 L82 96 L92 106 L88 120 L100 110 L112 120 L108 106 L118 96 L105 96 Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.9"/>' +
      '<circle cx="100" cy="102" r="3.5" fill="' + d + '"/>' +
      '<circle cx="100" cy="102" r="1.5" fill="' + g + '"/>' +
      '<circle cx="100" cy="76" r="2.8" fill="' + g + '"/>' +
      '<circle cx="100" cy="132" r="2.8" fill="' + g + '"/>' +
      '<circle cx="72" cy="104" r="2.8" fill="' + g + '"/>' +
      '<circle cx="128" cy="104" r="2.8" fill="' + g + '"/>' +
      '<circle cx="100" cy="76" r="1.1" fill="#fff" opacity="0.95"/>' +
      '<circle cx="100" cy="132" r="1.1" fill="#fff" opacity="0.95"/>';
  }
  /* 3 — Eul's Scepter (детальный посох) */
  if (rankIdx === 3) {
    return '' +
      /* Кристалл с гранями */
      '<path d="M100 64 L116 86 L100 100 L84 86 Z" fill="' + g + '" stroke="' + a + '" stroke-width="1.8"/>' +
      '<path d="M100 70 L110 86 L100 96 L90 86 Z" fill="#fff" opacity="0.6"/>' +
      '<path d="M100 64 L100 100 M84 86 L116 86" stroke="' + a + '" stroke-width="0.7" opacity="0.6"/>' +
      /* Посох */
      '<rect x="94" y="100" width="12" height="40" fill="' + a + '" rx="2.5" stroke="' + g + '" stroke-width="1"/>' +
      '<rect x="98" y="102" width="4" height="36" fill="' + g + '" opacity="0.5"/>' +
      /* Крылья */
      '<path d="M84 84 Q72 80 74 96 Q82 100 84 96" fill="' + a + '" fill-opacity="0.6" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/>' +
      '<path d="M116 84 Q128 80 126 96 Q118 100 116 96" fill="' + a + '" fill-opacity="0.6" stroke="' + a + '" stroke-width="2.2" stroke-linecap="round"/>' +
      /* Основание */
      '<ellipse cx="100" cy="142" rx="8" ry="3.2" fill="' + a + '" stroke="' + g + '" stroke-width="1"/>' +
      /* Искры */
      '<circle cx="76" cy="76" r="1.5" fill="' + g + '"/>' +
      '<circle cx="124" cy="76" r="1.5" fill="' + g + '"/>';
  }
  /* 4 — BKB (молот) */
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
      '<ellipse cx="100" cy="142" rx="8" ry="3.2" fill="' + a + '" stroke="' + g + '" stroke-width="1"/>';
  }
  /* 5 — Manta Style */
  if (rankIdx === 5) {
    return '' +
      /* Левый ромб */
      '<path d="M72 104 L82 84 L92 104 L82 124 Z" fill="' + a + '" opacity="0.6" stroke="' + g + '" stroke-width="0.9"/>' +
      '<path d="M76 104 L82 92 L88 104 L82 116 Z" fill="' + g + '" opacity="0.55"/>' +
      '<path d="M79 104 L82 98 L85 104 L82 110 Z" fill="#fff" opacity="0.7"/>' +
      /* Правый ромб */
      '<path d="M128 104 L118 84 L108 104 L118 124 Z" fill="' + a + '" opacity="0.6" stroke="' + g + '" stroke-width="0.9"/>' +
      '<path d="M124 104 L118 92 L112 104 L118 116 Z" fill="' + g + '" opacity="0.55"/>' +
      '<path d="M121 104 L118 98 L115 104 L118 110 Z" fill="#fff" opacity="0.7"/>' +
      /* Центральный ромб */
      '<path d="M100 74 L128 104 L100 134 L72 104 Z" fill="' + a + '" stroke="' + g + '" stroke-width="2"/>' +
      '<path d="M100 84 L118 104 L100 124 L82 104 Z" fill="' + d + '" opacity="0.7"/>' +
      '<path d="M100 92 L108 104 L100 116 L92 104 Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.8"/>' +
      '<path d="M100 97 L104 104 L100 111 L96 104 Z" fill="#fff" opacity="0.85"/>' +
      /* Точки на осях */
      '<circle cx="100" cy="74" r="3" fill="' + g + '" stroke="' + d + '" stroke-width="0.7"/>' +
      '<circle cx="100" cy="134" r="3" fill="' + g + '" stroke="' + d + '" stroke-width="0.7"/>' +
      '<circle cx="72" cy="104" r="3" fill="' + g + '" stroke="' + d + '" stroke-width="0.7"/>' +
      '<circle cx="128" cy="104" r="3" fill="' + g + '" stroke="' + d + '" stroke-width="0.7"/>';
  }
  /* 6 — Divine Rapier */
  if (rankIdx === 6) {
    return '' +
      /* Клинок */
      '<path d="M100 62 L105 82 L105 118 L95 118 L95 82 Z" fill="' + g + '" stroke="' + d + '" stroke-width="1"/>' +
      '<path d="M100 62 L102 82 L102 118 L100 118 Z" fill="#fff" opacity="0.65"/>' +
      '<path d="M100 62 L100 118" stroke="' + a + '" stroke-width="0.6" opacity="0.5"/>' +
      /* Гарда */
      '<rect x="82" y="118" width="36" height="6" fill="' + a + '" rx="3" stroke="' + g + '" stroke-width="1"/>' +
      '<circle cx="82" cy="121" r="3.5" fill="' + g + '" stroke="' + a + '" stroke-width="0.8"/>' +
      '<circle cx="118" cy="121" r="3.5" fill="' + g + '" stroke="' + a + '" stroke-width="0.8"/>' +
      '<circle cx="82" cy="121" r="1.4" fill="#fff" opacity="0.9"/>' +
      '<circle cx="118" cy="121" r="1.4" fill="#fff" opacity="0.9"/>' +
      /* Рукоять */
      '<rect x="95" y="124" width="10" height="16" fill="' + a + '" rx="2.5" stroke="' + g + '" stroke-width="0.8"/>' +
      '<line x1="97.5" y1="126" x2="97.5" y2="138" stroke="' + g + '" stroke-width="0.8" opacity="0.7"/>' +
      '<line x1="100" y1="126" x2="100" y2="138" stroke="' + g + '" stroke-width="0.8" opacity="0.7"/>' +
      '<line x1="102.5" y1="126" x2="102.5" y2="138" stroke="' + g + '" stroke-width="0.8" opacity="0.7"/>' +
      /* Навершие-алмаз */
      '<path d="M100 140 L105 148 L100 156 L95 148 Z" fill="' + g + '" stroke="' + a + '" stroke-width="0.9"/>' +
      '<path d="M100 143 L102.5 148 L100 153 L97.5 148 Z" fill="#fff" opacity="0.8"/>';
  }
  /* 7 — Aegis (мраморная голова) */
  var goldStroke = gold || g;
  var goldGlow = goldLight || g;
  return '' +
    /* Внешний щит */
    '<path d="M100 70 Q72 74 70 100 L70 116 Q70 134 100 144 Q130 134 130 116 L130 100 Q128 74 100 70 Z" fill="' + a + '" stroke="' + goldStroke + '" stroke-width="2.4"/>' +
    /* Внутренний щит */
    '<path d="M100 78 Q82 82 80 102 L80 114 Q80 128 100 136 Q120 128 120 114 L120 102 Q118 82 100 78 Z" fill="' + d + '" opacity="0.7"/>' +
    '<path d="M100 78 Q82 82 80 102 L80 114 Q80 128 100 136 Q120 128 120 114 L120 102 Q118 82 100 78 Z" fill="none" stroke="' + goldStroke + '" stroke-width="1.1" opacity="0.85"/>' +
    /* МРАМОРНАЯ ГОЛОВА */
    '<ellipse cx="100" cy="104" rx="14" ry="16" fill="' + goldGlow + '" opacity="0.95"/>' +
    '<ellipse cx="100" cy="104" rx="12" ry="14" fill="' + d + '" opacity="0.5"/>' +
    /* Закрытые глаза — мраморная статуя */
    '<path d="M93 102 Q96 105 99 102" stroke="' + goldStroke + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M101 102 Q104 105 107 102" stroke="' + goldStroke + '" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
    '<path d="M96 113 L104 113" stroke="' + goldStroke + '" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.85"/>' +
    /* Крылья по бокам головы */
    '<path d="M86 96 Q76 88 74 96 Q80 104 86 100" fill="' + goldGlow + '" opacity="0.9" stroke="' + goldStroke + '" stroke-width="0.6"/>' +
    '<path d="M114 96 Q124 88 126 96 Q120 104 114 100" fill="' + goldGlow + '" opacity="0.9" stroke="' + goldStroke + '" stroke-width="0.6"/>' +
    /* Лучи славы */
    '<line x1="100" y1="84" x2="100" y2="80" stroke="' + goldStroke + '" stroke-width="2" stroke-linecap="round"/>' +
    '<line x1="88" y1="86" x2="85" y2="82" stroke="' + goldStroke + '" stroke-width="1.6" stroke-linecap="round"/>' +
    '<line x1="112" y1="86" x2="115" y2="82" stroke="' + goldStroke + '" stroke-width="1.6" stroke-linecap="round"/>' +
    '<line x1="80" y1="94" x2="76" y2="92" stroke="' + goldStroke + '" stroke-width="1.4" stroke-linecap="round"/>' +
    '<line x1="120" y1="94" x2="124" y2="92" stroke="' + goldStroke + '" stroke-width="1.4" stroke-linecap="round"/>' +
    '<line x1="78" y1="116" x2="74" y2="118" stroke="' + goldStroke + '" stroke-width="1.4" stroke-linecap="round"/>' +
    '<line x1="122" y1="116" x2="126" y2="118" stroke="' + goldStroke + '" stroke-width="1.4" stroke-linecap="round"/>' +
    /* Золотые заклёпки на щите */
    '<circle cx="80" cy="90" r="2" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.5"/>' +
    '<circle cx="120" cy="90" r="2" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.5"/>' +
    '<circle cx="80" cy="126" r="2" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.5"/>' +
    '<circle cx="120" cy="126" r="2" fill="' + goldGlow + '" stroke="' + goldStroke + '" stroke-width="0.5"/>';
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
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 12px " + glowColor + "cc);";

  var gid = "g" + rankIdx;
  var gidIn = "gi" + rankIdx;
  var gidShine = "gs" + rankIdx;
  var gidRad = "gr" + rankIdx;
  var gidEdge = "ge" + rankIdx;
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
      /* Двойная обводка — внешняя тёмная */
      '<filter id="' + gidEdge + '" x="-20%" y="-20%" width="140%" height="140%">' +
        '<feDropShadow dx="0" dy="0" stdDeviation="0.8" flood-color="' + cfg.d + '" flood-opacity="1"/>' +
      '</filter>' +
    '</defs>' +
    /* 1. Боковые перья */
    sideFeathers(rankIdx, cfg) +
    /* 2. Угловые пики */
    cornerSpikes(cfg) +
    /* 3. Внешний ромб */
    '<path d="M100 38 L162 100 L100 162 L38 100 Z" fill="url(#' + gid + ')" stroke="' + strokeOuter + '" stroke-width="2" filter="url(#' + gidEdge + ')"/>' +
    /* 4. Блик сверху */
    '<path d="M100 40 L160 100 L100 100 Z" fill="url(#' + gidShine + ')"/>' +
    /* 5. Тонкая обводка внутри внешнего */
    '<path d="M100 48 L152 100 L100 152 L48 100 Z" fill="none" stroke="' + strokeInner + '" stroke-width="0.8" opacity="0.7"/>' +
    /* 6. Внутренний ромб */
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + gidIn + ')" stroke="' + cfg.a + '" stroke-width="1.6"/>' +
    /* 7. Радиальное свечение */
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + gidRad + ')"/>' +
    /* 8. Внутренняя обводка */
    '<path d="M100 68 L136 100 L100 132 L64 100 Z" fill="none" stroke="' + strokeOuter + '" stroke-width="1" opacity="0.75"/>' +
    /* 9. Орнамент (8 элементов по кольцу) */
    innerOrnament(cfg) +
    /* 10. Символ предмета */
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
    '<path d="M100 38 L162 100 L100 162 L38 100 Z" fill="url(#qa)" stroke="#8b5cf6" stroke-width="1.6" stroke-dasharray="5 4"/>' +
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#qai)" stroke="#8b5cf6" stroke-width="1.3"/>' +
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

console.log("rating v15.0 ready");
