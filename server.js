const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.PORT) || 1010;

/* ---------------------------------------------------------
 * Local Telegram proxy (mirrors netlify/functions/tg.js) so
 * the contact form actually delivers when testing on
 * http://localhost:1010 — the plain static server otherwise
 * has no serverless function and calls 404.
 *
 * Credentials are read from (in order):
 *   1) env: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID
 *   2) local file: tg-secret.json  { "token": "...", "chatId": "..." }
 * tg-secret.json is NOT committed (see .gitignore). Never hardcode it.
 * ------------------------------------------------------- */
function loadTgConfig() {
  let token = process.env.TELEGRAM_BOT_TOKEN || '';
  let chatId = process.env.TELEGRAM_CHAT_ID || '';
  try {
    const raw = fs.readFileSync(path.join(ROOT, 'tg-secret.json'), 'utf8');
    const cfg = JSON.parse(raw);
    token = token || cfg.token || cfg.TELEGRAM_BOT_TOKEN || '';
    chatId = chatId || cfg.chatId || cfg.TELEGRAM_CHAT_ID || '';
  } catch (e) { /* file is optional */ }
  return { token, chatId };
}

const ALLOWED_METHODS = ['sendMessage', 'editMessageText'];

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

async function handleTelegram(req, res) {
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });

  const { token, chatId } = loadTgConfig();
  if (!token || !chatId) {
    console.log('[tg] NOT CONFIGURED — create tg-secret.json with {"token","chatId"} to deliver locally.');
    return sendJson(res, 500, { ok: false, error: 'server_not_configured' });
  }

  let raw = '';
  req.on('data', (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
  req.on('end', async () => {
    let body;
    try { body = JSON.parse(raw || '{}'); }
    catch (e) { return sendJson(res, 400, { ok: false, error: 'bad_json' }); }

    const method = body.method;
    if (!ALLOWED_METHODS.includes(method)) {
      return sendJson(res, 400, { ok: false, error: 'method_not_allowed' });
    }

    const params = {};
    for (const k in body) if (k !== 'method' && k !== 'chat_id') params[k] = body[k];
    params.chat_id = chatId;

    try {
      const tgRes = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const text = await tgRes.text();
      console.log('[tg] ' + method + ' → ' + tgRes.status + ' ' + text.slice(0, 200));
      res.writeHead(tgRes.status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(text);
    } catch (e) {
      console.log('[tg] upstream error: ' + e.message);
      sendJson(res, 502, { ok: false, error: 'upstream_error' });
    }
  });
}

/* ---------------------------------------------------------
 * Local geo proxy (mirrors netlify/functions/geo.js) so the
 * visitor "Manzil" (IP/location) block also appears when
 * testing on http://localhost:1010. On localhost the client
 * IP is private, so we ask ipwho.is with no IP — it returns
 * THIS machine's public-IP geo (good enough for local testing).
 * ------------------------------------------------------- */
async function handleGeo(req, res) {
  let ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || (req.socket && req.socket.remoteAddress) || '';
  ip = ip.replace(/^::ffff:/, '');
  const isLocal = !ip || ip === '::1' || ip === '127.0.0.1'
    || /^10\./.test(ip) || /^192\.168\./.test(ip)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(ip);

  // geojs.io — free, HTTPS, no key. Empty IP → returns THIS machine's public-IP geo.
  const url = isLocal
    ? 'https://get.geojs.io/v1/ip/geo.json'
    : 'https://get.geojs.io/v1/ip/geo/' + encodeURIComponent(ip) + '.json';
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'portfolio-visitor-fn' } });
    const g = await r.json();
    const data = {
      success: true,
      ip: g.ip || ip,
      country: g.country,
      region: g.region,
      city: g.city,
      latitude: g.latitude,
      longitude: g.longitude,
      connection: { isp: g.organization_name || g.organization || '' },
      flag: {},
    };
    console.log('[geo] ' + (data.ip || '?') + ' / ' + (data.city || '?') + ', ' + (data.country || '?'));
    return sendJson(res, 200, data);
  } catch (e) {
    console.log('[geo] error: ' + e.message);
    return sendJson(res, 200, { success: false });
  }
}

/* ---------------------------------------------------------
 * Local Supabase proxy (mirrors netlify/functions/log-visit.js
 * and get-visits.js) so the CENTRAL visitor DB also works when
 * testing on http://localhost:1010.
 *
 * Credentials are read from (in order):
 *   1) env: SUPABASE_URL / SUPABASE_SERVICE_KEY / ADMIN_TOKEN
 *   2) local file: supabase-secret.json
 *      { "url": "...", "serviceKey": "...", "adminToken": "..." }
 * supabase-secret.json is NOT committed. Never hardcode keys.
 * ------------------------------------------------------- */
