/* DOTA JETCH — FIREBASE AUTH v2.3
   Сессия не слетает, данные не текут между аккаунтами, кнопка выхода работает. */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { getDatabase, ref, get, update } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getDatabase(app);

/* Сессия живёт в localStorage, не слетает при закрытии браузера */
setPersistence(auth, browserLocalPersistence).catch(function (e) {
  console.warn("setPersistence error:", e);
});

let currentUser = null;
let autoSaveInterval = null;

/* ─── Ключи, которые синхронизируются с Firebase ─── */
const SYNC_KEYS = [
  "chathistory", "brainprofile", "brainvariation", "braincontext",
  "brainfeedback", "brainlongmemory", "license.active", "aiquestions",
  "streak", "daily", "history", "achievements", "diary", "settings"
];

/* Удаляет данные пользователя из localStorage (используется при смене аккаунта) */
function clearLocalData() {
  for (const key of SYNC_KEYS) {
    localStorage.removeItem(key);
  }
}

/* ─── Экраны ─── */
function showAuthScreen() {
  const el = document.getElementById("authScreen");
  if (!el) return;
  el.style.display = "flex";
  el.innerHTML = buildLoginScreen();
  bindLoginHandlers();
  document.body.style.overflow = "hidden";
}

function showVerificationScreen(email) {
  const el = document.getElementById("authScreen");
  if (!el) return;
  el.style.display = "flex";
  el.innerHTML = buildVerificationScreen(email);
  bindVerificationHandlers();
  document.body.style.overflow = "hidden";
}

function hideAuthScreen() {
  const el = document.getElementById("authScreen");
  if (el) {
    el.style.display = "none";
    el.innerHTML = "";
  }
  document.body.style.overflow = "";
}

function setAuthError(msg) {
  const el = document.getElementById("authError");
  if (el) el.textContent = msg || "";
}

/* ─── HTML экранов ─── */
function buildLoginScreen() {
  return `
  <div class="auth-card">
    <div class="auth-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2 L15 9 L22 12 L15 15 L12 22 L9 15 L2 12 L9 9 Z"/>
      </svg>
      <h1>DOTA JETCH AI 2.0</h1>
      <div class="auth-sub">Войди или зарегистрируйся, чтобы продолжить</div>
    </div>
    <div id="authError" class="auth-error"></div>
    <input type="email" id="authEmail" placeholder="Email" autocomplete="email">
    <input type="password" id="authPassword" placeholder="Пароль (минимум 6 символов)" autocomplete="current-password">
    <button id="authLoginBtn" class="auth-btn auth-btn-primary">Войти</button>
    <button id="authRegisterBtn" class="auth-btn auth-btn-outline">Зарегистрироваться</button>
    <div class="auth-forgot"><a href="#" id="authForgotLink">Забыли пароль?</a></div>
    <div class="auth-hint">Данные сохраняются в твоём аккаунте Firebase</div>
  </div>`;
}

function buildVerificationScreen(email) {
  return `
  <div class="auth-card">
    <div class="auth-logo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 4h16v16H4z"/>
        <path d="M4 6l8 6 8-6"/>
      </svg>
      <h1>Подтвердите email</h1>
      <div class="auth-sub">Мы отправили письмо на <strong id="verifyEmail">${email || ""}</strong>.</div>
      <div class="auth-sub">Перейди по ссылке из письма, чтобы активировать аккаунт.</div>
    </div>
    <div id="authError" class="auth-error"></div>
    <button id="checkVerifyBtn" class="auth-btn auth-btn-primary">Я подтвердил почту</button>
    <button id="resendVerifyBtn" class="auth-btn auth-btn-outline">Отправить письмо заново</button>
    <button id="backToLoginBtn" class="auth-btn auth-btn-outline" style="margin-top:10px;">Назад ко входу</button>
    <div class="auth-hint">Проверь папку «Спам», если письма нет во «Входящих»</div>
  </div>`;
}

