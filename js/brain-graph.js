/* DOTA JETCH — BRAIN GRAPH v1.0 */

var BrainGraph = {
  edges: [
    { a: "Pudge", b: "Anti-Mage", type: "counter" },
    { a: "Pudge", b: "Storm Spirit", type: "counter" },
    { a: "Axe", b: "Phantom Assassin", type: "counter" },
    { a: "Axe", b: "Juggernaut", type: "counter" },
    { a: "Storm Spirit", b: "Anti-Mage", type: "counter" },
    { a: "Bloodseeker", b: "Slark", type: "counter" },
    { a: "Ancient Apparition", b: "Morphling", type: "counter" },
    { a: "Nyx Assassin", b: "Invoker", type: "counter" },
    { a: "Magnus", b: "Shadow Fiend", type: "synergy" },
    { a: "Magnus", b: "Phantom Assassin", type: "synergy" },
    { a: "Magnus", b: "Juggernaut", type: "synergy" },
    { a: "Crystal Maiden", b: "Anti-Mage", type: "synergy" },
    { a: "Dazzle", b: "Medusa", type: "synergy" },
    { a: "Dark Seer", b: "Enigma", type: "synergy" },
    { a: "Anti-Mage", b: "Battle Fury", type: "item" },
    { a: "Anti-Mage", b: "Manta Style", type: "item" },
    { a: "Juggernaut", b: "Battle Fury", type: "item" },
    { a: "Phantom Assassin", b: "Battle Fury", type: "item" },
    { a: "Axe", b: "Blink Dagger", type: "item" },
    { a: "Magnus", b: "Blink Dagger", type: "item" },
    { a: "Tidehunter", b: "Blink Dagger", type: "item" },
    { a: "Storm Spirit", b: "Orchid Malevolence", type: "item" },
    { a: "Juggernaut", b: "Manta Style", type: "item" },
    { a: "Invoker", b: "Aghanim's Scepter", type: "item" },
    { a: "Black King Bar", b: "Tinker", type: "vs" },
    { a: "Black King Bar", b: "Zeus", type: "vs" },
    { a: "Black King Bar", b: "Storm Spirit", type: "vs" },
    { a: "Blade Mail", b: "Phantom Assassin", type: "vs" },
    { a: "Blade Mail", b: "Juggernaut", type: "vs" },
    { a: "Silver Edge", b: "Bristleback", type: "vs" },
    { a: "Diffusal Blade", b: "Medusa", type: "vs" },
    { a: "Diffusal Blade", b: "Anti-Mage", type: "vs" }
  ],
  neighbors: function (node, type) {
    var out = [];
    for (var i = 0; i < this.edges.length; i++) {
      var e = this.edges[i];
      if (type && e.type !== type) continue;
      if (e.a.toLowerCase() === node.toLowerCase()) out.push({ node: e.b, type: e.type });
      else if (e.b.toLowerCase() === node.toLowerCase()) out.push({ node: e.a, type: e.type });
    }
    return out;
  },
  infer: function (query) {
    var s = String(query || "").toLowerCase();
    var m1 = s.match(/как играть (?:на|на герое|за)\s+([a-zа-яё\- ]+)/i);
    if (m1) {
      var hero = m1[1].trim();
      var items = this.neighbors(hero, "item");
      var counters = this.neighbors(hero, "counter");
      var synergies = this.neighbors(hero, "synergy");
      var text = "🎭 Разбор " + hero + ":\n\n";
      if (items.length) text += "🛡 **Покупать:** " + items.map(function (x) { return x.node; }).join(", ") + "\n\n";
      if (synergies.length) text += "🤝 **Синергии:** " + synergies.map(function (x) { return x.node; }).join(", ") + "\n\n";
      if (counters.length) text += "⚠️ **Осторожно против:** " + counters.map(function (x) { return x.node; }).join(", ") + "\n\n";
      if (!items.length && !counters.length && !synergies.length) return null;
      text += "Общий совет: играй на сильных сторонах героя, но следи за контрпиками.";
      return text;
    }
    var m2 = s.match(/чем играть против\s+([a-zа-яё\- ]+)/i);
    if (m2) {
      var enemy = m2[1].trim();
      var vsItems = this.neighbors(enemy, "vs");
      var countersToEnemy = this.neighbors(enemy, "counter");
      var text2 = "⚔️ Против " + enemy + ":\n\n";
      if (vsItems.length) text2 += "🛡 **Предметы:** " + vsItems.map(function (x) { return x.node; }).join(", ") + "\n\n";
      if (countersToEnemy.length) text2 += "🎭 **Герои-контрпики:** " + countersToEnemy.map(function (x) { return x.node; }).join(", ") + "\n\n";
      if (!vsItems.length && !countersToEnemy.length) return null;
      return text2;
    }
    return null;
  }
};