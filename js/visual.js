/* DOTA JETCH — VISUAL EFFECTS v3.5.0
Курсор, tilt, scroll-reveal, счётчики, ripple. */

(function () {
"use strict";

/* ═══════════ 1. КУРСОР ═══════════ */
var dot = document.getElementById("cursorDot");
var ring = document.getElementById("cursorRing");
var hasFine = false;
try { hasFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches; } catch (e) {}

if (dot && ring && hasFine) {
document.body.classList.add("cursor-ready");
var mx = window.innerWidth / 2, my = window.innerHeight / 2;
var rx = mx, ry = my;

document.addEventListener("mousemove", function (e) {
mx = e.clientX; my = e.clientY;
dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
});

function animateRing() {
rx += (mx - rx) * 0.18;
ry += (my - ry) * 0.18;
ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
requestAnimationFrame(animateRing);
}
animateRing();

var interactive = "button, a, .nav-btn, .btn, .stat-card, .card, .input";
document.addEventListener("mouseover", function (e) {
if (e.target.closest(interactive)) ring.classList.add("hovered");
});
document.addEventListener("mouseout", function (e) {
if (e.target.closest(interactive)) {
if (!e.relatedTarget || !e.relatedTarget.closest(interactive)) {
ring.classList.remove("hovered");
}
}
});
document.addEventListener("mouseleave", function () {
dot.style.opacity = 0; ring.style.opacity = 0;
});
document.addEventListener("mouseenter", function () {
dot.style.opacity = 1; ring.style.opacity = 1;
});
}

/* ═══════════ 2. TILT ═══════════ */
function attachTilt(el) {
if (el.dataset.tiltAttached) return;
el.dataset.tiltAttached = "1";
var maxTilt = 4;
el.addEventListener("mousemove", function (e) {
var r = el.getBoundingClientRect();
var x = (e.clientX - r.left) / r.width;
var y = (e.clientY - r.top) / r.height;
el.style.setProperty("--mx", (x * 100) + "%");
el.style.setProperty("--my", (y * 100) + "%");
var rotX = (y - 0.5) * -maxTilt;
var rotY = (x - 0.5) *  maxTilt;
if (el.classList.contains("reveal") && !el.classList.contains("in")) return;
el.style.transform = "perspective(1000px) rotateX(" + rotX + "deg) rotateY(" + rotY + "deg) translateY(" + (el.classList.contains("stat-card") ? -3 : -2) + "px)";
});
el.addEventListener("mouseleave", function () {
el.style.transform = "";
});
}

/* ═══════════ 3. SCROLL-REVEAL ═══════════ */
var revealObserver = null;
if ("IntersectionObserver" in window) {
revealObserver = new IntersectionObserver(function (entries) {
entries.forEach(function (entry) {
if (entry.isIntersecting) {
entry.target.classList.add("in");
revealObserver.unobserve(entry.target);
}
});
}, { threshold: 0.08, root: document.querySelector(".page-scroll") });
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
setTimeout(function () {
if (!el.classList.contains("in")) {
var rect = el.getBoundingClientRect();
if (rect.top < window.innerHeight && rect.bottom > 0) {
el.classList.add("in");
}
}
}, 400 + Math.min(index, 8) * 55);
}

/* ═══════════ 4. СЧЁТЧИК ЧИСЕЛ ═══════════ */
function animateNumber(el) {
var text = (el.textContent || "").trim();
if (!/^\d+$/.test(text)) return;
var target = parseInt(text, 10);
if (target === 0) return;
if (el.dataset.counted) return;
el.dataset.counted = "1";
var duration = 900;
var start = performance.now();
el.textContent = "0";
function tick(now) {
var t = Math.min(1, (now - start) / duration);
var eased = 1 - Math.pow(1 - t, 3);
el.textContent = String(Math.round(target * eased));
if (t < 1) requestAnimationFrame(tick);
else el.textContent = String(target);
}
requestAnimationFrame(tick);
}

/* ═══════════ 5. RIPPLE ═══════════ */
function attachRipple(btn) {
if (btn.dataset.rippleAttached) return;
btn.dataset.rippleAttached = "1";
btn.addEventListener("click", function (e) {
var r = btn.getBoundingClientRect();
var size = Math.max(r.width, r.height);
var ripple = document.createElement("span");
ripple.className = "ripple";
ripple.style.width = ripple.style.height = size + "px";
ripple.style.left = (e.clientX - r.left - size / 2) + "px";
ripple.style.top = (e.clientY - r.top - size / 2) + "px";
btn.appendChild(ripple);
setTimeout(function () { ripple.remove(); }, 650);
});
}

/* ═══════════ 6. ОБРАБОТКА DOM ═══════════ */
function processNode(node) {
if (!(node instanceof HTMLElement)) return;

var cards = [];
if (node.matches && node.matches(".card, .stat-card, .hero-banner")) cards.push(node);
if (node.querySelectorAll) {
var found = node.querySelectorAll(".card, .stat-card, .hero-banner");
for (var i = 0; i < found.length; i++) cards.push(found[i]);
}
cards.forEach(function (c, idx) {
if (c.classList.contains("hero-banner")) {
attachReveal(c, idx);
} else {
attachTilt(c);
attachReveal(c, idx);
}
});

var values = [];
if (node.matches && node.matches(".stat-value")) values.push(node);
if (node.querySelectorAll) {
var vfound = node.querySelectorAll(".stat-value");
for (var j = 0; j < vfound.length; j++) values.push(vfound[j]);
}
values.forEach(animateNumber);

var btns = [];
if (node.matches && node.matches(".btn")) btns.push(node);
if (node.querySelectorAll) {
var bfound = node.querySelectorAll(".btn");
for (var k = 0; k < bfound.length; k++) btns.push(bfound[k]);
}
btns.forEach(attachRipple);
}

/* ═══════════ 7. НАБЛЮДАТЕЛЬ ═══════════ */
function initObserver() {
var target = document.getElementById("pageContent");
if (!target) return;
processNode(target);
var mo = new MutationObserver(function (mutations) {
var fresh = new Set();
mutations.forEach(function (m) {
for (var i = 0; i < m.addedNodes.length; i++) {
var n = m.addedNodes[i];
if (n instanceof HTMLElement) fresh.add(n);
}
});
if (fresh.size) {
requestAnimationFrame(function () {
fresh.forEach(processNode);
});
}
});
mo.observe(target, { childList: true, subtree: true });
}

if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", initObserver);
} else {
initObserver();
}

/* ═══════════ 8. ХУК В switchPage ═══════════ */
function tryHook() {
if (typeof window.switchPage === "function" && !window.visualHooked) {
window.visualHooked = true;
var orig = window.switchPage;
window.switchPage = function (name) {
var r = orig.apply(this, arguments);
setTimeout(function () {
var target = document.getElementById("pageContent");
if (target) {
var revs = target.querySelectorAll(".reveal");
for (var i = 0; i < revs.length; i++) revs[i].classList.remove("in");
processNode(target);
}
}, 20);
return r;
};
console.log("DOTA JETCH — visual.js hooked switchPage");
}
}
tryHook();
var iv = setInterval(tryHook, 100);
setTimeout(function () { clearInterval(iv); }, 3000);

console.log("DOTA JETCH — visual.js loaded");
})();