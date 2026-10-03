/* DOTA JETCH — RATING v14.0
   - Цвета: 8 явно различимых (green, silver, teal, LIME, purple, BLUE, red, RED-GOLD)
   - Детали: двойные обводки, узоры, блики, декоративные точки
   - Символы: более крупные и детальные
   - Титан: красно-золотой, Aegis с мраморной головой */

var RATING_TABLE = [
  /* 1. Рекрут — тёмно-зелёный */
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0,
    d: "#0a2810", m: "#1e6025", l: "#5aa83a", a: "#8ed468", g: "#d0ffa8",
    stars: [0, 150, 300, 460, 610] },
  /* 2. Страж — серебро/сталь */
  { name: "Guardian",  ru: "Страж",     rankIdx: 1,
    d: "#1c1c20", m: "#4a4a52", l: "#90909a", a: "#c8c8d0", g: "#f0f0f8",
    stars: [770, 920, 1080, 1230, 1400] },
  /* 3. Рыцарь — бирюзовый */
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2,
    d: "#062230", m: "#0e5a78", l: "#28a0c8", a: "#50d0f0", g: "#b0f0ff",
    stars: [1540, 1700, 1850, 2000, 2150] },
  /* 4. Герой — ЛАЙМ (жёлто-зелёный, отличается от Рекрута!) */
  { name: "Archon",    ru: "Герой",     rankIdx: 3,
    d: "#2a3008", m: "#6a8020", l: "#a8c838", a: "#d0e858", g: "#f0ffa0",
    stars: [2310, 2450, 2610, 2770, 2930] },
  /* 5. Легенда — фиолетовый */
  { name: "Legend",    ru: "Легенда",   rankIdx: 4,
    d: "#1a0a3a", m: "#4a1a90", l: "#8850d0", a: "#b088f0", g: "#e0c8ff",
    stars: [3080, 3230, 3390, 3540, 3700] },
  /* 6. Властелин — глубокий СИНИЙ (темнее Рыцаря) */
  { name: "Ancient",   ru: "Властелин", rankIdx: 5,
    d: "#0a1850", m: "#1a3888", l: "#2a68c8", a: "#5098e8", g: "#a8d0ff",
    stars: [3850, 4000, 4150, 4300, 4460] },
  /* 7. Божество — КРАСНЫЙ */
  { name: "Divine",    ru: "Божество",  rankIdx: 6,
    d: "#2a0808", m: "#801818", l: "#d03838", a: "#f06868", g: "#ffb0b0",
    stars: [4620, 4820, 5020, 5220, 5420] },
  /* 8. Титан — красно-золотой */
  { name: "Immortal",  ru: "Титан",     rankIdx: 7,
    d: "#2a0808", m: "#8a1010", l: "#c03028", a: "#e85040", g: "#ffe080",
    gold: "#fbbf24", goldLight: "#fff2c0",
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

/* ─── Боковые перья (детальные, многолепестковые) ─── */
function sideFeathers(rankIdx, cfg) {
  if (rankIdx < 2) return "";
  var a = cfg.a;
  var l = cfg.l;
  var g = cfg.g;
  var glow = cfg.gold || cfg.g;
  var opacity = Math.min(0.95, 0.6 + rankIdx * 0.05);
  var levels = Math.min(rankIdx - 1, 5);
  var out = "";

  /* ЛЕВОЕ крыло */
  out += '<g opacity="' + opacity.toFixed(2) + '">';
  for (var i = 0; i < levels; i++) {
    var yS = 86 + i * 11;
    var xS = 36;
    var xE = 2 - i * 1.5;
    var h = 9;
    /* Основное перо */
    out += '<path d="M ' + xS + ' ' + yS +
      ' Q ' + (xS - 12) + ' ' + (yS - h) + ' ' + xE + ' ' + (yS - 3) +
      ' Q ' + (xS - 14) + ' ' + (yS + h * 0.6) + ' ' + xS + ' ' + (yS + h) + ' Z" fill="' + (i % 2 === 0 ? a : l) + '"/>';
    /* Светлая прожилка */
    out += '<path d="M ' + (xS - 2) + ' ' + (yS + 2) + ' Q ' + (xS - 10) + ' ' + (yS - 2) + ' ' + (xE + 3) + ' ' + (yS - 1) + '" stroke="' + glow + '" stroke-width="0.9" opacity="0.7" fill="none"/>';
    /* Мини-точка на конце */
    out += '<circle cx="' + xE + '" cy="' + (yS - 1) + '" r="1.2" fill="' + glow + '" opacity="0.9"/>';
  }
  out += '</g>';

  /* ПРАВОЕ крыло */
  out += '<g opacity="' + opacity.toFixed(2) + '">';
  for (var j = 0; j < levels; j++) {
    var yS2 = 86 + j * 11;
    var xS2 = 164;
    var xE2 = 198 + j * 1.5;
    var h2 = 9;
    out += '<path d="M ' + xS2 + ' ' + yS2 +
      ' Q ' + (xS2 + 12) + ' ' + (yS2 - h2) + ' ' + xE2 + ' ' + (yS2 - 3) +
      ' Q ' + (xS2 + 14) + ' ' + (yS2 + h2 * 0.6) + ' ' + xS2 + ' ' + (yS2 + h2) + ' Z" fill="' + (j % 2 === 0 ? a : l) + '"/>';
    out += '<path d="M ' + (xS2 + 2) + ' ' + (yS2 + 2) + ' Q ' + (xS2 + 10) + ' ' + (yS2 - 2) + ' ' + (xE2 - 3) + ' ' + (yS2 - 1) + '" stroke="' + glow + '" stroke-width="0.9" opacity="0.7" fill="none"/>';
    out += '<circle cx="' + xE2 + '" cy="' + (yS2 - 1) + '" r="1.2" fill="' + glow + '" opacity="0.9"/>';
  }
  out += '</g>';

  return out;
}

/* ─── Угловые пики с деталями ─── */
function cornerSpikes(cfg) {
  var a = cfg.a;
  var g = cfg.g;
  var edge = cfg.gold || g;
  var edgeLight = cfg.goldLight || g;
  return '' +
    /* Верхний пик */
    '<path d="M100 16 L112 44 L100 50 L88 44 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.7"/>' +
    '<path d="M100 20 L107 40 L100 44 L93 40 Z" fill="' + edgeLight + '" opacity="0.75"/>' +
    '<path d="M100 24 L103 38 L100 41 L97 38 Z" fill="#fff" opacity="0.5"/>' +
    /* Нижний пик */
    '<path d="M100 184 L112 156 L100 150 L88 156 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.7"/>' +
    '<path d="M100 180 L107 160 L100 156 L93 160 Z" fill="' + edgeLight + '" opacity="0.75"/>' +
    '<path d="M100 176 L103 162 L100 159 L97 162 Z" fill="#fff" opacity="0.5"/>' +
    /* Левый пик */
    '<path d="M16 100 L44 88 L50 100 L44 112 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.7"/>' +
    '<path d="M20 100 L40 93 L44 100 L40 107 Z" fill="' + edgeLight + '" opacity="0.75"/>' +
    '<path d="M24 100 L38 97 L41 100 L38 103 Z" fill="#fff" opacity="0.5"/>' +
    /* Правый пик */
    '<path d="M184 100 L156 88 L150 100 L156 112 Z" fill="' + a + '" stroke="' + edge + '" stroke-width="0.7"/>' +
    '<path d="M180 100 L160 93 L156 100 L160 107 Z" fill="' + edgeLight + '" opacity="0.75"/>' +
    '<path d="M176 100 L162 97 L159 100 L162 103 Z" fill="#fff" opacity="0.5"/>';
}

/* ─── 4 ромбика на углах внутреннего ромба ─── */
function innerCorners(cfg) {
  var g = cfg.g;
  var d = cfg.d;
  var pts = [
    { x: 100, y: 78 },
    { x: 150, y: 122 },
    { x: 100, y: 166 },
    { x: 50, y: 122 }
  ];
  var out = "";
  for (var i = 0; i < pts.length; i++) {
    var p = pts[i];
    out += '<path d="M ' + p.x + ' ' + (p.y - 5) + ' L ' + (p.x + 5) + ' ' + p.y + ' L ' + p.x + ' ' + (p.y + 5) + ' L ' + (p.x - 5) + ' ' + p.y + ' Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.7"/>';
    out += '<path d="M ' + p.x + ' ' + (p.y - 2.5) + ' L ' + (p.x + 2.5) + ' ' + p.y + ' L ' + p.x + ' ' + (p.y + 2.5) + ' L ' + (p.x - 2.5) + ' ' + p.y + ' Z" fill="#fff" opacity="0.7"/>';
  }
  return out;
}

/* ─── Детальный символ предмета в центре ─── */
function rankSymbol(rankIdx, cfg) {
  var a = cfg.a;
  var g = cfg.g;
  var d = cfg.d;
  var gold = cfg.gold || null;
  var goldLight = cfg.goldLight || "#fff";

  /* 0 — Рекрут: Tango (3 зелёных листа + стебель) */
  if (rankIdx === 0) {
    return '' +
      /* Стебель */
      '<line x1="100" y1="72" x2="100" y2="112" stroke="' + g + '" stroke-width="2.4" stroke-linecap="round"/>' +
      /* Верхний лист */
      '<path d="M100 82 Q88 74 82 84 Q88 94 100 96 Q112 94 118 84 Q112 74 100 82 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1"/>' +
      '<line x1="100" y1="82" x2="100" y2="94" stroke="' + g + '" stroke-width="0.8" opacity="0.6"/>' +
      /* Левый лист */
      '<path d="M100 96 Q84 94 78 106 Q86 118 100 110 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1"/>' +
      '<line x1="100" y1="98" x2="84" y2="106" stroke="' + g + '" stroke-width="0.8" opacity="0.6"/>' +
      /* Правый лист */
      '<path d="M100 96 Q116 94 122 106 Q114 118 100 110 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1"/>' +
      '<line x1="100" y1="98" x2="116" y2="106" stroke="' + g + '" stroke-width="0.8" opacity="0.6"/>' +
      /* Верхняя почка */
      '<circle cx="100" cy="70" r="3" fill="' + g + '"/>' +
      '<circle cx="100" cy="70" r="1.4" fill="#fff" opacity="0.8"/>';
  }
  /* 1 — Страж: Stout Shield (щит с крестом, заклёпками, тенями) */
  if (rankIdx === 1) {
    return '' +
      '<path d="M100 74 Q76 78 74 98 L74 112 Q74 126 100 134 Q126 126 126 112 L126 98 Q124 78 100 74 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.6"/>' +
      /* Внутренний тёмный щит */
      '<path d="M100 82 Q84 86 83 100 L83 112 Q83 122 100 128 Q117 122 117 112 L117 100 Q116 86 100 82 Z" fill="' + d + '" opacity="0.6"/>' +
      /* Крест */
      '<line x1="100" y1="84" x2="100" y2="126" stroke="' + g + '" stroke-width="3.6"/>' +
      '<line x1="82" y1="104" x2="118" y2="104" stroke="' + g + '" stroke-width="3.6"/>' +
      '<line x1="100" y1="84" x2="100" y2="126" stroke="#fff" stroke-width="1.2" opacity="0.5"/>' +
      /* Заклёпки */
      '<circle cx="82" cy="86" r="2.2" fill="' + g + '"/>' +
      '<circle cx="118" cy="86" r="2.2" fill="' + g + '"/>' +
      '<circle cx="82" cy="122" r="2.2" fill="' + g + '"/>' +
      '<circle cx="118" cy="122" r="2.2" fill="' + g + '"/>' +
      '<circle cx="82" cy="86" r="0.8" fill="#fff" opacity="0.8"/>' +
      '<circle cx="118" cy="86" r="0.8" fill="#fff" opacity="0.8"/>' +
      /* Ободок */
      '<path d="M100 74 Q76 78 74 98 L74 112 Q74 126 100 134 Q126 126 126 112 L126 98 Q124 78 100 74 Z" fill="none" stroke="' + g + '" stroke-width="0.6" opacity="0.5"/>';
  }
  /* 2 — Рыцарь: Ring of Aquila (двойное кольцо с орлом-звездой) */
  if (rankIdx === 2) {
    return '' +
      /* Двойное кольцо */
      '<circle cx="100" cy="104" r="24" fill="none" stroke="' + a + '" stroke-width="3.5"/>' +
      '<circle cx="100" cy="104" r="21" fill="none" stroke="' + g + '" stroke-width="1.2" opacity="0.7"/>' +
      '<circle cx="100" cy="104" r="15" fill="none" stroke="' + a + '" stroke-width="1" opacity="0.5"/>' +
      /* Орёл — 5-конечная стилизованная звезда-птица */
      '<path d="M100 84 L96 96 L84 96 L94 104 L90 116 L100 108 L110 116 L106 104 L116 96 L104 96 Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.7"/>' +
      '<circle cx="100" cy="102" r="3" fill="' + d + '"/>' +
      '<circle cx="100" cy="102" r="1.2" fill="' + g + '"/>' +
      /* 4 точки по осям */
      '<circle cx="100" cy="80" r="2.5" fill="' + g + '"/>' +
      '<circle cx="100" cy="128" r="2.5" fill="' + g + '"/>' +
      '<circle cx="76" cy="104" r="2.5" fill="' + g + '"/>' +
      '<circle cx="124" cy="104" r="2.5" fill="' + g + '"/>' +
      /* Мини-ромбики на точках */
      '<path d="M100 76 L102 80 L100 84 L98 80 Z" fill="#fff" opacity="0.6"/>';
  }
  /* 3 — Герой: Eul's Scepter (посох с кристаллом и мини-крыльями) */
  if (rankIdx === 3) {
    return '' +
      /* Кристалл сверху */
      '<path d="M100 68 L114 88 L100 100 L86 88 Z" fill="' + g + '" stroke="' + a + '" stroke-width="1.5"/>' +
      '<path d="M100 74 L108 88 L100 96 L92 88 Z" fill="#fff" opacity="0.55"/>' +
      '<path d="M100 68 L100 100" stroke="' + a + '" stroke-width="0.6" opacity="0.5"/>' +
      /* Посох */
      '<rect x="95" y="100" width="10" height="36" fill="' + a + '" rx="2" stroke="' + g + '" stroke-width="0.8"/>' +
      '<rect x="98" y="100" width="4" height="36" fill="' + g + '" opacity="0.4"/>' +
      /* Крылья посоха */
      '<path d="M84 86 Q74 82 76 96 Q82 98 84 94" stroke="' + a + '" stroke-width="2.5" fill="' + a + '" fill-opacity="0.4" stroke-linecap="round"/>' +
      '<path d="M116 86 Q126 82 124 96 Q118 98 116 94" stroke="' + a + '" stroke-width="2.5" fill="' + a + '" fill-opacity="0.4" stroke-linecap="round"/>' +
      /* Основание */
      '<ellipse cx="100" cy="138" rx="7" ry="3" fill="' + a + '" stroke="' + g + '" stroke-width="0.8"/>';
  }
  /* 4 — Легенда: BKB (молот с двойным ядром) */
  if (rankIdx === 4) {
    return '' +
      /* Рукоять */
      '<rect x="95" y="96" width="10" height="42" fill="' + a + '" rx="2" stroke="' + g + '" stroke-width="0.8"/>' +
      '<rect x="98" y="98" width="4" height="38" fill="' + g + '" opacity="0.4"/>' +
      /* Навершие */
      '<path d="M80 80 Q100 70 120 80 L120 96 Q100 104 80 96 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.5"/>' +
      '<path d="M84 84 Q100 78 116 84 L116 94 Q100 98 84 94 Z" fill="' + d + '" opacity="0.5"/>' +
      /* Светящееся ядро */
      '<circle cx="100" cy="88" r="6" fill="' + g + '"/>' +
      '<circle cx="100" cy="88" r="3.5" fill="' + a + '"/>' +
      '<circle cx="100" cy="88" r="1.6" fill="#fff"/>' +
      /* Лучи */
      '<line x1="88" y1="80" x2="86" y2="76" stroke="' + g + '" stroke-width="1.4" stroke-linecap="round"/>' +
      '<line x1="112" y1="80" x2="114" y2="76" stroke="' + g + '" stroke-width="1.4" stroke-linecap="round"/>' +
      /* Основание */
      '<ellipse cx="100" cy="140" rx="7" ry="3" fill="' + a + '" stroke="' + g + '" stroke-width="0.8"/>';
  }
  /* 5 — Властелин: Manta Style (3 ромба с золотыми точками) */
  if (rankIdx === 5) {
    return '' +
      /* Левый ромб */
      '<path d="M74 104 L82 86 L90 104 L82 122 Z" fill="' + a + '" opacity="0.55" stroke="' + g + '" stroke-width="0.6"/>' +
      '<path d="M78 104 L82 94 L86 104 L82 114 Z" fill="' + g + '" opacity="0.5"/>' +
      /* Правый ромб */
      '<path d="M126 104 L118 86 L110 104 L118 122 Z" fill="' + a + '" opacity="0.55" stroke="' + g + '" stroke-width="0.6"/>' +
      '<path d="M122 104 L118 94 L114 104 L118 114 Z" fill="' + g + '" opacity="0.5"/>' +
      /* Центральный ромб */
      '<path d="M100 78 L124 104 L100 130 L76 104 Z" fill="' + a + '" stroke="' + g + '" stroke-width="1.6"/>' +
      '<path d="M100 86 L114 104 L100 122 L86 104 Z" fill="' + d + '" opacity="0.7"/>' +
      '<path d="M100 92 L106 104 L100 116 L94 104 Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.6"/>' +
      '<path d="M100 96 L103 104 L100 112 L97 104 Z" fill="#fff" opacity="0.7"/>' +
      /* Точки на осях */
      '<circle cx="100" cy="78" r="2.4" fill="' + g + '"/>' +
      '<circle cx="100" cy="130" r="2.4" fill="' + g + '"/>' +
      '<circle cx="76" cy="104" r="2.4" fill="' + g + '"/>' +
      '<circle cx="124" cy="104" r="2.4" fill="' + g + '"/>';
  }
  /* 6 — Божество: Divine Rapier (детальная рапира с золотом) */
  if (rankIdx === 6) {
    return '' +
      /* Клинок — двойной, с гранями */
      '<path d="M100 66 L104 84 L104 118 L96 118 L96 84 Z" fill="' + g + '" stroke="' + d + '" stroke-width="0.8"/>' +
      '<path d="M100 66 L101.5 84 L101.5 118 L100 118 Z" fill="#fff" opacity="0.6"/>' +
      '<path d="M100 66 L100 118" stroke="' + a + '" stroke-width="0.5" opacity="0.5"/>' +
      /* Гарда — длинная, с шариками по краям */
      '<rect x="84" y="118" width="32" height="5" fill="' + a + '" rx="2.5" stroke="' + g + '" stroke-width="0.8"/>' +
      '<circle cx="84" cy="120.5" r="3" fill="' + g + '" stroke="' + a + '" stroke-width="0.6"/>' +
      '<circle cx="116" cy="120.5" r="3" fill="' + g + '" stroke="' + a + '" stroke-width="0.6"/>' +
      '<circle cx="84" cy="120.5" r="1.2" fill="#fff" opacity="0.8"/>' +
      '<circle cx="116" cy="120.5" r="1.2" fill="#fff" opacity="0.8"/>' +
      /* Рукоять */
      '<rect x="96" y="123" width="8" height="14" fill="' + a + '" rx="2" stroke="' + g + '" stroke-width="0.6"/>' +
      '<line x1="98" y1="125" x2="98" y2="135" stroke="' + g + '" stroke-width="0.7" opacity="0.6"/>' +
      '<line x1="102" y1="125" x2="102" y2="135" stroke="' + g + '" stroke-width="0.7" opacity="0.6"/>' +
      /* Навершие-алмаз */
      '<path d="M100 138 L104 144 L100 150 L96 144 Z" fill="' + g + '" stroke="' + a + '" stroke-width="0.7"/>' +
      '<path d="M100 140 L102 144 L100 148 L98 144 Z" fill="#fff" opacity="0.7"/>';
  }
  /* 7 — Титан: Aegis of the Immortal (щит + мраморная голова + золото) */
  var goldStroke = gold || g;
  var goldGlow = goldLight || g;
  return '' +
    /* Внешний щит Aegis (золотой контур) */
    '<path d="M100 72 Q74 76 72 100 L72 116 Q72 132 100 140 Q128 132 128 116 L128 100 Q126 76 100 72 Z" fill="' + a + '" stroke="' + goldStroke + '" stroke-width="2"/>' +
    /* Внутренний тёмный щит */
    '<path d="M100 80 Q84 84 82 102 L82 114 Q82 126 100 132 Q118 126 118 114 L118 102 Q116 84 100 80 Z" fill="' + d + '" opacity="0.65"/>' +
    /* Золотая внутренняя обводка */
    '<path d="M100 80 Q84 84 82 102 L82 114 Q82 126 100 132 Q118 126 118 114 L118 102 Q116 84 100 80 Z" fill="none" stroke="' + goldStroke + '" stroke-width="0.9" opacity="0.75"/>' +
    /* МРАМОРНАЯ ГОЛОВА */
    '<ellipse cx="100" cy="104" rx="12" ry="14" fill="' + goldGlow + '" opacity="0.9"/>' +
    '<ellipse cx="100" cy="104" rx="10" ry="12" fill="' + d + '" opacity="0.55"/>' +
    /* Закрытые глаза (мраморная статуя) */
    '<path d="M94 102 Q96 104 98 102" stroke="' + goldStroke + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    '<path d="M102 102 Q104 104 106 102" stroke="' + goldStroke + '" stroke-width="1.4" fill="none" stroke-linecap="round"/>' +
    /* Рот */
    '<path d="M97 112 L103 112" stroke="' + goldStroke + '" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.8"/>' +
    /* Крылья Aegis по бокам головы */
    '<path d="M88 96 Q80 88 78 96 Q84 102 88 100" fill="' + goldGlow + '" opacity="0.85" stroke="' + goldStroke + '" stroke-width="0.5"/>' +
    '<path d="M112 96 Q120 88 122 96 Q116 102 112 100" fill="' + goldGlow + '" opacity="0.85" stroke="' + goldStroke + '" stroke-width="0.5"/>' +
    /* Лучи славы */
    '<line x1="100" y1="86" x2="100" y2="82" stroke="' + goldStroke + '" stroke-width="1.6" stroke-linecap="round"/>' +
    '<line x1="89" y1="88" x2="87" y2="84" stroke="' + goldStroke + '" stroke-width="1.3" stroke-linecap="round"/>' +
    '<line x1="111" y1="88" x2="113" y2="84" stroke="' + goldStroke + '" stroke-width="1.3" stroke-linecap="round"/>' +
    '<line x1="82" y1="94" x2="79" y2="92" stroke="' + goldStroke + '" stroke-width="1.1" stroke-linecap="round"/>' +
    '<line x1="118" y1="94" x2="121" y2="92" stroke="' + goldStroke + '" stroke-width="1.1" stroke-linecap="round"/>' +
    /* Золотые блики на щите */
    '<circle cx="82" cy="90" r="1.5" fill="' + goldGlow + '" opacity="0.9"/>' +
    '<circle cx="118" cy="90" r="1.5" fill="' + goldGlow + '" opacity="0.9"/>';
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
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 9px " + glowColor + "aa);";

  var gid = "g" + rankIdx;
  var gidIn = "gi" + rankIdx;
  var gidShine = "gs" + rankIdx;
  var gidRad = "gr" + rankIdx;
  var strokeOuter = cfg.gold || cfg.g;

  var svgStr = '' +
    '<defs>' +
      /* Внешний ромб — градиент сверху-вниз */
      '<linearGradient id="' + gid + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.l + '"/>' +
        '<stop offset="50%" stop-color="' + cfg.a + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.m + '"/>' +
      '</linearGradient>' +
      /* Внутренний ромб — тёмный */
      '<linearGradient id="' + gidIn + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="' + cfg.m + '"/>' +
        '<stop offset="100%" stop-color="' + cfg.d + '"/>' +
      '</linearGradient>' +
      /* Блик сверху (светлый) */
      '<linearGradient id="' + gidShine + '" x1="0%" y1="0%" x2="0%" y2="100%">' +
        '<stop offset="0%" stop-color="#fff" stop-opacity="0.35"/>' +
        '<stop offset="100%" stop-color="#fff" stop-opacity="0"/>' +
      '</linearGradient>' +
      /* Радиальное свечение в центре */
      '<radialGradient id="' + gidRad + '" cx="50%" cy="50%" r="55%">' +
        '<stop offset="0%" stop-color="' + cfg.g + '" stop-opacity="0.35"/>' +
        '<stop offset="100%" stop-color="' + cfg.g + '" stop-opacity="0"/>' +
      '</radialGradient>' +
    '</defs>' +
    /* 1. Боковые перья (за ромбом) */
    sideFeathers(rankIdx, cfg) +
    /* 2. Угловые пики */
    cornerSpikes(cfg) +
    /* 3. Внешний ромб */
    '<path d="M100 40 L160 100 L100 160 L40 100 Z" fill="url(#' + gid + ')" stroke="' + strokeOuter + '" stroke-width="1.6"/>' +
    /* 4. Внешний блик сверху */
    '<path d="M100 42 L158 100 L100 100 Z" fill="url(#' + gidShine + ')"/>' +
    /* 5. Внутренний ромб */
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + gidIn + ')" stroke="' + cfg.a + '" stroke-width="1.3"/>' +
    /* 6. Радиальное свечение */
    '<path d="M100 62 L142 100 L100 138 L58 100 Z" fill="url(#' + gidRad + ')"/>' +
    /* 7. Тонкая внутренняя обводка */
    '<path d="M100 68 L136 100 L100 132 L64 100 Z" fill="none" stroke="' + strokeOuter + '" stroke-width="0.8" opacity="0.6"/>' +
    /* 8. Ромбики по углам */
    innerCorners(cfg) +
    /* 9. Символ предмета */
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

console.log("rating v14.0 ready (distinct colors, detailed medals)");
