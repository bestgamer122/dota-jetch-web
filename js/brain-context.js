/* DOTA JETCH — BRAIN CONTEXT v1.0 */

var BrainContext = {
key: "braincontext",
maxHistory: 10,
load: function () {
var c = Store.get(this.key, null);
if (!c || typeof c !== "object") c = { lastTopic: null, lastAnswer: null, history: [] };
if (!Array.isArray(c.history)) c.history = [];
return c;
},
save: function (c) {
if (c.history.length > this.maxHistory) c.history = c.history.slice(-this.maxHistory);
Store.set(this.key, c);
},
remember: function (query, answer, kind) {
var c = this.load();
c.lastTopic = query;
c.lastAnswer = { text: answer, kind: kind, ts: Date.now() };
c.history.push({ q: query, a: answer, kind: kind, ts: Date.now() });
this.save(c);
},
last: function () { return this.load().lastAnswer; },
clear: function () { Store.set(this.key, { lastTopic: null, lastAnswer: null, history: [] }); },
detectFollowUp: function (q) {
var s = String(q || "").toLowerCase().trim();
if (/^(а (ещё|еще|что|как|почему|зачем|сколько)|ещё|еще|дальше|продолж|подробнее|раскрой|расскажи (ещё|еще|больше))/.test(s)) return "more";
if (/^(а |а ты|а он|а она|а оно)/.test(s)) return "clarify";
if (/^(да|ага|конечно|верно|правильно)<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mi mathvariant="normal">/</mi><mi mathvariant="normal">.</mi><mi>t</mi><mi>e</mi><mi>s</mi><mi>t</mi><mo stretchy="false">(</mo><mi>s</mi><mo stretchy="false">)</mo><mo stretchy="false">)</mo><mi>r</mi><mi>e</mi><mi>t</mi><mi>u</mi><mi>r</mi><mi>n</mi><mi mathvariant="normal">"</mi><mi>a</mi><mi>g</mi><mi>r</mi><mi>e</mi><mi>e</mi><mi mathvariant="normal">"</mi><mo separator="true">;</mo><mi>i</mi><mi>f</mi><mo stretchy="false">(</mo><msup><mi mathvariant="normal">/</mi><mo stretchy="false">(</mo></msup><mtext>нет</mtext><mi mathvariant="normal">∣</mi><mtext>неа</mtext><mi mathvariant="normal">∣</mi><mtext>неправильно</mtext><mi mathvariant="normal">∣</mi><mtext>нето</mtext><mo stretchy="false">)</mo></mrow><annotation encoding="application/x-tex">/.test(s)) return "agree";
    if (/^(нет|неа|неправильно|не то)</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.138em;vertical-align:-0.25em;"></span><span class="mord">/.</span><span class="mord mathnormal">t</span><span class="mord mathnormal">es</span><span class="mord mathnormal">t</span><span class="mopen">(</span><span class="mord mathnormal">s</span><span class="mclose">))</span><span class="mord mathnormal">re</span><span class="mord mathnormal">t</span><span class="mord mathnormal">u</span><span class="mord mathnormal" style="margin-right:0.02778em;">r</span><span class="mord mathnormal">n</span><span class="mord">"</span><span class="mord mathnormal">a</span><span class="mord mathnormal" style="margin-right:0.03588em;">g</span><span class="mord mathnormal">ree</span><span class="mord">"</span><span class="mpunct">;</span><span class="mspace" style="margin-right:0.1667em;"></span><span class="mord mathnormal">i</span><span class="mord mathnormal" style="margin-right:0.10764em;">f</span><span class="mopen">(</span><span class="mord"><span class="mord">/</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.888em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mopen mtight">(</span></span></span></span></span></span></span></span><span class="mord cyrillic_fallback">нет</span><span class="mord">∣</span><span class="mord cyrillic_fallback">неа</span><span class="mord">∣</span><span class="mord cyrillic_fallback">неправильно</span><span class="mord">∣</span><span class="mord cyrillic_fallback">нето</span><span class="mclose">)</span></span></span></span>/.test(s)) return "disagree";
return null;
},
handle: function (kind) {
var last = this.last();
if (!last) return null;
if (kind === "more") return "Мы говорили про: «" + (this.load().lastTopic || "?") + "».\n\nМогу рассказать подробнее — уточни, что именно интересует. Или спроси что-то новое.";
if (kind === "clarify") return "Уточни, о чём именно ты спрашиваешь — я потерял контекст.";
if (kind === "agree") return "Рад, что совпало. Что дальше?";
if (kind === "disagree") return "Понял, буду знать. Уточни, что не так — я постараюсь ответить точнее.";
return null;
}
};