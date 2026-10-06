/* DOTA JETCH — BRAIN MATCH REVIEW v2.0
   Использует BrainMatchAnalyzer для глубокого разбора матча.
   Отвечает на вопросы: "почему проиграл", "кто руинер", "как фармить", "что делать". */

var BrainMatchReview = {

  detect: function (q) {
    var s = String(q || "").toLowerCase().trim();
    if (s.length > 150) return null;

    if (s.indexOf("почему я проиграл") >= 0) return "why_lost";
    if (s.indexOf("почему проиграли") >= 0) return "why_lost";
    if (s.indexOf("почему мы проиграли") >= 0) return "why_lost";
    if (s.indexOf("как я проиграл") >= 0) return "why_lost";
    if (s.indexOf("из-за чего проиграл") >= 0) return "why_lost";
    if (s.indexOf("почему луз") >= 0) return "why_lost";

    if (s.indexOf("руинер") >= 0) return "ruiner";
    if (s.indexOf("кто заруинил") >= 0) return "ruiner";
    if (s.indexOf("кто виноват") >= 0) return "ruiner";
    if (s.indexOf("слабый игрок") >= 0) return "ruiner";

    if (s.indexOf("что надо было сделать") >= 0) return "what_to_do";
    if (s.indexOf("что нужно было") >= 0) return "what_to_do";
    if (s.indexOf("чтобы победить") >= 0) return "what_to_do";
    if (s.indexOf("как победить") >= 0) return "what_to_do";
    if (s.indexOf("что можно было") >= 0) return "what_to_do";

    if (s.indexOf("как фармить") >= 0) return "farming";
    if (s.indexOf("как надо было фармить") >= 0) return "farming";
    if (s.indexOf("мой фарм") >= 0) return "farming";
    if (s.indexOf("фарм") >= 0 && s.indexOf("улучшить") >= 0) return "farming";

    if (s.indexOf("переломн") >= 0 || s.indexOf("ключевой момент") >= 0 || s.indexOf("перелом") >= 0) return "turning";

    if (s.indexOf("разбери мой матч") >= 0) return "review";
    if (s.indexOf("разбери матч") >= 0) return "review";
    if (s.indexOf("как я сыграл") >= 0) return "review";
    if (s.indexOf("оцени мой матч") >= 0) return "review";
    if (s.indexOf("оцени мою игру") >= 0) return "review";
    if (s.indexOf("мой последний матч") >= 0) return "review";
    if (s.indexOf("что не так с моей игрой") >= 0) return "review";

    if (s.indexOf("мой кда") >= 0 || s.indexOf("мой kda") >= 0) return "kda";
    if (s.indexOf("мой гпм") >= 0 || s.indexOf("мой gpm") >= 0) return "gpm";
    if (s.indexOf("мой урон") >= 0 || s.indexOf("мой дамаг") >= 0) return "damage";
    if (s.indexOf("мой билд") >= 0 || s.indexOf("мои предметы") >= 0) return "build";
    if (s.indexOf("что было хорошо") >= 0) return "good";
    if (s.indexOf("что было плохо") >= 0 || s.indexOf("что улучшить") >= 0) return "bad";

    return null;
  },

  _getLast: function () {
    if (typeof lastAnalysis !== "undefined" && lastAnalysis && lastAnalysis.match) return lastAnalysis;
    return null;
  },

  _getAnalyzer: function (res) {
    if (typeof BrainMatchAnalyzer === "undefined") return null;
    if (!res || !res.match || !res.player) return null;
    var isRadiant = res.player.player_slot < 128;
    return BrainMatchAnalyzer.buildFullReport(res.match, res.player.player_slot, isRadiant);
  },

  _heroNameById: function (res, heroId) {
    if (!res || !res.heroes) return "Игрок #" + heroId;
    for (var i = 0; i < res.heroes.length; i++) {
      if (res.heroes[i].id === heroId) return res.heroes[i].name;
    }
    return "Игрок #" + heroId;
  },

  answer: function (kind) {
    var res = this._getLast();
    if (!res) return "🤔 Нет данных последнего матча. Открой вкладку **«Анализ матча»**, введи ID матча и героя — потом спрашивай.";

    var p = res.player, m = res.match;
    var hn = res.hero ? res.hero.name : "?";
    var won = res.won;
    var dm = (m.duration || 0) / 60;
    var kda = (p.kills + p.assists) / Math.max(p.deaths, 1);

    if (kind === "why_lost") return this._whyLost(res, p, m, hn, won, dm, kda);
    if (kind === "ruiner") return this._ruiner(res, p, m, won);
    if (kind === "what_to_do") return this._whatToDo(res, p, m, hn, won, dm, kda);
    if (kind === "farming") return this._farming(res, p, m, hn);
    if (kind === "turning") return this._turning(res, p, m);
    if (kind === "review") return this._full(res, p, m, hn, won, dm, kda);
    if (kind === "kda") return "📊 **KDA:** " + p.kills + "/" + p.deaths + "/" + p.assists + " (" + kda.toFixed(2) + ")";
    if (kind === "gpm") return "💰 **GPM:** " + Math.round(p.gold_per_min || 0) + "\n**XPM:** " + Math.round(p.xp_per_min || 0) + "\n**Ластхиты:** " + (p.last_hits || 0);
    if (kind === "damage") return "⚔ **Урон по героям:** " + Math.round(p.hero_damage || 0) + "\n**По строениям:** " + Math.round(p.tower_damage || 0);
    if (kind === "good") return this._good(res, p, hn, won, dm, kda);
    if (kind === "bad") return this._bad(res, p, hn, won, dm, kda);
    if (kind === "build") {
      var items = res.items || {};
      var l = ["🎒 **Финальный инвентарь:**", ""];
      for (var i = 0; i < 6; i++) {
        var id = p["item_" + i] || 0;
        if (id > 0) { var it = items[id]; l.push("• " + (it ? it.name : "Предмет #" + id)); }
      }
      return l.join("\n");
    }
    return null;
  },

  _whyLost: function (res, p, m, hn, won, dm, kda) {
    if (won) return "🏆 Ты **выиграл** этот матч. Разбери проигранную игру — там будет полезнее.";
    var analyzer = this._getAnalyzer(res);
    var l = [];
    l.push("📉 **Почему ты проиграл на " + hn + "**");
    l.push("");

    if (analyzer && analyzer.turningPoints && analyzer.turningPoints.length) {
      l.push("**⚡ Переломные моменты:**");
      for (var i = 0; i < Math.min(analyzer.turningPoints.length, 3); i++) {
        var tp = analyzer.turningPoints[i];
        var sign = tp.goldSwing > 0 ? "+" : "";
        l.push("• **" + tp.time + " мин** — " + tp.reason + " (" + sign + tp.goldSwing + " золота)");
      }
      l.push("");
    } else {
      l.push("_Данных о таймлайне нет (матч не распарсен). Общий разбор ниже._");
      l.push("");
    }

    if (analyzer && analyzer.ruiner) {
      var rp = analyzer.ruiner.player;
      var heroName = this._heroNameById(res, rp.hero_id);
      var isMe = rp.player_slot === p.player_slot;
      l.push("**🎯 " + (isMe ? "Ты был слабым звеном" : "Главный руинер: " + heroName) + "**");
      l.push("• " + analyzer.ruiner.reason);
      l.push("");
    }

    l.push("**📊 Твои ошибки в этом матче:**");
    var bad = this._collectBad(p, dm, kda, won);
    if (bad.length) {
      for (var j = 0; j < bad.length; j++) l.push("• " + bad[j]);
    } else {
      l.push("• По метрикам лично ты сыграл нормально — проблема в команде.");
    }
    l.push("");

    l.push("💡 **Что делать:** " + this._getAdvice(p, dm, kda, won));
    return l.join("\n");
  },

  _ruiner: function (res, p, m, won) {
    if (won) return "🏆 Матч выигран — руинера нет. Разбери проигранную игру.";
    var analyzer = this._getAnalyzer(res);
    if (!analyzer || !analyzer.ruiner) return "🤔 Не смог определить руинера — возможно, матч не распарсен OpenDota.";

    var rp = analyzer.ruiner.player;
    var heroName = this._heroNameById(res, rp.hero_id);
    var isMe = rp.player_slot === p.player_slot;

    var l = [];
    l.push("🎯 **Разбор руинера матча**");
    l.push("");
    l.push("**Игрок:** " + heroName + (isMe ? " (это ты)" : ""));
    l.push("**KDA:** " + (rp.kills || 0) + "/" + (rp.deaths || 0) + "/" + (rp.assists || 0));
    l.push("**GPM:** " + Math.round(rp.gold_per_min || 0));
    l.push("**Нетворс:** " + (rp.total_gold || rp.gold || 0).toLocaleString());
    l.push("");
    l.push("**Почему его считаем руинером:**");
    l.push("• " + analyzer.ruiner.reason);
    l.push("");

    if (isMe) {
      l.push("⚠️ Это **ты сам**. Без обид — честная оценка. Записывай ошибки в дневник и работай над ними.");
    } else {
      l.push("💡 Обидно играть с такими, но фокусируйся на **своей** игре. Чужое не исправишь.");
    }
    return l.join("\n");
  },

  _whatToDo: function (res, p, m, hn, won, dm, kda) {
    var analyzer = this._getAnalyzer(res);
    var l = [];
    l.push("💡 **Что нужно было сделать на " + hn + "**");
    l.push("");

    var hasSpecific = false;

    if (analyzer && analyzer.farming && analyzer.farming.phases && analyzer.farming.phases.length) {
      l.push("**📈 Фарм по фазам:**");
      for (var i = 0; i < analyzer.farming.phases.length; i++) {
        var ph = analyzer.farming.phases[i];
        l.push("• " + ph.phase + " — на " + ph.deficit + " зол/мин ниже цели");
      }
      l.push("");
      hasSpecific = true;
    }

    if (analyzer && analyzer.farming && analyzer.farming.holes && analyzer.farming.holes.length) {
      l.push("**🔴 Минуты, где фарм остановился:**");
      for (var j = 0; j < Math.min(analyzer.farming.holes.length, 3); j++) {
        var h = analyzer.farming.holes[j];
        l.push("• " + h.minute + " мин — " + h.reason);
      }
      l.push("");
      hasSpecific = true;
    }

    if (analyzer && analyzer.fights && analyzer.fights.length) {
      l.push("**⚔ Ошибки в драках:**");
      for (var k = 0; k < Math.min(analyzer.fights.length, 3); k++) {
        var f = analyzer.fights[k];
        l.push("• На " + BrainMatchAnalyzer.fmtTime(f.time) + ": " + f.advice);
      }
      l.push("");
      hasSpecific = true;
    }

    if (!hasSpecific) {
      l.push("_Матч не распарсен — точных моментов не вижу. Общие советы ниже._");
      l.push("");
    }

    l.push("**🎯 Топ-советы:**");
    if (p.deaths >= 6) l.push("• Смотри мини-карту каждые 3-5 сек — не умирай в ловушках");
    if (p.gold_per_min < 450) l.push("• Стакай лагеря на 53-й секунде — даёт +150-200 GPM");
    if (kda < 2.5) l.push("• Не заходи первым в драку — жди инициатора");
    if ((p.last_hits || 0) / Math.max(dm, 1) < 5) l.push("• Тренируй ластхиты в Demo Hero 15 мин в день");
    l.push("• Пуш волну перед рунами (3:00, 6:00, 9:00, 12:00)");
    l.push("• После 2 подряд смертей — отойди в лес на 1-2 минуты");

    return l.join("\n");
  },

  _farming: function (res, p, m, hn) {
    var analyzer = this._getAnalyzer(res);
    if (!analyzer || !analyzer.farming) return "🤔 Не хватает данных о фарме (матч не распарсен). Средний GPM: " + Math.round(p.gold_per_min || 0);

    var l = [];
    l.push("💰 **Разбор фарма на " + hn + "**");
    l.push("");
    var durMin = (m.duration || 0) / 60;
    var lhPerMin = (p.last_hits || 0) / Math.max(durMin, 1);
    l.push("**Средний GPM:** " + Math.round(p.gold_per_min || 0));
    l.push("**Ластхиты:** " + (p.last_hits || 0) + " за " + durMin.toFixed(0) + " мин");
    l.push("**LH/мин:** " + lhPerMin.toFixed(1));
    l.push("");

    if (analyzer.farming.phases && analyzer.farming.phases.length) {
      l.push("**⚠️ Провалы по фазам:**");
      for (var i = 0; i < analyzer.farming.phases.length; i++) {
        var ph = analyzer.farming.phases[i];
        l.push("• **" + ph.phase + "** — " + ph.avgGrowth + " зол/мин (норма: " + ph.target + ")");
      }
      l.push("");
    }

    if (analyzer.farming.holes && analyzer.farming.holes.length) {
      l.push("**🔴 Минуты остановки фарма:**");
      for (var j = 0; j < Math.min(analyzer.farming.holes.length, 5); j++) {
        var h = analyzer.farming.holes[j];
        l.push("• " + h.minute + " мин — " + h.reason + " (потеря " + Math.abs(h.delta) + " зол)");
      }
      l.push("");
    }

    l.push("**💡 Что делать:**");
    if (p.gold_per_min < 400) l.push("• Стакай лагеря на 53-й секунде каждую минуту");
    if (lhPerMin < 5) l.push("• Тренируй ластхиты в Demo Hero по 15 мин/день");
    l.push("• Фарми между драками — не стой без дела");
    l.push("• Пуш волну перед рунами (3:00, 6:00, 9:00)");
    l.push("• Забирай вардовые лагеря у врага если безопасно");

    return l.join("\n");
  },

  _turning: function (res, p, m) {
    var analyzer = this._getAnalyzer(res);
    if (!analyzer || !analyzer.turningPoints || !analyzer.turningPoints.length) {
      return "🤔 Не нашёл резких переломов (матч не распарсен или игра шла ровно).";
    }
    var l = [];
    l.push("⚡ **Переломные моменты матча**");
    l.push("");
    for (var i = 0; i < analyzer.turningPoints.length; i++) {
      var tp = analyzer.turningPoints[i];
      var sign = tp.goldSwing > 0 ? "+" : "";
      l.push("**" + tp.time + " мин** — " + tp.reason);
      l.push("Скачок золота: " + sign + tp.goldSwing);
      l.push("");
    }
    l.push("💡 Смотри реплей в эти минуты, чтобы понять что можно было сделать иначе.");
    return l.join("\n");
  },

  _full: function (res, p, m, hn, won, dm, kda) {
    var l = [];
    l.push("📊 **Разбор матча " + hn + "**"); l.push("");
    l.push("**Результат:** " + (won ? "победа 🏆" : "поражение"));
    l.push("**KDA:** " + p.kills + "/" + p.deaths + "/" + p.assists + " (" + kda.toFixed(2) + ")");
    l.push("**Длительность:** " + dm.toFixed(1) + " мин");
    l.push("**GPM/XPM:** " + Math.round(p.gold_per_min || 0) + " / " + Math.round(p.xp_per_min || 0));
    l.push("");

    if (res.performance) {
      l.push("**Оценка:** " + res.performance.grade + " (" + res.performance.score + "/100)");
      if (res.performance.reasons) {
        for (var i = 0; i < res.performance.reasons.length; i++) l.push("• " + res.performance.reasons[i]);
      }
      l.push("");
    }

    var analyzer = this._getAnalyzer(res);
    if (analyzer && analyzer.turningPoints && analyzer.turningPoints.length) {
      l.push("**⚡ Ключевой момент:**");
      var tp = analyzer.turningPoints[0];
      l.push("• " + tp.time + " мин — " + tp.reason);
      l.push("");
    }

    var good = this._collectGood(p, dm, kda, won);
    if (good.length) {
      l.push("✅ **Хорошо:**");
      for (var g = 0; g < good.length; g++) l.push("• " + good[g]);
      l.push("");
    }

    var bad = this._collectBad(p, dm, kda, won);
    if (bad.length) {
      l.push("⚠️ **Улучшить:**");
      for (var b = 0; b < bad.length; b++) l.push("• " + bad[b]);
      l.push("");
    }

    l.push("💡 **Совет:** " + this._getAdvice(p, dm, kda, won));
    l.push("");
    l.push("_Спроси подробнее: «почему проиграл», «кто руинер», «как фармить»._");
    return l.join("\n");
  },

  _good: function (r, p, hn, won, dm, kda) {
    var g = this._collectGood(p, dm, kda, won);
    if (!g.length) return "Особенно хорошего мало, но это опыт.";
    var l = ["✅ **Хорошо в матче " + hn + ":**", ""];
    for (var i = 0; i < g.length; i++) l.push("• " + g[i]);
    return l.join("\n");
  },

  _bad: function (r, p, hn, won, dm, kda) {
    var b = this._collectBad(p, dm, kda, won);
    if (!b.length) return "⚠️ Слабых мест не видно.";
    var l = ["⚠️ **Улучшить в матче " + hn + ":**", ""];
    for (var i = 0; i < b.length; i++) l.push("• " + b[i]);
    return l.join("\n");
  },

  _collectGood: function (p, dm, kda, won) {
    var o = [];
    if (won) o.push("Победа");
    if (kda >= 4) o.push("Отличный KDA " + kda.toFixed(2));
    else if (kda >= 3) o.push("Хороший KDA " + kda.toFixed(2));
    if (p.gold_per_min >= 550) o.push("Высокий GPM (" + Math.round(p.gold_per_min) + ")");
    var lh = (p.last_hits || 0) / Math.max(dm, 1);
    if (lh >= 7) o.push("Отличный фарм (" + lh.toFixed(1) + " LH/мин)");
    if (p.deaths <= 3) o.push("Мало смертей (" + p.deaths + ")");
    if ((p.hero_damage || 0) / Math.max(dm, 1) >= 700) o.push("Высокий урон");
    if ((p.tower_damage || 0) >= 3000) o.push("Хороший урон по строениям");
    return o;
  },

  _collectBad: function (p, dm, kda, won) {
    var o = [];
    if (!won) o.push("Поражение");
    if (kda < 1.5) o.push("Низкий KDA " + kda.toFixed(2));
    else if (kda < 2.5) o.push("Средний KDA " + kda.toFixed(2));
    if (p.deaths >= 8) o.push("Много смертей (" + p.deaths + ")");
    else if (p.deaths >= 5) o.push("Смертей " + p.deaths);
    if (p.gold_per_min < 350) o.push("Низкий GPM (" + Math.round(p.gold_per_min) + ")");
    var lh = (p.last_hits || 0) / Math.max(dm, 1);
    if (lh < 4 && p.lane_role !== 4 && p.lane_role !== 5) o.push("Слабый фарм");
    if ((p.hero_damage || 0) / Math.max(dm, 1) < 300) o.push("Низкий урон");
    return o;
  },

  _getAdvice: function (p, dm, kda, won) {
    if (p.deaths >= 8) return "Много смертей. Не фарми без вижена, следи за миникартой.";
    if (p.gold_per_min < 350) return "Низкий фарм. Стакай лагеря на 53-й секунде.";
    if (kda < 2) return "Работай над KDA. Больше ассистов, меньше смертей.";
    if (!won) return "Проанализируй, где команда потеряла темп. Смотри реплей.";
    return "Отличная игра! Продолжай.";
  }
};

console.log("brain-match-review v2.0 ready (deep analysis)");
