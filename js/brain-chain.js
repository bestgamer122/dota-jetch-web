/* DOTA JETCH — BRAIN CHAIN v1.0 */

var BrainChain = {
isComplex: function (analysis) {
var q = analysis.norm;
if (/ и | против | с | а также | плюс /.test(" " + q + " ")) return true;
if (analysis.tokens.length >= 4) return true;
return false;
},
split: function (query) {
var s = String(query || "").trim();
var parts = s.split(/\s+(?:и|против|с|а также|плюс)\s+/i);
if (parts.length < 2) return null;
var out = [];
for (var i = 0; i < parts.length; i++) { var p = parts[i].trim(); if (p.length >= 3) out.push(p); }
if (out.length < 2) return null;
return out;
},
run: function (query) {
var parts = this.split(query);
if (!parts) return null;
var results = [];
for (var i = 0; i < parts.length; i++) {
var a = BrainThink.analyze(parts[i]);
var c = BrainThink.gather(parts[i]);
if (!c.length) continue;
for (var j = 0; j < c.length; j++) c[j].score = BrainThink.score(c[j], a);
c.sort(function (x, y) { return y.score - x.score; });
var ans = BrainThink.synthesize(c[0], a);
if (ans) results.push({ part: parts[i], answer: ans });
}
if (results.length < 2) return null;
var text = "Разберу по частям:\n\n";
for (var k = 0; k < results.length; k++) text += "▸ " + results[k].part + "\n" + results[k].answer.text + "\n\n";
return { kind: "chain", text: text.trim(), confidence: 0.8 };
}
};