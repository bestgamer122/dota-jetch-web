/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — KNOWLEDGE BASE
   Локальная БЗ: герои, предметы, механики. Правило-матчер.
   ═══════════════════════════════════════════════════════════════════ */

const KB_HEROES = {
  "Juggernaut": {
    ru: ["джаггернаут", "жугернаут", "жугер", "jug"],
    role: "Керри · Pos 1", lane: "Сэйф-лейн (лёгкая)",
    pros: ["Сильный харас на линии", "Неуязвимость во время Omnislash", "Healing Ward для команды", "Хороший фарм с Battle Fury"],
    cons: ["Слаб без BKB в замесах", "Уязвим к контролю и сайленсу", "Слабый на ранних стадиях"],
    items: ["Battle Fury", "Manta Style", "Abyssal Blade", "Diffusal Blade", "Aghanim's Shard"],
    tips: "Blade Fury — эскейп и защита от магии. Healing Ward ЗА спиной команды в замесе. Omnislash сильнее с Manta."
  },
  "Pudge": {
    ru: ["пудж", "пуджа"],
    role: "Роум · Pos 4", lane: "Любая (роум)",
    pros: ["Hook — лучший пик-офф", "Огромный запас HP", "Rot полезен в мидгейме"],
    cons: ["Промазал Hook — бесполезен", "Медленный, легко кайтить", "Плохо фармит"],
    items: ["Blink Dagger", "Aghanim's Scepter", "Shard", "Force Staff", "Aether Lens"],
    tips: "Blink + Hook — комбо для сюрпризов. Rot не отключается при атаке. Meat Hook пробивает BKB."
  },
  "Invoker": {
    ru: ["инвокер", "вока", "inv"],
    role: "Мид · Pos 2", lane: "Мид",
    pros: ["10 способностей", "Гибкость под любую игру", "Высокий бурст-урон"],
    cons: ["Сложный микро-контроль", "Зависит от выучки скиллов", "Уязвим на линии"],
    items: ["Aghanim's Scepter", "Octarine Core", "Blink Dagger", "Black King Bar", "Scythe of Vyse"],
    tips: "Комбо: Eul → Sunstrike + Meteor + Deafening Blast. QWE — стандарт для мида. 2 слота Invoke."
  },
  "Shadow Fiend": {
    ru: ["сф", "шадоу фиенд"],
    role: "Мид · Pos 2", lane: "Мид",
    pros: ["Лучший фарм в игре", "Огромный урон с Necromastery", "Requiem — AoE бурст"],
    cons: ["Не имеет эскейпа", "Слаб против ганков", "Теряет стаки на смерть"],
    items: ["Blink Dagger", "Black King Bar", "Satanic", "Hurricane Pike", "Eul's Scepter"],
    tips: "Necromastery копит души — не умирай без BKB. Requiem через Blink ломает файты."
  },
  "Anti-Mage": {
    ru: ["ам", "антимаг", "antimage"],
    role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Сжигает ману", "Лучший мобильный фармер", "Counter против маго-зависимых"],
    cons: ["Очень слабый на линии", "Нужен фарм 25-30 минут", "Слаб против физ-керри"],
    items: ["Battle Fury", "Manta Style", "Abyssal Blade", "Butterfly", "Basher"],
    tips: "Blink для эскейпа и фарма. Counterspell отражает таргет-спеллы. Mana Burn работает через BKB."
  },
  "Phantom Assassin": {
    ru: ["па", "фантомка", "мортра"],
    role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Огромный бурст с Coup de Grace", "Мобильность с Phantom Strike", "Хороший поздний гейм"],
    cons: ["Хрупкая, умирает от бурста", "Зависит от критов", "Слаб на линии"],
    items: ["Battle Fury", "Desolator", "Black King Bar", "Abyssal Blade", "Satanic"],
    tips: "Blur даёт уклонение. Stifling Dagger для хараса. BKB обязателен к 20-й минуте."
  },
  "Slark": {
    ru: ["сларк"],
    role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Иммунитет к вардам в ульте", "Dark Pact снимает дебаффы", "Сжижает статы"],
    cons: ["Хрупкий", "Слаб без Essence Shift стаков", "Плох против AoE"],
    items: ["Echo Sabre", "Silver Edge", "Eye of Skadi", "Black King Bar", "Sange & Yasha"],
    tips: "Pounce — сцепляет врага. Shadow Dance регенерирует HP."
  },
  "Crystal Maiden": {
    ru: ["цм", "кристалка", "cm"],
    role: "Сапорт · Pos 5", lane: "Сэйф-лейн",
    pros: ["Аура маны для команды", "Frostbite — сильный стан", "Freezing Field в позднем гейме"],
    cons: ["Медленная", "Очень хрупкая", "Фарм слабый"],
    items: ["Force Staff", "Glimmer Cape", "Aghanim's Scepter", "Black King Bar", "Blink Dagger"],
    tips: "Frostbite на керри — блокирует блинк. Ульта через Glimmer или BKB."
  },
  "Storm Spirit": {
    ru: ["шторм"],
    role: "Мид · Pos 2", lane: "Мид",
    pros: ["Мобильность через Ball Lightning", "Высокий бурст с Orchid", "Снежный ком"],
    cons: ["Маназависимый", "Слаб против сайленса", "Падает в позднем гейме"],
    items: ["Orchid Malevolence", "Bloodstone", "BKB", "Scythe of Vyse", "Shiva's Guard"],
    tips: "Ball Lightning жрёт ману пропорционально дистанции. Orchid → комбо."
  },
  "Tinker": {
    ru: ["тинкер"],
    role: "Мид · Pos 2", lane: "Мид",
    pros: ["Rearm для повторного каста", "Топовый пущер", "March of the Machines фармит"],
    cons: ["Маназависимый", "Очень хрупкий", "Нужны Boots of Travel"],
    items: ["Boots of Travel", "Blink Dagger", "Aether Lens", "Shiva's Guard", "Black King Bar"],
    tips: "Rearm восстанавливает способности и предметы. Blink + March для фарма."
  },
  "Zeus": {
    ru: ["зевс"],
    role: "Мид · Pos 2", lane: "Мид",
    pros: ["Глобальный урон через Thundergod's Wrath", "Скайт-демаг", "Проверка вардов"],
    cons: ["Хрупкий", "Нет эскейпа", "Слаб в позднем"],
    items: ["Aether Lens", "Blink Dagger", "Aghanim's Scepter", "Octarine Core", "Bloodstone"],
    tips: "Thundergod's Wrath даёт вижен и урон по всем. Lightning Bolt проверяет фог."
  },
  "Lina": {
    ru: ["лина"],
    role: "Мид / Сапорт", lane: "Мид / Сэйф",
    pros: ["Огромный бурст-урон", "Дальний радиус атаки", "Laguna Blade — 950 урона"],
    cons: ["Хрупкая", "Медленный каст", "Нет эскейпа"],
    items: ["Aether Lens", "Blink Dagger", "Aghanim's Scepter", "BKB", "Eul's Scepter"],
    tips: "Dragon Slave + Light Strike Array — комбо. Laguna Blade — килл-секур."
  },
  "Drow Ranger": {
    ru: ["дров", "тракса"],
    role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Огромный дальний урон", "Замедление с Frost Arrows", "Silence через Gust"],
    cons: ["Очень хрупкая", "Слабая в ближнем бою", "Слаб без позиции"],
    items: ["Dragon Lance", "Manta Style", "BKB", "Hurricane Pike", "Satanic"],
    tips: "Марксманство — держи дистанцию. Gust против блинка."
  },
  "Sniper": {
    ru: ["снайпер", "снайп"],
    role: "Керри · Pos 1/2", lane: "Мид / Сэйф",
    pros: ["Максимальная дальность атаки", "Headshot", "Shrapnel пушит"],
    cons: ["Очень хрупкий", "Нет эскейпа", "Слаб против ганков"],
    items: ["Dragon Lance", "Manta", "BKB", "Hurricane Pike", "Butterfly"],
    tips: "Shrapnel для фарма. Take Aim на +400. Позиционируйся ЗА спинами."
  },
  "Morphling": {
    ru: ["морф"],
    role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Гибкость морф-статов", "Waveform — эскейп", "Adaptive Strike бурст"],
    cons: ["Сложный", "Зависит от маны", "Слаб до 6-го"],
    items: ["Ethereal Blade", "Linken's Sphere", "Eye of Skadi", "Satanic", "Manta"],
    tips: "Морфай Agi для урона, Str для выживания. Waveform — эскейп."
  },
  "Lifestealer": {
    ru: ["лайфстил", "ls"],
    role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Хилится с атаки", "Rage — иммунитет к магии", "Open Wounds крадёт HP"],
    cons: ["Слаб против китов", "Простой", "Уязвим к физ-урону"],
    items: ["Armlet", "Desolator", "Basher", "Abyssal Blade", "Satanic"],
    tips: "Rage — сайленс и иммунитет. Armlet + Feasts — синергия."
  },
  "Axe": {
    ru: ["акс"],
    role: "Оффлейн · Pos 3", lane: "Хард",
    pros: ["Berserker's Call — AoE-стан", "Culling Blade — казнь", "Counter Helix AoE"],
    cons: ["Зависит от Blink", "Уязвим к сайленсу", "Слаб против мобильных"],
    items: ["Blink Dagger", "Blade Mail", "Vanguard", "Crimson Guard", "Heart of Tarrasque"],
    tips: "Blink + Call + Blade Mail — классика. Culling Blade перезаряжается при килле."
  },
  "Magnus": {
    ru: ["магнус", "маг"],
    role: "Оффлейн · Pos 3/4", lane: "Хард",
    pros: ["Reverse Polarity — лучший тимфайт-стан", "Empower", "Skewer затягивает"],
    cons: ["Зависит от ульты", "Слаб без Blink", "Падает в позднем"],
    items: ["Blink Dagger", "Refresher", "Aghanim's Scepter", "Black King Bar", "Shard"],
    tips: "Blink + Reverse Polarity — залог победы. Skewer затягивает врагов."
  },
  "Rubick": {
    ru: ["рубик"],
    role: "Сапорт · Pos 4/5", lane: "Роум",
    pros: ["Крадёт способности", "Fade Bolt снижает урон", "Telekinesis — контроль"],
    cons: ["Зависит от врагов", "Хрупкий", "Слабый фарм"],
    items: ["Aether Lens", "Blink Dagger", "Force Staff", "Aghanim's Scepter", "Glimmer Cape"],
    tips: "Краденные ульты решают. Позиция — за спиной."
  },
  "Tidehunter": {
    ru: ["тайдер", "tide"],
    role: "Оффлейн · Pos 3", lane: "Хард",
    pros: ["Ravage — огромный AoE-стан", "Очень танковый", "Anchor Smash"],
    cons: ["Зависит от ульты", "Медленный", "Плохо фармит в раннем"],
    items: ["Blink Dagger", "Refresher", "Pipe of Insight", "Shiva's Guard", "Heart"],
    tips: "Blink + Ravage — классика. Kraken Shell снимает дебаффы."
  },
  "Wraith King": {
    ru: ["лк", "ренджи"],
    role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Реинкарнация", "Skeletons пушат", "Танковый керри"],
    cons: ["Слабый бурст", "Нет эскейпа", "Медленный фарм"],
    items: ["Radiance", "Armlet", "Blink Dagger", "Black King Bar", "Assault Cuirass"],
    tips: "Skeletons пушат и фармят. Reincarnation откатывается после фарма."
  },
  "Sven": {
    ru: ["свен"],
    role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Огромный урон с God's Strength", "Storm Hammer AoE-стан", "Быстрый фарм с Cleave"],
    cons: ["Простой", "Слаб против БКБ", "Медленный без ульты"],
    items: ["Blink Dagger", "Black King Bar", "Echo Sabre", "Daedalus", "Assault Cuirass"],
    tips: "Blink + Storm Hammer + God's Strength — залп. Cleave фармит лес."
  },
  "Medusa": {
    ru: ["медуза", "дуза"],
    role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Огромный пул HP через ману", "Split Shot AoE", "Stone Gaze — массовый контроль"],
    cons: ["Очень медленный старт", "Нужен фарм 40+ мин", "Уязвима к мана-жгучкам"],
    items: ["Manta", "Skadi", "BKB", "Butterfly", "Divine Rapier"],
    tips: "Mana Shield жрёт ману вместо HP. Stone Gaze — против физики."
  },
  "Faceless Void": {
    ru: ["войд"],
    role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Chronosphere — лучший тимфайт-стан", "Time Walk откат урона", "Хороший поздний"],
    cons: ["Слабый ранний", "Зависит от ульты", "Нужен BKB"],
    items: ["Mask of Madness", "Manta", "Black King Bar", "Refresher", "Butterfly"],
    tips: "Time Walk откатывает урон за 2 сек. Chrono ловит и союзников."
  },
  "Ember Spirit": {
    ru: ["эмбер"],
    role: "Мид · Pos 2", lane: "Мид",
    pros: ["Sleight of Fist с Battle Fury", "Fire Remnant — мобильность", "Searing Chains — сайленс"],
    cons: ["Сложный", "Хрупкий", "Зависит от позиции"],
    items: ["Battle Fury", "Maelstrom", "Blink Dagger", "Black King Bar", "Radiance"],
    tips: "Fire Remnant — 3 заряда для эскейпа. Sleight of Fist с Battle Fury — комбо."
  },
};

