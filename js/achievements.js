/* DOTA JETCH — ACHIEVEMENTS v2.1 (Dire Jumper) */

var ACHIEVEMENTS = [
  { id: "a1", cat: "Анализ", icon: "1", title: "Первый анализ", desc: "1 матч", check: function (s) { return s.analyzed >= 1; } },
  { id: "a2", cat: "Анализ", icon: "5", title: "Аналитик", desc: "5 матчей", check: function (s) { return s.analyzed >= 5; } },
  { id: "a3", cat: "Анализ", icon: "25", title: "Профи", desc: "25 матчей", check: function (s) { return s.analyzed >= 25; } },
  { id: "a4", cat: "Анализ", icon: "100", title: "Гуру", desc: "100 матчей", check: function (s) { return s.analyzed >= 100; } },
  { id: "a5", cat: "Герои", icon: "5", title: "Разнообразие", desc: "5 героев", check: function (s) { return s.uniqueHeroes >= 5; } },
  { id: "a6", cat: "Герои", icon: "15", title: "Коллекционер", desc: "15 героев", check: function (s) { return s.uniqueHeroes >= 15; } },
  { id: "a7", cat: "Герои", icon: "50", title: "Все", desc: "50 героев", check: function (s) { return s.uniqueHeroes >= 50; } },
  { id: "a8", cat: "Ассистент", icon: "1", title: "Первый вопрос", desc: "1 вопрос ИИ", check: function (s) { return s.aiQuestions >= 1; } },
  { id: "a9", cat: "Ассистент", icon: "10", title: "Любознательный", desc: "10 вопросов", check: function (s) { return s.aiQuestions >= 10; } },
  { id: "a10", cat: "Ассистент", icon: "50", title: "Болтун", desc: "50 вопросов", check: function (s) { return s.aiQuestions >= 50; } },
  { id: "a11", cat: "Дневник", icon: "1", title: "Первая запись", desc: "1 запись", check: function (s) { return s.diaryNotes >= 1; } },
  { id: "a12", cat: "Дневник", icon: "10", title: "Хроникёр", desc: "10 записей", check: function (s) { return s.diaryNotes >= 10; } },
  { id: "a13", cat: "Дневник", icon: "50", title: "Автор", desc: "50 записей", check: function (s) { return s.diaryNotes >= 50; } },
  { id: "a14", cat: "Игры", icon: "1", title: "Игрок", desc: "1 игра", check: function (s) { return s.gamesPlayed >= 1; } },
  { id: "a15", cat: "Игры", icon: "250", title: "Молниеносный", desc: "Реакция меньше 250 мс", check: function (s) { return s.reactionBest > 0 && s.reactionBest < 250; } },
  { id: "a16", cat: "Игры", icon: "200", title: "Ниндзя", desc: "Реакция меньше 200 мс", check: function (s) { return s.reactionBest > 0 && s.reactionBest < 200; } },
  { id: "a17", cat: "Игры", icon: "10", title: "Викторина", desc: "10 из 10", check: function (s) { return s.quizBest >= 10; } },
  { id: "a18", cat: "Игры", icon: "10", title: "Детектив", desc: "10 героев подряд", check: function (s) { return s.guessBest >= 10; } },
  { id: "a19", cat: "Активность", icon: "5", title: "Регулярный", desc: "5 сессий", check: function (s) { return s.sessions >= 5; } },
  { id: "a20", cat: "Активность", icon: "25", title: "Постоянный", desc: "25 сессий", check: function (s) { return s.sessions >= 25; } },
  { id: "a21", cat: "Активность", icon: "100", title: "Верный", desc: "100 сессий", check: function (s) { return s.sessions >= 100; } },
  { id: "a22", cat: "Особые", icon: "C", title: "Стилист", desc: "Сменить тему", check: function (s) { return s.themeChanged === true; } },
  { id: "a23", cat: "Особые", icon: "?", title: "Любопытный", desc: "Открой «О сайте»", check: function (s) { return s.visitedAbout === true; } },
  { id: "a24", cat: "Особые", icon: "20", title: "Мастер", desc: "Открыть 20 ачивок", check: function (s) { return s.unlockedCount >= 20; }, late: true },
  { id: "a25", cat: "Дири-Джампер", icon: "1", title: "Первый прыжок", desc: "Сыграть 1 раз", check: function (s) { return s.djGames >= 1; } },
  { id: "a26", cat: "Дири-Джампер", icon: "5k", title: "Высоко", desc: "5 000 очков", check: function (s) { return s.djBest >= 5000; } },
  { id: "a27", cat: "Дири-Джампер", icon: "10k", title: "Летающий Сларк", desc: "10 000 очков", check: function (s) { return s.djBest >= 10000; } },
  { id: "a28", cat: "Дири-Джампер", icon: "25k", title: "Дирижабль", desc: "25 000 очков", check: function (s) { return s.djBest >= 25000; } }
];

