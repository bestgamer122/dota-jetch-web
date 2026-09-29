/* DOTA JETCH — BRAIN PERSONALITY v1.0 */

var BrainPersonality = {
key: "brainpersonality",
moods: {
neutral:  { label: "нейтральное", emoji: "", prefix: "", style: "обычный" },
friendly: { label: "дружелюбное", emoji: "", prefix: "", style: "тёплый" },
playful:  { label: "игривое", emoji: "", prefix: "", style: "весёлый" },
calm:     { label: "спокойное", emoji: "", prefix: "", style: "сдержанный" },
serious:  { label: "серьёзное", emoji: "", prefix: "", style: "деловой" }
},
load: function () {
var p = Store.get(this.key, { mood: "friendly", switchCount: 0, lastSwitch: 0 });
if (!p || typeof p !== "object") p = { mood: "friendly", switchCount: 0, lastSwitch: 0 };
return p;
},
save: function (p) { Store.set(this.key, p); },
adapt: function (emotion) {
var p = this.load();
var now = Date.now();
if (now - p.lastSwitch < 60000) return p.mood;
var old = p.mood;
if (emotion) {
if (emotion.mood === "sad" || emotion.mood === "tired") p.mood = "calm";
else if (emotion.mood === "happy" || emotion.mood === "excited") p.mood = "playful";
else if (emotion.mood === "angry") p.mood = "serious";
else p.mood = "friendly";
} else {
p.mood = "friendly";
}
if (old !== p.mood) { p.switchCount++; p.lastSwitch = now; this.save(p); }
return p.mood;
},
current: function () { return this.load().mood; },
apply: function (text, mood) {
if (!text) return text;
mood = mood || this.current();
if (mood === "playful" && Math.random() < 0.3) return text + "\n\n😉";
if (mood === "friendly" && Math.random() < 0.15) return text + " :)";
return text;
}
};