/* ─── Привязки обработчиков ─── */
function bindLoginHandlers() {
  const loginBtn = document.getElementById("authLoginBtn");
  const registerBtn = document.getElementById("authRegisterBtn");
  const emailInput = document.getElementById("authEmail");
  const passInput = document.getElementById("authPassword");
  const forgotLink = document.getElementById("authForgotLink");

  if (loginBtn) {
    loginBtn.addEventListener("click", async function () {
      setAuthError("");
      const email = (emailInput && emailInput.value || "").trim();
      const password = passInput && passInput.value || "";
      if (!email || !password) { setAuthError("Введи email и пароль."); return; }
      loginBtn.disabled = true;
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (error) {
        setAuthError(translateAuthError(error.code));
        loginBtn.disabled = false;
      }
    });
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", async function () {
      setAuthError("");
      const email = (emailInput && emailInput.value || "").trim();
      const password = passInput && passInput.value || "";
      if (!email || !password) { setAuthError("Введи email и пароль."); return; }
      if (password.length < 6) { setAuthError("Пароль минимум 6 символов."); return; }
      registerBtn.disabled = true;
      try {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await sendEmailVerification(cred.user);
      } catch (error) {
        setAuthError(translateAuthError(error.code));
        registerBtn.disabled = false;
      }
    });
  }

  if (forgotLink) {
    forgotLink.addEventListener("click", async function (e) {
      e.preventDefault();
      setAuthError("");
      const email = (emailInput && emailInput.value || "").trim();
      if (!email) { setAuthError("Введи email, и мы пришлём ссылку для сброса."); return; }
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Письмо для сброса пароля отправлено на " + email + ". Проверь почту.");
      } catch (error) {
        setAuthError(translateAuthError(error.code));
      }
    });
  }

  if (emailInput) emailInput.addEventListener("keydown", function (e) { if (e.key === "Enter" && loginBtn) loginBtn.click(); });
  if (passInput) passInput.addEventListener("keydown", function (e) { if (e.key === "Enter" && loginBtn) loginBtn.click(); });
}

function bindVerificationHandlers() {
  const checkBtn = document.getElementById("checkVerifyBtn");
  const resendBtn = document.getElementById("resendVerifyBtn");
  const backBtn = document.getElementById("backToLoginBtn");

  if (checkBtn) {
    checkBtn.addEventListener("click", async function () {
      setAuthError("");
      checkBtn.disabled = true;
      checkBtn.textContent = "Проверяю...";
      try {
        if (auth.currentUser) {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            location.reload();
            return;
          } else {
            setAuthError("Почта пока не подтверждена. Проверь письмо и нажми снова.");
          }
        }
      } catch (e) {
        setAuthError("Ошибка проверки: " + (e.message || e));
      }
      checkBtn.disabled = false;
      checkBtn.textContent = "Я подтвердил почту";
    });
  }

  if (resendBtn) {
    resendBtn.addEventListener("click", async function () {
      setAuthError("");
      try {
        if (auth.currentUser) {
          await sendEmailVerification(auth.currentUser);
          setAuthError("Письмо отправлено повторно!");
        }
      } catch (e) {
        setAuthError("Не удалось отправить: " + (e.message || e));
      }
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", async function () {
      try { await signOut(auth); } catch (e) {}
      showAuthScreen();
    });
  }
}

/* ★ НОВАЯ ФУНКЦИЯ: привязывает обработчик к кнопке «Выйти» */
function bindLogoutHandler() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn || logoutBtn.__bound) return;
  logoutBtn.__bound = true;

  logoutBtn.addEventListener("click", async function () {
    try {
      if (currentUser) await saveUserData(currentUser.uid);
    } catch (e) {
      console.warn("save before logout error:", e);
    }
    try {
      await signOut(auth);
    } catch (e) {
      console.error("signOut error:", e);
    }
  });
}

