/* DOTA JETCH — APP v10.6 */

var APP_VERSION = "10.6";

var PAGES = {
  dashboard:    { title: "Главная",         render: renderDashboard },
  analyze:      { title: "Анализ матча",    render: renderAnalyze },
  chat:         { title: "ИИ-ассистент",    render: renderChat },
  history:      { title: "История",         render: renderHistory },
  charts:       { title: "Прогресс",        render: renderChartsPage },
  diary:        { title: "Дневник",         render: renderDiary },
  games:        { title: "Мини-игры",       render: renderGames },
  leaderboard:  { title: "Лидерборд",       render: renderLeaderboardPage },
  achievements: { title: "Достижения",      render: renderAchievements },
  settings:     { title: "Настройки",       render: renderSettings },
  about:        { title: "О программе",     render: renderAbout }
};

var NAV = [
  { page: "dashboard",    label: "Главная",       icon: "M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z" },
  { page: "analyze",      label: "Анализ матча",  icon: "M5 3l14 9-14 9z" },
  { page: "chat",         label: "ИИ-ассистент",  icon: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" },
  { page: "history",      label: "История",       icon: "M3 6h18M3 12h18M3 18h18" },
  { page: "charts",       label: "Прогресс",      icon: "M3 3v18h18M7 14l3-3 4 4 5-6" },
  { page: "diary",        label: "Дневник",       icon: "M4 4h12l4 4v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" },
  { page: "games",        label: "Мини-игры",     icon: "M3 7h18v12H3z" },
  { page: "leaderboard",  label: "Лидерборд",     icon: "M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" },
  { page: "achievements", label: "Достижения",    icon: "M12 9m-6 0a6 6 0 1 0 12 0a6 6 0 1 0 -12 0" },
  { page: "settings",     label: "Настройки",     icon: "M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" },
  { page: "about",        label: "О программе",   icon: "M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0" }
];

var currentPage = "dashboard";

function buildNav() {
  var nav = qs("#sidebarNav");
  if (!nav) return;
  nav.innerHTML = "";
  for (var i = 0; i < NAV.length; i++) {
    (function (item) {
      var btn = el("button", { class: "nav-btn" + (item.page === currentPage ? " active" : ""), "data-page": item.page });
      var ico = el("span", { class: "nav-ico" });
      ico.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="' + item.icon + '"/></svg>';
      btn.appendChild(ico);
      btn.appendChild(document.createTextNode(item.label));
      btn.addEventListener("click", function () { switchPage(item.page); });
      nav.appendChild(btn);
    })(NAV[i]);
  }
}

function safeRender(name) {
  try {
    if (!PAGES[name]) throw new Error("Страница не найдена: " + name);
    var node = PAGES[name].render();
    if (!node) throw new Error("Пустой результат рендера");
    if (node instanceof Promise) throw new Error("Async render");
    return node;
  } catch (e) {
    console.error("Render error:", name, e);
    var frag = document.createDocumentFragment();
    var card = UI.card("Ошибка: " + (PAGES[name] ? PAGES[name].title : name));
    card.appendChild(el("div", { style: "color:var(--red);font-size:12px;padding:10px;font-family:monospace;" }, e.message || String(e)));
    frag.appendChild(card);
    return frag;
  }
}

function switchPage(name) {
  if (!PAGES[name]) name = "dashboard";
  currentPage = name;
  qsa(".nav-btn").forEach(function (b) {
    b.classList.toggle("active", b.getAttribute("data-page") === name);
  });
  var t = qs("#pageTitle");
  if (t) t.textContent = PAGES[name].title;
  var c = qs("#pageContent");
  if (!c) return;
  c.innerHTML = "";
  try { c.appendChild(safeRender(name)); }
  catch (e) { c.appendChild(el("div", { style: "padding:30px;color:var(--red);" }, "Ошибка: " + (e.message || e))); }
  var s = qs(".page-scroll");
  if (s) s.scrollTop = 0;
  location.hash = name;

  if (name === "charts" && typeof Daily !== "undefined") { try { Daily.bump("chart"); } catch (e) {} }
  if (name === "about") {
    try { Store.set("visitedabout", true); if (typeof Achievements !== "undefined") Achievements.check(); } catch (e) {}
  }
  if (typeof updateSidebarPlan === "function") updateSidebarPlan();
}

function updateSidebarPlan() {
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);
  var forever = Store.get("license.forever", false) === true;
  var expires = Store.get("license.expires", null);
  var t = qs("#planTitle"), i = qs("#planInfo"), v = qs("#planValue");
  var bar = qs(".plan-bar-fill");
  if (t) t.textContent = plus ? "JETCH+" : "FREE";
  if (plus) {
    if (forever) {
      if (i) i.textContent = "Бессрочно";
      if (v) v.textContent = "∞";
      if (bar) { bar.style.width = "100%"; bar.style.background = "linear-gradient(90deg, var(--gold), var(--yellow))"; }
    } else if (expires) {
      var expDate = new Date(expires);
      var daysLeft = Math.max(0, Math.ceil((expDate - new Date()) / (24 * 60 * 60 * 1000)));
      var dd = String(expDate.getDate()).padStart(2, "0");
      var mm = String(expDate.getMonth() + 1).padStart(2, "0");
      var yyyy = expDate.getFullYear();
      if (i) i.textContent = "до " + dd + "." + mm + "." + yyyy;
      var word = daysLeft === 1 ? "день" : (daysLeft < 5 ? "дня" : "дней");
      if (v) v.textContent = daysLeft + " " + word;
      if (bar) {
        var total = Math.max(7, daysLeft);
        var pct = Math.max(5, Math.min(100, Math.round((daysLeft / total) * 100)));
        bar.style.width = pct + "%";
        bar.style.background = daysLeft > 3 ? "linear-gradient(90deg, var(--gold), var(--yellow))" : "linear-gradient(90deg, var(--orange), var(--red))";
      }
    } else {
      if (i) i.textContent = "Активен";
      if (v) v.textContent = "∞";
      if (bar) bar.style.width = "100%";
    }
  } else {
    if (i) i.textContent = "5 анализов/день";
    var totalFree = 5;
    var rem = (typeof analyzeQuotaRemaining === "function") ? analyzeQuotaRemaining() : totalFree;
    if (v) v.textContent = String(rem) + " / " + totalFree;
    if (bar) {
      var pctF = Math.max(0, Math.min(100, (rem / totalFree) * 100));
      bar.style.width = pctF + "%";
      bar.style.background = pctF > 60 ? "linear-gradient(90deg, var(--accent), var(--cyan))" : pctF > 30 ? "linear-gradient(90deg, var(--yellow), var(--orange))" : "linear-gradient(90deg, var(--orange), var(--red))";
    }
  }
  if (typeof window.refreshUserUI === "function") { try { window.refreshUserUI(); } catch (e) {} }
}

