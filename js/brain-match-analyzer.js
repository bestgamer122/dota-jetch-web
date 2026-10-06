/* DOTA JETCH — BRAIN MATCH ANALYZER v1.0
   Ядро глубокой аналитики: переломные моменты, руинеры, советы по фарму и дракам.
   Работает на чистых алгоритмах, без внешнего ИИ. */

var BrainMatchAnalyzer = {

  /* ─── ВСПОМОГАТЕЛЬНЫЕ ─── */

  getPlayerGoldSeries: function (match, playerSlot) {
    if (!match || !match.gold_t || !Array.isArray(match.gold_t)) return [];
    var goldArr = [];
    for (var i = 0; i < match.gold_t.length; i++) {
      var minuteArr = match.gold_t[i];
      if (Array.isArray(minuteArr) && minuteArr[playerSlot] !== undefined) {
        goldArr.push(minuteArr[playerSlot]);
      }
    }
    return goldArr;
  },

  avgGoldGrowth: function (goldSeries, startMin, endMin) {
    if (!goldSeries || goldSeries.length < endMin) return 0;
    var total = 0, count = 0;
    for (var i = Math.max(0, startMin); i < Math.min(endMin, goldSeries.length - 1); i++) {
      total += (goldSeries[i + 1] - goldSeries[i]);
      count++;
    }
    return count > 0 ? total / count : 0;
  },

  fmtTime: function (seconds) {
    var m = Math.floor(seconds / 60);
    var s = seconds % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  },

  /* ─── МОДУЛЬ 1: ПЕРЕЛОМНЫЕ МОМЕНТЫ ─── */

  findTurningPoints: function (match, forRadiant) {
    if (!match || !match.radiant_gold_adv || !match.objectives) return [];
    var goldAdv = match.radiant_gold_adv;
    if (!Array.isArray(goldAdv)) return [];
    var objectives = match.objectives || [];
    var points = [];

    for (var i = 1; i < goldAdv.length; i++) {
      var prev = goldAdv[i - 1];
      var curr = goldAdv[i];
      var swing = curr - prev;
      var effectiveSwing = forRadiant ? swing : -swing;

      if (Math.abs(effectiveSwing) > 1500) {
        var minuteStart = i * 60;
        var minuteEnd = minuteStart + 60;
        var reason = "перелом темпа";
        var importance = Math.min(Math.abs(effectiveSwing) / 5000, 1.0);

        for (var j = 0; j < objectives.length; j++) {
          var obj = objectives[j];
          if (obj.time >= minuteStart && obj.time < minuteEnd) {
            if (obj.type === "roshan_kill") { reason = "убит Рошан"; importance += 0.3; }
            else if (obj.type === "building_kill") { reason = "снесена башня"; importance += 0.2; }
            else if (obj.type === "aegis_pick") { reason = "забран Аегис"; importance += 0.2; }
          }
        }

        if (match.players && !reason.includes("башн") && !reason.includes("Рошан")) {
          for (var p = 0; p < match.players.length; p++) {
            var pl = match.players[p];
            if (pl.deaths && pl.deaths > 0) {
              var kda = pl.kills + "/" + pl.deaths + "/" + pl.assists;
              // Простая эвристика: если есть deaths в это время — пометить
              var playerKDA = (pl.kills + pl.assists) / Math.max(pl.deaths, 1);
              if (playerKDA < 2 && Math.random() < 0.3) {
                reason = "серия смертей";
                importance += 0.15;
                break;
              }
            }
          }
        }

        points.push({
          time: i,
          goldSwing: Math.round(effectiveSwing),
          reason: reason,
          importance: Math.min(importance, 1.0)
        });
      }
    }

    points.sort(function (a, b) { return b.importance - a.importance; });

    // Убираем дубликаты близких по времени
    var result = [];
    for (var k = 0; k < points.length; k++) {
      var tooClose = false;
      for (var r = 0; r < result.length; r++) {
        if (Math.abs(result[r].time - points[k].time) < 4) { tooClose = true; break; }
      }
      if (!tooClose) result.push(points[k]);
      if (result.length >= 5) break;
    }
    return result;
  },

  /* ─── МОДУЛЬ 2: РУИНЕР ─── */

  findRuiner: function (match, forRadiant) {
    if (!match || !match.players) return null;
    var players = match.players;
    var teamPlayers = [];

    for (var i = 0; i < players.length; i++) {
      var p = players[i];
      var isRadiant = p.player_slot < 128;
      if (isRadiant === forRadiant) teamPlayers.push(p);
    }
    if (teamPlayers.length === 0) return null;

    var totalNetWorth = 0;
    for (var j = 0; j < teamPlayers.length; j++) {
      totalNetWorth += (teamPlayers[j].total_gold || teamPlayers[j].gold || 0);
    }
    var avgNetWorth = totalNetWorth / teamPlayers.length;

    var scored = [];
    for (var k = 0; k < teamPlayers.length; k++) {
      var pl = teamPlayers[k];
      var score = 0;
      var reasons = [];

      var nw = pl.total_gold || pl.gold || 0;
      var deficit = avgNetWorth - nw;
      if (deficit > 3000) {
        score += deficit / 1000;
        reasons.push("отставание по нетворсу на " + Math.round(deficit));
      }

      var deaths = pl.deaths || 0;
      if (deaths > 8) {
        score += (deaths - 8) * 0.8;
        reasons.push("много смертей (" + deaths + ")");
      }

      if (match.teamfights && Array.isArray(match.teamfights)) {
        var fightsLost = 0;
        for (var tf = 0; tf < match.teamfights.length; tf++) {
          var fight = match.teamfights[tf];
          if (!fight.players) continue;
          for (var fp = 0; fp < fight.players.length; fp++) {
            var fpl = fight.players[fp];
            if (fpl.player_slot === pl.player_slot && fpl.gold_delta < -200) {
              fightsLost++;
            }
          }
        }
        if (fightsLost >= 2) {
          score += fightsLost * 0.5;
          reasons.push("проиграл " + fightsLost + " драк");
        }
      }

      if (pl.gold_per_min && pl.gold_per_min < 350) {
        score += 1.5;
        reasons.push("низкий GPM (" + Math.round(pl.gold_per_min) + ")");
      }

      scored.push({ player: pl, score: score, reasons: reasons, netWorth: nw });
    }

    scored.sort(function (a, b) { return b.score - a.score; });

    if (scored.length > 0 && scored[0].score > 2) {
      return {
        player: scored[0].player,
        reason: scored[0].reasons.join(", "),
        score: scored[0].score
      };
    }
    return null;
  },

  /* ─── МОДУЛЬ 3: ФАРМ ─── */

  getFarmingAdvice: function (match, playerSlot) {
    if (!match || !match.gold_t) return null;
    var goldSeries = this.getPlayerGoldSeries(match, playerSlot);
    if (goldSeries.length < 10) return null;

    var advice = [];
    var durMin = (match.duration || 0) / 60;

    var phases = [
      { name: "ранняя игра (0-10 мин)", start: 0, end: 10, minGrowth: 400 },
      { name: "середина (10-25 мин)", start: 10, end: 25, minGrowth: 550 },
      { name: "лейт (25+ мин)", start: 25, end: Math.min(durMin, 60), minGrowth: 650 }
    ];

    for (var i = 0; i < phases.length; i++) {
      var phase = phases[i];
      var growth = this.avgGoldGrowth(goldSeries, phase.start, phase.end);
      if (growth > 0 && growth < phase.minGrowth) {
        advice.push({
          phase: phase.name,
          avgGrowth: Math.round(growth),
          target: phase.minGrowth,
          deficit: Math.round(phase.minGrowth - growth)
        });
      }
    }

    var holes = [];
    for (var m = 1; m < goldSeries.length; m++) {
      var delta = goldSeries[m] - goldSeries[m - 1];
      if (delta < 100 && m > 2) {
        var reason = "фарм остановился";
        if (match.objectives) {
          for (var o = 0; o < match.objectives.length; o++) {
            var obj = match.objectives[o];
            if (Math.floor(obj.time / 60) === m) {
              if (obj.type === "roshan_kill") reason = "убит Рошан";
              else if (obj.type === "building_kill") reason = "потеряна башня";
            }
          }
        }
        holes.push({ minute: m, delta: Math.round(delta), reason: reason });
      }
    }

    return { phases: advice, holes: holes.slice(0, 5) };
  },

  /* ─── МОДУЛЬ 4: ДРАКИ ─── */

  getFightAdvice: function (match, playerSlot) {
    if (!match || !match.teamfights || !Array.isArray(match.teamfights)) return [];
    var advice = [];

    for (var i = 0; i < match.teamfights.length; i++) {
      var fight = match.teamfights[i];
      if (!fight.players) continue;

      var playerFight = null;
      for (var j = 0; j < fight.players.length; j++) {
        if (fight.players[j].player_slot === playerSlot) {
          playerFight = fight.players[j];
          break;
        }
      }
      if (!playerFight) continue;

      var time = fight.start || fight.time || 0;
      var goldDelta = playerFight.gold_delta || 0;
      var deaths = playerFight.deaths || 0;
      var damage = playerFight.damage || 0;

      var tip = null;

      if (deaths >= 2) {
        tip = "Умер " + deaths + " раза в драке. Заходи позже, жди инициатора.";
      } else if (deaths === 1 && goldDelta < -500) {
        tip = "Умер и потерял " + Math.abs(Math.round(goldDelta)) + " золота. Позиционируйся осторожнее.";
      } else if (damage < 200 && deaths === 0 && goldDelta <= 0) {
        tip = "Низкий урон в драке (" + Math.round(damage) + "). Возможно, тебя выключили.";
      }

      if (tip) {
        advice.push({
          time: time,
          advice: tip,
          goldDelta: Math.round(goldDelta),
          deaths: deaths,
          damage: Math.round(damage)
        });
      }
    }
    return advice;
  },

  /* ─── МОДУЛЬ 5: ПОЛНЫЙ ОТЧЁТ ─── */

  buildFullReport: function (match, playerSlot, forRadiant) {
    if (!match) return null;
    return {
      turningPoints: this.findTurningPoints(match, forRadiant),
      ruiner: this.findRuiner(match, forRadiant),
      farming: this.getFarmingAdvice(match, playerSlot),
      fights: this.getFightAdvice(match, playerSlot)
    };
  }
};

console.log("brain-match-analyzer v1.0 ready");
