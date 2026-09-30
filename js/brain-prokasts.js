/* DOTA JETCH — BRAIN PROKASTS v1.0 */

var BrainProkasts = {
  db: {
    "Invoker": { basic: ["Cold Snap → Forge Spirit → Alacrity"], advanced: ["Tornado → EMP → Meteor → Deafening Blast","Ghost Walk → Tornado → EMP → Meteor → Sunstrike"], note: "Изучи панель QWE." },
    "Pudge": { basic: ["Meat Hook → Rot → Dismember"], advanced: ["Blink → Hook → Rot → Dismember","Hook → Blink → Dismember"], note: "Blink обязателен." },
    "Axe": { basic: ["Blink → Berserker's Call → Blade Mail → Counter Helix"], advanced: ["Blink → Call → Blade Mail → Culling Blade"], note: "Ловь 2+." },
    "Tidehunter": { basic: ["Blink → Ravage"], advanced: ["Blink → Ravage → Anchor Smash","Blink → Refresher → Ravage → Ravage"], note: "Ловь 3+." },
    "Enigma": { basic: ["Blink → Black Hole"], advanced: ["Blink → BH → Midnight Pulse → Malefice","Blink → BH → Refresher → Midnight Pulse → BH"], note: "BKB обязателен." },
    "Magnus": { basic: ["Blink → Reverse Polarity → Skewer"], advanced: ["Blink → RP → Skewer → Empower carry"], note: "Не RP своих." },
    "Faceless Void": { basic: ["Time Walk → Chronosphere"], advanced: ["Time Walk → MoM → Chrono → burst","Chrono → right click → Time Walk out"], note: "Не лови союзников." },
    "Juggernaut": { basic: ["Blade Fury → Omnislash"], advanced: ["Blink → Blade Fury → Omnislash → Healing Ward"], note: "Не Omni против Manta." },
    "Lion": { basic: ["Earth Spike → Hex → Finger of Death"], advanced: ["Blink → Hex → Earth Spike → Finger"], note: "Hex первым." },
    "Shadow Fiend": { basic: ["Necromastery → Requiem"], advanced: ["Blink → Requiem → BKB → right click","Eul's → Requiem → Blink → Requiem"], note: "Собирай души." },
    "Storm Spirit": { basic: ["Ball Lightning → Static Remnant → Overload"], advanced: ["Ball → Orchid → Remnant → Overload","Ball → Hex → Remnant → kill"], note: "Следи за маной." },
    "Lina": { basic: ["Light Strike Array → Dragon Slave → Laguna Blade"], advanced: ["Blink → LSA → Dragon Slave → Laguna","Eul's → LSA → Dragon Slave → Laguna"], note: "LSA требует предикции." },
    "Slark": { basic: ["Pounce → Dark Pact → Essence Shift"], advanced: ["Pounce → Shadow Dance → Dark Pact → kill","Blink → Pounce → SD → kill"], note: "Shadow Dance — эскейп." },
    "Tinker": { basic: ["Blink → Laser → Heat-Seeking Missile → Rearm"], advanced: ["Blink → March → Laser → Missile → Rearm","Blink → Hex → Laser → Rearm"], note: "Rearm ресетит кулдауны." },
    "Earthshaker": { basic: ["Blink → Fissure → Enchant Totem → Echo Slam"], advanced: ["Blink → Echo Slam → Fissure → Enchant Totem"], note: "Ловь толпу." },
    "Sand King": { basic: ["Blink → Burrowstrike → Sand Storm → Epicenter"], advanced: ["Epicenter (канал) → Blink → Burrowstrike"], note: "Epicenter до входа." },
    "Puck": { basic: ["Blink → Dream Coil → Waning Rift → Illusory Orb"], advanced: ["Blink → Coil → Rift → Orb → Phase Shift"], note: "Phase Shift — эскейп." },
    "Ember Spirit": { basic: ["Sleight of Fist → Searing Chains → Flame Guard"], advanced: ["Sleight → Chains → Flame Guard → Remnant"], note: "Remnant — эскейп." },
    "Void Spirit": { basic: ["Resonant Pulse → Aether Remnant → Dissimilate"], advanced: ["Remnant → Pulse → Dissimilate → burst"], note: "Astral Step — эскейп." },
    "Queen of Pain": { basic: ["Blink → Shadow Strike → Scream of Pain → Sonic Wave"], advanced: ["Blink → Sonic Wave → Scream → Shadow Strike"], note: "Blink после Sonic." },
    "Sven": { basic: ["Storm Hammer → God's Strength → right click"], advanced: ["Blink → Storm Hammer → God's Strength → kill"], note: "God's Strength до драки." },
    "Wraith King": { basic: ["Wraithfire Blast → right click → Reincarnation"], advanced: ["Blink → Wraithfire Blast → Mortal Strike"], note: "Reincarnation — вторая жизнь." },
    "Tiny": { basic: ["Avalanche → Toss"], advanced: ["Blink → Avalanche → Toss → right click"], note: "Avalanche + Toss = двойной урон." },
    "Kunkka": { basic: ["Torrent → Tidebringer → X Marks the Spot"], advanced: ["X Marks → Torrent → Ghostship → Tidebringer"], note: "X Marks возвращает врага." },
    "Timbersaw": { basic: ["Timber Chain → Whirling Death → Reactive Armor"], advanced: ["Chain → Chakram → Whirling → Chain out"], note: "Chakram × 2 с Aghs." },
    "Legion Commander": { basic: ["Blink → Overwhelming Odds → Duel"], advanced: ["Blink → Press the Attack → Duel"], note: "Blade Mail обязателен." },
    "Bristleback": { basic: ["Viscous Nasal Goo → Quill Spray → Warpath"], advanced: ["Goo → Quill → Goo → Quill"], note: "Поворачивайся спиной." },
    "Doom": { basic: ["Blink → Doom → Scorched Earth → Infernal Blade"], advanced: ["Blink → Doom → Infernal Blade → burst"], note: "Doom на ключевого." },
    "Anti-Mage": { basic: ["Blink → Mana Break → Mana Void"], advanced: ["Blink → Abyssal → Mana Void"], note: "Mana Void урон зависит от сожжённой маны." },
    "Ursa": { basic: ["Earthshock → Fury Swipes"], advanced: ["Blink → Earthshock → Fury Swipes → Enrage"], note: "Overpower = двойной удар." },
    "Slardar": { basic: ["Slithereen Crush → Bash of the Deep → Amplify Damage"], advanced: ["Blink → Crush → Amplify → Bash → kill"], note: "Amplify показывает невидимок." },
    "Spirit Breaker": { basic: ["Charge of Darkness → Greater Bash → Nether Strike"], advanced: ["Charge → Nether Strike → Greater Bash → kill"], note: "Charge через всю карту." },
    "Lifestealer": { basic: ["Open Wounds → Feast → Rage"], advanced: ["Rage → Open Wounds → right click","Infest в союзника → Open Wounds → burst"], note: "Rage — иммунитет к магии." },
    "Bane": { basic: ["Enfeeble → Brain Sap → Nightmare → Fiend's Grip"], advanced: ["Nightmare → Fiend's Grip (полный контроль)"], note: "Nightmare + Fiend's Grip = 5+ сек контроля." },
    "Rubick": { basic: ["Telekinesis → Fade Bolt → Spell Steal"], advanced: ["Telekinesis → Spell Steal → Fade Bolt"], note: "Spell Steal крадёт последнее." },
    "Skywrath Mage": { basic: ["Concussive Shot → Arcane Bolt → Ancient Seal → Mystic Flare"], advanced: ["Ancient Seal → Mystic Flare (полный урон)"], note: "Ancient Seal увеличивает маг-урон." },
    "Oracle": { basic: ["Fortune's End → Purifying Flames → False Promise"], advanced: ["False Promise → Fortune's End → Purifying Flames"], note: "False Promise — защита от смерти." },
    "Winter Wyvern": { basic: ["Splinter Blast → Cold Embrace → Winter's Curse"], advanced: ["Blink → Winter's Curse → Splinter → Cold Embrace"], note: "Winter's Curse заставляет атаковать своих." },
    "Phoenix": { basic: ["Icarus Dive → Fire Spirits → Sun Ray → Supernova"], advanced: ["Icarus → Fire Spirits → Supernova"], note: "Supernova — 6 ударов." },
    "Enchantress": { basic: ["Impetus → Enchant → Nature's Attendants"], advanced: ["Enchant крип → Impetus → kill"], note: "Impetus урон зависит от дистанции." },
    "Brewmaster": { basic: ["Thunder Clap → Cinder Brew → Primal Split"], advanced: ["Clap → Cinder Brew → Split → 3 панды"], note: "Primal Split даёт 3 панды." },
    "Naga Siren": { basic: ["Ensnare → Mirror Image → Rip Tide → Song"], advanced: ["Mirror Image → Ensnare → Rip Tide"], note: "Song усыпляет всех." },
    "Undying": { basic: ["Decay → Soul Rip → Tombstone"], advanced: ["Decay × 3 → Tombstone → Soul Rip"], note: "Tombstone создаёт зомби." },
    "Ogre Magi": { basic: ["Fireblast → Ignite → Bloodlust"], advanced: ["Fireblast → Ignite → Multicast × 3"], note: "Multicast — рандомный множитель." },
    "Shadow Shaman": { basic: ["Hex → Shackles → Mass Serpent Ward"], advanced: ["Blink → Hex → Shackles → Ward"], note: "Hex + Shackles = 6+ сек контроля." },
    "Pugna": { basic: ["Decrepify → Nether Blast → Life Drain"], advanced: ["Decrepify → Blast → Drain"], note: "Decrepify +40% маг-урона." },
    "Warlock": { basic: ["Fatal Bonds → Shadow Word → Chaotic Offering"], advanced: ["Fatal Bonds → Chaotic Offering → Shadow Word"], note: "Fatal Bonds связывает врагов." },
    "Disruptor": { basic: ["Thunder Strike → Glimpse → Kinetic Field → Static Storm"], advanced: ["Glimpse → Kinetic → Static Storm → Thunder"], note: "Glimpse возвращает на позицию 4 сек назад." },
    "Clockwerk": { basic: ["Battery Assault → Power Cogs → Hookshot"], advanced: ["Hookshot → Cogs → Battery → kill"], note: "Cogs блокирует врагов." },
    "Riki": { basic: ["Smoke Screen → Blink Strike → Tricks of the Trade"], advanced: ["Smoke → Blink Strike → Tricks → kill"], note: "Smoke — сайленс + miss." },
    "Treant Protector": { basic: ["Nature's Grasp → Leech Seed → Overgrowth"], advanced: ["Blink → Overgrowth → Leech Seed → Grasp"], note: "Overgrowth — рут вокруг деревьев." },
    "Night Stalker": { basic: ["Void → Crippling Fear → Hunter in the Night"], advanced: ["Void → Crippling → Dark Ascension → kill"], note: "Ночью скорость выше." },
    "Beastmaster": { basic: ["Wild Axes → Call of the Wild → Primal Roar"], advanced: ["Blink → Primal Roar → Wild Axes → Hawk"], note: "Hawk — вижен. Boar — замедление." },
    "Visage": { basic: ["Grave Chill → Soul Assumption → Summon Familiars"], advanced: ["Chill → Familiars → Assumption"], note: "Familiars — 2 летающих пета." },
    "Chen": { basic: ["Penitence → Holy Persuasion → Hand of God"], advanced: ["Penitence → Persuasion → creep army push"], note: "Persuasion вербует крипов." },
    "Meepo": { basic: ["Poof → Earthbind → Ransack"], advanced: ["Blink → Earthbind → Poof × 5 → kill"], note: "Poof — телепорт к клону." },
    "Arc Warden": { basic: ["Flux → Magnetic Field → Spark Wraith → Tempest Double"], advanced: ["Tempest → Flux → Spark Wraith × 2"], note: "Tempest Double — копия с предметами." },
    "Lone Druid": { basic: ["Summon Spirit Bear → Rabid → Savage Roar"], advanced: ["Bear attack → Roar → Rabid → kill"], note: "Bear — основной урон." },
    "Weaver": { basic: ["The Swarm → Shukuchi → Geminate Attack → Time Lapse"], advanced: ["Shukuchi → Swarm → Geminate → kill"], note: "Time Lapse возвращает HP и позицию." },
    "Clinkz": { basic: ["Searing Arrows → Strafe → Skeleton Walk"], advanced: ["Strafe → Searing Arrows → Skeleton Walk"], note: "Skeleton Walk — невидимость." },
    "Templar Assassin": { basic: ["Refraction → Meld → Psi Blades"], advanced: ["Blink → Refraction → Meld → burst"], note: "Refraction блокирует урон." },
    "Phantom Lancer": { basic: ["Spirit Lance → Doppelganger → Juxtapose"], advanced: ["Lance → Doppel → Juxtapose → kill"], note: "Juxtapose создаёт иллюзии." },
    "Dazzle": { basic: ["Poison Touch → Shallow Grave → Shadow Wave"], advanced: ["Grave → Wave → Poison → kill"], note: "Shallow Grave не даёт умереть." },
    "Io": { basic: ["Tether → Spirits → Overcharge → Relocate"], advanced: ["Tether ally → Relocate → gank → back"], note: "Relocate — телепорт с союзником." },
    "Omniknight": { basic: ["Purification → Heavenly Grace → Guardian Angel"], advanced: ["Angel → Purification → Grace → kill"], note: "Guardian Angel — иммунитет к физике." },
    "Abaddon": { basic: ["Mist Coil → Aphotic Shield → Borrowed Time"], advanced: ["Shield → Coil → Time → kill"], note: "Aphotic Shield снимает дебаффы." },
    "Keeper of the Light": { basic: ["Illuminate → Blinding Light → Chakra Magic → Spirit Form"], advanced: ["Illuminate (канал) → Blinding → Chakra → kill"], note: "Illuminate кастуется в канале." }
  },

  getProkastsFor: function (hn) {
    if (!hn) return null;
    if (this.db[hn]) return this.db[hn];
    if (typeof findHeroByAlias === "function") {
      var f = findHeroByAlias(hn);
      if (f && this.db[f]) return this.db[f];
    }
    for (var k in this.db) if (this.db.hasOwnProperty(k) && k.toLowerCase().indexOf(hn.toLowerCase()) >= 0) return this.db[k];
    return null;
  },

  format: function (hn, info) {
    var l = ["⚡ **Прокасты на " + hn + ":**", ""];
    if (info.basic && info.basic.length) {
      l.push("**Базовый:**");
      for (var i = 0; i < info.basic.length; i++) l.push("• " + info.basic[i]);
      l.push("");
    }
    if (info.advanced && info.advanced.length) {
      l.push("**Продвинутые:**");
      for (var j = 0; j < info.advanced.length; j++) l.push("• " + info.advanced[j]);
      l.push("");
    }
    if (info.note) l.push("💡 " + info.note);
    return l.join("\n");
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("прокаст") >= 0) return "prokast";
    if (s.indexOf("комбо на") >= 0 || s.indexOf("комбо") >= 0) return "prokast";
    if (s.indexOf("как комбить") >= 0 || s.indexOf("как кастовать") >= 0) return "prokast";
    if (s.indexOf("связка") >= 0 && s.indexOf("способност") >= 0) return "prokast";
    return null;
  },

  answer: function (k, q) {
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
    if (!hn) return "⚡ Назови героя — например, «прокасты на инвокера».";
    var info = this.getProkastsFor(hn);
    if (!info) return "⚡ По " + hn + " база прокастов пока пустая.";
    return this.format(hn, info);
  }
};