function buildGreeting() {
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);
  var forever = Store.get("license.forever", false) === true;
  var nick = Store.get("nickname", "") || "";
  var remain = (typeof analyzeQuotaRemaining === "function") ? analyzeQuotaRemaining() : 5;
  var hello = nick ? ("Привет, " + nick + "!") : "Добро пожаловать!";
  var status;
  if (plus && forever) status = "JETCH+ активен · безлимит";
  else if (plus) {
    var expires = Store.get("license.expires", null);
    if (expires) {
      var daysLeft = Math.max(0, Math.ceil((new Date(expires) - new Date()) / (24 * 60 * 60 * 1000)));
      var word = daysLeft === 1 ? "день" : (daysLeft < 5 ? "дня" : "дней");
      status = "JETCH+ · осталось " + daysLeft + " " + word;
    } else status = "JETCH+ активен";
  } else if (remain > 0) status = "Сегодня доступно " + remain + " " + pluralAnalyses(remain);
  else status = "Лимит анализов на сегодня исчерпан";
  return hello + " " + status;
}

function pluralAnalyses(n) {
  if (n === 1) return "анализ";
  if (n >= 2 && n <= 4) return "анализа";
  return "анализов";
}

function renderLeaderboardPage() {
  var frag = document.createDocumentFragment();
  var placeholder = el("div", { id: "leaderboardPlaceholder" });
  placeholder.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:8px 0;" }, "Загрузка..."));
  frag.appendChild(placeholder);

  setTimeout(function () {
    if (typeof window.renderLeaderboard !== "function") {
      placeholder.innerHTML = "";
      placeholder.appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "Модуль не загрузился."));
      return;
    }
    try {
      var result = window.renderLeaderboard();
      if (result && typeof result.then === "function") {
        result.then(function (card) {
          placeholder.innerHTML = "";
          if (card) placeholder.appendChild(card);
        }).catch(function (e) {
          placeholder.innerHTML = "";
          placeholder.appendChild(el("div", { style: "color:var(--red);font-size:12px;" }, "Ошибка: " + (e.message || e)));
        });
      } else {
        placeholder.innerHTML = "";
        if (result) placeholder.appendChild(result);
      }
    } catch (e) {
      placeholder.innerHTML = "";
      placeholder.appendChild(el("div", { style: "color:var(--red);font-size:12px;" }, "Ошибка: " + (e.message || e)));
    }
  }, 30);

  return frag;
}

