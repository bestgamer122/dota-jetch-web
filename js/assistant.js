/* DOTA JETCH — ИИ-АССИСТЕНТ v4.0.0
FREE: полностью заблокирован. JETCH+: расширенный чат с базой знаний,
советами по матчам, контрпиками и таймингами. */

var chatHistory = [];

function renderChat() {
var plus = Store.get("license.active", false) === true;
if (!plus) return renderChatLocked();

var frag = document.createDocumentFragment();

/* Header */
var head = UI.card("✦ ИИ-ассистент · JETCH+");
head.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.6;" },
"Знаю про героев, предметы, механики, контрпики и тайминги. Спроси по-русски."));

var badgeRow = el("div", { style: "margin-top:10px;" });
badgeRow.appendChild(el("span", {
style: "display:inline-flex;align-items:center;gap:6px;padding:4px 12px;border-radius:999px;background:var(--gold-bg);border:1px solid var(--gold);color:var(--gold);font-size:11px;font-weight:700;"
}, "✦ JETCH+ · 40+ героев, 30+ предметов"));
head.appendChild(badgeRow);

/* Examples */
var examples = el("div", { class: "row", style: "flex-wrap:wrap;margin-top:14px;" });
var exQueries = ["как играть на пудже", "что делает BKB", "предметы на АМ", "контрпики на СФ", "синергии с Магнусом", "тайминги башен"];
for (var i = 0; i < exQueries.length; i++) {
(function (q) {
var chip = el("button", { class: "nav-btn", style: "font-size:11px;padding:6px 10px;" }, q);
chip.addEventListener("click", function () {
var input = qs("#chatInput");
if (input) { input.value = q; input.focus(); }
});
examples.appendChild(chip);
})(exQueries[i]);
}
head.appendChild(examples);
frag.appendChild(head);

/* Chat log */
var chatCard = UI.card("Чат");
var log = el("div", { id: "chatLog", style: "max-height:420px;overflow-y:auto;padding:4px 0;display:flex;flex-direction:column;gap:10px;" });
chatCard.appendChild(log);
frag.appendChild(chatCard);

/* Input */
var inputCard = el("div", { class: "card", style: "position:sticky;bottom:0;background:var(--bg-elev);" });
var row = el("div", { class: "row", style: "gap:8px;" });
var inp = UI.input("Спроси про героя, предмет, механику, контрпики...");
inp.id = "chatInput";
inp.style.flex = "1";
inp.addEventListener("keydown", function (e) {
if (e.key === "Enter") { e.preventDefault(); onChatSend(); }
});
var btn = UI.btn("Отправить", { id: "chatSendBtn" });
btn.addEventListener("click", onChatSend);
row.appendChild(inp);
row.appendChild(btn);
inputCard.appendChild(row);
frag.appendChild(inputCard);

setTimeout(function () {
var saved = Store.get("chathistory", []);
chatHistory = Array.isArray(saved) ? saved : [];
var l = qs("#chatLog");
if (!l) return;
if (!chatHistory.length) {
addChatMessage(l, "assistant",
"Привет! Я расширенный ИИ-ассистент DOTA JETCH v4.0.\n\n" +
"Могу рассказать:\n" +
"• Героев — 25+ (роли, плюсы, минусы, предметы, контрпики, синергии)\n" +
"• Предметы — 30+ (что делает, когда покупать, советы)\n" +
"• Механики — 20+ (ластхит, стакинг, Рошан, руны, тайминги)\n\n" +
"Пример: «как играть на инвокере», «что делает BKB», «контрпики на АМ».");
} else {
for (var i = 0; i < chatHistory.length; i++) {
addChatMessage(l, chatHistory[i].role, chatHistory[i].text, false);
}
}
l.scrollTop = l.scrollHeight;
}, 0);

return frag;
}

