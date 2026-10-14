/* DOTA JETCH — FIREBASE AUTH v12.7 (add userLoggedIn event) */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, sendPasswordResetEmail, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { getDatabase, ref, get, update, remove, set, onValue } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getDatabase(app);

window.__fbAuth = auth;
window.__fbDB = { db: db, ref: ref, get: get, update: update, remove: remove, set: set, onValue: onValue };

window.__fbSignOut = async function () {
  if (currentUser) { try { await saveUserData(currentUser.uid); } catch (e) {} }
  try { await signOut(auth); } catch (e) {}
};

setPersistence(auth, browserLocalPersistence).catch(e => console.warn("persistence:", e));

let currentUser = null;
let autoSaveInterval = null;
let pollInterval = null;

const STORE_PREFIX = "dota.";
const NICK_REGEX = /^[A-Za-z0-9_]{3,20}$/;
const NICK_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

const POLL_INTERVAL_MS = 20000;
const RELOAD_COOLDOWN_MS = 15000;
let lastReloadAt = 0;

const HINT_BASE = "font-size:10px;font-weight:400;color:#666;margin:-4px 0 12px 4px;line-height:1.4;text-align:left;letter-spacing:0.02em;font-family:'Inter',sans-serif;";
const HINT_OK = HINT_BASE + "color:#22c55e;";
const HINT_BAD = HINT_BASE + "color:#ef4444;";

function encodeKey(k) {
  return String(k).replace(/\./g, "__DOT__").replace(/\//g, "__SLASH__")
    .replace(/#/g, "__HASH__").replace(/\$/g, "__DOLLAR__")
    .replace(/\[/g, "__LB__").replace(/\]/g, "__RB__");
}
function decodeKey(k) {
  return String(k).replace(/__DOT__/g, ".").replace(/__SLASH__/g, "/")
    .replace(/__HASH__/g, "#").replace(/__DOLLAR__/g, "$")
    .replace(/__LB__/g, "[").replace(/__RB__/g, "]");
}

function wipeLocalUserData() {
  try {
    let removed = 0;
    const keys = Object.keys(sessionStorage);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.indexOf(STORE_PREFIX) === 0) { sessionStorage.removeItem(k); removed++; }
    }
    const lkeys = Object.keys(localStorage);
    for (let j = 0; j < lkeys.length; j++) {
      const lk = lkeys[j];
      if (lk.indexOf(STORE_PREFIX) === 0) { localStorage.removeItem(lk); removed++; }
    }
    console.log("🧹 Очищено " + removed + " ключей");
  } catch (e) {}
}

function startPollingAdminChanges(uid) {
  stopPollingAdminChanges();
  var lastState = null;
  async function check() {
    if (!currentUser || currentUser.uid !== uid) return;
    try {
      const snap = await get(ref(db, "users/" + uid));
      const data = snap.val() || {};
      for (const key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
        const val = data[key];
        if (val === null || val === undefined) continue;
        try { sessionStorage.setItem(STORE_PREFIX + decodeKey(key), JSON.stringify(val)); } catch (e) {}
      }
      var state = {
        nick: data.nickname || null,
        licActive: data["license__DOT__active"] === true,
        licForever: data["license__DOT__forever"] === true,
        licExpires: data["license__DOT__expires"] || null,
        blocked: data.blocked === true
      };
      if (lastState === null) { lastState = state; return; }
      var changed = false, what = [];
      if (lastState.nick !== state.nick) { changed = true; what.push("ник"); }
      if (lastState.licActive !== state.licActive) { changed = true; what.push("JETCH+ статус"); }
      if (lastState.licForever !== state.licForever) { changed = true; what.push("JETCH+ бессрочный"); }
      if (lastState.licExpires !== state.licExpires) { changed = true; what.push("JETCH+ срок"); }
      if (lastState.blocked !== state.blocked) { changed = true; what.push(state.blocked ? "блокировка" : "разблокировка"); }
      if (!changed) { lastState = state; return; }
      if (Date.now() - lastReloadAt < RELOAD_COOLDOWN_MS) {
        console.log("⏸ Изменения есть (" + what.join(", ") + "), но кулдаун ещё идёт");
        return;
      }
      lastReloadAt = Date.now();
      console.log("🔄 Админ изменил: " + what.join(", ") + " → перезагрузка");
      setTimeout(function () { location.reload(); }, 400);
    } catch (e) {}
  }
  setTimeout(check, 5000);
  pollInterval = setInterval(check, POLL_INTERVAL_MS);
}
function stopPollingAdminChanges() {
  if (pollInterval) { clearInterval(pollInterval); pollInterval = null; }
}

