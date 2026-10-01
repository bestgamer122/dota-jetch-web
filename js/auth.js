/* DOTA JETCH — FIREBASE AUTH v9.2
   - Inline-стили для подсказки ника (bulletproof)
   - Кулдаун смены ника 30 дней
   - Пробелы в auth-switch */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import {
  getAuth, onAuthStateChanged, createUserWithEmailAndPassword,
  signInWithEmailAndPassword, signOut, sendEmailVerification,
  sendPasswordResetEmail, setPersistence, browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { getDatabase, ref, get, update, remove } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getDatabase(app);

setPersistence(auth, browserLocalPersistence).catch(e => console.warn("persistence:", e));

let currentUser = null;
let autoSaveInterval = null;

const STORE_PREFIX = "dota.";
const NICK_REGEX = /^[A-Za-z0-9_]{3,20}$/;
const NICK_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

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

async function isNicknameTaken(nick) {
  const lower = String(nick).toLowerCase();
  try {
    const snap = await get(ref(db, "nicknames/" + lower));
    return snap.exists();
  } catch (e) {
    console.warn("isNicknameTaken error:", e);
    return false;
  }
}
async function claimNickname(nick, uid) {
  const lower = String(nick).toLowerCase();
  try {
    await update(ref(db, "nicknames"), { [lower]: uid });
    console.log("✅ Ник занят: " + nick);
    return true;
  } catch (e) {
    console.error("claimNickname error:", e);
    return false;
  }
}
async function releaseNickname(nick) {
  const lower = String(nick).toLowerCase();
  try {
    await remove(ref(db, "nicknames/" + lower));
    console.log("🔓 Ник освобождён: " + nick);
  } catch (e) { console.warn("releaseNickname error:", e); }
}

function getCurrentNickname() {
  const n = Store.get("nickname", "");
  return typeof n === "string" ? n : "";
}

function nicknameCooldownDaysLeft() {
  const last = Number(Store.get("nicknameChangedAt", 0)) || 0;
  if (!last) return 0;
  const elapsed = Date.now() - last;
  if (elapsed >= NICK_COOLDOWN_MS) return 0;
  return Math.ceil((NICK_COOLDOWN_MS - elapsed) / (24 * 60 * 60 * 1000));
}

window.changeNickname = async function(newNick) {
  if (!currentUser) return { ok: false, msg: "Не авторизован." };
  newNick = String(newNick || "").trim();
  if (!NICK_REGEX.test(newNick)) return { ok: false, msg: "Ник: 3-20 символов, латиница, цифры, _" };

  const daysLeft = nicknameCooldownDaysLeft();
  if (daysLeft > 0) {
    return { ok: false, msg: "Ник можно менять раз в 30 дней. Осталось: " + daysLeft + " дн." };
  }

  const oldNick = getCurrentNickname() || "";
  if (oldNick && oldNick.toLowerCase() === newNick.toLowerCase()) {
    return { ok: false, msg: "Это твой текущий ник." };
  }
  const taken = await isNicknameTaken(newNick);
  if (taken) return { ok: false, msg: "Этот ник уже занят." };

  try {
    if (oldNick) await releaseNickname(oldNick);
    await claimNickname(newNick, currentUser.uid);
    Store.set("nickname", newNick);
    Store.set("nicknameChangedAt", Date.now());
    return { ok: true, msg: "Ник изменён на " + newNick + ". Следующая смена — через 30 дней." };
  } catch (e) {
    return { ok: false, msg: "Ошибка: " + (e.message || e) };
  }
};

function injectAuthAnimations() {
  if (document.getElementById("authAnimationsStyle")) return;
  var s = document.createElement("style");
  s.id = "authAnimationsStyle";
  s.textContent = `
    @keyframes authCardIn { 0%{opacity:0;transform:translateY(40px) scale(0.96)} 60%{transform:translateY(-4px) scale(1.01)} 100%{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes authSlideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes authIconFloat { 0%,100%{transform:translateY(0) rotate(0)} 50%{transform:translateY(-8px) rotate(6deg)} }
    @keyframes authShake { 0%,20%,40%,60%,80%,100%{transform:translateX(0)} 10%,30%{transform:translateX(-10px)} 50%,70%{transform:translateX(10px)} }
    @keyframes authGlow { 0%,100%{filter:drop-shadow(0 0 8px var(--accent-light))} 50%{filter:drop-shadow(0 0 20px var(--accent-light))} }
    #authScreen .auth-card { animation: authCardIn 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
    #authScreen .auth-logo svg { animation: authIconFloat 3s ease-in-out infinite, authGlow 2.5s ease-in-out infinite; }
    #authScreen input, #authScreen .auth-btn, #authScreen .auth-switch { animation: authSlideUp 0.45s ease-out both; }
    #authScreen .auth-error-shake { animation: authShake 0.4s ease-in-out; }
    #authScreen .auth-switch { text-align: center; margin-top: 16px; font-size: 12px; color: var(--text-muted, #888); font-weight: 500; }
    #authScreen .auth-switch a { color: #8b5cf6; text-decoration: none; font-weight: 600; cursor: pointer; margin-left: 6px; }
    #authScreen .auth-switch a:hover { text-decoration: underline; }
    #authScreen .auth-title { font-size: 22px; font-weight: 800; color: #fff; text-align: center; margin: 0 0 4px; }
  `;
  document.head.appendChild(s);
}

function showAuthScreen() {
  injectAuthAnimations();
  const el = document.getElementById("authScreen");
  if (!el) return;
  el.style.display = "flex";
  el.innerHTML = buildLoginScreen();
  bindLoginHandlers();
  document.body.style.overflow = "hidden";
}
function showRegisterScreen() {
  injectAuthAnimations();
  const el = document.getElementById("authScreen");
  if (!el) return;
  el.style.display = "flex";
  el.innerHTML = buildRegisterScreen();
  bindRegisterHandlers();
  document.body.style.overflow = "hidden";
}
function showVerificationScreen(email) {
  injectAuthAnimations();
  const el = document.getElementById("authScreen");
  if (!el) return;
  el.style.display = "flex";
  el.innerHTML = buildVerificationScreen(email);
  bindVerificationHandlers();
  document.body.style.overflow = "hidden";
}
function hideAuthScreen() {
  const el = document.getElementById("authScreen");
  if (el) { el.style.display = "none"; el.innerHTML = ""; }
  document.body.style.overflow = "";
}
function setAuthError(msg) {
  const el = document.getElementById("authError");
  if (el) {
    el.textContent = msg || "";
    if (msg) { el.classList.remove("auth-error-shake"); void el.offsetWidth; el.classList.add("auth-error-shake"); }
  }
}

function buildLoginScreen() {
  return `
  <div class="auth-card">
    <div class="auth-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z"/></svg>
      <h1>DOTA JETCH AI 2.0</h1>
      <div class="auth-sub">Войди в аккаунт, чтобы продолжить</div>
    </div>
    <div id="authError" class="auth-error"></div>
    <input type="email" id="authEmail" placeholder="Email" autocomplete="email">
    <input type="password" id="authPassword" placeholder="Пароль" autocomplete="current-password">
    <button id="authLoginBtn" class="auth-btn auth-btn-primary">Войти</button>
    <div class="auth-forgot"><a href="#" id="authForgotLink">Забыли пароль?</a></div>
    <div class="auth-switch">Нет аккаунта?&nbsp;<a id="toRegisterLink">Зарегистрироваться</a></div>
  </div>`;
}

function buildRegisterScreen() {
  return `
  <div class="auth-card">
    <div class="auth-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z"/></svg>
      <h1 class="auth-title">Создать аккаунт</h1>
      <div class="auth-sub">Ник будет виден другим игрокам, а данные привяжутся к аккаунту</div>
    </div>
    <div id="authError" class="auth-error"></div>
    <input type="text" id="regNick" placeholder="Ник (3-20 символов, A-Z, 0-9, _)" autocomplete="username" maxlength="20">
    <div id="regNickHint" style="${HINT_BASE}">Ник будет виден другим</div>
    <input type="email" id="regEmail" placeholder="Email" autocomplete="email">
    <input type="password" id="regPassword" placeholder="Пароль (минимум 6 символов)" autocomplete="new-password">
    <input type="password" id="regPassword2" placeholder="Повтори пароль" autocomplete="new-password">
    <button id="authRegisterBtn" class="auth-btn auth-btn-primary">Зарегистрироваться</button>
    <div class="auth-switch">Уже есть аккаунт?&nbsp;<a id="toLoginLink">Войти</a></div>
  </div>`;
}

function buildVerificationScreen(email) {
  return `
  <div class="auth-card">
    <div class="auth-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M4 6l8 6 8-6"/></svg>
      <h1>Подтвердите email</h1>
      <div class="auth-sub">Мы отправили письмо на <strong>${email || ""}</strong>.</div>
      <div class="auth-sub">Перейди по ссылке из письма, чтобы активировать аккаунт.</div>
    </div>
    <div id="authError" class="auth-error"></div>
    <button id="checkVerifyBtn" class="auth-btn auth-btn-primary">Я подтвердил почту</button>
    <button id="resendVerifyBtn" class="auth-btn auth-btn-outline">Отправить письмо заново</button>
    <button id="backToLoginBtn" class="auth-btn auth-btn-outline" style="margin-top:10px;">Назад ко входу</button>
    <div class="auth-hint">Проверь папку «Спам»</div>
  </div>`;
}

function bindLoginHandlers() {
  const lBtn = document.getElementById("authLoginBtn");
  const eInp = document.getElementById("authEmail");
  const pInp = document.getElementById("authPassword");
  const fLink = document.getElementById("authForgotLink");
  const toReg = document.getElementById("toRegisterLink");

  if (lBtn) lBtn.addEventListener("click", async function () {
    setAuthError("");
    const email = (eInp && eInp.value || "").trim();
    const password = pInp && pInp.value || "";
    if (!email || !password) { setAuthError("Введи email и пароль."); return; }
    lBtn.disabled = true;
    try { await signInWithEmailAndPassword(auth, email, password); }
    catch (e) { setAuthError(translateAuthError(e.code)); lBtn.disabled = false; }
  });

  if (fLink) fLink.addEventListener("click", async function (e) {
    e.preventDefault();
    setAuthError("");
    const email = (eInp && eInp.value || "").trim();
    if (!email) { setAuthError("Введи email."); return; }
    try { await sendPasswordResetEmail(auth, email); alert("Письмо отправлено на " + email); }
    catch (e) { setAuthError(translateAuthError(e.code)); }
  });

  if (toReg) toReg.addEventListener("click", function (e) { e.preventDefault(); showRegisterScreen(); });
  if (eInp) eInp.addEventListener("keydown", e => { if (e.key === "Enter" && lBtn) lBtn.click(); });
  if (pInp) pInp.addEventListener("keydown", e => { if (e.key === "Enter" && lBtn) lBtn.click(); });
}

function bindRegisterHandlers() {
  const rBtn = document.getElementById("authRegisterBtn");
  const nInp = document.getElementById("regNick");
  const nHint = document.getElementById("regNickHint");
  const eInp = document.getElementById("regEmail");
  const pInp = document.getElementById("regPassword");
  const p2Inp = document.getElementById("regPassword2");
  const toLog = document.getElementById("toLoginLink");

  let nickCheckTimer = null;
  let nickLastChecked = "";

  function setHint(text, state) {
    if (!nHint) return;
    nHint.textContent = text;
    nHint.setAttribute("style", state === "ok" ? HINT_OK : state === "bad" ? HINT_BAD : HINT_BASE);
  }

  async function checkNickLive() {
    if (!nInp || !nHint) return;
    const nick = (nInp.value || "").trim();
    nInp.style.borderColor = "";
    if (!nick) {
      setHint("Ник будет виден другим", "base");
      return;
    }
    if (!NICK_REGEX.test(nick)) {
      nInp.style.borderColor = "#ef4444";
      setHint("3-20 символов: A-Z, 0-9, _", "bad");
      return;
    }
    setHint("Проверяю...", "base");
    if (nickLastChecked === nick.toLowerCase()) return;
    nickLastChecked = nick.toLowerCase();
    const taken = await isNicknameTaken(nick);
    if (nickLastChecked !== nick.toLowerCase()) return;
    if (taken) {
      nInp.style.borderColor = "#ef4444";
      setHint("✕ Ник занят", "bad");
    } else {
      nInp.style.borderColor = "#22c55e";
      setHint("✓ Свободен", "ok");
    }
  }

  if (nInp) nInp.addEventListener("input", function() {
    if (nickCheckTimer) clearTimeout(nickCheckTimer);
    nickCheckTimer = setTimeout(checkNickLive, 400);
  });

  if (rBtn) rBtn.addEventListener("click", async function () {
    setAuthError("");
    const nick = (nInp && nInp.value || "").trim();
    const email = (eInp && eInp.value || "").trim();
    const password = pInp && pInp.value || "";
    const password2 = p2Inp && p2Inp.value || "";

    if (!nick) { setAuthError("Введи ник."); return; }
    if (!NICK_REGEX.test(nick)) { setAuthError("Ник: 3-20 символов, латиница, цифры, _"); return; }
    if (!email || !password || !password2) { setAuthError("Заполни все поля."); return; }
    if (password.length < 6) { setAuthError("Пароль минимум 6 символов."); return; }
    if (password !== password2) { setAuthError("Пароли не совпадают."); return; }

    rBtn.disabled = true;
    rBtn.textContent = "Проверяю ник...";

    const taken = await isNicknameTaken(nick);
    if (taken) {
      setAuthError("Этот ник уже занят. Выбери другой.");
      rBtn.disabled = false;
      rBtn.textContent = "Зарегистрироваться";
      return;
    }

    rBtn.textContent = "Создаю аккаунт...";
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;

      await claimNickname(nick, uid);
      try {
        await update(ref(db, "users/" + uid), { nickname: nick });
      } catch (e) { console.warn("save nickname error:", e); }

      await sendEmailVerification(cred.user);
    } catch (e) {
      setAuthError(translateAuthError(e.code));
      rBtn.disabled = false;
      rBtn.textContent = "Зарегистрироваться";
    }
  });

  if (toLog) toLog.addEventListener("click", function (e) { e.preventDefault(); showAuthScreen(); });
  if (nInp) nInp.addEventListener("keydown", e => { if (e.key === "Enter" && eInp) eInp.focus(); });
  if (eInp) eInp.addEventListener("keydown", e => { if (e.key === "Enter" && pInp) pInp.focus(); });
  if (pInp) pInp.addEventListener("keydown", e => { if (e.key === "Enter" && p2Inp) p2Inp.focus(); });
  if (p2Inp) p2Inp.addEventListener("keydown", e => { if (e.key === "Enter" && rBtn) rBtn.click(); });
}

