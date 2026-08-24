// Moving truck permits. 86% carry coordinates, so a permit can be placed on a
// block — meaning the card can warn that a spot is about to disappear.
const SQL = "https://data.boston.gov/api/3/action/datastore_search_sql";
let rid = null;

async function resource() {
  if (rid) return rid;
  const r = await fetch("https://data.boston.gov/api/3/action/package_show?id=moving-truck-permits");
  const d = await r.json();
  rid = d.result.resources.find(x => x.datastore_active)?.id;
  return rid;
}

const q = s => `${SQL}?sql=${encodeURIComponent(s)}`;

export async function trucksNear({ lat, lon, radiusDeg = 0.008, days = 7 } = {}) {
  const id = await resource();
  if (!id) return [];
  const today = new Date().toISOString().slice(0, 10);
  const until = new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);

  const sql = `SELECT "comments","issued_date","expiration_date","lat","long","city" FROM "${id}" ` +
    `WHERE "status" = 'OPEN' AND "lat" IS NOT NULL ` +
    `AND "expiration_date" >= '${today}' AND "expiration_date" <= '${until}' ` +
    `AND CAST("lat" AS float) BETWEEN ${lat - radiusDeg} AND ${lat + radiusDeg} ` +
    `AND CAST("long" AS float) BETWEEN ${lon - radiusDeg} AND ${lon + radiusDeg} LIMIT 25`;

  const r = await fetch(q(sql));
  if (!r.ok) return [];
  const d = await r.json();
  if (!d.success) return [];

  return d.result.records.map(x => ({
    until: x.expiration_date,
    window: /(\d+\s*[AP]M\s*-\s*\d+\s*[AP]M)/i.exec(x.comments ?? "")?.[1] ?? "7AM-5PM",
    hood: x.city
  }));
}
