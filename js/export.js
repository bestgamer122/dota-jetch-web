/* DOTA JETCH — ЭКСПОРТ / ИМПОРТ ДАННЫХ (JSON) */

const Exporter = {
KEYS: [
"sessions", "analyzed_count", "unique_heroes", "ai_questions",
"diary_notes", "recent_matches", "achievements_unlocked",
"reaction_best", "quiz_best", "guess_best_streak", "games_played",
"theme", "theme_changed", "license_active",
"chat_history", "ai_quota", "daily_streak", "daily_last_claim_date",
"daily_claims_total", "daily_date", "daily_streak_claimed",
"daily_progress_analyze", "daily_progress_chat", "daily_progress_diary",
"daily_progress_game", "daily_progress_chart", "daily_progress_theme",
],

export: function () {
const data = {
_meta: {
app: "DOTA JETCH WEB",
version: APP_VERSION,
exported_at: new Date().toISOString(),
},
};
for (const key of this.KEYS) {
const v = Store.get(key, null);
if (v !== null) data[key] = v;
}
return data;
},

download: function () {
const data = this.export();
const json = JSON.stringify(data, null, 2);
const blob = new Blob([json], { type: "application/json" });
const url = URL.createObjectURL(blob);
const a = document.createElement("a");
const d = new Date();
const stamp = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
a.href = url;
a.download = "dotajetch-backup-" + stamp + ".json";
document.body.appendChild(a);
a.click();
a.remove();
setTimeout(function () { URL.revokeObjectURL(url); }, 500);
},

importFromText: function (text) {
try {
const data = JSON.parse(text);
if (!data || typeof data !== "object") return { ok: false, reason: "Не JSON-объект" };
let count = 0;
for (const key of this.KEYS) {
if (key in data) {
Store.set(key, data[key]);
count++;
}
}
return { ok: true, count: count };
} catch (e) {
return { ok: false, reason: e.message || String(e) };
}
},

importFromFile: function (file) {
const self = this;
return new Promise(function (resolve) {
const reader = new FileReader();
reader.onload = function (e) {
resolve(self.importFromText(e.target.result));
};
reader.onerror = function () {
resolve({ ok: false, reason: "Не удалось прочитать файл" });
};
reader.readAsText(file);
});
},
};

/* ─── UI: страница экспорт/импорт ─── */
function renderExportPage() {
const frag = document.createDocumentFragment();

const head = UI.card("💾 Резервная копия");
head.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.6;" },
"Сохрани все свои данные — сессии, историю матчей, дневник, достижения — в один JSON-файл. " +
"Потом сможешь восстановить на другом устройстве или после сброса."
));
frag.appendChild(head);

/* Экспорт */
const expCard = UI.card("📤 Экспорт");
expCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
"Скачать файл с текущими данными:"
));
const dlBtn = UI.btn("Скачать JSON");
dlBtn.addEventListener("click", function () {
try {
Exporter.download();
showDialog("Готово", "Файл с резервной копией скачивается.", "success");
} catch (e) {
showDialog("Ошибка", e.message || String(e), "error");
}
});
expCard.appendChild(dlBtn);
frag.appendChild(expCard);

/* Импорт */
const impCard = UI.card("📥 Импорт");
impCard.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
"Загрузи файл резервной копии. Текущие данные будут перезаписаны."
));

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.accept = "application/json,.json";
fileInput.id = "importFile";
fileInput.style.cssText =
"display:block;width:100%;padding:10px;background:var(--bg-elev);border:1px dashed var(--border-hl);" +
"border-radius:10px;color:var(--text);font-size:12px;cursor:pointer;margin-bottom:12px;";
impCard.appendChild(fileInput);

const impBtn = UI.btn("Загрузить из файла");
impBtn.addEventListener("click", async function () {
const f = fileInput.files && fileInput.files[0];
if (!f) {
showDialog("Файл не выбран", "Сначала выбери JSON-файл резервной копии.", "error");
return;
}
const res = await Exporter.importFromFile(f);
if (res.ok) {
showDialog("Импорт завершён", "Восстановлено " + res.count + " параметров. Перезагрузи страницу.", "success");
setTimeout(function () { location.reload(); }, 1200);
} else {
showDialog("Ошибка импорта", res.reason, "error");
}
});
impCard.appendChild(impBtn);

/* Импорт из текста */
impCard.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:16px;margin-bottom:6px;" },
"Или вставь JSON-текст вручную:"
));
const ta = el("textarea", {
class: "input",
placeholder: '{"sessions": 5, "recent_matches": [...] }',
style: "min-height:100px;font-family:'JetBrains Mono',monospace;font-size:11px;resize:vertical;",
});
ta.id = "importText";
impCard.appendChild(ta);

const impTextBtn = UI.btn("Загрузить из текста", { variant: "ghost" });
impTextBtn.style.marginTop = "10px";
impTextBtn.addEventListener("click", function () {
const t = (ta.value || "").trim();
if (!t) {
showDialog("Пусто", "Вставь JSON в поле выше.", "error");
return;
}
const res = Exporter.importFromText(t);
if (res.ok) {
showDialog("Импорт завершён", "Восстановлено " + res.count + " параметров. Перезагрузи страницу.", "success");
setTimeout(function () { location.reload(); }, 1200);
} else {
showDialog("Ошибка импорта", res.reason, "error");
}
});
impCard.appendChild(impTextBtn);

frag.appendChild(impCard);

/* Опасная зона */
const danger = UI.card("⚠️ Опасная зона");
danger.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" },
"Полный сброс всех данных. Действие необратимо — сначала сделай резервную копию."
));
const wipeBtn = UI.btn("Сбросить всё", { variant: "danger" });
wipeBtn.addEventListener("click", function () {
if (!confirm("Удалить ВСЕ данные без возможности восстановления?")) return;
if (!confirm("Точно? Ещё раз подумай. Может сначала сохранить?")) return;
Store.clear();
Store.set("data_reset", true);
showDialog("Готово", "Данные удалены. Перезагрузи страницу.", "success");
setTimeout(function () { location.reload(); }, 900);
});
danger.appendChild(wipeBtn);
frag.appendChild(danger);

return frag;
}