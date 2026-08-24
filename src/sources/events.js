// Campus calendars publish public iCal. Northeastern and MIT both serve
// text/calendar with SUMMARY, DTSTART, LOCATION, DESCRIPTION and URL.
const FEEDS = [
  { id: "neu", label: "Northeastern", url: "https://calendar.northeastern.edu/calendar.ics" },
  { id: "mit", label: "MIT",          url: "https://calendar.mit.edu/calendar.ics" }
];

const PRICED = /\$\d|ticket price|admission \$|paid registration|fee of \$/i;

// No feed carries a structured audience field, so openness is inferred from
// the category plus explicit language. Categories that are public by nature:
const OPEN_CATS = /athletic|recreation|community event|exhibit|performing arts|campus tour|conference|seminar|lecture|concert|film|festival|workshop/i;
// Categories that are for that school's own people:
const INTERNAL_CATS = /career development|career building|networking|recruiting|meeting|gathering|institute holiday|info session/i;
const PUBLIC_SAID = /open to the public|all are welcome|public welcome|free and open/i;
const MEMBERS_ONLY = /community only|students only|by invitation|invite only|faculty and staff only/i;

function unfold(raw) { return raw.replace(/\r?\n[ \t]/g, ""); }

function field(block, key) {
  const m = block.match(new RegExp(`^${key}[^:]*:(.*)$`, "m"));
  return m ? m[1].trim() : null;
}

function parseDT(v) {
  if (!v) return null;
  const m = v.match(/(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2}))?/);
  if (!m) return null;
  const [, y, mo, d, hh = "00", mm = "00"] = m;
  return new Date(Date.UTC(+y, +mo - 1, +d, +hh, +mm));
}

export async function campusEvents({ days = 10, limit = 40 } = {}) {
  const now = Date.now();
  const horizon = now + days * 864e5;
  const out = [];

  for (const f of FEEDS) {
    let raw;
    try {
      const r = await fetch(f.url, { headers: { "User-Agent": "boston-card (civic, open source)" }, signal: AbortSignal.timeout(20000) });
      if (!r.ok) continue;
      raw = unfold(await r.text());
    } catch { continue; }

    for (const b of raw.split("BEGIN:VEVENT").slice(1)) {
      const start = parseDT(field(b, "DTSTART"));
      if (!start) continue;
      const t = start.getTime();
      if (t < now - 6 * 36e5 || t > horizon) continue;
      const desc = (field(b, "DESCRIPTION") ?? "").replace(/\\[nrt]/g, " ").replace(/<[^>]*>/g, " ");
      const title = (field(b, "SUMMARY") ?? "").replace(/\\,/g, ",").trim();
      const cats = field(b, "CATEGORIES") ?? "";
      const blob = `${title} ${desc}`;

      if (MEMBERS_ONLY.test(blob)) continue;
      const saidPublic = PUBLIC_SAID.test(blob);
      // keep it only if the category is public by nature, or the listing says so
      if (!saidPublic && (!OPEN_CATS.test(cats) || INTERNAL_CATS.test(cats))) continue;

      out.push({
        campus: f.label,
        title,
        cats: cats || null,
        start: start.toISOString(),
        where: (field(b, "LOCATION") ?? "").replace(/\\,/g, ",").trim() || null,
        url: field(b, "URL"),
        free: !PRICED.test(blob),
        confirmedPublic: saidPublic
      });
    }
  }
  out.sort((a, b) => a.start.localeCompare(b.start));
  return out.slice(0, limit);
}
