var KB_HEROES = {
  "Juggernaut": { ru: ["джаггернаут","жугер"], role: "Керри", lane: "Сэйф",
    pros: ["Сильный харас","Omnislash неуязвимость"], cons: ["Слаб без BKB"],
    items: ["Battle Fury","Manta","Abyssal"], tips: "Blade Fury для эскейпа.",
    counters: ["Axe","Legion"], synergies: ["Magnus","CM"] },
  "Pudge": { ru: ["пудж"], role: "Роум", lane: "Любая",
    pros: ["Hook пик-офф","Много HP"], cons: ["Промазал бесполезен"],
    items: ["Blink","Aghs","Force"], tips: "Blink + Hook.",
    counters: ["AM","Storm"], synergies: ["AA","Disruptor"] },
  "Invoker": { ru: ["инвокер"], role: "Мид", lane: "Мид",
    pros: ["10 скиллов","Гибкость"], cons: ["Сложный"],
    items: ["Aghs","Octarine","Blink"], tips: "Eul + Sunstrike + Meteor.",
    counters: ["Nyx","Storm"], synergies: ["Magnus","Enigma"] },
  "Anti-Mage": { ru: ["ам","антимаг"], role: "Керри", lane: "Сэйф",
    pros: ["Сжигает ману","Мобильный"], cons: ["Слаб на линии"],
    items: ["BF","Manta","Abyssal"], tips: "Blink для эскейпа и фарма.",
    counters: ["Blood","Slardar"], synergies: ["CM","Dazzle"] },
  "Phantom Assassin": { ru: ["па","фантомка"], role: "Керри", lane: "Сэйф",
    pros: ["Криты","Мобильность"], cons: ["Хрупкая"],
    items: ["BF","Desolator","BKB"], tips: "Blur даёт уклонение.",
    counters: ["Axe","Legion"], synergies: ["Magnus","CM"] },
  "Storm Spirit": { ru: ["шторм"], role: "Мид", lane: "Мид",
    pros: ["Ball Lightning","Снежный ком"], cons: ["Маназависимый"],
    items: ["Orchid","Bloodstone","BKB"], tips: "Ball Lightning жрёт ману.",
    counters: ["AM","Nyx"], synergies: ["CM","Io"] },
  "Lina": { ru: ["лина"], role: "Мид", lane: "Мид",
    pros: ["Бурст","Laguna"], cons: ["Хрупкая"],
    items: ["Aether","Blink","Aghs"], tips: "Dragon Slave + LSA.",
    counters: ["AM","Storm"], synergies: ["SD","Bane"] },
  "Drow Ranger": { ru: ["дров"], role: "Керри", lane: "Сэйф",
    pros: ["Дальний урон","Frost Arrows"], cons: ["Хрупкая"],
    items: ["Dragon Lance","Manta","BKB"], tips: "Gust против блинка.",
    counters: ["Storm","AM"], synergies: ["VS","CM"] },
  "Sniper": { ru: ["снайпер"], role: "Керри", lane: "Мид",
    pros: ["Дальний радиус","Shrapnel"], cons: ["Хрупкий"],
    items: ["Dragon Lance","Manta","BKB"], tips: "За спинами союзников.",
    counters: ["SB","Storm"], synergies: ["VS","Drow"] },
  "Axe": { ru: ["акс"], role: "Оффлейн", lane: "Хард",
    pros: ["Call AoE-стан","Culling Blade"], cons: ["Зависит от Blink"],
    items: ["Blink","Blade Mail","Vanguard"], tips: "Blink + Call + BM.",
    counters: ["Timber","Bristle"], synergies: ["Dazzle","Warlock"] },
  "Magnus": { ru: ["магнус"], role: "Оффлейн", lane: "Хард",
    pros: ["RP тимфайт-стан","Empower"], cons: ["Зависит от ульты"],
    items: ["Blink","Refresher","Aghs"], tips: "Blink + RP.",
    counters: ["Silencer","Rubick"], synergies: ["SF","Jug"] },
  "Tinker": { ru: ["тинкер"], role: "Мид", lane: "Мид",
    pros: ["Rearm","Пущер"], cons: ["Маназависимый"],
    items: ["BoTs","Blink","Aether"], tips: "Rearm восстанавливает скиллы.",
    counters: ["Storm","AM"], synergies: ["Magnus","Dark Seer"] },
  "Zeus": { ru: ["зевс"], role: "Мид", lane: "Мид",
    pros: ["Глобальный урон","Проверка вардов"], cons: ["Хрупкий"],
    items: ["Aether","Blink","Aghs"], tips: "Thundergod's Wrath по всем.",
    counters: ["AM","Storm"], synergies: ["Magnus","CM"] },
  "Medusa": { ru: ["медуза"], role: "Керри", lane: "Сэйф",
    pros: ["HP через ману","Split Shot"], cons: ["Медленный старт"],
    items: ["Manta","Skadi","BKB"], tips: "Mana Shield жрёт ману.",
    counters: ["AM","Diffusal"], synergies: ["Dazzle","Oracle"] },
  "Faceless Void": { ru: ["войд"], role: "Керри", lane: "Сэйф",
    pros: ["Chronosphere","Time Walk"], cons: ["Слабый ранний"],
    items: ["MoM","Manta","BKB"], tips: "Time Walk откатывает урон.",
    counters: ["Silencer","Doom"], synergies: ["Magnus","Warlock"] },
  "Rubick": { ru: ["рубик"], role: "Сапорт", lane: "Роум",
    pros: ["Крадёт скиллы","Fade Bolt"], cons: ["Зависит от врагов"],
    items: ["Aether","Blink","Force"], tips: "Краденные ульты решают.",
    counters: ["Doom","Silencer"], synergies: ["Magnus","Tide"] },
  "Tidehunter": { ru: ["тайдер"], role: "Оффлейн", lane: "Хард",
    pros: ["Ravage AoE-стан","Танковый"], cons: ["Зависит от ульты"],
    items: ["Blink","Refresher","Pipe"], tips: "Blink + Ravage.",
    counters: ["Rubick","Silencer"], synergies: ["Magnus","CM"] },
  "Sven": { ru: ["свен"], role: "Керри", lane: "Сэйф",
    pros: ["God's Strength","Cleave"], cons: ["Слаб против БКБ"],
    items: ["Blink","BKB","Echo"], tips: "Blink + Hammer + GS.",
    counters: ["AM","Slark"], synergies: ["Magnus","CM"] },
  "Ember Spirit": { ru: ["эмбер"], role: "Мид", lane: "Мид",
    pros: ["Sleight of Fist","Fire Remnant"], cons: ["Сложный"],
    items: ["BF","Maelstrom","Blink"], tips: "Fire Remnant 3 заряда.",
    counters: ["Nyx","Storm"], synergies: ["Magnus","Enigma"] },
  "Queen of Pain": { ru: ["квопа"], role: "Мид", lane: "Мид",
    pros: ["Blink","Sonic Wave"], cons: ["Хрупкая"],
    items: ["Kaya","BKB","Aghs"], tips: "Blink для агрессии.",
    counters: ["AM","Nyx"], synergies: ["Magnus","SD"] }
};

