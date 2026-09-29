/* DOTA JETCH — BRAIN MOOD v1.0 */

var BrainMood = {
  compliments: [
    "Ты молодец!", "У тебя отличный вкус на героев!", "Ты сегодня хорошо выглядишь (для человека в интернете).",
    "С тобой приятно общаться!", "Ты задаёшь умные вопросы — уважаю.",
    "У тебя хорошее чувство юмора, я заметил :)", "Ты явно разбираешься в Dota — респект."
  ],
  support: [
    "Всё будет хорошо. Загружай матч и посмотри, что можно было сделать лучше.",
    "Проигрыш — это опыт. Победителей не судят.", "Не расстраивайся. У каждого бывают плохие игры.",
    "Если тильтуешь — сделай перерыв. Помогает.", "Ты справишься. Я в тебя верю.",
    "После проигрыша главное — не играть на эмоциях. Дай себе 10 минут."
  ],
  motivation: [
    "MMR не главное. Главное — кайф от игры.", "Каждый матч — это практика. Даже проигранный.",
    "Играй на героях, которых любишь. Так лучше получается.", "Прогресс важнее рейтинга. Расти по чуть-чуть.",
    "Ты уже молодец, что анализируешь свои игры. Большинство так не делает."
  ],
  feelings: [
    "Всё отлично! Работаю в полную силу.", "Не жалуюсь. Готов помочь с чем угодно.",
    "Хорошо! Спасибо, что спросил.", "Настроение рабочее. Что нужно?",
    "У меня всё стабильно. А ты как?", "Как всегда — на позитиве!"
  ],
  getUserName: function () {
    var m = (typeof BrainLearn !== "undefined" ? BrainLearn.all() : []);
    for (var i = 0; i < m.length; i++) {
      var q = String(m[i].q || "").toLowerCase();
      if (/имя|звать|ник|name/.test(q)) return m[i].a;
    }
    return null;
  },
  greetByTime: function () {
    var h = new Date().getHours();
    var name = this.getUserName();
    var suffix = name ? ", " + name : "";
    if (h >= 5 && h < 12) return "Доброе утро" + suffix + "!";
    if (h >= 12 && h < 18) return "Добрый день" + suffix + "!";
    if (h >= 18 && h < 23) return "Добрый вечер" + suffix + "!";
    return "Доброй ночи" + suffix + "! Ты чего не спишь?";
  },
  detect: function (q) {
    var s = String(q || "").toLowerCase().trim();
    if (/^(комплимент|скажи комплимент|похвали меня|скажи что[- ]то приятное)/.test(s)) return "compliment";
    if (/поддержи меня|мне грустно|плохо игр|тильт|til|устал от доты|проиграл много/.test(s)) return "support";
    if (/мотивац|мотивируй|воодушеви|дай совет по игре/.test(s)) return "motivation";
    if (/^(как настроение|как ты себя|как сам|что нового)/.test(s)) return "feelings";
    if (/доброе утро|добрый день|добрый вечер|доброй ночи/.test(s)) return "timegreet";
    return null;
  },
  answer: function (kind) {
    if (kind === "compliment") return this.pick(this.compliments);
    if (kind === "support") return this.pick(this.support);
    if (kind === "motivation") return this.pick(this.motivation);
    if (kind === "feelings") return this.pick(this.feelings);
    if (kind === "timegreet") return this.greetByTime();
    return null;
  },
  pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; }
};