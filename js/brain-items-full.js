/* DOTA JETCH — BRAIN ITEMS FULL v1.0 */

var BrainItemsFull = {
  items: {
    "Tango": { cost: 90, category: "consumable", desc: "Восстанавливает HP на линии." },
    "Healing Salve": { cost: 110, category: "consumable", desc: "400 HP за 8 сек." },
    "Clarity": { cost: 50, category: "consumable", desc: "Восстанавливает ману." },
    "Faerie Fire": { cost: 70, category: "consumable", desc: "+2 урона, 85 HP при активации." },
    "Iron Branch": { cost: 50, category: "attribute", desc: "+1 ко всем атрибутам." },
    "Circlet": { cost: 155, category: "attribute", desc: "+2 ко всем атрибутам." },
    "Gauntlets of Strength": { cost: 140, category: "attribute", desc: "+3 силы." },
    "Slippers of Agility": { cost: 140, category: "attribute", desc: "+3 ловкости." },
    "Mantle of Intelligence": { cost: 140, category: "attribute", desc: "+3 интеллекта." },
    "Boots of Speed": { cost: 500, category: "boots", desc: "+45 MS." },
    "Power Treads": { cost: 1400, category: "boots", desc: "+45 MS, +25 атакспида, переключение атрибутов.", recipe: ["Boots of Speed","Gloves of Haste","Belt of Strength"] },
    "Phase Boots": { cost: 1500, category: "boots", desc: "+50 MS, +18 урона.", recipe: ["Boots of Speed","Blades of Attack","Chainmail"] },
    "Arcane Boots": { cost: 1300, category: "boots", desc: "+45 MS. Актив: мана союзникам.", recipe: ["Boots of Speed","Energy Booster"] },
    "Tranquil Boots": { cost: 925, category: "boots", desc: "+70 MS, +14 HP реген вне боя.", recipe: ["Boots of Speed","Ring of Regen","Wind Lace"] },
    "Boots of Travel": { cost: 2500, category: "boots", desc: "+90 MS. Актив: телепорт к крипам.", recipe: ["Boots of Speed","Recipe"] },
    "Guardian Greaves": { cost: 4950, category: "boots", desc: "+55 MS, +15 брони. Масс-хил + диспел.", recipe: ["Arcane Boots","Mekansm","Recipe"] },
    "Magic Wand": { cost: 450, category: "utility", desc: "Заряды от кастов. Восстанавливает HP+ману.", recipe: ["Magic Stick","Iron Branch","Iron Branch","Recipe"] },
    "Bottle": { cost: 675, category: "utility", desc: "Хранит руны. Хил+мана." },
    "Soul Ring": { cost: 855, category: "utility", desc: "150 HP → 170 маны.", recipe: ["Ring of Regen","Sage's Mask","Recipe"] },
    "Urn of Shadows": { cost: 880, category: "utility", desc: "Заряды за убийства. Урон/хил.", recipe: ["Infused Raindrops","Sage's Mask","Ring of Protection"] },
    "Blink Dagger": { cost: 2250, category: "mobility", desc: "Актив: телепорт до 1200." },
    "Force Staff": { cost: 2200, category: "mobility", desc: "Актив: толкает цель на 600.", recipe: ["Staff of Wizardry","Ring of Regen","Recipe"] },
    "Aether Lens": { cost: 2275, category: "utility", desc: "+250 дальность каста.", recipe: ["Energy Booster","Ring of Regen","Recipe"] },
    "Vanguard": { cost: 1700, category: "defense", desc: "Блокирует 64 физ-урона.", recipe: ["Stout Shield","Ring of Health","Vitality Booster"] },
    "Crimson Guard": { cost: 3725, category: "defense", desc: "Командный блок урона.", recipe: ["Vanguard","Recipe"] },
    "Hood of Defiance": { cost: 1725, category: "defense", desc: "+8 магрезиста.", recipe: ["Cloak","Ring of Regen","Ring of Health"] },
    "Pipe of Insight": { cost: 3725, category: "defense", desc: "Командный магрезист (барьер).", recipe: ["Hood of Defiance","Headdress","Recipe"] },
    "Blade Mail": { cost: 2100, category: "defense", desc: "Возвращает 100% урона.", recipe: ["Broadsword","Chainmail","Recipe"] },
    "Black King Bar": { cost: 4050, category: "defense", desc: "Актив: иммунитет к магии (9→5 сек).", recipe: ["Ogre Axe","Staff of Wizardry","Recipe"] },
    "Linken's Sphere": { cost: 4800, category: "defense", desc: "Блокирует точечные раз в 14 сек.", recipe: ["Ultimate Orb","Perseverance","Recipe"] },
    "Aeon Disk": { cost: 3000, category: "defense", desc: "Барьер при HP<70%.", recipe: ["Vitality Booster","Energy Booster","Recipe"] },
    "Lotus Orb": { cost: 3850, category: "defense", desc: "Отражает точечные на врага.", recipe: ["Perseverance","Platemail","Recipe"] },
    "Heart of Tarrasque": { cost: 5000, category: "defense", desc: "+45 силы, +250 HP, реген.", recipe: ["Reaver","Vitality Booster","Recipe"] },
    "Shiva's Guard": { cost: 4850, category: "defense", desc: "Аура: замедление + броня. Arctic Blast.", recipe: ["Platemail","Mystic Staff","Recipe"] },
    "Battle Fury": { cost: 4100, category: "damage", desc: "Клир волн AoE. Фарм.", recipe: ["Broadsword","Claymore","Perseverance"] },
    "Maelstrom": { cost: 2950, category: "damage", desc: "25% шанс цепной молнии.", recipe: ["Mithril Hammer","Javelin","Recipe"] },
    "Mjollnir": { cost: 5500, category: "damage", desc: "Maelstrom + щит.", recipe: ["Maelstrom","Hyperstone","Recipe"] },
    "Desolator": { cost: 3500, category: "damage", desc: "Снижает броню на 6.", recipe: ["Mithril Hammer","Mithril Hammer"] },
    "Daedalus": { cost: 5100, category: "damage", desc: "30% крит 225%.", recipe: ["Crystalys","Demon Edge","Recipe"] },
    "Monkey King Bar": { cost: 5000, category: "damage", desc: "Игнорирует уклонение.", recipe: ["Hyperstone","Demon Edge","Recipe"] },
    "Butterfly": { cost: 4975, category: "damage", desc: "+35% уклон, +35 атакспид, +30 лов.", recipe: ["Quarterstaff","Talisman of Evasion","Eaglesong"] },
    "Radiance": { cost: 4700, category: "damage", desc: "Аура: 60 урона/сек. Уворот.", recipe: ["Sacred Relic","Recipe"] },
    "Satanic": { cost: 5050, category: "damage", desc: "+175% лайфстила.", recipe: ["Reaver","Claymore","Recipe"] },
    "Silver Edge": { cost: 5700, category: "damage", desc: "Break — отключает пассивки.", recipe: ["Shadow Blade","Echo Sabre","Recipe"] },
    "Diffusal Blade": { cost: 2500, category: "damage", desc: "Сжигает ману с атак.", recipe: ["Blade of Alacrity","Robe of the Magi","Recipe"] },
    "Eye of Skadi": { cost: 5300, category: "damage", desc: "Замедляет цель. +HP +мана.", recipe: ["Ultimate Orb","Orb of Venom","Recipe"] },
    "Abyssal Blade": { cost: 6400, category: "damage", desc: "Стан сквозь BKB.", recipe: ["Skull Basher","Vanguard","Recipe"] },
    "Scythe of Vyse": { cost: 5675, category: "disable", desc: "Хекс на 3.5 сек.", recipe: ["Mystic Staff","Ultimate Orb","Recipe"] },
    "Orchid Malevolence": { cost: 3475, category: "disable", desc: "Сайленс 5 сек.", recipe: ["Blitz Knuckles","Oblivion Staff","Recipe"] },
    "Bloodthorn": { cost: 6800, category: "disable", desc: "Сайленс + криты.", recipe: ["Orchid Malevolence","Crystalys","Recipe"] },
    "Rod of Atos": { cost: 2750, category: "disable", desc: "Рут на 2 сек.", recipe: ["Staff of Wizardry","Vitality Booster","Recipe"] },
    "Gleipnir": { cost: 4550, category: "disable", desc: "Рут + цепная молния.", recipe: ["Maelstrom","Rod of Atos","Recipe"] },
    "Nullifier": { cost: 4725, category: "disable", desc: "Снимает положительные эффекты.", recipe: ["Helm of the Dominator","Recipe"] },
    "Mekansm": { cost: 1775, category: "aura", desc: "Масс-хил 275 HP.", recipe: ["Headdress","Buckler","Recipe"] },
    "Vladmir's Offering": { cost: 2450, category: "aura", desc: "Лайфстил 20% + урон + броня.", recipe: ["Ring of Basilius","Headdress","Recipe"] },
    "Assault Cuirass": { cost: 5125, category: "aura", desc: "+10 брони + атакспид.", recipe: ["Platemail","Hyperstone","Recipe"] },
    "Solar Crest": { cost: 2625, category: "aura", desc: "+броня +уклонение союзнику.", recipe: ["Medallion of Courage","Crown","Recipe"] },
    "Sange and Yasha": { cost: 4100, category: "utility", desc: "+HP, +атакспид, +скорость.", recipe: ["Sange","Yasha"] },
    "Heaven's Halberd": { cost: 3600, category: "utility", desc: "Обезоруживает на 3 сек.", recipe: ["Sange","Talisman of Evasion","Recipe"] },
    "Refresher Orb": { cost: 5000, category: "utility", desc: "Сбрасывает кулдауны.", recipe: ["Perseverance","Recipe"] },
    "Octarine Core": { cost: 4950, category: "utility", desc: "-25% кулдаунов. Лайфстил от маг-урона.", recipe: ["Soul Booster","Mystic Staff","Recipe"] },
    "Bloodstone": { cost: 4400, category: "utility", desc: "+мана, реген, при смерти лечит.", recipe: ["Soul Booster","Recipe"] },
    "Hand of Midas": { cost: 2200, category: "utility", desc: "Крипа → золото и опыт.", recipe: ["Gloves of Haste","Recipe"] },
    "Mask of Madness": { cost: 1875, category: "utility", desc: "+атакспид, лайфстил, но +30% урона.", recipe: ["Morbid Mask","Recipe"] },
    "Echo Sabre": { cost: 2700, category: "utility", desc: "Двойной удар после атаки.", recipe: ["Ogre Axe","Blitz Knuckles"] },
    "Armlet of Mordiggian": { cost: 2500, category: "utility", desc: "Актив: +HP, но -HP в сек.", recipe: ["Helm of Iron Will","Gloves of Haste","Recipe"] },
    "Eul's Scepter of Divinity": { cost: 2625, category: "utility", desc: "Подбрасывает в воздух.", recipe: ["Staff of Wizardry","Wind Lace","Recipe"] },
    "Wind Waker": { cost: 6825, category: "utility", desc: "Улучшенный Eul's.", recipe: ["Eul's Scepter","Wind Lace","Recipe"] },
    "Ghost Scepter": { cost: 1500, category: "utility", desc: "Актив: неуязвимость к физ-урону 4 сек." },
    "Ethereal Blade": { cost: 4650, category: "utility", desc: "Цель в эфир + маг-урон.", recipe: ["Ghost Scepter","Eaglesong","Recipe"] },
    "Glimmer Cape": { cost: 1950, category: "utility", desc: "Невидимость + магрезист 5 сек.", recipe: ["Cloak","Shadow Amulet"] },
    "Dagon": { cost: 2750, category: "utility", desc: "Маг-урон по цели. Апгрейдится 5 раз.", recipe: ["Null Talisman","Staff of Wizardry","Recipe"] },
    "Veil of Discord": { cost: 1725, category: "utility", desc: "AoE снижение магрезиста.", recipe: ["Helm of Iron Will","Recipe"] },
    "Spirit Vessel": { cost: 2875, category: "utility", desc: "Снижает хил врагу, добавляет урон.", recipe: ["Urn of Shadows","Recipe"] },
    "Helm of the Dominator": { cost: 2575, category: "utility", desc: "Контролирует нейтрального крипа.", recipe: ["Helm of Iron Will","Recipe"] },
    "Aghanim's Scepter": { cost: 4200, category: "aghs", desc: "Улучшает ульту.", recipe: ["Ogre Axe","Blade of Alacrity","Staff of Wizardry"] },
    "Aghanim's Shard": { cost: 1400, category: "aghs", desc: "Улучшает одну способность." },
    "Rattlecage": { cost: 0, category: "neutral", desc: "Нейтральный тир 4. AoE урон + пихание." },
    "Witless Shako": { cost: 0, category: "neutral", desc: "Нейтральный тир 4. +HP, но -мана." }
  },

  find: function (n) {
    if (!n) return null;
    if (this.items[n]) return { name: n, info: this.items[n] };
    var nl = String(n).toLowerCase();
    for (var k in this.items) if (this.items.hasOwnProperty(k) && k.toLowerCase() === nl) return { name: k, info: this.items[k] };
    for (var k2 in this.items) if (this.items.hasOwnProperty(k2) && k2.toLowerCase().indexOf(nl) >= 0) return { name: k2, info: this.items[k2] };
    return null;
  },

  format: function (name, info) {
    var cats = { consumable: "Расходник", attribute: "Атрибут", boots: "Обувь", utility: "Утилита", mobility: "Мобильность", defense: "Защита", damage: "Урон", disable: "Контроль", aura: "Аура", aghs: "Улучшение", neutral: "Нейтральный" };
    var l = ["🎒 **" + name + "**", ""];
    if (info.cost) l.push("**Стоимость:** " + info.cost + " золота");
    else l.push("**Стоимость:** нейтральный (падает с крипов)");
    if (info.category) l.push("**Категория:** " + (cats[info.category] || info.category));
    l.push("");
    if (info.desc) l.push("**Описание:** " + info.desc);
    if (info.recipe && info.recipe.length) {
      l.push(""); l.push("**Рецепт:**");
      for (var i = 0; i < info.recipe.length; i++) l.push("• " + info.recipe[i]);
    }
    return l.join("\n");
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("что такое") >= 0 && this._extract(s)) return "info";
    if (s.indexOf("расскажи про") >= 0 && this._extract(s)) return "info";
    if (s.indexOf("рецепт") >= 0) return "recipe";
    return null;
  },

  _extract: function (q) {
    for (var k in this.items) if (this.items.hasOwnProperty(k) && q.indexOf(k.toLowerCase()) >= 0) return k;
    if (typeof BrainRus !== "undefined") {
      var w = q.split(/[\s,?]+/);
      for (var i = 0; i < w.length; i++) {
        var c = w[i].replace(/[^а-яёa-z\-]/g, "");
        if (BrainRus.slangToName[c] && this.items[BrainRus.slangToName[c]]) return BrainRus.slangToName[c];
      }
    }
    return null;
  },

  answer: function (k, q) {
    var n = this._extract(q);
    if (!n) {
      var w = q.split(/[\s,?]+/);
      for (var i = 0; i < w.length; i++) {
        var c = w[i].replace(/[^а-яёa-z\-]/g, "");
        if (c.length < 3) continue;
        var f = this.find(c);
        if (f) { n = f.name; break; }
      }
    }
    if (!n) return null;
    return this.format(n, this.items[n]);
  }
};
