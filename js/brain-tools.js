/* DOTA JETCH — BRAIN TOOLS v1.0 (упрощённый, без сложных regex) */

var BrainTools = {
  detect: function (q) {
    var s = String(q || "").toLowerCase().trim();
    if (!s) return null;

    /* Посчитать */
    if (s.indexOf("посчитай") === 0 || s.indexOf("вычисли") === 0) {
      var expr = s.replace(/^(посчитай|вычисли)\s+/, "");
      return { kind: "calc", expr: expr };
    }
    if (/^\d+[\s+\-*/^().]+\d+/.test(s)) return { kind: "calc", expr: s };

    /* Кубик */
    if (s.indexOf("кубик") >= 0 || s.indexOf("брось кубик") >= 0 || s.indexOf("d6") >= 0 || s.indexOf("d20") >= 0) {
      var dm = s.match(/d(\d+)/);
      return { kind: "dice", sides: dm ? parseInt(dm[1], 10) : 6 };
    }

    /* Монетка */
    if (s.indexOf("монетк") >= 0 || s.indexOf("подбрось монет") >= 0 || s.indexOf("орёл или решка") >= 0) {
      return { kind: "coin" };
    }

    /* Пароль */
    if (s.indexOf("пароль") >= 0 || s.indexOf("сгенерируй пароль") >= 0) {
      var pm = s.match(/(\d+)/);
      return { kind: "password", length: pm ? parseInt(pm[1], 10) : 16 };
    }

    /* Случайное число */
    if (s.indexOf("случайное число") >= 0 || s.indexOf("рандом") >= 0) {
      var rm = s.match(/(\d+)\s*(?:до|-)\s*(\d+)/);
      return { kind: "random", min: rm ? parseInt(rm[1], 10) : 1, max: rm ? parseInt(rm[2], 10) : 100 };
    }

    return null;
  },

  answer: function (kind, query) {
    if (!kind) return "";
    if (kind.kind === "calc") return this.calc(kind.expr);
    if (kind.kind === "dice") return this.dice(kind.sides);
    if (kind.kind === "coin") return this.coin();
    if (kind.kind === "password") return this.password(kind.length);
    if (kind.kind === "random") return this.random(kind.min, kind.max);
    return "";
  },

  calc: function (expr) {
    try {
      var clean = String(expr).replace(/[^0-9+\-*/().^ ]/g, "").replace(/\^/g, "**");
      var result = Function('"use strict"; return (' + clean + ')')();
      return "🧮 " + clean + " = " + result;
    } catch (e) {
      return "Не могу посчитать: " + expr;
    }
  },

  dice: function (sides) {
    var n = Math.floor(Math.random() * sides) + 1;
    return "🎲 d" + sides + ": **" + n + "**";
  },

  coin: function () {
    var r = Math.random() < 0.5 ? "Орёл" : "Решка";
    return "🪙 " + r + "!";
  },

  password: function (len) {
    var chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    var out = "";
    for (var i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
    return "🔐 Пароль (" + len + "):\n`" + out + "`";
  },

  random: function (min, max) {
    var n = Math.floor(Math.random() * (max - min + 1)) + min;
    return "🎲 Случайное число (" + min + "-" + max + "): **" + n + "**";
  }
};
