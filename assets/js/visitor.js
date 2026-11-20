/* =======================================================
 * Visitor tracker → Telegram
 * Sends a rich visitor card on arrival, then live-updates
 * the SAME message with a step-by-step journey (no spam).
 *
 * ⚠️ SECURITY: BOT_TOKEN is exposed in client-side JS — anyone
 * can read it and abuse the bot. For production, proxy these
 * calls through a serverless function and keep the token secret.
 * ⚠️ PRIVACY: collects IP/geo/device. Add a privacy notice and,
 * where required (GDPR/ePrivacy), visitor consent.
 * ======================================================= */
(function () {
  "use strict";

  // Telegram calls go through window.tgApi (see tg.js) — token is
  // handled there (Cloudflare Worker proxy when configured).

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
  function nowT() {
    return new Date().toLocaleTimeString("uz-UZ", {
      timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  }

  // visit count (per browser)
  var visits = parseInt(localStorage.getItem("tg_visit_count") || "0", 10) + 1;
  localStorage.setItem("tg_visit_count", String(visits));

  var startTs = Date.now();
  var ua = navigator.userAgent;

  // Android model from UA (Chrome on Android, Firefox, etc.)
  function androidModel() {
    var m = ua.match(/;\s*([A-Za-z0-9 _.\-]+?)\s+Build\//);
    if (m) return m[1].trim();
    m = ua.match(/Android\s[\d.]+;\s*([^);]+?)\)/);
    if (m && !/^[A-Za-z]{1,7}$/.test(m[1].trim())) return m[1].trim();
    return "";
  }
  // iPhone model GUESS from screen size (Apple hides the exact model)
  function iphoneModel() {
    var w = Math.min(screen.width, screen.height),
        h = Math.max(screen.width, screen.height),
        r = Math.round(window.devicePixelRatio || 1);
    var map = {
      "320x568@2": "iPhone SE(1) / 5s",
      "375x667@2": "iPhone 6/7/8 / SE2 / SE3",
      "414x736@3": "iPhone 6+/7+/8+ Plus",
      "375x812@3": "iPhone X/XS/11 Pro / 12·13 mini",
      "414x896@2": "iPhone XR / 11",
      "414x896@3": "iPhone XS Max / 11 Pro Max",
      "390x844@3": "iPhone 12/12 Pro/13/13 Pro/14",
      "428x926@3": "iPhone 12/13 Pro Max / 14 Plus",
      "393x852@3": "iPhone 14 Pro/15/15 Pro/16",
      "430x932@3": "iPhone 14 Pro Max/15 Plus/15 Pro Max",
      "402x874@3": "iPhone 16 Pro",
      "440x956@3": "iPhone 16 Pro Max"
    };
    var hit = map[w + "x" + h + "@" + r];
    return hit ? "≈ " + hit : "";
  }

  function detect() {
    var os = "Unknown", br = "Unknown", dev = "Desktop", model = "";
    if (/Windows NT 10/.test(ua)) os = "Windows 10/11";
    else if (/Windows/.test(ua)) os = "Windows";
    else if (/Android/.test(ua)) { os = "Android"; dev = "Mobile"; model = androidModel(); }
    else if (/iPhone|iPod/.test(ua)) { os = "iOS"; dev = "Mobile"; model = iphoneModel(); }
    else if (/iPad/.test(ua)) { os = "iPadOS"; dev = "Tablet"; model = iphoneModel(); }
    else if (/Mac OS X/.test(ua)) os = "macOS";
    else if (/Linux/.test(ua)) os = "Linux";
    if (/Edg\//.test(ua)) br = "Edge";
    else if (/OPR\/|Opera/.test(ua)) br = "Opera";
    else if (/Chrome\//.test(ua)) br = "Chrome";
    else if (/Firefox\//.test(ua)) br = "Firefox";
    else if (/Safari\//.test(ua)) br = "Safari";
    var m = ua.match(/(?:Edg|OPR|Chrome|Firefox|Version)\/(\d+)/);
    if (/Mobi|Android/.test(ua) && dev === "Desktop") dev = "Mobile";
    return { os: os, br: br + (m ? " " + m[1] : ""), dev: dev, model: model, arch: "" };
  }
  var d = detect();

  // High-entropy Client Hints (Chromium): exact Win 10/11, Android ver + model, CPU arch
  function enrichHints() {
    var uad = navigator.userAgentData;
    if (!uad || !uad.getHighEntropyValues) return Promise.resolve();
    return uad.getHighEntropyValues(["model", "platformVersion", "platform", "architecture", "bitness"])
      .then(function (h) {
        if (h.model) d.model = h.model;
        if (h.architecture) d.arch = h.architecture + (h.bitness ? " " + h.bitness + "-bit" : "");
        var major = h.platformVersion ? parseInt(h.platformVersion.split(".")[0], 10) : 0;
        if (h.platform === "Windows" && major) d.os = major >= 13 ? "Windows 11" : "Windows 10";
        else if (h.platform === "Android" && major) d.os = "Android " + major;
        else if (h.platform === "macOS" && h.platformVersion) d.os = "macOS " + h.platformVersion;
      })
      .catch(function () {});
  }
  var tz = ""; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) {}

  var journey = [];
  var geo = null;    // IP-based (approx) — silent, no prompt
  var gps = null;    // precise (GPS/Wi-Fi) — only if the visitor allows
  var msgId = null;
  var lastEdit = 0;

  function buildMessage() {
    var L = [];
    L.push("🟢 <b>Yangi tashrif</b> #" + visits);
    L.push("🕒 " + nowT() + " (Tashkent)");
    L.push("");
    if (geo) {
      L.push("🌍 <b>Manzil</b>");
      L.push("• IP: <code>" + esc(geo.ip) + "</code>");
      L.push("• Davlat: " + esc(geo.country || "?") + (geo.flag && geo.flag.emoji ? " " + geo.flag.emoji : ""));
      L.push("• Shahar: " + esc(geo.city || "?") + (geo.region ? ", " + esc(geo.region) : ""));
      if (geo.postal) L.push("• Pochta: " + esc(geo.postal));
      if (geo.connection && geo.connection.isp) L.push("• ISP: " + esc(geo.connection.isp));
      if (geo.latitude != null) {
        L.push("• 📍 <a href=\"https://maps.google.com/?q=" + geo.latitude + "," + geo.longitude + "\">" +
          geo.latitude + ", " + geo.longitude + "</a>");
      }
      L.push("");
    }
    if (gps && gps.lat != null) {
      L.push("🎯 <b>Aniq joylashuv (GPS)</b>");
      L.push("• 📍 <a href=\"https://maps.google.com/?q=" + gps.lat + "," + gps.lon + "\">" +
        gps.lat.toFixed(6) + ", " + gps.lon.toFixed(6) + "</a>");
      L.push("• Aniqlik: ±" + Math.round(gps.acc) + " m");
      L.push("");
    } else if (gps && gps.error) {
      L.push("🎯 <b>Aniq joylashuv:</b> ❌ " + esc(gps.error));
      L.push("");
    }
    L.push("💻 <b>Qurilma</b>");
    L.push("• Brauzer: " + esc(d.br));
    L.push("• OS: " + esc(d.os));
    L.push("• Turi: " + esc(d.dev));
    if (d.model) L.push("• Model: " + esc(d.model));
    if (d.arch) L.push("• Arxitektura: " + esc(d.arch));
    L.push("• Ekran: " + screen.width + "×" + screen.height + " @" + (window.devicePixelRatio || 1) + "x");
    L.push("• Oyna: " + window.innerWidth + "×" + window.innerHeight);
    L.push("• Til: " + esc(navigator.language || ""));
    L.push("• Yadro: " + (navigator.hardwareConcurrency || "?") + " CPU");
    L.push("• TZ: " + esc(tz));
    L.push("");
    L.push("🔗 Manba: " + esc(document.referrer || "To‘g‘ridan-to‘g‘ri"));
    L.push("📄 Sahifa: " + esc(location.pathname));
    L.push("");
    L.push("👣 <b>Qadamlar</b>");
    if (journey.length) {
      journey.forEach(function (s, i) { L.push((i + 1) + ". " + s.t + " — " + esc(s.name)); });
    } else {
      L.push("—");
    }
    L.push("");
    L.push("⏱ Saytda: " + Math.round((Date.now() - startTs) / 1000) + "s");
    return L.join("\n");
  }

  function send() {
    if (!window.tgApi) return;
    window.tgApi("sendMessage", {
      text: buildMessage(), parse_mode: "HTML", disable_web_page_preview: true
    }).then(function (j) { if (j && j.ok) msgId = j.result.message_id; })
      .catch(function () {});
  }

  function update(final) {
    if (!msgId || !window.tgApi) return;
    var t = Date.now();
    if (!final && t - lastEdit < 2500) return; // throttle edits
    lastEdit = t;
    window.tgApi("editMessageText", {
      message_id: msgId, text: buildMessage(),
      parse_mode: "HTML", disable_web_page_preview: true, __keepalive: !!final
    }).catch(function () {});
  }

  // Save / update THIS visit in localStorage so the Admin panel
  // (admin.html → "Tashrif Buyuruvchilar Jurnali") shows it as a row.
  // Captures entry time, location, device AND live duration (exit).
  function saveLog() {
    try {
      var logs = JSON.parse(localStorage.getItem("portfolio_visitor_logs") || "[]");
      var loc = geo ? ((geo.city || "?") + (geo.country ? ", " + geo.country : "")) : "—";
      var entry = {
        id: startTs,
        date: new Date(startTs).toLocaleString("uz-UZ", { timeZone: "Asia/Tashkent" }),
        ip: (geo && geo.ip) ? geo.ip : "—",
        location: loc,
        isp: (geo && geo.connection && geo.connection.isp) ? geo.connection.isp : "—",
        device: d.model || d.dev || "—",
        browser: d.br || "—",
        os: d.os || "—",
        gps: (gps && gps.lat != null) ? (gps.lat.toFixed(5) + ", " + gps.lon.toFixed(5)) : "",
        entry: nowT0(startTs),
        exit: nowT0(Date.now()),
        duration: Math.round((Date.now() - startTs) / 1000) + "s",
        path: location.pathname,
        ref: document.referrer || "To'g'ridan-to'g'ri"
      };
      var idx = -1;
      for (var i = 0; i < logs.length; i++) { if (logs[i].id === startTs) { idx = i; break; } }
      if (idx >= 0) logs[idx] = entry; else logs.unshift(entry);
      if (logs.length > 300) logs.length = 300;   // cap
      localStorage.setItem("portfolio_visitor_logs", JSON.stringify(logs));
    } catch (e) {}
  }
  function nowT0(ts) {
    return new Date(ts).toLocaleTimeString("uz-UZ", {
      timeZone: "Asia/Tashkent", hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  }

  function step(name) {
    var last = journey[journey.length - 1];
    if (last && last.name === name) return;
    journey.push({ t: nowT(), name: name });
    update(false);
    saveLog();
  }

  // 1) landing step
  step("Kirish");

  // 2) gather device hints + geo in parallel, then send one card.
  //    Geo runs through our same-origin Netlify function (server-side
  //    lookup) so Safari/Brave cross-site protection can't block it.
  Promise.allSettled([
    enrichHints(),
    fetch("/.netlify/functions/geo")
      .then(function (r) { return r.json(); })
      .then(function (g) { geo = (g && g.success !== false) ? g : null; })
  ]).then(function () { send(); saveLog(); logToDb(); });

  // Central DB log → Netlify function → Supabase. Fire-and-forget: any
  // failure (function not deployed / DB not configured) is ignored so the
  // site keeps working. This is what makes ALL visitors visible in the
  // admin panel, not just the ones on the admin's own browser.
  var dbLogged = false;
  function logToDb() {
    if (dbLogged) return;              // one row per visit
    dbLogged = true;
    try {
      var loc = geo ? ((geo.city || "?") + (geo.country ? ", " + geo.country : "")) : "—";
      fetch("/.netlify/functions/log-visit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body: JSON.stringify({
          ip: (geo && geo.ip) ? geo.ip : "",
          location: loc,
          isp: (geo && geo.connection && geo.connection.isp) ? geo.connection.isp : "",
          device: d.model || d.dev || "",
          browser: d.br || "",
          os: d.os || "",
          gps: (gps && gps.lat != null) ? (gps.lat.toFixed(5) + ", " + gps.lon.toFixed(5)) : "",
          duration: Math.round((Date.now() - startTs) / 1000) + "s",
          path: location.pathname,
          ref: document.referrer || "To'g'ridan-to'g'ri"
        })
      }).catch(function () {});
    } catch (e) {}
  }

  // Precise location (GPS/Wi-Fi) — best-effort, robust.
  //  • requested on load (high accuracy)
  //  • on timeout/failure → retried once with relaxed settings
  //  • also re-tried on the first user gesture (some browsers only show
  //    the prompt after an interaction)
  (function preciseGeo() {
    if (!navigator.geolocation) return;
    var got = false, triedGesture = false;

    function ok(pos) {
      got = true;
      gps = {
        lat: pos.coords.latitude, lon: pos.coords.longitude, acc: pos.coords.accuracy
      };
      if (msgId) { lastEdit = 0; update(false); }   // refresh the card
      saveLog();
    }
    function fail(stage) {
      return function (err) {
        // record why it failed so it shows in the visit card / console
        if (!got) {
          var why = err && err.code === 1 ? "ruxsat berilmadi"
                  : err && err.code === 2 ? "joylashuv aniqlanmadi"
                  : err && err.code === 3 ? "vaqt tugadi" : "noma'lum";
          gps = gps || { error: why };
          try { console.log("[geo] " + stage + " xato: " + why); } catch (e) {}
          if (msgId) { lastEdit = 0; update(false); }
        }
      };
    }

    // attempt 1 — high accuracy
    navigator.geolocation.getCurrentPosition(ok, function (e) {
      // attempt 2 — relaxed (network/wifi), longer timeout, cached allowed
      navigator.geolocation.getCurrentPosition(ok, fail("2"),
        { enableHighAccuracy: false, timeout: 25000, maximumAge: 120000 });
      fail("1")(e);
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });

    // attempt 3 — on first user interaction (helps mobile browsers)
    function onGesture() {
      if (got || triedGesture) return;
      triedGesture = true;
      navigator.geolocation.getCurrentPosition(ok, fail("3"),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    }
    window.addEventListener("click", onGesture, { once: true, passive: true });
    window.addEventListener("touchstart", onGesture, { once: true, passive: true });
  })();

  // 3) navigation steps (SPA nav links / anchors)
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest(".nav-link, a[href^='#']");
    if (!a) return;
    var label = (a.textContent || a.getAttribute("href") || "").trim().replace(/\s+/g, " ");
    if (label) step("Bo‘lim: " + label);
  }, true);

  // 4) scroll-depth steps
  var depths = { 25: 0, 50: 0, 75: 0, 100: 0 };
  window.addEventListener("scroll", function () {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (h <= 0) return;
    var p = Math.round(window.scrollY / h * 100);
    [25, 50, 75, 100].forEach(function (k) {
      if (!depths[k] && p >= k) { depths[k] = 1; step("Scroll " + k + "%"); }
    });
  }, { passive: true });

  // 5) periodic duration refresh + final on leave
  setInterval(function () { update(false); saveLog(); }, 15000);
  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "hidden") { step("Chiqish / fon"); update(true); saveLog(); }
  });
  window.addEventListener("pagehide", function () { update(true); saveLog(); });
})();
