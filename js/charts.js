/* DOTA JETCH — CHARTS
Простые SVG-графики прогресса (без библиотек). */

const Charts = {
/* Линейный график по массиву точек */
line: function (values, opts) {
opts = opts || {};
const w = opts.width || 600;
const h = opts.height || 180;
const pad = { l: 40, r: 14, t: 14, b: 26 };
const color = opts.color || "#a78bfa";
const bg = opts.bg || "rgba(139,92,246,0.08)";
const gridColor = opts.gridColor || "rgba(255,255,255,0.06)";
const textColor = opts.textColor || "rgba(180,184,200,0.75)";

const innerW = w - pad.l - pad.r;
const innerH = h - pad.t - pad.b;

const svgNS = "http://www.w3.org/2000/svg";
const svg = document.createElementNS(svgNS, "svg");
svg.setAttribute("viewBox", "0 0 " + w + " " + h);
svg.setAttribute("width", "100%");
svg.setAttribute("preserveAspectRatio", "none");
svg.style.cssText = "display:block;width:100%;height:auto;overflow:visible;";

if (!values || !values.length) {
const t = document.createElementNS(svgNS, "text");
t.setAttribute("x", String(w / 2));
t.setAttribute("y", String(h / 2));
t.setAttribute("text-anchor", "middle");
t.setAttribute("fill", textColor);
t.setAttribute("font-size", "13");
t.textContent = "Нет данных";
svg.appendChild(t);
return svg;
}

const min = opts.min !== undefined ? opts.min : Math.min(...values);
const max = opts.max !== undefined ? opts.max : Math.max(...values);
const range = (max - min) || 1;

const stepX = values.length > 1 ? innerW / (values.length - 1) : 0;

const pts = values.map(function (v, i) {
const x = pad.l + i * stepX;
const y = pad.t + innerH - ((v - min) / range) * innerH;
return [x, y];
});

/* Горизонтальные линии сетки */
for (let i = 0; i <= 4; i++) {
const y = pad.t + (innerH / 4) * i;
const line = document.createElementNS(svgNS, "line");
line.setAttribute("x1", String(pad.l));
line.setAttribute("x2", String(w - pad.r));
line.setAttribute("y1", String(y));
line.setAttribute("y2", String(y));
line.setAttribute("stroke", gridColor);
line.setAttribute("stroke-width", "1");
svg.appendChild(line);

const label = document.createElementNS(svgNS, "text");
label.setAttribute("x", String(pad.l - 6));
label.setAttribute("y", String(y + 4));
label.setAttribute("text-anchor", "end");
label.setAttribute("fill", textColor);
label.setAttribute("font-size", "10");
label.setAttribute("font-family", "JetBrains Mono, monospace");
const val = max - (range / 4) * i;
label.textContent = Math.round(val);
svg.appendChild(label);
}

/* Область под линией */
let areaD = "M " + pts[0][0] + " " + (pad.t + innerH);
for (const p of pts) areaD += " L " + p[0] + " " + p[1];
areaD += " L " + pts[pts.length - 1][0] + " " + (pad.t + innerH) + " Z";
const area = document.createElementNS(svgNS, "path");
area.setAttribute("d", areaD);
area.setAttribute("fill", bg);
svg.appendChild(area);

/* Линия */
let pathD = "";
for (let i = 0; i < pts.length; i++) {
pathD += (i === 0 ? "M " : " L ") + pts[i][0] + " " + pts[i][1];
}
const path = document.createElementNS(svgNS, "path");
path.setAttribute("d", pathD);
path.setAttribute("fill", "none");
path.setAttribute("stroke", color);
path.setAttribute("stroke-width", "2");
path.setAttribute("stroke-linecap", "round");
path.setAttribute("stroke-linejoin", "round");
svg.appendChild(path);

/* Точки */
for (let i = 0; i < pts.length; i++) {
const c = document.createElementNS(svgNS, "circle");
c.setAttribute("cx", String(pts[i][0]));
c.setAttribute("cy", String(pts[i][1]));
c.setAttribute("r", "3");
c.setAttribute("fill", "#0b0c10");
c.setAttribute("stroke", color);
c.setAttribute("stroke-width", "2");
const title = document.createElementNS(svgNS, "title");
title.textContent = (opts.label || "Значение") + ": " + values[i];
c.appendChild(title);
svg.appendChild(c);
}

/* Подписи x (начало, середина, конец) */
if (values.length > 1 && opts.xLabels) {
const idxs = [0, Math.floor((values.length - 1) / 2), values.length - 1];
for (const i of idxs) {
const t = document.createElementNS(svgNS, "text");
t.setAttribute("x", String(pts[i][0]));
t.setAttribute("y", String(h - 8));
t.setAttribute("text-anchor", "middle");
t.setAttribute("fill", textColor);
t.setAttribute("font-size", "10");
t.setAttribute("font-family", "JetBrains Mono, monospace");
t.textContent = opts.xLabels[i] || String(i + 1);
svg.appendChild(t);
}
}

return svg;
},

/* Страница с графиками */
render: function () {
const frag = document.createDocumentFragment();
const list = History.all();

const head = UI.card("📈 Прогресс");
if (!list.length || list.length < 2) {
head.appendChild(el("div", { class: "dim", style: "font-size:12px;line-height:1.6;" },
"Нужно минимум 2 разобранных матча. Разбери ещё матчи во вкладке «Анализ матча»."));
frag.appendChild(head);
return frag;
}

head.appendChild(el("div", { class: "dim", style: "font-size:12px;" },
"Статистика по последним " + list.length + " матчам. Наведи на точку, чтобы увидеть значение."));
frag.appendChild(head);

/* Готовим данные в хронологическом порядке (старые → новые) */
const chrono = list.slice().reverse();

/* KDA */
const kdaArr = chrono.map(function (m) {
return Math.round(((m.kills + m.assists) / Math.max(m.deaths, 1)) * 100) / 100;
});
const xLabels = chrono.map(function (m) { return "#" + m.matchId; });
const kdaCard = UI.card("🎯 KDA по матчам");
kdaCard.appendChild(Charts.line(kdaArr, {
label: "KDA",
color: "#a78bfa",
bg: "rgba(139,92,246,0.10)",
xLabels: xLabels,
}));
frag.appendChild(kdaCard);

/* Победы/поражения (1/0) */
const winArr = chrono.map(function (m) { return m.won ? 1 : 0; });
const winCard = UI.card("🏆 Результаты");
winCard.appendChild(Charts.line(winArr, {
label: "Победа",
color: "#22c55e",
bg: "rgba(34,197,94,0.10)",
min: 0, max: 1,
xLabels: xLabels,
}));
/* Сводка */
const wins = list.filter(function (m) { return m.won; }).length;
const wr = list.length ? Math.round(wins / list.length * 100) : 0;
winCard.appendChild(el("div", { class: "row", style: "gap:20px;margin-top:12px;flex-wrap:wrap;" },
el("div", {}, el("div", { class: "dim", style: "font-size:10px;letter-spacing:1px;" }, "ПОБЕДЫ"),
el("div", { style: "font-size:20px;font-weight:700;color:var(--green);" }, String(wins))),
el("div", {}, el("div", { class: "dim", style: "font-size:10px;letter-spacing:1px;" }, "ПОРАЖЕНИЯ"),
el("div", { style: "font-size:20px;font-weight:700;color:var(--red);" }, String(list.length - wins))),
el("div", {}, el("div", { class: "dim", style: "font-size:10px;letter-spacing:1px;" }, "ВИНРЕЙТ"),
el("div", { style: "font-size:20px;font-weight:700;color:var(--accent-light);" }, wr + "%"))
));
frag.appendChild(winCard);

/* K / D / A средние */
const avgK = Math.round(chrono.reduce(function (a, m) { return a + m.kills; }, 0) / chrono.length * 10) / 10;
const avgD = Math.round(chrono.reduce(function (a, m) { return a + m.deaths; }, 0) / chrono.length * 10) / 10;
const avgA = Math.round(chrono.reduce(function (a, m) { return a + m.assists; }, 0) / chrono.length * 10) / 10;
const avgCard = UI.card("📊 Средние значения");
const avgGrid = el("div", { style: "display:grid;grid-template-columns:repeat(3,1fr);gap:14px;max-width:440px;" });
[["Убийства", avgK, "var(--green)"], ["Смерти", avgD, "var(--red)"], ["Помощь", avgA, "var(--cyan)"]]
.forEach(function (item) {
const t = el("div", { style: "background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;padding:14px;text-align:center;" });
t.appendChild(el("div", { class: "dim", style: "font-size:10px;letter-spacing:1px;text-transform:uppercase;" }, item[0]));
t.appendChild(el("div", { style: "font-size:24px;font-weight:800;color:" + item[2] + ";margin-top:6px;" }, String(item[1])));
avgGrid.appendChild(t);
});
avgCard.appendChild(avgGrid);
frag.appendChild(avgCard);

return frag;
},
};