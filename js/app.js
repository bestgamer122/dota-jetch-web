/* DOTA JETCH — APP v8.6
   - Кнопка сброса аватара — иконка ✕ в углу аватара (появляется при hover)
   - Использует window.__fbAuth для email */

var APP_VERSION = "8.6";

var PAGES = {
  dashboard:    { title: "Главная",         render: renderDashboard },
  analyze:      { title: "Анализ матча",    render: renderAnalyze },
  chat:         { title: "ИИ-ассистент",    render: renderChat },
  history:      { title: "История",         render: renderHistory },
  charts:       { title: "Прогресс",        render: renderChartsPage },
  diary:        { title: "Дневник",         render: renderDiary },
  games:        { title: "Мини-игры",       render: renderGames },
  achievements: { title: "Достижения",      render: renderAchievements },
  settings:     { title: "Настройки",       render: renderSettings },
  about:        { title: "О программе",     render: renderAbout }
};

var NAV = [
  { page: "dashboard",    label: "Главная",       icon: "◈" },
  { page: "analyze",      label: "Анализ матча",  icon: "▶" },
  { page: "chat",         label: "ИИ-ассистент",  icon: "✦" },
  { page: "history",      label: "История",       icon: "☰" },
  { page: "charts",       label: "Прогресс",      icon: "◱" },
  { page: "diary",        label: "Дневник",       icon: "✎" },
  { page: "games",        label: "Мини-игры",     icon: "◉" },
  { page: "achievements", label: "Достижения",    icon: "★" },
  { page: "settings",     label: "Настройки",     icon: "⚙" },
  { page: "about",        label: "О программе",   icon: "ⓘ" }
];

var currentPage = "dashboard";

