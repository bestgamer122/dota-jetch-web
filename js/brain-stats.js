/* DOTA JETCH — BRAIN STATS v1.0 */

var BrainStats = {
  user: function () {
    var sessions = Store.get("sessions", 0) || 0;
    var analyzed = Store.get("analyzedcount", 0) || 0;
    var questions = Store.get("aiquestions", 0) || 0;
    var diary = (Store.get("diarynotes", []) || []).length;
    var history = (Store.get("recentmatches", []) || []).length;
    var achievements = (Store.get("achievementsunlocked", []) || []).length;
    var streak = Store.get("dailystreak", 0) || 0;
    var learned = typeof BrainLearn !== "undefined" ? BrainLearn.count() : 0;
    return { sessions, analyzed, questions, diary, history, achievements, streak, learned };
  },
  userText: function () {
    var s = this.user();
    return "📊 Твоя статистика:\n\n• Сессий в приложении: " + s.sessions + "\n• Разобрано матчей: " + s.analyzed + "\n• Вопросов мне: " + s.questions + "\n• Записей в дневнике: " + s.diary + "\n• Матчей в истории: " + s.history + "\n• Достижений: " + s.achievements + " / 24\n• Дней подряд: " + s.streak + "\n• Фактов, которым ты меня научил: " + s.learned;
  },
  selfText: function () {
    var learned = typeof BrainLearn !== "undefined" ? BrainLearn.count() : 0;
    var questions = Store.get("aiquestions", 0) || 0;
    return "🤖 Обо мне:\n\n• Имя: DotaJetch AI\n• Версия: " + (typeof APP_VERSION !== "undefined" ? APP_VERSION : "?") + "\n• Работаю локально в браузере\n• Вопросов, на которые я ответил: " + questions + "\n• Фактов в моей памяти: " + learned + "\n• Умею: Dota 2, small talk, учиться от тебя\n• Моя цель: помочь с Dota и общением";
  },
  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (/мо[яи] статист|мо[йи] (сессии|анализ|матч|достижен|дневник|стрик)|покажи (мою )?статист|сколько у меня/.test(s)) return "user";
    if (/тво[яи] статист|расскажи о себе|что ты о себе|тво[йи] (возможност|версия|имя)|сколько тебе/.test(s)) return "self";
    return null;
  }
};