/* DOTA JETCH — SOUND v1.0
   - Web Audio API: все звуки генерируются осцилляторами
   - Настройки: вкл/выкл + громкость (сохраняются в Firebase)
   - Автоинтеграция: ачивки, ранг-ап, калибровка, ответы ИИ, кнопки
   - Игры: прямые вызовы Sound.hit() / Sound.miss() из games.js */

var Sound = (function () {
  var ctx = null;
  var masterGain = null;
  var enabled = true;
  var volume = 0.7;
  var _lastHover = 0;

  function init() {
    if (ctx) return;
    try {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) { console.warn("Web Audio API не поддерживается"); return; }
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(ctx.destination);
    } catch (e) { console.warn("Sound init failed:", e); }
  }

  function ensureRunning() {
    if (!ctx) init();
    if (ctx && ctx.state === "suspended") {
      try { ctx.resume(); } catch (e) {}
    }
  }

  /* Одиночный тон */
  function beep(freq, dur, type, gainVal, delay) {
    if (!enabled || !ctx) return;
    try {
      var t0 = ctx.currentTime + (delay || 0);
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq, t0);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(gainVal || 0.15, t0 + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) {}
  }

  /* Скользящий тон */
  function sweep(freq1, freq2, dur, type, gainVal, delay) {
    if (!enabled || !ctx) return;
    try {
      var t0 = ctx.currentTime + (delay || 0);
      var osc = ctx.createOscillator();
      var g = ctx.createGain();
      osc.type = type || "sine";
      osc.frequency.setValueAtTime(freq1, t0);
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq2), t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.linearRampToValueAtTime(gainVal || 0.15, t0 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g);
      g.connect(masterGain);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) {}
  }

  return {
    init: init,
    ensure: ensureRunning,

    get enabled() { return enabled; },
    get volume() { return volume; },

    setEnabled: function (v) {
      enabled = !!v;
      try { Store.set("sound.enabled", enabled); } catch (e) {}
    },
    setVolume: function (v) {
      volume = Math.max(0, Math.min(1, v));
      if (masterGain) masterGain.gain.value = volume;
      try { Store.set("sound.volume", volume); } catch (e) {}
    },
    loadSettings: function () {
      var en = Store.get("sound.enabled", null);
      if (en !== null) enabled = en === true;
      var vol = Store.get("sound.volume", null);
      if (typeof vol === "number") volume = Math.max(0, Math.min(1, vol));
      if (masterGain) masterGain.gain.value = volume;
    },

    /* ─── ЗВУКИ ─── */

    click: function () {
      ensureRunning();
      beep(880, 0.05, "sine", 0.07);
      beep(1320, 0.035, "sine", 0.04, 0.02);
    },

    toggle: function () {
      ensureRunning();
      beep(660, 0.06, "sine", 0.07);
    },

    /* Попадание в цель (жёлтая/синяя зона, верное слово) */
    hit: function () {
      ensureRunning();
      beep(1200, 0.05, "square", 0.07);
      beep(1800, 0.08, "sine", 0.05, 0.025);
    },

    /* Промах (мимо зоны, пропуск слова) */
    miss: function () {
      ensureRunning();
      sweep(400, 160, 0.14, "sawtooth", 0.07);
    },

    /* Успех (положительный результат, верный ответ в quiz) */
    success: function () {
      ensureRunning();
      beep(523.25, 0.11, "sine", 0.11);
      beep(659.25, 0.11, "sine", 0.11, 0.08);
      beep(783.99, 0.18, "sine", 0.13, 0.16);
    },

    /* Провал (поражение, неверный ответ в quiz) */
    fail: function () {
      ensureRunning();
      sweep(500, 100, 0.35, "sine", 0.1);
    },

    /* Победа в мини-игре */
    win: function () {
      ensureRunning();
      beep(523.25, 0.14, "sine", 0.12);
      beep(659.25, 0.14, "sine", 0.12, 0.1);
      beep(783.99, 0.14, "sine", 0.12, 0.2);
      beep(1046.5, 0.32, "sine", 0.14, 0.3);
    },

    /* Ачивка */
    achievement: function () {
      ensureRunning();
      beep(880, 0.1, "sine", 0.11);
      beep(1174.66, 0.1, "sine", 0.11, 0.08);
      beep(1567.98, 0.32, "sine", 0.13, 0.16);
    },

    /* Новый ранг */
    rankUp: function () {
      ensureRunning();
      beep(523.25, 0.25, "sine", 0.11);
      beep(659.25, 0.25, "sine", 0.11, 0.06);
      beep(783.99, 0.25, "sine", 0.11, 0.12);
      beep(1046.5, 0.5, "sine", 0.13, 0.22);
      beep(1318.5, 0.6, "sine", 0.09, 0.42);
    },

    /* Завершение калибровки */
    calibration: function () {
      ensureRunning();
      beep(659.25, 0.28, "sine", 0.11);
      beep(880, 0.28, "sine", 0.11, 0.14);
      beep(1174.66, 0.55, "sine", 0.13, 0.28);
    },

    /* Сообщение от ИИ */
    message: function () {
      ensureRunning();
      beep(660, 0.07, "sine", 0.08);
      beep(880, 0.07, "sine", 0.08, 0.055);
    },

    /* Ошибка */
    error: function () {
      ensureRunning();
      beep(220, 0.14, "sawtooth", 0.09);
      beep(180, 0.2, "sawtooth", 0.09, 0.1);
    }
  };
})();

