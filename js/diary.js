/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — ДНЕВНИК
   Записи с заголовком, текстом, тегами.
   ═══════════════════════════════════════════════════════════════════ */

const Diary = {
  all() {
    const list = Store.get("diary_notes", []);
    return Array.isArray(list) ? list : [];
  },
  add(note) {
    const list = this.all();
    list.unshift(note);
    Store.set("diary_notes", list.slice(0, 200));
  },
  remove(id) {
    const list = this.all().filter(n => n.id !== id);
    Store.set("diary_notes", list);
  },
  clear() {
    Store.set("diary_notes", []);
  },
};

function renderDiary() {
  const frag = document.createDocumentFragment();

  const addCard = UI.card("📝  Новая запись");
  const titleInp = UI.input("Заголовок (напр. «Разбор матча vs SF»)");
  titleInp.id = "diaryTitle";
  titleInp.style.marginBottom = "8px";

  const textInp = el("textarea", {
    class: "input",
    placeholder: "Что произошло в матче? Что получилось/не получилось?",
    style: "min-height:90px;resize:vertical;font-family:inherit;"
  });
  textInp.id = "diaryText";

  const tagsInp = UI.input("теги через запятую: победа, мид, тайминг");
  tagsInp.id = "diaryTags";
  tagsInp.style.marginTop = "8px";

  const btnRow = el("div", { class: "row", style: "margin-top:10px;" });
  const saveBtn = UI.btn("✓  Сохранить запись");
  saveBtn.addEventListener("click", () => {
    const t = (titleInp.value || "").trim();
    const x = (textInp.value || "").trim();
    if (!t && !x) return;
    const tags = (tagsInp.value || "")
      .split(",").map(s => s.trim().toLowerCase()).filter(Boolean);
    Diary.add({
      id: Date.now() + "_" + Math.random().toString(36).slice(2, 7),
      title: t || "(без заголовка)",
      text: x,
      tags,
      ts: Date.now(),
    });
    if (typeof Achievements !== "undefined") Achievements.check();
    switchPage("diary");
  });
  btnRow.appendChild(saveBtn);
  addCard