async function syncPublicProfile() {
  if (!currentUser) return;
  var nick = getCurrentNickname() || "";
  var avatar = Store.get("avatar", null);
  var mmr = Store.get("minigames_mmr", 0) || 0;
  var calibrated = Store.get("minigames_calibrated", false) === true;
  var data = { nickname: nick, mmr: mmr, calibrated: calibrated, ts: Date.now() };
  if (avatar && typeof avatar === "string" && avatar.indexOf("data:image") === 0) data.avatar = avatar;
  try {
    await update(ref(db, "publicProfiles/" + currentUser.uid), data);
    if (!data.avatar) {
      try { await remove(ref(db, "publicProfiles/" + currentUser.uid + "/avatar")); } catch (e) {}
    }
  } catch (e) { console.warn("syncPublicProfile:", e); }
}
window.syncPublicProfileMMR = function (mmr) {
  if (!currentUser) return;
  var calibrated = Store.get("minigames_calibrated", false) === true;
  update(ref(db, "publicProfiles/" + currentUser.uid), { mmr: mmr, calibrated: calibrated, ts: Date.now() }).catch(function (e) {});
};

async function isNicknameTaken(nick) {
  const lower = String(nick).toLowerCase();
  try { const snap = await get(ref(db, "nicknames/" + lower)); return snap.exists(); } catch (e) { return false; }
}
async function claimNickname(nick, uid) {
  const lower = String(nick).toLowerCase();
  try { await update(ref(db, "nicknames"), { [lower]: uid }); return true; } catch (e) { return false; }
}
async function releaseNickname(nick) {
  const lower = String(nick).toLowerCase();
  try { await remove(ref(db, "nicknames/" + lower)); } catch (e) {}
}

function getCurrentNickname() { const n = Store.get("nickname", ""); return typeof n === "string" ? n : ""; }

function nicknameCooldownDaysLeft() {
  const last = Number(Store.get("nicknameChangedAt", 0)) || 0;
  if (!last) return 0;
  const elapsed = Date.now() - last;
  if (elapsed >= NICK_COOLDOWN_MS) return 0;
  return Math.ceil((NICK_COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
}
window.nicknameCooldownDaysLeft = nicknameCooldownDaysLeft;

window.changeNickname = async function (newNick) {
  if (!currentUser) return { ok: false, msg: "Не авторизован." };
  newNick = String(newNick || "").trim();
  if (!NICK_REGEX.test(newNick)) return { ok: false, msg: "Ник: 3-20 символов, латиница, цифры, _" };
  const daysLeft = nicknameCooldownDaysLeft();
  if (daysLeft > 0) return { ok: false, msg: "Ник можно менять раз в 30 дней. Осталось: " + daysLeft + " дн." };
  const oldNick = getCurrentNickname() || "";
  if (oldNick && oldNick.toLowerCase() === newNick.toLowerCase()) return { ok: false, msg: "Это твой текущий ник." };
  const taken = await isNicknameTaken(newNick);
  if (taken) return { ok: false, msg: "Этот ник уже занят." };
  try {
    if (oldNick) await releaseNickname(oldNick);
    await claimNickname(newNick, currentUser.uid);
    Store.set("nickname", newNick);
    Store.set("nicknameChangedAt", Date.now());
    await syncPublicProfile();
    if (typeof window.refreshUserUI === "function") window.refreshUserUI();
    return { ok: true, msg: "Ник изменён на " + newNick + "." };
  } catch (e) { return { ok: false, msg: "Ошибка: " + (e.message || e) }; }
};

window.changeAvatar = function (dataUrl) {
  if (!currentUser) return { ok: false, msg: "Не авторизован." };
  if (typeof dataUrl !== "string" || dataUrl.indexOf("data:image") !== 0) return { ok: false, msg: "Неверный формат." };
  if (dataUrl.length > 200000) return { ok: false, msg: "Аватар слишком большой." };
  Store.set("avatar", dataUrl);
  syncPublicProfile();
  if (typeof window.refreshUserUI === "function") window.refreshUserUI();
  return { ok: true, msg: "Аватар обновлён" };
};

async function loadUserData(uid) {
  try {
    const snap = await get(ref(db, "users/" + uid));
    const data = snap.val() || {};
    for (const key in data) {
      if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
      const val = data[key];
      if (val === null || val === undefined) continue;
      try { sessionStorage.setItem(STORE_PREFIX + decodeKey(key), JSON.stringify(val)); } catch (e) {}
    }
    console.log("📥 Данные загружены из Firebase");
  } catch (e) { console.warn("loadUserData:", e); }
}

async function saveUserData(uid) {
  try {
    const keys = Object.keys(sessionStorage);
    const data = {};
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.indexOf(STORE_PREFIX) !== 0) continue;
      const raw = sessionStorage.getItem(k);
      if (!raw) continue;
      try { data[encodeKey(k.slice(STORE_PREFIX.length))] = JSON.parse(raw); } catch (e) {}
    }
    data["lastSeen"] = Date.now();
    await update(ref(db, "users/" + uid), data);
  } catch (e) { console.warn("saveUserData:", e); }
}

