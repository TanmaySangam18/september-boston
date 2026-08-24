const BOSTON = { lat: 42.3601, lon: -71.0589 };

export async function fetchEnv() {
  const u = new URL("https://api.open-meteo.com/v1/forecast");
  u.searchParams.set("latitude", BOSTON.lat);
  u.searchParams.set("longitude", BOSTON.lon);
  u.searchParams.set("daily", "sunrise,sunset");
  u.searchParams.set("hourly", "precipitation_probability,temperature_2m");
  u.searchParams.set("timezone", "America/New_York");
  u.searchParams.set("forecast_days", "1");
  const r = await fetch(u);
  if (!r.ok) throw new Error(`open-meteo ${r.status}`);
  const d = await r.json();

  const nowHour = new Date().getHours();
  let rain = null;
  for (let i = 0; i < d.hourly.time.length; i++) {
    const h = Number(d.hourly.time[i].slice(11, 13));
    if (h < nowHour) continue;
    if (d.hourly.precipitation_probability[i] >= 50) { rain = h; break; }
  }

  let aqi = null;
  try {
    const a = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
    a.searchParams.set("latitude", BOSTON.lat);
    a.searchParams.set("longitude", BOSTON.lon);
    a.searchParams.set("current", "us_aqi");
    a.searchParams.set("timezone", "America/New_York");
    const ar = await fetch(a);
    if (ar.ok) aqi = Math.round((await ar.json()).current.us_aqi);
  } catch { /* tile falls back to a dash */ }

  return {
    sunset: d.daily.sunset[0].slice(11, 16),
    rain: rain === null ? "clear" : `${rain % 12 || 12}${rain < 12 ? "am" : "pm"}`,
    aqi
  };
}
