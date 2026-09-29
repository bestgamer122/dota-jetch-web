/* DOTA JETCH — BRAIN SELFCHECK v1.0 */

var BrainSelfCheck = {
  run: function (answer, query) {
    if (!answer || !answer.text) return answer;
    var text = String(answer.text);
    var issues = [];
    if (query.length > 30 && text.length < 15) issues.push("short");
    if (query.length > 10 && answer.kind === "none") issues.push("unknown");
    if (answer.confidence !== undefined && answer.confidence < 0.4 && answer.kind !== "none") issues.push("low-conf");
    if (issues.length === 0) return answer;
    if (issues.indexOf("short") >= 0) {
      answer.text += "\n\nЕсли нужно подробнее — уточни.";
      answer.confidence = Math.min(answer.confidence || 0.5, 0.6);
    }
    if (issues.indexOf("low-conf") >= 0) answer.text += "\n\n(я не совсем уверен)";
    answer.selfChecked = true;
    return answer;
  },
  reflect: function () {
    if (typeof BrainContext === "undefined") return null;
    var c = BrainContext.load();
    var hist = c.history || [];
    if (hist.length < 3) return "Мало истории для рефлексии.";
    var kinds = {};
    for (var i = 0; i < hist.length; i++) {
      var k = hist[i].kind || "?";
      kinds[k] = (kinds[k] || 0) + 1;
    }
    var top = [];
    for (var k2 in kinds) if (kinds.hasOwnProperty(k2)) top.push({ kind: k2, count: kinds[k2] });
    top.sort(function (a, b) { return b.count - a.count; });
    var text = "За последние " + hist.length + " сообщений я чаще всего:\n";
    for (var j = 0; j < Math.min(top.length, 4); j++) text += "• " + top[j].kind + " — " + top[j].count + " раз\n";
    return text;
  }
};