function setupStoreSync(uid) {
  let saveTimer = null;
  const origSet = Store.set;
  Store.set = function (key, value) {
    origSet.call(Store, key, value);
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        const payload = {};
        if (value === null || value === undefined) { remove(ref(db, "users/" + uid + "/" + encodeKey(key))).catch(function () {}); }
        else { payload[encodeKey(key)] = value; update(ref(db, "users/" + uid), payload).catch(function () {}); }
      } catch (e) {}
    }, 800);
  };
}

function startAutoSave(uid) {
  stopAutoSave();
  autoSaveInterval = setInterval(function () { saveUserData(uid); }, 30000);
}
function stopAutoSave() {
  if (autoSaveInterval) { clearInterval(autoSaveInterval); autoSaveInterval = null; }
}

function translateAuthError(code, message) {
  var map = {
    "auth/email-already-in-use": "Этот email уже зарегистрирован.",
    "auth/invalid-email": "Некорректный email.",
    "auth/weak-password": "Пароль слишком слабый (мин. 6 символов).",
    "auth/user-not-found": "Пользователь не найден.",
    "auth/wrong-password": "Неверный пароль.",
    "auth/too-many-requests": "Слишком много попыток. Попробуй позже.",
    "auth/network-request-failed": "Нет соединения с интернетом.",
    "auth/invalid-credential": "Неверный email или пароль."
  };
  return map[code] || message || "Ошибка авторизации.";
}

function isPlusActive() {
  if (Store.get("license.forever", false) === true) return true;
  var exp = Store.get("license.expires", null);
  if (exp) { try { return new Date(exp) > new Date(); } catch (e) { return false; } }
  return Store.get("license.active", false) === true;
}

window.refreshUserUI = function () {
  if (typeof window.updateSidebarPlan === "function") window.updateSidebarPlan();
  if (typeof window.updateProfileModal === "function") window.updateProfileModal();
  if (typeof window.checkLicense === "function") window.checkLicense();
};

function injectAuthAnimations() {
  if (document.getElementById("authStyles")) return;
  var style = document.createElement("style");
  style.id = "authStyles";
  style.textContent = `
    #authOverlay { position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;background:var(--bg); }
    .auth-card { width:100%;max-width:380px;padding:32px 28px;background:var(--bg-card);border:1px solid var(--border);border-radius:18px;box-shadow:0 20px 60px -20px rgba(0,0,0,0.8); }
    .auth-title { font-size:22px;font-weight:900;text-align:center;margin-bottom:6px;color:var(--text); }
    .auth-sub { font-size:12px;text-align:center;color:var(--text-muted);margin-bottom:24px;line-height:1.5; }
    .auth-input { width:100%;padding:12px 14px;margin-bottom:12px;background:var(--bg-elev);border:1px solid var(--border);border-radius:10px;color:var(--text);font-size:14px;font-family:inherit;outline:none; }
    .auth-input:focus { border-color:var(--accent); }
    .auth-btn { width:100%;padding:12px;border-radius:10px;border:none;font-size:14px;font-weight:800;font-family:inherit;cursor:pointer;background:linear-gradient(135deg,var(--accent),var(--cyan));color:#fff; }
    .auth-btn-ghost { background:transparent;border:1px solid var(--border);color:var(--text-muted);margin-top:10px; }
    .auth-link { color:var(--cyan);cursor:pointer;text-decoration:none;font-weight:600; }
    .auth-msg { font-size:11px;min-height:16px;margin-bottom:10px;text-align:center; }
  `;
  document.head.appendChild(style);
}

