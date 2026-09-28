/* DOTA JETCH — KNOWLEDGE v3.4.0 */

var KB_HEROES = {
  "Juggernaut": { ru: ["джаггернаут","жугер","jug"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Сильный харас","Неуязвимость в Omnislash","Healing Ward"],
    cons: ["Слаб без BKB","Уязвим к контролю"],
    items: ["Battle Fury","Manta Style","Abyssal Blade"],
    tips: "Blade Fury — эскейп. Omnislash сильнее с Manta." },
  "Pudge": { ru: ["пудж"], role: "Роум · Pos 4", lane: "Любая",
    pros: ["Hook — пик-офф","Много HP","Rot полезен"],
    cons: ["Промазал Hook — бесполезен","Медленный"],
    items: ["Blink Dagger","Aghanim's Scepter","Force Staff"],
    tips: "Blink + Hook — комбо. Rot не отключается при атаке." },
  "Invoker": { ru: ["инвокер","вока"], role: "Мид · Pos 2", lane: "Мид",
    pros: ["10 способностей","Гибкость","Бурст-урон"],
    cons: ["Сложный","Зависит от выучки"],
    items: ["Aghanim's Scepter","Octarine Core","Blink Dagger"],
    tips: "Комбо: Eul → Sunstrike + Meteor + Deafening Blast." },
  "Anti-Mage": { ru: ["ам","антимаг"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Сжигает ману","Мобильный фармер"],
    cons: ["Слабый на линии","Нужен фарм 25 мин"],
    items: ["Battle Fury","Manta Style","Abyssal Blade"],
    tips: "Blink для эскейпа. Counterspell отражает таргет-спеллы." },
  "Phantom Assassin": { ru: ["па","фантомка"], role: "Керри · Pos 1", lane: "Сэйф-лейн",
    pros: ["Coup de Grace криты","Мобильность"],
    cons: ["Хрупкая","Зависит от критов"],
    items: ["Battle Fury","Desolator","Black King Bar"],
    tips: "Blur даёт уклонение. BKB обязателен к 20-й минуте." },
  "Pudge":{"ru":["пудж"]} };

var KB_ITEMS = {
  "Black King Bar": { ru: ["бкб","bkb"], cost: 4050,
    desc: "Даёт иммунитет к большинству магических способностей.",
    when: "Против маго-контроля и бурста.",
    tip: "После 10 сек использования — 5 сек. Синергия с Blink." },
  "Blink Dagger": { ru: ["блинк"], cost: 2250,
    desc: "Телепорт до 1200 юнитов.",
    when: "Инициаторам и мобильным мидерам.",
    tip: "Отключается при уроне от врагов." },
  "Aghanim's Scepter": { ru: ["агс","агханимы"], cost: 4200,
    desc: "Улучшает ульту героя.",
    when: "Когда апгрейд ульты критичен." },
  "Force Staff": { ru: ["форс"], cost: 2200,
    desc: "Толкает юнита на 600 юнитов.",
    when: "Против Melee-керри, для спасения союзников." },
  "Glimmer Cape": { ru: ["глиммер"], cost: 1950,
    desc: "Даёт союзнику невидимость и магрезист.",
    when: "Против маго-урона." },
  "Scythe of Vyse": { ru: ["хекс"], cost: 5675,
    desc: "Превращает врага в овцу на 3.5 сек.",
    when: "Против мобильных керри." },
  "Eul's Scepter": { ru: ["эул"], cost: 2575,
    desc: "Поднимает врага в воздух на 2.5 сек.",
    when: "Для сетапа и диспела." },
  "Manta Style": { ru: ["манта"], cost: 4750,
    desc: "Создаёт 2 иллюзии. Снимает дебаффы.",
    when: "Керри для диспела." },
  "Diffusal Blade": { ru: ["дифуза"], cost: 2500,
    desc: "Сжигает ману при атаке.",
    when: "Против маго-зависимых героев." }
};

var KB_MECHANICS = {
  "Ластхит": { ru: ["ластхит","добивание"],
    desc: "Добивание крипа для получения золота.",
    tip: "Цель: 50/10 за первые 10 минут." },
  "Денай": { ru: ["денай"],
    desc: "Убийство своего крипа для лишения врага золота.",
    tip: "Делай при HP крипа < 50%." },
  "Стакинг": { ru: ["стак","стакать"],
    desc: "Агрить крипов на :53 каждой минуты.",
    tip: "Стак даёт больше золота и опыта." },
  "Пуллинг": { ru: ["пул","пуллинг"],
    desc: "Агрить нейтральных крипов на линию.",
    tip: "Делай на :15 или :45." },
  "Харас": { ru: ["харас"],
    desc: "Нанесение урона врагу для вытеснения с линии." },
  "Ганг": { ru: ["ганг","ганк"],
    desc: "Неожиданное нападение с целью убийства.",
    tip: "Используй смок для обхода вардов." },
  "Рошан": { ru: ["рошан"],
    desc: "Нейтральный босс, дающий Aegis.",
    tip: "Респавнится через 8-11 мин." },
  "Руны": { ru: ["руна","руны"],
    desc: "Бонус-руны на реке каждые 2 минуты." },
  "Тимфайт": { ru: ["тимфайт","файт"],
    desc: "Массовое сражение команд." },
  "Тп": { ru: ["тп","телепорт"],
    desc: "Телепортация через свиток.",
    tip: "Всегда носи 1-2 ТП." },
  "Смок": { ru: ["смок"],
    desc: "Предмет для невидимой ротации команды." },
  "Варды": { ru: ["вард","вижен"],
    desc: "Обзор для команды и снятие вражеских вардов." }
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
  if (/\bпротив|counter|контр/.test(q)) return "counter";
  if (/\bпредмет|билд|собрать/.test(q)) return "items";
  if (/\bкак играть|гайд|совет/.test(q)) return "guide";
  return "info";
}
function kbAnswer(query) {
  var match = kbSearch(query);
  if (!match) {
    return { text: "Не нашёл в базе знаний.\n\nМогу рассказать про героев (Juggernaut, Pudge, Invoker, AM, PA), предметы (BKB, Blink, Aghs, Force, Glimmer, Hex, Eul's, Manta, Diffusal), механики (ластхит, денай, стакинг, пуллинг, харас, ганг, Рошан, руны, тимфайт, ТП, смок, варды).", kind: "none" };
  }
  var e = match.entry, key = match.key;
  var t = "";
  if (match.kind === "hero") {
    t = "🎭 " + key + " — " + (e.role || "?") + "\nЛиния: " + (e.lane || "?") + "\n\n";
    if (e.pros) t += "Плюсы:\n" + e.pros.map(function (p) { return "• " + p; }).join("\n") + "\n\n";
    if (e.cons) t += "Минусы:\n" + e.cons.map(function (c) { return "• " + c; }).join("\n") + "\n\n";
    if (e.items) t += "Предметы: " + e.items.join(", ") + "\n\n";
    if (e.tips) t += "Совет: " + e.tips;
  } else if (match.kind === "item") {
    t = "🛡 " + key + (e.cost ? " · " + e.cost + "g" : "") + "\n\n";
    if (e.desc) t += e.desc + "\n\n";
    if (e.when) t += "Когда: " + e.when + "\n\n";
    if (e.tip) t += "Совет: " + e.tip;
  } else {
    t = "🎓 " + key + "\n\n" + (e.desc || "") + "\n\n" + (e.tip ? "Совет: " + e.tip : "");
  }
  return { kind: match.kind, text: t, match: match };
}