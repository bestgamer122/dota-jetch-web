/* DOTA JETCH — VISUAL v3.4.0 */

(function () {
"use strict";

var dot = document.getElementById("cursorDot");
var ring = document.getElementById("cursorRing");
var hasFine = false;
try { hasFine = window.matchMedia("(hover: hover) and (pointer: fine)").matches; } catch (e) {}

if (dot && ring && hasFine) {
document.body.classList.add("cursor-ready");
var mx = window.innerWidth / 2, my = window.innerHeight / 2, rx = mx, ry = my;
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

function processNode(node) {
if (!(node instanceof HTMLElement)) return;
var cards = [];
if (node.matches && node.matches(".card, .stat-card, .hero-banner")) cards.push(node);
if (node.querySelectorAll) {
var found = node.querySelectorAll(".card, .stat-card, .hero-banner");
for (var i = 0; i < found.length; i++) cards.push(found[i]);
}
for (var j = 0; j < cards.length; j++) {
(function (c) {
if (!c.dataset.tiltAttached) {
c.dataset.tiltAttached = "1";
c.addEventListener("mousemove", function (e) {
var r = c.getBoundingClientRect();
var x = (e.clientX - r.left) / r.width;
var y = (e.clientY - r.top) / r.height;
c.style.setProperty("--mx", (x * 100) + "%");
c.style.setProperty("--my", (y * 100) + "%");
});
}
})(cards[j]);
}
}

if (document.readyState === "loading") {
document.addEventListener("DOMContentLoaded", function () { processNode(document.getElementById("pageContent")); });
} else {
processNode(document.getElementById("pageContent"));
}

function tryHook() {
if (typeof window.switchPage === "function" && !window.visualHooked) {
window.visualHooked = true;
var orig = window.switchPage;
window.switchPage = function (name) {
var r = orig.apply(this, arguments);
setTimeout(function () { processNode(document.getElementById("pageContent")); }, 20);
return r;
};
}
}
tryHook();
var iv = setInterval(tryHook, 100);
setTimeout(function () { clearInterval(iv); }, 3000);

console.log("DOTA JETCH — visual.js loaded");
})();