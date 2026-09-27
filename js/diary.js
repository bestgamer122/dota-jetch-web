/* DOTA JETCH — ДНЕВНИК */

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

  const addCard = UI.card("Новая запись");
  const titleInp = UI.input("Заголовок");
  titleInp.id = "diaryTitle";
  titleInp.style.marginBottom = "8px";

  const textInp = el("textarea", {
    class: "input",
    placeholder: "Что произошло в матче?",
    style: "min-height:90px;resize:vertical;font-family:inherit;"
  });
  textInp.id = "diaryText";

  const tagsInp = UI.input("теги через запятую: победа, мид, тайминг");
  tagsInp.id = "diaryTags";
  tagsInp.style.marginTop = "8px";

  const btnRow = el("div", { class: "row", style: "margin-top:10px;" });
  const saveBtn = UI.btn("Сохранить запись");
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
  addCard.appendChild(titleInp);
  addCard.appendChild(textInp);
  addCard.appendChild(tagsInp);
  addCard.appendChild(btnRow);
  frag.appendChild(addCard);

  const list = Diary.all();
  if (!list.length) {
    const empty = UI.card("Записи");
    empty.appendChild(el("div", { class: "dim", style: "font-size:12px;" },
      "Пока пусто. Добавь первую запись выше."));
    frag.appendChild(empty);
    return frag;
  }

  const stat = UI.card("Обзор");
  const statRow = el("div", { class: "row", style: "gap:20px;flex-wrap:wrap;" });
  statRow.appendChild(el("div", {}, el("div", { class: "dim", style: "font-size:10px;letter-spacing:1px;" }, "ВСЕГО"),
    el("div", { style: "font-size:20px;font-weight:bold;color:var(--accent-light);" }, String(list.length))));
  const allTags = new Set();
  for (const n of list) for (const t of (n.tags || [])) allTags.add(t);
  statRow.appendChild(el("div", {}, el("div", { class: "dim", style: "font-size:10px;letter-spacing:1px;" }, "ТЕГОВ"),
    el("div", { style: "font-size:20px;font-weight:bold;color:var(--cyan);" }, String(allTags.size))));
  stat.appendChild(statRow);

  if (allTags.size) {
    const tagRow = el("div", { class: "row", style: "flex-wrap:wrap;margin-top:10px;" });
    const all = el("button", { class: "nav-btn active", style: "font-size:11px;padding:5px 10px;" }, "все");
    all.addEventListener("click", () => filterDiary(null));
    tagRow.appendChild(all);
    for (const t of Array.from(allTags).sort()) {
      const btn = el("button", { class: "nav-btn", style: "font-size:11px;padding:5px 10px;" }, "#" + t);
      btn.addEventListener("click", () => filterDiary(t));
      tagRow.appendChild(btn);
    }
    stat.appendChild(tagRow);
  }
  frag.appendChild(stat);

  const listCard = UI.card("Записи");
  listCard.id = "diaryList";
  renderDiaryList(listCard, list);
  frag.appendChild(listCard);

  const foot = el("div", { style: "text-align:center;padding:14px;" });
  const clr = UI.btn("Очистить дневник", { variant: "danger" });
  clr.addEventListener("click", () => {
    if (confirm("Удалить все записи дневника?")) {
      Diary.clear();
      switchPage("diary");
    }
  });
  foot.appendChild(clr);
  frag.appendChild(foot);

  return frag;
}

function filterDiary(tag) {
  const container = qs("#diaryList");
  if (!container) return;
  while (container.children.length > 1) container.removeChild(container.lastChild);
  const list = Diary.all();
  const filtered = tag ? list.filter(n => (n.tags || []).includes(tag)) : list;
  renderDiaryList(container, filtered);
}

function renderDiaryList(container, list) {
  if (!list.length) {
    container.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:10px;" }, "Нет записей с таким тегом."));
    return;
  }
  for (const n of list) {
    const item = el("div", { style: "padding:12px;border-bottom:1px solid var(--border);" });
    const head = el("div", { style: "display:flex;justify-content:space-between;align-items:flex-start;gap:10px;" });
    const left = el("div", { style: "flex:1;min-width:0;" });
    left.appendChild(el("div", { style: "font-size:14px;font-weight:bold;color:var(--text);" }, n.title));
    const d = new Date(n.ts);
    left.appendChild(el("div", { class: "dim", style: "font-size:10px;margin-top:2px;" },
      d.toLocaleString("ru-RU", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })));
    head.appendChild(left);
    const del = UI.btn("X", { variant: "ghost" });
    del.addEventListener("click", () => {
      Diary.remove(n.id);
      switchPage("diary");
    });
    head.appendChild(del);
    item.appendChild(head);

    if (n.text) {
      item.appendChild(el("div", { class: "muted", style: "font-size:12px;margin-top:8px;white-space:pre-wrap;line-height:1.5;" }, n.text));
    }
    if (n.tags && n.tags.length) {
      const tagRow = el("div", { class: "row", style: "flex-wrap:wrap;margin-top:8px;" });
      for (const t of n.tags) {
        tagRow.appendChild(UI.badge("#" + t, "var(--accent-light)", "var(--accent-bg)"));
      }
      item.appendChild(tagRow);
    }
    container.appendChild(item);
  }
}