function bindVerificationHandlers() {
  const cBtn = document.getElementById("checkVerifyBtn");
  const rBtn = document.getElementById("resendVerifyBtn");
  const bBtn = document.getElementById("backToLoginBtn");

  if (cBtn) cBtn.addEventListener("click", async function () {
    setAuthError("");
    cBtn.disabled = true; cBtn.textContent = "Проверяю...";
    try {
      if (auth.currentUser) {
        await auth.currentUser.reload();
        if (auth.currentUser.emailVerified) { location.reload(); return; }
        setAuthError("Почта пока не подтверждена.");
      }
    } catch (e) { setAuthError("Ошибка: " + (e.message || e)); }
    cBtn.disabled = false; cBtn.textContent = "Я подтвердил почту";
  });

  if (rBtn) rBtn.addEventListener("click", async function () {
    setAuthError("");
    try { if (auth.currentUser) { await sendEmailVerification(auth.currentUser); setAuthError("Письмо отправлено!"); } }
    catch (e) { setAuthError("Ошибка: " + (e.message || e)); }
  });

  if (bBtn) bBtn.addEventListener("click", async function () {
    try { await signOut(auth); } catch (e) {}
    showAuthScreen();
  });
}

const SYNC_KEYS = [
  "nickname","nicknameChangedAt","chathistory","brainprofile","brainvariation",
  "braincontext","brainfeedback","brainlongmemory",
  "license.active","license.forever","license.expires",
  "aiquestions","streak","daily","history","achievements","diary","settings",
  "sessions","dailystreak","recentmatches","analyzequota","brain_learning",
  "brain_shared_memory","brain_insights","brain_autolearner","brain_personality_v2",
  "jetch_keys","litemode","achievementsunlocked","analyzedcount","dailydate",
  "gamesplayed","guessbeststreak","quizbest","reactionbest","theme","uniqueheroes",
  "dailystreakclaimed","themechanged","brainmemory","visitedabout",
  "dailyprogress.analyze","dailyprogress.chat","dailyprogress.diary",
  "dailyprogress.game","dailyprogress.chart","dailyprogress.theme",
  "dailylastclaimdate","diarynotes"
];