/* ─── Работа с данными пользователя ─── */
function collectLocalData() {
  const data = {};
  for (const key of SYNC_KEYS) {
    const val = localStorage.getItem(key);
    if (val !== null) {
      try { data[key] = JSON.parse(val); } catch (e) { data[key] = val; }
    }
  }
  return data;
}

async function loadUserData(uid) {
  /* СНАЧАЛА очищаем данные предыдущего аккаунта */
  clearLocalData();
  try {
    const snap = await get(ref(db, "users/" + uid));
    const data = snap.val();
    if (data && typeof data === "object") {
      for (const key in data) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
        const val = data[key];
        try {
          localStorage.setItem(key, typeof val === "string" ? val : JSON.stringify(val));
        } catch (e) {
          localStorage.setItem(key, String(val));
        }
      }
    }
  } catch (e) {
    console.warn("loadUserData error:", e);
  }
}

async function saveUserData(uid) {
  try {
    const data = collectLocalData();
    if (Object.keys(data).length === 0) return;
    await update(ref(db, "users/" + uid), data);
  } catch (e) {
    console.warn("saveUserData error:", e);
  }
}

function setupStoreSync(uid) {
  if (window.Store && typeof window.Store.set === "function" && !window.Store.__fbSync) {
    const originalSet = window.Store.set.bind(window.Store);
    window.Store.set = function (key, value) {
      originalSet(key, value);
      const patch = {};
      patch[key] = value;
      update(ref(db, "users/" + uid), patch).catch(function () {});
    };
    window.Store.__fbSync = true;
  }
}

function startAutoSave(uid) {
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  autoSaveInterval = setInterval(function () {
    if (currentUser) saveUserData(uid);
  }, 30000);
}

function stopAutoSave() {
  if (autoSaveInterval) { clearInterval(autoSaveInterval); autoSaveInterval = null; }
}

function translateAuthError(code) {
  const map = {
    "auth/invalid-email": "Некорректный email.",
    "auth/user-not-found": "Пользователь с таким email не найден.",
    "auth/wrong-password": "Неверный пароль.",
    "auth/invalid-credential": "Неверный email или пароль.",
    "auth/email-already-in-use": "Этот email уже зарегистрирован.",
    "auth/weak-password": "Слишком слабый пароль (минимум 6 символов).",
    "auth/too-many-requests": "Слишком много попыток. Подожди немного.",
    "auth/network-request-failed": "Нет соединения. Проверь интернет.",
    "auth/missing-email": "Введи email."
  };
  return map[code] || ("Ошибка: " + code);
}

/* ─── Главная логика авторизации ─── */
onAuthStateChanged(auth, async function (user) {
  if (user) {
    currentUser = user;

    /* Почта не подтверждена — экран верификации */
    if (!user.emailVerified) {
      stopAutoSave();
      showVerificationScreen(user.email);
      return;
    }

    /* Если это другой аккаунт — очищаем старые данные и грузим новые */
    if (localStorage.getItem("dotaJetchLoadedUid") !== user.uid) {
      localStorage.setItem("dotaJetchLoadedUid", user.uid);
      await loadUserData(user.uid);
      location.reload();
      return;
    }

    /* Обычный путь — данные уже загружены для этого аккаунта */
    hideAuthScreen();
    setupStoreSync(user.uid);
    startAutoSave(user.uid);
    bindLogoutHandler();   // ← ПРИВЯЗЫВАЕМ КНОПКУ «ВЫЙТИ»

    const lb = document.getElementById("logoutBtn");
    if (lb) lb.style.display = "block";
    const ue = document.getElementById("userEmail");
    if (ue) ue.textContent = user.email || "";
  } else {
    currentUser = null;
    localStorage.removeItem("dotaJetchLoadedUid");
    clearLocalData();
    stopAutoSave();
    showAuthScreen();
    const lb = document.getElementById("logoutBtn");
    if (lb) lb.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  showAuthScreen();
});
