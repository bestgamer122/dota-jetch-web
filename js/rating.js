/* DOTA JETCH — RATING v5.2
   - Кнопка "Все ранги" → модалка с полным списком
   - Скрытие медали до калибровки
   - Диалог по завершении калибровки */

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

var CALIBRATION_GAMES = 10;

function buildMedalSVG(rankIdx, size) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 10px " + cfg.accent + "99);";

  var shield = document.createElementNS(ns, "path");
  shield.setAttribute("d", "M50 6 L88 20 L88 52 Q88 78 50 94 Q12 78 12 52 L12 20 Z");
  shield.setAttribute("fill", cfg.bg);
  shield.setAttribute("stroke", cfg.accent);
  shield.setAttribute("stroke-width", "3");
  svg.appendChild(shield);

  var inner = document.createElementNS(ns, "path");
  inner.setAttribute("d", "M50 14 L80 26 L80 52 Q80 72 50 86 Q20 72 20 52 L20 26 Z");
  inner.setAttribute("fill", "rgba(0,0,0,0.35)");
  svg.appendChild(inner);

  var diamond = document.createElementNS(ns, "path");
  diamond.setAttribute("d", "M50 30 L64 50 L50 70 L36 50 Z");
  diamond.setAttribute("fill", cfg.accent);
  diamond.setAttribute("opacity", "0.9");
  svg.appendChild(diamond);

  var star = document.createElementNS(ns, "text");
  star.setAttribute("x", "50"); star.setAttribute("y", "55");
  star.setAttribute("text-anchor", "middle");
  star.setAttribute("dominant-baseline", "middle");
  star.setAttribute("font-size", "14");
  star.setAttribute("fill", "#fff");
  star.setAttribute("font-weight", "900");
  star.textContent = "★";
  svg.appendChild(star);

  var rankLetters = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  var letter = document.createElementNS(ns, "text");
  letter.setAttribute("x", "50"); letter.setAttribute("y", "86");
  letter.setAttribute("text-anchor", "middle");
  letter.setAttribute("font-size", "7");
  letter.setAttribute("fill", cfg.accent);
  letter.setAttribute("font-weight", "700");
  letter.setAttribute("letter-spacing", "1");
  letter.textContent = rankLetters[rankIdx] || "?";
  svg.appendChild(letter);

  return svg;
}

function buildQuestionMedalSVG(size) {
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;flex-shrink:0;filter:drop-shadow(0 0 10px rgba(139,92,246,0.7));";

  var shield = document.createElementNS(ns, "path");
  shield.setAttribute("d", "M50 6 L88 20 L88 52 Q88 78 50 94 Q12 78 12 52 L12 20 Z");
  shield.setAttribute("fill", "#2a2d36");
  shield.setAttribute("stroke", "#8b5cf6");
  shield.setAttribute("stroke-width", "3");
  shield.setAttribute("stroke-dasharray", "4 3");
  svg.appendChild(shield);

  var q = document.createElementNS(ns, "text");
  q.setAttribute("x", "50"); q.setAttribute("y", "58");
  q.setAttribute("text-anchor", "middle");
  q.setAttribute("dominant-baseline", "middle");
  q.setAttribute("font-size", "42");
  q.setAttribute("font-weight", "900");
  q.setAttribute("fill", "#8b5cf6");
  q.setAttribute("font-family", "sans-serif");
  q.textContent = "?";
  svg.appendChild(q);

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
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;z-index:9999999;background:rgba(2,3,8,0.85);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;";

  var box = document.createElement("div");
  box.style.cssText = "max-width:380px;width:100%;background:var(--bg-card);border:1px solid " + medal.accent + ";border-radius:18px;padding:28px 24px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 60px -20px " + medal.accent + ";text-align:center;";

  var head = document.createElement("div");
  head.style.cssText = "font-size:14px;font-weight:700;letter-spacing:0.12em;color:" + medal.accent + ";text-transform:uppercase;margin-bottom:18px;";
  head.textContent = "Калибровка завершена";
  box.appendChild(head);

  box.appendChild(buildMedalSVG(medal.rankIdx, 110));

  var starsRow = document.createElement("div");
  starsRow.style.cssText = "display:flex;gap:4px;justify-content:center;margin-top:12px;";
  for (var s = 0; s < 5; s++) {
    var star = document.createElement("span");
    star.style.cssText = "font-size:16px;color:" + (s < stars ? medal.accent : "var(--border)") + ";text-shadow:" + (s < stars ? "0 0 8px " + medal.accent + "88" : "none") + ";";
    star.textContent = "★";
    starsRow.appendChild(star);
  }
  box.appendChild(starsRow);

  var rankName = document.createElement("div");
  rankName.style.cssText = "font-size:26px;font-weight:900;color:" + medal.accent + ";margin-top:16px;";
  rankName.textContent = medal.ru;
  box.appendChild(rankName);

  var mmrText = document.createElement("div");
  mmrText.style.cssText = "font-size:15px;color:var(--text-muted);margin-top:6px;font-family:'JetBrains Mono', monospace;";
  mmrText.textContent = mmr + " MMR";
  box.appendChild(mmrText);

  var sub = document.createElement("div");
  sub.style.cssText = "font-size:11px;color:var(--text-dim);margin-top:14px;line-height:1.5;";
  sub.textContent = "Ты сыграл 10 игр. Теперь твой ранг отображается точно.";
  box.appendChild(sub);

  var btn = document.createElement("button");
  btn.type = "button";
  btn.style.cssText = "margin-top:20px;padding:12px 24px;border-radius:10px;background:" + medal.accent + ";color:#0b0c10;border:none;font-size:14px;font-weight:800;cursor:pointer;font-family:inherit;letter-spacing:0.03em;";
  btn.textContent = "Отлично!";
  btn.addEventListener("click", function () { ov.remove(); });
  box.appendChild(btn);

  ov.appendChild(box);
  document.body.appendChild(ov);
}

