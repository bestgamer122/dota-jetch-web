/* DOTA JETCH — RATING v5.0
   - SVG-иконки медалей (не зависят от CDN, гарантированно работают)
   - Викторина НЕ даёт рейтинг
   - Медленный рост MMR */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0, bg: "#4a4a4a", accent: "#8b8b8b", stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1, bg: "#5a5a5a", accent: "#c0c0c0", stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2, bg: "#7a4d20", accent: "#cd7f32", stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3, bg: "#2a4a7a", accent: "#4a9eff", stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4, bg: "#4a2a6a", accent: "#9b59b6", stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5, bg: "#7a4a20", accent: "#e67e22", stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",    ru: "Божество",  rankIdx: 6, bg: "#7a6a10", accent: "#f1c40f", stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal",  ru: "Титан",     rankIdx: 7, bg: "#7a1a1a", accent: "#e74c3c", stars: [5620, 5800, 6000, 6200, 6500] }
];

/* Собственные SVG-иконки рангов (гарантированно работают без CDN) */
function buildMedalSVG(rankIdx, size) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 10px " + cfg.accent + "99);";

  /* Щит (внешний контур) */
  var shield = document.createElementNS(ns, "path");
  shield.setAttribute("d", "M50 6 L88 20 L88 52 Q88 78 50 94 Q12 78 12 52 L12 20 Z");
  shield.setAttribute("fill", cfg.bg);
  shield.setAttribute("stroke", cfg.accent);
  shield.setAttribute("stroke-width", "3");
  svg.appendChild(shield);

  /* Внутренний щит */
  var inner = document.createElementNS(ns, "path");
  inner.setAttribute("d", "M50 14 L80 26 L80 52 Q80 72 50 86 Q20 72 20 52 L20 26 Z");
  inner.setAttribute("fill", "rgba(0,0,0,0.35)");
  svg.appendChild(inner);

  /* Центральный ромб */
  var diamond = document.createElementNS(ns, "path");
  diamond.setAttribute("d", "M50 30 L64 50 L50 70 L36 50 Z");
  diamond.setAttribute("fill", cfg.accent);
  diamond.setAttribute("opacity", "0.9");
  svg.appendChild(diamond);

  /* Звёздочка в центре ромба */
  var star = document.createElementNS(ns, "text");
  star.setAttribute("x", "50");
  star.setAttribute("y", "55");
  star.setAttribute("text-anchor", "middle");
  star.setAttribute("dominant-baseline", "middle");
  star.setAttribute("font-size", "14");
  star.setAttribute("fill", "#fff");
  star.setAttribute("font-weight", "900");
  star.textContent = "★";
  svg.appendChild(star);

  /* Римские буквы на щите (декор) */
  var rankLetters = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  var letter = document.createElementNS(ns, "text");
  letter.setAttribute("x", "50");
  letter.setAttribute("y", "86");
  letter.setAttribute("text-anchor", "middle");
  letter.setAttribute("font-size", "7");
  letter.setAttribute("fill", cfg.accent);
  letter.setAttribute("font-weight", "700");
  letter.setAttribute("letter-spacing", "1");
  letter.textContent = rankLetters[rankIdx] || "?";
  svg.appendChild(letter);

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
  if (!data.calibrated) {
    data.calibrationGames++;
    if (data.calibrationGames >= 10) {
      data.calibrated = true;
      if (typeof showDialog === "function") {
        var medal = getMedalForMMR(data.mmr);
        showDialog("🎉 Калибровка завершена!", "Твой стартовый ранг: " + medal.medal.ru + " (" + data.mmr + " MMR)", "success");
      }
    }
  }
  if (gained >= 10) data.wins++;
  Store.set("minigames_mmr", data.mmr);
  Store.set("minigames_games", data.gamesPlayed);
  Store.set("minigames_calibrated", data.calibrated);
  Store.set("minigames_calibration_games", data.calibrationGames);
  Store.set("minigames_wins", data.wins);
  if (typeof window.submitToLeaderboard === "function") {
    try { window.submitToLeaderboard(game, rawScore, data.mmr); } catch (e) {}
  }
  return { gained: gained, newMMR: data.mmr, medal: getMedalForMMR(data.mmr) };
};

