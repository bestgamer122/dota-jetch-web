function isLiteMode() { return Store.get("litemode", false) === true; }
function applyLiteMode(on) {
  if (on) document.body.classList.add("lite-mode");
  else document.body.classList.remove("lite-mode");
  Store.set("litemode", !!on);
}

function closeAllDropdowns() {
  qsa(".dropdown-list").forEach(function (l) { l.classList.remove("open"); });
  qsa(".dropdown").forEach(function (d) { d.classList.remove("open"); });
  qsa(".card").forEach(function (c) { c.classList.remove("card-elevated"); });
}

function makeDropdown(opts, currentValue, onChange) {
  var wrap = el("div", { class: "dropdown" });
  var btn = el("button", { class: "dropdown-btn", type: "button" });
  var label = el("span", { class: "dropdown-label" });
  var arrow = el("span", { class: "dropdown-arrow" });
  arrow.innerHTML = '';
  btn.appendChild(label);
  btn.appendChild(arrow);
  wrap.appendChild(btn);
  var list = el("div", { class: "dropdown-list" });
  function setLabel(v) {
    for (var i = 0; i < opts.length; i++) {
      if (opts[i].value === v) { label.textContent = opts[i].label; return; }
    }
    label.textContent = v;
  }
  setLabel(currentValue);
  for (var i = 0; i < opts.length; i++) {
    (function (o) {
      var item = el("button", { class: "dropdown-item" + (o.value === currentValue ? " active" : ""), type: "button" });
      if (o.color) item.appendChild(el("span", { class: "dropdown-dot", style: "background:" + o.color + ";" }));
      item.appendChild(el("span", { class: "dropdown-item-label" }, o.label));
      item.addEventListener("click", function (e) {
        e.stopPropagation();
        closeAllDropdowns();
        var items = list.querySelectorAll(".dropdown-item");
        for (var j = 0; j < items.length; j++) items[j].classList.remove("active");
        item.classList.add("active");
        setLabel(o.value);
        onChange(o.value);
      });
      list.appendChild(item);
    })(opts[i]);
  }
  wrap.appendChild(list);
  btn.addEventListener("click", function (e) {
    e.stopPropagation();
    var wasOpen = list.classList.contains("open");
    closeAllDropdowns();
    if (!wasOpen) {
      list.classList.add("open");
      wrap.classList.add("open");
      var p = wrap.parentNode;
      while (p && p !== document.body) {
        if (p.classList && p.classList.contains("card")) { p.classList.add("card-elevated"); break; }
        p = p.parentNode;
      }
    }
  });
  return wrap;
}

