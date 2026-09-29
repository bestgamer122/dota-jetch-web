/* DOTA JETCH — BRAIN FEEDBACK v1.0 */

var BrainFeedback = {
key: "brainfeedback",
load: function () {
var f = Store.get(this.key, { good: 0, bad: 0, corrections: [] });
if (!f || typeof f !== "object") f = { good: 0, bad: 0, corrections: [] };
if (!Array.isArray(f.corrections)) f.corrections = [];
return f;
},
save: function (f) { if (f.corrections.length > 100) f.corrections = f.corrections.slice(-100); Store.set(this.key, f); },
detect: function (q) {
var s = String(q || "").toLowerCase().trim();
if (/^(молодец|правильно|верно|хорошо|отлично|то что нужно|спасибо|👍|ок)<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">/</mi><mi mathvariant="normal">.</mi><mi>t</mi><mi>e</mi><mi>s</mi><mi>t</mi><mo stretchy="false">(</mo><mi>s</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mi>r</mi><mi>e</mi><mi>t</mi><mi>u</mi><mi>r</mi><mi>n</mi><mi mathvariant="normal">"</mi><mi>g</mi><mi>o</mi><mi>o</mi><mi>d</mi><mi mathvariant="normal">"</mi><mo separator="true">;</mo><mi>i</mi><mi>f</mi><mo stretchy="false">(</mo><msup><mi mathvariant="normal">/</mi><mo stretchy="false">(</mo></msup><mtext>неправильно</mtext><mi mathvariant="normal">∣</mi><mtext>неверно</mtext><mi mathvariant="normal">∣</mi><mtext>нето</mtext><mi mathvariant="normal">∣</mi><mtext>нетак</mtext><mi mathvariant="normal">∣</mi><mtext>нет</mtext><mi mathvariant="normal">∣</mi><mtext>неа</mtext><mi mathvariant="normal">∣</mi><mtext>бред</mtext><mi mathvariant="normal">∣</mi><mtext>чушь</mtext><mi mathvariant="normal">∣</mi><mtext>ошибся</mtext><mi mathvariant="normal">∣</mi><mtext>ошиблась</mtext><mi mathvariant="normal">∣</mi><mtext>❌</mtext><mi mathvariant="normal">∣</mi><mtext>👎</mtext><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">/.test(s)) return "good";
    if (/^(неправильно|неверно|не то|не так|нет|неа|бред|чушь|ошибся|ошиблась|❌|👎)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.138em;vertical-align:-0.25em;"></span><span class="mord">/.</span><span class="mord mathnormal">t</span><span class="mord mathnormal">es</span><span class="mord mathnormal">t</span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mclose">))</span><span class="mord mathnormal">re</span><span class="mord mathnormal">t</span><span class="mord mathnormal">u</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">n</span><span class="mord">"</span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">oo</span><span class="mord mathnormal">d</span><span class="mord">"</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">i</span><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mopen">(</span><span class="mord"><span class="mord">/</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mopen mtight">(</span></span></span></span></span></span></span></span><span class="mord cyrillic_fallback">неправильно</span><span class="mord">∣</span><span class="mord cyrillic_fallback">неверно</span><span class="mord">∣</span><span class="mord cyrillic_fallback">нето</span><span class="mord">∣</span><span class="mord cyrillic_fallback">нетак</span><span class="mord">∣</span><span class="mord cyrillic_fallback">нет</span><span class="mord">∣</span><span class="mord cyrillic_fallback">неа</span><span class="mord">∣</span><span class="mord cyrillic_fallback">бред</span><span class="mord">∣</span><span class="mord cyrillic_fallback">чушь</span><span class="mord">∣</span><span class="mord cyrillic_fallback">ошибся</span><span class="mord">∣</span><span class="mord cyrillic_fallback">ошиблась</span><span class="mord">∣❌∣👎</span><span class="mclose">)</span></span></span></span>/.test(s)) return "bad";
if (/^(не то,|не совсем|почти|не совсем то|не совсем так)/.test(s)) return "partial";
return null;
},
respond: function (kind) {
if (kind === "good") {
var f = this.load(); f.good++; this.save(f);
var a = ["Спасибо! Учту.", "Рад что помог!", "Стараюсь :)", "Спасибо за фидбек."];
return a[Math.floor(Math.random() * a.length)];
}
if (kind === "bad") {
var f2 = this.load(); f2.bad++;
if (typeof BrainContext !== "undefined") {
var last = BrainContext.last();
if (last) f2.corrections.push({ q: last.text, ts: Date.now() });
}
this.save(f2);
return "Жаль, что не помог. Научи меня правильному ответу: «запомни: <вопрос> = <ответ>».\n\nМои ошибки: " + f2.bad + " · Успехи: " + f2.good;
}
if (kind === "partial") return "Понял, близко, но не то. Уточни, что именно не так.";
return null;
},
stats: function () {
var f = this.load();
var total = f.good + f.bad;
if (total === 0) return "Пока нет оценок от тебя.";
return "Точность по твоим оценкам: " + Math.round((f.good / total) * 100) + "% (" + f.good + " хорошо / " + f.bad + " плохо)";
},
clear: function () { Store.set(this.key, { good: 0, bad: 0, corrections: [] }); }
};