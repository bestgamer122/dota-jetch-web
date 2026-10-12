/* DOTA JETCH — ADMIN PANEL v1.0 */

var AdminPanel = {
  isAdmin: false,
  cache: { users: null, config: null, logs: null, activeTab: "dashboard" },

  checkAdmin: async function () {
    try {
      var auth = window.__fbAuth;
      var dbHelpers = window.__fbDB;
      if (!auth || !auth.currentUser || !dbHelpers) return false;
      var snap = await dbHelpers.get(dbHelpers.ref(dbHelpers.db, "admins/" + auth.currentUser.uid));
      this.isAdmin = snap.exists() && snap.val() === true;
      return this.isAdmin;
    } catch (e) { this.isAdmin = false; return false; }
  },

  log: async function (action, details) {
    try {
      var auth = window.__fbAuth;
      var dbHelpers = window.__fbDB;
      if (!auth || !auth.currentUser || !dbHelpers) return;
      var logId = "log_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8);
      await dbHelpers.set(dbHelpers.ref(dbHelpers.db, "adminLogs/" + logId), {
        action: action, details: details || "",
        adminUid: auth.currentUser.uid,
        adminEmail: auth.currentUser.email || "",
        ts: Date.now()
      });
    } catch (e) {}
  },

  loadUsers: async function () {
    try {
      var dbHelpers = window.__fbDB;
      var snap = await dbHelpers.get(dbHelpers.ref(dbHelpers.db, "users"));
      var data = snap.val() || {};
      var list = [];
      for (var uid in data) {
        if (!data.hasOwnProperty(uid)) continue;
        var u = data[uid] || {};
        var nickname = "";
        var avatar = null;
        var license = { active: false, forever: false, expires: null };
        var blocked = false;
        var analyzed = 0;
        try {
          if (u.nickname) nickname = typeof u.nickname === "string" ? u.nickname : "";
          if (u.avatar) avatar = typeof u.avatar === "string" ? u.avatar : null;
          if (u["license__DOT__active"] !== undefined) license.active = u["license__DOT__active"] === true;
          if (u["license__DOT__forever"] !== undefined) license.forever = u["license__DOT__forever"] === true;
          if (u["license__DOT__expires"] !== undefined) license.expires = u["license__DOT__expires"];
          if (u.blocked !== undefined) blocked = u.blocked === true;
          if (u.analyzedcount !== undefined) analyzed = parseInt(u.analyzedcount, 10) || 0;
        } catch (e) {}
        list.push({ uid: uid, nickname: nickname || "(без ника)", avatar: avatar, license: license, blocked: blocked, analyzed: analyzed, raw: u });
      }
      list.sort(function (a, b) { return a.nickname.localeCompare(b.nickname); });
      this.cache.users = list;
      return list;
    } catch (e) { return []; }
  },

  updateUser: async function (uid, patch) {
    try { var db = window.__fbDB; await db.update(db.ref(db.db, "users/" + uid), patch); return true; }
    catch (e) { return false; }
  },

  deleteUser: async function (uid) {
    try {
      var db = window.__fbDB;
      await db.remove(db.ref(db.db, "users/" + uid));
      await db.remove(db.ref(db.db, "publicProfiles/" + uid));
      return true;
    } catch (e) { return false; }
  },

  loadConfig: async function () {
    try {
      var db = window.__fbDB;
      var snap = await db.get(db.ref(db.db, "config"));
      var data = snap.val() || {};
      this.cache.config = {
        maintenance: data.maintenance || { enabled: false, message: "Ведутся технические работы. Скоро вернёмся!", until: null },
        notification: data.notification || { enabled: false, text: "" },
        minigames: data.minigames || { lockpick: true, automaton: true, direjumper: true, quiz: true }
      };
      return this.cache.config;
    } catch (e) { return null; }
  },

  updateConfig: async function (patch) {
    try { var db = window.__fbDB; await db.update(db.ref(db.db, "config"), patch); return true; }
    catch (e) { return false; }
  },

  loadLogs: async function (limit) {
    try {
      var db = window.__fbDB;
      var snap = await db.get(db.ref(db.db, "adminLogs"));
      var data = snap.val() || {};
      var list = [];
      for (var id in data) if (data.hasOwnProperty(id)) list.push(data[id]);
      list.sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
      list = list.slice(0, limit || 100);
      this.cache.logs = list;
      return list;
    } catch (e) { return []; }
  },

  loadAdmins: async function () {
    try {
      var db = window.__fbDB;
      var snap = await db.get(db.ref(db.db, "admins"));
      return snap.val() || {};
    } catch (e) { return {}; }
  },

  addAdmin: async function (uid) {
    try {
      var db = window.__fbDB;
      await db.set(db.ref(db.db, "admins/" + uid), true);
      await this.log("add_admin", "Добавлен админ: " + uid);
      return true;
    } catch (e) { return false; }
  },

  removeAdmin: async function (uid) {
    try {
      var db = window.__fbDB;
      await db.remove(db.ref(db.db, "admins/" + uid));
      await this.log("remove_admin", "Удалён админ: " + uid);
      return true;
    } catch (e) { return false; }
  }
};
window.AdminPanel = AdminPanel;