function collectLocalData() {
  const data = {};
  for (const key of SYNC_KEYS) {
    const val = sessionStorage.getItem(STORE_PREFIX + key);
    if (val !== null) {
      try { data[encodeKey(key)] = JSON.parse(val); } catch (e) { data[encodeKey(key)] = val; }
    }
  }
  return data;
}

async function loadUserData(uid) {
  console.log("📥 Загружаю данные из Firebase для " + uid);
  try {
    const snap = await get(ref(db, "users/" + uid));
    const data = snap.val();
    if (data && typeof data === "object") {
      let loaded = 0;
      for (const key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
        const realKey = decodeKey(key);
        const val = data[key];
        try {
          sessionStorage.setItem(STORE_PREFIX + realKey,
            typeof val === "string" ? val : JSON.stringify(val));
          loaded++;
        } catch (e) {}
      }
      console.log("✅ Загружено из Firebase: " + loaded + " ключей");
    } else {
      console.log("⚠ Новый аккаунт — данных в Firebase ещё нет");
    }
  } catch (e) { console.error("❌ loadUserData:", e); }
}

async function saveUserData(uid) {
  try {
    const data = collectLocalData();
    if (Object.keys(data).length === 0) return;
    await update(ref(db, "users/" + uid), data);
    console.log("💾 Сохранено в Firebase: " + Object.keys(data).length + " ключей");
  } catch (e) { console.warn("saveUserData:", e); }
}

