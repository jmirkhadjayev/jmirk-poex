/* =======================================================
 * UI/UX Pro Max — Upgrade Pack (JS)
 *   1) Top scroll-progress bar
 *   2) Cursor spotlight sheen on cards
 *   3) Magnetic buttons / social links
 * Additive, dependency-free. Loaded after creative.js.
 * ======================================================= */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------- 1) Top scroll-progress bar ---------- */
  (function progressBar() {
    if (reduce) return;
    var bar = document.createElement("div");
    bar.id = "pm-progress";
    document.body.appendChild(bar);
    var ticking = false;
    function update() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? doc.scrollTop / max : 0;
      bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------- 2) Cursor spotlight sheen on cards ---------- */
  (function spotlight() {
    if (reduce || !fine) return;
    var cards = document.querySelectorAll(".certificate-box, .contact .info-box");
    cards.forEach(function (card) {
      var glow = document.createElement("span");
      glow.className = "pm-glow";
      card.insertBefore(glow, card.firstChild);
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var mx = ((e.clientX - r.left) / r.width) * 100;
        var my = ((e.clientY - r.top) / r.height) * 100;
        glow.style.setProperty("--mx", mx.toFixed(1) + "%");
        glow.style.setProperty("--my", my.toFixed(1) + "%");
      });
    });
  })();

  /* ---------- 3) Magnetic buttons / social links ---------- */
  (function magnetic() {
    if (reduce || !fine) return;
    var sel = ".vcard-btn, #header .social-links a, .contact .social-links a";
    var els = document.querySelectorAll(sel);
    var STRENGTH = 0.35, MAX = 10;
    els.forEach(function (el) {
      el.classList.add("pm-magnetic");
      el.addEventListener("pointermove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        var tx = Math.max(-MAX, Math.min(MAX, dx * STRENGTH));
        var ty = Math.max(-MAX, Math.min(MAX, dy * STRENGTH));
        el.style.transform = "translate(" + tx.toFixed(1) + "px," + ty.toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () {
        el.style.transform = "";
      });
    });
  })();
})();
