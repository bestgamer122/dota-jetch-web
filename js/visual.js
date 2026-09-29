(function () {
  "use strict";
  function isLite() { return document.body.classList.contains("lite-mode"); }

  var dot = document.getElementById("cursorDot");
  var ring = document.getElementById("cursorRing");
  var hasFine = false;
  try { hasFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches; } catch (e) {}

  if (dot && ring && hasFine && !isLite()) {
    document.body.classList.add("cursor-ready");
    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var rx = mx, ry = my;
    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    });
    (function animate() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(animate);
    })();
  }

  function attachTilt(el) {
    if (isLite()) return;
    if (el.dataset.tiltAttached) return;
    el.dataset.tiltAttached = "1";
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      var rotX = (y - 0.5) * -4;
      var rotY = (x - 0.5) * 4;
      el.style.transform = "perspective(1000px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg)";
    });
    el.addEventListener("mouseleave", function () { el.style.transform = ""; });
  }

  var revealObs = null;
  if (!isLite() && "IntersectionObserver" in window) {
    revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); }
      });
    }, { threshold: 0.08, root: document.querySelector(".page-scroll") });
  }

  function attachReveal(el, i) {
    if (isLite()) return;
    if (el.dataset.revealAttached) return;
    el.dataset.revealAttached = "1";
    el.classList.add("reveal");
    el.style.transitionDelay = (Math.min(i, 8) * 55) + "ms";
    if (revealObs) revealObs.observe(el);
    else el.classList.add("in");
    setTimeout(function () {
      if (!el.classList.contains("in")) {
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
      }
    }, 400 + Math.min(i, 8) * 55);
  }

  function animateNumber(el) {
    if (isLite()) return;
    var text = (el.textContent || "").trim();
    if (!/^\d+$/.test(text)) return;
    var target = parseInt(text, 10);
    if (target === 0) return;
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    var start = performance.now();
    el.textContent = "0";
    function tick(now) {
      var t = Math.min(1, (now - start) / 900);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = String(target);
    }
    requestAnimationFrame(tick);
  }

  function processNode(node) {
    if (!(node instanceof HTMLElement)) return;
    if (isLite()) return;
    var cards = [];
    if (node.matches && node.matches(".card, .stat-card, .hero-banner")) cards.push(node);
    if (node.querySelectorAll) {
      var found = node.querySelectorAll(".card, .stat-card, .hero-banner");
      for (var i = 0; i < found.length; i++) cards.push(found[i]);
    }
    cards.forEach(function (c, idx) {
      if (c.classList.contains("hero-banner")) attachReveal(c, idx);
      else { attachTilt(c); attachReveal(c, idx); }
    });
    var values = [];
    if (node.matches && node.matches(".stat-value")) values.push(node);
    if (node.querySelectorAll) {
      var vf = node.querySelectorAll(".stat-value");
      for (var j = 0; j < vf.length; j++) values.push(vf[j]);
    }
    values.forEach(animateNumber);
  }

  function initObs() {
    var t = document.getElementById("pageContent");
    if (!t) return;
    processNode(t);
    var mo = new MutationObserver(function (ms) {
      if (isLite()) return;
      var fresh = new Set();
      ms.forEach(function (m) {
        for (var i = 0; i < m.addedNodes.length; i++) {
          var n = m.addedNodes[i];
          if (n instanceof HTMLElement) fresh.add(n);
        }
      });
      if (fresh.size) requestAnimationFrame(function () { fresh.forEach(processNode); });
    });
    mo.observe(t, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initObs);
  else initObs();

  function tryHook() {
    if (typeof window.switchPage === "function" && !window.visualHooked) {
      window.visualHooked = true;
      var orig = window.switchPage;
      window.switchPage = function (name) {
        var r = orig.apply(this, arguments);
        setTimeout(function () {
          if (isLite()) return;
          var t = document.getElementById("pageContent");
          if (t) {
            var revs = t.querySelectorAll(".reveal");
            for (var i = 0; i < revs.length; i++) revs[i].classList.remove("in");
            processNode(t);
          }
        }, 20);
        return r;
      };
    }
  }
  tryHook();
  var iv = setInterval(tryHook, 100);
  setTimeout(function () { clearInterval(iv); }, 3000);
  console.log("visual loaded");
})();