function renderDashboard() {
  var frag = document.createDocumentFragment();
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);
  frag.appendChild(UI.heroBanner(
    "DOTA JETCH",
    buildGreeting(),
    [
      UI.btn("Анализ матча", { onclick: function () { switchPage("analyze"); } }),
      UI.btn("Мини-игры", { onclick: function () { switchPage("games"); }, variant: "ghost" }),
      UI.btn("Лидерборд", { onclick: function () { switchPage("leaderboard"); }, variant: "ghost" })
    ]
  ));
  if (typeof renderDailyWidget === "function") { try { frag.appendChild(renderDailyWidget()); } catch (e) {} }
  if (typeof window.renderRatingWidget === "function") {
    try {
      var rw = window.renderRatingWidget();
      if (rw) frag.appendChild(rw);
    } catch (e) { console.warn("rating widget:", e); }
  }
  var stats = el("div", { class: "stat-grid" });
  var left = typeof analyzeQuotaRemaining === "function" ? (plus ? "∞" : String(analyzeQuotaRemaining())) : "-";
  stats.appendChild(UI.statCard("S", "var(--cyan)", "var(--cyan-bg)", "Сессий", String(Store.get("sessions", 0)), "Всего"));
  stats.appendChild(UI.statCard("A", "var(--accent-light)", "var(--accent-bg)", "Анализов", left, plus ? "JETCH+" : "из 5"));
  stats.appendChild(UI.statCard("T", "var(--yellow)", "var(--yellow-bg)", "Ачивки", (Store.get("achievementsunlocked", []) || []).length + " / 24", "Открыто"));
  frag.appendChild(stats);
  var s2 = el("div", { class: "stat-grid" });
  s2.appendChild(UI.statCard("D", "var(--cyan)", "var(--cyan-bg)", "Дневник", String((Store.get("diarynotes", []) || []).length), "Записей"));
  s2.appendChild(UI.statCard("F", "var(--orange)", "var(--orange-bg)", "Стрик", String(Store.get("dailystreak", 0) || 0), "дней"));
  s2.appendChild(UI.statCard("H", "var(--green)", "var(--green-bg)", "История", String((Store.get("recentmatches", []) || []).length), "Матчей"));
  frag.appendChild(s2);
  if (typeof lastAnalysis !== "undefined" && lastAnalysis && lastAnalysis.hero) {
    var last = UI.card("Последний матч");
    var row = el("div", { style: "display:flex;align-items:center;gap:14px;" });
    row.appendChild(heroImgEl(lastAnalysis.hero, 56));
    var info = el("div", { style: "flex:1;" });
    info.appendChild(el("div", { style: "font-size:15px;font-weight:bold;" }, lastAnalysis.hero.name));
    info.appendChild(el("div", { class: "muted", style: "font-size:11px;margin-top:4px;" },
      lastAnalysis.player.kills + "/" + lastAnalysis.player.deaths + "/" + lastAnalysis.player.assists + " — " + (lastAnalysis.won ? "победа" : "поражение")));
    row.appendChild(info); last.appendChild(row); frag.appendChild(last);
  }
  return frag;
}

function renderChartsPage() {
  try { if (typeof Daily !== "undefined") Daily.bump("chart"); } catch (e) {}
  if (typeof Charts === "undefined") return UI.card("Прогресс");
  return Charts.render();
}

