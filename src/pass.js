// The pass. Front is glanceable in two seconds; back holds everything static.
// Three tiers decide whether a change is worth a device push at all.

export const TIER = {
  STATIC:   ["campus", "area", "stopName", "routeLabel"],
  FREQUENT: ["nextAt", "nextMinutes", "following", "weather", "todayLabel"],
  URGENT:   ["serviceUrgent", "serviceHeadline"]
};

const hhmm = t => {
  if (!t) return "—";
  const [h, m] = t.split(":").map(Number);
  const ap = h < 12 ? "AM" : "PM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ap}`;
};

export function buildPass({ profile, live, sept, passTypeId, teamId, serial, webServiceURL, authToken }) {
  const svc = live.service;
  const alert = svc?.alerts?.[0];
  const next = live.departures?.list?.[0];
  const rest = (live.departures?.list ?? []).slice(1, 3);

  const back = [
    { key: "campus", label: "CAMPUS", value: profile.campus ?? "—" },
    { key: "area", label: "YOUR AREA", value: profile.area },
    { key: "station", label: "SAVED STOP", value: live.station?.name ?? "—" },
    { key: "route", label: "SAVED ROUTE", value: profile.route ?? "—" },
    { key: "sept", label: "SEPTEMBER", value: sept.map(s => `Sept ${s.day} — ${s.label}`).join("\n") },
    { key: "deposit", label: "YOUR DEPOSIT", value:
      `Statement of Condition due ${profile.statementDue}. Contest by ${profile.contestBy}. Photograph every room before you unpack.` },
    { key: "links", label: "OPEN SEPTEMBER IN BOSTON", value: "https://tanmaysangam18.github.io/september-boston/" },
    { key: "emergency", label: "IF SOMETHING GOES WRONG", value:
      "Boston 311 — 311\nBU/NEU campus police — see your student portal\nTowed car — 617 343 4629" },
    { key: "privacy", label: "PRIVACY", value:
      "This pass never sends your location anywhere. Your phone checks the areas on it by itself. Remove it any time." }
  ];

  return {
    formatVersion: 1,
    passTypeIdentifier: passTypeId,
    teamIdentifier: teamId,
    serialNumber: serial,
    organizationName: "September in Boston",
    description: "September in Boston — your day",
    logoText: "September",
    backgroundColor: "rgb(27,42,65)",
    foregroundColor: "rgb(246,243,236)",
    labelColor: "rgb(143,163,187)",
    ...(webServiceURL ? { webServiceURL, authenticationToken: authToken } : {}),
    locations: (profile.geofences ?? []).slice(0, 10),
    storeCard: {
      headerFields: [
        { key: "nextAt", label: "NEXT", value: next ? hhmm(next.at) : "—",
          changeMessage: "Next departure %@" }
      ],
      primaryFields: [
        { key: "route", label: (profile.area ?? "").toUpperCase(),
          value: next ? `${next.short ?? next.route}${next.headsign ? " → " + next.headsign : ""}` : (profile.route ?? "Your day") }
      ],
      secondaryFields: [
        { key: "todayLabel", label: "TODAY", value: profile.todayLabel ?? "—" },
        { key: "weather", label: "WEATHER", value: live.weather ?? "—" },
        { key: "service", label: "SERVICE",
          value: svc?.normal ? "Normal" : (svc?.urgent ? "Alert" : "Delays"),
          changeMessage: "Service: %@" }
      ],
      auxiliaryFields: [
        { key: "following", label: "THEN",
          value: rest.length ? rest.map(d => hhmm(d.at)).join("  ") : "—" },
        { key: "station", label: "FROM", value: live.station?.name ?? "—" },
        { key: "area", label: "AREA", value: profile.area }
      ],
      backFields: back
    },
    barcode: {
      format: "PKBarcodeFormatQR",
      message: "https://tanmaysangam18.github.io/september-boston/",
      messageEncoding: "iso-8859-1"
    }
  };
}

// Decide whether a change deserves a push. Urgent always. Frequent only on a
// throttle, so the pass does not become a notification stream.
export function classify(prev, next, { frequentThrottleMins = 90 } = {}) {
  if (!prev) return { push: true, tier: "install", changed: ["all"] };

  const changed = [];
  for (const keys of Object.values(TIER))
    for (const k of keys)
      if (JSON.stringify(prev[k]) !== JSON.stringify(next[k])) changed.push(k);

  if (!changed.length) return { push: false, tier: "none", changed };

  const urgent = changed.some(k => TIER.URGENT.includes(k));
  if (urgent) return { push: true, tier: "urgent", changed };

  const staticChanged = changed.some(k => TIER.STATIC.includes(k));
  if (staticChanged) return { push: true, tier: "static", changed };

  const since = prev._pushedAt ? (Date.now() - prev._pushedAt) / 60000 : Infinity;
  return { push: since >= frequentThrottleMins, tier: "frequent", changed, sinceMins: Math.round(since) };
}
