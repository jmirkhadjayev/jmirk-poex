/* =======================================================
 * Netlify Function — store ONE visit row in Supabase.
 *
 * This is what makes visits CENTRAL: every visitor (any device,
 * anywhere) POSTs here, and the row lands in your Supabase DB.
 * The secret service key stays on the server — never in the browser.
 *
 * Set in Netlify → Site configuration → Environment variables:
 *   SUPABASE_URL          = https://xxxxxxxx.supabase.co
 *   SUPABASE_SERVICE_KEY  = <service_role secret key>   (KEEP SECRET)
 * ======================================================= */

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: "method_not_allowed" }) };
  }

  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SB_URL || !SB_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "server_not_configured" }) };
  }

  let v;
  try {
    let raw = event.body || "{}";
    if (event.isBase64Encoded) raw = Buffer.from(raw, "base64").toString("utf8");
    v = JSON.parse(raw);
  } catch (e) {
    return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: "bad_json" }) };
  }

  // The REAL client IP is added server-side (more reliable than the browser's guess).
  const realIp = (event.headers["x-nf-client-connection-ip"] || event.headers["client-ip"] || "").trim();

  // Whitelist only the fields we expect → DB columns. Never trust the client blindly.
  const row = {
    visited_at: new Date().toISOString(),
    ip: v.ip || realIp || null,
    location: v.location || null,
    isp: v.isp || null,
    device: v.device || null,
    browser: v.browser || null,
    os: v.os || null,
    gps: v.gps || null,
    duration: v.duration || null,
    path: v.path || null,
    referrer: v.ref || null,
    user_agent: (event.headers["user-agent"] || "").slice(0, 300),
  };

  try {
    const res = await fetch(`${SB_URL}/rest/v1/visits`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SB_KEY,
        Authorization: `Bearer ${SB_KEY}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(row),
    });
    if (!res.ok) {
      const detail = (await res.text()).slice(0, 200);
      return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: "db_error", detail }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: "upstream_error" }) };
  }
};
