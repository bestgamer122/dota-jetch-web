/* DOTA JETCH — BRAIN PERSONALITY v2.0 */

var BrainPersonality = {
  key: "brain_personality_v2",

  load: function () {
    var raw = Store.get(this.key, null);
    if (!raw || typeof raw !== "object") {
      raw = { mood: "friendly", energy: 100, jokes: 0, compliments: 0, lastMoodChange: 0, switchCount: 0, history: [] };
    }
    return raw;
  },

  save: function (p) { Store.set(this.key, p); },

  adapt: function (emotion) {
    var p = this.load();
    var now = Date.now();
    if (now - (p.lastMoodChange || 0) < 30000) return p.mood;
    var old = p.mood;
    var nm = old;
    if (emotion) {
      if (emotion.mood === "sad" || emotion.mood === "tired") { nm = "caring"; p.energy = Math.max(0, p.energy - 15); }
      else if (emotion.mood === "happy" || emotion.mood === "excited") { nm = "playful"; p.energy = Math.min(100, p.energy + 10); }
      else if (emotion.mood === "angry") { nm = "calm"; p.energy = Math.max(0, p.energy - 20); }
    } else {
      if (p.energy < 30) nm = "caring";
      else if (p.energy > 80) nm = "friendly";
      else nm = "neutral";
    }
    if (old !== nm) {
      p.mood = nm;
      p.lastMoodChange = now;
      p.switchCount = (p.switchCount || 0) + 1;
      p.history.push({ from: old, to: nm, ts: now });
      if (p.history.length > 20) p.history = p.history.slice(-20);
      this.save(p);
    }
    return p.mood;
  },

  current: function () { return this.load().mood; },
  energy: function () { return this.load().energy; },

  apply: function (text, mood) {
    if (!text) return text;
    mood = mood || this.current();
    if (text.length > 300) return text;
    if (mood === "playful") {
      if (Math.random() < 0.35) {
        var suf = [" 😉", " 😎", " 🚀", " (погнали!)", " 🔥"];
        return text + suf[Math.floor(Math.random() * suf.length)];
      }
    } else if (mood === "caring") {
      if (Math.random() < 0.4) {
        var pre = ["Слушай, я рядом. ", "Всё нормально. ", "Давай спокойно разберёмся. "];
        return pre[Math.floor(Math.random() * pre.length)] + text;
      }
    } else if (mood === "calm") {
      if (Math.random() < 0.3) return text + "\n\nБез паники, разберёмся.";
    } else if (mood === "friendly") {
      if (Math.random() < 0.15) return text + " :)";
    }
    return text;
  },

  joke: function () {
    var jokes = [
      "Пудж без хука — как Carry без фарма. Грустно.",
      "Что сказал Techies перед смертью? «Уже поздно... а нет, ещё рано!»",
      "Почему Phantom Assassin не ходит в мид? Она боится крипнуться.",
      "Рошан никогда не спит. А ты?",
      "Почему Invoker не играет в пабах? Он ждёт, когда все выучат его прокасты.",
      "Что общего у Anti-Mage и холодильника? Оба фармят, но не работают в тиме.",
      "Slark в лейте — как кот в мешке: не знаешь, что от него ждать.",
      "Sniper стоит так далеко, что иногда не видит, как его команда проигрывает.",
      "Почему Storm Spirit не любит Anti-Mage? Потому что МАГИЯ — не работает!",
      "Zeus ультанул — кто-то умер. Классика."
    ];
    var p = this.load();
    p.jokes = (p.jokes || 0) + 1;
    this.save(p);
    return jokes[Math.floor(Math.random() * jokes.length)];
  },

  compliment: function (ctx) {
    var p = this.load();
    p.compliments = (p.compliments || 0) + 1;
    this.save(p);
    if (ctx === "win") return ["Отличная игра! 🏆", "Ты был на высоте! 🚀", "Красивая победа!", "Респект за игру!"][Math.floor(Math.random() * 4)];
    if (ctx === "goodKda") return ["KDA как у про-игрока! 🔥", "Огонь! 🎯", "Мастер-класс!"][Math.floor(Math.random() * 3)];
    if (ctx === "highGpm") return ["GPM космос! 💰", "Фармишь как бог! 💎", "Золотая жила!"][Math.floor(Math.random() * 3)];
    return ["Молодец!", "Хорошая работа!", "Так держать!"][Math.floor(Math.random() * 3)];
  },

  comfort: function () {
    var p = [
      "Слушай, все бывает. После 2 лузов — перерыв 15-30 мин.",
      "Тильт — главный враг. Возьми паузу, попей чай.",
      "Понимаю, что обидно. Разбери реплей, пойми ошибки.",
      "Не вешай нос. Все через это проходили. Главное — не сдаваться.",
      "Лузстрик — это сигнал. Не гонись за реваншем, отдохни."
    ];
    return p[Math.floor(Math.random() * p.length)];
  },

  celebrate: function () {
    var p = ["🔥 Огонь!", "🎉 Так держать!", "💪 Вот это мощь!", "🚀 Полетели!", "🏆 Красиво!", "⚡ Мощь!"];
    return p[Math.floor(Math.random() * p.length)];
  },

  getTone: function () {
    var p = this.load();
    if (p.energy < 30) return "short";
    if (p.energy > 80) return "chatty";
    return "normal";
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("расскажи шутку") >= 0 || s.indexOf("пошути") >= 0 || s.indexOf("анекдот") >= 0) return "joke";
    if (s.indexOf("ты как") >= 0 || s.indexOf("как настроение") >= 0 || s.indexOf("твоё настроение") >= 0) return "mood";
    if (s.indexOf("поддержи меня") >= 0 || s.indexOf("мне плохо") >= 0 || s.indexOf("я устал") >= 0) return "comfort";
    if (s.indexOf("я выиграл") >= 0 || s.indexOf("я победил") >= 0 || s.indexOf("я молодец") >= 0) return "celebrate";
    return null;
  },

  answer: function (kind) {
    if (kind === "joke") return "😄 " + this.joke();
    if (kind === "mood") {
      var m = this.current();
      var e = this.energy();
      var mt = { playful: "Мне весело! 🎉", caring: "Я в заботливом режиме. 🤝", calm: "Спокойно, разберёмся. 🧘", friendly: "Отлично! Готов помочь. 😊", neutral: "Нормально, работаю. 💼" };
      return "📊 Настроение: " + (mt[m] || m) + "\n⚡ Энергия: " + e + "/100";
    }
    if (kind === "comfort") return this.comfort();
    if (kind === "celebrate") return this.celebrate();
    return null;
  },

  reset: function () { Store.set(this.key, null); }
};
