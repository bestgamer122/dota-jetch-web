/* DOTA JETCH — RATING v7.1 */

var RATING_TABLE = [
  { name: "Herald",    ru: "Рекрут",    rankIdx: 0, accent: "#7ab85a", stars: [0, 150, 300, 460, 610] },
  { name: "Guardian",  ru: "Страж",     rankIdx: 1, accent: "#b8b8c0", stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader",  ru: "Рыцарь",    rankIdx: 2, accent: "#4ac8e0", stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",    ru: "Герой",     rankIdx: 3, accent: "#9ad050", stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",    ru: "Легенда",   rankIdx: 4, accent: "#e05a80", stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",   ru: "Властелин", rankIdx: 5, accent: "#9a6ae0", stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",    ru: "Божество",  rankIdx: 6, accent: "#5a8ae0", stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal",  ru: "Титан",     rankIdx: 7, accent: "#e04040", stars: [5620, 5800, 6000, 6200, 6500] }
];

var CALIBRATION_GAMES = 10;

/* URL иконок Valve (через wsrv.nl proxy, работает в РФ) */
function rankUrl(rankIdx, star) {
  var path = "cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/ranks/rank_icon_" + rankIdx + "_" + star + ".png";
  return "https://wsrv.nl/?url=" + encodeURIComponent(path);
}

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

/* Fallback SVG если картинка не загрузилась */
function buildFallbackSVG(rankIdx, size) {
  var cfg = RATING_TABLE[rankIdx] || RATING_TABLE[0];
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;";

  var outer = document.createElementNS(ns, "path");
  outer.setAttribute("d", "M100 15 L185 100 L100 185 L15 100 Z");
  outer.setAttribute("fill", "#1e2129");
  outer.setAttribute("stroke", cfg.accent);
  outer.setAttribute("stroke-width", "3");
  svg.appendChild(outer);

  var inner = document.createElementNS(ns, "path");
  inner.setAttribute("d", "M100 40 L160 100 L100 160 L40 100 Z");
  inner.setAttribute("fill", "rgba(0,0,0,0.5)");
  inner.setAttribute("stroke", cfg.accent);
  inner.setAttribute("stroke-width", "1.5");
  svg.appendChild(inner);

  var sym = document.createElementNS(ns, "text");
  sym.setAttribute("x", "100");
  sym.setAttribute("y", "118");
  sym.setAttribute("text-anchor", "middle");
  sym.setAttribute("font-size", "60");
  sym.setAttribute("font-weight", "900");
  sym.setAttribute("fill", cfg.accent);
  sym.setAttribute("font-family", "sans-serif");
  sym.textContent = "★";
  svg.appendChild(sym);

  return svg;
}

/* Медаль: пробует картинку, если не удалось — fallback */
function buildMedalSVG(rankIdx, size) {
  size = size || 96;
  var wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;width:" + size + "px;height:" + size + "px;flex-shrink:0;display:flex;align-items:center;justify-content:center;";

  var fb = buildFallbackSVG(rankIdx, size);
  fb.style.position = "absolute";
  fb.style.inset = "0";
  wrap.appendChild(fb);

  var img = document.createElement("img");
  img.alt = "";
  img.loading = "lazy";
  img.style.cssText = "position:relative;width:100%;height:100%;object-fit:contain;display:block;z-index:1;opacity:0;transition:opacity 0.3s ease;";

  var triedDirect = false;
  img.onload = function () {
    img.style.opacity = "1";
    fb.style.display = "none";
  };
  img.onerror = function () {
    if (!triedDirect) {
      triedDirect = true;
      var path = "cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/ranks/rank_icon_" + rankIdx + "_5.png";
      img.src = "https://" + path;
    } else {
      img.style.display = "none";
      fb.style.display = "block";
    }
  };

  img.src = rankUrl(rankIdx, 5);
  wrap.appendChild(img);
  return wrap;
}

function buildQuestionMedalSVG(size) {
  size = size || 96;
  var ns = "http://www.w3.org/2000/svg";
  var svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.style.cssText = "display:block;";

  var outer = document.createElementNS(ns, "path");
  outer.setAttribute("d", "M100 15 L185 100 L100 185 L15 100 Z");
  outer.setAttribute("fill", "#1e2129");
  outer.setAttribute("stroke", "#8b5cf6");
  outer.setAttribute("stroke-width", "3");
  outer.setAttribute("stroke-dasharray", "6 5");
  svg.appendChild(outer);

  var inner = document.createElementNS(ns, "path");
  inner.setAttribute("d", "M100 40 L160 100 L100 160 L40 100 Z");
  inner.setAttribute("fill", "#0b0c10");
  inner.setAttribute("stroke", "#8b5cf6");
  inner.setAttribute("stroke-width", "1.5");
  inner.setAttribute("opacity", "0.7");
  svg.appendChild(inner);

  var q = document.createElementNS(ns, "text");
  q.setAttribute("x", "100");
  q.setAttribute("y", "125");
  q.setAttribute("text-anchor", "middle");
  q.setAttribute("font-size", "70");
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
  medalWrap.appendChild(buildMedalSVG(medal.rankIdx, 140));
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
  box.style.cssText = "max-width:820px;width:100%;background:var(--bg-card);border:1px solid var(--accent);border-radius:18px;padding:26px 22px;box-shadow:0 20px 60px rgba(0,0,0,0.7);max-height:88vh;overflow-y:auto;position:relative;";
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
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px;";

  for (var i = 0; i < RATING_TABLE.length; i++) {
    (function (idx) {
      var m = RATING_TABLE[idx];
      var tile = document.createElement("div");
      tile.style.cssText = "background:var(--bg-elev);border:1px solid var(--border);border-radius:14px;padding:14px 10px;text-align:center;";
      tile.classList.add("rating-tile-anim");
      tile.style.animationDelay = (idx * 60) + "ms";

      var medalWrap = document.createElement("div");
      medalWrap.style.cssText = "display:flex;justify-content:center;";
      medalWrap.appendChild(buildMedalSVG(idx, 110));
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
    medalBox.appendChild(buildMedalSVG(medal.medal.rankIdx, 120));
  } else {
    medalBox.appendChild(buildQuestionMedalSVG(120));
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

console.log("rating v7.1 ready");
