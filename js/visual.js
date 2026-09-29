/* DOTA JETCH — VISUAL v4.1.0 — поддержка lite-mode */

(function () {
  "use strict";

  function isLite() {
    return document.body.classList.contains("lite-mode");
  }

  /* ═══════════ Курсор (не в lite) ═══════════ */
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
      ry += (my - ry) 