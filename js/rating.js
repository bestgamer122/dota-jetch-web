/* DOTA JETCH — RATING v2.0
   - Реальные иконки медалей Dota 2 с CDN Valve
   - Многоуровневый fallback (несколько CDN → эмодзи)
   - 8 рангов + звёзды */

var RATING_TABLE = [
  { name: "Recruit",  ru: "Рекрут",    icon: "🪖", color: "#8b8b8b", rankIdx: 0, stars: [0, 150, 300, 460, 610] },
  { name: "Guardian", ru: "Страж",     icon: "🛡️", color: "#c0c0c0", rankIdx: 1, stars: [770, 920, 1080, 1230, 1400] },
  { name: "Crusader", ru: "Рыцарь",    icon: "⚔️", color: "#cd7f32", rankIdx: 2, stars: [1540, 1700, 1850, 2000, 2150] },
  { name: "Archon",   ru: "Герой",     icon: "🏅", color: "#4a9eff", rankIdx: 3, stars: [2310, 2450, 2610, 2770, 2930] },
  { name: "Legend",   ru: "Легенда",   icon: "🌟", color: "#9b59b6", rankIdx: 4, stars: [3080, 3230, 3390, 3540, 3700] },
  { name: "Ancient",  ru: "Властелин", icon: "💎", color: "#e67e22", rankIdx: 5, stars: [3850, 4000, 4150, 4300, 4460] },
  { name: "Divine",   ru: "Божество",  icon: "👑", color: "#f1c40f", rankIdx: 6, stars: [4620, 4820, 5020, 5220, 5420] },
  { name: "Immortal", ru: "Титан",     icon: "🔥", color: "#e74c3c", rankIdx: 7, stars: [5620, 5800, 6000, 6200, 6500] }
];

/* Реальные иконки медалей Dota 2 (Valve CDN) */
var MEDAL_CDN = [
  "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/ranks/rank_icon_",
  "https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/icons/ranks/rank_icon_",
  "https://cdn.fastly.steamstatic.com/apps/dota2/images/dota_react/icons/ranks/rank_icon_"
];

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
    lockpick: { base: 15, perPoint: 0.004 },
    automaton: { base: 12, perPoint: 0.005 },
    quiz: { base: 20, perPoint: 0.15 }
  };
  var c = config[game] || config.lockpick;
  return Math.round(c.base + rawScore * c.perPoint);
}

