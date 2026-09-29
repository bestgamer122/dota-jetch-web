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
      { id: "chat", title: "Задай 2 вопроса ИИ", desc: "Только JETCH+", prog: function () { return Store.get("dailyprogress.chat", 0) || 0; }, goal: 2 },
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
  var grid = el("div", { style: "display:flex;flex-direction:column;gap:10px;" });
  var plus = Store.get("license.active", false) === true;
  for (var j = 0; j < tasks.length; j++) {
    var t = tasks[j];
    var cur = Math.min(t.prog(), t.goal);
    var done = cur >= t.goal;
    var locked = (t.id === "chat" && !plus);
    var row = el("div", {
      style: "display:flex;align-items:center;gap:14px;padding:12px 14px;border-radius:12px;background:" + (done ? "var(--green-bg)" : "var(--bg-elev)") + ";border:1px solid " + (done ? "var(--green)" : "var(--border)") + ";"
    });
    row.appendChild(el("div", { style: "font-size:16px;font-weight:800;color:" + (done ? "var(--green)" : "var(--text-muted)") + ";width:28px;text-align:center;font-family:'JetBrains Mono',monospace;" }, done ? "V" : locked ? "L" : String(cur)));
    var info = el("div", { style: "flex:1;" });
    info.appendChild(el("div", { style: "font-size:13px;font-weight:600;" }, t.title));
    info.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:3px;" }, done ? "Выполнено" : locked ? "Только JETCH+" : t.desc));
    row.appendChild(info);
    row.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;color:" + (done ? "var(--green)" : "var(--text-muted)") + ";" }, locked ? "-" : cur + "/" + t.goal));
    grid.appendChild(row);
  }
  card.appendChild(grid);
  var claimed = Store.get("dailystreakclaimed", false);
  var streak = Store.get("dailystreak", 0) || 0;
  var foot = el("div", { class: "row", style: "margin-top:14px;justify-content:space-between;" });
  foot.appendChild(el("div", { style: "font-size:12px;" }, "Стрик: " + streak + " дн."));
  if (Daily.allDone() && !claimed) {
    var btn = UI.btn("Забрать");
    btn.addEventListener("click", function () {
      if (Daily.claim()) { showDialog("Награда!", "Отлично", "success"); switchPage("dashboard"); }
    });
    foot.appendChild(btn);
  } else if (claimed) {
    foot.appendChild(el("div", { style: "font-size:12px;color:var(--green);" }, "Получено"));
  }
  card.appendChild(foot);
  return card;
}
