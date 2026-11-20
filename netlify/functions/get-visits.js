/* =======================================================
 * Netlify Function — read visits from Supabase for the admin panel.
 *
 * Protected by ADMIN_TOKEN: the caller must pass ?token=<ADMIN_TOKEN>.
 * (See the security note in the admin panel — a client-side token is
 *  light protection; for stronger auth use Netlify Identity.)
 *
 * Env vars (Netlify → Site configuration → Environment variables):
 *   SUPABASE_URL          = https://xxxxxxxx.supabase.co
 *   SUPABASE_SERVICE_KEY  = <service_role secret key>
 *   ADMIN_TOKEN           = <a long random string you pick>
 *
 * Optional query:
 *   ?month=YYYY-MM   → only visits within that calendar month (UTC)
 * ======================================================= */

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json" };

  const SB_URL = process.env.SUPABASE_URL;
  const SB_KEY = process.env.SUPABASE_SERVICE_KEY;
  const ADMIN = process.env.ADMIN_TOKEN;
  if (!SB_URL || !SB_KEY) {
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: "server_not_configured" }) };
  }

  const params = event.queryStringParameters || {};
  if (ADMIN && params.token !== ADMIN) {
    return { statusCode: 401, headers, body: JSON.stringify({ ok: false, error: "unauthorized" }) };
  }

  // Build the PostgREST query. Newest first, capped at 1000 rows.
  let query = `${SB_URL}/rest/v1/visits?select=*&order=visited_at.desc&limit=1000`;
  if (params.month && /^\d{4}-\d{2}$/.test(params.month)) {
    const [y, m] = params.month.split("-").map(Number);
    const start = new Date(Date.UTC(y, m - 1, 1)).toISOString();
    const end = new Date(Date.UTC(y, m, 1)).toISOString();
    query += `&visited_at=gte.${start}&visited_at=lt.${end}`;
  }

  try {
    const res = await fetch(query, {
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
    });
    const data = await res.json();
    if (!res.ok) {
      return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: "db_error", detail: data }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, visits: data }) };
  } catch (e) {
    return { statusCode: 502, headers, body: JSON.stringify({ ok: false, error: "upstream_error" }) };
  }
};
