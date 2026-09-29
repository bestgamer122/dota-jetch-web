/* DOTA JETCH — BRAIN LANG v1.0 */

var BrainLang = {
  detect: function (text) {
    var s = String(text || "");
    if (!s) return "unknown";
    var ru = (s.match(/[а-яё]/gi) || []).length;
    var en = (s.match(/[a-z]/gi) || []).length;
    if (ru > en) return "ru";
    if (en > ru) return "en";
    return "unknown";
  },

  isRussian: function (text) { return this.detect(text) === "ru"; },

  en: {
    greeting: ["Hi! How can I help?", "Hello! What's up?", "Hey! Ask me anything."],
    thanks: ["You're welcome!", "Glad to help!", "No problem :)"],
    who: ["I'm DotaJetch AI — a local AI assistant. I know Dota 2, understand emotions, learn from mistakes."],
    bye: ["Bye! Come back soon.", "See you!", "Take care!"]
  },

  translate: function (text, lang) {
    if (lang !== "en") return text;
    var map = {
      "Привет! Чем помочь?": "Hi! How can I help?",
      "Здравствуй! Спрашивай.": "Hello! Ask me anything.",
      "Рад помочь!": "Glad to help!",
      "Пожалуйста!": "You're welcome!",
      "Пока! Заходи ещё.": "Bye! Come back soon."
    };
    return map[text] || text;
  }
};
