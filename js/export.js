/* DOTA JETCH — EXPORT v3.4.0 */

var Exporter = {
  KEYS: [
    "sessions", "analyzedcount", "uniqueheroes", "aiquestions",
    "diarynotes", "recentmatches", "achievementsunlocked",
    "reactionbest", "quizbest", "guessbeststreak", "gamesplayed",
    "theme", "themechanged", "license.active", "chathistory"
  ],
  export: function () {
    var data = { meta: { app: "DOTA JETCH WEB", version: APP_VERSION, exported: new Date().toISOString() } };
    for (var i = 0; i < this.KEYS.length; i++) {
      var v = Store.get(this.KEYS[i], null);
      if (v !== null) data[this.KEYS[i]] = v;
    }
    return data;
  },
  download: function () {
    var data = this.export();
    var json = JSON.stringify(data, null, 2);
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var d = new Date();
    var stamp = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    a.href = url;
    a.download = "dotajetch-backup-" + stamp + ".json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  },
  importText: function (text) {
    try {
      var data = JSON.parse(text);
      var count = 0;
      for (var i = 0; i < this.KEYS.length; i++) {
        var k = this.KEYS[i];
        if (k in data) { Store.set(k, data[k]); count++; }
      }
      return { ok: true, count: count };
    } catch (e) { return { ok: false, reason: e.message }; }
  }
};

function renderExportPage() {
  var frag = document.createDocumentFragment();
  var head = UI.card("Резервная копия");
  head.appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "Сохрани или восстанови все данные."));
  frag.appendChild(head);

  var expCard = UI.card("Экспорт");
  var dlBtn = UI.btn("Скачать JSON");
  dlBtn.addEventListener("click", function () { Exporter.download(); showDialog("Готово", "Файл скачивается", "success"); });
  expCard.appendChild(dlBtn);
  frag.appendChild(expCard);

  var impCard = UI.card("Импорт");
  var fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json";
  fileInput.style.cssText = "display:block;width:100%;margin-bottom:12px;";
  impCard.appendChild(fileInput);
  var impBtn = UI.btn("Загрузить");
  impBtn.addEventListener("click", function () {
    var f = fileInput.files && fileInput.files[0];
    if (!f) { showDialog("Файл не выбран", "", "error"); return; }
    var reader = new FileReader();
    reader.onload = function (e) {
      var res = Exporter.importText(e.target.result);
      if (res.ok) { showDialog("Импорт OK", "Восстановлено " + res.count, "success"); setTimeout(function () { location.reload(); }, 1000); }
      else showDialog("Ошибка", res.reason, "error");
    };
    reader.readAsText(f);
  });
  impCard.appendChild(impBtn);
  frag.appendChild(impCard);

  var danger = UI.card("Опасная зона");
  var wipe = UI.btn("Сбросить всё", { variant: "danger" });
  wipe.addEventListener("click", function () {
    if (!confirm("Удалить ВСЕ данные?")) return;
    Store.clear();
    Store.set("datareset", true);
    showDialog("Готово", "Данные удалены", "success");
    setTimeout(function () { location.reload(); }, 900);
  });
  danger.appendChild(wipe);
  frag.appendChild(danger);
  return frag;
}