/* DOTA JETCH — BRAIN OPINIONS v1.0 */

var BrainOpinions = {
  heroes: {
    "pudge": "Пудж — классика. Хук решает игры, но требует практики. Мне нравится его потенциал на пик-оффах.",
    "invoker": "Инвокер — самый сложный герой в Dota. 10 скиллов, каст-комбо. Уважаю тех, кто его освоил.",
    "juggernaut": "Джаггернаут — простой и эффективный керри. Хороший выбор для новичков.",
    "antimage": "Анти-Маг — тот самый керри, который фармит 25 минут и потом забирает игру. Терпеливый пик.",
    "phantom assassin": "ПА — криты и убийства. Хрупкая, но с БКБ страшная.",
    "storm spirit": "Шторм — мобильный мидер, весёлый, но требует скилла и маны.",
    "zeus": "Зевс — простой маг с глобальным уроном. Отличный для начинающих.",
    "medusa": "Медуза — самый скучный керри поначалу, но в лейте — монстр.",
    "axe": "Акс — инициатор и мемы про казнь. Простой и полезный."
  },
  detect: function (q) {
    var s = String(q || "").toLowerCase();
    var m = s.match(/как тебе (?:герой )?([a-zа-яё\- ]+?)(\?|$|\.)/i);
    if (m) return { type: "hero", name: m[1].trim() };
    if (/что (ты )?думаешь про|тво[её] мнение|нравится ли тебе/.test(s)) {
      var m2 = s.match(/(?:про|о|о герое) ([a-zа-яё\- ]+?)(\?|$|\.)/i);
      if (m2) return { type: "hero", name: m2[1].trim() };
    }
    if (/какой (твой |у тебя )?(любим|лучший) герой/.test(s)) return { type: "favorite" };
    return null;
  },
  answer: function (intent) {
    if (!intent) return null;
    if (intent.type === "favorite") return "Мой любимый герой — Инвокер. Он самый сложный, и я уважаю тех, кто играет на нём хорошо. А твой?";
    if (intent.type === "hero") {
      var n = intent.name.toLowerCase().replace(/\s+/g, " ");
      for (var k in this.heroes) {
        if (n === k || n.indexOf(k) >= 0 || k.indexOf(n) >= 0) return this.heroes[k];
      }
      return "Про «" + intent.name + "» у меня нет особого мнения, но могу рассказать его гайд — спроси «как играть на " + intent.name + "».";
    }
    return null;
  }
};