function renderAbout() {
  var frag = document.createDocumentFragment();
  var head = UI.card("");
  head.appendChild(el("div", { style: "font-size:20px;font-weight:bold;color:var(--accent-light);" }, "DOTA JETCH AI 2.0"));
  head.appendChild(el("div", { class: "dim", style: "font-size:12px;margin-top:6px;" }, "Version " + APP_VERSION));
  frag.appendChild(head);
  var feat = UI.card("Возможности");
  var list = [
    "Анализ матчей с оценкой S/A/B/C/D",
    "ИИ-ассистент (JETCH+)",
    "История и графики",
    "Дневник",
    "Мини-игры: Взлом замка, Атака автоматонов, Викторина",
    "Рейтинг и медали",
    "Лидерборд",
    "Достижения (24)",
    "Ник + аватар + облачная синхронизация"
  ];
  for (var i = 0; i < list.length; i++) {
    feat.appendChild(el("div", { style: "padding:4px 0;font-size:12px;color:var(--text-muted);" }, "• " + list[i]));
  }
  frag.appendChild(feat);
  return frag;
}

function resizeImage(file, maxSize, cb) {
  var reader = new FileReader();
  reader.onload = function (ev) {
    var img = new Image();
    img.onload = function () {
      try {
        var canvas = document.createElement("canvas");
        canvas.width = maxSize; canvas.height = maxSize;
        var ctx = canvas.getContext("2d");
        var s = Math.min(img.width, img.height);
        var sx = (img.width - s) / 2, sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, 0, 0, maxSize, maxSize);
        cb(canvas.toDataURL("image/jpeg", 0.85));
      } catch (e) { cb(null); }
    };
    img.onerror = function () { cb(null); };
    img.src = ev.target.result;
  };
  reader.onerror = function () { cb(null); };
  reader.readAsDataURL(file);
}

function hasAvatar() {
  var av = Store.get("avatar", null);
  return !!(av && typeof av === "string" && av.indexOf("data:image") === 0);
}

function renderAvatarInto(el, nick) {
  if (hasAvatar()) {
    el.style.backgroundImage = "url(" + Store.get("avatar", "") + ")";
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.textContent = "";
  } else {
    el.style.backgroundImage = "";
    el.textContent = String(nick || "?").charAt(0).toUpperCase() || "?";
  }
}

function getNickCooldownLeft() {
  if (typeof window.nicknameCooldownDaysLeft === "function") return window.nicknameCooldownDaysLeft();
  return 0;
}

function buildNickLockBlock() {
  var wrap = document.createElement("div");
  wrap.style.cssText = "display:flex;align-items:center;gap:11px;padding:11px 14px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;";
  var ico = document.createElement("div");
  ico.style.cssText = "width:30px;height:30px;border-radius:9px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:rgba(251,191,36,0.10);border:1px solid rgba(251,191,36,0.28);color:var(--gold);font-size:14px;font-weight:700;line-height:1;";
  ico.textContent = "⏳";
  var body = document.createElement("div");
  body.style.cssText = "flex:1;min-width:0;";
  var title = document.createElement("div");
  title.style.cssText = "font-size:12px;font-weight:600;color:var(--text);line-height:1.3;";
  title.textContent = "Смена ника недоступна";
  var sub = document.createElement("div");
  sub.style.cssText = "font-size:10.5px;color:var(--text-dim);margin-top:3px;line-height:1.35;letter-spacing:0.01em;";
  sub.id = "nickCooldownTimer";
  function updateTimerText() {
    var days = getNickCooldownLeft();
    if (days <= 0) { sub.textContent = "Можно сменить ник"; return; }
    var word = days === 1 ? "день" : (days < 5 ? "дня" : "дней");
    sub.textContent = "Раз в 30 дней · осталось " + days + " " + word;
  }
  updateTimerText();
  if (window.__nickTimer) clearInterval(window.__nickTimer);
  window.__nickTimer = setInterval(function () {
    if (!document.getElementById("nickCooldownTimer")) { clearInterval(window.__nickTimer); window.__nickTimer = null; return; }
    updateTimerText();
  }, 60000);
  body.appendChild(title); body.appendChild(sub);
  wrap.appendChild(ico); wrap.appendChild(body);
  return wrap;
}