const KB_ITEMS = {
  "Black King Bar": {
    ru: ["бкб", "блек кинг бар", "bkb"], cost: 4050,
    desc: "Даёт иммунитет к большинству магических способностей.",
    when: "Против маго-контроля и бурста. Обязателен для керри и инициаторов.",
    tip: "После 10 сек использования становится 5 сек. Синергия с Blink."
  },
  "Blink Dagger": {
    ru: ["блинк", "блинк даггер"], cost: 2250,
    desc: "Телепорт до 1200 юнитов в радиусе.",
    when: "Инициаторам (Axe, Magnus, Tidehunter) и мобильным мидерам (Storm, Puck).",
    tip: "Отключается при получении урона от врагов."
  },
  "Aghanim's Scepter": {
    ru: ["агс", "агханимы", "aghanim"], cost: 4200,
    desc: "Улучшает ульту героя или даёт новую способность.",
    when: "Когда апгрейд ульты критичен для стратегии.",
    tip: "У разных героев разный эффект."
  },
  "Force Staff": {
    ru: ["форс", "force staff"], cost: 2200,
    desc: "Толкает юнита на 600 юнитов.",
    when: "Против Melee-керри, для спасения союзников, против Clockwerk.",
    tip: "Можно толкать врагов через скалы. Комбо с Blink."
  },
  "Glimmer Cape": {
    ru: ["глиммер"], cost: 1950,
    desc: "Даёт союзнику невидимость и магрезист.",
    when: "Против маго-урона. Спасение союзников.",
    tip: "При использовании на себя — невидимость 5 сек."
  },
  "Scythe of Vyse": {
    ru: ["хекс", "сайф"], cost: 5675,
    desc: "Превращает врага в овцу на 3.5 сек.",
    when: "Против мобильных керри (Anti-Mage, Storm).",
    tip: "Хекс не отключает пассивки."
  },
  "Eul's Scepter": {
    ru: ["эул", "euls"], cost: 2575,
    desc: "Поднимает врага в воздух на 2.5 сек.",
    when: "Для сетапа, спасения, диспела.",
    tip: "Снимает сайленс. Комбо с Sunstrike, Meteor."
  },
  "Shiva's Guard": {
    ru: ["шива"], cost: 4850,
    desc: "Замедляет и наносит урон вокруг себя.",
    when: "Против физ-керри, AoE-замедление.",
    tip: "Аура -attack speed. Не отключается при стане."
  },
  "Heart of Tarrasque": {
    ru: ["харт", "heart"], cost: 5000,
    desc: "+45 Strength, регенерация 1.6% HP/сек вне боя.",
    when: "Танкам и керри для выживания.",
    tip: "Комбо с Medusa через Mana Shield."
  },
  "Radiance": {
    ru: ["радик", "radiance"], cost: 5150,
    desc: "AoE-урон по всем врагам + miss chance.",
    when: "Фарм-керри (WK, Spectre) и оффлейнерам (Underlord).",
    tip: "Синергия с Battle Fury у Spectre."
  },
  "Battle Fury": {
    ru: ["бф", "батл фури"], cost: 4100,
    desc: "Cleave 35% + регенерация HP/маны.",
    when: "Melee-керри для фарма и пуша (Juggernaut, AM, PA).",
    tip: "Ускоряет фарм в 2 раза. Комбо с Ember Spirit."
  },
  "Diffusal Blade": {
    ru: ["дифуза"], cost: 2500,
    desc: "Сжигает ману при атаке, замедляет.",
    when: "Против маго-зависимых героев и для сайленса.",
    tip: "Полностью сжигает ману Medusa."
  },
  "Manta Style": {
    ru: ["манта"], cost: 4750,
    desc: "Создаёт 2 иллюзии. Снимает дебаффы.",
    when: "Керри для диспела и пуша.",
    tip: "Комбо с Diffusal — иллюзии жгут ману."
  },
  "Abyssal Blade": {
    ru: ["абик", "абуссал"], cost: 6400,
    desc: "Активный баш через BKB (2 сек).",
    when: "Против керри в позднем гейме.",
    tip: "Единственный баш, пробивающий BKB."
  },
  "Linken's Sphere": {
    ru: ["линка", "linkens"], cost: 4800,
    desc: "Блокирует 1 таргет-спелл раз в 14 сек.",
    when: "Против Doom, Legion, Bane, Batrider.",
    tip: "Не блокирует AoE-спеллы."
  },
  "Aeon Disk": {
    ru: ["аеон"], cost: 3000,
    desc: "При HP < 70% даёт неуязвимость 2.5 сек.",
    when: "Саппортам против бурста.",
    tip: "Идеально для Rubick, Warlock. Откат 105 сек."
  },
  "Spirit Vessel": {
    ru: ["вессел", "спирит вессел"], cost: 2780,
    desc: "Накладывает -HP реген и урон по HP.",
    when: "Против Alchemist, Morphling, Huskar.",
    tip: "Отключает хил союзников."
  },
  "Hood of Defiance": {
    ru: ["худ"], cost: 1750,
    desc: "Магрезист + барьер против магии.",
    when: "Против маго-мидеров.",
    tip: "Раскатывается в Pipe of Insight для команды."
  },
  "Pipe of Insight": {
    ru: ["пайп"], cost: 3725,
    desc: "Командный магрезист-щит.",
    when: "Против AoE-магии по команде.",
    tip: "Актив на всю команду."
  },
  "Blade Mail": {
    ru: ["блейд мейл", "бм", "блейдмейл"], cost: 2275,
    desc: "Отражает 85% полученного урона.",
    when: "Против высокого бурста (PA, Juggernaut).",
    tip: "Активируй ПЕРЕД тем как влететь."
  },
};

