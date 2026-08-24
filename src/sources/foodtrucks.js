// 106 scheduled trucks with day, meal, location, hours and an Instagram link.
const SQL = "https://data.boston.gov/api/3/action/datastore_search_sql";

async function rid() {
  const r = await fetch("https://data.boston.gov/api/3/action/package_show?id=food-truck-schedule");
  const d = await r.json();
  return d.result.resources.find(x => x.datastore_active)?.id;
}

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export async function trucksToday(date = new Date()) {
  const id = await rid();
  if (!id) throw new Error("food trucks: no datastore");
  const day = DOW[date.getDay()];
  const sql = `SELECT "Day","Time","Truck","Location","Pinpoint","Hours","Link" FROM "${id}" WHERE "Day" = '${day}'`;
  const r = await fetch(`${SQL}?sql=${encodeURIComponent(sql)}`);
  if (!r.ok) throw new Error(`food trucks ${r.status}`);
  const d = await r.json();
  if (!d.success) throw new Error("food trucks: sql rejected");
  return d.result.records.map(x => ({
    truck: x.Truck, meal: x.Time, where: x.Location,
    hood: x.Pinpoint, hours: x.Hours, link: x.Link
  }));
}
