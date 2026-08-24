import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { TOKENS } from "./design.js";

const D = JSON.parse(readFileSync(new URL("../out/data.json", import.meta.url)));
const SEPT = JSON.parse(readFileSync(new URL("../data/september.json", import.meta.url)));
const out = new URL("../docs/", import.meta.url);
const BASE = "/september-boston";
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const NAV = [
  ["TODAY", ""], ["MOVE IN", "move-in/"], ["SEPTEMBER", "september/"],
  ["BOSTON", "boston/"], ["EVENTS", "events/"]
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

mkdirSync(out, { recursive: true });
writeFileSync(new URL(".nojekyll", out), "");
writeFileSync(new URL("index.html", out), today());
for (const [dir, fn] of [["move-in", moveIn], ["september", september], ["boston", boston], ["events", events]]) {
  mkdirSync(new URL(dir + "/", out), { recursive: true });
  writeFileSync(new URL(dir + "/index.html", out), fn());
}
console.log("built 5 pages → docs/");