const KB_MECHANICS = {
  "Ластхит": {
    ru: ["ластхит", "ласт хит", "добивание"],
    desc: "Добивание крипа для получения золота.",
    tip: "Практикуй в демо-режиме. Цель: 50/10, 100/20 за первые 20 мин. Анимация атаки важнее урона."
  },
  "Денай": {
    ru: ["денай", "deny"],
    desc: "Убийство своего крипа для лишения врага золота и опыта.",
    tip: "Делай при HP крипа < 50%. Ключевой навык для мид-лейна."
  },
  "Стакинг": {
    ru: ["стак", "стакинг", "стакать"],
    desc: "Агрить крипов на :53 каждой минуты для создания стака.",
    tip: "Стак даёт больше золота и опыта. Ancients — для керри с аое-фармом."
  },
  "Пуллинг": {
    ru: ["пул", "пуллинг"],
    desc: "Агрить нейтральных крипов на линию для помощи сэйф-лейнеру.",
    tip: "Делай на :15 или :45. Пул даёт опыт саппорту и золото керри."
  },
  "Харас": {
    ru: ["харас", "harass"],
    desc: "Нанесение урона врагу без цели убить, чтобы вытеснить с линии.",
    tip: "Автоатаки по врагу при откате крипов. Следи за позицией."
  },
  "Ганг": {
    ru: ["ганг", "ганк", "gank"],
    desc: "Неожиданное нападение с целью убийства.",
    tip: "Используй смок для обхода вардов. Тайминг — когда враг в неудобной позиции."
  },
  "Пуш": {
    ru: ["пуш", "пушить", "push"],
    desc: "Заставлять крипов атаковать башни.",
    tip: "Пушить после убийства врага. Ставь варды перед пушем."
  },
  "Рошан": {
    ru: ["рошан", "roshan"],
    desc: "Нейтральный босс, дающий Aegis of the Immortal.",
    tip: "Рошан респавнится через 8-11 мин. Убивай после выигранного тимфайта."
  },
  "Руны": {
    ru: ["руна", "руны", "rune"],
    desc: "Бонус-руны на реке каждые 2 минуты.",
    tip: "Power Rune на :00 и :02. Bounty Rune даёт золото всей команде."
  },
  "Тимфайт": {
    ru: ["тимфайт", "teamfight", "файт"],
    desc: "Массовое сражение команд.",
    tip: "Инициация после ультов. Позиционирование за спиной. Не дерись без BKB."
  },
  "Тп": {
    ru: ["тп", "телепорт", "tp"],
    desc: "Телепортация к башне через свиток.",
    tip: "Всегда носи 1-2 ТП. Тп на ротацию — залог победы."
  },
  "Смок": {
    ru: ["смок", "smoke"],
    desc: "Предмет для невидимой ротации команды.",
    tip: "Смок + вард = ганг. Отключается при приближении к врагу."
  },
  "Варды": {
    ru: ["вард", "вижен", "observer", "sentry"],
    desc: "Обзор для команды и снятие вражеских вардов.",
    tip: "Observer видят, Sentry — снимают. Держи вижен на рунах."
  },
};

