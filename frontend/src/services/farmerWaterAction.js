// Thresholds follow engine/alerts.py; these are zonal guidance, not irrigation doses.
const numeric = (v) => v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v)) ? Number(v) : null;

export function decideFarmerWaterAction(bulletin, drainage = null) {
  const days = (bulletin?.seven_day_forecast || []).slice(0, 7);
  const summary = bulletin?.predictions_summary || {};
  const soil = numeric(bulletin?.current_conditions?.soil_moisture_top_pct);
  const balance = numeric(summary.net_water_balance_7d_mm);
  const minimum = numeric(summary.min_temp_7d_c);
  const nearDrainage = /quebrada|tributario/i.test(`${drainage?.tipo || ""} ${drainage?.clasificacion || ""}`);
  if (minimum !== null && minimum <= 2) return { code: "WAIT", reason: "frost" };
  if (days.some((day) => numeric(day.precip_mm) >= 10)) return { code: "CAUTION", reason: "rain" };
  if (soil !== null && soil >= 26 && nearDrainage) return { code: "CAUTION", reason: "drainage" };
  if (!days.length || minimum === null || soil === null || soil < 0 || soil > 100 || balance === null) {
    return { code: "WAIT", reason: "missing" };
  }
  if ((soil < 26 || balance <= -12) && !nearDrainage) return { code: "IRRIGATE", reason: "dry" };
  return { code: "WAIT", reason: nearDrainage && soil < 26 ? "check" : "stable" };
}
