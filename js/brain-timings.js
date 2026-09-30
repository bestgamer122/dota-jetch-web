/* DOTA JETCH — BRAIN TIMINGS v1.0 */

var BrainTimings = {
  runes: [
    ["0:00","Bounty Rune"], ["3:00","Bounty Rune"], ["6:00","Bounty + Power"], ["7:00","Wisdom"],
    ["8:00","Power"], ["10:00","Power"], ["12:00","Bounty + Power"], ["14:00","Wisdom"],
    ["15:00","Power"], ["18:00","Bounty + Power"], ["20:00","Power"], ["21:00","Wisdom"],
    ["24:00","Bounty + Power"], ["28:00","Wisdom"]
  ],

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("когда стакать") >= 0 || s.indexOf("тайминг стак") >= 0 || s.indexOf("во сколько стакать") >= 0) return "stacks";
    if (s.indexOf("когда руны") >= 0 || s.indexOf("тайминг рун") >= 0 || s.indexOf("расписание рун") >= 0) return "runes";
    if (s.indexOf("когда рошан") >= 0 || s.indexOf("тайминг рошан") >= 0 || s.indexOf("респавн рошан") >= 0 || s.indexOf("роша когда") >= 0) return "roshan";
    if (s.indexOf("день ночь") >= 0 || s.indexOf("смена дня") >= 0 || s.indexOf("когда ночь") >= 0) return "daynight";
    if (s.indexOf("торментор") >= 0 || s.indexOf("tormentor") >= 0) return "tormentor";
    if (s.indexOf("когда нейтралы") >= 0 || s.indexOf("нейтральные предметы") >= 0) return "neutrals";
    if (s.indexOf("курс") >= 0 && (s.indexOf("когда") >= 0 || s.indexOf("апгрейд") >= 0)) return "courier";
    if (s.indexOf("все тайминги") >= 0 || s.indexOf("полный список") >= 0) return "all";
    if (s.indexOf("когда") >= 0 && s.indexOf("тайминг") >= 0) return "all";
    return null;
  },

  answer: function (k) {
    if (k === "stacks") return "⏱ **Тайминги стаков:**\n\n• Каждую минуту: **53-55 секунда**\n• Древние: 53-54 сек\n• Лёгкие: 55 сек\n• Сложные: 54 сек\n\n💡 Атакуй лагерь ровно в 53-й секунде.";
    if (k === "runes") {
      var l = ["⏱ **Расписание рун:**", ""];
      for (var i = 0; i < this.runes.length; i++) l.push("• **" + this.runes[i][0] + "** — " + this.runes[i][1]);
      return l.join("\n");
    }
    if (k === "roshan") return "🐲 **Рошан:**\n\n• Первый спавн: 0:00\n• Респавн: 8-11 мин\n• Aegis: 5 мин\n• Shard/Cheese: после 2-й смерти\n\n💡 Первый Рошан обычно после 15-20 мин. Sentry обязателен.";
    if (k === "daynight") return "🌗 **Смена дня/ночи:**\n\n• Цикл: **5 минут**\n• День: 0:00–5:00, 10:00–15:00...\n• Ночь: 5:00–10:00, 15:00–20:00...\n\n💡 Night Stalker сильнее ночью.";
    if (k === "tormentor") return "👹 **Tormentor:**\n\n• Первый спавн: **20:00**\n• Респавн: каждые 10 мин\n• Локация: между T2 башнями\n• Награда: Aghanim's Shard + ценный предмет";
    if (k === "neutrals") return "⚔ **Нейтральные предметы:**\n\n• Тир 1 (0:00)\n• Тир 2 (15:00)\n• Тир 3 (25:00)\n• Тир 4 (35:00)\n• Тир 5 (45:00)";
    if (k === "courier") return "🐴 **Курьер:**\n\n• Первый спавн: 0:00\n• Апгрейд: 3:00 (летающий)\n• Не забудь купить в начале";
    if (k === "all") return "⏱ **Все тайминги:**\n\n**Ключевые:**\n• 0:00 — Bounty + старт\n• 3:00 — Курьер апгрейд\n• 5:00 — Смена дня/ночи\n• 7:00 — Первая Wisdom\n• 15:00 — Нейтралы 2 тир\n• 20:00 — Первый Tormentor\n• 25:00 — Нейтралы 3 тир\n• 35:00 — Нейтралы 4 тир\n• 45:00 — Нейтралы 5 тир\n\n**💎 Руны:** 0:00, 3:00, 6:00, 7:00, 8:00, 10:00, 12:00, 14:00, 15:00, 18:00, 20:00, 21:00, 24:00, 28:00\n\n**🐲 Рошан:** респавн 8-11 мин\n**👹 Tormentor:** 20:00\n**🌗 День/ночь:** каждые 5 мин\n**⚔ Стаки:** 53-55 сек";
    return null;
  }
};