window.checkMaintenance = async function () {
  try {
    var db = window.__fbDB;
    if (!db) return false;
    var snap = await db.get(db.ref(db.db, "config/maintenance"));
    var m = snap.val();
    if (!m || !m.enabled) return false;
    var isAdmin = await AdminPanel.checkAdmin();
    if (isAdmin) return false;
    showMaintenanceScreen(m);
    return true;
  } catch (e) { return false; }
};

function showMaintenanceScreen(m) {
  if (document.getElementById("maintenanceOverlay")) return;
  var ov = el("div", { id: "maintenanceOverlay" });
  ov.style.cssText = "position:fixed;inset:0;z-index:9999998;background:#0b0c10;display:flex;align-items:center;justify-content:center;padding:20px;";
  var box = el("div");
  box.style.cssText = "max-width:480px;text-align:center;background:var(--bg-card);border:1px solid var(--accent);border-radius:18px;padding:40px 32px;";
  box.appendChild(el("div", { style: "font-size:56px;margin-bottom:16px;" }, "🛠️"));
  box.appendChild(el("div", { style: "font-size:22px;font-weight:800;color:var(--accent-light);margin-bottom:12px;" }, "Технические работы"));
  box.appendChild(el("div", { style: "font-size:14px;color:var(--text-muted);line-height:1.6;margin-bottom:20px;" }, m.message || "Ведутся технические работы."));
  if (m.until) {
    try {
      var dt = new Date(m.until);
      box.appendChild(el("div", { class: "dim", style: "font-size:12px;" }, "Ожидаем: " + dt.toLocaleString("ru-RU")));
    } catch (e) {}
  }
  var btn = el("button", { type: "button", class: "btn", style: "margin-top:24px;" }, "Обновить");
  btn.addEventListener("click", function () { location.reload(); });
  box.appendChild(btn);
  ov.appendChild(box);
  document.body.appendChild(ov);
}

function renderAdminPanel() {
  var frag = document.createDocumentFragment();
  var wrapper = el("div", { id: "adminWrapper" });
  frag.appendChild(wrapper);
  setTimeout(function () { initAdminPanel(wrapper); }, 0);
  return frag;
}

async function initAdminPanel(wrapper) {
  if (!wrapper) return;
  wrapper.innerHTML = "";
  wrapper.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:20px;text-align:center;" }, "Проверка прав..."));
  var ok = await AdminPanel.checkAdmin();
  if (!ok) {
    wrapper.innerHTML = "";
    var card = UI.card("🚫 Доступ запрещён");
    card.appendChild(el("div", { class: "dim", style: "font-size:13px;padding:10px;line-height:1.6;" }, "Только для администраторов."));
    wrapper.appendChild(card);
    return;
  }
  wrapper.innerHTML = "";
  wrapper.appendChild(renderAdminTabs());
  wrapper.appendChild(el("div", { id: "adminContent" }));
  renderAdminTab(AdminPanel.cache.activeTab);
}