/* ─── ГЛОБАЛЬНЫЙ КЛИК ПО КНОПКАМ ─── */
document.addEventListener("click", function (e) {
  var t = e.target;
  if (!t || !t.closest) return;
  var btn = t.closest(".btn, .nav-btn, .dropdown-item, .auth-btn, input[type='checkbox']");
  if (btn && !btn.disabled) {
    Sound.ensure();
    Sound.click();
  }
}, true);

/* ─── АВТОИНИЦИАЛИЗАЦИЯ ПРИ ПЕРВОМ КАСАНИИ ─── */
function _firstGesture() {
  Sound.init();
  Sound.ensure();
  document.removeEventListener("click", _firstGesture);
  document.removeEventListener("touchstart", _firstGesture);
  document.removeEventListener("keydown", _firstGesture);
}
document.addEventListener("click", _firstGesture);
document.addEventListener("touchstart", _firstGesture, { passive: true });
document.addEventListener("keydown", _firstGesture);

/* ─── ЗАГРУЗКА НАСТРОЕК ─── */
setTimeout(function () {
  try { Sound.loadSettings(); } catch (e) {}
}, 50);

/* ─── АВТОИНТЕГРАЦИЯ ЧЕРЕЗ ОБЁРТКИ ─── */

/* 1. Победа в мини-игре (submitGameScore возвращает gained > 0) */
setTimeout(function () {
  if (typeof window.submitGameScore === "function" && !window._soundWrappedSubmit) {
    var _origSubmit = window.submitGameScore;
    window.submitGameScore = function (game, rawScore) {
      var result = _origSubmit.apply(this, arguments);
      try {
        if (result && typeof result.gained === "number" && result.gained > 0) {
          setTimeout(function () { Sound.success(); }, 300);
        }
      } catch (e) {}
      return result;
    };
    window._soundWrappedSubmit = true;
  }
}, 300);

/* 2. Ачивка (Achievements.toast) */
setTimeout(function () {
  if (typeof Achievements !== "undefined" && typeof Achievements.toast === "function" && !window._soundWrappedToast) {
    var _origToast = Achievements.toast;
    Achievements.toast = function () {
      try { Sound.achievement(); } catch (e) {}
      return _origToast.apply(this, arguments);
    };
    window._soundWrappedToast = true;
  }
}, 500);

/* 3. Попап нового ранга */
setTimeout(function () {
  if (typeof window.showRankUpDialog === "function" && !window._soundWrappedRank) {
    var _origRank = window.showRankUpDialog;
    window.showRankUpDialog = function () {
      try { Sound.rankUp(); } catch (e) {}
      return _origRank.apply(this, arguments);
    };
    window._soundWrappedRank = true;
  }
}, 700);

/* 4. Попап калибровки */
setTimeout(function () {
  if (typeof window.showCalibrationCompleteDialog === "function" && !window._soundWrappedCalib) {
    var _origCalib = window.showCalibrationCompleteDialog;
    window.showCalibrationCompleteDialog = function () {
      try { Sound.calibration(); } catch (e) {}
      return _origCalib.apply(this, arguments);
    };
    window._soundWrappedCalib = true;
  }
}, 900);

/* 5. Сообщения ИИ в чате и в разборе матча */
setTimeout(function () {
  if (typeof window.addChatMessage === "function" && !window._soundWrappedChat) {
    var _origAdd = window.addChatMessage;
    window.addChatMessage = function (log, role, text) {
      try {
        if (role === "assistant" && text) Sound.message();
      } catch (e) {}
      return _origAdd.apply(this, arguments);
    };
    window._soundWrappedChat = true;
  }
}, 1000);

console.log("sound v1.0 ready");