function buildNav() {
  var nav = qs("#sidebarNav");
  if (!nav) return;
  nav.innerHTML = "";
  for (var i = 0; i < NAV.length; i++) {
    (function (item) {
      var btn = el("button", { class: "nav-btn" + (item.page === currentPage ? " active" : ""), "data-page": item.page });
      btn.appendChild(el("span", { class: "nav-ico" }, item.icon));
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

  if (name === "charts" && typeof Daily !== "undefined") {
    try { Daily.bump("chart"); } catch (e) {}
  }
  if (name === "about") {
    try {
      Store.set("visitedabout", true);
      if (typeof Achievements !== "undefined") Achievements.check();
    } catch (e) {}
  }

  if (typeof updateSidebarPlan === "function") updateSidebarPlan();
}

function updateSidebarPlan() {
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);
  var t = qs("#planTitle"), i = qs("#planInfo"), v = qs("#planValue");
  var bar = qs(".plan-bar-fill");

  if (t) t.textContent = plus ? "JETCH+" : "FREE";
  if (i) i.textContent = plus ? "Бессрочно" : "5 анализов/день";

  var total = 5;
  var rem = plus ? total : ((typeof analyzeQuotaRemaining === "function") ? analyzeQuotaRemaining() : total);

  if (v) v.textContent = plus ? "∞" : String(rem) + " / " + total;

  if (bar) {
    var pct = plus ? 100 : Math.max(0, Math.min(100, (rem / total) * 100));
    bar.style.width = pct + "%";
    bar.style.background = plus
      ? "linear-gradient(90deg, var(--gold), var(--yellow))"
      : (pct > 60 ? "linear-gradient(90deg, var(--accent), var(--cyan))"
        : pct > 30 ? "linear-gradient(90deg, var(--yellow), var(--orange))"
        : "linear-gradient(90deg, var(--orange), var(--red))");
  }
}

function renderDashboard() {
  var frag = document.createDocumentFragment();
  var plus = (typeof checkLicense === "function") ? checkLicense() : (Store.get("license.active", false) === true);
  var nick = Store.get("nickname", "") || "";
  var subtitle = nick
    ? "Привет, " + nick + "! " + (plus ? "JETCH+ активен" : "Веб-версия")
    : (plus ? "AI 2.0 активен" : "Веб-версия");

  frag.appendChild(UI.heroBanner(
    "DOTA JETCH",
    subtitle,
    [
      UI.btn("Анализ матча", { onclick: function () { switchPage("analyze"); } }),
      UI.btn("Мини-игры", { onclick: function () { switchPage("games"); }, variant: "ghost" }),
      UI.btn("Прогресс", { onclick: function () { switchPage("charts"); }, variant: "ghost" })
    ]
  ));

  if (typeof renderDailyWidget === "function") {
    try { frag.appendChild(renderDailyWidget()); } catch (e) {}
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
    row.appendChild(info);
    last.appendChild(row);
    frag.appendChild(last);
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
    "Достижения (24)",
    "Мини-игры",
    "Система ключей JETCH+",
    "Ник + аватар + Firebase-синхронизация"
  ];
  for (var i = 0; i < list.length; i++) {
    feat.appendChild(el("div", { style: "padding:4px 0;font-size:12px;color:var(--text-muted);" }, "• " + list[i]));
  }
  frag.appendChild(feat);
  return frag;
}

/* ─── Профиль — модальное окно ─── */

function resizeImage(file, maxSize, cb) {
  var reader = new FileReader();
  reader.onload = function (ev) {
    var img = new Image();
    img.onload = function () {
      try {
        var canvas = document.createElement("canvas");
        canvas.width = maxSize;
        canvas.height = maxSize;
        var ctx = canvas.getContext("2d");
        var s = Math.min(img.width, img.height);
        var sx = (img.width - s) / 2;
        var sy = (img.height - s) / 2;
        ctx.drawImage(img, sx, sy, s, s, 0, 0, maxSize, maxSize);
        cb(canvas.toDataURL("image/jpeg", 0.85));
      } catch (e) { console.warn("resize error:", e); cb(null); }
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

  /* Кнопка «Убрать аватар» — маленькая иконка в углу, видна только при наличии аватара */
  if (resetBtn) {
    resetBtn.classList.toggle("visible", hasAvatar());
  }

  if (statsEl) {
    statsEl.innerHTML = "";
    var achs = (Store.get("achievementsunlocked", []) || []).length;
    var analyzed = Store.get("analyzedcount", 0) || 0;
    var streak = Store.get("dailystreak", 0) || 0;
    var cells = [
      { v: String(analyzed), l: "Матчей" },
      { v: achs + "/24", l: "Ачивок" },
      { v: String(streak), l: "Стрик" }
    ];
    for (var i = 0; i < cells.length; i++) {
      var c = document.createElement("div");
      c.className = "profile-stat-cell";
      var vEl = document.createElement("div");
      vEl.className = "profile-stat-value";
      vEl.textContent = cells[i].v;
      var lEl = document.createElement("div");
      lEl.className = "profile-stat-label";
      lEl.textContent = cells[i].l;
      c.appendChild(vEl);
      c.appendChild(lEl);
      statsEl.appendChild(c);
    }
  }
}

window.openProfileModal = function () {
  var ov = document.getElementById("profileModalOverlay");
  if (!ov) return;
  var nickForm = document.getElementById("profileNickForm");
  var nickMsg = document.getElementById("profileNickMsg");
  var nickInp = document.getElementById("profileNickInput");
  if (nickForm) nickForm.style.display = "none";
  if (nickMsg) nickMsg.textContent = "";
  if (nickInp) nickInp.value = "";
  updateProfileModal();
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

  ov.addEventListener("click", function (e) {
    if (e.target === ov) window.closeProfileModal();
  });

  var closeBtn = ov.querySelector(".profile-modal-close");
  if (closeBtn) closeBtn.addEventListener("click", window.closeProfileModal);

  /* Загрузка аватара */
  var fileInp = document.getElementById("avatarFileInput");
  if (fileInp && !fileInp.__bound) {
    fileInp.__bound = true;
    fileInp.addEventListener("change", function () {
      var f = fileInp.files && fileInp.files[0];
      if (!f) return;
      if (!/^image\//.test(f.type)) {
        alert("Выбери картинку (jpg/png/webp).");
        fileInp.value = "";
        return;
      }
      if (f.size > 5 * 1024 * 1024) {
        alert("Файл слишком большой (макс 5 МБ).");
        fileInp.value = "";
        return;
      }
      resizeImage(f, 128, function (dataUrl) {
        fileInp.value = "";
        if (!dataUrl) { alert("Не удалось обработать картинку."); return; }
        if (typeof window.changeAvatar !== "function") {
          alert("Функция недоступна. Перезагрузи страницу.");
          return;
        }
        var res = window.changeAvatar(dataUrl);
        if (res.ok) {
          updateProfileModal();
          if (typeof window.refreshUserUI === "function") window.refreshUserUI();
        } else {
          alert("Ошибка: " + res.msg);
        }
      });
    });
  }

  /* Удаление аватара — маленькая иконка в углу */
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

  /* Смена ника */
  var changeNickBtn = document.getElementById("profileChangeNickBtn");
  var nickForm = document.getElementById("profileNickForm");
  if (changeNickBtn && nickForm && !changeNickBtn.__bound) {
    changeNickBtn.__bound = true;
    changeNickBtn.addEventListener("click", function () {
      nickForm.style.display = nickForm.style.display === "none" ? "block" : "none";
      var nickInp = document.getElementById("profileNickInput");
      var msg = document.getElementById("profileNickMsg");
      if (msg) msg.textContent = "";
      if (nickInp) { nickInp.value = ""; nickInp.focus(); }
    });
  }

  var nickSave = document.getElementById("profileNickSaveBtn");
  var nickCancel = document.getElementById("profileNickCancelBtn");
  var nickInpEl = document.getElementById("profileNickInput");
  var nickMsgEl = document.getElementById("profileNickMsg");

  if (nickCancel && !nickCancel.__bound) {
    nickCancel.__bound = true;
    nickCancel.addEventListener("click", function () {
      if (nickForm) nickForm.style.display = "none";
      if (nickMsgEl) nickMsgEl.textContent = "";
      if (nickInpEl) nickInpEl.value = "";
    });
  }

  if (nickSave && !nickSave.__bound) {
    nickSave.__bound = true;
    nickSave.addEventListener("click", async function () {
      if (!nickMsgEl) return;
      nickMsgEl.style.color = "var(--text-muted)";
      nickMsgEl.textContent = "Проверяю...";
      if (typeof window.changeNickname !== "function") {
        nickMsgEl.style.color = "var(--red)";
        nickMsgEl.textContent = "Функция недоступна. Перезагрузи страницу.";
        return;
      }
      var val = nickInpEl ? nickInpEl.value : "";
      var res = await window.changeNickname(val);
      if (res.ok) {
        nickMsgEl.style.color = "var(--green)";
        nickMsgEl.textContent = "✓ " + res.msg;
        updateProfileModal();
        if (typeof window.refreshUserUI === "function") window.refreshUserUI();
        setTimeout(function () {
          if (nickForm) nickForm.style.display = "none";
          if (nickMsgEl) nickMsgEl.textContent = "";
        }, 1500);
      } else {
        nickMsgEl.style.color = "var(--red)";
        nickMsgEl.textContent = "✕ " + res.msg;
      }
    });
  }

  /* Выход */
  var logoutBtn = document.getElementById("profileLogoutBtn");
  if (logoutBtn && !logoutBtn.__bound) {
    logoutBtn.__bound = true;
    logoutBtn.addEventListener("click", async function () {
      if (!confirm("Выйти из аккаунта?")) return;
      window.closeProfileModal();
      if (window.__fbSignOut) {
        await window.__fbSignOut();
      } else {
        alert("Перезагрузи страницу и попробуй снова.");
      }
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

if (document.readyState === "loading") {
  window.addEventListener("DOMContentLoaded", init);
} else {
  setTimeout(init, 0);
}

window.addEventListener("hashchange", function () {
  var h = (location.hash || "#dashboard").slice(1);
  if (h !== currentPage && PAGES[h]) switchPage(h);
});
