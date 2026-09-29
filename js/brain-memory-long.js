/* DOTA JETCH — BRAIN MEMORY LONG v1.0 */

var BrainMemoryLong = {
key: "brainlongmemory",
load: function () {
var m = Store.get(this.key, null);
if (!m || typeof m !== "object") m = { sessions: [], totalMessages: 0, firstSeen: Date.now(), topics: {}, favoriteHour: null };
if (!Array.isArray(m.sessions)) m.sessions = [];
if (!m.topics || typeof m.topics !== "object") m.topics = {};
return m;
},
save: function (m) {
if (m.sessions.length > 30) m.sessions = m.sessions.slice(-30);
Store.set(this.key, m);
},
startSession: function () {
var m = this.load();
m.sessions.push({ ts: Date.now(), msgs: 0 });
m.totalMessages = m.totalMessages || 0;
this.save(m);
},
bumpMessage: function () {
var m = this.load();
m.totalMessages++;
if (m.sessions.length) m.sessions[m.sessions.length - 1].msgs++;
this.save(m);
},
trackTopic: function (kind) {
var m = this.load();
m.topics[kind] = (m.topics[kind] || 0) + 1;
var h = new Date().getHours();
if (!m.hours) m.hours = {};
m.hours[h] = (m.hours[h] || 0) + 1;
this.save(m);
},
stats: function () {
var m = this.load();
var daysSince = Math.floor((Date.now() - m.firstSeen) / 86400000);
var favoriteTopic = null, maxTopic = 0;
for (var k in m.topics) if (m.topics[k] > maxTopic) { maxTopic = m.topics[k]; favoriteTopic = k; }
var favHour = null, maxHour = 0;
if (m.hours) for (var h in m.hours) if (m.hours[h] > maxHour) { maxHour = m.hours[h]; favHour = h; }
return { totalMessages: m.totalMessages, daysSince: daysSince, favoriteTopic: favoriteTopic, favoriteTopicCount: maxTopic, favoriteHour: favHour, sessionCount: m.sessions.length };
},
formatStats: function () {
var s = this.stats();
var out = "📊 Статистика нашей истории:\n\n";
out += "• Всего сообщений: " + s.totalMessages + "\n";
if (s.daysSince > 0) out += "• Знакомы дней: " + s.daysSince + "\n";
out += "• Сессий: " + s.sessionCount + "\n";
if (s.favoriteTopic) out += "• Любимая тема: «" + s.favoriteTopic + "» (" + s.favoriteTopicCount + " раз)\n";
if (s.favoriteHour !== null) out += "• Чаще пишешь в: " + s.favoriteHour + ":00\n";
return out;
},
clear: function () { Store.set(this.key, null); },
detect: function (q) {
var s = String(q || "").toLowerCase();
if (/наша история|статистика общения|сколько мы общались|что мы обсуждали/.test(s)) return "stats";
if (/забудь (историю|всё|все)/.test(s)) return "clear";
return null;
}
};