function renderAdminTabs() {
  var wrap = el("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:14px;" });
  var tabs = [
    { id: "dashboard", label: "📊 Статистика" },
    { id: "users", label: "👥 Пользователи" },
    { id: "config", label: "⚙️ Настройки" },
    { id: "logs", label: "📜 Логи" },
    { id: "admins", label: "🛡 Админы" }
  ];
  for (var i = 0; i < tabs.length; i++) {
    (function (t) {
      var btn = el("button", { type: "button", "data-admintab": t.id });
      var act = AdminPanel.cache.activeTab === t.id;
      btn.textContent = t.label;
      btn.style.cssText = "padding:8px 14px;border-radius:10px;font-size:12px;font-weight:600;font-family:inherit;cursor:pointer;border:1px solid " + (act ? "var(--accent)" : "var(--border)") + ";background:" + (act ? "var(--accent-bg)" : "var(--bg-elev)") + ";color:" + (act ? "var(--accent-light)" : "var(--text-muted)") + ";";
      btn.addEventListener("click", function () {
        AdminPanel.cache.activeTab = t.id;
        var all = wrap.querySelectorAll("[data-admintab]");
        for (var j = 0; j < all.length; j++) {
          var a = all[j].getAttribute("data-admintab") === t.id;
          all[j].style.borderColor = a ? "var(--accent)" : "var(--border)";
          all[j].style.background = a ? "var(--accent-bg)" : "var(--bg-elev)";
          all[j].style.color = a ? "var(--accent-light)" : "var(--text-muted)";
        }
        renderAdminTab(t.id);
      });
      wrap.appendChild(btn);
    })(tabs[i]);
  }
  return wrap;
}

async function renderAdminTab(tab) {
  var c = qs("#adminContent");
  if (!c) return;
  c.innerHTML = "";
  if (tab === "dashboard") c.appendChild(await renderAdminDashboard());
  else if (tab === "users") c.appendChild(await renderAdminUsers());
  else if (tab === "config") c.appendChild(await renderAdminConfig());
  else if (tab === "logs") c.appendChild(await renderAdminLogs());
  else if (tab === "admins") c.appendChild(await renderAdminAdmins());
}