function setupStoreSync(uid) {
  if (window.Store && typeof window.Store.set === "function" && !window.Store.__fbSync) {
    const origSet = window.Store.set.bind(window.Store);
    window.Store.set = function (key, value) {
      origSet(key, value);
      const patch = {};
      patch[encodeKey(key)] = value;
      update(ref(db, "users/" + uid), patch).catch((e) => {
        console.warn("Sync error для " + key + ":", e);
      });
    };
    window.Store.__fbSync = true;
  }
}

function startAutoSave(uid) {
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  autoSaveInterval = setInterval(() => { if (currentUser) saveUserData(uid); }, 30000);
}
function stopAutoSave() {
  if (autoSaveInterval) { clearInterval(autoSaveInterval); autoSaveInterval = null; }
}

function bindLogoutHandler() {
  const btn = document.getElementById("logoutBtn");
  if (!btn || btn.__bound) return;
  btn.__bound = true;
  btn.addEventListener("click", async function () {
    if (currentUser) { try { await saveUserData(currentUser.uid); } catch (e) {} }
    try { await signOut(auth); } catch (e) {}
  });
}

window.addEventListener("beforeunload", function () {
  if (currentUser) { try { saveUserData(currentUser.uid); } catch (e) {} }
});

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "hidden" && currentUser) {
    try { saveUserData(currentUser.uid); } catch (e) {}
  }
});