var KB_ITEMS = {
  "Black King Bar": { ru: ["бкб","bkb"], cost: 4050,
    desc: "Иммунитет к большинству магических способностей.",
    when: "Против маго-контроля.", tip: "После 10 сек использования 5 сек." },
  "Blink Dagger": { ru: ["блинк"], cost: 2250,
    desc: "Телепорт до 1200 юнитов.", when: "Инициаторам.",
    tip: "Отключается при уроне." },
  "Aghanim's Scepter": { ru: ["агс"], cost: 4200,
    desc: "Улучшает ульту.", when: "Когда апгрейд критичен." },
  "Force Staff": { ru: ["форс"], cost: 2200,
    desc: "Толкает юнита на 600 юнитов.", when: "Против Melee-керри." },
  "Glimmer Cape": { ru: ["глиммер"], cost: 1950,
    desc: "Невидимость и магрезист союзнику.", when: "Против маго-урона." },
  "Scythe of Vyse": { ru: ["хекс"], cost: 5675,
    desc: "Превращает врага в овцу на 3.5 сек.", when: "Против мобильных керри." },
  "Eul's Scepter": { ru: ["эул"], cost: 2575,
    desc: "Поднимает врага в воздух на 2.5 сек.", when: "Для сетапа и диспела." },
  "Manta Style": { ru: ["манта"], cost: 4750,
    desc: "Создаёт 2 иллюзии. Снимает дебаффы.", when: "Керри для диспела." },
  "Diffusal Blade": { ru: ["дифуза"], cost: 2500,
    desc: "Сжигает ману при атаке.", when: "Против маго-зависимых." },
  "Battle Fury": { ru: ["бф"], cost: 4100,
    desc: "Cleave + регенерация HP/маны.", when: "Melee-керри для фарма." },
  "Radiance": { ru: ["радик"], cost: 5150,
    desc: "AoE-урон + miss chance.", when: "Фарм-керри." },
  "Heart of Tarrasque": { ru: ["харт"], cost: 5000,
    desc: "+45 Strength, регенерация.", when: "Танкам и керри." },
  "Shiva's Guard": { ru: ["шива"], cost: 4850,
    desc: "Замедляет и наносит урон вокруг.", when: "Против физ-керри." },
  "Abyssal Blade": { ru: ["абик"], cost: 6400,
    desc: "Активный баш через BKB.", when: "Против керри в лейте." },
  "Linken's Sphere": { ru: ["линка"], cost: 4800,
    desc: "Блокирует 1 таргет-спелл.", when: "Против Doom, Legion." },
  "Aeon Disk": { ru: ["аеон"], cost: 3000,
    desc: "При HP меньше 70% неуязвимость 2.5 сек.", when: "Саппортам против бурста." },
  "Blade Mail": { ru: ["бм"], cost: 2275,
    desc: "Отражает 85% урона.", when: "Против бурста." },
  "Silver Edge": { ru: ["сильвер"], cost: 5450,
    desc: "Невидимость + Break.", when: "Против Bristle, PA, Spectre." },
  "Bloodstone": { ru: ["бладстоун"], cost: 4900,
    desc: "Мана-реген + Spell Lifesteal.", when: "Storm, Ember, QoP." }
};