async function renderAdminDashboard() {
  var card = UI.card("📊 Статистика");
  var users = await AdminPanel.loadUsers();
  var total = users.length, jetch = 0, blocked = 0, totalAnalyzed = 0;
  for (var i = 0; i < users.length; i++) {
    if (users[i].license.active || users[i].license.forever) jetch++;
    if (users[i].blocked) blocked++;
    totalAnalyzed += users[i].analyzed;
  }
  var stats = el("div", { class: "stat-grid" });
  stats.appendChild(UI.statCard("👥", "var(--cyan)", "var(--cyan-bg)", "Всего аккаунтов", String(total), ""));
  stats.appendChild(UI.statCard("⭐", "var(--gold)", "var(--gold-bg)", "JETCH+", String(jetch), "подписок"));
  stats.appendChild(UI.statCard("🚫", "var(--red)", "var(--red-bg)", "Заблокировано", String(blocked), ""));
  stats.appendChild(UI.statCard("📈", "var(--green)", "var(--green-bg)", "Всего анализов", String(totalAnalyzed), ""));
  card.appendChild(stats);

  var sorted = users.slice().sort(function (a, b) { return b.analyzed - a.analyzed; }).slice(0, 5);
  card.appendChild(el("div", { style: "font-size:13px;font-weight:700;margin-top:18px;margin-bottom:10px;color:var(--accent-light);" }, "🔥 Топ-5 по анализам"));
  for (var j = 0; j < sorted.length; j++) {
    var u = sorted[j];
    var row = el("div", { style: "display:flex;align-items:center;gap:10px;padding:8px 10px;background:var(--bg-elev);border:1px solid var(--border);border-radius:8px;margin-bottom:6px;" });
    row.appendChild(el("div", { style: "font-size:13px;font-weight:700;color:var(--text-muted);width:20px;" }, "#" + (j + 1)));
    row.appendChild(el("div", { style: "flex:1;font-size:13px;font-weight:600;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, u.nickname));
    row.appendChild(el("div", { style: "font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;color:var(--cyan);" }, String(u.analyzed)));
    card.appendChild(row);
  }
  return card;
}

async function renderAdminUsers() {
  var card = UI.card("👥 Пользователи");
  var users = await AdminPanel.loadUsers();
  var searchInp = UI.input("Поиск по нику или UID...");
  searchInp.style.marginBottom = "12px";
  card.appendChild(searchInp);
  var listWrap = el("div", { id: "adminUsersList" });
  card.appendChild(listWrap);

  function renderList(filter) {
    listWrap.innerHTML = "";
    var q = (filter || "").toLowerCase();
    var filtered = users.filter(function (u) {
      if (!q) return true;
      return u.nickname.toLowerCase().indexOf(q) >= 0 || u.uid.toLowerCase().indexOf(q) >= 0;
    });
    if (!filtered.length) {
      listWrap.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:16px;text-align:center;" }, "Ничего не найдено"));
      return;
    }
    listWrap.appendChild(el("div", { class: "dim", style: "font-size:11px;margin-bottom:8px;" }, "Найдено: " + filtered.length));
    for (var i = 0; i < filtered.length; i++) listWrap.appendChild(buildUserRow(filtered[i]));
  }
  searchInp.addEventListener("input", function () { renderList(searchInp.value); });
  renderList("");
  return card;
}

function buildUserRow(user) {
  var row = el("div", { style: "display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;cursor:pointer;" });
  row.addEventListener("mouseenter", function () { row.style.borderColor = "var(--accent)"; });
  row.addEventListener("mouseleave", function () { row.style.borderColor = "var(--border)"; });
  var av = el("div", { style: "width:38px;height:38px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--accent),var(--cyan));background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:14px;" });
  if (user.avatar) av.style.backgroundImage = "url(" + user.avatar + ")";
  else av.textContent = String(user.nickname).charAt(0).toUpperCase();
  row.appendChild(av);
  var info = el("div", { style: "flex:1;min-width:0;" });
  var nameRow = el("div", { style: "display:flex;align-items:center;gap:6px;" });
  nameRow.appendChild(el("div", { style: "font-size:13px;font-weight:700;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, user.nickname));
  if (user.license.forever) nameRow.appendChild(UI.badge("JETCH+ ∞", "var(--gold)", "var(--gold-bg)"));
  else if (user.license.active) nameRow.appendChild(UI.badge("JETCH+", "var(--gold)", "var(--gold-bg)"));
  if (user.blocked) nameRow.appendChild(UI.badge("BAN", "var(--red)", "var(--red-bg)"));
  info.appendChild(nameRow);
  info.appendChild(el("div", { class: "dim", style: "font-size:10.5px;font-family:'JetBrains Mono',monospace;margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" }, user.uid));
  row.appendChild(info);
  row.appendChild(el("div", { style: "font-size:20px;color:var(--text-muted);flex-shrink:0;" }, "›"));
  row.addEventListener("click", function () { openUserDetailModal(user); });
  return row;
}

function openUserDetailModal(user) {
  var existing = document.getElementById("adminUserModal");
  if (existing) existing.remove();
  var ov = el("div", { id: "adminUserModal" });
  ov.style.cssText = "position:fixed;inset:0;z-index:9999999;background:rgba(2,3,8,0.8);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto;";
  var box = el("div");
  box.style.cssText = "max-width:520px;width:100%;background:var(--bg-card);border:1px solid var(--accent);border-radius:16px;padding:24px;max-height:90vh;overflow-y:auto;";
  var header = el("div", { style: "display:flex;align-items:center;gap:14px;margin-bottom:16px;" });
  var av = el("div", { style: "width:56px;height:56px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--accent),var(--cyan));background-size:cover;background-position:center;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:22px;" });
  if (user.avatar) av.style.backgroundImage = "url(" + user.avatar + ")";
  else av.textContent = String(user.nickname).charAt(0).toUpperCase();
  header.appendChild(av);
  var hInfo = el("div", { style: "flex:1;min-width:0;" });
  hInfo.appendChild(el("div", { style: "font-size:18px;font-weight:800;color:var(--text);" }, user.nickname));
  hInfo.appendChild(el("div", { class: "dim", style: "font-size:11px;font-family:'JetBrains Mono',monospace;margin-top:4px;word-break:break-all;" }, user.uid));
  header.appendChild(hInfo);
  var closeBtn = el("button", { type: "button", style: "width:32px;height:32px;border-radius:8px;background:transparent;border:1px solid var(--border);color:var(--text-muted);cursor:pointer;font-size:14px;flex-shrink:0;" }, "✕");
  closeBtn.addEventListener("click", function () { ov.remove(); });
  header.appendChild(closeBtn);
  box.appendChild(header);

  var statusRow = el("div", { style: "display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px;" });
  statusRow.appendChild(UI.badge("Анализов: " + user.analyzed, "var(--cyan)", "var(--cyan-bg)"));
  if (user.license.forever) statusRow.appendChild(UI.badge("JETCH+ ∞", "var(--gold)", "var(--gold-bg)"));
  else if (user.license.active) statusRow.appendChild(UI.badge("JETCH+", "var(--gold)", "var(--gold-bg)"));
  else statusRow.appendChild(UI.badge("FREE", "var(--text-muted)", "var(--bg-elev)"));
  if (user.blocked) statusRow.appendChild(UI.badge("ЗАБЛОКИРОВАН", "var(--red)", "var(--red-bg)"));
  box.appendChild(statusRow);

  box.appendChild(el("div", { style: "font-size:13px;font-weight:700;margin-bottom:10px;color:var(--text);" }, "Действия"));

  function makeActionBtn(label, color, handler) {
    var b = el("button", { type: "button" });
    b.textContent = label;
    b.style.cssText = "width:100%;padding:11px 14px;margin-bottom:8px;border-radius:10px;font-size:13px;font-weight:600;font-family:inherit;cursor:pointer;border:1px solid " + color + ";background:transparent;color:" + color + ";text-align:left;";
    b.addEventListener("mouseenter", function () { b.style.background = color; b.style.color = "#0b0c10"; });
    b.addEventListener("mouseleave", function () { b.style.background = "transparent"; b.style.color = color; });
    b.addEventListener("click", handler);
    return b;
  }

  if (user.license.forever || user.license.active) {
    box.appendChild(makeActionBtn("❌ Снять JETCH+", "var(--red)", async function () {
      if (!confirm("Снять подписку с " + user.nickname + "?")) return;
      await AdminPanel.updateUser(user.uid, { "license__DOT__active": false, "license__DOT__forever": false, "license__DOT__expires": null });
      await AdminPanel.log("remove_jetch", user.nickname);
      ov.remove(); renderAdminTab("users");
    }));
  } else {
    box.appendChild(makeActionBtn("⭐ Выдать JETCH+ бессрочно", "var(--gold)", async function () {
      if (!confirm("Выдать бессрочный JETCH+ для " + user.nickname + "?")) return;
      await AdminPanel.updateUser(user.uid, { "license__DOT__active": true, "license__DOT__forever": true, "license__DOT__expires": null });
      await AdminPanel.log("give_jetch_forever", user.nickname);
      ov.remove(); renderAdminTab("users");
    }));
  }

  if (user.blocked) {
    box.appendChild(makeActionBtn("✅ Разблокировать", "var(--green)", async function () {
      if (!confirm("Разблокировать " + user.nickname + "?")) return;
      await AdminPanel.updateUser(user.uid, { blocked: false });
      await AdminPanel.log("unblock", user.nickname);
      ov.remove(); renderAdminTab("users");
    }));
  } else {
    box.appendChild(makeActionBtn("🚫 Заблокировать", "var(--red)", async function () {
      if (!confirm("Заблокировать " + user.nickname + "?")) return;
      await AdminPanel.updateUser(user.uid, { blocked: true });
      await AdminPanel.log("block", user.nickname);
      ov.remove(); renderAdminTab("users");
    }));
  }

  box.appendChild(makeActionBtn("🔄 Сбросить статистику", "var(--orange)", async function () {
    if (!confirm("Сбросить статистику для " + user.nickname + "?")) return;
    await AdminPanel.updateUser(user.uid, { analyzedcount: 0, achievementsunlocked: [], diarynotes: [] });
    await AdminPanel.log("reset_stats", user.nickname);
    ov.remove(); renderAdminTab("users");
  }));

  box.appendChild(makeActionBtn("🗑️ Удалить аккаунт", "var(--red)", async function () {
    if (!confirm("УДАЛИТЬ " + user.nickname + "?")) return;
    if (!confirm("Точно?")) return;
    await AdminPanel.deleteUser(user.uid);
    await AdminPanel.log("delete_user", user.nickname);
    ov.remove(); renderAdminTab("users");
  }));

  ov.appendChild(box);
  ov.addEventListener("click", function (e) { if (e.target === ov) ov.remove(); });
  document.body.appendChild(ov);
}

async function renderAdminConfig() {
  var card = UI.card("⚙️ Настройки сайта");
  var cfg = await AdminPanel.loadConfig();
  if (!cfg) cfg = { maintenance: { enabled: false, message: "" }, notification: { enabled: false, text: "" }, minigames: {} };

  card.appendChild(el("div", { style: "font-size:15px;font-weight:800;color:var(--accent-light);margin-bottom:10px;" }, "🛠️ Режим тех работ"));
  card.appendChild(el("div", { class: "dim", style: "font-size:11.5px;margin-bottom:12px;line-height:1.5;" }, "Все пользователи увидят блокирующее окно. Ты как админ сможешь пользоваться сайтом."));

  var mntEnabled = cfg.maintenance.enabled;
  var mntBtn = el("button", { type: "button" });
  function updateMntBtn() {
    mntBtn.textContent = mntEnabled ? "🔴 ВЫКЛЮЧИТЬ тех работы" : "🟢 ВКЛЮЧИТЬ тех работы";
    mntBtn.style.cssText = "width:100%;padding:12px;border-radius:10px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid " + (mntEnabled ? "var(--red)" : "var(--green)") + ";background:" + (mntEnabled ? "var(--red-bg)" : "var(--green-bg)") + ";color:" + (mntEnabled ? "var(--red)" : "var(--green)") + ";margin-bottom:10px;";
  }
  updateMntBtn();
  mntBtn.addEventListener("click", async function () {
    mntEnabled = !mntEnabled;
    await AdminPanel.updateConfig({ "maintenance/enabled": mntEnabled });
    await AdminPanel.log("maintenance", mntEnabled ? "включены" : "выключены");
    updateMntBtn();
  });
  card.appendChild(mntBtn);

  var mntMsgInp = UI.input("Сообщение на экране тех работ");
  mntMsgInp.value = cfg.maintenance.message || "";
  mntMsgInp.style.marginBottom = "8px";
  card.appendChild(mntMsgInp);

  var mntSaveBtn = UI.btn("Сохранить сообщение", { variant: "ghost" });
  mntSaveBtn.style.width = "100%";
  mntSaveBtn.addEventListener("click", async function () {
    await AdminPanel.updateConfig({ "maintenance/message": mntMsgInp.value });
    alert("Сохранено.");
  });
  card.appendChild(mntSaveBtn);

  card.appendChild(el("div", { style: "font-size:15px;font-weight:800;color:var(--accent-light);margin-top:24px;margin-bottom:10px;" }, "📢 Глобальное уведомление"));
  card.appendChild(el("div", { class: "dim", style: "font-size:11.5px;margin-bottom:12px;" }, "Показывается всем пользователям на главной."));

  var notifEnabled = cfg.notification.enabled;
  var notifBtn = el("button", { type: "button" });
  function updateNotifBtn() {
    notifBtn.textContent = notifEnabled ? "🔴 Отключить уведомление" : "🟢 Включить уведомление";
    notifBtn.style.cssText = "width:100%;padding:12px;border-radius:10px;font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid " + (notifEnabled ? "var(--red)" : "var(--green)") + ";background:" + (notifEnabled ? "var(--red-bg)" : "var(--green-bg)") + ";color:" + (notifEnabled ? "var(--red)" : "var(--green)") + ";margin-bottom:10px;";
  }
  updateNotifBtn();
  notifBtn.addEventListener("click", async function () {
    notifEnabled = !notifEnabled;
    await AdminPanel.updateConfig({ "notification/enabled": notifEnabled });
    await AdminPanel.log("notification", notifEnabled ? "включено" : "выключено");
    updateNotifBtn();
  });
  card.appendChild(notifBtn);

  var notifTextInp = UI.input("Текст уведомления");
  notifTextInp.value = cfg.notification.text || "";
  notifTextInp.style.marginBottom = "8px";
  card.appendChild(notifTextInp);

  var notifSaveBtn = UI.btn("Сохранить текст", { variant: "ghost" });
  notifSaveBtn.style.width = "100%";
  notifSaveBtn.addEventListener("click", async function () {
    await AdminPanel.updateConfig({ "notification/text": notifTextInp.value });
    alert("Сохранено.");
  });
  card.appendChild(notifSaveBtn);

  card.appendChild(el("div", { style: "font-size:15px;font-weight:800;color:var(--accent-light);margin-top:24px;margin-bottom:10px;" }, "🎮 Мини-игры"));
  var games = [
    { id: "lockpick", label: "🔓 Взлом замка" },
    { id: "automaton", label: "⌨️ Атака автоматонов" },
    { id: "direjumper", label: "🎪 Дири-Джампер" },
    { id: "quiz", label: "🧠 Викторина" }
  ];
  for (var g = 0; g < games.length; g++) {
    (function (game) {
      var isOn = cfg.minigames[game.id] !== false;
      var row = el("div", { style: "display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;" });
      row.appendChild(el("div", { style: "font-size:13px;font-weight:600;color:var(--text);" }, game.label));
      var toggle = el("button", { type: "button" });
      toggle.textContent = isOn ? "ВКЛ" : "ВЫКЛ";
      toggle.style.cssText = "padding:6px 14px;border-radius:8px;font-size:11px;font-weight:800;font-family:inherit;cursor:pointer;border:1px solid " + (isOn ? "var(--green)" : "var(--red)") + ";background:" + (isOn ? "var(--green-bg)" : "var(--red-bg)") + ";color:" + (isOn ? "var(--green)" : "var(--red)") + ";";
      toggle.addEventListener("click", async function () {
        var patch = {};
        patch["minigames/" + game.id] = !isOn;
        await AdminPanel.updateConfig(patch);
        await AdminPanel.log("minigame_toggle", game.id + " -> " + !isOn);
        renderAdminTab("config");
      });
      row.appendChild(toggle);
      card.appendChild(row);
    })(games[g]);
  }

  card.appendChild(el("div", { style: "font-size:15px;font-weight:800;color:var(--accent-light);margin-top:24px;margin-bottom:10px;" }, "💾 Экспорт"));
  var exportBtn = UI.btn("Скачать базу пользователей (JSON)", { variant: "ghost" });
  exportBtn.style.width = "100%";
  exportBtn.addEventListener("click", async function () {
    var users = await AdminPanel.loadUsers();
    var blob = new Blob([JSON.stringify(users, null, 2)], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = "dota-jetch-users-" + Date.now() + ".json"; a.click();
    URL.revokeObjectURL(url);
    await AdminPanel.log("export_users", users.length + " пользователей");
  });
  card.appendChild(exportBtn);
  return card;
}

async function renderAdminLogs() {
  var card = UI.card("📜 Логи");
  var logs = await AdminPanel.loadLogs(100);
  if (!logs.length) {
    card.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:16px;text-align:center;" }, "Пока пусто."));
    return card;
  }
  var actionNames = {
    give_jetch_forever: "⭐ Выдан JETCH+ ∞",
    remove_jetch: "❌ Снят JETCH+",
    block: "🚫 Заблокирован", unblock: "✅ Разблокирован",
    reset_stats: "🔄 Сброс статистики", delete_user: "🗑️ Удалён аккаунт",
    add_admin: "🛡 Добавлен админ", remove_admin: "🛡 Удалён админ",
    maintenance: "🛠️ Тех работы", notification: "📢 Уведомление",
    minigame_toggle: "🎮 Мини-игра", export_users: "💾 Экспорт"
  };
  for (var i = 0; i < logs.length; i++) {
    var log = logs[i];
    var row = el("div", { style: "padding:10px 12px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;margin-bottom:6px;" });
    var top = el("div", { style: "display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:4px;" });
    top.appendChild(el("div", { style: "font-size:12.5px;font-weight:700;color:var(--text);" }, actionNames[log.action] || log.action));
    try {
      var d = new Date(log.ts);
      top.appendChild(el("div", { class: "dim", style: "font-size:10.5px;font-family:'JetBrains Mono',monospace;" }, d.toLocaleString("ru-RU")));
    } catch (e) {}
    row.appendChild(top);
    if (log.details) row.appendChild(el("div", { class: "dim", style: "font-size:11px;line-height:1.4;" }, log.details));
    card.appendChild(row);
  }
  return card;
}

async function renderAdminAdmins() {
  var card = UI.card("🛡 Администраторы");
  card.appendChild(el("div", { class: "dim", style: "font-size:11.5px;margin-bottom:14px;line-height:1.5;" }, "Список UID с доступом в админку."));
  var admins = await AdminPanel.loadAdmins();
  var uids = Object.keys(admins);
  if (!uids.length) {
    card.appendChild(el("div", { class: "dim", style: "font-size:12px;padding:12px;text-align:center;" }, "Список пуст."));
  } else {
    for (var i = 0; i < uids.length; i++) {
      (function (uid) {
        var row = el("div", { style: "display:flex;align-items:center;gap:10px;padding:10px;background:var(--bg-elev);border:1px solid var(--gold);border-radius:10px;margin-bottom:6px;" });
        row.appendChild(el("div", { style: "font-size:18px;color:var(--gold);" }, "⭐"));
        row.appendChild(el("div", { style: "flex:1;font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--text);word-break:break-all;" }, uid));
        var rmBtn = el("button", { type: "button", style: "padding:5px 10px;border-radius:6px;font-size:11px;font-weight:700;font-family:inherit;cursor:pointer;border:1px solid var(--red);background:transparent;color:var(--red);" }, "Убрать");
        rmBtn.addEventListener("click", async function () {
          if (!confirm("Убрать доступ?")) return;
          await AdminPanel.removeAdmin(uid);
          renderAdminTab("admins");
        });
        row.appendChild(rmBtn);
        card.appendChild(row);
      })(uids[i]);
    }
  }
  card.appendChild(el("div", { style: "font-size:13px;font-weight:700;margin-top:20px;margin-bottom:10px;color:var(--accent-light);" }, "Добавить админа"));
  var addInp = UI.input("UID пользователя");
  addInp.style.marginBottom = "8px";
  card.appendChild(addInp);
  var addBtn = UI.btn("Добавить", { variant: "ghost" });
  addBtn.style.width = "100%";
  addBtn.addEventListener("click", async function () {
    var v = addInp.value.trim();
    if (!v) { alert("Введи UID"); return; }
    if (!confirm("Дать админ-права для " + v + "?")) return;
    await AdminPanel.addAdmin(v);
    addInp.value = "";
    renderAdminTab("admins");
  });
  card.appendChild(addBtn);
  return card;
}

console.log("admin-panel v1.0 ready");
