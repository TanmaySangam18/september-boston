// Real-time delays are already solved by Maps and Transit. What nobody pushes
// is the planned shutdown announced weeks out, so that's all we carry.
const PLANNED = new Set(["SHUTTLE", "SUSPENSION", "STATION_CLOSURE", "DETOUR"]);

export async function plannedClosures({ minDays = 2 } = {}) {
  const url = "https://api-v3.mbta.com/alerts?filter%5Broute_type%5D=0,1&page%5Blimit%5D=60";
  const r = await fetch(url);
  if (!r.ok) throw new Error(`mbta ${r.status}`);
  const d = await r.json();

  const now = Date.now();
  const out = [];
  for (const a of d.data ?? []) {
    const at = a.attributes ?? {};
    if (!PLANNED.has(at.effect)) continue;
    const periods = at.active_period ?? [];
    const spans = periods.some(p => {
      const start = p.start ? Date.parse(p.start) : now;
      const end = p.end ? Date.parse(p.end) : start + 30 * 864e5;
      return (end - start) >= minDays * 864e5 || start > now + 864e5;
    });
    if (!spans) continue;
    out.push({
      header: (at.header ?? "").replace(/\s+/g, " ").trim(),
      effect: at.effect,
      starts: periods[0]?.start ?? null
    });
  }
  const seen = new Set();
  return out.filter(x => !seen.has(x.header) && seen.add(x.header)).slice(0, 6);
}