var KB_MECHANICS = {
  "Ластхит": { ru: ["ластхит","добивание"],
    desc: "Добивание крипа для золота.",
    tip: "Цель 50/10 за первые 10 мин." },
  "Денай": { ru: ["денай"],
    desc: "Убийство своего крипа.", tip: "При HP крипа меньше 50%." },
  "Стакинг": { ru: ["стак","стакать"],
    desc: "Агрить крипов на :53 каждой минуты.",
    tip: "Стак даёт больше золота и опыта." },
  "Пуллинг": { ru: ["пул"],
    desc: "Агрить нейтралов на линию.", tip: "На :15 или :45." },
  "Харас": { ru: ["харас"],
    desc: "Урон врагу без цели убить." },
  "Ганг": { ru: ["ганг"],
    desc: "Неожиданное нападение.", tip: "Смок для обхода вардов." },
  "Рошан": { ru: ["рошан"],
    desc: "Босс, дающий Aegis.", tip: "Респавн через 8-11 мин." },
  "Руны": { ru: ["руна","руны"],
    desc: "Бонус-руны на реке каждые 2 мин." },
  "Тимфайт": { ru: ["тимфайт","файт"],
    desc: "Массовое сражение команд." },
  "Тп": { ru: ["тп","телепорт"],
    desc: "Телепортация через свиток.", tip: "Всегда носи 1-2 ТП." },
  "Смок": { ru: ["смок"],
    desc: "Предмет для невидимой ротации." },
  "Варды": { ru: ["вард","вижен"],
    desc: "Обзор и снятие вардов." },
  "Байбек": { ru: ["байбек"],
    desc: "Мгновенное возрождение за золото.",
    tip: "Следи за кулдауном врагов." },
  "Глиф": { ru: ["глиф"],
    desc: "Защита башен от урона." },
  "Тайминги башен": { ru: ["тайминги башен"],
    desc: "Среднее время сноса башен.",
    tip: "T1 7-12 мин, T2 15-25 мин." }
};

