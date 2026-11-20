/* =======================================================
 * Telegram API helper (shared by feedback.js + visitor.js)
 *
 * Calls the same-origin Netlify Function proxy. The bot token
 * NEVER appears in the browser — it lives only in Netlify
 * environment variables (see netlify/functions/tg.js).
 *
 * NOTE: works on the deployed Netlify site. For local testing
 * of Telegram delivery, run `netlify dev` (the plain static
 * server has no functions, so calls will 404 locally).
 * ======================================================= */
(function () {
  "use strict";

  var ENDPOINT = "/.netlify/functions/tg"; // same-origin; token stays server-side

  /**
   * tgApi("sendMessage" | "editMessageText", params) → Promise<TelegramJSON>
   * Pass params.__keepalive = true for calls during page unload.
   */
  window.tgApi = function (method, params) {
    params = params || {};
    var keepalive = !!params.__keepalive;
    var p = {};
    for (var k in params) if (k !== "__keepalive") p[k] = params[k];
    p.method = method;

    return fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: keepalive,
      body: JSON.stringify(p)
    }).then(function (r) { return r.json(); });
  };
})();
