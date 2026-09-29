/* DOTA JETCH — BRAIN v5.0 */

function brainAnswer(query) {
var q = String(query || "").trim();
if (!q) return { kind: "empty", text: "Спроси что-нибудь.", confidence: 1, trace: [] };

if (typeof BrainFeedback !== "undefined") {
var fb = BrainFeedback.detect(q);
if (fb) return { kind: "feedback", text: BrainFeedback.respond(fb), confidence: 1, trace: ["Распознал фидбек: " + fb] };
}

if (typeof BrainEmotion !== "undefined") {
var emo = BrainEmotion.detect(q);
if (emo && (emo.mood === "sad" || emo.mood === "angry" || emo.mood === "tired")) {
var eText = BrainEmotion.respond(emo);
if (eText) {
if (typeof BrainContext !== "undefined") BrainContext.remember(q, eText, "emotion");
return { kind: "emotion", text: eText, emotion: emo.mood, confidence: 0.85, trace: ["Определил эмоцию: " + emo.mood] };
}
}
}

var analysis = BrainThink.analyze(q);
if (typeof BrainChain !== "undefined" && BrainChain.isComplex(analysis)) {
var chain = BrainChain.run(q);
if (chain) {
if (typeof BrainContext !== "undefined") BrainContext.remember(q, chain.text, "chain");
if (typeof BrainSelfCheck !== "undefined") chain = BrainSelfCheck.run(chain, q);
return chain;
}
}

var answer = BrainThink.run(q);
if (typeof BrainSelfCheck !== "undefined") answer = BrainSelfCheck.run(answer, q);

if (answer.kind === "none" && typeof BrainEmotion !== "undefined") {
var emo2 = BrainEmotion.detect(q);
if (emo2) {
var reaction = BrainEmotion.respond(emo2);
if (reaction) answer.text = reaction + "\n\n" + answer.text;
answer.emotion = emo2.mood;
}
}
return answer;
}