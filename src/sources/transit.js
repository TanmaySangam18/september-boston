// MBTA v3, keyless. Predictions when service is running, schedules when it is not.
const API = "https://api-v3.mbta.com";
const q = o => Object.entries(o).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");

const wait = ms => new Promise(r => setTimeout(r, ms));

async function get(path, params, tries = 3) {
  for (let i = 0; i < tries; i++) {
    const r = await fetch(`${API}${path}?${q(params)}`, {
      headers: { accept: "application/vnd.api+json" },
      signal: AbortSignal.timeout(15000)
    });
    if (r.ok) return r.json();
    if (r.status === 429 && i < tries - 1) { await wait(4000 * (i + 1)); continue; }
    throw new Error(`mbta ${path} ${r.status}`);
  }
}

const idx = d => Object.fromEntries((d.included ?? []).map(x => [`${x.type}:${x.id}`, x]));

export async function nearestStation(lat, lon) {
  const d = await get("/stops", {
    "filter[latitude]": lat, "filter[longitude]": lon,
    "filter[radius]": 0.02, "filter[route_type]": "0,1",
    "page[limit]": 12, sort: "distance"
  });
  // prefer a parent station over a platform
  const parent = d.data.find(s => s.id.startsWith("place-"));
  const pick = parent ?? d.data[0];
  return pick ? { id: pick.id, name: pick.attributes.name } : null;
}

const mins = iso => Math.round((Date.parse(iso) - Date.now()) / 60000);

export async function departures(stopId, limit = 3) {
  let d = await get("/predictions", {
    "filter[stop]": stopId, sort: "departure_time",
    "page[limit]": 20, include: "route"
  });
  let scheduled = false;
  if (!d.data.length) {
    scheduled = true;
    d = await get("/schedules", {
      "filter[stop]": stopId, "filter[min_time]": new Date().toISOString().slice(11, 16),
      sort: "departure_time", "page[limit]": 20, include: "route"
    });
  }
  const inc = idx(d);
  const out = [];
  for (const p of d.data) {
    const t = p.attributes.departure_time ?? p.attributes.arrival_time;
    if (!t) continue;
    const m = mins(t);
    if (!scheduled && m < 0) continue;
    const rid = p.relationships?.route?.data?.id;
    const route = inc[`route:${rid}`]?.attributes ?? {};
    out.push({
      route: route.long_name ?? rid ?? "—",
      short: route.short_name || (rid ?? "").replace(/^(Green-|Orange|Red|Blue)/, m => m) || null,
      color: route.color ? `#${route.color}` : null,
      headsign: p.attributes.headsign ?? null,
      at: t.slice(11, 16),
      inMinutes: scheduled ? null : m
    });
    if (out.length >= limit) break;
  }
  return { scheduled, list: out };
}

const SEVERE = new Set(["SUSPENSION", "SHUTTLE", "STATION_CLOSURE", "DETOUR", "CANCELLATION"]);

// Alerts are city-wide, so fetch them once per build and filter locally.
// Twelve neighbourhoods used to mean twelve calls; now it means one.
export async function allAlerts() {
  const d = await get("/alerts", { "filter[route_type]": "0,1", "page[limit]": 120 });
  const now = Date.now();
  const out = [];
  for (const a of d.data) {
    const at = a.attributes;
    const active = (at.active_period ?? []).some(p =>
      now >= (p.start ? Date.parse(p.start) : 0) && now <= (p.end ? Date.parse(p.end) : Infinity));
    if (!active) continue;
    const stops = new Set(), routes = new Set();
    for (const e of at.informed_entity ?? []) {
      if (e.stop) stops.add(e.stop);
      if (e.route) routes.add(e.route);
    }
    out.push({
      effect: at.effect,
      severity: at.severity ?? 0,
      header: (at.header ?? "").replace(/\s+/g, " ").trim(),
      urgent: SEVERE.has(at.effect) || (at.severity ?? 0) >= 7,
      stops, routes
    });
  }
  return out;
}

export function statusForStop(alerts, stopId, routeIds = []) {
  const live = alerts.filter(a =>
    a.stops.has(stopId) || routeIds.some(r => a.routes.has(r)));
  live.sort((a, b) => (b.urgent - a.urgent) || (b.severity - a.severity));
  return {
    normal: live.length === 0,
    urgent: live.some(x => x.urgent),
    alerts: live.slice(0, 3).map(({ stops, routes, ...rest }) => rest)
  };
}