function _kbNorm(s) {
  return String(s || "").toLowerCase()
    .replace(/[^a-zа-яё0-9\s]/g, " ")
    .replace(/\s+/g, " ").trim();
}
function _kbTokens(s) {
  return _kbNorm(s).split(" ").filter(t => t.length >= 2);
}
function _kbEntryKeywords(entry, canonical) {
  const arr = [_kbNorm(canonical)];
  if (entry.ru) for (const r of entry.ru) arr.push(_kbNorm(r));
  return arr;
}
function _kbScore(tokens, entry, canonical) {
  const keys = _kbEntryKeywords(entry, canonical);
  let best = 0;
  for (const t of tokens) {
    let localBest = 0;
    for (const k of keys) {
      if (k === t) { localBest = Math.max(localBest, 3); continue; }
      if (k.includes(t) || t.includes(k)) localBest = Math.max(localBest, 1);
    }
    best += localBest;
  }
  return best;
}

function kbSearch(query) {
  const tokens = _kbTokens(query);
  if (!tokens.length) return null;
  const candidates = [];
  for (const [name, e] of Object.entries(KB_HEROES)) {
    candidates.push({ kind: "hero", key: name, entry: e, score: _kbScore(tokens, e, name) });
  }
  for (const [name, e] of Object.entries(KB_ITEMS)) {
    candidates.push({ kind: "item", key: name, entry: e, score: _kbScore(tokens, e, name) });
  }
  for (const [name, e] of Object.entries(KB_MECHANICS)) {
    candidates.push({ kind: "mechanic", key: name, entry: e, score: _kbScore(tokens, e, name) });
  }
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0];
  if (!top || top.score < 2) return null;
  return top;
}

