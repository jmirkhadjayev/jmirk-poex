/* =======================================================
 * Creative Layer JS — Classic Developer interactions
 * Scroll reveal · animated skill bars · terminal-style role typing.
 * Restrained: no 3D tilt, no cursor spotlight. Respects reduced-motion.
 * ======================================================= */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. Scroll reveal (repurpose dead data-aos) ---------- */
  const revealSel =
    "[data-aos], .reveal, .certificate-box, .interests .icon-box, " +
    ".resume .resume-item, .contact .info-box, .skill-chip, .section-title";
  const revealEls = Array.from(document.querySelectorAll(revealSel));

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in-view"));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const delay = Math.min(i * 50, 200);
            setTimeout(() => entry.target.classList.add("in-view"), delay);
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- 1b. Reveal a section's content the moment it is shown ----------
   * This site shows one section at a time by toggling the `.section-show`
   * class (sections are position:absolute and off-screen until selected).
   * The IntersectionObserver above is unreliable for that toggle, so content
   * could stay at opacity:0 — i.e. every page except Home looked EMPTY,
   * especially on mobile. Force-reveal descendants whenever a section opens. */
  function revealSection(sec) {
    if (!sec) return;
    sec.querySelectorAll(revealSel).forEach((el) => el.classList.add("in-view"));
    // some reveal targets ARE the section's own wrappers (e.g. .section-title)
    if (sec.matches && sec.matches(revealSel)) sec.classList.add("in-view");
  }

  var sections = Array.from(document.querySelectorAll("section"));
  if ("MutationObserver" in window) {
    var secObs = new MutationObserver((muts) => {
      muts.forEach((m) => {
        if (
          m.attributeName === "class" &&
          m.target.classList &&
          m.target.classList.contains("section-show")
        ) {
          revealSection(m.target);
        }
      });
    });
    sections.forEach((s) =>
      secObs.observe(s, { attributes: true, attributeFilter: ["class"] })
    );
  }
  // reveal whatever section is already open (deep-link / initial load)
  sections.forEach((s) => {
    if (s.classList.contains("section-show")) revealSection(s);
  });

  /* ---------- 2. (Skills are now static logo chips — revealed in step 1) ---------- */

  /* ---------- 3. Terminal-style role typing ---------- */
  const roleSpan = document.querySelector("#header h2 span");
  if (roleSpan && !reduceMotion) {
    const roles = [
      "an IT Project Manager",
      "an Aviation Tech Lead",
      "a Java Backend Developer",
    ];
    const caret = document.createElement("span");
    caret.className = "type-caret";
    roleSpan.after(caret);

    let ri = 0, ci = 0, deleting = false;
    const tick = () => {
      const word = roles[ri];
      roleSpan.textContent = word.slice(0, ci);
      if (!deleting && ci < word.length) {
        ci++;
        setTimeout(tick, 70);
      } else if (!deleting && ci === word.length) {
        deleting = true;
        setTimeout(tick, 1700);
      } else if (deleting && ci > 0) {
        ci--;
        setTimeout(tick, 35);
      } else {
        deleting = false;
        ri = (ri + 1) % roles.length;
        setTimeout(tick, 300);
      }
    };
    setTimeout(tick, 800);
  }

  /* ---------- 4. Competency radar charts (pure SVG) ---------- */
  const RADARS = {
    skillRadar: [            // Core Competencies (technical)
      { label: "Programming Proficiency", value: 85 },
      { label: "Debugging Skills",        value: 80 },
      { label: "Version Control",         value: 85 },
      { label: "Database Management",     value: 80 },
      { label: "Code Testing",            value: 70 },
      { label: "Problem Solving",         value: 88 },
      { label: "API Integration",         value: 82 },
      { label: "Basic Security Knowledge",value: 72 },
    ],
    skillRadar2: [           // Management & Strategy competencies
      { label: "Requirements Analysis",     value: 90 },
      { label: "System Design",             value: 88 },
      { label: "Technical Documentation",   value: 88 },
      { label: "Risk Management",           value: 82 },
      { label: "Stakeholder Communication", value: 92 },
      { label: "Prompt Engineering",        value: 86 },
    ],
  };
  Object.keys(RADARS).forEach(function (id) {
    const radar = document.getElementById(id);
    if (!radar) return;
    const skills = RADARS[id];
    const NS = "http://www.w3.org/2000/svg";
    const XH = "http://www.w3.org/1999/xhtml";
    const cx = 310, cy = 235, R = 150, N = skills.length;
    const ang = (i) => (-90 + i * (360 / N)) * Math.PI / 180;
    const pt = (i, r) => [cx + Math.cos(ang(i)) * r, cy + Math.sin(ang(i)) * r];
    const mk = (tag, attrs) => {
      const el = document.createElementNS(NS, tag);
      for (const k in attrs) el.setAttribute(k, attrs[k]);
      return el;
    };
    const polyStr = (r) => skills.map((_, i) => pt(i, r).join(",")).join(" ");

    // grid rings
    [0.25, 0.5, 0.75, 1].forEach((f) =>
      radar.appendChild(mk("polygon", { points: polyStr(R * f), class: "radar-grid" }))
    );
    // spokes
    skills.forEach((_, i) => {
      const [x, y] = pt(i, R);
      radar.appendChild(mk("line", { x1: cx, y1: cy, x2: x, y2: y, class: "radar-spoke" }));
    });
    // labels (foreignObject for wrapping)
    skills.forEach((s, i) => {
      const [lx, ly] = pt(i, R + 32);
      // side labels are aligned away from the chart so they never cover the polygon
      const c = Math.cos(ang(i));
      const side = c > 0.3 ? "l" : c < -0.3 ? "r" : "c";
      const fx = side === "l" ? lx - 18 : side === "r" ? lx - 122 : lx - 70;
      const fo = mk("foreignObject", { x: fx, y: ly - 24, width: 140, height: 48 });
      const div = document.createElementNS(XH, "div");
      div.className = "radar-label";
      if (side !== "c") div.style.textAlign = side === "l" ? "left" : "right";
      div.textContent = s.label;
      fo.appendChild(div);
      radar.appendChild(fo);
    });
    // data polygon (animated group)
    const g = mk("g", { class: "radar-data" });
    g.appendChild(mk("polygon", { points: skills.map((s, i) => pt(i, R * s.value / 100).join(",")).join(" "), class: "radar-area" }));
    skills.forEach((s, i) => {
      const [x, y] = pt(i, R * s.value / 100);
      g.appendChild(mk("circle", { cx: x, cy: y, r: 4, class: "radar-dot" }));
    });
    radar.appendChild(g);
  });

  /* ---------- 5. Hero background — live coding terminal ---------- */
  (function heroTerminal() {
    var pre = document.getElementById("hero-termText");
    if (!pre) return;

    var lines = [
      '<span class="d">$</span> <span class="g">whoami</span>',
      '<span class="b">Jamshid Mirkhadjayev</span> <span class="d">// IT Project Manager</span>',
      '<span class="d">$</span> <span class="g">cat</span> stack.json',
      '<span class="d">{</span>',
      '  <span class="c">"backend"</span>: [<span class="y">"Java"</span>, <span class="y">"Spring Boot"</span>],',
      '  <span class="c">"db"</span>     : [<span class="y">"PostgreSQL"</span>, <span class="y">"MySQL"</span>],',
      '  <span class="c">"tools"</span>  : [<span class="y">"Git"</span>, <span class="y">"Claude"</span>, <span class="y">"Antigravity"</span>],',
      '  <span class="c">"ai_ready"</span>: <span class="m">true</span>',
      '<span class="d">}</span>',
      '<span class="d">$</span> <span class="g">npm</span> run deploy <span class="b">--prod</span>',
      '<span class="d">▸</span> building   <span class="g">[██████████]</span> <span class="m">100%</span>',
      '<span class="g">✓</span> deployed → <span class="b">mirkhadjayev.uz</span> <span class="y">✨</span>'
    ];

    // reduced motion → render the full transcript statically
    if (reduceMotion) { pre.innerHTML = lines.join("\n"); return; }

    function renderPartial(raw, n) {
      var out = "", count = 0, i = 0;
      while (i < raw.length && count < n) {
        if (raw[i] === "<") { var e = raw.indexOf(">", i); out += raw.slice(i, e + 1); i = e + 1; }
        else { out += raw[i]; count++; i++; }
      }
      var opens = (out.match(/<span/g) || []).length, closes = (out.match(/<\/span>/g) || []).length;
      while (closes++ < opens) out += "</span>";
      return out;
    }

    var li = 0, full = "", tm;
    function typeLine() {
      if (li >= lines.length) { tm = setTimeout(function () { pre.innerHTML = ""; full = ""; li = 0; typeLine(); }, 2800); return; }
      var raw = lines[li], plain = raw.replace(/<[^>]+>/g, ""), n = 0;
      (function ch() {
        n++;
        pre.innerHTML = full + renderPartial(raw, n) + '<span class="tcur"></span>';
        if (n < plain.length) { tm = setTimeout(ch, 26); }
        else { full += raw + "\n"; li++; tm = setTimeout(typeLine, 260); }
      })();
    }
    typeLine();
  })();

  /* ---------- 6. Section-subtitle scramble (reveal) ---------- */
  (function scrambleTitles() {
    if (reduceMotion || !("IntersectionObserver" in window)) return;
    var els = document.querySelectorAll(".section-title p");
    if (!els.length) return;
    var glyphs = "!<>-_\\/[]{}=+*^?#";

    function scramble(el) {
      var target = el.dataset.txt || el.textContent.trim();
      el.dataset.txt = target;
      var dur = 30, frame = 0;
      var settle = target.split("").map(function () { return Math.floor(Math.random() * dur); });
      (function run() {
        var out = "";
        for (var i = 0; i < target.length; i++) {
          if (target[i] === " ") { out += " "; }
          else if (frame > settle[i]) { out += target[i]; }
          else { out += glyphs[Math.floor(Math.random() * glyphs.length)]; }
        }
        el.textContent = out;
        frame++;
        if (frame < dur + 6) requestAnimationFrame(run);
        else el.textContent = target;
      })();
    }

    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { scramble(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 8. 3D tilt on certificate cards (mouse only) ---------- */
  (function tiltCards() {
    if (reduceMotion) return;
    var fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches) return; // skip touch devices
    var cards = document.querySelectorAll(".certificates .certificate-box");
    cards.forEach(function (card) {
      card.addEventListener("pointerenter", function () {
        card.style.transition = "transform .08s linear";
      });
      card.addEventListener("pointermove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(800px) rotateY(" + (px * 7).toFixed(2) + "deg) rotateX(" +
          (-py * 7).toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transition = "";   // back to the CSS .25s ease for a smooth release
        card.style.transform = "";
      });
    });
  })();

  /* ---------- 9. Custom cursor — focus brackets (4 corners), mouse only ----------
   * GPU-friendly: one rAF, only `transform` (translate3d + scale) changes per frame. */
  (function customCursor() {
    if (reduceMotion) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    var brk = document.createElement("div"); brk.className = "cur-brk";
    brk.innerHTML = "<i></i><i></i><i></i><i></i>";
    document.body.appendChild(brk);
    document.documentElement.classList.add("has-cursor");
    var tx = -100, ty = -100, x = tx, y = ty, g = 0, big = 0;
    document.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; });
    (function loop() {
      x += (tx - x) * 0.35; y += (ty - y) * 0.35; g += (big - g) * 0.2;
      brk.style.transform = "translate3d(" + x + "px," + y + "px,0) translate(-50%,-50%) scale(" + (1 + g * 0.6) + ")";
      requestAnimationFrame(loop);
    })();
    var grow = "a,button,.skill-chip,.certificate-box,input,textarea,[role=button]";
    document.addEventListener("pointerover", function (e) {
      if (e.target.closest && e.target.closest(grow)) big = 1;
    });
    document.addEventListener("pointerout", function (e) {
      if (e.target.closest && e.target.closest(grow)) big = 0;
    });
  })();

  /* ---------- 10. Vertical dot-nav (mirrors the menu, desktop only) ---------- */
  (function dotNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll("#navbar .nav-link"));
    if (links.length < 2) return;
    var nav = document.createElement("nav"); nav.className = "side-dotnav";
    var dots = links.map(function (lnk) {
      var b = document.createElement("button");
      var span = lnk.querySelector("span");
      b.setAttribute("data-label", (span ? span.textContent : "").trim());
      b.setAttribute("aria-label", (span ? span.textContent : "").trim());
      b.addEventListener("click", function () { lnk.click(); });
      nav.appendChild(b);
      return b;
    });
    document.body.appendChild(nav);
    function sync() {
      links.forEach(function (lnk, i) { dots[i].classList.toggle("on", lnk.classList.contains("active")); });
    }
    sync();
    var mo = new MutationObserver(sync);
    links.forEach(function (lnk) { mo.observe(lnk, { attributes: true, attributeFilter: ["class"] }); });
  })();

  /* ---------- 11. Word blur-in reveal ---------- */
  (function blurIn() {
    var els = document.querySelectorAll("[data-blurin]");
    if (!els.length) return;
    els.forEach(function (el) {
      var words = el.textContent.trim().split(/\s+/);
      el.textContent = "";
      words.forEach(function (w, i) {
        var s = document.createElement("span"); s.textContent = w; el.appendChild(s);
        if (i < words.length - 1) el.appendChild(document.createTextNode(" "));
      });
    });
    if (reduceMotion || !("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-blurin] span").forEach(function (s) { s.classList.add("show"); });
      return;
    }
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var spans = e.target.querySelectorAll("span");
          spans.forEach(function (s, i) { setTimeout(function () { s.classList.add("show"); }, i * 80); });
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 12. Back-to-top with scroll progress ring ---------- */
  (function backToTop() {
    var R = 21, C = 2 * Math.PI * R;
    var btn = document.createElement("button");
    btn.className = "to-top"; btn.type = "button"; btn.setAttribute("aria-label", "Back to top");
    btn.innerHTML =
      '<svg viewBox="0 0 46 46">' +
        '<circle class="tt-trk" cx="23" cy="23" r="' + R + '"></circle>' +
        '<circle class="tt-val" cx="23" cy="23" r="' + R + '" style="stroke-dasharray:' + C.toFixed(1) +
          ';stroke-dashoffset:' + C.toFixed(1) + '"></circle>' +
      '</svg><span class="tt-ic"><i class="bi bi-arrow-up"></i></span>';
    document.body.appendChild(btn);
    var val = btn.querySelector(".tt-val");
    function upd() {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? doc.scrollTop / max : 0;
      val.style.strokeDashoffset = (C * (1 - p)).toFixed(1);
      btn.classList.toggle("show", doc.scrollTop > 300);
    }
    window.addEventListener("scroll", upd, { passive: true });
    btn.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    upd();
  })();
})();
