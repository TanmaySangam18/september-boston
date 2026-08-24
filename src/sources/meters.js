// Boston meters are free on Sundays and legal holidays — computable, no key.
// The city also publishes 6,955 actual meters with their real pay policy.
const SQL = "https://data.boston.gov/api/3/action/datastore_search_sql";
const FIXED = ["01-01", "06-19", "07-04", "11-11", "12-25"];

function nthWeekday(y, m, wd, n) {
  const d = new Date(y, m, 1); let c = 0;
  while (d.getMonth() === m) { if (d.getDay() === wd && ++c === n) return new Date(d); d.setDate(d.getDate() + 1); }
  return null;
}
function lastWeekday(y, m, wd) {
  const d = new Date(y, m + 1, 0);
  while (d.getDay() !== wd) d.setDate(d.getDate() - 1);
  return d;
}

export function isHoliday(date = new Date()) {
  const y = date.getFullYear();
  const md = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  if (FIXED.includes(md)) return true;
  const same = d => d && d.toDateString() === date.toDateString();
  return same(nthWeekday(y, 0, 1, 3)) || same(nthWeekday(y, 1, 1, 3)) || same(nthWeekday(y, 3, 1, 3))
      || same(lastWeekday(y, 4, 1)) || same(nthWeekday(y, 8, 1, 1)) || same(nthWeekday(y, 9, 1, 2))
      || same(nthWeekday(y, 10, 4, 4));
}

export function meterStatus(date = new Date()) {
  if (date.getDay() === 0) return { free: true, why: "Sunday" };
  if (isHoliday(date)) return { free: true, why: "holiday" };
  return { free: false, why: "8am–8pm" };
}

let rid = null;
async function resource() {
  if (rid) return rid;
  const r = await fetch("https://data.boston.gov/api/3/action/package_show?id=parking-meters");
  const d = await r.json();
  rid = d.result.resources.find(x => x.datastore_active)?.id;
  return rid;
}

// The dominant real pay policy for meters around a point.
export async function meterRateNear({ lat, lon, radiusDeg = 0.006 } = {}) {
  const id = await resource();
  if (!id) return null;
  const sql = `SELECT "PAY_POLICY", COUNT(*) as n FROM "${id}" ` +
    `WHERE CAST("LATITUDE" AS float) BETWEEN ${lat - radiusDeg} AND ${lat + radiusDeg} ` +
    `AND CAST("LONGITUDE" AS float) BETWEEN ${lon - radiusDeg} AND ${lon + radiusDeg} ` +
    `GROUP BY "PAY_POLICY" ORDER BY n DESC LIMIT 1`;
  const r = await fetch(`${SQL}?sql=${encodeURIComponent(sql)}`);
  if (!r.ok) return null;
  const d = await r.json();
  if (!d.success || !d.result.records.length) return null;

  const policy = d.result.records[0].PAY_POLICY ?? "";
  const rate = /\$(\d+\.\d{2})/.exec(policy)?.[1];
  const mins = /\s(\d{2,3})\s*$/.exec(policy)?.[1];
  return { policy, rate: rate ? `$${rate}` : null, maxMins: mins ? Number(mins) : null, meters: Number(d.result.records[0].n) };
}
