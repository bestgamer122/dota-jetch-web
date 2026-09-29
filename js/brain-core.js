/* DOTA JETCH — BRAIN CORE v1.1 */

var BrainCore = {
identity: { name: "DotaJetch AI", version: "12.0", creator: "bestgamer122", purpose: "помогать с Dota 2" },
greetings: ["Привет! Чем помочь?", "Здравствуй! Спрашивай.", "Привет-привет! Готов помочь.", "Хай! Что нужно?", "Здорово! Слушаю.", "Приветствую. Спроси про Dota или что угодно."],
howAreYou: ["Всё отлично, работаю на полную!", "Хорошо, спасибо. А у тебя как?", "Лучше всех! Готов помочь.", "Не жалуюсь. Готов к работе.", "Всё в порядке. Что нового у тебя?"],
thanks: ["Пожалуйста!", "Рад помочь!", "Обращайся!", "Всегда пожалуйста.", "Не за что :)"],
farewell: ["Пока! Заходи ещё.", "До связи!", "Удачи! Буду тут.", "Пока-пока!", "Хорошего дня!"],
whoAreYou: [
"Я DotaJetch AI — локальный ИИ-ассистент v12.0. Знаю Dota 2, понимаю эмоции, учусь на ошибках. Меня можно учить: «запомни: вопрос = ответ».",
"Я DotaJetch AI. Работаю прямо в браузере. Умею: Dota 2, small talk, утилиты, обучение от тебя, самоанализ.",
"DotaJetch AI на связи. Понимаю эмоции, умею считать, шутить, поддерживать. Спроси «что ты умеешь»."
],
whatCanYouDo: [
"Вот что я умею (v12.0):\n\n• Dota: герои, предметы, механики, контрпики, синергии\n• Эмоции: понимаю «грустно», «бесит», «устал»\n• Утилиты: посчитать, кубик, монетка, пароль\n• Инфо: время, дата, статистика\n• Мнения: что думаю про героя\n• Факты и шутки\n• Учусь: «запомни: вопрос = ответ»\n• Фидбек: скажи «правильно» / «не то»\n• Самопроверка: оцениваю свой ответ\n\nСпроси что-нибудь."
],
help: [
"Команды (v12.0):\n\n• «что ты умеешь» — возможности\n• «запомни: X = Y» — научить\n• «забудь: X» — забыть\n• «что ты знаешь» — память\n• «покажи мои ошибки» — фидбек\n• «посчитай 2+2», «кубик», «монетка», «пароль на 20»\n• «который час», «какой день»\n• «моя статистика», «расскажи о себе»\n• «мне грустно» — поддержка\n• «правильно» / «не то» — фидбек после ответа"
],
jokes: [
"Пудж без хука — как Carry без фарма. Грустно.",
"Что сказал Techies перед смертью? «Уже поздно... а нет, еще рано!»",
"Почему Phantom Assassin не ходит в мид? Она боится крипнуться.",
"Рошан никогда не спит. А ты?"
]
};

var BrainCoreIntent = {
detect: function (q) {
var s = String(q || "").toLowerCase().trim();
if (!s) return "empty";
if (/покажи мои ошибки|мой фидбек|статистик[аи] ошибок|сколько я ошибался/.test(s)) return "feedbackstats";
if (/рефлекси|самопроверк|подумай о себе|что ты о себе знаешь/.test(s)) return "reflect";
if (/^(привет|прив|хай|здоров|ку|hi|hello|hey|здравствуй|добрый (день|вечер|утро))/.test(s)) return "greeting";
if (/как (дела|ты|у тебя|жизнь|оно)/.test(s) || /что делаешь/.test(s)) return "howareyou";
if (/^(спасиб|благодар|спс|thanks|thx)/.test(s)) return "thanks";
if (/^(пока|до свид|бай|увидимся|bye)/.test(s)) return "farewell";
if (/кто (ты|вы)|ты кто|как тебя зовут|тво[её] имя|представься|что ты за/.test(s)) return "whoareyou";
if (/что (ты )?умеешь|твои возможности|чем можешь помоч|что можешь/.test(s)) return "whatcanyoudo";
if (/^помощь<span class="katex"><span class="katex-mathml"><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><msup><mi mathvariant="normal">∣</mi><mi>h</mi></msup><mi>e</mi><mi>l</mi><mi>p</mi></mrow><annotation encoding="application/x-tex">|^help</annotation></semantics></math></span><span class="katex-html" aria-hidden="true"><span class="base"><span class="strut" style="height:1.0991em;vertical-align:-0.25em;"></span><span class="mord"><span class="mord">∣</span><span class="msupsub"><span class="vlist-t"><span class="vlist-r"><span class="vlist" style="height:0.8491em;"><span style="top:-3.063em;margin-right:0.05em;"><span class="pstrut" style="height:2.7em;"></span><span class="sizing reset-size6 size3 mtight"><span class="mord mathnormal mtight">h</span></span></span></span></span></span></span></span><span class="mord mathnormal">e</span><span class="mord mathnormal">lp</span></span></span></span>|^команды$|как (тобой|тебя) польз/.test(s)) return "help";
if (/шутк|анекдот|рассмеши|пошути/.test(s)) return "joke";
if (/^(что ты знаешь|покажи знания|твоя память|чему (я тебя )?научил)/.test(s)) return "whatknow";
return null;
},
pick: function (arr) { return arr[Math.floor(Math.random() * arr.length)]; }
};