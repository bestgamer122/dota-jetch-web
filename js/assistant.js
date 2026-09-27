/* DOTA JETCH — ИИ-АССИСТЕНТ (с лимитом FREE) */

let chatHistory = [];

const AI_FREE_LIMIT = 3;
const AI_PLUS_LIMIT = 15;

function _todayKey() {
const d = new Date();
return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}

function aiQuota() {
const today = _todayKey();
let q = Store.get("ai_quota", null);
if (!q || typeof q !== "object" || q.date !== today) {
q = { date: today, count: 0 };
Store.set("ai_quota", q);
}
return q;
}

function aiQuotaInc() {
const q = aiQuota();
q.count++;
Store.set("ai_quota", q);
return q;
}

function aiQuotaRemaining() {
const plus = Store.get("license_active", false) === true;
const limit = plus ? AI_PLUS_LIMIT : AI_FREE_LIMIT;
const q = aiQuota();
return Math.max(0, limit - q.count);
}

function aiQuotaLimit() {
return Store.get("license_active", false) === true ? AI_PLUS_LIMIT : AI_FREE_LIMIT;
}

function renderChat() {
const frag = document.createDocumentFragment();

const head = UI.card("✦  ИИ-ассистент · Локальная база знаний");
head.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.6;" },
"Знаю про героев, предметы и механики. Спроси по-русски или по-английски."
));

const plus = Store.get("license_active", false) === true;
const remaining = aiQuotaRemaining();
const limit = aiQuotaLimit();

const quotaRow = el("div", { class: "row", style: "margin-top:12px;justify-content:space-between;flex-wrap:wrap;gap:8px;" });
const quotaText = el("div", { id: "aiQuotaText", style: "font-size:12px;font-weight:600;" });
if (plus) {
quotaText.style.color = "var(--gold)";
quotaText.textContent = "✦ JETCH+ · " + remaining + " / " + limit + " вопросов";
} else {
quotaText.style.color = remaining > 0 ? "var(--text-muted)" : "var(--red)";
quotaText.textContent = "FREE · " + remaining + " / " + limit + " вопросов сегодня";
}
quotaRow.appendChild(quotaText);

// Прогресс-бар квоты
const barWrap = el("div", { style: "flex:1;max-width:200px;height:5px;background:rgba(0,0,0,0.4);border-radius:3px;overflow:hidden;" });
const used = limit - remaining;
const pct = Math.min(100, (used / limit) * 100);
const barColor = pct >= 100 ? "var(--red)" : pct >= 66 ? "var(--orange)" : "var(--accent)";
barWrap.appendChild(el("div", { style: "height:100%;width:" + pct.toFixed(0) + "%;background:" + barColor + ";transition:width 0.4s ease;" }));
quotaRow.appendChild(barWrap);
head.appendChild(quotaRow);

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

if (remaining <= 0) {
inp.disabled = true;
btn.disabled = true;
inp.placeholder = "Лимит исчерпан — активируй JETCH+ в настройках";
}

row.appendChild(inp);
row.appendChild(btn);
inputCard.appendChild(row);

if (remaining <= 0) {
const hint = el("div", { class: "row", style: "margin-top:10px;justify-content:space-between;flex-wrap:wrap;gap:8px;" });
const txt = plus
? "JETCH+ даёт " + AI_PLUS_LIMIT + " вопросов в день. Лимит обнулится завтра."
: "Бесплатный лимит — " + AI_FREE_LIMIT + " вопросов в день. Активируй JETCH+ в настройках — получишь " + AI_PLUS_LIMIT + " в день.";
hint.appendChild(el("div", { class: "dim", style: "font-size:11px;flex:1;min-width:200px;line-height:1.5;" }, txt));
if (!plus) {
const upBtn = UI.btn("Активировать JETCH+", { variant: "ghost" });
upBtn.addEventListener("click", function () { switchPage("settings"); });
hint.appendChild(upBtn);
}
inputCard.appendChild(hint);
}

frag.appendChild(inputCard);

setTimeout(function () {
const saved = Store.get("chat_history", []);
chatHistory = Array.isArray(saved) ? saved : [];
const l = qs("#chatLog");
if (!l) return;
if (!chatHistory.length) {
addChatMessage(l, "assistant",
"Привет! Я локальный ИИ-ассистент DOTA JETCH.\n\n" +
"Могу рассказать про героев, предметы и механики. Попробуй: «что делает BKB» или «как играть на инвокере».\n\n" +
"Лимит FREE: " + AI_FREE_LIMIT + " вопроса в день. Активируй JETCH+ → " + AI_PLUS_LIMIT + " в день.");
} else {
for (const m of chatHistory) addChatMessage(l, m.role, m.text, false);
}
l.scrollTop = l.scrollHeight;
}, 0);

return frag;
}

function _updateQuotaText() {
const elQ = qs("#aiQuotaText");
if (!elQ) return;
const plus = Store.get("license_active", false) === true;
const remaining = aiQuotaRemaining();
const limit = aiQuotaLimit();
if (plus) {
elQ.style.color = "var(--gold)";
elQ.textContent = "✦ JETCH+ · " + remaining + " / " + limit + " вопросов";
} else {
elQ.style.color = remaining > 0 ? "var(--text-muted)" : "var(--red)";
elQ.textContent = "FREE · " + remaining + " / " + limit + " вопросов сегодня";
}
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
const inp = qs("#chatInput");
const log = qs("#chatLog");
const btn = qs("#chatSendBtn");
if (!inp || !log) return;
const q = (inp.value || "").trim();
if (!q) return;

const plus = Store.get("license_active", false) === true;
const remaining = aiQuotaRemaining();
if (remaining <= 0) {
addChatMessage(log, "assistant",
"🚫 Лимит на сегодня исчерпан.\n\n" +
(plus
? "JETCH+ даёт " + AI_PLUS_LIMIT + " вопросов в день. Лимит обнулится завтра."
: "FREE даёт " + AI_FREE_LIMIT + " вопроса в день. Активируй JETCH+ в настройках — получишь " + AI_PLUS_LIMIT + ".")
);
return;
}

inp.value = "";
addChatMessage(log, "user", q);
chatHistory.push({ role: "user", text: q });

aiQuotaInc();
Store.set("ai_questions", (Store.get("ai_questions", 0) || 0) + 1);
if (typeof Daily !== "undefined") Daily.bump("chat");
_updateQuotaText();
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

const left = aiQuotaRemaining();
if (left <= 0) {
/* обновляем поле ввода */
inp.disabled = true;
btn.disabled = true;
inp.placeholder = "Лимит исчерпан — активируй JETCH+ в настройках";
if (typeof switchPage !== "undefined") {
setTimeout(function () { switchPage("chat"); }, 1400);
}
return;
}

btn.disabled = false;
btn.textContent = "Отправить";
inp.focus();
}