function kbNorm(s) {
  return String(s || "").toLowerCase().replace(/[^a-zа-яё0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function kbTokens(s) { return kbNorm(s).split(" ").filter(function (t) { return t.length >= 2; }); }

function kbScore(tokens, entry, canonical) {
  var keys = [kbNorm(canonical)];
  if (entry.ru) for (var i = 0; i < entry.ru.length; i++) keys.push(kbNorm(entry.ru[i]));
  var score = 0;
  for (var ti = 0; ti < tokens.length; ti++) {
    var best = 0;
    for (var ki = 0; ki < keys.length; ki++) {
      if (keys[ki] === tokens[ti]) { best = Math.max(best, 3); continue; }
      if (keys[ki].indexOf(tokens[ti]) >= 0 || tokens[ti].indexOf(keys[ki]) >= 0) best = Math.max(best, 1);
    }
    score += best;
  }
  return score;
}

function kbSearch(query) {
  var tokens = kbTokens(query);
  if (!tokens.length) return null;
  var candidates = [];
  var name;
  for (name in KB_HEROES) if (KB_HEROES.hasOwnProperty(name)) candidates.push({ kind: "hero", key: name, entry: KB_HEROES[name], score: kbScore(tokens, KB_HEROES[name], name) });
  for (name in KB_ITEMS) if (KB_ITEMS.hasOwnProperty(name)) candidates.push({ kind: "item", key: name, entry: KB_ITEMS[name], score: kbScore(tokens, KB_ITEMS[name], name) });
  for (name in KB_MECHANICS) if (KB_MECHANICS.hasOwnProperty(name)) candidates.push({ kind: "mechanic", key: name, entry: KB_MECHANICS[name], score: kbScore(tokens, KB_MECHANICS[name], name) });
  candidates.sort(function (a, b) { return b.score - a.score; });
  var top = candidates[0];
  if (!top || top.score < 2) return null;
  return top;
}

function kbAnswer(query) {
  var m = kbSearch(query);
  if (!m) return { text: "Не нашёл в базе. Спроси про героя (Juggernaut, Pudge, Invoker, AM, PA, Storm, Lina, Drow, Sniper, Axe, Magnus, Tinker, Zeus, Medusa, Void, Rubick, Tide, Sven, Ember, QoP), предметы (BKB, Blink, Aghs, Force, Glimmer, Hex, Eul's, Manta, Diffusal, BF, Radiance, Heart, Shiva, Abyssal, Linken, Aeon, Blade Mail, Silver Edge, Bloodstone), механики (ластхит, денай, стакинг, пуллинг, харас, ганг, Рошан, руны, тимфайт, ТП, смок, варды, байбек, глиф, тайминги башен)." };
  var e = m.entry, key = m.key;
  var t = "";
  if (m.kind === "hero") {
    t = key + " - " + (e.role || "?") + ", линия: " + (e.lane || "?") + "\n\n";
    if (e.pros) t += "Плюсы:\n" + e.pros.map(function (x) { return "* " + x; }).join("\n") + "\n\n";
    if (e.cons) t += "Минусы:\n" + e.cons.map(function (x) { return "* " + x; }).join("\n") + "\n\n";
    if (e.items) t += "Предметы: " + e.items.join(", ") + "\n\n";
    if (e.counters) t += "Контрпики: " + e.counters.join(", ") + "\n\n";
    if (e.synergies) t += "Синергии: " + e.synergies.join(", ") + "\n\n";
    if (e.tips) t += "Совет: " + e.tips;
  } else if (m.kind === "item") {
    t = key + (e.cost ? " (" + e.cost + "g)" : "") + "\n\n";
    if (e.desc) t += e.desc + "\n\n";
    if (e.when) t += "Когда: " + e.when + "\n\n";
    if (e.tip) t += "Совет: " + e.tip;
  } else {
    t = key + "\n\n" + (e.desc || "") + "\n\n" + (e.tip ? "Совет: " + e.tip : "");
  }
  return { kind: m.kind, text: t, match: m };
}