function loadSbConfig() {
  let url = process.env.SUPABASE_URL || '';
  let serviceKey = process.env.SUPABASE_SERVICE_KEY || '';
  let adminToken = process.env.ADMIN_TOKEN || '';
  try {
    const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'supabase-secret.json'), 'utf8'));
    url = url || cfg.url || '';
    serviceKey = serviceKey || cfg.serviceKey || '';
    adminToken = adminToken || cfg.adminToken || '';
  } catch (e) { /* optional */ }
  return { url, serviceKey, adminToken };
}

async function handleLogVisit(req, res) {
  if (req.method === 'OPTIONS') { res.writeHead(204); return res.end(); }
  if (req.method !== 'POST') return sendJson(res, 405, { ok: false, error: 'method_not_allowed' });
  const { url, serviceKey } = loadSbConfig();
  if (!url || !serviceKey) return sendJson(res, 500, { ok: false, error: 'server_not_configured' });

  let raw = '';
  req.on('data', (c) => { raw += c; if (raw.length > 1e6) req.destroy(); });
  req.on('end', async () => {
    let v; try { v = JSON.parse(raw || '{}'); } catch (e) { return sendJson(res, 400, { ok: false, error: 'bad_json' }); }
    const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
      || (req.socket && req.socket.remoteAddress) || '';
    const row = {
      visited_at: new Date().toISOString(),
      ip: v.ip || ip || null, location: v.location || null, isp: v.isp || null,
      device: v.device || null, browser: v.browser || null, os: v.os || null,
      gps: v.gps || null, duration: v.duration || null, path: v.path || null,
      referrer: v.ref || null, user_agent: (req.headers['user-agent'] || '').slice(0, 300),
    };
    try {
      const r = await fetch(`${url}/rest/v1/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: serviceKey, Authorization: `Bearer ${serviceKey}`, Prefer: 'return=minimal' },
        body: JSON.stringify(row),
      });
      const text = await r.text();
      console.log('[db] log-visit → ' + r.status + ' ' + text.slice(0, 120));
      return sendJson(res, r.ok ? 200 : 502, r.ok ? { ok: true } : { ok: false, error: 'db_error', detail: text.slice(0, 200) });
    } catch (e) { return sendJson(res, 502, { ok: false, error: 'upstream_error' }); }
  });
}

async function handleGetVisits(req, res, query) {
  const { url, serviceKey, adminToken } = loadSbConfig();
  if (!url || !serviceKey) return sendJson(res, 500, { ok: false, error: 'server_not_configured' });
  const params = new URLSearchParams(query || '');
  if (adminToken && params.get('token') !== adminToken) return sendJson(res, 401, { ok: false, error: 'unauthorized' });

  let q = `${url}/rest/v1/visits?select=*&order=visited_at.desc&limit=1000`;
  const month = params.get('month');
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split('-').map(Number);
    q += `&visited_at=gte.${new Date(Date.UTC(y, m - 1, 1)).toISOString()}&visited_at=lt.${new Date(Date.UTC(y, m, 1)).toISOString()}`;
  }
  try {
    const r = await fetch(q, { headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } });
    const data = await r.json();
    return sendJson(res, r.ok ? 200 : 502, r.ok ? { ok: true, visits: data } : { ok: false, error: 'db_error', detail: data });
  } catch (e) { return sendJson(res, 502, { ok: false, error: 'upstream_error' }); }
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json',
};

const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);

  // Telegram proxy routes (same paths as the live site)
  if (urlPath === '/.netlify/functions/tg' || urlPath === '/api/tg') {
    return handleTelegram(req, res);
  }
  // Geo (visitor IP/location) route — same path as the live site
  if (urlPath === '/.netlify/functions/geo' || urlPath === '/api/geo') {
    return handleGeo(req, res);
  }
  // Central visitor DB routes (Supabase) — same paths as the live site
  if (urlPath === '/.netlify/functions/log-visit' || urlPath === '/api/log-visit') {
    return handleLogVisit(req, res);
  }
  if (urlPath === '/.netlify/functions/get-visits' || urlPath === '/api/get-visits') {
    return handleGetVisits(req, res, (req.url.split('?')[1] || ''));
  }

  if (urlPath === '/') urlPath = '/index.html';
  let filePath = path.join(ROOT, urlPath);

  // prevent path traversal
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end('<h1>404 Not Found</h1>');
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  });
});

server.listen(PORT, () => {
  const { token, chatId } = loadTgConfig();
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log('[tg] Telegram proxy: ' + (token && chatId ? 'CONFIGURED ✓' : 'not configured (form will not deliver locally)'));
});