function wipeLocalUserData() {
  try {
    let removed = 0;
    const keys = Object.keys(sessionStorage);
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (k.indexOf(STORE_PREFIX) === 0) {
        sessionStorage.removeItem(k);
        removed++;
      }
    }
    console.log("🧹 Очищено " + removed + " ключей из sessionStorage");
  } catch (e) { console.warn("wipeLocalUserData:", e); }
}

function translateAuthError(code) {
  const map = {
    "auth/invalid-email": "Некорректный email.",
    "auth/user-not-found": "Пользователь не найден.",
    "auth/wrong-password": "Неверный пароль.",
    "auth/invalid-credential": "Неверный email или пароль.",
    "auth/email-already-in-use": "Этот email уже зарегистрирован.",
    "auth/weak-password": "Пароль минимум 6 символов.",
    "auth/too-many-requests": "Слишком много попыток.",
    "auth/network-request-failed": "Нет соединения."
  };
  return map[code] || ("Ошибка: " + code);
}

function updateSidebarUser(user) {
  const nickEl = document.getElementById("userNick");
  const emailEl = document.getElementById("userEmailSmall");
  const nick = getCurrentNickname();
  if (nickEl) nickEl.textContent = nick || "—";
  if (emailEl) emailEl.textContent = (user && user.email) || "—";
}

onAuthStateChanged(auth, async function (user) {
  console.log("🔐 onAuthStateChanged: " + (user ? user.uid : "null"));

  if (user) {
    currentUser = user;

    if (!user.emailVerified) {
      stopAutoSave();
      showVerificationScreen(user.email);
      return;
    }

    const loadedFlag = "dotaJetchLoadedUid_session";
    const currentInSession = sessionStorage.getItem(loadedFlag);

    if (currentInSession !== user.uid) {
      console.log("🆕 Загрузка данных для " + user.uid);
      wipeLocalUserData();
      sessionStorage.setItem(loadedFlag, user.uid);
      await loadUserData(user.uid);
      console.log("🔄 Перезагрузка страницы с данными из Firebase");
      location.reload();
      return;
    }

    console.log("✅ Данные загружены — показываю приложение");
    hideAuthScreen();
    setupStoreSync(user.uid);
    startAutoSave(user.uid);
    bindLogoutHandler();
    updateSidebarUser(user);

    const lb = document.getElementById("logoutBtn");
    if (lb) lb.style.display = "block";

    saveUserData(user.uid);
  } else {
    currentUser = null;
    console.log("🚪 Логаут — очистка sessionStorage");
    stopAutoSave();
    wipeLocalUserData();
    sessionStorage.removeItem("dotaJetchLoadedUid_session");
    showAuthScreen();
    const lb = document.getElementById("logoutBtn");
    if (lb) lb.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  injectAuthAnimations();
  showAuthScreen();
});