function renderChatLocked() {
var frag = document.createDocumentFragment();
var card = UI.card("✦ ИИ-ассистент");
var wrap = el("div", { style: "text-align:center;padding:40px 20px;" });

wrap.appendChild(el("div", { style: "font-size:52px;margin-bottom:16px;filter:grayscale(0.3);" }, "🔒"));
wrap.appendChild(el("div", {
style: "font-size:18px;font-weight:700;color:var(--text);margin-bottom:10px;"
}, "ИИ-ассистент доступен в JETCH+"));
wrap.appendChild(el("div", {
class: "dim",
style: "font-size:13px;line-height:1.6;max-width:440px;margin:0 auto 20px;"
}, "Расширенная база знаний: 40+ героев, 30+ предметов, 20+ механик, " +
"контрпики, синергии, тайминги. Открывается с подпиской JETCH+."));

var features = el("div", { style: "text-align:left;max-width:320px;margin:0 auto 20px;font-size:12px;line-height:1.8;" });
features.appendChild(el("div", {}, "✓ Гайды по героям и предметам"));
features.appendChild(el("div", {}, "✓ Контрпики и синергии"));
features.appendChild(el("div", {}, "✓ Тайминги Рошана, рун, башен"));
features.appendChild(el("div", {}, "✓ Советы по механикам"));
wrap.appendChild(features);

var upBtn = UI.btn("✦ Активировать JETCH+");
upBtn.addEventListener("click", function () { switchPage("settings"); });
wrap.appendChild(upBtn);

card.appendChild(wrap);
frag.appendChild(card);
return frag;
}

function addChatMessage(log, role, text, scroll) {
if (scroll === undefined) scroll = true;
var isUser = role === "user";
var row = el("div", {
style: "display:flex;gap:10px;align-items:flex-start;" + (isUser ? "flex-direction:row-reverse;" : "")
});
var avatar = el("div", {
style: "width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;background:" + (isUser ? "var(--accent-bg)" : "var(--cyan-bg)") + ";color:" + (isUser ? "var(--accent-light)" : "var(--cyan)") + ";border:1px solid " + (isUser ? "var(--accent)" : "var(--cyan)") + ";"
}, isUser ? "Я" : "AI");
var bubble = el("div", {
style: "max-width:80%;padding:10px 14px;border-radius:12px;font-size:13px;line-height:1.55;white-space:pre-wrap;word-break:break-word;background:" + (isUser ? "var(--accent-bg)" : "var(--bg-elev)") + ";border:1px solid " + (isUser ? "var(--accent)" : "var(--border)") + ";color:var(--text);"
}, text);
row.appendChild(avatar);
row.appendChild(bubble);
log.appendChild(row);
if (scroll) log.scrollTop = log.scrollHeight;
}

async function onChatSend() {
var plus = Store.get("license.active", false) === true;
if (!plus) return;

var inp = qs("#chatInput");
var log = qs("#chatLog");
var btn = qs("#chatSendBtn");
if (!inp || !log) return;
var q = (inp.value || "").trim();
if (!q) return;

inp.value = "";
addChatMessage(log, "user", q);
chatHistory.push({ role: "user", text: q });

Store.set("aiquestions", (Store.get("aiquestions", 0) || 0) + 1);
if (typeof Daily !== "undefined") Daily.bump("chat");
if (typeof Achievements !== "undefined") Achievements.check();

btn.disabled = true;
btn.textContent = "Думаю...";

var typing = el("div", {
class: "dim", style: "font-size:11px;padding-left:44px;font-style:italic;"
}, "✦ ассистент печатает...");
log.appendChild(typing);
log.scrollTop = log.scrollHeight;

await new Promise(function (r) { setTimeout(r, 350); });

var answer;
try { answer = kbAnswer(q); }
catch (e) { answer = { text: "Ошибка в базе знаний: " + (e.message || e), kind: "none" }; }

typing.remove();
addChatMessage(log, "assistant", answer.text);
chatHistory.push({ role: "assistant", text: answer.text });

if (chatHistory.length > 100) chatHistory = chatHistory.slice(-100);
Store.set("chathistory", chatHistory);

btn.disabled = false;
btn.textContent = "Отправить";
inp.focus();
}