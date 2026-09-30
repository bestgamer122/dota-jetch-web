/* DOTA JETCH — BRAIN REASON V2 v1.0 */

var BrainReasonV2 = {
  why: function (topic) {
    if (!topic) return null;
    var low = topic.toLowerCase();
    var sh = (typeof BrainSharedMemory !== "undefined") ? BrainSharedMemory.load() : null;
    if (low.indexOf("проигрыв") >= 0 || low.indexOf("лузаю") >= 0 || low.indexOf("винрейт") >= 0) return this._whyLosing(sh);
    if (low.indexOf("умира") >= 0 || low.indexOf("смерт") >= 0) return this._whyDying(sh);
    if (low.indexOf("gpm") >= 0 || low.indexOf("фарм") >= 0 || low.indexOf("голд") >= 0) return this._whyLowGpm(sh);
    for (var hero in (sh ? sh.heroes : {})) {
      if (sh.heroes.hasOwnProperty(hero) && low.indexOf(hero.toLowerCase()) >= 0) return this._analyzeHero(sh.heroes[hero], hero);
    }
    return null;
  },

  _whyLosing: function (sh) {
    if (!sh || !sh.player || sh.player.totalMatches < 3) return "Мало данных. Разбери 3+ матча.";
    var pl = sh.player;
    var wr = (pl.wins / pl.totalMatches) * 100;
    var r = [];
    if (pl.avgDeaths > 6) r.push("Ты много умираешь (в среднем " + pl.avgDeaths.toFixed(1) + ").");
    if (pl.avgGpm < 400) r.push("Низкий GPM (" + pl.avgGpm.toFixed(0) + ").");
    if (pl.avgKda < 2.5) r.push("Низкий KDA (" + pl.avgKda.toFixed(2) + ").");
    if (pl.tiltStreak >= 3) r.push("Лузстрик " + pl.tiltStreak + " — сделай паузу.");
    if (!r.length) return "Винрейт " + wr.toFixed(0) + "%, слабых мест не вижу.";
    return "Причины поражений (винрейт " + wr.toFixed(0) + "%):\n\n• " + r.join("\n• ");
  },

  _whyDying: function (sh) {
    if (!sh || !sh.player) return "Мало данных.";
    var a = sh.player.avgDeaths;
    var l = [];
    if (a > 7) l.push("Очень много смертей (" + a.toFixed(1) + ").");
    else if (a > 5) l.push("Много смертей (" + a.toFixed(1) + ").");
    else l.push("Смертей немного (" + a.toFixed(1) + ").");
    l.push("");
    l.push("Что делать:");
    l.push("• Смотри мини-карту каждые 3-5 сек");
    l.push("• Не фарми без вижена");
    l.push("• Носи TP");
    return l.join("\n");
  },

  _whyLowGpm: function (sh) {
    if (!sh || !sh.player) return "Мало данных.";
    var g = sh.player.avgGpm;
    var l = ["Средний GPM: " + g.toFixed(0) + "."];
    if (g < 300) l.push("Это очень мало.");
    else if (g < 450) l.push("Это ниже среднего.");
    else l.push("Это неплохо.");
    l.push("");
    l.push("Как поднять GPM:");
    l.push("• Стакай лагеря на 53-й секунде");
    l.push("• Фарми между драками");
    l.push("• Пуш волны перед рунами");
    return l.join("\n");
  },

  _analyzeHero: function (hd, hn) {
    var wr = hd.matches > 0 ? (hd.wins / hd.matches) * 100 : 0;
    var l = ["📊 " + hn + ":"];
    l.push("• Матчей: " + hd.matches);
    l.push("• Винрейт: " + wr.toFixed(0) + "%");
    if (hd.totalKda) l.push("• Средний KDA: " + (hd.totalKda / Math.max(hd.matches, 1)).toFixed(2));
    return l.join("\n");
  }
};
