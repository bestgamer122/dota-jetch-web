/* DOTA JETCH — BRAIN DRAFT v1.0 */

var BrainDraft = {
  roleMap: {
    "Anti-Mage":"carry","Axe":"offlane","Bane":"support","Bloodseeker":"carry","Crystal Maiden":"support",
    "Drow Ranger":"carry","Earthshaker":"support","Juggernaut":"carry","Mirana":"flex","Morphling":"carry",
    "Shadow Fiend":"mid","Phantom Lancer":"carry","Puck":"mid","Pudge":"roam","Razor":"mid",
    "Sand King":"offlane","Storm Spirit":"mid","Sven":"carry","Tiny":"flex","Vengeful Spirit":"support",
    "Windranger":"flex","Zeus":"mid","Kunkka":"mid","Lina":"mid","Lion":"support",
    "Shadow Shaman":"support","Slardar":"offlane","Tidehunter":"offlane","Witch Doctor":"support","Lich":"support",
    "Riki":"carry","Enigma":"offlane","Tinker":"mid","Sniper":"mid","Necrophos":"offlane",
    "Warlock":"support","Beastmaster":"offlane","Queen of Pain":"mid","Venomancer":"flex","Faceless Void":"carry",
    "Wraith King":"carry","Death Prophet":"offlane","Phantom Assassin":"carry","Pugna":"mid","Templar Assassin":"mid",
    "Viper":"mid","Luna":"carry","Dragon Knight":"mid","Dazzle":"support","Clockwerk":"offlane",
    "Leshrac":"mid","Nature's Prophet":"flex","Lifestealer":"carry","Dark Seer":"offlane","Clinkz":"carry",
    "Omniknight":"support","Enchantress":"flex","Huskar":"mid","Night Stalker":"offlane","Broodmother":"offlane",
    "Bounty Hunter":"roam","Weaver":"carry","Jakiro":"support","Batrider":"offlane","Chen":"support",
    "Spectre":"carry","Ancient Apparition":"support","Doom":"offlane","Ursa":"carry","Spirit Breaker":"roam",
    "Gyrocopter":"carry","Alchemist":"carry","Invoker":"mid","Silencer":"support","Outworld Destroyer":"mid",
    "Lycan":"carry","Brewmaster":"offlane","Shadow Demon":"support","Lone Druid":"carry","Chaos Knight":"carry",
    "Meepo":"mid","Treant Protector":"support","Ogre Magi":"support","Undying":"offlane","Rubick":"support",
    "Disruptor":"support","Nyx Assassin":"roam","Naga Siren":"carry","Keeper of the Light":"support","Io":"support",
    "Visage":"flex","Slark":"carry","Medusa":"carry","Troll Warlord":"carry","Centaur Warrunner":"offlane",
    "Magnus":"offlane","Timbersaw":"offlane","Bristleback":"offlane","Tusk":"roam","Skywrath Mage":"support",
    "Abaddon":"support","Elder Titan":"support","Legion Commander":"offlane","Techies":"support","Ember Spirit":"mid",
    "Earth Spirit":"roam","Underlord":"offlane","Terrorblade":"carry","Phoenix":"support","Oracle":"support",
    "Winter Wyvern":"support","Arc Warden":"carry","Monkey King":"carry","Dark Willow":"support","Pangolier":"flex",
    "Grimstroke":"support","Hoodwink":"support","Void Spirit":"mid","Snapfire":"support","Mars":"offlane",
    "Dawnbreaker":"offlane","Marci":"roam","Primal Beast":"offlane","Muerta":"flex","Ringmaster":"support",
    "Kez":"carry","Largo":"offlane"
  },

  counters: {
    "Anti-Mage":["Bloodseeker","Legion Commander","Disruptor"],
    "Axe":["Timbersaw","Bristleback","Tidehunter"],
    "Bloodseeker":["Anti-Mage","Storm Spirit","Queen of Pain"],
    "Bristleback":["Silver Edge","Doom","Bane"],
    "Crystal Maiden":["Riki","Storm Spirit","Slark"],
    "Drow Ranger":["Slark","Storm Spirit","Clockwerk","Axe"],
    "Faceless Void":["Doom","Legion Commander","Bane"],
    "Invoker":["Anti-Mage","Storm Spirit","Silencer"],
    "Juggernaut":["Legion Commander","Bane","Doom"],
    "Medusa":["Anti-Mage","Diffusal Blade"],
    "Meepo":["Earthshaker","Elder Titan"],
    "Morphling":["Ancient Apparition","Doom"],
    "Naga Siren":["Earthshaker","Sand King"],
    "Phantom Assassin":["Monkey King Bar","Silver Edge","Axe"],
    "Phantom Lancer":["Earthshaker","Sand King","Leshrac"],
    "Pudge":["Anti-Mage","Oracle","Legion Commander"],
    "Queen of Pain":["Anti-Mage","Silencer","Storm Spirit"],
    "Riki":["Slardar","Bounty Hunter","Zeus"],
    "Shadow Fiend":["Anti-Mage","Storm Spirit","Bloodseeker"],
    "Slark":["Bloodseeker","Ancient Apparition","Legion Commander"],
    "Sniper":["Slark","Storm Spirit","Clockwerk"],
    "Storm Spirit":["Anti-Mage","Silencer","Bloodseeker"],
    "Sven":["Bane","Legion Commander","Oracle"],
    "Tinker":["Anti-Mage","Clockwerk","Storm Spirit"],
    "Ursa":["Bane","Doom","Legion Commander"],
    "Wraith King":["Anti-Mage","Diffusal Blade","Invoker"]
  },

  synergies: {
    "Magnus":["Shadow Fiend","Phantom Assassin","Juggernaut"],
    "Dark Seer":["Enigma","Tidehunter","Warlock"],
    "Crystal Maiden":["Anti-Mage","Juggernaut","Terrorblade"],
    "Dazzle":["Medusa","Wraith King","Anti-Mage"],
    "Oracle":["Sven","Terrorblade","Wraith King"],
    "Io":["Tiny","Wisp","Wraith King"],
    "Undying":["Tidehunter","Warlock","Enigma"],
    "Ancient Apparition":["Spectre","Juggernaut","Void"]
  },

  _analyzeTeam: function (players, heroes) {
    var roles = { carry: [], mid: [], offlane: [], support: [], roam: [], flex: [] };
    for (var i = 0; i < players.length; i++) {
      var hid = players[i].hero_id, hero = null;
      for (var j = 0; j < heroes.length; j++) if (heroes[j].id === hid) { hero = heroes[j]; break; }
      if (!hero) continue;
      var r = this.roleMap[hero.name] || "flex";
      roles[r] = roles[r] || [];
      roles[r].push(hero.name);
    }
    return roles;
  },

  _analyzeComp: function (roles) {
    var w = [], s = [];
    if (!roles.carry.length) w.push("Нет чистого керри");
    if (roles.carry.length >= 2) s.push("Много керри (" + roles.carry.length + ")");
    if (!roles.support.length && !roles.roam.length) w.push("Нет саппортов");
    if (roles.support.length >= 2) s.push("Хорошая поддержка (" + roles.support.length + ")");
    if (roles.mid.length) s.push("Есть мид");
    if (!roles.offlane.length) w.push("Нет оффлейнера");
    if (roles.roam.length) s.push("Есть роум");
    return { warnings: w, strengths: s };
  },

  advice: function () {
    if (typeof lastAnalysis === "undefined" || !lastAnalysis) return null;
    var res = lastAnalysis;
    if (!res.match || !res.heroes) return null;
    var m = res.match, heroes = res.heroes, p = res.player;
    var isRad = p.player_slot < 128;
    var allies = [], enemies = [];
    for (var i = 0; i < m.players.length; i++) {
      var mp = m.players[i];
      var mpR = mp.player_slot < 128;
      var ho = null;
      for (var j = 0; j < heroes.length; j++) if (heroes[j].id === mp.hero_id) { ho = heroes[j]; break; }
      if (!ho) continue;
      if (mpR === isRad) allies.push({ p: mp, h: ho });
      else enemies.push({ p: mp, h: ho });
    }
    var my = this._analyzeTeam(allies.map(function (a) { return a.p; }), heroes);
    var en = this._analyzeTeam(enemies.map(function (a) { return a.p; }), heroes);
    var mc = this._analyzeComp(my), ec = this._analyzeComp(en);

    var ca = [];
    for (var k = 0; k < enemies.length; k++) {
      var eh = enemies[k].h.name;
      var c = this.counters[eh];
      if (c && c.length) ca.push({ against: eh, with: c.slice(0, 2) });
    }
    var sy = [];
    for (var s = 0; s < allies.length; s++) {
      var ah = allies[s].h.name;
      var syn = this.synergies[ah];
      if (syn && syn.length) sy.push({ with: ah, good: syn.slice(0, 2) });
    }

    var l = ["🎯 **Анализ драфта**", ""];
    l.push("**Моя команда:**");
    if (my.carry.length) l.push("• Керри: " + my.carry.join(", "));
    if (my.mid.length) l.push("• Мид: " + my.mid.join(", "));
    if (my.offlane.length) l.push("• Оффлейн: " + my.offlane.join(", "));
    if (my.roam.length) l.push("• Роум: " + my.roam.join(", "));
    if (my.support.length) l.push("• Саппорт: " + my.support.join(", "));
    if (mc.warnings.length) { l.push(""); l.push("⚠️ Слабые места:"); for (var w = 0; w < mc.warnings.length; w++) l.push("• " + mc.warnings[w]); }
    if (mc.strengths.length) { l.push(""); l.push("✅ Сильные стороны:"); for (var st = 0; st < mc.strengths.length; st++) l.push("• " + mc.strengths[st]); }
    l.push(""); l.push("**Вражеская команда:**");
    if (en.carry.length) l.push("• Керри: " + en.carry.join(", "));
    if (en.mid.length) l.push("• Мид: " + en.mid.join(", "));
    if (en.offlane.length) l.push("• Оффлейн: " + en.offlane.join(", "));
    if (en.support.length) l.push("• Саппорт: " + en.support.join(", "));
    if (ca.length) { l.push(""); l.push("🛡 Контрпики на врагов:"); for (var c2 = 0; c2 < Math.min(ca.length, 4); c2++) l.push("• Против " + ca[c2].against + ": " + ca[c2].with.join(", ")); }
    if (sy.length) { l.push(""); l.push("🤝 Синергии с союзниками:"); for (var s2 = 0; s2 < Math.min(sy.length, 3); s2++) l.push("• С " + sy[s2].with + ": " + sy[s2].good.join(", ")); }
    return l.join("\n");
  },

  suggestPick: function (enemyHeroes) {
    if (!enemyHeroes || !enemyHeroes.length) return null;
    var c = {};
    for (var i = 0; i < enemyHeroes.length; i++) {
      var co = this.counters[enemyHeroes[i]];
      if (!co) continue;
      for (var j = 0; j < co.length; j++) c[co[j]] = (c[co[j]] || 0) + 1;
    }
    var list = [];
    for (var n in c) if (c.hasOwnProperty(n)) list.push({ hero: n, score: c[n] });
    list.sort(function (a, b) { return b.score - a.score; });
    return list.length ? list.slice(0, 5) : null;
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("разбери драфт") >= 0 || s.indexOf("анализ драфта") >= 0) return "analyze";
    if (s.indexOf("кого пикать") >= 0 || s.indexOf("кого брать") >= 0) return "suggest";
    if (s.indexOf("контрпики на команду") >= 0) return "analyze";
    if (s.indexOf("синергии") >= 0) return "analyze";
    return null;
  },

  answer: function (kind, extra) {
    if (kind === "analyze") {
      var a = this.advice();
      if (!a) return "🤔 Нет данных последнего матча.";
      return a;
    }
    if (kind === "suggest") {
      if (!extra || !extra.length) return "🎯 Назови героев врагов — я предложу пики.";
      var s = this.suggestPick(extra);
      if (!s) return "🤔 Не нашёл хороших контрпиков.";
      var l = ["🎯 **Лучшие пики против " + extra.join(", ") + ":**", ""];
      for (var i = 0; i < s.length; i++) l.push((i + 1) + ". **" + s[i].hero + "**");
      return l.join("\n");
    }
    return null;
  }
};
