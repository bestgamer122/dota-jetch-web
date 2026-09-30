/* DOTA JETCH — BRAIN META v1.0 */

var BrainMeta = {
  VERSION: "2.0",
  CREATED: "2026",

  modules: [
    { name: "brain-core", desc: "База: приветствия, кто ты, помощь" },
    { name: "brain-learn", desc: "Выученные факты от пользователя" },
    { name: "brain-user", desc: "Профиль пользователя" },
    { name: "brain-personality", desc: "Настроение и стиль" },
    { name: "brain-variation", desc: "Защита от повторов" },
    { name: "brain-suggest", desc: "Подсказки следующих вопросов" },
    { name: "brain-lang", desc: "Определение языка" },
    { name: "brain-reason", desc: "Логические выводы" },
    { name: "brain-infer", desc: "Авто-выводы из профиля" },
    { name: "brain-graph", desc: "Граф связей героев" },
    { name: "brain-memory-long", desc: "Долгосрочная память" },
    { name: "brain-think", desc: "Ядро: анализ запроса" },
    { name: "brain-chain", desc: "Цепочки рассуждений" },
    { name: "brain-emotion", desc: "Эмоции пользователя" },
    { name: "brain-feedback", desc: "Обработка фидбека" },
    { name: "brain-selfcheck", desc: "Самопроверка" },
    { name: "brain-shared-memory", desc: "Общая память чат+анализ" },
    { name: "brain-reason-v2", desc: "Улучшенные выводы" },
    { name: "brain-learning", desc: "Обучаемая память" },
    { name: "brain-predictor", desc: "Прогноз матча и совет" },
    { name: "brain-insights", desc: "Долгосрочные выводы" },
    { name: "brain-universal", desc: "Отвечает на всё" },
    { name: "brain-autolearner", desc: "Статистика точности" },
    { name: "brain-chain-v2", desc: "Многошаговые рассуждения" },
    { name: "brain-match-review", desc: "Разбор матча в чате" },
    { name: "brain-meta", desc: "Самопонимание" },
    { name: "brain-mmr", desc: "Прогноз MMR" },
    { name: "brain-draft", desc: "Анализ драфта" },
    { name: "brain-heroes", desc: "127 героев Dota 2" },
    { name: "brain-builds", desc: "Рекомендации сборок" },
    { name: "brain-timings", desc: "Тайминги Dota 2" },
    { name: "brain-counters", desc: "Контрпики" },
    { name: "brain-prokasts", desc: "Прокасты героев" },
    { name: "brain-lanes", desc: "Гайд по лейнингу" },
    { name: "brain-items-full", desc: "Справочник предметов" },
    { name: "brain-situations", desc: "Гайд по ситуациям" },
    { name: "brain-mindset", desc: "Психология Dota" },
    { name: "brain-compare", desc: "Сравнение героев" },
    { name: "brain-rus", desc: "Сленг дотеров" }
  ],

  capabilities: [
    "Разбор Dota-матчей с оценкой S/A/B/C/D",
    "ИИ-анализ матча с рекомендациями",
    "Прогноз исхода следующего матча",
    "Совет героя под твой стиль",
    "Долгосрочный анализ по матчам",
    "Разбор последнего матча в чате",
    "Распознавание эмоций",
    "Шутки, поддержка, комплименты",
    "Запоминание фактов",
    "Обучение на исправлениях",
    "Сравнение героев и предметов",
    "Многошаговые рассуждения"
  ],

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("кто ты") >= 0 || s.indexOf("ты кто") >= 0 || s.indexOf("расскажи о себе") >= 0) return "about";
    if (s.indexOf("твоя версия") >= 0 || s.indexOf("какая версия") >= 0) return "version";
    if (s.indexOf("твои модули") >= 0 || s.indexOf("из чего ты сделан") >= 0) return "modules";
    if (s.indexOf("что ты умеешь") >= 0 || s.indexOf("твои возможности") >= 0) return "capabilities";
    if (s.indexOf("как ты работаешь") >= 0 || s.indexOf("как ты устроен") >= 0) return "howworks";
    if (s.indexOf("твоя статистика") >= 0) return "stats";
    if (s.indexOf("ты человек") >= 0 || s.indexOf("ты робот") >= 0) return "identity";
    if (s.indexOf("тебя создал") >= 0 || s.indexOf("кто тебя сделал") >= 0) return "creator";
    return null;
  },

  answer: function (k) {
    if (k === "about") return "🤖 Я **DOTA JETCH AI v" + this.VERSION + "** — локальный ИИ-ассистент для Dota 2.\n\nРаботаю прямо в браузере, состою из **" + this.modules.length + " модулей**.\n\n**Что умею:**\n• Разбирать матчи\n• Давать советы и прогнозы\n• Запоминать факты\n• Обучаться\n• Шутить\n\nСпроси «твои модули».";
    if (k === "version") return "📦 **Версия:** " + this.VERSION + "\n📅 Создан: " + this.CREATED + "\n🧠 Модулей: " + this.modules.length + "\n💾 Память: localStorage + Firebase";
    if (k === "modules") {
      var l = ["🧠 **" + this.modules.length + " модулей:**", ""];
      for (var i = 0; i < this.modules.length; i++) l.push("• **" + this.modules[i].name + "** — " + this.modules[i].desc);
      return l.join("\n");
    }
    if (k === "capabilities") {
      var l2 = ["🎯 **Что я умею:**", ""];
      for (var i = 0; i < this.capabilities.length; i++) l2.push("• " + this.capabilities[i]);
      return l2.join("\n");
    }
    if (k === "howworks") return "🔧 **Как работаю:**\n\n1. Ты задаёшь вопрос\n2. Модули сканируют\n3. Собираю кандидатов\n4. Применяю личность\n5. Проверяю себя\n6. Записываю в статистику\n\nВсё локально в браузере!";
    if (k === "stats") {
      var l3 = ["📊 **Статистика:**", ""];
      if (typeof BrainLearning !== "undefined") {
        var bd = BrainLearning.load();
        l3.push("Фактов выучено: " + (bd.stats.learnedFacts || 0));
        l3.push("Исправлений: " + (bd.stats.corrections || 0));
        l3.push("Вопросов: " + (bd.stats.totalQuestions || 0));
      }
      if (typeof BrainAutoLearner !== "undefined") {
        var ad = BrainAutoLearner.load();
        l3.push("Точность: " + (ad.accuracy || 0).toFixed(0) + "%");
      }
      return l3.join("\n");
    }
    if (k === "identity") return "🤖 Я программа, не человек. Но стараюсь общаться как живой собеседник.";
    if (k === "creator") return "🛠 Меня создал проект **DOTA JETCH**. Стек: HTML/CSS/JS, Firebase, OpenDota API, " + this.modules.length + " модулей ИИ.";
    return null;
  }
};
