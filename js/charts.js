var Charts = {
  line: function (values, opts) {
    opts = opts || {};
    var w = opts.width || 600, h = opts.height || 180;
    var pad = { l: 40, r: 14, t: 14, b: 26 };
    var color = opts.color || "#a78bfa";
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("width", "100%");
    svg.style.cssText = "display:block;width:100%;height:auto;";
    if (!values || !values.length) {
      var t = document.createElementNS(ns, "text");
      t.setAttribute("x", String(w / 2));
      t.setAttribute("y", String(h / 2));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", "rgba(180,184,200,0.7)");
      t.textContent = "Нет данных";
      svg.appendChild(t);
      return svg;
    }
    var innerW = w - pad.l - pad.r, innerH = h - pad.t - pad.b;
    var min = Math.min.apply(null, values), max = Math.max.apply(null, values);
    var range = (max - min) || 1;
    var stepX = values.length > 1 ? innerW / (values.length - 1) : 0;
    var pts = values.map(function (v, i) {
      return [pad.l + i * stepX, pad.t + innerH - ((v - min) / range) * innerH];
    });
    var pathD = "";
    for (var i = 0; i < pts.length; i++) pathD += (i === 0 ? "M " : " L ") + pts[i][0] + " " + pts[i][1];
    var path = document.createElementNS(ns, "path");
    path.setAttribute("d", pathD);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", color);
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
    for (var j = 0; j < pts.length; j++) {
      var c = document.createElementNS(ns, "circle");
      c.setAttribute("cx", String(pts[j][0]));
      c.setAttribute("cy", String(pts[j][1]));
      c.setAttribute("r", "3");
      c.setAttribute("fill", "#0b0c10");
      c.setAttribute("stroke", color);
      c.setAttribute("stroke-width", "2");
      svg.appendChild(c);
    }
    return svg;
  },
  render: function () {
    var frag = document.createDocumentFragment();
    var list = History.all();
    var head = UI.card("Прогресс");
    if (!list.length || list.length < 2) {
      head.appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "Нужно минимум 2 матча."));
      frag.appendChild(head);
      return frag;
    }
    head.appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "Статистика по " + list.length + " матчам."));
    frag.appendChild(head);
    var chrono = list.slice().reverse();
    var kdaArr = chrono.map(function (m) { return Math.round(((m.kills + m.assists) / Math.max(m.deaths, 1)) * 100) / 100; });
    var kdaCard = UI.card("KDA по матчам");
    kdaCard.appendChild(Charts.line(kdaArr, { color: "#a78bfa" }));
    frag.appendChild(kdaCard);
    var wins = list.filter(function (m) { return m.won; }).length;
    var wr = Math.round(wins / list.length * 100);
    var stat = el("div", { class: "stat-grid" });
    stat.appendChild(UI.statCard("W", "var(--green)", "var(--green-bg)", "Побед", String(wins), "-"));
    stat.appendChild(UI.statCard("L", "var(--red)", "var(--red-bg)", "Поражений", String(list.length - wins), "-"));
    stat.appendChild(UI.statCard("%", "var(--accent-light)", "var(--accent-bg)", "Винрейт", wr + "%", "-"));
    frag.appendChild(stat);
    return frag;
  }
};
