/* DOTA JETCH — BRAIN INFER v1.0 */

var BrainInfer = {
aboutUser: function () {
if (typeof BrainUser === "undefined") return null;
var p = BrainUser.load();
var inferences = [];
if (p.favoriteHero) {
var favorite = p.favoriteHero;
inferences.push("Судя по «" + favorite + "», тебе нравится играть на " +
(favorite.match(/am|анти|pa|фантом|jug|жугер|carry|керри/i) ? "керри — значит ты предпочитаешь фарм и поздний гейм" :
favorite.match(/pudge|пудж|роум|roam|sb|barathrum/i) ? "инициаторах — значит любишь активную игру" :
favorite.match(/invoker|инвокер|storm|шторм|tinker|тинкер/i) ? "сложных мидерах — значит тебе важен скилл-кап" :
"героях, которые тебе нравятся по стилю") + ".");
}
if (p.mood) {
if (p.mood === "sad" || p.mood === "tired") inferences.push("Ты недавно был расстроен — я это помню. Как сейчас?");
else if (p.mood === "happy" || p.mood === "excited") inferences.push("В прошлый раз у тебя было отличное настроение — надеюсь, оно осталось :)");
}
if (p.topics && p.topics.length >= 3) {
var topicCounts = {};
for (var i = 0; i < p.topics.length; i++) topicCounts[p.topics[i].t] = (topicCounts[p.topics[i].t] || 0) + 1;
var maxTopic = null, maxCount = 0;
for (var t in topicCounts) if (topicCounts[t] > maxCount) { maxCount = topicCounts[t]; maxTopic = t; }
if (maxTopic && maxCount >= 2) inferences.push("Ты часто спрашиваешь про «" + maxTopic + "» — видимо, это тебе особенно интересно.");
}
if (!inferences.length) return null;
return "🧠 Мои выводы о тебе:\n\n" + inferences.map(function (x) { return "• " + x; }).join("\n");
},
aboutDialog: function () {
if (typeof BrainContext === "undefined") return null;
var c = BrainContext.load();
var hist = c.history || [];
if (hist.length < 3) return null;
var positive = 0, negative = 0;
for (var i = 0; i < hist.length; i++) {
var k = hist[i].kind;
if (k === "greeting" || k === "howareyou" || k === "thanks" || k === "mood") positive++;
if (k === "none" || k === "feedback") negative++;
}
if (positive > negative * 2 && positive >= 3) return "Наш диалог идёт хорошо — ты чаще пишешь позитивные вещи.";
if (negative > positive && negative >= 2) return "Замечу, что некоторые мои ответы тебя не устроили. Скажи прямо, что не так — я учту.";
return null;
},
combined: function () {
var u = this.aboutUser();
var d = this.aboutDialog();
if (!u && !d) return "Пока не могу сделать выводов — мало данных. Расскажи о себе: «меня зовут X».";
var parts = [];
if (u) parts.push(u);
if (d) parts.push("\n" + d);
return parts.join("\n");
},
detect: function (q) {
var s = String(q || "").toLowerCase();
if (/что ты (можешь )?вывести|сделай вывод|проанализируй меня|твои выводы|какие выводы/.test(s)) return "combined";
if (/что ты (обо мне )?понял|что понял обо мне/.test(s)) return "user";
if (/проанализируй диалог|наш диалог|оцени разговор/.test(s)) return "dialog";
return null;
},
answer: function (kind) {
if (kind === "combined") return this.combined();
if (kind === "user") return this.aboutUser() || "Пока мало данных о тебе.";
if (kind === "dialog") return this.aboutDialog() || "Диалог пока короткий для анализа.";
return null;
}
};