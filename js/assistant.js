/* DOTA JETCH — ИИ-АССИСТЕНТ
На FREE полностью заблокирован. Работает только с JETCH+. */

let chatHistory = [];

/* ─── Заглушка для FREE ─── */
function renderChatLocked() {
const frag = document.createDocumentFragment();
const card = UI.card("✦  ИИ-ассистент");
const wrap = el("div", { style: "text-align:center;padding:40px 20px;" });

wrap.appendChild(el("div", { style: "font-size:52px;margin-bottom:16px;filter:grayscale(0.4);" }, "🔒"));
wrap.appendChild(el("div", {
style: "font-size:18px;font-weight:700;color:var(--text);margin-bottom:10px;"
}, "ИИ-ассистент доступен в JETCH+"));
wrap.appendChild(el("div", {
class: "dim",
style: "font-size:13px;line-height:1.6;max-width:440px;margin:0 auto 20px;"
}, "В FREE-версии доступен только анализ матчей, дневник, мини-игры и статистика. " +
"ИИ-ассистент с локальной базой (герои, предметы, механики) открывается с подпиской JETCH+."));

const btnRow = el("div", { class: "row", style: "justify-content:center;gap:10px;flex-wrap:wrap;" });
const upBtn = UI.btn("✦  Активировать JETCH+");
upBtn.addEventListener("click", function () { switchPage("settings"); });
btnRow.appendChild(upBtn);
wrap.appendChild(btnRow);

wrap.appendChild(el("div", {
class: "dim",
style: "font-size:11px;margin-top:24px;letter-spacing:1px;"
}, "Демо-режим: активация в настройках бесплатна"));

card.appendChild(wrap);
frag.appendChild(card);
return frag;
}

function renderChat() {
const plus = Store.get("license_active", false) === true;
if (!plus) return renderChatLocked();

/* ─── JETCH+ версия: полный чат ─── */
const frag = document.createDocumentFragment();

const head = UI.card("✦  ИИ-ассистент · JETCH+");
head.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.6;" },
"Знаю про героев, предметы и механики. Спроси по-русски или по-английски."
));
head.appendChild(el("div", {
style: "margin-top:10px;display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:var(--gold-bg);border:1px solid var(--gold);color:var(--gold);font-size:11px;font-weight:700;letter-spacing:1px;"
}, "✦ JETCH+ · безлимит"));

const examples = el("div", { class: "row", style: "flex-wrap:wrap;margin-top:12px;" });
for (const q of ["как играть на пудже", "что делает BKB", "предметы на АМ", "как стакать лес"]) {
const chip = el("button", { class: "nav-btn", style: "font-size:11px;padding:6px 10px;" }, q);
chip.addEventListener("click", function () {
const input = qs("#chatInput");
if (input) { input.value = q; input.focus(); }
});
examples.appendChild(chip);
}
head.appendChild(examples);
frag.appendChild(head);

const chatCard = UI.card("Чат");
const log = el("div", { id: "chatLog", style: "max-height:420px;overflow-y:auto;padding:4px 0;display:flex;flex-direction:column;gap:10px;" });
chatCard.appendChild(log);
frag.appendChild(chatCard);

const inputCard = el("div", { class: "card", style: "position:sticky;bottom:0;background:var(--bg-elev);" });
const row = el("div", { class: "row", style: "gap:8px;" });
const inp = UI.input("Спроси про героя, предмет или механику...");
inp.id = "chatInput";
inp.style.flex = "1";
inp.addEventListener("keydown", function (e) {
if (e.key === "Enter") { e.preventDefault(); onChatSend(); }
});
const btn = UI.btn("Отправить", { id: "chatSendBtn" });
btn.addEventListener("click", onChatSend);
row.appendChild(inp);
row.appendChild(btn);
inputCard.appendChild(row);
frag.appendChild(inputCard);

setTimeout(function () {
const saved = Store.get("chat_history", []);
chatHistory = Array.isArray(saved) ? saved : [];
const l = qs("#chatLog");
if (!l) return;
if (!chatHistory.length) {
addChatMessage(l, "assistant",
"Привет! Я локальный ИИ-ассистент DOTA JETCH.\n\n" +
"Могу рассказать про героев, предметы и механики. Попробуй: «что делает BKB» или «как играть на инвокере».");
} else {
for (const m of chatHistory) addChatMessage(l, m.role, m.text, false);
}
l.scrollTop = l.scrollHeight;
}, 0);

return frag;
}

function addChatMessage(log, role, text, scroll) {
if (scroll === undefined) scroll = true;
const isUser = role === "user";
const row = el("div", {
style: "display:flex;gap:10px;align-items:flex-start;" + (isUser ? "flex-direction:row-reverse;" : "")
});
const avatar = el("div", {
style: "width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;background:" + (isUser ? "var(--accent-bg)" : "var(--cyan-bg)") + ";color:" + (isUser ? "var(--accent-light)" : "var(--cyan)") + ";border:1px solid " + (isUser ? "var(--accent)" : "var(--cyan)") + ";"
}, isUser ? "Я" : "AI");
const bubble = el("div", {
style: "max-width:80%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word;background:" + (isUser ? "var(--accent-bg)" : "var(--bg-elev)") + ";border:1px solid " + (isUser ? "var(--accent)" : "var(--border)") + ";color:var(--text);"
}, text);
row.appendChild(avatar);
row.appendChild(bubble);
log.appendChild(row);
if (scroll) log.scrollTop = log.scrollHeight;
}

async function onChatSend() {
/* Жёсткая блокировка на FREE */
const plus = Store.get("license_active", false) === true;
if (!plus) {
if (typeof switchPage !== "undefined") switchPage("chat");
return;
}

const inp = qs("#chatInput");
const log = qs("#chatLog");
const btn = qs("#chatSendBtn");
if (!inp || !log) return;
const q = (inp.value || "").trim();
if (!q) return;

inp.value = "";
addChatMessage(log, "user", q);
chatHistory.push({ role: "user", text: q });

Store.set("ai_questions", (Store.get("ai_questions", 0) || 0) + 1);
if (typeof Daily !== "undefined") Daily.bump("chat");
if (typeof Achievements !== "undefined") Achievements.check();

btn.disabled = true;
btn.textContent = "Думаю...";
const typing = el("div", {
class: "dim", style: "font-size:11px;padding-left:44px;font-style:italic;"
}, "ассистент печатает...");
log.appendChild(typing);
log.scrollTop = log.scrollHeight;

await new Promise(function (r) { setTimeout(r, 350); });

let answer;
try {
answer = kbAnswer(q);
} catch (e) {
answer = { text: "Ошибка в базе знаний: " + (e.message || e), kind: "none" };
}

typing.remove();
addChatMessage(log, "assistant", answer.text);
chatHistory.push({ role: "assistant", text: answer.text });

if (chatHistory.length > 100) chatHistory = chatHistory.slice(-100);
Store.set("chat_history", chatHistory);

btn.disabled = false;
btn.textContent = "Отправить";
inp.focus();
}