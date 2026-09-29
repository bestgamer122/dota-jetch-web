/* DOTA JETCH — BRAIN TIME v1.0 */

var BrainTime = {
months: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
days: ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"],
now: function () { return new Date(); },
time: function () { var d = this.now(); return "Сейчас " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); },
date: function () { var d = this.now(); return "Сегодня " + d.getDate() + " " + this.months[d.getMonth()] + " " + d.getFullYear() + " года"; },
weekday: function () { var d = this.now(); return "Сегодня " + this.days[d.getDay()]; },
fullDate: function () { var d = this.now(); return this.days[d.getDay()] + ", " + d.getDate() + " " + this.months[d.getMonth()] + " " + d.getFullYear() + ", " + String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); },
detect: function (q) {
var s = String(q || "").toLowerCase();
if (/котор(ый|ое) час|сколько времени|текущее время|время сейчас|time/.test(s)) return "time";
if (/какой (сегодня )?день|какое сегодня число|дата|date/.test(s)) return "date";
if (/какой сегодня день недели|день недели/.test(s)) return "weekday";
if (/полн(ую|ая) дату|дата и время|полная дата/.test(s)) return "fulldate";
return null;
},
answer: function (kind) {
if (kind === "time") return this.time();
if (kind === "date") return this.date();
if (kind === "weekday") return this.weekday();
if (kind === "fulldate") return this.fullDate();
return null;
}
};