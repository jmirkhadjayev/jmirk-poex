/* =======================================================
 * Netlify Function — visitor IP + geolocation
 * Runs SERVER-SIDE so it isn't blocked by Safari/Brave
 * cross-site tracking protection (the browser only calls
 * this same-origin endpoint).
 *
 * Returns an ipwho.is-shaped object: { ip, country, region,
 * city, postal, latitude, longitude, connection:{isp}, flag }.
 *
 * Source order:
 *   1) geojs.io (free, HTTPS, no key, reliable) for the visitor IP
 *   2) ipwho.is (legacy; free plan now often blocks)
 *   3) Netlify's own x-nf-geo header (always available on Netlify)
 * ======================================================= */

exports.handler = async (event) => {
  const headers = { "Content-Type": "application/json", "Cache-Control": "no-store" };
  const h = event.headers || {};

  // Visitor's real IP (Netlify sets these)
  const ip =
    h["x-nf-client-connection-ip"] ||
    (h["x-forwarded-for"] || "").split(",")[0].trim() ||
    h["client-ip"] ||
    "";

  // 1) geojs.io — reliable free geo with ISP/organization
  try {
    const url = ip
      ? "https://get.geojs.io/v1/ip/geo/" + encodeURIComponent(ip) + ".json"
      : "https://get.geojs.io/v1/ip/geo.json";
    const res = await fetch(url, { headers: { "User-Agent": "portfolio-visitor-fn" } });
    const g = await res.json();
    if (g && (g.country || g.city || g.latitude)) {
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          success: true,
          ip: g.ip || ip,
          country: g.country,
          region: g.region,
          city: g.city,
          latitude: g.latitude,
          longitude: g.longitude,
          connection: { isp: g.organization_name || g.organization || "" },
          flag: {},
        }),
      };
    }
  } catch (e) { /* fall through */ }

  // 2) ipwho.is (may be blocked on free plan)
  try {
    const res = await fetch("https://ipwho.is/" + encodeURIComponent(ip), {
      headers: { "User-Agent": "portfolio-visitor-fn" },
    });
    const data = await res.json();
    if (data && data.success !== false && (data.country || data.city)) {
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }
  } catch (e) { /* fall through */ }

  // 3) Fallback: Netlify's own geo header (no ISP, but country/city/coords)
  let nf = {};
  try {
    nf = JSON.parse(Buffer.from(h["x-nf-geo"] || "", "base64").toString("utf8"));
  } catch (e) { /* ignore */ }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      ip: ip,
      country: nf.country && nf.country.name,
      region: nf.subdivision && nf.subdivision.name,
      city: nf.city,
      latitude: nf.latitude,
      longitude: nf.longitude,
      connection: { isp: "" },
      flag: {},
    }),
  };
};
