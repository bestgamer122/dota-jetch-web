/* DOTA JETCH — BRAIN TOOLS v1.0 */

var BrainTools = {
detect: function (q) {
var s = String(q || "").trim();
if (/^(калькулятор|посчитай|сколько будет)\s/i.test(s)) return "calc";
if (/брось (кубик|кость|дайс)|кинь кубик|кубик|roll d\d+/i.test(s)) return "dice";
if (/монетк|орёл или решка|орел или решка|coin/i.test(s)) return "coin";
if (/случайное число|рандом|random/i.test(s)) return "random";
if (/сгенерируй пароль|придумай пароль|пароль на \d+|generate password/i.test(s)) return "password";
return null;
},
calc: function (q) {
var m = String(q).match(/([0-9.\s+-*/<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow></mrow><annotation encoding="application/x-tex"></annotation></semantics></math></span><span class="katex-html" aria-hidden="true"></span></span>x×÷%]+)/);
if (!m) return null;
var expr = m[1].replace(/x|×/gi, "*").replace(/÷/g, "/").trim();
if (!/^[0-9.\s+-*/<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow></mrow><annotation encoding="application/x-tex"></annotation></semantics></math></span><span class="katex-html" aria-hidden="true"></span></span>%]+/.test(expr)) return null;
    try {
      var result = Function("return (" + expr + ")")();
      if (typeof result !== "number" || !isFinite(result)) return null;
      return expr + " = " + Math.round(result * 1000000) / 1000000;
    } catch (e) { return null; }
  },
  dice: function (q) {
    var m = String(q).match(/d(\d+)/i);
    var sides = m ? parseInt(m[1], 10) : 6;
    if (sides < 2 || sides > 1000) sides = 6;
    return "🎲 Кубик (d" + sides + "): " + (Math.floor(Math.random() * sides) + 1);
  },
  coin: function () { return "🪙 Монетка: " + (Math.random() < 0.5 ? "ОРЁЛ" : "РЕШКА"); },
  random: function (q) {
    var m = String(q).match(/(\d+)\s*(?:до|до числа|-|—)\s*(\d+)/);
    if (m) {
      var a = parseInt(m[1], 10), b = parseInt(m[2], 10);
      if (a > b) { var t = a; a = b; b = t; }
      return "🎯 Случайное число от " + a + " до " + b + ": " + (Math.floor(Math.random() * (b - a + 1)) + a);
    }
    return "🎯 Случайное число 1-100: " + (Math.floor(Math.random() * 100) + 1);
  },
  password: function (q) {
    var m = String(q).match(/(\d+)/);
    var len = m ? parseInt(m[1], 10) : 16;
    if (len < 4) len = 4;
    if (len > 64) len = 64;
    var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#%^&*()_+-=[]{}";
var pass = "";
for (var i = 0; i < len; i++) pass += chars.charAt(Math.floor(Math.random() * chars.length));
return "🔐 Пароль (" + len + " символов):\n" + pass;
},
answer: function (kind, q) {
if (kind === "calc") { var r = this.calc(q); return r || "Не смог посчитать. Пример: «посчитай 2 + 2 * 3»"; }
if (kind === "dice") return this.dice(q);
if (kind === "coin") return this.coin();
if (kind === "random") return this.random(q);
if (kind === "password") return this.password(q);
return null;
}
};