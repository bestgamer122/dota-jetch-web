/* DOTA JETCH — SOUND v2.1
   - Звуки ТОЛЬКО для мини-игр
   - Всегда включены: setEnabled удалён
   - Громкость 0% = тишина
   - Web Audio API: генерируются осцилляторами */

var Sound = (function () {
  var ctx = null;
  var masterGain = null;
  var volume = 0.7;

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
    if (volume <= 0 || !ctx) return;
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
    if (volume <= 0 || !ctx) return;
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

    /* enabled убран — звук всегда включён, выключается через volume=0 */
    get enabled() { return true; },
    get volume() { return volume; },

    setVolume: function (v) {
      volume = Math.max(0, Math.min(1, v));
      if (masterGain) masterGain.gain.value = volume;
      try { Store.set("sound.volume", volume); } catch (e) {}
    },
    loadSettings: function () {
      var vol = Store.get("sound.volume", null);
      if (typeof vol === "number") volume = Math.max(0, Math.min(1, vol));
      if (masterGain) masterGain.gain.value = volume;
    },

    /* ─── ЗВУКИ МИНИ-ИГР ─── */

    hit: function () {
      ensureRunning();
      beep(1200, 0.05, "square", 0.07);
      beep(1800, 0.08, "sine", 0.05, 0.025);
    },

    miss: function () {
      ensureRunning();
      sweep(400, 160, 0.14, "sawtooth", 0.07);
    },

    success: function () {
      ensureRunning();
      beep(523.25, 0.11, "sine", 0.11);
      beep(659.25, 0.11, "sine", 0.11, 0.08);
      beep(783.99, 0.18, "sine", 0.13, 0.16);
    },

    error: function () {
      ensureRunning();
      beep(220, 0.14, "sawtooth", 0.09);
      beep(180, 0.2, "sawtooth", 0.09, 0.1);
    },

    win: function () {
      ensureRunning();
      beep(523.25, 0.14, "sine", 0.12);
      beep(659.25, 0.14, "sine", 0.12, 0.1);
      beep(783.99, 0.14, "sine", 0.12, 0.2);
      beep(1046.5, 0.32, "sine", 0.14, 0.3);
    },

    fail: function () {
      ensureRunning();
      sweep(500, 100, 0.35, "sine", 0.1);
    },

    test: function () {
      ensureRunning();
      beep(1200, 0.05, "square", 0.07);
      beep(1800, 0.08, "sine", 0.05, 0.025);
      beep(2400, 0.12, "sine", 0.06, 0.06);
    }
  };
})();

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

setTimeout(function () {
  try { Sound.loadSettings(); } catch (e) {}
}, 50);

console.log("sound v2.1 ready (always on, volume only)");
