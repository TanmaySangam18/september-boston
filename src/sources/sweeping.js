// Boston street sweeping. The dataset encodes a recurring schedule:
// week_1..week_5 = which occurrence of that weekday in the month,
// sunday..saturday = which weekday. So a row fires when both match.
const RESOURCE = "9fdbdcad-67c8-4b23-b6ec-861e77d56227";
const SQL = "https://data.boston.gov/api/3/action/datastore_search_sql";

import { isHoliday } from "./meters.js";

const DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const T = v => v === "t" || v === true;

// The City's daytime program runs Apr 1 – Nov 30 for every neighbourhood
// EXCEPT the North End, South End and Beacon Hill, which run on their own
// schedule all year. The dataset's year_round flag does not capture this —
// North End rows are all flagged f — so the exemption is encoded here.
const ALL_YEAR_HOODS = new Set(["North End", "South End", "Beacon Hill"]);

function inSeason(date, distName) {
  if (ALL_YEAR_HOODS.has(distName)) return true;
  const m = date.getMonth() + 1;
  return m >= 4 && m <= 11;
}

function occurrenceOfWeekday(date) {
  return Math.floor((date.getDate() - 1) / 7) + 1;   // 1st..5th Thursday etc
}

let cache = null;

async function allRows() {
  if (cache) return cache;
  const sql = `SELECT "st_name","dist_name","side","start_time","end_time","from","to",` +
    `"week_1","week_2","week_3","week_4","week_5",` +
    `"sunday","monday","tuesday","wednesday","thursday","friday","saturday",` +
    `"every_day","year_round" FROM "${RESOURCE}"`;
  const r = await fetch(`${SQL}?sql=${encodeURIComponent(sql)}`);
  if (!r.ok) throw new Error(`boston sweeping ${r.status}`);
  const d = await r.json();
  if (!d.success) throw new Error("boston sweeping: sql rejected");
  cache = d.result.records;
  return cache;
}

export function firesOn(row, date) {
  // Boston suspends street cleaning on legal holidays.
  if (isHoliday(date)) return false;
  if (!T(row.year_round) && !inSeason(date, row.dist_name)) return false;
  if (T(row.every_day)) return true;
  if (!T(row[DAYS[date.getDay()]])) return false;
  const occ = occurrenceOfWeekday(date);
  if (T(row[`week_${occ}`])) return true;
  // some rows set no week flags at all, meaning every week
  return ![1, 2, 3, 4, 5].some(n => T(row[`week_${n}`]));
}

export async function sweepingFor(date, distName) {
  const rows = await allRows();
  return rows
    .filter(r => r.dist_name === distName && firesOn(r, date))
    .map(r => ({
      street: r.st_name,
      side: r.side,
      from: r.from,
      to: r.to,
      start: (r.start_time ?? "").slice(0, 5),
      end: (r.end_time ?? "").slice(0, 5)
    }))
    .sort((a, b) => a.street.localeCompare(b.street));
}

export async function nextSweepDay(distName, fromDate = new Date(), horizon = 14) {
  for (let i = 0; i <= horizon; i++) {
    const d = new Date(fromDate);
    d.setDate(d.getDate() + i);
    const hits = await sweepingFor(d, distName);
    if (hits.length) return { date: d, offsetDays: i, streets: hits };
  }
  return null;
}
