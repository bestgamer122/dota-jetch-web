/* DOTA JETCH — BRAIN FEEDBACK v1.0 */

var BrainFeedback = {
  key: "brainfeedback",
  maxHistory: 50,

  load: function () {
    var h = Store.get(this.key, null);
    if (!h || typeof h !== "object") h = { good: [], bad: [], history: [] };
    if (!Array.isArray(h.good)) h.good = [];
    if (!Array.isArray(h.bad)) h.bad = [];
    if (!Array.isArray(h.history)) h.history = [];
    return h;
  },

  save: function (h) {
    if (h.history.length > this.maxHistory) h.history = h.history.slice(-this.maxHistory);
    Store.set(this.key, h);
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase().trim();
    if (!s) return null;
    if (s === "правильно" || s === "верно" || s === "точно" || s === "да" || s === "yes" || s === "ок" || s === "хорошо") return "good";
    if (s === "не то" || s === "неправильно" || s === "неверно" || s === "нет" || s === "no" || s === "плохо" || s === "ошибка") return "bad";
    return null;
  },

  respond: function (kind) {
    var h = this.load();
    var last = h.history.length ? h.history[h.history.length - 1] : null;
    if (kind === "good") {
      if (last) {
        last.score = "good";
        this.save(h);
      }
      return this.pick(["Отлично, запомнил!", "Спасибо, учту!", "Рад, что помог!", "Понял, буду так отвечать чаще."]);
    }
    if (kind === "bad") {
      if (last) {
        last.score = "bad";
        this.save(h);
      }
      return this.pick(["Понял, исправлюсь.", "Учту, спасибо за фидбек.", "Понял, буду знать.", "Извини, запомню правильный вариант."]);
    }
    return "";
  },

  pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; },

  stats: function () {
    var h = this.load();
    var good = 0, bad = 0;
    for (var i = 0; i < h.history.length; i++) {
      if (h.history[i].score === "good") good++;
      if (h.history[i].score === "bad") bad++;
    }
    var total = good + bad;
    var pct = total ? Math.round(good / total * 100) : 0;
    return "📊 Фидбек:\n\n• Всего оценок: " + total + "\n• Положительных: " + good + "\n• Отрицательных: " + bad + "\n• Точность: " + pct + "%";
  },

  clear: function () { Store.set(this.key, null); }
};
