/* =======================================================
 * Netlify Function — Telegram proxy
 * Keeps the bot token SECRET on the server. The browser only
 * calls /.netlify/functions/tg on your own domain (same-origin).
 *
 * Set these in Netlify → Site configuration → Environment variables:
 *   TELEGRAM_BOT_TOKEN = <your bot token from BotFather>
 *   TELEGRAM_CHAT_ID   = <your channel/chat id>
 * ======================================================= */

const ALLOWED_METHODS = ["sendMessage", "editMessageText"];

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: "method_not_allowed" }) };
  }

  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
  if (!TOKEN || !CHAT_ID) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "server_not_configured" }) };
  }

  let body;
  try {
    let raw = event.body || "{}";
    if (event.isBase64Encoded) raw = Buffer.from(raw, "base64").toString("utf8");
    body = JSON.parse(raw);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "bad_json" }) };
  }

  const method = body.method;
  if (!ALLOWED_METHODS.includes(method)) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "method_not_allowed" }) };
  }

  // Build Telegram params — force chat_id from the secret, ignore client overrides.
  const params = {};
  for (const k in body) if (k !== "method" && k !== "chat_id") params[k] = body[k];
  params.chat_id = CHAT_ID;

  try {
    const res = await fetch(`https://api.telegram.org/bot${TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    const text = await res.text();
    return { statusCode: res.status, headers, body: text };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: "upstream_error" }) };
  }
};
