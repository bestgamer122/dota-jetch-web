/* DOTA JETCH — SETTINGS v7.0
   Убрана карточка настройки нейросети — всё работает автоматически через Pollinations */

var FOREVER_KEY = "DANYA8228PRO";

function isLiteMode() {
  return Store.get("litemode", false) === true;
}

function applyLiteMode(on) {
  if (on) document.body.classList.add("lite-mode");
  else document.body.classList.remove("lite-mode");
  Store.set("litemode", !!on);
}

function loadKeys() {
  var raw = Store.get("jetch_keys", {});
  return (raw && typeof raw === "object") ? raw : {};
}

function saveKeys(keys) {
  Store.set("jetch_keys", keys);
}

function activateKey(key) {
  key = (key || "").trim().toUpperCase();
  if (!key) return { ok: false, msg: "Введи ключ." };

  if (key === FOREVER_KEY) {
    Store.set("license.active", true);
    Store.set("license.forever", true);
    Store.set("license.expires", null);
    return { ok: true, msg: "Бессрочный JETCH+ активирован!" };
  }

  if (!/^JETCH-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(key)) {
    return { ok: false, msg: "Неверный формат ключа." };
  }

  var keys = loadKeys();
  if (keys[key]) return { ok: false, msg: "Этот ключ уже использован." };

  var expires = new Date();
  expires.setDate(expires.getDate() + 7);
  keys[key] = expires.toISOString();
  saveKeys(keys);

  Store.set("license.active", true);
  Store.set("license.forever", false);
  Store.set("license.expires", expires.toISOString());
  return { ok: true, msg: "JETCH+ активирован на 7 дней" };
}

function checkLicense() {
  if (Store.get("license.forever", false)) return true;
  var exp = Store.get("license.expires", null);
  if (!exp) return Store.get("license.active", false) === true;
  if (new Date(exp) > new Date()) return true;
  Store.set("license.active", false);
  return false;
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

function renderPlanCard(frag) {
  var plus = checkLicense();
  var plan = UI.card("Подписка JETCH+");

  if (plus) {
    var forever = Store.get("license.forever", false);
    var exp = Store.get("license.expires", null);
    var expText = forever ? "Бессрочная лицензия" : (exp ? "до " + new Date(exp).toLocaleDateString() : "");

    plan.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "✓ JETCH+ активен"));
    plan.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:14px;" }, expText));

    var offBtn = UI.btn("Отключить", { variant: "ghost" });
    offBtn.addEventListener("click", function () {
      if (!confirm("Отключить JETCH+?")) return;
      Store.set("license.active", false);
      Store.set("license.forever", false);
      Store.set("license.expires", null);
      location.reload();
    });
    plan.appendChild(offBtn);
  } else {
    plan.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "Возможности:"));

    var feats = el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" });
    feats.appendChild(el("div", {}, "+ Бесконечные анализы"));
    feats.appendChild(el("div", {}, "+ ИИ чат (локальная + внешняя)"));
    feats.appendChild(el("div", {}, "+ Все функции"));
    plan.appendChild(feats);

    plan.appendChild(el("div", { style: "font-size:11px;color:var(--text-muted);margin-bottom:8px;" }, "КЛЮЧ АКТИВАЦИИ:"));

    var keyInp = UI.input("");
    keyInp.id = "licenseKeyInput";
    keyInp.style.marginBottom = "10px";
    plan.appendChild(keyInp);

    var btnWrap = el("div", { style: "display:flex;justify-content:flex-start;" });
    var actBtn = UI.btn("Активировать");
    actBtn.style.width = "auto";
    actBtn.style.minWidth = "160px";
    actBtn.addEventListener("click", function () {
      var inp = qs("#licenseKeyInput");
      var res = activateKey(inp.value);
      if (res.ok) { alert(res.msg); location.reload(); }
      else { alert("Ошибка: " + res.msg); }
    });
    btnWrap.appendChild(actBtn);
    plan.appendChild(btnWrap);
  }
  frag.appendChild(plan);
}

function renderThemeCard(frag) {
  var theme = UI.card("Тема оформления");
  var themeOpts = [];
  for (var key in THEMES) {
    if (THEMES.hasOwnProperty(key)) themeOpts.push({ value: key, label: THEMES[key].label });
  }

  theme.appendChild(makeDropdown(themeOpts, loadTheme(), function (v) {
    applyTheme(v);
    try { if (typeof Daily !== "undefined") Daily.bump("theme"); } catch (e) {}
    try { if (typeof Achievements !== "undefined") Achievements.onThemeChange(); } catch (e) {}
    showDialog("Тема", THEMES[v].label, "success");
  }));

  frag.appendChild(theme);
}

function renderSoundCard(frag) {
  if (typeof Sound === "undefined") return;
  var card = UI.card("Звуки");

  var info = el("div", { class: "dim", style: "font-size:11px;margin-bottom:14px;line-height:1.5;" },
    "Звуки работают только в мини-играх: попадания, промахи, победа и ответы в викторине.");
  card.appendChild(info);

  var volRow = el("div", { style: "display:flex;align-items:center;gap:10px;margin-bottom:14px;" });
  volRow.appendChild(el("span", { class: "dim", style: "font-size:11px;min-width:80px;" }, "Громкость"));

  var volInp = el("input", { type: "range", min: "0", max: "100", value: String(Math.round(Sound.volume * 100)) });
  volInp.style.cssText = "flex:1;cursor:pointer;";
  volRow.appendChild(volInp);

  var volVal = el("span", { class: "dim", style: "font-size:11px;min-width:38px;text-align:right;font-family:'JetBrains Mono',monospace;" }, Math.round(Sound.volume * 100) + "%");
  volRow.appendChild(volVal);

  volInp.addEventListener("input", function () {
    var v = parseInt(volInp.value, 10) / 100;
    Sound.setVolume(v);
    volVal.textContent = volInp.value + "%";
    if (v === 0) {
      volVal.style.color = "var(--text-dim)";
    } else {
      volVal.style.color = "";
    }
  });
  volInp.addEventListener("change", function () {
    try { Sound.test(); } catch (e) {}
  });

  card.appendChild(volRow);

  var testBtn = UI.btn("🔊 Проверить звук", { variant: "ghost" });
  testBtn.style.width = "auto";
  testBtn.style.minWidth = "180px";
  testBtn.addEventListener("click", function () {
    try { Sound.test(); } catch (e) {}
  });
  card.appendChild(testBtn);

  var hint = el("div", { class: "dim", style: "font-size:10.5px;margin-top:12px;line-height:1.5;" },
    "Звуки генерируются в реальном времени через Web Audio API. Не грузят сеть.");
  card.appendChild(hint);

  frag.appendChild(card);
}

function renderPerfCard(frag) {
  var perf = UI.card("Производительность");
  var lbl = el("label", { style: "display:flex;align-items:center;gap:10px;font-size:13px;cursor:pointer;" });
  var tgl = el("input", { type: "checkbox" });
  tgl.style.cssText = "width:18px;height:18px;cursor:pointer;flex-shrink:0;";
  tgl.checked = isLiteMode();
  tgl.addEventListener("change", function () { applyLiteMode(tgl.checked); });
  lbl.appendChild(tgl);
  lbl.appendChild(document.createTextNode("Lite-режим"));
  perf.appendChild(lbl);
  frag.appendChild(perf);
}

function renderSettings() {
  var frag = document.createDocumentFragment();
  renderPlanCard(frag);
  renderThemeCard(frag);
  renderSoundCard(frag);
  renderPerfCard(frag);
  return frag;
}
