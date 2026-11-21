var Daily = {
  todayKey: function () {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  },
  seed: function () {
    var k = this.todayKey();
    var h = 0;
    for (var i = 0; i < k.length; i++) h = (Math.imul(h, 31) + k.charCodeAt(i)) % 100000;
    return h;
  },
  tasks: function () {
    var all = [
      { id: "analyze", title: "Разбери 1 матч", desc: "Вкладка Анализ", prog: function () { return Store.get("dailyprogress.analyze", 0) || 0; }, goal: 1 },
      { id: "diary", title: "Запиши в дневник", desc: "1 запись", prog: function () { return Store.get("dailyprogress.diary", 0) || 0; }, goal: 1 },
      { id: "game", title: "Сыграй в мини-игру", desc: "Реакция, викторина", prog: function () { return Store.get("dailyprogress.game", 0) || 0; }, goal: 1 },
      { id: "chart", title: "Открой графики", desc: "Прогресс", prog: function () { return Store.get("dailyprogress.chart", 0) || 0; }, goal: 1 },
      { id: "theme", title: "Смени тему", desc: "Настройки", prog: function () { return Store.get("dailyprogress.theme", 0) || 0; }, goal: 1 }
    ];
    var start = this.seed() % all.length;
    var picked = [];
    for (var i = 0; i < 3; i++) picked.push(all[(start + i) % all.length]);
    return picked;
  },
  bump: function (id) {
    var today = this.todayKey();
    if (Store.get("dailydate", "") !== today) {
      var keys = ["analyze", "chat", "diary", "game", "chart", "theme"];
      for (var i = 0; i < keys.length; i++) Store.set("dailyprogress." + keys[i], 0);
      Store.set("dailydate", today);
      Store.set("dailystreakclaimed", false);
    }
    Store.set("dailyprogress." + id, (Store.get("dailyprogress." + id, 0) || 0) + 1);
    if (typeof Achievements !== "undefined") Achievements.check();
  },
  allDone: function () {
    var t = this.tasks();
    for (var i = 0; i < t.length; i++) if (t[i].prog() < t[i].goal) return false;
    return true;
  },
  claim: function () {
    if (Store.get("dailydate", "") !== this.todayKey()) return false;
    if (!this.allDone()) return false;
    if (Store.get("dailystreakclaimed", false)) return false;
    Store.set("dailystreakclaimed", true);
    var today = this.todayKey();
    var last = Store.get("dailylastclaimdate", "");
    var streak = Store.get("dailystreak", 0) || 0;
    if (last !== today) {
      var y = new Date();
      y.setDate(y.getDate() - 1);
      var yes = y.getFullYear() + "-" + String(y.getMonth() + 1).padStart(2, "0") + "-" + String(y.getDate()).padStart(2, "0");
      streak = (last === yes) ? streak + 1 : 1;
      Store.set("dailystreak", streak);
      Store.set("dailylastclaimdate", today);
    }
    return true;
  }
};

function renderDailyWidget() {
  var card = UI.card("Задания дня");
  var tasks = Daily.tasks();
  if (Store.get("dailydate", "") !== Daily.todayKey()) {
    var keys = ["analyze", "chat", "diary", "game", "chart", "theme"];
    for (var i = 0; i < keys.length; i++) Store.set("dailyprogress." + keys[i], 0);
    Store.set("dailydate", Daily.todayKey());
    Store.set("dailystreakclaimed", false);
  }
  var grid = el("div", { class: "task-list" });
  for (var j = 0; j < tasks.length; j++) {
    var t = tasks[j];
    var cur = Math.min(t.prog(), t.goal);
    var done = cur >= t.goal;
    var row = el("div", { class: "task-row" + (done ? " done" : "") });
    row.appendChild(el("span", { class: "task-check", "aria-hidden": "true" }, done ? "✓" : ""));
    var info = el("div", { class: "task-info" });
    info.appendChild(el("div", { class: "task-title" }, t.title));
    info.appendChild(el("div", { class: "task-desc" }, done ? "Выполнено" : t.desc));
    row.appendChild(info);
    row.appendChild(el("span", { class: "task-count" }, cur + " / " + t.goal));
    grid.appendChild(row);
  }
  card.appendChild(grid);
  var claimed = Store.get("dailystreakclaimed", false);
  var streak = Store.get("dailystreak", 0) || 0;
  var foot = el("div", { class: "card-foot", style: "justify-content:space-between;align-items:center;" });
  foot.appendChild(el("span", { class: "progress-caption", style: "margin:0;" }, "Стрик: " + streak + " " + (streak === 1 ? "день" : "дн.")));
  if (Daily.allDone() && !claimed) {
    var btn = UI.btn("Забрать награду");
    btn.addEventListener("click", function () {
      if (Daily.claim()) { showDialog("Награда!", "Награда за сегодня получена.", "success"); switchPage("dashboard"); }
    });
    foot.appendChild(btn);
  } else if (claimed) {
    foot.appendChild(el("span", { class: "badge badge-win" }, "Получено"));
  }
  card.appendChild(foot);
  return card;
}

console.log("daily v2.0 ready (без ИИ-заданий)");
