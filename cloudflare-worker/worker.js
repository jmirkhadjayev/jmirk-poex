/* =======================================================
 * Cloudflare Worker — Telegram proxy
 * Hides BOT_TOKEN + CHAT_ID (stored as Worker secrets).
 * Only allows requests from your own site + a small set of
 * Telegram methods. Forwards to the Telegram Bot API.
 *
 * Secrets to set in Cloudflare (Settings → Variables and Secrets):
 *   BOT_TOKEN  = <your bot token from BotFather>
 *   CHAT_ID    = <your channel/chat id>
 * ======================================================= */

// Sites allowed to use this proxy — EDIT to match your domains.
const ALLOWED_ORIGINS = [
  "https://mirkhadjayev.uz",
  "https://www.mirkhadjayev.uz",
  "http://127.0.0.1:1010",
  "http://localhost:1010",
  "http://127.0.0.1:5959",
  "http://localhost:5959",
];

// Telegram methods the client is permitted to call.
const ALLOWED_METHODS = ["sendMessage", "editMessageText"];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    const cors = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return json({ ok: false, error: "method_not_allowed" }, 405, cors);
    }
    // Block other sites (browsers always send Origin on cross-origin POST)
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
      return json({ ok: false, error: "forbidden_origin" }, 403, cors);
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ ok: false, error: "bad_json" }, 400, cors);
    }

    const method = body.method;
    if (!ALLOWED_METHODS.includes(method)) {
      return json({ ok: false, error: "method_not_allowed" }, 400, cors);
    }

    // Build Telegram params — force chat_id from the secret, drop client overrides.
    const params = {};
    for (const k in body) if (k !== "method" && k !== "chat_id") params[k] = body[k];
    params.chat_id = env.CHAT_ID;

    const tgRes = await fetch(`https://api.telegram.org/bot${env.BOT_TOKEN}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });

    const text = await tgRes.text();
    return new Response(text, {
      status: tgRes.status,
      headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