function kbIntent(query) {
  const q = _kbNorm(query);
  if (/\bпротив|counter|контр|противоядие\b/.test(q)) return "counter";
  if (/\bпредмет|билд|собрать|сборка\b/.test(q)) return "items";
  if (/\bкак играть|гайд|совет|подскаж|научи\b/.test(q)) return "guide";
  if (/\bчто делает|что за|что такое\b/.test(q)) return "what";
  return "info";
}

function kbAnswer(query) {
  const match = kbSearch(query);
  if (!match) {
    return {
      text: "🤔 Не нашёл в базе знаний.\n\n" +
            "Могу рассказать про:\n" +
            "• **Героев** — 25+ (Juggernaut, Pudge, Invoker, AM, PA, Slark, Storm, Tinker, Zeus, Lina, Drow, Sniper, Morphling, LS, Axe, Magnus, Rubick, Tidehunter, WK, Sven, Medusa, Void, Ember)\n" +
            "• **Предметы** — 20 (BKB, Blink, Aghs, Force, Glimmer, Hex, Eul's, Shiva, Heart, Radiance, BF, Diffusal, Manta, Abyssal, Linken, Aeon, Vessel, Hood, Pipe, Blade Mail)\n" +
            "• **Механики** — ластхит, денай, стакинг, пуллинг, харас, ганг, пуш, Рошан, руны, тимфайт, ТП, смок, варды\n\n" +
            "Пример: *«как играть на пудже»*, *«что делает BKB»*, *«предметы на АМ»*.",
      kind: "none"
    };
  }
  const intent = kbIntent(query);
  const e = match.entry;
  const key = match.key;

  if (match.kind === "hero") {
    if (intent === "items" && e.items) {
      return { kind: "hero", text: `🎭 **${key}** — ключевые предметы:\n\n` +
        e.items.map(i => "• " + i).join("\n") +
        (e.tips ? `\n\n💡 ${e.tips}` : ""), match };
    }
    if (intent === "counter" && e.cons) {
      return { kind: "hero", text: `⚔️ **Слабые стороны ${key}:**\n\n` +
        e.cons.map(c => "• " + c).join("\n") +
        `\n\n🎯 Роль: ${e.role} · Линия: ${e.lane}` +
        (e.tips ? `\n\n💡 ${e.tips}` : ""), match };
    }
    let t = `🎭 **${key}** — ${e.role}\n📍 Линия: ${e.lane}\n\n`;
    t += `✅ **Плюсы:**\n` + (e.pros || []).map(p => "• " + p).join("\n") + "\n\n";
    t += `❌ **Минусы:**\n` + (e.cons || []).map(c => "• " + c).join("\n") + "\n\n";
    if (e.items) t += `🛡 **Ключевые предметы:** ${e.items.join(", ")}\n\n`;
    if (e.tips) t += `💡 **Совет:** ${e.tips}`;
    return { kind: "hero", text: t, match };
  }
  if (match.kind === "item") {
    let t = `🛡 **${key}**${e.cost ? ` · ${e.cost}g` : ""}\n\n`;
    if (e.desc) t += `📖 ${e.desc}\n\n`;
    if (e.when) t += `🎯 **Когда покупать:** ${e.when}\n\n`;
    if (e.tip) t += `💡 **Совет:** ${e.tip}`;
    return { kind: "item", text: t, match };
  }
  if (match.kind === "mechanic") {
    let t = `🎓 **${key}**\n\n`;
    if (e.desc) t += `📖 ${e.desc}\n\n`;
    if (e.tip) t += `💡 **Совет:** ${e.tip}`;
    return { kind: "mechanic", text: t, match };
  }
  return { kind: "none", text: "Что-то пошло не так." };
}
