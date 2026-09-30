/* DOTA JETCH — BRAIN BUILDS v1.0 */

var BrainBuilds = {
  standardBuilds: {
    carry: { name: "Керри (Pos 1)", early: ["Wraith Band","Power Treads","Magic Wand"], core: ["Battle Fury","Manta Style","Black King Bar","Butterfly","Satanic"],
      situational: { "против магов":["Black King Bar","Mage Slayer"], "против физики":["Butterfly","Heaven's Halberd"], "против иллюзий":["Mjollnir","Battle Fury"], "против бурста":["Satanic","Eye of Skadi"], "против уклонения":["Monkey King Bar"] } },
    mid: { name: "Мид (Pos 2)", early: ["Null Talisman","Bottle","Magic Wand"], core: ["Bottle","Power Treads","Black King Bar","Aghanim's Scepter","Shiva's Guard"],
      situational: { "против магов":["Black King Bar","Linken's Sphere"], "против физики":["Shiva's Guard","Ghost Scepter"], "против контроля":["Linken's Sphere","Aeon Disk"], "для сноуболла":["Orchid Malevolence","Bloodthorn"], "против хила":["Spirit Vessel"] } },
    offlane: { name: "Оффлейн (Pos 3)", early: ["Bracer","Boots of Speed","Magic Wand"], core: ["Vanguard","Blink Dagger","Black King Bar","Pipe of Insight","Crimson Guard"],
      situational: { "против магов":["Pipe of Insight","Hood of Defiance"], "против физики":["Crimson Guard","Blade Mail"], "для инициации":["Blink Dagger","Aghanim's Scepter"], "против мобильности":["Rod of Atos","Scythe of Vyse"], "против иллюзий":["Mjollnir","Radiance"] } },
    roam: { name: "Роум (Pos 4)", early: ["Boots of Speed","Magic Wand","Wind Lace"], core: ["Blink Dagger","Aghanim's Scepter","Black King Bar","Aether Lens","Force Staff"],
      situational: { "для спасения":["Glimmer Cape","Force Staff"], "для контроля":["Scythe of Vyse","Rod of Atos"], "против магов":["Black King Bar","Aeon Disk"], "против невидимок":["Dust of Appearance","Sentinel Ward"], "для вижена":["Observer Ward","Sentinel Ward"] } },
    support: { name: "Саппорт (Pos 5)", early: ["Boots of Speed","Magic Wand","Wind Lace"], core: ["Glimmer Cape","Force Staff","Aghanim's Scepter","Guardian Greaves","Aether Lens"],
      situational: { "для спасения":["Glimmer Cape","Force Staff","Ghost Scepter"], "для хила":["Mekansm","Guardian Greaves","Holy Locket"], "против магов":["Pipe of Insight","Glimmer Cape"], "для контроля":["Scythe of Vyse","Rod of Atos"], "для вижена":["Observer Ward","Sentinel Ward","Dust"] } }
  },

  getRoleFromHero: function (heroName) {
    if (!heroName) return "carry";
    var hl = heroName.toLowerCase();
    if (typeof BrainDraft !== "undefined" && BrainDraft.roleMap) {
      var r = BrainDraft.roleMap[heroName];
      if (r === "flex") return "mid";
      if (r) return r;
    }
    if (hl.indexOf("crystal") >= 0 || hl.indexOf("witch") >= 0 || hl.indexOf("lich") >= 0 || hl.indexOf("lion") >= 0) return "support";
    if (hl.indexOf("pudge") >= 0 || hl.indexOf("bounty") >= 0 || hl.indexOf("spirit breaker") >= 0) return "roam";
    return "carry";
  },

  analyzeThreats: function (enemyHeroes) {
    var t = [];
    if (!enemyHeroes || !enemyHeroes.length) return t;
    var mg = ["Zeus","Storm Spirit","Lina","Lion","Invoker","Tinker","Outworld Destroyer","Leshrac","Queen of Pain","Puck","Void Spirit","Muerta"];
    var ph = ["Phantom Assassin","Juggernaut","Troll Warlord","Ursa","Drow Ranger","Sniper","Clinkz","Weaver","Terrorblade","Luna"];
    var il = ["Phantom Lancer","Naga Siren","Meepo","Terrorblade","Arc Warden","Chaos Knight"];
    var ev = ["Phantom Assassin","Windranger","Faceless Void"];
    var ct = ["Lion","Shadow Shaman","Bane","Pudge","Axe","Legion Commander","Doom"];
    var hl = ["Dazzle","Oracle","Omniknight","Warlock","Treant Protector","Io"];
    var iv = ["Riki","Bounty Hunter","Clinkz","Slark","Nyx Assassin","Weaver","Templar Assassin"];
    for (var i = 0; i < enemyHeroes.length; i++) {
      var h = enemyHeroes[i];
      if (mg.indexOf(h) >= 0) t.push({ type: "magic", hero: h });
      if (ph.indexOf(h) >= 0) t.push({ type: "physical", hero: h });
      if (il.indexOf(h) >= 0) t.push({ type: "illusion", hero: h });
      if (ev.indexOf(h) >= 0) t.push({ type: "evasion", hero: h });
      if (ct.indexOf(h) >= 0) t.push({ type: "control", hero: h });
      if (hl.indexOf(h) >= 0) t.push({ type: "heal", hero: h });
      if (iv.indexOf(h) >= 0) t.push({ type: "invisible", hero: h });
    }
    var u = {}, r = [];
    for (var j = 0; j < t.length; j++) if (!u[t[j].type]) { u[t[j].type] = true; r.push(t[j]); }
    return r;
  },

  recommend: function (heroName, position, enemyHeroes) {
    var role = position ? this._positionToRole(position) : this.getRoleFromHero(heroName);
    var b = this.standardBuilds[role] || this.standardBuilds.carry;
    var th = this.analyzeThreats(enemyHeroes || []);
    var l = ["🎒 **Сборка на " + (heroName || "героя") + "**", "Позиция: " + b.name, ""];
    l.push("**Ранняя игра:**");
    for (var i = 0; i < b.early.length; i++) l.push("• " + b.early[i]);
    l.push("");
    l.push("**Core:**");
    for (var j = 0; j < b.core.length; j++) l.push("• " + b.core[j]);
    l.push("");
    if (th.length) {
      l.push("**Ситуативные:**");
      for (var k = 0; k < th.length; k++) {
        var tk = null;
        if (th[k].type === "magic") tk = "против магов";
        else if (th[k].type === "physical") tk = "против физики";
        else if (th[k].type === "illusion") tk = "против иллюзий";
        else if (th[k].type === "evasion") tk = "против уклонения";
        else if (th[k].type === "control") tk = "против контроля";
        else if (th[k].type === "heal") tk = "против хила";
        else if (th[k].type === "invisible") tk = "против невидимок";
        if (tk && b.situational[tk]) l.push("• Против **" + th[k].hero + "**: " + b.situational[tk].join(", "));
      }
      l.push("");
    }
    l.push("💡 Сначала возьми " + b.core[0] + ", потом смотри по ситуации.");
    return l.join("\n");
  },

  _positionToRole: function (p) { return { 1: "carry", 2: "mid", 3: "offlane", 4: "roam", 5: "support" }[p] || "carry"; },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("сборка на") >= 0 || s.indexOf("билд на") >= 0 || s.indexOf("что собрать на") >= 0) return "build";
    if (s.indexOf("рекомендации по сборке") >= 0) return "build";
    if (s.indexOf("какие предметы") >= 0 && s.indexOf("враг") >= 0) return "build";
    return null;
  },

  answer: function (kind, heroName, position, enemies) {
    if (kind === "build") {
      if (!heroName) return "🎒 Назови героя — например, «сборка на пуджа».";
      return this.recommend(heroName, position, enemies);
    }
    return null;
  }
};
