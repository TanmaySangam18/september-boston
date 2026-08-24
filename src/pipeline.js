import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { nextSweepDay } from "./sources/sweeping.js";
import { trashDays } from "./sources/trash.js";
import { plannedClosures } from "./sources/mbta.js";
import { trucksToday } from "./sources/foodtrucks.js";
import { campusEvents } from "./sources/events.js";
import { fetchEnv } from "./sources/env.js";
import { departures, allAlerts, statusForStop } from "./sources/transit.js";

const settle = p => p.then(v => v).catch(e => { console.warn("  ! " + e.message); return null; });

export function clockFrom(moveIn) {
  const d = new Date(moveIn + "T12:00:00");
  const plus = n => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  return { moveIn, statementDue: plus(10), contestBy: plus(25), escrowBy: plus(30) };
}

const run = async () => {
  const t0 = Date.now();
  const zones = JSON.parse(readFileSync(new URL("../data/zones.json", import.meta.url)));
  console.log("fetching");
  const alerts = await allAlerts().catch(e => { console.warn("  ! alerts: " + e.message); return []; });
  const [trash, closures, trucks, events, env] = await Promise.all([
    settle(trashDays()), settle(plannedClosures()), settle(trucksToday()),
    settle(campusEvents({ days: 14, limit: 60 })), settle(fetchEnv())
  ]);
  console.log(`  ${events?.length ?? 0} open events · ${trucks?.length ?? 0} trucks · ${closures?.length ?? 0} T closures · env ${env ? "ok" : "-"}`);

  const today = new Date();
  const built = [];
  const pause = ms => new Promise(r => setTimeout(r, ms));
  for (const z of zones) {
    const sweep = await nextSweepDay(z.dist, today).catch(() => null);

    // Stations never move, so they are baked into zones.json. Only the live
    // parts are fetched, and keyless MBTA allows ~20 requests a minute.
    let transit = null;
    if (z.stopId) {
      try {
        const dep = await departures(z.stopId, 3);
        const routes = [...new Set(dep.list.map(d => d.short).filter(Boolean))];
        const svc = statusForStop(alerts, z.stopId, routes);
        transit = { station: { id: z.stopId, name: z.stopName }, departures: dep, service: svc };
      } catch (e) { console.warn(`  ! transit ${z.name}: ${e.message}`); }
      await pause(1500);
    }
    built.push({
      zone: z.id, name: z.name, lat: z.lat, lon: z.lon,
      trashDay: trash?.[z.trashHood]?.day ?? null,
      transit,
      sweep: sweep ? {
        offsetDays: sweep.offsetDays,
        dow: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][sweep.date.getDay()],
        start: sweep.streets[0]?.start, end: sweep.streets[0]?.end,
        count: sweep.streets.length,
        sides: [...new Set(sweep.streets.map(s => s.side || "both"))]
      } : null
    });
    const t = transit;
    console.log(`  ${z.name.padEnd(18)} ${t?.station?.name ?? "no stop"} · ${t?.departures?.list?.length ?? 0} dep · ${t?.service ? (t.service.normal ? "normal" : (t.service.urgent ? "URGENT" : "alerts")) : "-"}`);
  }

  mkdirSync(new URL("../out/", import.meta.url), { recursive: true });
  writeFileSync(new URL("../out/data.json", import.meta.url), JSON.stringify({
    at: new Date().toISOString(),
    clock: clockFrom("2026-09-01"),
    events: events ?? [], trucks: trucks ?? [], closures: (closures ?? []).slice(0, 4),
    env, zones: built
  }, null, 2));
  console.log(`built ${built.length} zones in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
};

if (import.meta.url === `file://${process.argv[1]}`) run();
