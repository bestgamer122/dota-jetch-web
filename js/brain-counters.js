/* DOTA JETCH — BRAIN COUNTERS v1.0 */

var BrainCounters = {
  db: {
    "Anti-Mage": { counters: ["Bloodseeker","Legion Commander","Bane","Doom","Disruptor","Slardar"], goodAgainst: ["Medusa","Storm Spirit","Tinker","Zeus","Morphling"], tips: "AM слаб против контроля и сайленса." },
    "Axe": { counters: ["Timbersaw","Bristleback","Tidehunter","Ursa","Lifestealer"], goodAgainst: ["Anti-Mage","Phantom Assassin","Juggernaut","Sniper"], tips: "Timber и Bristleback толстые." },
    "Bane": { counters: ["Lifestealer","Legion Commander","Slark","Riki"], goodAgainst: ["Phantom Assassin","Anti-Mage","Juggernaut"], tips: "Bane силён против одиночных керри." },
    "Bloodseeker": { counters: ["Anti-Mage","Storm Spirit","Queen of Pain"], goodAgainst: ["Anti-Mage","Storm Spirit","Morphling"], tips: "Rupture на мобильных = смерть." },
    "Bristleback": { counters: ["Silver Edge","Doom","Bane","Legion Commander"], goodAgainst: ["Anti-Mage","Sniper","Juggernaut"], tips: "Silver Edge отключает пассивку." },
    "Crystal Maiden": { counters: ["Riki","Storm Spirit","Slark","Clockwerk","Spirit Breaker"], goodAgainst: ["Naga Siren","Phantom Lancer"], tips: "CM медленная и хрупкая." },
    "Doom": { counters: ["Oracle","Abaddon","Legion Commander"], goodAgainst: ["Anti-Mage","Storm Spirit","Phantom Assassin","Tinker"], tips: "Doom на ключевого = выключен на 16 сек." },
    "Drow Ranger": { counters: ["Slark","Storm Spirit","Clockwerk","Axe"], goodAgainst: ["Sniper","Crystal Maiden"], tips: "Drow без дистанции — мёртвый Drow." },
    "Faceless Void": { counters: ["Doom","Legion Commander","Bane","Bloodseeker"], goodAgainst: ["Sniper","Drow Ranger","Tinker"], tips: "Doom/Legion выключают Void." },
    "Invoker": { counters: ["Anti-Mage","Storm Spirit","Silencer","Bloodseeker"], goodAgainst: ["Sven","Wraith King"], tips: "Silencer снимает прокасты." },
    "Juggernaut": { counters: ["Legion Commander","Bane","Doom","Axe"], goodAgainst: ["Sniper","Crystal Maiden","Lina"], tips: "LC/Bane/Doom выключают Omnislash." },
    "Legion Commander": { counters: ["Bane","Doom","Oracle","Axe"], goodAgainst: ["Anti-Mage","Phantom Assassin"], tips: "Bane ломает Duel." },
    "Lina": { counters: ["Anti-Mage","Storm Spirit","Silencer","Clockwerk"], goodAgainst: ["Sven","Wraith King"], tips: "Lina хрупкая." },
    "Lion": { counters: ["Anti-Mage","Storm Spirit","Silencer"], goodAgainst: ["Sven","Wraith King","Anti-Mage"], tips: "Lion может убить AM через Hex + Finger." },
    "Medusa": { counters: ["Anti-Mage","Diffusal Blade","Invoker","Silencer"], goodAgainst: ["Sniper","Drow Ranger"], tips: "AM сжигает ману — нет щита." },
    "Meepo": { counters: ["Earthshaker","Elder Titan","Sand King","Leshrac"], goodAgainst: ["Anti-Mage","Sniper"], tips: "AoE убивает всех Meepo разом." },
    "Morphling": { counters: ["Ancient Apparition","Doom","Anti-Mage"], goodAgainst: ["Sniper","Drow Ranger"], tips: "AA снимает Attribute Shift." },
    "Naga Siren": { counters: ["Earthshaker","Sand King","Leshrac"], goodAgainst: ["Sniper","Drow Ranger"], tips: "AoE убивает иллюзии." },
    "Nyx Assassin": { counters: ["Slardar","Bounty Hunter","Zeus"], goodAgainst: ["Zeus","Storm Spirit","Tinker"], tips: "Slardar/Zeus раскрывают Nyx." },
    "Phantom Assassin": { counters: ["Axe","Legion Commander","Bane","Doom","Monkey King Bar"], goodAgainst: ["Sniper","Crystal Maiden","Lina"], tips: "MKB отключает Blur. Axe Call + Blade Mail = смерть." },
    "Phantom Lancer": { counters: ["Earthshaker","Sand King","Leshrac","Sven"], goodAgainst: ["Sniper","Drow Ranger"], tips: "AoE убивает иллюзии." },
    "Pudge": { counters: ["Anti-Mage","Oracle","Legion Commander","Bloodseeker"], goodAgainst: ["Sniper","Crystal Maiden","Lina"], tips: "AM сжигает ману. Oracle снимает Dismember." },
    "Queen of Pain": { counters: ["Anti-Mage","Silencer","Storm Spirit"], goodAgainst: ["Sven","Wraith King"], tips: "QoP хрупкая." },
    "Riki": { counters: ["Slardar","Bounty Hunter","Zeus"], goodAgainst: ["Sniper","Crystal Maiden"], tips: "Slardar/Zeus раскрывают невидимость." },
    "Shadow Fiend": { counters: ["Anti-Mage","Storm Spirit","Bloodseeker"], goodAgainst: ["Sven","Wraith King"], tips: "SF без BKB умирает мгновенно." },
    "Slark": { counters: ["Bloodseeker","Ancient Apparition","Legion Commander","Doom"], goodAgainst: ["Sniper","Drow Ranger"], tips: "AA + Rupture = Slark труп." },
    "Sniper": { counters: ["Slark","Storm Spirit","Clockwerk","Axe","Spirit Breaker"], goodAgainst: ["Crystal Maiden","Lina"], tips: "Sniper без дистанции — труп." },
    "Storm Spirit": { counters: ["Anti-Mage","Silencer","Bloodseeker","Doom"], goodAgainst: ["Sven","Wraith King","Sniper"], tips: "AM сжигает ману." },
    "Sven": { counters: ["Bane","Legion Commander","Doom","Oracle"], goodAgainst: ["Sniper","Crystal Maiden"], tips: "Bane/LC/Doom выключают Sven." },
    "Tinker": { counters: ["Anti-Mage","Clockwerk","Storm Spirit","Nyx Assassin"], goodAgainst: ["Sven","Wraith King"], tips: "AM сжигает ману." },
    "Troll Warlord": { counters: ["Axe","Bane","Legion Commander","Doom"], goodAgainst: ["Sven","Wraith King"], tips: "Axe Call + Blade Mail убивает Troll." },
    "Ursa": { counters: ["Bane","Doom","Legion Commander","Axe"], goodAgainst: ["Anti-Mage","Sniper"], tips: "Bane/LC/Doom выключают Ursa." },
    "Wraith King": { counters: ["Anti-Mage","Diffusal Blade","Invoker","Silencer"], goodAgainst: ["Sniper","Drow Ranger"], tips: "AM сжигает ману — нет реинкарнации." },
    "Zeus": { counters: ["Anti-Mage","Storm Spirit","Silencer","Nyx Assassin"], goodAgainst: ["Riki","Bounty Hunter"], tips: "Zeus хрупкий." }
  },

  getCountersFor: function (hn) {
    if (!hn) return null;
    if (this.db[hn]) return this.db[hn];
    if (typeof findHeroByAlias === "function") {
      var f = findHeroByAlias(hn);
      if (f && this.db[f]) return this.db[f];
    }
    return null;
  },

  whoCounters: function (hn) {
    var r = [];
    for (var a in this.db) if (this.db.hasOwnProperty(a)) {
      if (this.db[a].goodAgainst && this.db[a].goodAgainst.indexOf(hn) >= 0) r.push(a);
    }
    return r;
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("кто контрит") >= 0 || s.indexOf("чем контрить") >= 0 || s.indexOf("контра на") >= 0) return "counters";
    if (s.indexOf("кого брать против") >= 0 || s.indexOf("чем убить") >= 0) return "whoCounters";
    if (s.indexOf("контрпики на") >= 0) return "counters";
    return null;
  },

  answer: function (kind, q) {
    var hn = null;
    if (typeof findHeroByAlias === "function") {
      var w = q.toLowerCase().split(/[\s,?]+/);
      for (var i = 0; i < w.length; i++) {
        var c = w[i].replace(/[^а-яёa-z\-]/g, "");
        if (c.length < 3) continue;
        var h = findHeroByAlias(c);
        if (h) { hn = h; break; }
      }
    }
    if (!hn) return "🎯 Назови героя — например, «кто контрит пуджа».";
    if (kind === "counters") {
      var info = this.getCountersFor(hn);
      if (!info) return "🎯 Нет детальной базы на " + hn + ".";
      var l = ["🛡 **Контрпики на " + hn + ":**", ""];
      l.push("**Кто контрит:**");
      for (var i = 0; i < info.counters.length; i++) l.push("• " + info.counters[i]);
      l.push(""); l.push("**Хорош против:**");
      for (var j = 0; j < info.goodAgainst.length; j++) l.push("• " + info.goodAgainst[j]);
      l.push(""); l.push("💡 " + info.tips);
      return l.join("\n");
    }
    if (kind === "whoCounters") {
      var a = this.whoCounters(hn);
      if (!a.length) return "🎯 Нет обратной базы. Возьми Bane, Doom, Legion Commander.";
      var l2 = ["🎯 **Кто контрит " + hn + ":**", ""];
      for (var k = 0; k < a.length; k++) l2.push("• " + a[k]);
      l2.push(""); l2.push("💡 Предметы: BKB, Monkey King Bar, Silver Edge.");
      return l2.join("\n");
    }
    return null;
  }
};
