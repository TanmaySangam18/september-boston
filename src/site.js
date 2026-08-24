import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { TOKENS } from "./design.js";
import { experienceCSS } from "./experience.js";

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
<style>${TOKENS}${experienceCSS()}</style></head><body>
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
  const zones = D.zones.map(z => ({
    id: z.zone, name: z.name, station: z.transit?.station?.name ?? null,
    deps: (z.transit?.departures?.list ?? []).map(d => ({ at: d.at, short: d.short ?? d.route, head: d.headsign, mins: d.inMinutes })),
    normal: z.transit?.service?.normal ?? true
  }));
  const SCHOOLS = ["Northeastern", "Boston University", "MIT", "Harvard", "Emerson", "Berklee", "Suffolk", "UMass Boston", "Tufts", "BC"];

  return page("Take September with you", "THE PASS", `
${metaStrip(`<span>WALLET</span>`)}
<div class="stage">
  <h1 class="display" style="font-size:clamp(42px,8.6vw,96px)">TAKE SEPTEMBER<br>WITH YOU</h1>
  <p class="sub">Your Boston, on your lock screen. One card that knows your stop, your street and your month.</p>
</div>

<div class="stage">
  <div class="step">
    <div class="no mono">ONE</div>
    <h2>Your September</h2>
    <p class="k">Three choices. Nothing else is asked, and no account is made.</p>
    <div class="picks">
      <div class="pick"><label class="mono">SCHOOL</label>
        <select id="school">${SCHOOLS.map(x => `<option>${esc(x)}</option>`).join("")}</select></div>
      <div class="pick"><label class="mono">NEIGHBOURHOOD</label>
        <select id="area">${zones.map(z => `<option value="${esc(z.id)}">${esc(z.name)}</option>`).join("")}</select></div>
      <div class="pick"><label class="mono">MOVE-IN</label>
        <select id="movein"><option value="2026-09-01">Sept 1</option><option value="2026-09-03">Sept 3</option><option value="2026-09-05">Sept 5</option><option value="2026-08-28">Aug 28</option></select></div>
    </div>
    <div class="addwrap">
      <button class="addbtn" id="add"><span class="apl"></span><span class="tx"><b>Add to Apple Wallet</b><span>SEPTEMBER IN BOSTON</span></span></button>
      <span class="hint" id="hint">One tap. No app, no signup.</span>
    </div>
  </div>

  <div class="step" id="livestep" style="display:none">
    <div class="no mono">TWO</div>
    <h2>On your phone</h2>
    <p class="k">It sits on the lock screen near your stop. Change what's happening on the T and watch it keep up.</p>
    <div class="phonewrap">
      <div class="phone"><div class="notch"></div><div class="lock">
        <div class="clock"><div class="t mono" id="clk">8:41</div><div class="d" id="clkd">Tuesday, September 8</div></div>
        <div class="notif" id="notif">
          <div class="hd"><span class="ic">S</span><span>SEPTEMBER IN BOSTON</span><span style="margin-left:auto" id="ntime">now</span></div>
          <div class="ti" id="ntitle">Green Line — service disruption</div>
          <div class="bo" id="nbody">Expect delays. Consider an alternate route.</div>
        </div>
        <div class="pass" id="pass">
          <div id="frontface">
            <div class="top"><span class="lg mono">SEPTEMBER</span>
              <div class="hf"><div class="k mono">NEXT</div><div class="v mono" id="pNext">8:42 AM</div></div></div>
            <div class="prim"><div class="k mono" id="pArea">BACK BAY</div><div class="v" id="pRoute">Green Line → Downtown</div></div>
            <div class="fields"><div><div class="k mono">TODAY</div><div class="v" id="pToday">Tue, Sept 8</div></div>
              <div><div class="k mono">WEATHER</div><div class="v" id="pWx">72° Sunny</div></div>
              <div><div class="k mono">THEN</div><div class="v mono" id="pThen">8:54</div></div></div>
            <div class="strip"><span class="dot"></span><span id="pStatus">On schedule</span></div>
            <div class="qr"><svg viewBox="0 0 40 40" width="74" height="74" aria-hidden="true"><rect width="40" height="40" fill="#f6f3ec"/><g fill="#1b2a41"><rect x="2" y="2" width="10" height="10"/><rect x="4" y="4" width="6" height="6" fill="#f6f3ec"/><rect x="5" y="5" width="4" height="4"/><rect x="28" y="2" width="10" height="10"/><rect x="30" y="4" width="6" height="6" fill="#f6f3ec"/><rect x="31" y="5" width="4" height="4"/><rect x="2" y="28" width="10" height="10"/><rect x="4" y="30" width="6" height="6" fill="#f6f3ec"/><rect x="5" y="31" width="4" height="4"/><rect x="15" y="4" width="3" height="3"/><rect x="21" y="6" width="3" height="3"/><rect x="16" y="11" width="3" height="3"/><rect x="22" y="13" width="3" height="3"/><rect x="5" y="16" width="3" height="3"/><rect x="11" y="21" width="3" height="3"/><rect x="17" y="18" width="4" height="4"/><rect x="24" y="17" width="3" height="3"/><rect x="30" y="19" width="4" height="3"/><rect x="16" y="25" width="3" height="4"/><rect x="23" y="26" width="4" height="3"/><rect x="29" y="25" width="3" height="4"/><rect x="17" y="32" width="4" height="3"/><rect x="24" y="31" width="3" height="4"/><rect x="30" y="32" width="4" height="3"/><rect x="17" y="36" width="3" height="2"/><rect x="25" y="36" width="4" height="2"/><rect x="32" y="36" width="3" height="2"/></g></svg></div>
          </div>
          <div id="backface" style="display:none"><div class="back">
            <div class="r"><div class="k mono">YOUR SEPTEMBER</div><div class="v" id="bSept">Northeastern · Back Bay · Green Line</div></div>
            <div class="r"><div class="k mono">YOUR DEPOSIT</div><div class="v" id="bDep">Statement of Condition due Sept 11. Contest by Sept 26. Photograph every room before you unpack.</div></div>
            <div class="r"><div class="k mono">QUICK LINKS</div><div class="v">Campus · MBTA · Events · September Guide</div></div>
            <div class="r"><div class="k mono">ABOUT</div><div class="v">Your day in Boston, kept current. Departures from your saved stop, service on your line, and the dates that matter this month.</div></div>
            <div class="r"><div class="k mono">SUPPORT</div><div class="v">hello@septemberinboston.com<br>septemberinboston.com/help</div></div>
            <div class="r"><div class="k mono">PRIVACY</div><div class="v">This pass never sends your location anywhere. Your phone checks the areas on it by itself. Remove it any time.</div></div>
          </div></div>
        </div>
        <button class="flipbtn" id="flip" style="color:#c9d3de;border-color:#3a4a5c">Turn the pass over</button>
      </div></div>

      <div class="ctl">
        <div class="hd mono">THE DAY</div>
        <div class="states" id="states"></div>
        <div class="hd mono">SIMULATE</div>
        <button class="sim" id="sim">MBTA reports a Green Line disruption</button>
        <div class="log" id="log"></div>
      </div>
    </div>
  </div>
</div>

<script>
const ZONES = ${JSON.stringify(zones)};
const el = id => document.getElementById(id);
const pass = el("pass");

const STATES = {
  normal:  { label:"Normal",          status:"On schedule",                     cls:"",      next:null },
  minor:   { label:"Minor delays",    status:"Minor delays",                    cls:"warn",  bump:5 },
  major:   { label:"Disruption",      status:"Service disruption — consider an alternate route", cls:"bad", bump:0 },
  none:    { label:"No service",      status:"No upcoming departures",          cls:"",      next:"—" },
  morning: { label:"Morning",         status:"On schedule · first class 9:00 AM", cls:"",    next:null },
  movein:  { label:"Move-in day",     status:"Move-in day · truck permit 10:00 AM", cls:"", next:null }
};
let state = "normal";

const to12 = t => { if(!t||t==="—") return t||"—"; const [h,m]=t.split(":").map(Number);
  const ap=h<12?"AM":"PM"; return (h%12||12)+":"+String(m).padStart(2,"0")+" "+ap; };
const bump = (t,n) => { if(!t) return t; const [h,m]=t.split(":").map(Number);
  const d=new Date(2026,8,8,h,m+n); return String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0"); };

function render() {
  const z = ZONES.find(x => x.id === el("area").value) || ZONES[0];
  const s = STATES[state];
  const d0 = z.deps[0], d1 = z.deps[1];
  const base = d0 ? d0.at : null;
  const shown = s.next !== null && s.next !== undefined ? s.next
              : (s.bump !== undefined && base ? to12(bump(base, s.bump)) : (base ? to12(base) : "—"));

  el("pArea").textContent = (z.name || "").toUpperCase();
  el("pRoute").textContent = d0 ? (d0.short + (d0.head ? " → " + d0.head : "")) : (z.station || "Your day");
  el("pNext").textContent = shown;
  el("pThen").textContent = d1 ? d1.at : "—";
  el("pStatus").textContent = s.status;
  el("pToday").textContent = state === "movein" ? "Move-in" : "Tue, Sept 8";
  pass.className = "pass " + (s.cls || "");
  el("bSept").textContent = el("school").value + " · " + z.name + (z.station ? " · " + z.station : "");
  const mi = el("movein").value, dt = new Date(mi + "T12:00:00");
  const plus = n => { const x=new Date(dt); x.setDate(x.getDate()+n);
    return x.toLocaleDateString("en-US",{month:"short",day:"numeric"}); };
  el("bDep").textContent = "Statement of Condition due " + plus(10) + ". Contest by " + plus(25) + ". Photograph every room before you unpack.";
}

el("states").innerHTML = Object.entries(STATES).map(([k,v]) =>
  '<button class="stbtn' + (k===state?" on":"") + '" data-s="' + k + '">' + v.label + '</button>').join("");
el("states").addEventListener("click", e => {
  const b = e.target.closest(".stbtn"); if(!b) return;
  state = b.dataset.s;
  [...el("states").children].forEach(x => x.classList.toggle("on", x.dataset.s === state));
  render();
});

el("add").addEventListener("click", () => {
  el("hint").textContent = "Added to Wallet.";
  el("livestep").style.display = "";
  render();
  el("livestep").scrollIntoView({ behavior:"smooth", block:"start" });
});

el("flip").addEventListener("click", () => {
  const back = el("backface").style.display === "none";
  el("frontface").style.display = back ? "none" : "";
  el("backface").style.display = back ? "" : "none";
  el("flip").textContent = back ? "Turn it back" : "Turn the pass over";
});

["area","school","movein"].forEach(id => el(id).addEventListener("change", render));

const LOG = [
  ["10:14", "MBTA reports a Green Line disruption."],
  ["10:14", "Our backend picks up the alert."],
  ["10:14", "Urgent tier — the pass is rewritten."],
  ["10:15", "Apple Push Notification sent to the device."],
  ["10:15", "Wallet fetches the new version."]
];
el("sim").addEventListener("click", () => {
  const btn = el("sim"); btn.disabled = true;
  el("log").innerHTML = LOG.map(([t,m]) =>
    '<div class="e"><span class="t mono">' + t + ' AM</span><span class="m">' + m + '</span></div>').join("");
  const rows = [...el("log").children];
  rows.forEach((r,i) => setTimeout(() => r.classList.add("in"), 260 * i));
  setTimeout(() => { state = "major";
    [...el("states").children].forEach(x => x.classList.toggle("on", x.dataset.s === "major"));
    render();
  }, 260 * 3);
  setTimeout(() => {
    el("ntitle").textContent = "Green Line — service disruption";
    el("nbody").textContent = "Expect delays. Consider an alternate route.";
    el("ntime").textContent = "10:15 AM";
    el("clk").textContent = "10:15";
    el("notif").classList.add("in");
  }, 260 * 4);
  setTimeout(() => { btn.disabled = false; btn.textContent = "Run it again"; }, 260 * 6);
});

render();
</script>`);
}

mkdirSync(out, { recursive: true });
writeFileSync(new URL(".nojekyll", out), "");
writeFileSync(new URL("index.html", out), today());
for (const [dir, fn] of [["move-in", moveIn], ["september", september], ["boston", boston], ["events", events], ["pass", passPage]]) {
  mkdirSync(new URL(dir + "/", out), { recursive: true });
  writeFileSync(new URL(dir + "/index.html", out), fn());
}
console.log("built 6 pages → docs/");