function showAuthScreen() {
  if (document.getElementById("authOverlay")) return;
  var overlay = document.createElement("div");
  overlay.id = "authOverlay";
  overlay.innerHTML = `
    <div class="auth-card">
      <div class="auth-title">DOTA JETCH</div>
      <div class="auth-sub">Войди или создай аккаунт</div>
      <div id="authMsg" class="auth-msg"></div>
      <input type="email" id="authEmail" class="auth-input" placeholder="Email" autocomplete="email">
      <input type="password" id="authPassword" class="auth-input" placeholder="Пароль" autocomplete="current-password">
      <button id="authLoginBtn" class="auth-btn">Войти</button>
      <button id="authRegisterBtn" class="auth-btn auth-btn-ghost">Создать аккаунт</button>
      <div style="text-align:center;margin-top:16px;font-size:11px;">
        <span id="authResetLink" class="auth-link">Забыли пароль?</span>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  bindAuthForm();
}

function hideAuthScreen() {
  var ov = document.getElementById("authOverlay");
  if (ov) ov.remove();
}

function bindAuthForm() {
  var emailInp = document.getElementById("authEmail");
  var passInp = document.getElementById("authPassword");
  var loginBtn = document.getElementById("authLoginBtn");
  var regBtn = document.getElementById("authRegisterBtn");
  var resetLink = document.getElementById("authResetLink");
  var msg = document.getElementById("authMsg");

  function setMsg(text, isError) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isError ? "var(--red)" : "var(--green)";
  }

  loginBtn.addEventListener("click", async function () {
    var email = emailInp.value.trim();
    var pass = passInp.value;
    if (!email || !pass) { setMsg("Заполни все поля", true); return; }
    loginBtn.disabled = true; loginBtn.textContent = "Вхожу...";
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (e) {
      setMsg(translateAuthError(e.code, e.message), true);
    }
    loginBtn.disabled = false; loginBtn.textContent = "Войти";
  });

  regBtn.addEventListener("click", async function () {
    var email = emailInp.value.trim();
    var pass = passInp.value;
    if (!email || !pass) { setMsg("Заполни все поля", true); return; }
    if (pass.length < 6) { setMsg("Пароль минимум 6 символов", true); return; }
    regBtn.disabled = true; regBtn.textContent = "Создаю...";
    try {
      var cred = await createUserWithEmailAndPassword(auth, email, pass);
      await sendEmailVerification(cred.user);
      setMsg("Письмо с подтверждением отправлено на " + email, false);
    } catch (e) {
      setMsg(translateAuthError(e.code, e.message), true);
    }
    regBtn.disabled = false; regBtn.textContent = "Создать аккаунт";
  });

  resetLink.addEventListener("click", async function () {
    var email = emailInp.value.trim();
    if (!email) { setMsg("Введи email для сброса", true); return; }
    try {
      await sendPasswordResetEmail(auth, email);
      setMsg("Ссылка для сброса отправлена на " + email, false);
    } catch (e) {
      setMsg(translateAuthError(e.code, e.message), true);
    }
  });
}

function showVerificationScreen(email) {
  hideAuthScreen();
  var overlay = document.createElement("div");
  overlay.id = "authOverlay";
  overlay.innerHTML = `
    <div class="auth-card" style="text-align:center;">
      <div style="font-size:48px;margin-bottom:12px;">✉️</div>
      <div class="auth-title" style="font-size:18px;">Подтверди email</div>
      <div class="auth-sub">Мы отправили письмо на <b>${email}</b>.<br>Перейди по ссылке и вернись сюда.</div>
      <button id="verifyRefreshBtn" class="auth-btn">Я подтвердил — войти</button>
      <button id="verifyLogoutBtn" class="auth-btn auth-btn-ghost">Выйти</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.getElementById("verifyRefreshBtn").addEventListener("click", async function () {
    if (currentUser) {
      await currentUser.reload();
      if (currentUser.emailVerified) { location.reload(); }
      else { alert("Email ещё не подтверждён. Проверь почту."); }
    }
  });
  document.getElementById("verifyLogoutBtn").addEventListener("click", async function () {
    await signOut(auth);
    location.reload();
  });
}

onAuthStateChanged(auth, async function (user) {
  console.log("🔐 onAuthStateChanged: " + (user ? user.uid : "null"));
  if (user) {
    currentUser = user;
    if (!user.emailVerified) {
      stopAutoSave();
      stopPollingAdminChanges();
      showVerificationScreen(user.email);
      return;
    }
    try {
      const blockSnap = await get(ref(db, "users/" + user.uid + "/blocked"));
      if (blockSnap.exists() && blockSnap.val() === true) {
        alert("⛔ Твой аккаунт заблокирован администратором.");
        try { await signOut(auth); } catch (e) {}
        showAuthScreen();
        return;
      }
    } catch (e) { console.warn("block check:", e); }

    const loadedFlag = "dotaJetchLoadedUid_session";
    const currentInSession = sessionStorage.getItem(loadedFlag);
    if (currentInSession !== user.uid) {
      wipeLocalUserData();
      sessionStorage.setItem(loadedFlag, user.uid);
      await loadUserData(user.uid);
      location.reload();
      return;
    }

    hideAuthScreen();
    setupStoreSync(user.uid);
    startAutoSave(user.uid);
    startPollingAdminChanges(user.uid);
    window.refreshUserUI();
    syncPublicProfile();
    if (typeof window.checkMaintenance === "function") {
      setTimeout(function () { window.checkMaintenance(); }, 300);
    }

    window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: { user: user } }));

  } else {
    currentUser = null;
    stopAutoSave();
    stopPollingAdminChanges();
    wipeLocalUserData();
    sessionStorage.removeItem("dotaJetchLoadedUid_session");
    showAuthScreen();
  }
});

document.addEventListener("DOMContentLoaded", function () {
  injectAuthAnimations();
  showAuthScreen();
});