/* Модалка "Все ранги" */
function showAllRanksDialog() {
  var ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;z-index:9999999;background:rgba(2,3,8,0.85);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;overflow-y:auto;";

  var box = document.createElement("div");
  box.style.cssText = "max-width:720px;width:100%;background:var(--bg-card);border:1px solid var(--accent);border-radius:18px;padding:26px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.7),0 0 60px -20px var(--accent);max-height:88vh;overflow-y:auto;position:relative;";

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
  sub.style.cssText = "font-size:12px;color:var(--text-muted);text-align:center;margin-bottom:20px;line-height:1.5;";
  sub.textContent = "8 медалей, по 5 звёзд в каждой. Ранг зависит от MMR.";
  box.appendChild(sub);

  var grid = document.createElement("div");
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:12px;";

  for (var i = 0; i < RATING_TABLE.length; i++) {
    var m = RATING_TABLE[i];
    var tile = document.createElement("div");
    tile.style.cssText = "background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;padding:14px 10px;text-align:center;";

    tile.appendChild(buildMedalSVG(i, 72));

    var name = document.createElement("div");
    name.style.cssText = "font-size:14px;font-weight:800;color:" + m.accent + ";margin-top:10px;";
    name.textContent = m.ru;
    tile.appendChild(name);

    var nameEn = document.createElement("div");
    nameEn.style.cssText = "font-size:10px;color:var(--text-dim);letter-spacing:0.05em;text-transform:uppercase;margin-top:2px;";
    nameEn.textContent = m.name;
    tile.appendChild(nameEn);

    var mmrRange = document.createElement("div");
    mmrRange.style.cssText = "font-size:11px;color:var(--text-muted);margin-top:8px;font-family:'JetBrains Mono', monospace;";
    mmrRange.textContent = m.stars[0] + " – " + (m.stars[4] + 199) + " MMR";
    tile.appendChild(mmrRange);

    /* Звёзды */
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
    medalBox.appendChild(buildMedalSVG(medal.medal.rankIdx, 96));
  } else {
    medalBox.appendChild(buildQuestionMedalSVG(96));
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

    info.appendChild(el("div", { style: "font-size:12px;color:var(--text-muted);margin-top:6px;font-family:'JetBrains Mono', monospace;" },
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
    } else {
      info.appendChild(el("div", { style: "font-size:11px;color:var(--gold);margin-top:10px;font-weight:700;" }, "★ Максимальный ранг!"));
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

  /* Кнопки */
  var btnRow = el("div", { style: "display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap;" });
  var allRanksBtn = UI.btn("📊 Все ранги", { variant: "ghost" });
  allRanksBtn.style.flex = "1";
  allRanksBtn.addEventListener("click", function () { showAllRanksDialog(); });
  btnRow.appendChild(allRanksBtn);
  card.appendChild(btnRow);

  /* Лучшие очки */
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

console.log("rating v5.2 ready (all ranks dialog)");
