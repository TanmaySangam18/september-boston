// The city declares snow emergencies by announcement, not by feed. So the flag
// is manual; what IS in the data portal is the list of lots you can park in free.
const SQL = "https://data.boston.gov/api/3/action/datastore_search_sql";

export function banActive() {
  return process.env.SNOW_BAN === "on";
}

export async function freeLots() {
  const r = await fetch("https://data.boston.gov/api/3/action/package_show?id=snow-emergency-parking");
  const d = await r.json();
  const rid = d.result.resources.find(x => x.datastore_active)?.id;
  if (!rid) return [];
  const sql = `SELECT "Name","Address","Neighborho","Spaces","Fee","Hours" FROM "${rid}"`;
  const res = await fetch(`${SQL}?sql=${encodeURIComponent(sql)}`);
  if (!res.ok) return [];
  const j = await res.json();
  if (!j.success) return [];
  return j.result.records.map(x => ({
    name: x.Name, address: x.Address, hood: x.Neighborho,
    spaces: Number(x.Spaces) || null, fee: x.Fee, hours: x.Hours
  }));
}
