/* DOTA JETCH — BRAIN SHARED MEMORY v1.0 */

var BrainSharedMemory = {
  key: "brain_shared_memory",

  load: function () {
    var raw = Store.get(this.key, null);
    if (!raw || typeof raw !== "object") {
      raw = {
        heroes: {}, items: {}, matchups: {},
        player: { totalMatches: 0, wins: 0, avgGpm: 0, avgXpm: 0, avgKda: 0, avgDeaths: 0, preferredHeroes: [], tiltStreak: 0 },
        insights: [], lastUpdate: 0
      };
    }
    return raw;
  },

  save: function (d) { d.lastUpdate = Date.now(); Store.set(this.key, d); },

  recordMatch: function (analysis) {
    if (!analysis || !analysis.match || !analysis.player) return;
    var d = this.load();
    var p = analysis.player, m = analysis.match;
    var hero = analysis.hero ? analysis.hero.name : "Unknown";
    var won = analysis.won;

    if (!d.heroes[hero]) d.heroes[hero] = { matches: 0, wins: 0, totalKda: 0, totalGpm: 0, lastPlayed: 0, notes: [] };
    var h = d.heroes[hero];
    h.matches++;
    if (won) h.wins++;
    h.totalKda += (p.kills + p.assists) / Math.max(p.deaths, 1);
    h.totalGpm += p.gold_per_min || 0;
    h.lastPlayed = Date.now();

    var pl = d.player;
    var prev = pl.totalMatches || 0;
    pl.totalMatches = prev + 1;
    if (won) pl.wins = (pl.wins || 0) + 1;
    pl.avgGpm = ((pl.avgGpm * prev) + (p.gold_per_min || 0)) / pl.totalMatches;
    pl.avgXpm = ((pl.avgXpm * prev) + (p.xp_per_min || 0)) / pl.totalMatches;
    pl.avgDeaths = ((pl.avgDeaths * prev) + (p.deaths || 0)) / pl.totalMatches;
    var kda = (p.kills + p.assists) / Math.max(p.deaths, 1);
    pl.avgKda = ((pl.avgKda * prev) + kda) / pl.totalMatches;

    if (won) pl.tiltStreak = 0;
    else pl.tiltStreak = (pl.tiltStreak || 0) + 1;

    this._generateInsights(d, analysis);
    this.save(d);
  },

  _generateInsights: function (d, analysis) {
    var hero = analysis.hero ? analysis.hero.name : "?";
    var h = d.heroes[hero];
    if (!h) return;
    if (h.matches >= 3) {
      var avgKda = h.totalKda / h.matches;
      if (avgKda < 2) this._addInsight(d, "На герое " + hero + " у тебя низкий средний KDA (" + avgKda.toFixed(1) + ").", "hero_stats");
    }
    if (h.matches >= 5) {
      var wr = (h.wins / h.matches) * 100;
      if (wr < 40) this._addInsight(d, "Винрейт на " + hero + " всего " + wr.toFixed(0) + "%.", "hero_stats");
      else if (wr > 60) this._addInsight(d, "На " + hero + " у тебя отличный винрейт " + wr.toFixed(0) + "%!", "hero_stats");
    }
    if (d.player.tiltStreak >= 3) this._addInsight(d, "У тебя " + d.player.tiltStreak + " поражений подряд. Сделай паузу.", "mental");
  },

  _addInsight: function (d, text, source) {
    for (var i = 0; i < d.insights.length; i++) if (d.insights[i].text === text) return;
    d.insights.unshift({ text: text, ts: Date.now(), source: source || "general" });
    if (d.insights.length > 50) d.insights = d.insights.slice(0, 50);
  },

  recordChatFact: function (topic, detail) {
    var d = this.load();
    this._addInsight(d, "Из чата: " + detail, "chat_" + topic);
    this.save(d);
  },

  getPlayerSummary: function () {
    var d = this.load();
    var pl = d.player;
    if (pl.totalMatches === 0) return null;
    var wr = (pl.wins / pl.totalMatches) * 100;
    var ls = [];
    ls.push("Ты сыграл " + pl.totalMatches + " матчей, винрейт " + wr.toFixed(0) + "%.");
    ls.push("Средний GPM: " + pl.avgGpm.toFixed(0) + ", XPM: " + pl.avgXpm.toFixed(0) + ", KDA: " + pl.avgKda.toFixed(2) + ".");
    if (pl.tiltStreak >= 2) ls.push("Сейчас у тебя лузстрик " + pl.tiltStreak + ".");
    var hList = [];
    for (var n in d.heroes) if (d.heroes.hasOwnProperty(n)) hList.push({ name: n, matches: d.heroes[n].matches });
    hList.sort(function (a, b) { return b.matches - a.matches; });
    if (hList.length) ls.push("Чаще всего: " + hList.slice(0, 3).map(function (h) { return h.name + " (" + h.matches + ")"; }).join(", ") + ".");
    return ls.join(" ");
  },

  getInsights: function (limit) { return this.load().insights.slice(0, limit || 10); },
  clear: function () { Store.set(this.key, null); }
};