var Achievements = {
  stats: function () {
    var u = Store.get("uniqueheroes", []);
    return {
      analyzed: Store.get("analyzedcount", 0) || 0,
      uniqueHeroes: Array.isArray(u) ? u.length : 0,
      aiQuestions: Store.get("aiquestions", 0) || 0,
      diaryNotes: (Store.get("diarynotes", []) || []).length,
      gamesPlayed: Store.get("gamesplayed", 0) || 0,
      reactionBest: Store.get("reactionbest", 0) || 0,
      quizBest: Store.get("quizbest", 0) || 0,
      guessBest: Store.get("guessbeststreak", 0) || 0,
      sessions: Store.get("sessions", 0) || 0,
      themeChanged: Store.get("themechanged", false),
      visitedAbout: Store.get("visitedabout", false),
      unlockedCount: (Store.get("achievementsunlocked", []) || []).length,
      djBest: Store.get("direjumperbest", 0) || 0,
      djGames: Store.get("direjumpergames", 0) || 0
    };
  },
  unlocked: function () {
    var u = Store.get("achievementsunlocked", []);
    return Array.isArray(u) ? u : [];
  },
  check: function () {
    var s = this.stats();
    var unlocked = this.unlocked();
    var newly = [];
    for (var i = 0; i < ACHIEVEMENTS.length; i++) {
      var a = ACHIEVEMENTS[i];
      if (a.late) continue;
      if (unlocked.indexOf(a.id) >= 0) continue;
      try { if (a.check(s)) { unlocked.push(a.id); newly.push(a); } } catch (e) {}
    }
    s.unlockedCount = unlocked.length;
    for (var j = 0; j < ACHIEVEMENTS.length; j++) {
      var b = ACHIEVEMENTS[j];
      if (!b.late) continue;
      if (unlocked.indexOf(b.id) >= 0) continue;
      try { if (b.check(s)) { unlocked.push(b.id); newly.push(b); } } catch (e) {}
    }
    if (newly.length) {
      Store.set("achievementsunlocked", unlocked);
      for (var k = 0; k < newly.length; k++) {
        (function (ach, delay) {
          setTimeout(function () { Achievements.toast(ach); }, delay);
        })(newly[k], k * 220);
      }
    }
    return newly;
  },
  toast: function (a) {
    var c = qs("#achToast");
    if (!c) { c = el("div", { id: "achToast" }); document.body.appendChild(c); }
    var t = el("div", { class: "ach-toast" });
    var icoWrap = el("div", { class: "ach-toast-ico" });
    icoWrap.textContent = a.icon;
    t.appendChild(icoWrap);
    var info = el("div", { class: "ach-toast-info" });
    var label = el("div", { class: "ach-toast-label" });
    label.textContent = "Достижение";
    var title = el("div", { class: "ach-toast-title" });
    title.textContent = a.title;
    var desc = el("div", { class: "ach-toast-desc" });
    desc.textContent = a.desc;
    info.appendChild(label);
    info.appendChild(title);
    info.appendChild(desc);
    t.appendChild(info);
    var progress = el("div", { class: "ach-toast-progress" });
    t.appendChild(progress);
    c.appendChild(t);
    setTimeout(function () {
      t.classList.add("ach-toast-out");
      setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 450);
    }, 4000);
  },
  onAnalyze: function (result) {
    if (!result || !result.hero) return;
    Store.set("analyzedcount", (Store.get("analyzedcount", 0) || 0) + 1);
    var u = Store.get("uniqueheroes", []) || [];
    if (u.indexOf(result.hero.id) < 0) { u.push(result.hero.id); Store.set("uniqueheroes", u); }
    this.check();
  },
  onThemeChange: function () {
    Store.set("themechanged", true);
    this.check();
  }
};

function renderAchievements() {
  var frag = document.createDocumentFragment();
  var unlocked = Achievements.unlocked();
  var head = UI.card("Достижения");
  head.appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "Открыто " + unlocked.length + " из " + ACHIEVEMENTS.length));
  frag.appendChild(head);
  var cats = {};
  for (var i = 0; i < ACHIEVEMENTS.length; i++) {
    var a = ACHIEVEMENTS[i];
    if (!cats[a.cat]) cats[a.cat] = [];
    cats[a.cat].push(a);
  }
  for (var cat in cats) {
    if (!cats.hasOwnProperty(cat)) continue;
    var card = UI.card(cat);
    var grid = el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:10px;" });
    var list = cats[cat];
    for (var j = 0; j < list.length; j++) {
      var b = list[j];
      var isOn = unlocked.indexOf(b.id) >= 0;
      var tile = el("div", { style: "background:" + (isOn ? "var(--gold-bg)" : "var(--bg-elev)") + ";border:1px solid " + (isOn ? "var(--gold)" : "var(--border)") + ";border-radius:12px;padding:12px;text-align:center;opacity:" + (isOn ? 1 : 0.55) + ";" });
      tile.appendChild(el("div", { style: "font-size:20px;font-weight:800;color:" + (isOn ? "var(--gold)" : "var(--text-muted)") + ";font-family:'JetBrains Mono',monospace;" }, b.icon));
      tile.appendChild(el("div", { style: "font-size:12px;font-weight:bold;color:" + (isOn ? "var(--gold)" : "var(--text-muted)") + ";margin-top:6px;" }, b.title));
      tile.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-top:4px;" }, b.desc));
      grid.appendChild(tile);
    }
    card.appendChild(grid);
    frag.appendChild(card);
  }
  return frag;
}
