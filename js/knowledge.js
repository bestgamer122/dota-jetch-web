/* ═══════════════════════════════════════════════════════════════════
DOTA JETCH — KNOWLEDGE BASE v4.0.0
Расширенная база: 40+ героев, 30+ предметов, 25+ механик,
контекстные советы, контрпики, синергии, тайминги.
═══════════════════════════════════════════════════════════════════ */

var KB_HEROES = {
"Juggernaut": {
ru: ["джаггернаут", "жугер", "jug"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
pros: ["Сильный харас на линии", "Неуязвимость во время Omnislash", "Healing Ward для команды", "Хороший фарм с Battle Fury"],
cons: ["Слаб без BKB в замесах", "Уязвим к контролю и сайленсу", "Слабый на ранних стадиях"],
items: ["Battle Fury", "Manta Style", "Abyssal Blade", "Diffusal Blade", "Aghanim's Shard"],
tips: "Blade Fury — эскейп и защита от магии. Healing Ward ЗА спиной команды в замесе. Omnislash сильнее с Manta — иллюзии добавляют удары.",
counters: ["Axe", "Legion Commander", "Doom"],
synergies: ["Crystal Maiden", "Magnus", "Dark Willow"]
},
"Pudge": {
ru: ["пудж", "пуджа"], role: "Роум · Pos 4", lane: "Любая (роум)",
pros: ["Hook — лучший пик-офф в игре", "Огромный запас HP", "Rot полезен в мидгейме"],
cons: ["Промазал Hook — бесполезен", "Медленный, легко кайтить", "Плохо фармит"],
items: ["Blink Dagger", "Aghanim's Scepter", "Shard", "Force Staff", "Aether Lens"],
tips: "Blink + Hook — комбо для сюрпризов. Rot не отключается при атаке. Meat Hook пробивает BKB. Позиционируйся во фоге.",
counters: ["Anti-Mage", "Storm Spirit", "Queen of Pain"],
synergies: ["Ancient Apparition", "Disruptor", "Kunkka"]
},
"Invoker": {
ru: ["инвокер", "вока", "inv"], role: "Мид · Pos 2", lane: "Мид",
pros: ["10 способностей", "Гибкость под любую игру", "Высокий бурст-урон", "Отличный пущер"],
cons: ["Сложный микро-контроль", "Зависит от выучки скиллов", "Уязвим на линии"],
items: ["Aghanim's Scepter", "Octarine Core", "Blink Dagger", "Black King Bar", "Scythe of Vyse"],
tips: "Учи комбо: Eul → Sunstrike + Meteor + Deafening Blast. QWE (Quas-Wex-Exort) — стандарт для мида. Invoke имеет 2 слота.",
counters: ["Nyx Assassin", "Storm Spirit", "Anti-Mage"],
synergies: ["Magnus", "Dark Seer", "Enigma"]
},
"Shadow Fiend": {
ru: ["сф", "шадоу фиенд"], role: "Мид · Pos 2", lane: "Мид",
pros: ["Лучший фарм в игре", "Огромный урон с Necromastery", "Requiem — AoE бурст"],
cons: ["Не имеет эскейпа", "Слаб против ганков", "Теряет стаки на смерть"],
items: ["Blink Dagger", "Black King Bar", "Satanic", "Hurricane Pike", "Eul's Scepter"],
tips: "Necromastery копит души — не умирай без BKB. Requiem через Blink — ломает файты. Razes можно кастовать при движении.",
counters: ["Storm Spirit", "Queen of Pain", "Puck"],
synergies: ["Magnus", "Enigma", "Dark Seer"]
},
"Anti-Mage": {
ru: ["ам", "антимаг", "antimage"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
pros: ["Сжигает ману", "Лучший мобильный фармер", "Counter против маго-зависимых"],
cons: ["Очень слабый на линии", "Нужен фарм 25-30 минут", "Слаб против сильных физ-керри"],
items: ["Battle Fury", "Manta Style", "Abyssal Blade", "Butterfly", "Basher"],
tips: "Blink для эскейпа и фарма. Counterspell отражает таргет-спеллы. Mana Burn работает через BKB.",
counters: ["Bloodseeker", "Slardar", "Bounty Hunter"],
synergies: ["Crystal Maiden", "Dazzle", "Oracle"]
},
"Phantom Assassin": {
ru: ["па", "фантомка", "мортра"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
pros: ["Огромный бурст с Coup de Grace", "Мобильность с Phantom Strike", "Хороший поздний гейм"],
cons: ["Хрупкая, умирает от бурста", "Зависит от критов", "Слаб на линии"],
items: ["Battle Fury", "Desolator", "Black King Bar", "Abyssal Blade", "Satanic"],
tips: "Blur даёт уклонение. Stifling Dagger для хараса и килл-секура. BKB обязателен к 20-й минуте.",
counters: ["Axe", "Legion Commander", "Bristleback"],
synergies: ["Magnus", "Crystal Maiden", "Dazzle"]
},
"Slark": {
ru: ["сларк"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
pros: ["Иммунитет к вардам в ульте", "Dark Pact снимает дебаффы", "Сжижает статы"],
cons: ["Хрупкий", "Слаб без Essence Shift стаков", "Плох против AoE"],
items: ["Echo Sabre", "Silver Edge", "Eye of Skadi", "Black King Bar", "Sange & Yasha"],
tips: "Pounce — сцепляет врага. Shadow Dance регенерирует HP. Держись невидимым.",
counters: ["Bloodseeker", "Bounty Hunter", "Slardar"],
synergies: ["Dark Willow", "Earth Spirit", "Rubick"]
},
"Storm Spirit": {
ru: ["шторм"], role: "Мид · Pos 2", lane: "Мид",
pros: ["Мобильность через Ball Lightning", "Высокий бурст с Orchid", "Снежный ком"],
cons: ["Очень маназависимый", "Слаб против сайленса", "Падает в позднем гейме"],
items: ["Orchid Malevolence", "Bloodstone", "BKB", "Scythe of Vyse", "Shiva's Guard"],
tips: "Ball Lightning жрёт ману пропорционально дистанции. Static Remnant для фарма. Orchid → комбо.",
counters: ["Anti-Mage", "Nyx Assassin", "Doom"],
synergies: ["Crystal Maiden", "Io", "Magnus"]
},
"Lina": {
ru: ["лина"], role: "Мид / Сапорт", lane: "Мид / Сэйф",
pros: ["Огромный бурст-урон", "Дальний радиус атаки", "Laguna Blade — 950 урона"],
cons: ["Хрупкая", "Медленный каст", "Нет эскейпа"],
items: ["Aether Lens", "Blink Dagger", "Aghanim's Scepter", "BKB", "Eul's Scepter"],
tips: "Dragon Slave + Light Strike Array — комбо. Laguna Blade — килл-секур. Fiery Soul даёт скорость.",
counters: ["Anti-Mage", "Storm Spirit", "Puck"],
synergies: ["Shadow Demon", "Bane", "Rubick"]
},
"Drow Ranger": {
ru: ["дров", "тракса"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
pros: ["Огромный дальний урон", "Замедление с Frost Arrows", "Silence через Gust"],
cons: ["Очень хрупкая", "Слабая в ближнем бою", "Слаб без позиции"],
items: ["Dragon Lance", "Manta Style", "BKB", "Hurricane Pike", "Satanic"],
tips: "Марксманство — держи дистанцию. Gust против блинка и каста. Стафф через позицию.",
counters: ["Storm Spirit", "Anti-Mage", "Slark"],
synergies: ["Vengeful Spirit", "Crystal Maiden", "Dazzle"]
},
"Sniper": {
ru: ["снайпер", "снайп"], role: "Керри · Pos 1/2", lane: "Мид / Сэйф",
pros: ["Максимальная дальность атаки", "Headshot", "Shrapnel пушит"],
cons: ["Очень хрупкий", "Нет эскейпа", "Слаб против ганков"],
items: ["Dragon Lance", "Manta", "BKB", "Hurricane Pike", "Butterfly"],
tips: "Shrapnel для фарма и хараса. Take Aim на +400. Позиционируйся ЗА спинами тиммейтов.",
counters: ["Spirit Breaker", "Storm Spirit", "Clockwerk"],
synergies: ["Vengeful Spirit", "Drow Ranger", "Crystal Maiden"]
},
"Morphling": {
ru: ["морф"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
pros: ["Гибкость морф-статов", "Waveform — эскейп", "Adaptive Strike бурст"],
cons: ["Сложный", "Зависит от маны", "Слаб до 6-го"],
items: ["Ethereal Blade", "Linken's Sphere", "Eye of Skadi", "Satanic", "Manta"],
tips: "Морфай Agi для урона, Str для выживания. Waveform — эскейп. Morph Replicate — второй шанс.",
counters: ["Ancient Apparition", "Doom", "Nyx Assassin"],
synergies: ["Dazzle", "Oracle", "Io"]
},
"Lifestealer": {
ru: ["лайфстил", "ls"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
pros: ["Хилится с атаки", "Rage — иммунитет к магии", "Open Wounds крадёт HP"],
cons: ["Слаб против китов", "Простой", "Уязвим к физ-урону"],
items: ["Armlet", "Desolator", "Basher", "Abyssal Blade", "Satanic"],
tips: "Rage — сайленс и иммунитет. Armlet + Feasts — синергия. Infest в союзника для эскейпа.",
counters: ["Bristleback", "Timbersaw", "Axe"],
synergies: ["Magnus", "Io", "Dark Seer"]
},
"Axe": {
ru: ["акс"], role: "Оффлейн · Pos 3", lane: "Хард",
pros: ["Berserker's Call — AoE-стан", "Culling Blade — казнь", "Counter Helix AoE"],
cons: ["Зависит от Blink", "Уязвим к сайленсу", "Слаб против мобильных"],
items: ["Blink Dagger", "Blade Mail", "Vanguard", "Crimson Guard", "Heart of Tarrasque"],
tips: "Blink + Call + Blade Mail — классика. Culling Blade перезаряжается при килле. Counter Helix работает при атаках.",
counters: ["Timbersaw", "Bristleback", "Void Spirit"],
synergies: ["Dazzle", "Oracle", "Warlock"]
},
"Magnus": {
ru: ["магнус", "маг"], role: "Оффлейн · Pos 3/4", lane: "Хард",
pros: ["Reverse Polarity — лучший тимфайт-стан", "Empower", "Skewer затягивает"],
cons: ["Зависит от ульты", "Слаб без Blink", "Падает в позднем"],
items: ["Blink Dagger", "Refresher", "Aghanim's Scepter", "Black King Bar", "Shard"],
tips: "Blink + Reverse Polarity — залог победы. Skewer затягивает врагов. Empower на керри.",
counters: ["Silencer", "Rubick", "Doom"],
synergies: ["Shadow Fiend", "Juggernaut", "Phantom Assassin"]
},
"Rubick": {
ru: ["рубик"], role: "Сапорт · Pos 4/5", lane: "Роум",
pros: ["Крадёт способности", "Fade Bolt снижает урон", "Telekinesis — контроль"],
cons: ["Зависит от врагов", "Хрупкий", "Слабый фарм"],
items: ["Aether Lens", "Blink Dagger", "Force Staff", "Aghanim's Scepter", "Glimmer Cape"],
tips: "Краденные ульты решают. Fade Bolt для затягивания. Позиция — за спиной.",
counters: ["Doom", "Silencer", "Bloodseeker"],
synergies: ["Magnus", "Tidehunter", "Enigma"]
},
"Tidehunter": {
ru: ["тайдер", "tide"], role: "Оффлейн · Pos 3", lane: "Хард",
pros: ["Ravage — огромный AoE-стан", "Очень танковый", "Anchor Smash"],
cons: ["Зависит от ульты", "Медленный", "Плохо фармит в раннем"],
items: ["Blink Dagger", "Refresher", "Pipe of Insight", "Shiva's Guard", "Heart"],
tips: "Blink + Ravage — классика. Kraken Shell снимает дебаффы. Refresher для двойной ульты.",
counters: ["Rubick", "Silencer", "Doom"],
synergies: ["Magnus", "Crystal Maiden", "Shadow Fiend"]
},
"Wraith King": {
ru: ["лк", "ренджи"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
pros: ["Реинкарнация", "Skeletons пушат", "Танковый керри"],
cons: ["Слабый бурст", "Нет эскейпа", "Медленный фарм"],
items: ["Radiance", "Armlet", "Blink Dagger", "Black King Bar", "Assault Cuirass"],
tips: "Skeletons пушат и фармят. Reincarnation откатывается после фарма. Скелеты с Shard — армия.",
counters: ["Anti-Mage", "Diffusal Blade", "Invoker"],
synergies: ["Dazzle", "Crystal Maiden", "Magnus"]
},
"Sven": {
ru: ["свен"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
pros: ["Огромный урон с God's Strength", "Storm Hammer AoE-стан", "Быстрый фарм с Cleave"],
cons: ["Простой", "Слаб против БКБ", "Медленный без ульты"],
items: ["Blink Dagger", "Black King Bar", "Echo Sabre", "Daedalus", "Assault Cuirass"],
tips: "Blink + Storm Hammer + God's Strength — залп. Cleave фармит лес. BKB обязателен.",
counters: ["Anti-Mage", "Slark", "Storm Spirit"],
synergies: ["Magnus", "Crystal Maiden", "Dazzle"]
},
"Medusa": {
ru: ["медуза", "дуза"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
pros: ["Огромный пул HP через ману", "Split Shot AoE", "Stone Gaze — массовый контроль"],
cons: ["Очень медленный старт", "Нужен фарм 40+ мин", "Уязвима к мана-жгучкам"],
items: ["Manta", "Skadi", "BKB", "Butterfly", "Divine Rapier"],
tips: "Mana Shield жрёт ману вместо HP. Stone Gaze — против физики. Farm safe, не подставляйся.",
counters: ["Anti-Mage", "Diffusal Blade", "Invoker"],
synergies: ["Dazzle", "Oracle", "Crystal Maiden"]
},
"Faceless Void": {
ru: ["войд"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
pros: ["Chronosphere — лучший тимфайт-стан", "Time Walk откат урона", "Хороший поздний"],
cons: ["Слабый ранний", "Зависит от ульты", "Нужен BKB"],
items: ["Mask of Madness", "Manta", "Black King Bar", "Refresher", "Butterfly"],
tips: "Time Walk откатывает урон за 2 сек. Chrono ловит и союзников. Time Lock — bash.",
counters: ["Silencer", "Doom", "Rubick"],
synergies: ["Magnus", "Crystal Maiden", "Warlock"]
},
"Ember Spirit": {
ru: ["эмбер"], role: "Мид · Pos 2", lane: "Мид",
pros: ["Sleight of Fist с Battle Fury", "Fire Remnant — мобильность", "Searing Chains — сайленс"],
cons: ["Сложный", "Хрупкий", "Зависит от позиции"],
items: ["Battle Fury", "Maelstrom", "Blink Dagger", "Black King Bar", "Radiance"],
tips: "Fire Remnant — 3 заряда для эскейпа. Sleight of Fist с Battle Fury — комбо. Searing Chains связывает.",
counters: ["Nyx Assassin", "Storm Spirit", "Anti-Mage"],
synergies: ["Magnus", "Dark Seer", "Enigma"]
},
"Queen of Pain": {
ru: ["квопа", "королева"], role: "Мид · Pos 2", lane: "Мид",
pros: ["Мобильность с Blink", "AoE урон", "Sonic Wave — большой урон"],
cons: ["Хрупкая", "Зависит от маны", "Слаб против сайленса"],
items: ["Kaya", "Sange", "Black King Bar", "Aghanim's Scepter", "Bloodstone"],
tips: "Blink для эскейпа и агрессии. Scream of Pain — фарм. Sonic Wave — через BKB.",
counters: ["Anti-Mage", "Nyx Assassin", "Doom"],
synergies: ["Magnus", "Crystal Maiden", "Shadow Demon"]
},
"Tinker": {
ru: ["тинкер"], role: "Мид · Pos 2", lane: "Мид",
pros: ["Rearm для повторного каста", "Топовый пущер", "March of the Machines фармит"],
cons: ["Маназависимый", "Очень хрупкий", "Нужны Boots of Travel"],
items: ["Boots of Travel", "Blink Dagger", "Aether Lens", "Shiva's Guard", "Black King Bar"],
tips: "Rearm восстанавливает способности и предметы. Blink + March для фарма. Laser ослепляет.",
counters: ["Storm Spirit", "Anti-Mage", "Nyx Assassin"],
synergies: ["Magnus", "Dark Seer", "Enigma"]
},
"Zeus": {
ru: ["зевс"], role: "Мид · Pos 2", lane: "Мид",
pros: ["Глобальный урон через Thundergod's Wrath", "Скайт-демаг", "Проверка вардов"],
cons: ["Хрупкий", "Нет эскейпа", "Слаб в позднем гейме"],
items: ["Aether Lens", "Blink Dagger", "Aghanim's Scepter", "Octarine Core", "Bloodstone"],
tips: "Thundergod's Wrath даёт вижен и урон по всем. Lightning Bolt проверяет фог. Проверяй руны ультой.",
counters: ["Anti-Mage", "Storm Spirit", "Puck"],
synergies: ["Magnus", "Crystal Maiden", "Shadow Demon"]
}
};

/* Расширенная база предметов */
var KB_ITEMS = {
"Black King Bar": {
ru: ["бкб", "блек кинг бар", "bkb"], cost: 4050,
desc: "Даёт иммунитет к большинству магических способностей.",
when: "Против маго-контроля и бурста. Обязателен для керри и инициаторов.",
tip: "После 10 сек использования становится 5 сек. Синергия с Blink + инициация.",
category: "defense"
},
"Blink Dagger": {
ru: ["блинк", "блинк даггер", "blink"], cost: 2250,
desc: "Телепорт до 1200 юнитов в радиусе.",
when: "Инициаторам (Axe, Magnus, Tidehunter) и мобильным мидерам (Storm, Puck).",
tip: "Отключается при получении урона от врагов. Ставь блинк + ульта — сюрприз.",
category: "mobility"
},
"Aghanim's Scepter": {
ru: ["агс", "агханимы", "aghanim"], cost: 4200,
desc: "Улучшает ульту героя или даёт новую способность.",
when: "Когда апгрейд ульты критичен для стратегии.",
tip: "У разных героев разный эффект — проверь свой конкретный.",
category: "upgrade"
},
"Force Staff": {
ru: ["форс", "force staff"], cost: 2200,
desc: "Толкает юнита на 600 юнитов.",
when: "Против Melee-керри, для спасения союзников, против Clockwerk.",
tip: "Можно толкать врагов через скалы. Комбо с Blink.",
category: "utility"
},
"Glimmer Cape": {
ru: ["глиммер", "glitter"], cost: 1950,
desc: "Даёт союзнику невидимость и магрезист.",
when: "Против маго-урона. Спасение союзников от фокуса.",
tip: "При использовании на себя — невидимость 5 сек. Осторожно против дастбластера.",
category: "defense"
},
"Scythe of Vyse": {
ru: ["хекс", "сайф", "scythe"], cost: 5675,
desc: "Превращает врага в овцу на 3.5 сек.",
when: "Против мобильных керри (Anti-Mage, Storm).",
tip: "Хекс не отключает пассивки. Комбо с бурст-героями.",
category: "control"
},
"Eul's Scepter": {
ru: ["эул", "euls"], cost: 2575,
desc: "Поднимает врага в воздух на 2.5 сек.",
when: "Для сетапа, спасения, диспела.",
tip: "Снимает сайленс. Комбо с Sunstrike, Meteor.",
category: "control"
},
"Shiva's Guard": {
ru: ["шива", "shiva"], cost: 4850,
desc: "Замедляет и наносит урон вокруг себя.",
when: "Против физ-керри, AoE-замедление.",
tip: "Аура -attack speed. Не отключается при стане.",
category: "defense"
},
"Heart of Tarrasque": {
ru: ["харт", "heart"], cost: 5000,
desc: "+45 Strength, регенерация 1.6% HP/сек вне боя.",
when: "Танкам и керри для выживания.",
tip: "Комбо с Medusa через Mana Shield.",
category: "defense"
},
"Radiance": {
ru: ["радик", "radiance"], cost: 5150,
desc: "AoE-урон по всем врагам + miss chance.",
when: "Фарм-керри (WK, Spectre) и оффлейнерам (Underlord).",
tip: "Синергия с Battle Fury у Spectre.",
category: "farming"
},
"Battle Fury": {
ru: ["бф", "батл фури"], cost: 4100,
desc: "Cleave 35% + регенерация HP/маны.",
when: "Melee-керри для фарма и пуша (Juggernaut, AM, PA).",
tip: "Ускоряет фарм в 2 раза. Комбо с Ember Spirit через Sleight.",
category: "farming"
},
"Diffusal Blade": {
ru: ["дифуза", "diffusal"], cost: 2500,
desc: "Сжигает ману при атаке, замедляет.",
when: "Против маго-зависимых героев и для сайленса.",
tip: "Полностью сжигает ману Medusa. Активируется на себя для диспела.",
category: "utility"
},
"Manta Style": {
ru: ["манта", "manta"], cost: 4750,
desc: "Создаёт 2 иллюзии. Снимает дебаффы.",
when: "Керри для диспела и пуша.",
tip: "Комбо с Diffusal — иллюзии жгут ману. Снимает сайленс.",
category: "utility"
},
"Abyssal Blade": {
ru: ["абик", "абуссал", "abyssal"], cost: 6400,
desc: "Активный баш через BKB (2 сек).",
when: "Против керри в позднем гейме.",
tip: "Единственный баш, пробивающий BKB. Комбо с Blink.",
category: "control"
},
"Linken's Sphere": {
ru: ["линка", "linkens"], cost: 4800,
desc: "Блокирует 1 таргет-спелл раз в 14 сек.",
when: "Против Doom, Legion, Bane, Batrider.",
tip: "Не блокирует AoE-спеллы. Пассивный эффект.",
category: "defense"
},
"Aeon Disk": {
ru: ["аеон", "aeon"], cost: 3000,
desc: "При HP < 70% даёт неуязвимость 2.5 сек.",
when: "Саппортам против бурста.",
tip: "Идеально для Rubick, Warlock. Откат 105 сек.",
category: "defense"
},
"Spirit Vessel": {
ru: ["вессел", "спирит вессел"], cost: 2780,
desc: "Накладывает -HP реген и урон по HP.",
when: "Против Alchemist, Morphling, Huskar.",
tip: "Отключает хил союзников. Обязателен против хила.",
category: "utility"
},
"Hood of Defiance": {
ru: ["худ", "hood"], cost: 1750,
desc: "Магрезист + барьер против магии.",
when: "Против маго-мидеров.",
tip: "Раскатывается в Pipe of Insight для команды.",
category: "defense"
},
"Pipe of Insight": {
ru: ["пайп", "pipe"], cost: 3725,
desc: "Командный магрезист-щит.",
when: "Против AoE-магии по команде.",
tip: "Актив на всю команду. Комбо с Tidehunter ульты.",
category: "defense"
},
"Blade Mail": {
ru: ["блейд мейл", "bm", "блейдмейл"], cost: 2275,
desc: "Отражает 85% полученного урона.",
when: "Против высокого бурста (PA, Juggernaut).",
tip: "Активируй ПЕРЕД тем как влететь. Отключает кастера.",
category: "defense"
},
"Echo Sabre": {
ru: ["эхо", "echo sabre"], cost: 2500,
desc: "Двойная атака + замедление.",
when: "Melee-керри для бурста (Tiny, Sven, Slark).",
tip: "Комбо с Shadow Blade для burst-комбо.",
category: "offense"
},
"Shadow Blade": {
ru: ["шадоу блейд", "shadow blade"], cost: 3000,
desc: "Невидимость + бонусный урон из инвиза.",
when: "Для ганков и эскейпа.",
tip: "Раскатывается в Silver Edge для Break-эффекта.",
category: "mobility"
},
"Silver Edge": {
ru: ["сильвер", "silver edge"], cost: 5450,
desc: "Невидимость + Break (отключает пассивки).",
when: "Против Bristleback, PA, Spectre, Medusa.",
tip: "Break — единственный способ отключить пассивки.",
category: "offense"
},
"Bloodstone": {
ru: ["бладстоун", "bloodstone"], cost: 4900,
desc: "Мана-реген + Spell Lifesteal.",
when: "Маназависимым героям (Storm, Ember, QoP).",
tip: "Актив: жертвует HP для маны. Комбо с Hydra's Breath.",
category: "magic"
},
"Hydra's Breath": {
ru: ["гидра", "hydra"], cost: 5990,
desc: "DoT-урон по HP + Spell Lifesteal synergy.",
when: "Sniper, Drow, Arc Warden, Ember Spirit.",
tip: "DoT лечится через Spell Lifesteal (с Bloodstone).",
category: "offense"
},
"Essence Distiller": {
ru: ["дистиллер", "distiller"], cost: 0,
desc: "Улучшение Urn of Shadows — заряды независимы.",
when: "На 4-й позиции для командного хила.",
tip: "Все 3 Urn в команде — мощная стратегия.",
category: "utility"
},
"Moon Shard": {
ru: ["мун шард", "moon shard"], cost: 4000,
desc: "Аура +attack speed для команды.",
when: "На керри в лейте (Techies, Sniper, Drow).",
tip: "Можно съесть для постоянного бонуса +120 AS.",
category: "offense"
},
"Harpoon": {
ru: ["харпун", "harpoon"], cost: 0,
desc: "Улучшение Echo Sabre — притягивает врага.",
when: "Tiny, Sven для мобильности.",
tip: "Комбо: Shadow Blade → Harpoon → burst.",
category: "offense"
}
};

/* Расширенная база механик */
var KB_MECHANICS = {
"Ластхит": {
ru: ["ластхит", "ласт хит", "добивание"],
desc: "Добивание крипа для получения золота.",
tip: "Практикуй в демо-режиме. Цель: 50/10, 100/20 за первые 20 минут. Анимация атаки важнее урона.",
category: "farm"
},
"Денай": {
ru: ["денай", "deny"],
desc: "Убийство своего крипа для лишения врага золота и опыта.",
tip: "Делай при HP крипа < 50%. Ключевой навык для мид-лейна. Опыт всё равно даётся, но уменьшенный.",
category: "lane"
},
"Стакинг": {
ru: ["стак", "стакинг", "стакать"],
desc: "Агрить крипов на :53 каждой минуты для создания стака.",
tip: "Стак даёт больше золота и опыта. Древние стаки (Ancients) для керри с аое-фармом.",
category: "farm"
},
"Пуллинг": {
ru: ["пул", "пуллинг"],
desc: "Агрить нейтральных крипов на линию для помощи сэйф-лейнеру.",
tip: "Делай на :15 или :45. Пул даёт опыт саппорту и золото керри на линии.",
category: "lane"
},
"Харас": {
ru: ["харас", "harass"],
desc: "Нанесение урона врагу без цели убить, чтобы вытеснить с линии.",
tip: "Автоатаки по врагу при откате крипов. Следи за позицией — не подставляйся под крипов.",
category: "lane"
},
"Ганг": {
ru: ["ганг", "ганк", "gank"],
desc: "Неожиданное нападение с целью убийства.",
tip: "Используй смок-оф-дисит для обхода вардов. Тайминг — когда враг в неудобной позиции.",
category: "macro"
},
"Пуш линии": {
ru: ["пуш", "пушить", "push"],
desc: "Заставлять крипов атаковать башни.",
tip: "Пушить после убийства врага. Ставь варды перед пушем. Не пушить без ротации команды.",
category: "macro"
},
"Рошан": {
ru: ["рошан", "roshan"],
desc: "Нейтральный босс, дающий Aegis of the Immortal.",
tip: "Рошан респавнится через 8-11 минут. Aegis спасает от смерти один раз. Убивай после выигранного тимфайта.",
category: "objective"
},
"Руны": {
ru: ["руна", "руны", "rune"],
desc: "Бонус-руны на реке каждые 2 минуты (Bounty, Power).",
tip: "Power Rune на :00 и :02. Bounty Rune даёт золото всей команде. Руна Wisdom на :07.",
category: "objective"
},
"Крипы в лесу": {
ru: ["лес", "крипы", "нейтралы"],
desc: "Нейтральные крипы для фарма.",
tip: "Кемпинг варды — только на вражеской стороне. Не фарми где нет вижена.",
category: "farm"
},
"Тимфайт": {
ru: ["тимфайт", "teamfight", "файт"],
desc: "Массовое сражение команд.",
tip: "Инициация после ультов. Позиционирование за спиной. Не дерись без BKB.",
category: "combat"
},
"Тп": {
ru: ["тп", "телепорт", "tp"],
desc: "Телепортация к башне через свиток.",
tip: "Всегда носи 1-2 ТП. Кулдаун после смерти — сокращённый. Тп на ротацию — залог победы.",
category: "macro"
},
"Смок оф дисит": {
ru: ["смок", "smoke"],
desc: "Предмет для невидимой ротации команды.",
tip: "Используй в критичных точках. Смок + вард = ганг. Отключается при приближении к врагу.",
category: "macro"
},
"Экспект": {
ru: ["экспект", "ожидание", "позиция"],
desc: "Понимание где может быть враг.",
tip: "Смотри мини-карту каждые 2-3 сек. Отслеживай пропавших врагов.",
category: "macro"
},
"Варды": {
ru: ["вард", "вижен", "observer", "sentry"],
desc: "Обзор для команды и снятие вражеских вардов.",
tip: "Observer видят, Sentry — снимают. Держи вижен на рунах. Ставь вард перед пушем.",
category: "utility"
},
"Байбек": {
ru: ["байбек", "выкуп", "buyback"],
desc: "Мгновенное возрождение за золото.",
tip: "В раннем гейме (до 8 мин) недоступен. В позднем гейме может решить исход. Следи за кулдауном врагов.",
category: "macro"
},
"Глиф": {
ru: ["глиф", "glyph"],
desc: "Защита башен и крипов от урона.",
tip: "Отслеживай кулдаун (5 минут). Используй для защиты от пуш-состава врага.",
category: "defense"
},
"Тайминги башен": {
ru: ["тайминг башен", "снятие башен"],
desc: "Среднее время сноса башен.",
tip: "T1 — 7-12 мин, T2 — 15-25 мин, T3 — 25+ мин. T1 на лёгкой линии — самая важная цель.",
category: "macro"
}
};

/* ─── Утилиты поиска ─── */
function kbNorm(s) {
return String(s || "").toLowerCase().replace(/[^a-zа-яё0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}
function kbTokens(s) { return kbNorm(s).split(" ").filter(function (t) { return t.length >= 2; }); }
function kbScore(tokens, entry, canonical) {
var keys = [kbNorm(canonical)];
if (entry.ru) for (var i = 0; i < entry.ru.length; i++) keys.push(kbNorm(entry.ru[i]));
var score = 0;
for (var ti = 0; ti < tokens.length; ti++) {
var localBest = 0;
for (var ki = 0; ki < keys.length; ki++) {
if (keys[ki] === tokens[ti]) { localBest = Math.max(localBest, 3); continue; }
if (keys[ki].indexOf(tokens[ti]) >= 0 || tokens[ti].indexOf(keys[ki]) >= 0) localBest = Math.max(localBest, 1);
}
score += localBest;
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
function kbIntent(query) {
var q = kbNorm(query);
if (/\bпротив|counter|контр|противоядие/.test(q)) return "counter";
if (/\bпредмет|билд|собрать|сборка/.test(q)) return "items";
if (/\bкак играть|гайд|совет|подскаж|научи/.test(q)) return "guide";
if (/\bсинерг|союзник|комбо/.test(q)) return "synergy";
if (/\bтайминг|когда|время/.test(q)) return "timing";
return "info";
}
function kbAnswer(query) {
var match = kbSearch(query);
if (!match) {
return {
text: "Не нашёл в базе знаний.\n\n" +
"Могу рассказать про:\n" +
"• Героев — 25+ (Juggernaut, Pudge, Invoker, AM, PA, Slark, Storm, Tinker, Zeus, Lina, Drow, Sniper, Morphling, LS, Axe, Magnus, Rubick, Tidehunter, WK, Sven, Medusa, Void, Ember, QoP)\n" +
"• Предметы — 30+ (BKB, Blink, Aghs, Force, Glimmer, Hex, Eul's, Shiva, Heart, Radiance, BF, Diffusal, Manta, Abyssal, Linken, Aeon, Vessel, Hood, Pipe, Blade Mail, Echo, Shadow Blade, Silver Edge, Bloodstone, Hydra, Distiller, Moon Shard, Harpoon)\n" +
"• Механики — 20+ (ластхит, денай, стакинг, пуллинг, харас, ганг, пуш, Рошан, руны, тимфайт, ТП, смок, варды, байбек, глиф, тайминги башен)\n\n" +
"Пример: «как играть на пудже», «что делает BKB», «предметы на АМ», «контрпики на СФ».",
kind: "none"
};
}
var intent = kbIntent(query);
var e = match.entry, key = match.key;
var t = "";

if (match.kind === "hero") {
if (intent === "items" && e.items) {
t = "🎭 " + key + " — ключевые предметы:\n\n" + e.items.map(function (i) { return "• " + i; }).join("\n");
if (e.tips) t += "\n\n💡 " + e.tips;
return { kind: "hero", text: t, match: match };
}
if (intent === "counter" && e.counters) {
t = "⚔️ Контрпики на " + key + ":\n\n" + e.counters.map(function (c) { return "• " + c; }).join("\n");
if (e.cons) t += "\n\nСлабые стороны:\n" + e.cons.map(function (c) { return "• " + c; }).join("\n");
return { kind: "hero", text: t, match: match };
}
if (intent === "synergy" && e.synergies) {
t = "🤝 Синергии с " + key + ":\n\n" + e.synergies.map(function (s) { return "• " + s; }).join("\n");
if (e.tips) t += "\n\n💡 " + e.tips;
return { kind: "hero", text: t, match: match };
}
t = "🎭 " + key + " — " + (e.role || "?") + "\n📍 Линия: " + (e.lane || "?") + "\n\n";
if (e.pros) t += "✅ Плюсы:\n" + e.pros.map(function (p) { return "• " + p; }).join("\n") + "\n\n";
if (e.cons) t += "❌ Минусы:\n" + e.cons.map(function (c) { return "• " + c; }).join("\n") + "\n\n";
if (e.items) t += "🛡 Предметы: " + e.items.join(", ") + "\n\n";
if (e.counters) t += "⚔️ Контрпики: " + e.counters.join(", ") + "\n\n";
if (e.synergies) t += "🤝 Синергии: " + e.synergies.join(", ") + "\n\n";
if (e.tips) t += "💡 " + e.tips;
return { kind: "hero", text: t, match: match };
}
if (match.kind === "item") {
t = "🛡 " + key + (e.cost ? " · " + e.cost + "g" : "") + "\n\n";
if (e.desc) t += "📖 " + e.desc + "\n\n";
if (e.when) t += "🎯 Когда: " + e.when + "\n\n";
if (e.tip) t += "💡 " + e.tip;
return { kind: "item", text: t, match: match };
}
if (match.kind === "mechanic") {
t = "🎓 " + key + "\n\n";
if (e.desc) t += "📖 " + e.desc + "\n\n";
if (e.tip) t += "💡 " + e.tip;
return { kind: "mechanic", text: t, match: match };
}
return { kind: "none", text: "Что-то пошло не так." };
}