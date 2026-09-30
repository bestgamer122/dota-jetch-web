/* DOTA JETCH — BRAIN RUS v1.1 (fix: обрезан termTranslate) */

var BrainRus = {
  slangToName: {
    "аега":"Aegis of the Immortal","аегис":"Aegis of the Immortal","эгида":"Aegis of the Immortal",
    "бкб":"Black King Bar","бкбшка":"Black King Bar","шива":"Shiva's Guard","шивка":"Shiva's Guard",
    "линка":"Linken's Sphere","манта":"Manta Style","бф":"Battle Fury","бабочка":"Butterfly",
    "мкб":"Monkey King Bar","дагон":"Dagon","дагонка":"Dagon","хекс":"Scythe of Vyse",
    "сатаник":"Satanic","дифуза":"Diffusal Blade","глиммер":"Glimmer Cape","форс":"Force Staff",
    "блинк":"Blink Dagger","бм":"Blade Mail","сапог":"Boots of Speed","бот":"Boots of Travel",
    "треды":"Power Treads","фаза":"Phase Boots","арканы":"Arcane Boots","танго":"Tango",
    "ванд":"Magic Wand","бутл":"Bottle","танк":"Vanguard","кримсон":"Crimson Guard",
    "пайп":"Pipe of Insight","мека":"Mekansm","грейвы":"Guardian Greaves","снж":"Sange and Yasha",
    "халберд":"Heaven's Halberd","атос":"Rod of Atos","глейпнир":"Gleipnir","орчид":"Orchid Malevolence",
    "блудорн":"Bloodthorn","эхо":"Echo Sabre","армлет":"Armlet of Mordiggian",
    "солярка":"Solar Crest","скеди":"Eye of Skadi","скади":"Eye of Skadi","сердце":"Heart of Tarrasque",
    "рад":"Radiance","радик":"Radiance","октарин":"Octarine Core","рефрешер":"Refresher Orb",
    "кровавик":"Bloodstone","эльда":"Aether Lens","эфирка":"Ethereal Blade","мир":"Wraith Band",
    "урна":"Urn of Shadows","сосуд":"Spirit Vessel","мидас":"Hand of Midas","мочка":"Mask of Madness",
    "морда":"Mask of Madness","маска":"Mask of Madness","дезоль":"Desolator","асу":"Assault Cuirass",
    "куйрас":"Assault Cuirass","ак":"Assault Cuirass","даедал":"Daedalus","мьёльнир":"Mjollnir",
    "маел":"Maelstrom","аеон":"Aeon Disk","аеонка":"Aeon Disk","пт":"Power Treads",
    "ам":"Anti-Mage","антимаг":"Anti-Mage","сф":"Shadow Fiend","па":"Phantom Assassin",
    "фантомка":"Phantom Assassin","пудж":"Pudge","мясник":"Pudge","инвокер":"Invoker",
    "вокер":"Invoker","жугер":"Juggernaut","джага":"Juggernaut","сларк":"Slark","рыба":"Slark",
    "шторм":"Storm Spirit","тини":"Tiny","камень":"Tiny","дров":"Drow Ranger","дровка":"Drow Ranger",
    "снайпер":"Sniper","свен":"Sven","рубик":"Rubick","магнус":"Magnus","маг":"Magnus",
    "энigma":"Enigma","энигма":"Enigma","фурион":"Nature's Prophet","фурик":"Nature's Prophet",
    "нп":"Nature's Prophet","зевс":"Zeus","лина":"Lina","кристалка":"Crystal Maiden",
    "цм":"Crystal Maiden","цмка":"Crystal Maiden","лич":"Lich","лайфстил":"Lifestealer",
    "нага":"Naga Siren","виса":"Visage","визаж":"Visage","дуза":"Medusa","медуза":"Medusa",
    "горгона":"Medusa","мортра":"Phantom Assassin","цк":"Chaos Knight","хк":"Chaos Knight",
    "тимбер":"Timbersaw","тимберсо":"Timbersaw","войд":"Faceless Void","спектра":"Spectre",
    "спек":"Spectre","слардар":"Slardar","рики":"Riki","фантом":"Phantom Lancer",
    "пл":"Phantom Lancer","луна":"Luna","алхимик":"Alchemist","алх":"Alchemist",
    "кори":"Core","сап":"Support","сапорт":"Support","мид":"Mid Lane","сафе":"Safe Lane",
    "офлейн":"Off Lane","вижн":"Vision","вард":"Ward","обзор":"Observer Ward",
    "сентри":"Sentry Ward","дуст":"Dust of Appearance","смок":"Smoke of Deceit",
    "рошан":"Roshan","роша":"Roshan","кс":"Kill Streak","тильт":"Tilt","фид":"Feed",
    "стак":"Stack","гпм":"GPM","хпм":"XPM","кда":"KDA","лх":"Last Hits","ластхит":"Last Hit",
    "денай":"Deny","гг":"Good Game","ульта":"Ultimate","улт":"Ultimate","кд":"Cooldown",
    "ммр":"MMR","птс":"MMR","ранкед":"Ranked","паб":"Public Match","лп":"Low Priority"
  },

  termTranslate: {
    "vision":"вижн","ward":"вард","observer ward":"обзорный вард","sentry ward":"сентри",
    "dust of appearance":"дуст","smoke of deceit":"смок","black king bar":"бкб",
    "linken's sphere":"линка","manta style":"манта","blink dagger":"блинк",
    "battle fury":"бф","butterfly":"бабочка","monkey king bar":"мкб",
    "scythe of vyse":"хекс","satanic":"сатаник","diffusal blade":"дифуза",
    "shiva's guard":"шива","rod of atos":"атос","orchid malevolence":"орчид",
    "bloodthorn":"блудорн","aeon disk":"аеон","glimmer cape":"глиммер",
    "force staff":"форс","heart of tarrasque":"сердце","eye of skadi":"скеди",
    "aegis of the immortal":"аега","blade mail":"бм","vanguard":"танк",
    "crimson guard":"кримсон","pipe of insight":"пайп","mekansm":"мека",
    "guardian greaves":"грейвы","hand of midas":"мидас","mask of madness":"мочка",
    "desolator":"дезоль","assault cuirass":"асу","daedalus":"даедал",
    "mjollnir":"мьёльнир","maelstrom":"маел","radiance":"рад",
    "octarine core":"октарин","refresher orb":"рефрешер","bloodstone":"кровавик",
    "aether lens":"эльда","ethereal blade":"эфирка","urn of shadows":"урна",
    "spirit vessel":"сосуд","dagon":"дагон","heaven's halberd":"халберд",
    "sange and yasha":"снж","echo sabre":"эхо","armlet of mordiggian":"армлет",
    "solar crest":"солярка","boots of travel":"бот","power treads":"треды",
    "phase boots":"фаза","arcane boots":"арканы","wraith band":"мир",
    "magic wand":"ванд","bottle":"бутл","tango":"танго","quelling blade":"квеллинг"
  },

  localize: function (text) {
    if (!text) return text;
    var r = String(text);
    var keys = Object.keys(this.termTranslate);
    keys.sort(function (a, b) { return b.length - a.length; });
    for (var i = 0; i < keys.length; i++) {
      var eng = keys[i];
      var rus = this.termTranslate[eng];
      var rx = new RegExp("\\b" + eng.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "\\b", "gi");
      r = r.replace(rx, rus);
    }
    return r;
  },

  normalize: function (q) {
    var s = String(q || "").toLowerCase().trim();
    if (!s) return s;
    var w = s.split(/\s+/);
    var r = [];
    for (var i = 0; i < w.length; i++) {
      var c = w[i].replace(/[^а-яёa-z\-]/g, "");
      if (!c) { r.push(w[i]); continue; }
      if (this.slangToName[c]) r.push(this.slangToName[c].toLowerCase());
      else r.push(w[i]);
    }
    return r.join(" ");
  },

  hasSlang: function (q) {
    var s = String(q || "").toLowerCase();
    var w = s.split(/\s+/);
    for (var i = 0; i < w.length; i++) {
      var c = w[i].replace(/[^а-яёa-z\-]/g, "");
      if (this.slangToName[c]) return true;
    }
    return false;
  },

  findEntity: function (q) {
    var s = String(q || "").toLowerCase();
    var w = s.split(/\s+/);
    for (var i = 0; i < w.length; i++) {
      var c = w[i].replace(/[^а-яёa-z\-]/g, "");
      if (this.slangToName[c]) {
        var full = this.slangToName[c];
        var type = "unknown";
        if (typeof findHeroByAlias === "function" && findHeroByAlias(full)) type = "hero";
        if (typeof ITEM_NOTES !== "undefined" && ITEM_NOTES[full]) type = "item";
        return { slang: c, fullName: full, type: type };
      }
    }
    return null;
  },

  detect: function (q) {
    var s = String(q || "").toLowerCase();
    if (s.indexOf("что такое") >= 0 && this.findEntity(s)) return "explain";
    if (s.indexOf("переведи") >= 0 || s.indexOf("по-русски") >= 0) return "translate";
    if (s.indexOf("сленг") >= 0 && s.indexOf("список") >= 0) return "slang_list";
    return null;
  },

  answer: function (kind, q) {
    if (kind === "explain") {
      var e = this.findEntity(q);
      if (!e) return null;
      var tt = e.type === "hero" ? "герой" : e.type === "item" ? "предмет" : "термин";
      return "📖 **«" + e.slang + "»** — это сленг для **" + e.fullName + "** (" + tt + ").";
    }
    if (kind === "translate") {
      var e2 = this.findEntity(q);
      if (!e2) return null;
      return "🔤 **" + e2.fullName + "** — по-русски часто говорят «" + e2.slang + "».";
    }
    if (kind === "slang_list") {
      var ks = Object.keys(this.slangToName);
      ks.sort();
      var ls = ["📚 **Сленг дотеров:**", ""];
      for (var i = 0; i < ks.length && i < 100; i++) ls.push("• «" + ks[i] + "» → " + this.slangToName[ks[i]]);
      return ls.join("\n");
    }
    return null;
  }
};
