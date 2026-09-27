/* ═══════════════════════════════════════════════════════════════════
   DOTA JETCH — VISUAL EFFECTS
   Курсор, tilt-карты, scroll-reveal, счётчики, ripple.
   ═══════════════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ─── 1. КУРСОР ─── */
  const dot = document.getElementById("cursorDot");
  const ring = document.getElementById("cursorRing");
  const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  if (dot && ring && hasFinePointer) {
    document.body.classList.add("cursor-ready");
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    function animateRing() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const interactiveSelector = "button, a, .nav-btn, .btn, .stat-card, .card, .input";
    document.addEventListener("mouseover", (e) => {
      if (e.target.closest(interactiveSelector)) ring.classList.add("hovered");
    });
    document.addEventListener("mouseout", (e) => {
      if (e.target.closest(interactiveSelector)) {
        if (!e.relatedTarget || !e.relatedTarget.closest(interactiveSelector)) {
          ring.classList.remove("hovered");
        }
      }
    });

    document.addEventListener("mouseleave", () => {
      dot.style.opacity = 0;
      ring.style.opacity = 0;
    });
    document.addEventListener("mouseenter", () => {
      dot.style.opacity = 1;
      ring.style.opacity = 1;
    });
  }

  /* ─── 2. TILT НА КАРТАХ ─── */
  function attachTilt(el) {
    if (el.dataset.tiltAttached) return;
    el.dataset.tiltAttached = "1";

    const maxTilt = 4;

    el.addEventListener("mousemove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--mx", (x * 100) + "%");
      el.style.setProperty("--my", (y * 100) + "%");
      const rotX = (y - 0.5) * -maxTilt;
      const rotY = (x - 0.5) *  maxTilt;
      if (el.classList.contains("reveal") && !el.classList.contains("in")) return;
      el.style.transform =
        `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(${el.classList.contains("stat-card") ? -3 : -2}px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  }

  /* ─── 3. SCROLL-REVEAL ─── */
  let revealObserver = null;
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      root: document.querySelector(".page-scroll")
    });
  }

  function attachReveal(el, index) {
    if (el.dataset.revealAttached) return;
    el.dataset.revealAttached = "1";
    el.classList.add("reveal");
    el.style.transitionDelay = (Math.min(index, 8) * 55) + "ms";
    if (revealObserver) {
      revealObserver.observe(el);
    } else {
      el.classList.add("in");
    }
    // Фолбэк: показать через 400 мс, если не сработал наблюдатель
    setTimeout(() => {
      if (!el.classList.contains("in")) {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          el.classList.add("in");
        }
      }
    }, 400 + Math.min(index, 8) * 55);
  }

  /* ─── 4. СЧЁТЧИК ЧИСЕЛ ─── */
  function animateNumber(el) {
    const text = (el.textContent || "").trim();
    if (!/^\d+$/.test(text)) return;
    const target = parseInt(text, 10);
    if (target === 0) return;
    if (el.dataset.counted) return;
    el.dataset.counted = "1";

    const duration = 900;
    const start = performance.now();
    el.textContent = "0";

    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    }
    requestAnimationFrame(tick);
  }

  /* ─── 5. RIPPLE НА КНОПКАХ ─── */
  function attachRipple(btn) {
    if (btn.dataset.rippleAttached) return;
    btn.dataset.rippleAttached = "1";
    btn.addEventListener("click", (e) => {
      const r = btn.getBoundingClientRect();
      const size = Math.max(r.width, r.height);
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - r.left - size / 2) + "px";
      ripple.style.top = (e.clientY - r.top - size / 2) + "px";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  }

  /* ─── 6. ПРИМЕНИТЬ КО ВСЕМУ ─── */
  function processNode(node) {
    if (!(node instanceof HTMLElement)) return;

    const cards = [];
    if (node.matches && node.matches(".card, .stat-card, .hero-banner")) cards.push(node);
    if (node.querySelectorAll) {
      node.querySelectorAll(".card, .stat-card, .hero-banner").forEach(c => cards.push(c));
    }
    cards.forEach((c, i) => {
      if (c.classList.contains("hero-banner")) {
        attachReveal(c, i);
      } else {
        attachTilt(c);
        attachReveal(c, i);
      }
    });

    const values = [];
    if (node.matches && node.matches(".stat-value")) values.push(node);
    if (node.querySelectorAll) {
      node.querySelectorAll(".stat-value").forEach(v => values.push(v));
    }
    values.forEach(animateNumber);

    const btns = [];
    if (node.matches && node.matches(".btn")) btns.push(node);
    if (node.querySelectorAll) {
      node.querySelectorAll(".btn").forEach(b => btns.push(b));
    }
    btns.forEach(attachRipple);
  }

  /* ─── 7. НАБЛЮДАТЕЛЬ ЗА DOM ─── */
  function initObserver() {
    const target = document.getElementById("pageContent");
    if (!target) return;

    processNode(target);

    const mo = new MutationObserver((mutations) => {
      const fresh = new Set();
      for (const m of mutations) {
        for (const n of m.addedNodes) {
          if (n instanceof HTMLElement) fresh.add(n);
        }
      }
      if (fresh.size) {
        requestAnimationFrame(() => {
          fresh.forEach(processNode);
        });
      }
    });
    mo.observe(target, { childList: true, subtree: true });
  }

  /* ─── 8. СТАРТ ─── */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initObserver);
  } else {
    initObserver();
  }

  // Хук в switchPage — при смене страницы заново сканируем
  if (typeof window.switchPage === "function") {
    const _origSwitch = window.switchPage;
    window.switchPage = function (name) {
      const r = _origSwitch.apply(this, arguments);
      setTimeout(() => {
        const target = document.getElementById("pageContent");
        if (target) {
          target.querySelectorAll(".reveal").forEach(el => {
            el.classList.remove("in");
          });
          processNode(target);
        }
      }, 20);
      return r;
    };
  } else {
    console.warn("DOTA JETCH — visual.js: switchPage не найдена, хук пропущен");
  }

  console.log("DOTA JETCH — visual.js loaded");
})();