/* Универсальная картинка медали с fallback на эмодзи */
function buildMedalImage(rankIdx, size, fallbackEmoji, color) {
  size = size || 88;
  var wrap = document.createElement("div");
  wrap.style.cssText = "position:relative;width:" + size + "px;height:" + size + "px;flex-shrink:0;display:flex;align-items:center;justify-content:center;";

  /* Fallback эмодзи (показывается, если картинка не загрузится) */
  var fb = document.createElement("div");
  fb.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:" + Math.round(size * 0.55) + "px;line-height:1;";
  fb.textContent = fallbackEmoji;
  wrap.appendChild(fb);

  /* Пробуем картинку с нескольких CDN по очереди */
  var img = document.createElement("img");
  img.alt = "";
  img.loading = "lazy";
  img.style.cssText = "position:relative;width:100%;height:100%;object-fit:contain;display:block;z-index:1;filter:drop-shadow(0 0 12px " + color + "55);";
  img.style.opacity = "0";
  img.style.transition = "opacity 0.3s ease";

  var idx = 0;
  var tried = 0;
  img.onload = function () {
    img.style.opacity = "1";
    fb.style.display = "none";
  };
  img.onerror = function () {
    idx++;
    if (idx < MEDAL_CDN.length) {
      img.src = MEDAL_CDN[idx] + rankIdx + ".png";
    } else {
      /* Все CDN не сработали — оставляем эмодзи */
      img.style.display = "none";
      fb.style.display = "flex";
    }
  };

  img.src = MEDAL_CDN[0] + rankIdx + ".png";
  wrap.appendChild(img);
  return wrap;
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
  if (gained >= 25) data.wins++;
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

  /* Медаль */
  var medalBox = el("div", { style: "text-align:center;flex-shrink:0;" });
  medalBox.appendChild(buildMedalImage(medal.medal.rankIdx, 96, medal.medal.icon, medal.medal.color));

  var starsRow = el("div", { style: "display:flex;gap:3px;justify-content:center;margin-top:8px;" });
  for (var s = 0; s < 5; s++) {
    var star = el("span", { style: "font-size:12px;color:" + (s < medal.stars ? medal.medal.color : "var(--border)") + ";text-shadow:" + (s < medal.stars ? "0 0 6px " + medal.medal.color + "88" : "none") + ";" }, "★");
    starsRow.appendChild(star);
  }
  medalBox.appendChild(starsRow);
  main.appendChild(medalBox);

  /* Инфо */
  var info = el("div", { style: "flex:1;min-width:180px;" });
  var rankName = el("div", { style: "font-size:24px;font-weight:900;color:" + medal.medal.color + ";" });
  rankName.textContent = medal.medal.ru;
  info.appendChild(rankName);
  info.appendChild(el("div", { style: "font-size:12px;color:var(--text-muted);margin-top:4px;" },
    medal.stars + " ★ · " + data.mmr + " MMR"));
  info.appendChild(el("div", { style: "font-size:11px;color:var(--text-dim);margin-top:6px;" },
    "Игр: " + data.gamesPlayed + " · Побед: " + data.wins));

  /* Прогресс до след. звезды */
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
    var fill = el("div", { style: "height:100%;width:" + pct + "%;background:linear-gradient(90deg," + medal.medal.color + ",var(--cyan));border-radius:3px;transition:width 0.6s ease;" });
    bar.appendChild(fill);
    barWrap.appendChild(bar);
    info.appendChild(barWrap);
  } else {
    info.appendChild(el("div", { style: "font-size:11px;color:var(--gold);margin-top:10px;font-weight:700;" }, "★ Максимальный ранг!"));
  }
  main.appendChild(info);
  card.appendChild(main);

  /* Калибровка */
  if (!data.calibrated) {
    var cal = el("div", { style: "background:var(--accent-bg);border:1px solid var(--accent);border-radius:12px;padding:12px 14px;margin-bottom:14px;" });
    cal.appendChild(el("div", { style: "font-size:12px;font-weight:700;color:var(--accent-light);margin-bottom:4px;" }, "📊 Калибровка"));
    cal.appendChild(el("div", { style: "font-size:11px;color:var(--text-muted);" }, "Сыграно: " + data.calibrationGames + " / 10 игр. После калибровки откроется точный ранг."));
    var calBar = el("div", { style: "height:4px;background:var(--bg-elev);border-radius:2px;overflow:hidden;margin-top:8px;" });
    calBar.appendChild(el("div", { style: "height:100%;width:" + (data.calibrationGames * 10) + "%;background:var(--accent);border-radius:2px;" }));
    cal.appendChild(calBar);
    card.appendChild(cal);
  }

  /* Лучшие очки по играм */
  var scores = el("div", { style: "display:grid;grid-template-columns:repeat(3,1fr);gap:8px;" });
  var scoreDefs = [
    { icon: "🔓", name: "Взлом", val: data.bestScores.lockpick, color: "var(--gold)" },
    { icon: "⌨️", name: "Автоматоны", val: data.bestScores.automaton, color: "var(--cyan)" },
    { icon: "🧠", name: "Викторина", val: data.bestScores.quiz, color: "var(--green)" }
  ];
  for (var sd = 0; sd < scoreDefs.length; sd++) {
    var box = el("div", { style: "text-align:center;padding:10px 6px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;" });
    box.appendChild(el("div", { style: "font-size:18px;" }, scoreDefs[sd].icon));
    box.appendChild(el("div", { style: "font-size:11px;font-weight:700;color:" + scoreDefs[sd].color + ";font-family:'JetBrains Mono',monospace;margin-top:4px;" }, scoreDefs[sd].val ? scoreDefs[sd].val.toLocaleString() : "—"));
    box.appendChild(el("div", { class: "dim", style: "font-size:9px;text-transform:uppercase;margin-top:2px;" }, scoreDefs[sd].name));
    scores.appendChild(box);
  }
  card.appendChild(scores);

  return card;
};

console.log("rating v2.0 ready (real medal icons)");