function renderNickSection() {
  var container = document.getElementById("profileNickSection");
  if (!container) return;
  container.innerHTML = "";
  var daysLeft = getNickCooldownLeft();
  if (daysLeft > 0) { container.appendChild(buildNickLockBlock()); return; }
  var changeBtn = document.createElement("button");
  changeBtn.type = "button"; changeBtn.className = "btn btn-ghost";
  changeBtn.style.width = "100%"; changeBtn.style.marginBottom = "12px";
  changeBtn.textContent = "Сменить ник";
  var form = document.createElement("div");
  form.style.cssText = "display:none;margin-bottom:12px;padding:12px;background:var(--bg-elev);border:1px solid var(--border);border-radius:12px;";
  form.innerHTML = '<input type="text" id="profileNickInput" class="input" maxlength="20" placeholder="Новый ник (3-20, A-Z 0-9 _)" style="margin-bottom:8px;">' +
    '<div id="profileNickMsg" style="font-size:11px;min-height:14px;margin-bottom:8px;"></div>' +
    '<div style="display:flex;gap:8px;"><button id="profileNickSaveBtn" class="btn" type="button">Сохранить</button><button id="profileNickCancelBtn" class="btn btn-ghost" type="button">Отмена</button></div>' +
    '<div class="dim" style="font-size:10px;margin-top:10px;line-height:1.5;">После смены ник нельзя будет изменить в течение 30 дней.</div>';
  changeBtn.addEventListener("click", function () {
    form.style.display = form.style.display === "none" ? "block" : "none";
    var inp = document.getElementById("profileNickInput");
    var msg = document.getElementById("profileNickMsg");
    if (msg) msg.textContent = "";
    if (inp) { inp.value = ""; inp.focus(); }
  });
  container.appendChild(changeBtn); container.appendChild(form);
  setTimeout(function () {
    var saveBtn = document.getElementById("profileNickSaveBtn");
    var cancelBtn = document.getElementById("profileNickCancelBtn");
    var inp = document.getElementById("profileNickInput");
    var msg = document.getElementById("profileNickMsg");
    if (cancelBtn) cancelBtn.addEventListener("click", function () { form.style.display = "none"; if (msg) msg.textContent = ""; if (inp) inp.value = ""; });
    if (saveBtn) saveBtn.addEventListener("click", async function () {
      if (!msg) return;
      msg.style.color = "var(--text-muted)"; msg.textContent = "Проверяю...";
      if (typeof window.changeNickname !== "function") { msg.style.color = "var(--red)"; msg.textContent = "Функция недоступна."; return; }
      var val = inp ? inp.value : "";
      var res = await window.changeNickname(val);
      if (res.ok) {
        msg.style.color = "var(--green)"; msg.textContent = "✓ " + res.msg;
        var nickEl = document.getElementById("profileModalNick");
        if (nickEl) nickEl.textContent = Store.get("nickname", "—");
        if (typeof window.refreshUserUI === "function") window.refreshUserUI();
        setTimeout(function () { renderNickSection(); }, 1500);
      } else { msg.style.color = "var(--red)"; msg.textContent = "✕ " + res.msg; }
    });
  }, 0);
}

function updateProfileModal() {
  var nick = Store.get("nickname", "") || "—";
  var email = (window.__fbAuth && window.__fbAuth.currentUser && window.__fbAuth.currentUser.email) || "—";
  var nickEl = document.getElementById("profileModalNick");
  var emailEl = document.getElementById("profileModalEmail");
  var avEl = document.getElementById("profileAvatarBig");
  var statsEl = document.getElementById("profileModalStats");
  var resetBtn = document.getElementById("profileResetAvatarBtn");
  if (nickEl) nickEl.textContent = nick;
  if (emailEl) emailEl.textContent = email;
  if (avEl) renderAvatarInto(avEl, nick);
  if (resetBtn) resetBtn.classList.toggle("visible", hasAvatar());
  if (statsEl) {
    statsEl.innerHTML = "";
    var achs = (Store.get("achievementsunlocked", []) || []).length;
    var analyzed = Store.get("analyzedcount", 0) || 0;
    var mmr = Store.get("minigames_mmr", 0) || 0;
    var cells = [
      { v: String(analyzed), l: "Матчей" },
      { v: achs + "/24", l: "Ачивок" },
      { v: String(mmr), l: "MMR" }
    ];
    for (var i = 0; i < cells.length; i++) {
      var c = document.createElement("div"); c.className = "profile-stat-cell";
      var vEl = document.createElement("div"); vEl.className = "profile-stat-value"; vEl.textContent = cells[i].v;
      var lEl = document.createElement("div"); lEl.className = "profile-stat-label"; lEl.textContent = cells[i].l;
      c.appendChild(vEl); c.appendChild(lEl); statsEl.appendChild(c);
    }
  }
  renderNickSection();
}

