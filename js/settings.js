/* DOTA JETCH — SETTINGS v4.3
   - Добавлена карточка «Профиль» с ником и сменой ника
   - Убрана карточка «Данные» */

var FOREVER_KEY = "DANYA8228PRO";

function isLiteMode() { return Store.get("litemode", false) === true; }
function applyLiteMode(on) {
  if (on) document.body.classList.add("lite-mode");
  else document.body.classList.remove("lite-mode");
  Store.set("litemode", !!on);
}

function loadKeys() {
  var raw = Store.get("jetch_keys", {});
  return (raw && typeof raw === "object") ? raw : {};
}
function saveKeys(keys) { Store.set("jetch_keys", keys); }

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

function renderSettings() {
  var frag = document.createDocumentFragment();
  var plus = checkLicense();

  /* ─── ПРОФИЛЬ ─── */
  var profile = UI.card("Профиль");
  var currentNick = Store.get("nickname", "") || "—";

  var nickRow = el("div", { style: "display:flex;align-items:center;gap:12px;margin-bottom:14px;" });
  var nickIcon = el("div", { style: "width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--accent),var(--cyan));display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;font-family:'JetBrains Mono',monospace;flex-shrink:0;" }, String(currentNick).charAt(0).toUpperCase() || "?");
  nickRow.appendChild(nickIcon);
  var nickInfo = el("div", { style: "flex:1;min-width:0;" });
  nickInfo.appendChild(el("div", { style: "font-size:16px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, String(currentNick)));
  nickInfo.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-top:2px;" }, "Ник в Dota Jetch"));
  nickRow.appendChild(nickInfo);
  profile.appendChild(nickRow);

  /* Форма смены ника (свёрнута по умолчанию) */
  var toggleBtn = UI.btn("Сменить ник", { variant: "ghost" });
  toggleBtn.style.width = "auto";
  toggleBtn.style.minWidth = "160px";
  var formBox = el("div", { style: "display:none;margin-top:12px;padding-top:14px;border-top:1px solid var(--border);" });
  var nickInp = UI.input("Новый ник (3-20, A-Z 0-9 _)");
  nickInp.maxLength = 20;
  nickInp.style.marginBottom = "8px";
  formBox.appendChild(nickInp);
  var msg = el("div", { style: "font-size:11px;min-height:16px;margin-bottom:8px;" });
  formBox.appendChild(msg);
  var formRow = el("div", { class: "row" });
  var saveBtn = UI.btn("Сохранить");
  var cancelBtn = UI.btn("Отмена", { variant: "ghost" });
  formRow.appendChild(saveBtn);
  formRow.appendChild(cancelBtn);
  formBox.appendChild(formRow);

  toggleBtn.addEventListener("click", function () {
    formBox.style.display = formBox.style.display === "none" ? "block" : "none";
    msg.textContent = "";
    nickInp.value = "";
    if (formBox.style.display === "block") nickInp.focus();
  });
  cancelBtn.addEventListener("click", function () {
    formBox.style.display = "none";
    nickInp.value = "";
    msg.textContent = "";
  });
  saveBtn.addEventListener("click", async function () {
    msg.style.color = "var(--text-muted)";
    msg.textContent = "Проверяю...";
    if (typeof window.changeNickname !== "function") {
      msg.style.color = "var(--red)";
      msg.textContent = "Функция недоступна. Перезагрузи страницу.";
      return;
    }
    var res = await window.changeNickname(nickInp.value);
    if (res.ok) {
      msg.style.color = "var(--green)";
      msg.textContent = "✓ " + res.msg;
      /* Обновляем сайдбар и перерисовываем страницу */
      var nickEl = document.getElementById("userNick");
      if (nickEl) nickEl.textContent = Store.get("nickname", "—");
      setTimeout(function () { switchPage("settings"); }, 900);
    } else {
      msg.style.color = "var(--red)";
      msg.textContent = "✕ " + res.msg;
    }
  });

  profile.appendChild(toggleBtn);
  profile.appendChild(formBox);
  frag.appendChild(profile);

  /* ─── ПОДПИСКА ─── */
  var plan = UI.card("Подписка JETCH+");
  if (plus) {
    var forever = Store.get("license.forever", false);
    var exp = Store.get("license.expires", null);
    var expText = forever ? "Бессрочная лицензия" : (exp ? "до " + new Date(exp).toLocaleDateString() : "");
    plan.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "✓ JETCH+ активен"));
    plan.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:14px;" }, expText));
    plan.appendChild(UI.btn("Отключить", { variant: "ghost", onclick: function () {
      if (!confirm("Отключить JETCH+?")) return;
      Store.set("license.active", false);
      Store.set("license.forever", false);
      Store.set("license.expires", null);
      location.reload();
    }}));
  } else {
    plan.appendChild(el("div", { style: "color:var(--gold);font-size:14px;font-weight:700;margin-bottom:10px;" }, "Возможности:"));
    plan.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-bottom:12px;line-height:1.6;" }, "+ Бесконечные анализы", el("br"), "+ ИИ чат", el("br"), "+ Все функции"));
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

  /* ─── ТЕМА ─── */
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

  /* ─── ПРОИЗВОДИТЕЛЬНОСТЬ ─── */
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

  return frag;
}
