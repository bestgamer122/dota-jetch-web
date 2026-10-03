/* DOTA JETCH — DIARY v1.1
   - Fix: вызов Daily.bump("diary") при добавлении записи */

var Diary = {
  all: function () {
    var l = Store.get("diarynotes", []);
    return Array.isArray(l) ? l : [];
  },
  add: function (n) {
    var l = this.all();
    l.unshift(n);
    Store.set("diarynotes", l.slice(0, 200));
    if (typeof Daily !== "undefined") Daily.bump("diary");
  },
  remove: function (id) {
    var l = this.all().filter(function (n) { return n.id !== id; });
    Store.set("diarynotes", l);
  },
  clear: function () { Store.set("diarynotes", []); }
};

function renderDiary() {
  var frag = document.createDocumentFragment();
  var addCard = UI.card("Новая запись");
  var titleInp = UI.input("Заголовок");
  titleInp.id = "diaryTitle";
  titleInp.style.marginBottom = "8px";
  var textInp = el("textarea", { class: "input", placeholder: "Что произошло?", style: "min-height:90px;resize:vertical;font-family:inherit;" });
  textInp.id = "diaryText";
  var tagsInp = UI.input("теги через запятую");
  tagsInp.id = "diaryTags";
  tagsInp.style.marginTop = "8px";
  var btnRow = el("div", { class: "row", style: "margin-top:10px;" });
  var saveBtn = UI.btn("Сохранить");
  saveBtn.addEventListener("click", function () {
    var t = (titleInp.value || "").trim();
    var x = (textInp.value || "").trim();
    if (!t && !x) return;
    var tags = (tagsInp.value || "").split(",").map(function (s) { return s.trim().toLowerCase(); }).filter(Boolean);
    Diary.add({ id: String(Date.now()), title: t || "без заголовка", text: x, tags: tags, ts: Date.now() });
    if (typeof Achievements !== "undefined") Achievements.check();
    switchPage("diary");
  });
  btnRow.appendChild(saveBtn);
  addCard.appendChild(titleInp);
  addCard.appendChild(textInp);
  addCard.appendChild(tagsInp);
  addCard.appendChild(btnRow);
  frag.appendChild(addCard);
  var list = Diary.all();
  if (!list.length) {
    var e = UI.card("Записи");
    e.appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "Пока пусто."));
    frag.appendChild(e);
    return frag;
  }
  var card = UI.card("Записи");
  for (var i = 0; i < list.length; i++) {
    (function (n) {
      var item = el("div", { style: "padding:12px;border-bottom:1px solid var(--border);" });
      item.appendChild(el("div", { style: "font-size:14px;font-weight:bold;" }, n.title));
      if (n.text) item.appendChild(el("div", { class: "muted", style: "font-size:12px;margin-top:6px;white-space:pre-wrap;" }, n.text));
      if (n.tags && n.tags.length) {
        var tg = el("div", { class: "row", style: "flex-wrap:wrap;margin-top:8px;" });
        for (var k = 0; k < n.tags.length; k++) tg.appendChild(UI.badge("#" + n.tags[k], "var(--accent-light)", "var(--accent-bg)"));
        item.appendChild(tg);
      }
      var del = UI.btn("X", { variant: "ghost" });
      del.style.marginTop = "6px";
      del.addEventListener("click", function () { Diary.remove(n.id); switchPage("diary"); });
      item.appendChild(del);
      card.appendChild(item);
    })(list[i]);
  }
  frag.appendChild(card);
  return frag;
}
