// 399k addresses; we only need the dominant collection day per neighbourhood.
const RESOURCE = "d21a6a17-e8f4-4b56-b3dc-0b8ea5f7d723";
const SQL = "https://data.boston.gov/api/3/action/datastore_search_sql";

async function resolveResource() {
  const r = await fetch("https://data.boston.gov/api/3/action/package_show?id=trash-schedules-by-address");
  const d = await r.json();
  const res = d.result.resources.find(x => x.datastore_active);
  return res?.id;
}

export async function trashDays() {
  const rid = await resolveResource();
  if (!rid) throw new Error("trash: no datastore resource");
  const sql = `SELECT "mailing_neighborhood", "trashday", COUNT(*) as n FROM "${rid}" ` +
    `GROUP BY "mailing_neighborhood", "trashday" ORDER BY "mailing_neighborhood", n DESC`;
  const r = await fetch(`${SQL}?sql=${encodeURIComponent(sql)}`);
  if (!r.ok) throw new Error(`trash ${r.status}`);
  const d = await r.json();
  if (!d.success) throw new Error("trash: sql rejected");

  const best = {};
  for (const row of d.result.records) {
    const hood = row.mailing_neighborhood;
    if (!hood || !row.trashday) continue;
    if (!best[hood]) best[hood] = { day: row.trashday, n: Number(row.n) };
  }
  return best;
}
