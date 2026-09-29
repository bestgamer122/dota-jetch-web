/* DOTA JETCH — BRAIN REASON v1.0 */

var BrainReason = {
  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (/^почему\s+/.test(s) || /объясни\s+почему/.test(s)) return "why";
    if (/^объясни\s+/.test(s) || /расскажи\s+почему/.test(s)) return "explain";
    if (/докажи|пруф|доказательств/.test(s)) return "prove";
    if (/а если|а что если|что было бы|гипотетич/.test(s)) return "hypothetical";
    return null;
  },
  extractTopic: function (q) {
    var s = String(q || "").trim();
    var m = s.match(/^(?:почему|объясни(?:\s+почему)?|расскажи\s+почему|докажи)\s+(.+?)\??$/i);
    if (m) return m[1].trim();
    m = s.match(/(?:а что если|что было бы если)\s+(.+?)\??$/i);
    if (m) return m[1].trim();
    return null;
  },
  why: function (topic) {
    if (!topic) return null;
    var low = topic.toLowerCase();
    if (typeof KB_HEROES !== "undefined") {
      for (var hero in KB_HEROES) {
        if (low.indexOf(hero.toLowerCase()) >= 0 || (KB_HEROES[hero].ru && KB_HEROES[hero].ru.some(function (a) { return low.indexOf(a) >= 0; }))) {
          var h = KB_HEROES[hero];
          var parts = [];
          if (h.role) parts.push("🎯 Роль: " + h.role);
          if (h.pros && h.pros.length) parts.push("\n✅ Сильные стороны:\n" + h.pros.map(function (p) { return "• " + p; }).join("\n"));
          if (h.cons && h.cons.length) parts.push("\n⚠️ Слабые стороны:\n" + h.cons.map(function (c) { return "• " + c; }).join("\n"));
          if (h.tips) parts.push("\n💡 " + h.tips);
          return "Разберём " + hero + ":\n\n" + parts.join("\n") + "\n\n_Вывод:_ " + hero + " эффективен на своей роли, но требует внимания к слабостям.";
        }
      }
    }
    if (low.indexOf("небо") >= 0 && low.indexOf("голуб") >= 0) {
      return "Небо голубое из-за рассеивания Рэлея.\n\nСолнечный свет состоит из всех цветов. Когда он проходит через атмосферу, короткие волны (синие) рассеиваются сильнее длинных (красных). Поэтому мы видим синий цвет — а на закате, когда свет идёт под углом, видим красный.";
    }
    if (low.indexOf("вода") >= 0 && low.indexOf("мокрая") >= 0) {
      return "Вода не «мокрая» сама по себе — «мокрота» это ощущение, когда жидкость на поверхности.\n\nВода делает вещи мокрыми, потому что смачивает их. Мокнуть — это свойство объекта в контакте с жидкостью, а не самой жидкости.";
    }
    return "Хороший вопрос.\n\nЯ знаю про эту тему, но не уверен в деталях. Давай разберём вместе:\n• Что именно тебя интересует?\n• Какой контекст?\n\nТак я смогу ответить точнее.";
  },
  compare: function (topic) {
    if (!topic) return null;
    var m = String(topic).match(/^(.+?)\s+(?:лучше|хуже|сильнее|слабее)\s+(.+?)$/i);
    if (!m) return null;
    var a = m[1].trim(), b = m[2].trim();
    return "Сравниваю «" + a + "» и «" + b + "»:\n\n• **" + a + "** — зависит от контекста и роли\n• **" + b + "** — так же зависит от контекста\n\nКонкретный ответ требует уточнения: в какой ситуации?";
  },
  hypothetical: function (topic) {
    if (!topic) return null;
    return "Интересный гипотетический вопрос.\n\nРазберём:\n• Предпосылка: " + topic + "\n• Возможный результат: зависит от контекста\n• Что может пойти не так: сложно предсказать\n\nВ реальной жизни такие вопросы часто решаются опытным путём.";
  },
  answer: function (kind, topic) {
    if (kind === "why") return this.why(topic);
    if (kind === "explain") return this.why(topic);
    if (kind === "prove") return this.why(topic);
    if (kind === "hypothetical") return this.hypothetical(topic);
    return null;
  }
};