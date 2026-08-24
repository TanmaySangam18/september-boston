import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { TOKENS } from "./design.js";

const D = JSON.parse(readFileSync(new URL("../out/data.json", import.meta.url)));
const SEPT = JSON.parse(readFileSync(new URL("../data/september.json", import.meta.url)));
const out = new URL("../docs/", import.meta.url);
const BASE = "/september-boston";
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const NAV = [
  ["TODAY", ""], ["MOVE IN", "move-in/"], ["SEPTEMBER", "september/"],
  ["BOSTON", "boston/"], ["EVENTS", "events/"], ["THE PASS", "pass/"]
];

const now = new Date();
const ET = d => new Date(d).toLocaleString("en-US", { timeZone: "America/New_York" });
const sept1 = new Date("2026-09-01T00:00:00-04:00");
const daysToSept = Math.ceil((sept1 - now) / 864e5);

function page(title, active, body) {
  const nav = NAV.map(([label, href]) =>
    `<a class="${label === active ? "on" : ""}" href="${BASE}/${href}">${label === active ? '<span class="bullet"></span>' : ""}${label}</a>`).join("");
  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="theme-color" content="#f6f3ec">
<title>${esc(title)}</title>
<meta name="description" content="September in Boston. The month the city starts over.">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="Boston starts over every September.">
<style>${TOKENS}</style></head><body>
<div class="strip"><div class="in mono">${nav}</div></div>
${body}
<div class="wrap"><div class="ft mono">
UPDATED ${esc(ET(D.at).toUpperCase())} ET · REBUILT THREE TIMES A DAY · NO API KEYS<br>
CITY OF BOSTON OPEN DATA · MBTA V3 · NORTHEASTERN AND MIT PUBLIC CALENDARS · OPEN-METEO<br>
DEPOSIT DATES COMPUTED FROM MASSACHUSETTS LAW — SEE MASS.GOV. INFORMATION, NOT LEGAL ADVICE.<br>
OPEN SOURCE · NOTHING ABOUT YOU LEAVES YOUR PHONE
</div></div></body></html>`;
}

const metaStrip = extra => `<div class="wrap"><div class="meta mono">
<span>BOSTON, MA</span><span>42.3601°N 71.0589°W</span>
<span>${esc(now.toLocaleDateString("en-US", { month: "short", day: "2-digit" }).toUpperCase())}</span>
${D.env?.sunset ? `<span>SUNSET ${esc(D.env.sunset)}</span>` : ""}
${extra ?? ""}</div></div>`;

const MOMENTS = [
  ["8:17 AM", "First coffee."],
  ["9:04 AM", "Wrong building."],
  ["9:17 AM", "Found it."],
  ["12:31 PM", "Lunch with people you met yesterday."],
  ["5:48 PM", "Still unpacking."],
  ["8:22 PM", "Roommates are finally starting to talk."],
  ["11:43 PM", "Tomorrow is the first day."]
];

const evWhen = iso => {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { weekday: "short", timeZone: "America/New_York" }).toUpperCase() + " " +
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" }).replace(":00", "").toLowerCase();
};
const hh = t => { if (!t) return ""; const [h, m] = t.split(":").map(Number); const ap = h < 12 ? "am" : "pm"; const hr = h % 12 || 12; return m ? `${hr}.${String(m).padStart(2, "0")}${ap}` : `${hr}${ap}`; };
const dd = s => new Date(s + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });

/* ---------- TODAY ---------- */
function today() {
  const fenway = D.zones.find(z => z.zone === "fenway") ?? D.zones[0];
  const ev = D.events.slice(0, 6);
  return page("September in Boston", "TODAY", `
${metaStrip(`<span>${daysToSept > 0 ? daysToSept + " DAYS TO SEPT 1" : "SEPTEMBER"}</span>`)}
<div class="wrap">
  <h1 class="display">SEPTEMBER</h1>
  <p class="sub">Boston starts over every September. Thousands of people arrive in the same week, move into the same streets, and learn the same city at the same time.</p>

  <div class="sh mono">THE MONTH <span class="c">12 stops</span></div>
  <div class="tl">
    ${SEPT.slice(0, 5).map(s => `<div class="stop">
      <div class="d mono">SEPT ${String(s.day).padStart(2, "0")}</div>
      <div class="h">${esc(s.label)}</div>
      <div class="p">${esc(s.note)}</div></div>`).join("")}
    <div class="stop"><div class="d mono">— </div><div class="h"><a href="${BASE}/september/" style="border-bottom:2px solid var(--brick)">All of September →</a></div></div>
  </div>

  <div class="sh mono">A DAY IN IT</div>
  <div class="moments mono">
    ${MOMENTS.map(([t, l]) => `<div class="moment"><span class="t">${t}</span><span class="l">${esc(l)}</span></div>`).join("")}
  </div>

  <div class="sh mono">TONIGHT AND THIS WEEK <span class="c">campus calendars, live</span></div>
  <div class="grid">
    ${ev.map(e => `<div class="flyer">
      <div class="when mono">${esc(evWhen(e.start))}</div>
      <div class="t">${e.url ? `<a href="${esc(e.url)}">${esc(e.title)}</a>` : esc(e.title)}</div>
      <div class="w">${esc(e.campus)}${e.where ? " · " + esc(e.where) : ""}</div>
      ${e.confirmedPublic ? `<div class="open mono">OPEN TO ANYONE</div>` : ""}
    </div>`).join("")}
  </div>

  <div class="sh mono">YOUR BLOCK <span class="c">${esc(fenway.name)}</span></div>
  <div class="grid">
    ${fenway.sweep ? `<div class="label"><div class="k mono">STREET CLEANING</div>
      <div class="v">${fenway.sweep.offsetDays === 0 ? "Today" : fenway.sweep.offsetDays === 1 ? "Tomorrow" : fenway.sweep.dow}, ${hh(fenway.sweep.start)}.
      ${fenway.sweep.sides.length === 1 && fenway.sweep.sides[0] !== "both" ? fenway.sweep.sides[0] + " side." : "Both sides."}
      A ticket is $40.</div></div>` : ""}
    ${fenway.trashDay ? `<div class="label"><div class="k mono">TRASH</div><div class="v">${esc(fenway.trashDay)}. Out after 5pm the night before.</div></div>` : ""}
    <div class="label"><div class="k mono">STORROW DRIVE</div><div class="v">Clearance drops to 9 feet. Your rental truck is 12. Do not.</div></div>
  </div>

  <div class="sh mono">FROM YOUR STOP <span class="c">MBTA, live</span></div>
  ${fenway.transit ? `<div class="sched">
    ${fenway.transit.departures.list.map(d => `<div class="r"><span class="w mono">${esc(d.at)}</span>
      <div class="b"><div class="t">${esc(d.short ?? d.route)}${d.headsign ? " → " + esc(d.headsign) : ""}</div>
      <div class="s">${esc(fenway.transit.station.name)}${d.inMinutes != null ? " · " + d.inMinutes + " min" : " · scheduled"}</div></div></div>`).join("")}
    <div class="r"><span class="w mono">SERVICE</span><div class="b"><div class="t">${fenway.transit.service.normal ? "Normal service" : esc(fenway.transit.service.alerts[0]?.header ?? "Alerts in effect")}</div></div></div>
  </div>` : `<div class="label"><div class="v">No live departures right now.</div></div>`}

  <div class="sh mono">TRUCKS OUT TODAY <span class="c">city schedule</span></div>
  <div class="sched">
    ${D.trucks.slice(0, 6).map(t => `<div class="r"><span class="w mono">${esc(t.hours ?? "")}</span>
      <div class="b"><div class="t">${esc(t.truck)}</div><div class="s">${esc(t.where)}${t.hood ? " · " + esc(t.hood) : ""}</div></div></div>`).join("")}
  </div>
</div>`);
}

/* ---------- MOVE IN ---------- */
function moveIn() {
  return page("Move in · September in Boston", "MOVE IN", `
${metaStrip(`<span>SEPT 01</span>`)}
<div class="wrap">
  <h1 class="display" style="font-size:clamp(48px,10vw,110px)">MOVE&nbsp;IN</h1>
  <p class="sub">One day, most of the city. Here is what costs you money if you get it wrong.</p>

  <div class="sh mono">BEFORE YOU UNPACK</div>
  <div class="idc">
    <div class="k mono">MASSACHUSETTS LAW</div>
    <div class="n">Photograph every room before you unpack.</div>
    <div class="row mono">
      <div><div class="k">MOVE IN</div><div class="v">${dd(D.clock.moveIn)}</div></div>
      <div><div class="k">STATEMENT DUE</div><div class="v">${dd(D.clock.statementDue)}</div></div>
      <div><div class="k">CONTEST BY</div><div class="v">${dd(D.clock.contestBy)}</div></div>
      <div><div class="k">ESCROW BY</div><div class="v">${dd(D.clock.escrowBy)}</div></div>
    </div>
  </div>
  <p class="sub" style="font-size:15px;max-width:34em">Your landlord owes you a signed Statement of Condition within ten days. Your photographs are what protect the deposit if it never arrives.</p>

  <div class="sh mono">THE TRUCK</div>
  <div class="grid">
    <div class="label"><div class="k mono">STORROW DRIVE</div><div class="v">Clearance drops to 9 feet. Rental trucks are 11 to 13'6". This happens every September and it is entirely avoidable.</div></div>
    <div class="label"><div class="k mono">PERMIT WINDOW</div><div class="v">Online closes 15 days out. Under that, City Hall in person, 2nd floor, at least 3 days ahead. $69 for two spaces, $109 with meters.</div></div>
    <div class="label"><div class="k mono">SIGNS</div><div class="v">Posted 48 hours before, or the space isn't held.</div></div>
  </div>

  <div class="sh mono">WHERE YOU WILL GET TICKETED <span class="c">street cleaning, by neighbourhood</span></div>
  <div class="sched">
    ${D.zones.filter(z => z.sweep).map(z => `<div class="r">
      <span class="w mono">${z.sweep.offsetDays === 0 ? "TODAY" : z.sweep.offsetDays === 1 ? "TMRW" : z.sweep.dow.toUpperCase()}</span>
      <div class="b"><div class="t">${esc(z.name)}</div>
      <div class="s">${hh(z.sweep.start)}–${hh(z.sweep.end)} · ${z.sweep.count} street${z.sweep.count === 1 ? "" : "s"} · ${esc(z.sweep.sides.join(" and "))} side</div></div></div>`).join("")}
  </div>
</div>`);
}

/* ---------- SEPTEMBER ---------- */
function september() {
  const todayDay = now.getMonth() === 8 ? now.getDate() : 0;
  return page("All of September · Boston", "SEPTEMBER", `
${metaStrip()}
<div class="wrap">
  <h1 class="display" style="font-size:clamp(52px,11vw,124px)">THE MONTH</h1>
  <p class="sub">Thirty days, in order. Walk down it.</p>
  <div class="sh mono">SEPTEMBER 2026</div>
  <div class="tl">
    ${SEPT.map(s => `<div class="stop${s.day === todayDay ? " now" : ""}">
      <div class="d mono">SEPT ${String(s.day).padStart(2, "0")}${s.day === todayDay ? " · TODAY" : ""}</div>
      <div class="h">${esc(s.label)}</div>
      <div class="p">${esc(s.note)}</div></div>`).join("")}
  </div>
</div>`);
}

/* ---------- BOSTON ---------- */
function boston() {
  return page("Boston · a student's map", "BOSTON", `
${metaStrip()}
<div class="wrap">
  <h1 class="display" style="font-size:clamp(52px,11vw,124px)">BOSTON</h1>
  <p class="sub">You don't know it yet. That's the point. Twelve neighbourhoods, and what each one actually asks of you.</p>
  <div class="sh mono">NEIGHBOURHOODS <span class="c">${D.zones.length}</span></div>
  <div class="grid">
    ${D.zones.map(z => `<div class="art">
      <div class="k mono">${esc((z.name || "").toUpperCase())}</div>
      <div class="n">${z.sweep ? (z.sweep.offsetDays === 0 ? "Cleaning today" : z.sweep.offsetDays === 1 ? "Cleaning tomorrow" : "Cleaning " + z.sweep.dow) : "No cleaning this week"}</div>
      <div class="s">${z.sweep ? `${hh(z.sweep.start)}–${hh(z.sweep.end)} · ${z.sweep.count} streets · ${esc(z.sweep.sides.join(" and "))} side` : "Nothing to move."}${z.trashDay ? `<br>Trash ${esc(z.trashDay)}.` : ""}</div>
      <div class="f mono">${z.lat.toFixed(4)}°N ${Math.abs(z.lon).toFixed(4)}°W</div>
    </div>`).join("")}
  </div>
</div>`);
}

/* ---------- EVENTS ---------- */
function events() {
  return page("Something's happening tonight · Boston", "EVENTS", `
${metaStrip(`<span>${D.events.length} OPEN EVENTS</span>`)}
<div class="wrap">
  <h1 class="display" style="font-size:clamp(44px,9vw,96px)">SOMETHING'S<br>HAPPENING<br>TONIGHT</h1>
  <p class="sub">Pulled from campus calendars, filtered to what's open by nature — games, exhibits, talks, outdoor things.</p>
  <div class="sh mono">NEXT TWO WEEKS <span class="c">live</span></div>
  <div class="grid">
    ${D.events.map(e => `<div class="flyer">
      <div class="when mono">${esc(evWhen(e.start))}</div>
      <div class="t">${e.url ? `<a href="${esc(e.url)}">${esc(e.title)}</a>` : esc(e.title)}</div>
      <div class="w">${esc(e.campus)}${e.where ? " · " + esc(e.where) : ""}</div>
      ${e.cats ? `<div class="w mono" style="font-size:10.5px;color:var(--ink-3);margin-top:6px">${esc(e.cats)}</div>` : ""}
      ${e.confirmedPublic ? `<div class="open mono">OPEN TO ANYONE</div>` : ""}
    </div>`).join("")}
  </div>
  <p class="sub" style="font-size:14px;max-width:38em">Not every campus event admits outsiders, and some need an ID to get into the building. Tap the title and check before you travel across the city.</p>
</div>`);
}

/* ---------- THE PASS ---------- */
function passPage() {
  const z = D.zones.find(x => x.transit?.departures?.list?.length) ?? D.zones[0];
  const t = z.transit;
  const next = t?.departures?.list?.[0];
  const rest = (t?.departures?.list ?? []).slice(1, 3);
  return page("The pass · September in Boston", "THE PASS", `
${metaStrip(`<span>WALLET</span>`)}
<div class="wrap">
  <h1 class="display" style="font-size:clamp(46px,9.5vw,104px)">THE PASS</h1>
  <p class="sub">The website is where you find out about September. The pass is where you live in it. One card, on your lock screen, that knows your stop.</p>

  <div class="sh mono">WHAT IT SAYS RIGHT NOW <span class="c">real data, this minute</span></div>
  <div style="max-width:400px">
    <div class="idc">
      <div class="k mono">SEPTEMBER IN BOSTON</div>
      <div class="row mono" style="border-top:none;margin-top:9px;padding-top:0">
        <div style="flex:1"><div class="k">${esc((z.name || "").toUpperCase())}</div>
          <div class="v" style="font-size:19px;font-weight:640">${next ? esc((next.short ?? next.route) + (next.headsign ? " → " + next.headsign : "")) : "Your day"}</div></div>
        <div style="text-align:right"><div class="k">NEXT</div><div class="v" style="font-size:19px;font-weight:640">${next ? esc(next.at) : "—"}</div></div>
      </div>
      <div class="row mono">
        <div><div class="k">TODAY</div><div class="v">${daysToSept > 0 ? daysToSept + " days out" : "Sept " + now.getDate()}</div></div>
        <div><div class="k">WEATHER</div><div class="v">${D.env?.aqi != null ? "AQI " + D.env.aqi : "—"}</div></div>
        <div><div class="k">SERVICE</div><div class="v">${t?.service?.normal ? "Normal" : (t?.service?.urgent ? "Alert" : "Delays")}</div></div>
      </div>
      <div class="row mono">
        <div><div class="k">THEN</div><div class="v">${rest.length ? rest.map(d => esc(d.at)).join("  ") : "—"}</div></div>
        <div><div class="k">FROM</div><div class="v">${esc(t?.station?.name ?? "—")}</div></div>
      </div>
    </div>
  </div>

  <div class="sh mono">HOW YOU GET IT</div>
  <div class="tl">
    <div class="stop"><div class="d mono">ONE</div><div class="h">Pick your neighbourhood</div>
      <div class="p">That sets your stop, your street cleaning and your geofences. Nothing else is asked.</div></div>
    <div class="stop"><div class="d mono">TWO</div><div class="h">Add to Apple Wallet</div>
      <div class="p">One tap, on Apple's own sheet. No account, no app, no email. A QR or a text link does the same thing.</div></div>
    <div class="stop"><div class="d mono">THREE</div><div class="h">Done</div>
      <div class="p">It appears on your lock screen near your stop. Remove it any time and everything stops.</div></div>
  </div>

  <div class="sh mono">WHEN IT UPDATES <span class="c">and when it deliberately doesn't</span></div>
  <div class="grid">
    <div class="label"><div class="k mono">STATIC</div><div class="v">School, neighbourhood, saved route, your deposit dates. Changes only when you change them.</div></div>
    <div class="label"><div class="k mono">FREQUENT</div><div class="v">Next departure, weather, today's events. Refreshed quietly, and only pushed if it has been a while.</div></div>
    <div class="label"><div class="k mono">URGENT</div><div class="v">Suspensions, shuttles, station closures. These push straight away, because that is the whole point.</div></div>
  </div>
  <p class="sub" style="font-size:15px;max-width:36em">A pass that pings every time a train moves is a notification stream, not a companion. The tiering exists so it stays worth keeping.</p>

  <div class="sh mono">WHAT IS ACTUALLY BUILT</div>
  <div class="sched">
    <div class="r"><span class="w mono">DONE</span><div class="b"><div class="t">Live departures and alerts for all 12 neighbourhoods</div><div class="s">MBTA v3, keyless, one alerts call filtered locally</div></div></div>
    <div class="r"><span class="w mono">DONE</span><div class="b"><div class="t">The pass payload, front and back</div><div class="s">Header, primary, six fields, nine back rows, geofences, QR</div></div></div>
    <div class="r"><span class="w mono">DONE</span><div class="b"><div class="t">The three-tier push classifier</div><div class="s">Urgent pushes immediately; frequent is throttled; nothing pushes when nothing changed</div></div></div>
    <div class="r"><span class="w mono">NEEDED</span><div class="b"><div class="t">An Apple signing certificate</div><div class="s">$99 a year. Without it a pass cannot be signed, and an unsigned pass will not install. That is the only thing missing.</div></div></div>
  </div>
</div>`);
}

mkdirSync(out, { recursive: true });
writeFileSync(new URL(".nojekyll", out), "");
writeFileSync(new URL("index.html", out), today());
for (const [dir, fn] of [["move-in", moveIn], ["september", september], ["boston", boston], ["events", events], ["pass", passPage]]) {
  mkdirSync(new URL(dir + "/", out), { recursive: true });
  writeFileSync(new URL(dir + "/index.html", out), fn());
}
console.log("built 6 pages → docs/");
