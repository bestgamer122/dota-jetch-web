/* DOTA JETCH — ДНЕВНИК v3.4.0 */

var Diary = {
all: function () {
var list = Store.get("diarynotes", []);
return Array.isArray(list) ? list : [];
},
add: function (note) {
var list = this.all();
list.unshift(note);
Store.set("diarynotes", list.slice(0, 200));
},
remove: function (id) {
var list = this.all().filter(function (n) { return n.id !== id; });
Store.set("diarynotes", list);
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
Diary.add({ id: String(Date.now()), title: t || "(без заголовка)", text: x, tags: tags, ts: Date.now() });
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
var empty = UI.card("Записи");
empty.appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "Пока пусто."));
frag.appendChild(empty);
return frag;
}
var card = UI.card("Записи");
for (var i = 0; i < list.length; i++) {
var n = list[i];
var item = el("div", { style: "padding:12px;border-bottom:1px solid var(--border);" });
item.appendChild(el("div", { style: "font-size:14px;font-weight:bold;" }, n.title));
if (n.text) item.appendChild(el("div", { class: "muted", style: "font-size:12px;margin-top:6px;white-space:pre-wrap;" }, n.text));
card.appendChild(item);
}
frag.appendChild(card);
return frag;
}