function renderSettings() {
  var frag = document.createDocumentFragment();
  var plus = Store.get("license.active", false) === true;
  var plan = UI.card("Подписка");
  if (plus) {
    plan.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "JETCH+ активен"));
    plan.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:14px;line-height:1.7;" }, "+ Безлимитные анализы", el("br"), "+ ИИ-ассистент"));
    plan.appendChild(UI.btn("Отключить JETCH+", { variant: "ghost", onclick: function () {
      if (!confirm("Отключить JETCH+?")) return;
      Store.set("license.active", false);
      showDialog("Готово", "Ты вернулся к FREE", "success");
      setTimeout(function () { location.reload(); }, 800);
    }}));
  } else {
    plan.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "FREE"));
    plan.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:10px;line-height:1.7;" }, "+ 5 анализов в день", el("br"), "+ История, дневник", el("br"), "- ИИ-ассистент"));
    plan.appendChild(UI.btn("Активировать JETCH+", { onclick: function () {
      Store.set("license.active", true);
      showDialog("Готово", "JETCH+ активирован", "success");
      setTimeout(function () { location.reload(); }, 800);
    }}));
  }
  frag.appendChild(plan);
    var theme = UI.card("Тема оформления");
  var themeOpts = [];
  for (var key in THEMES) {
    if (!THEMES.hasOwnProperty(key)) continue;
    themeOpts.push({ value: key, label: THEMES[key].label, color: THEMES[key].vars["--accent"] });
  }
  theme.appendChild(makeDropdown(themeOpts, loadTheme(), function (v) {
    applyTheme(v);
    try { if (typeof Daily !== "undefined") Daily.bump("theme"); } catch (e) {}
    try { if (typeof Achievements !== "undefined") Achievements.onThemeChange(); } catch (e) {}
    showDialog("Тема", THEMES[v].label, "success");
  }));
  frag.appendChild(theme);

  var aiCard = UI.card("ИИ-ассистент");
  var aiLbl = el("label", { style: "display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;" });
  var aiTgl = el("input", { type: "checkbox" });
  aiTgl.style.cssText = "width:18px;height:18px;cursor:pointer;";
  aiTgl.checked = Store.get("ai.enabled", true) !== false;
  aiTgl.addEventListener("change", function () {
    Store.set("ai.enabled", aiTgl.checked);
    showDialog("Готово", aiTgl.checked ? "ИИ-разбор включён" : "ИИ-разбор выключен", "success");
  });
  aiLbl.appendChild(aiTgl);
  aiLbl.appendChild(document.createTextNode("Показывать ИИ-разбор матча"));
  aiCard.appendChild(aiLbl);
  frag.appendChild(aiCard);

  var notify = UI.card("Уведомления");
  var nLbl = el("label", { style: "display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;" });
  var nTgl = el("input", { type: "checkbox" });
  nTgl.style.cssText = "width:18px;height:18px;cursor:pointer;";
  nTgl.checked = Store.get("notify.enabled", true) !== false;
  nTgl.addEventListener("change", function () {
    Store.set("notify.enabled", nTgl.checked);
    showDialog("Готово", nTgl.checked ? "Уведомления включены" : "Уведомления выключены", "success");
  });
  nLbl.appendChild(nTgl);
  nLbl.appendChild(document.createTextNode("Показывать уведомления"));
  notify.appendChild(nLbl);
  frag.appendChild(notify);

  var auto = UI.card("Автосохранение");
  var aLbl = el("label", { style: "display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;" });
  var aTgl = el("input", { type: "checkbox" });
  aTgl.style.cssText = "width:18px;height:18px;cursor:pointer;";
  aTgl.checked = Store.get("autosave.enabled", true) !== false;
  aTgl.addEventListener("change", function () {
    Store.set("autosave.enabled", aTgl.checked);
    showDialog("Готово", aTgl.checked ? "Автосохранение включено" : "Автосохранение выключено", "success");
  });
  aLbl.appendChild(aTgl);
  aLbl.appendChild(document.createTextNode("Сохранять историю автоматически"));
  auto.appendChild(aLbl);
  frag.appendChild(auto);

  var perf = UI.card("Производительность");
  perf.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" }, "Lite-режим для слабых ПК. Отключает тяжёлые анимации, размытие, tilt."));
  var lbl = el("label", { style: "display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;" });
  var tgl = el("input", { type: "checkbox" });
  tgl.style.cssText = "width:18px;height:18px;cursor:pointer;";
  tgl.checked = isLiteMode();
  tgl.addEventListener("change", function () {
    applyLiteMode(tgl.checked);
    showDialog("Готово", tgl.checked ? "Lite включён" : "Lite отключён", "success");
  });
  lbl.appendChild(tgl);
  lbl.appendChild(document.createTextNode("Lite-режим"));
  perf.appendChild(lbl);
  frag.appendChild(perf);

  var data = UI.card("Данные");
  var eb = UI.btn("Экспорт / Импорт");
  eb.addEventListener("click", function () { switchPage("export"); });
  data.appendChild(eb);
  frag.appendChild(data);

  return frag;
}
function renderAbout() {
  var frag = document.createDocumentFragment();
  var head = UI.card("");
  head.style.cssText = "background:linear-gradient(135deg,var(--accent-dark),var(--accent-bg));border-color:var(--accent);";
  head.appendChild(el("div", { style: "font-size:22px;font-weight:bold;color:var(--accent-light);" }, "DOTA JETCH AI 2.0"));
  head.appendChild(el("div", { class: "muted", style: "font-size:12px;margin-top:8px;" }, "Web version v8.0"));
  frag.appendChild(head);

  var feat = UI.card("Что работает");
  var list = [
    "Анализ матчей с оценкой S/A/B/C/D",
    "ИИ-разбор матча (JETCH+)",
    "Анализ смертей и рекомендации по предметам",
    "Реальные иконки героев и предметов",
    "История и графики KDA",
    "Дневник с тегами",
    "24 достижения",
    "3 мини-игры",
    "Экспорт / Импорт",
    "Задания дня",
    "ИИ-ассистент (JETCH+)",
    "Lite-режим для слабых ПК",
    "Кастомные выпадающие списки",
    "Уведомления, автосохранение"
  ];
  for (var i = 0; i < list.length; i++) {
    feat.appendChild(el("div", { style: "padding:6px 0;font-size:12px;color:var(--text-muted);" }, "* " + list[i]));
  }
  frag.appendChild(feat);

  var ver = UI.card("Версия");
  ver.appendChild(el("div", { class: "dim", style: "font-size:11px;" }, "v" + APP_VERSION));
  frag.appendChild(ver);

  return frag;
}

function updateSidebarPlan() {
  var plus = Store.get("license.active", false) === true;
  var t = qs("#planTitle"), i = qs("#planInfo"), v = qs("#planValue");
  if (t) t.textContent = plus ? "JETCH+" : "FREE";
  if (i) i.textContent = plus ? "Безлимит" : "5 анализов/день";
  if (v) v.textContent = plus ? "∞" : (typeof analyzeQuotaRemaining === "function" ? String(analyzeQuotaRemaining()) + " / 5" : "5 / 5");
}
