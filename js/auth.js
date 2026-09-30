/* DOTA JETCH — FIREBASE AUTH v1.1 (Realtime Database)
   Регистрация + вход + синхронизация данных. Без входа — сервис заблокирован. */

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-auth.js";
import { getDatabase, ref, set, get, update } from "https://www.gstatic.com/firebasejs/11.8.0/firebase-database.js";

const app = initializeApp(window.FIREBASE_CONFIG);
const auth = getAuth(app);
const db = getDatabase(app);

let currentUser = null;
let autoSaveInterval = null;

function showAuthScreen() {
  const el = document.getElementById("authScreen");
  if (el) el.style.display = "flex";
  document.body.style.overflow = "hidden";
}

function hideAuthScreen() {
  const el = document.getElementById("authScreen");
  if (el) el.style.display = "none";
  document.body.style.overflow = "";
}

function setAuthError(msg) {
  const el = document.getElementById("authError");
  if (el) el.textContent = msg || "";
}

const SYNC_KEYS = [
  "chathistory", "brainprofile", "brainvariation", "braincontext",
  "brainfeedback", "brainlongmemory", "license.active", "aiquestions",
  "streak", "daily", "history", "achievements", "diary", "settings"
];

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

function initAuthUI() {
  const loginBtn = document.getElementById("authLoginBtn");
  const registerBtn = document.getElementById("authRegisterBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const emailInput = document.getElementById("authEmail");
  const passInput = document.getElementById("authPassword");

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
        await createUserWithEmailAndPassword(auth, email, password);
      } catch (error) {
        setAuthError(translateAuthError(error.code));
        registerBtn.disabled = false;
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async function () {
      if (currentUser) { await saveUserData(currentUser.uid); }
      sessionStorage.removeItem("dotaJetchUid");
      await signOut(auth);
    });
  }

  if (emailInput) emailInput.addEventListener("keydown", function (e) { if (e.key === "Enter" && loginBtn) loginBtn.click(); });
  if (passInput) passInput.addEventListener("keydown", function (e) { if (e.key === "Enter" && loginBtn) loginBtn.click(); });
}

function translateAuthError(code) {
  const map = {
    "auth/invalid-email": "Некорректный email.",
    "auth/user-not-found": "Пользователь не найден.",
    "auth/wrong-password": "Неверный пароль.",
    "auth/invalid-credential": "Неверный email или пароль.",
    "auth/email-already-in-use": "Этот email уже зарегистрирован.",
    "auth/weak-password": "Слишком слабый пароль (минимум 6 символов).",
    "auth/too-many-requests": "Слишком много попыток. Подожди немного.",
    "auth/network-request-failed": "Нет соединения. Проверь интернет."
  };
  return map[code] || ("Ошибка: " + code);
}

onAuthStateChanged(auth, async function (user) {
  if (user) {
    currentUser = user;

    if (sessionStorage.getItem("dotaJetchUid") !== user.uid) {
      sessionStorage.setItem("dotaJetchUid", user.uid);
      await loadUserData(user.uid);
      location.reload();
      return;
    }

    hideAuthScreen();
    setupStoreSync(user.uid);
    startAutoSave(user.uid);

    const lb = document.getElementById("logoutBtn");
    if (lb) lb.style.display = "block";
    const ue = document.getElementById("userEmail");
    if (ue) ue.textContent = user.email || "";
  } else {
    currentUser = null;
    sessionStorage.removeItem("dotaJetchUid");
    stopAutoSave();
    showAuthScreen();
    const lb = document.getElementById("logoutBtn");
    if (lb) lb.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  showAuthScreen();
  initAuthUI();
});