window.renderRatingWidget = function () {
  var data = window.getRatingData();
  var medal = getMedalForMMR(data.mmr);
  var card = UI.card("🏆 Рейтинг мини-игр");

  var main = el("div", { style: "display:flex;align-items:center;gap:20px;margin-bottom:16px;flex-wrap:wrap;" });

  /* Своя SVG-медаль */
  var medalBox = el("div", { style: "text-align:center;flex-shrink:0;" });
  medalBox.appendChild(buildMedalSVG(medal.medal.rankIdx, 96));
  main.appendChild(medalBox);

  var info = el("div", { style: "flex:1;min-width:180px;" });
  var rankName = el("div", { style: "font-size:24px;font-weight:900;color:" + medal.medal.accent + ";" });
  rankName.textContent = medal.medal.ru;
  info.appendChild(rankName);
  info.appendChild(el("div", { style: "font-size:12px;color:var(--text-muted);margin-top:4px;" },
    medal.stars + " ★ · " + data.mmr + " MMR"));
  info.appendChild(el("div", { style: "font-size:11px;color:var(--text-dim);margin-top:6px;" },
    "Игр: " + data.gamesPlayed + " · Побед: " + data.wins));

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
  } else {
    info.appendChild(el("div", { style: "font-size:11px;color:var(--gold);margin-top:10px;font-weight:700;" }, "★ Максимальный ранг!"));
  }
  main.appendChild(info);
  card.appendChild(main);

  if (!data.calibrated) {
    var cal = el("div", { style: "background:var(--accent-bg);border:1px solid var(--accent);border-radius:12px;padding:12px 14px;margin-bottom:14px;" });
    cal.appendChild(el("div", { style: "font-size:12px;font-weight:700;color:var(--accent-light);margin-bottom:4px;" }, "📊 Калибровка"));
    cal.appendChild(el("div", { style: "font-size:11px;color:var(--text-muted);" }, "Сыграно: " + data.calibrationGames + " / 10 игр. После калибровки откроется точный ранг."));
    var calBar = el("div", { style: "height:4px;background:var(--bg-elev);border-radius:2px;overflow:hidden;margin-top:8px;" });
    calBar.appendChild(el("div", { style: "height:100%;width:" + (data.calibrationGames * 10) + "%;background:var(--accent);border-radius:2px;" }));
    cal.appendChild(calBar);
    card.appendChild(cal);
  }

  var scores = el("div", { style: "display:grid;grid-template-columns:repeat(2,1fr);gap:8px;" });
  var scoreDefs = [
    { icon: "🔓", name: "Взлом", val: data.bestScores.lockpick, color: "var(--gold)" },
    { icon: "⌨️", name: "Автоматоны", val: data.bestScores.automaton, color: "var(--cyan)" }
  ];
  for (var sd = 0; sd < scoreDefs.length; sd++) {
    var box = el("div", { style: "text-align:center;padding:10px 6px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;" });
    box.appendChild(el("div", { style: "font-size:18px;" }, scoreDefs[sd].icon));
    box.appendChild(el("div", { style: "font-size:11px;font-weight:700;color:" + scoreDefs[sd].color + ";font-family:'JetBrains Mono',monospace;margin-top:4px;" }, scoreDefs[sd].val ? scoreDefs[sd].val.toLocaleString() : "—"));
    box.appendChild(el("div", { class: "dim", style: "font-size:9px;text-transform:uppercase;margin-top:2px;" }, scoreDefs[sd].name));
    scores.appendChild(box);
  }
  card.appendChild(scores);

  var note = el("div", { class: "dim", style: "font-size:10px;margin-top:12px;text-align:center;line-height:1.5;" }, "Викторина не влияет на рейтинг — это просто проверка знаний.");
  card.appendChild(note);

  return card;
};

console.log("rating v5.0 ready (own SVG medals)");
