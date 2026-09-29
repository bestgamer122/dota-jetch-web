/* DOTA JETCH — BRAIN USER v1.0 */

var BrainUser = {
  key: "brainprofile",
  load: function () {
    var p = Store.get(this.key, null);
    if (!p || typeof p !== "object") p = { name: null, favoriteHero: null, city: null, mood: null, topics: [], facts: [], ts: 0 };
    if (!Array.isArray(p.topics)) p.topics = [];
    if (!Array.isArray(p.facts)) p.facts = [];
    return p;
  },
  save: function (p) { p.ts = Date.now(); Store.set(this.key, p); },
  extract: function (q) {
    var p = this.load();
    var s = String(q || "").trim();
    var low = s.toLowerCase();
    var nameMatch = s.match(/(?:меня зовут|мо[её] имя|я\s+)([А-ЯЁA-Z][а-яёa-z]{2,15})/);
    if (nameMatch) { p.name = nameMatch[1]; this.save(p); return { type: "name", value: p.name }; }
    var heroMatch = s.match(/(?:люблю|любимый герой|мой герой|играю на|мейн)\s+([А-ЯЁA-Z][а-яёa-z]{2,20})/i);
    if (heroMatch) { p.favoriteHero = heroMatch[1]; this.save(p); return { type: "hero", value: p.favoriteHero }; }
    var cityMatch = s.match(/(?:живу в|из города|я из)\s+([А-ЯЁA-Z][а-яёa-z]{2,20})/i);
    if (cityMatch) { p.city = cityMatch[1]; this.save(p); return { type: "city", value: p.city }; }
    return null;
  },
  trackTopic: function (topic) {
    var p = this.load();
    if (!topic) return;
    p.topics.unshift({ t: topic, ts: Date.now() });
    if (p.topics.length > 30) p.topics = p.topics.slice(0, 30);
    this.save(p);
  },
  formatProfile: function () {
    var p = this.load();
    var items = [];
    if (p.name) items.push("Имя: " + p.name);
    if (p.favoriteHero) items.push("Любимый герой: " + p.favoriteHero);
    if (p.city) items.push("Город: " + p.city);
    if (p.mood) items.push("Последнее настроение: " + p.mood);
    var topTopics = p.topics.slice(0, 5).map(function (t) { return t.t; });
    if (topTopics.length) items.push("Недавние темы: " + topTopics.join(", "));
    if (!items.length) return "Я пока ничего о тебе не знаю. Скажи «меня зовут X» и я запомню.";
    return "📋 Твой профиль:\n\n" + items.map(function (x) { return "• " + x; }).join("\n");
  },
  clear: function () { Store.set(this.key, null); },
  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (/мой профиль|что ты обо мне знаешь|расскажи обо мне|кто я/.test(s)) return "profile";
    if (/забудь (меня|обо мне|мой профиль|все обо мне)/.test(s)) return "clear";
    return null;
  }
};