window.openProfileModal = function () {
  var ov = document.getElementById("profileModalOverlay");
  if (!ov) return;
  updateProfileModal();
  if (typeof window.refreshUserUI === "function") { try { window.refreshUserUI(); } catch (e) {} }
  ov.style.display = "flex";
  document.body.style.overflow = "hidden";
};

window.closeProfileModal = function () {
  var ov = document.getElementById("profileModalOverlay");
  if (!ov) return;
  ov.style.display = "none";
  document.body.style.overflow = "";
};

window.triggerAvatarUpload = function () {
  var inp = document.getElementById("avatarFileInput");
  if (inp) inp.click();
};

function bindProfileModal() {
  var ov = document.getElementById("profileModalOverlay");
  if (!ov) return;
  ov.addEventListener("click", function (e) { if (e.target === ov) window.closeProfileModal(); });
  var closeBtn = ov.querySelector(".profile-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", window.closeProfileModal);
  var fileInp = document.getElementById("avatarFileInput");
  if (fileInp && !fileInp.__bound) {
    fileInp.__bound = true;
    fileInp.addEventListener("change", function () {
      var f = fileInp.files && fileInp.files[0];
      if (!f) return;
      if (!/^image\//.test(f.type)) { alert("Выбери картинку."); fileInp.value = ""; return; }
      if (f.size > 5 * 1024 * 1024) { alert("Файл слишком большой (макс 5 МБ)."); fileInp.value = ""; return; }
      resizeImage(f, 128, function (dataUrl) {
        fileInp.value = "";
        if (!dataUrl) { alert("Не удалось обработать."); return; }
        if (typeof window.changeAvatar !== "function") { alert("Функция недоступна."); return; }
        var res = window.changeAvatar(dataUrl);
        if (res.ok) { updateProfileModal(); if (typeof window.refreshUserUI === "function") window.refreshUserUI(); }
        else alert("Ошибка: " + res.msg);
      });
    });
  }
  var resetBtn = document.getElementById("profileResetAvatarBtn");
  if (resetBtn && !resetBtn.__bound) {
    resetBtn.__bound = true;
    resetBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      if (!hasAvatar()) return;
      if (!confirm("Убрать аватар?")) return;
      Store.set("avatar", null);
      updateProfileModal();
      if (typeof window.refreshUserUI === "function") window.refreshUserUI();
    });
  }
  var logoutBtn = document.getElementById("profileLogoutBtn");
  if (logoutBtn && !logoutBtn.__bound) {
    logoutBtn.__bound = true;
    logoutBtn.addEventListener("click", async function () {
      if (!confirm("Выйти из аккаунта?")) return;
      window.closeProfileModal();
      if (window.__fbSignOut) await window.__fbSignOut();
      else alert("Перезагрузи страницу.");
    });
  }
}

function init() {
  try { if (typeof applyTheme === "function") applyTheme(loadTheme()); } catch (e) {}
  try { if (typeof applyLiteMode === "function") applyLiteMode(isLiteMode()); } catch (e) {}
  buildNav();
  document.addEventListener("click", function () {
    if (typeof closeAllDropdowns === "function") closeAllDropdowns();
  });
  bindProfileModal();
  try { Store.set("sessions", (Store.get("sessions", 0) || 0) + 1); } catch (e) {}
  var h = (location.hash || "#dashboard").slice(1);
  switchPage(PAGES[h] ? h : "dashboard");
  if (typeof updateSidebarPlan === "function") updateSidebarPlan();
  try { if (typeof Achievements !== "undefined") Achievements.check(); } catch (e) {}
  console.log("DOTA JETCH v" + APP_VERSION + " init");
}

if (document.readyState === "loading") window.addEventListener("DOMContentLoaded", init);
else setTimeout(init, 0);

window.addEventListener("hashchange", function () {
  var h = (location.hash || "#dashboard").slice(1);
  if (h !== currentPage && PAGES[h]) switchPage(h);
});
