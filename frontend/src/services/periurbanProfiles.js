/** Option A: district → agronomic zone + GAMC flags (mirrors data/zones/periurban_profiles.json). */

export const PERIURBAN_PROFILES = {
  D9: {
    code: "D9",
    alias: "La Maica",
    label_es: "Distrito 9 · La Maica",
    label_qu: "Distrito 9 · La Maica",
    zone_id: "punata_valle_alto",
    periurban_pressure: "growth",
    flood_sensitive: true,
    slope_bias: "valle",
    tip_es: "Valle periurbano con canales: vigila anegamiento y turnos de riego.",
    tip_qu: "Qhichwa periurbano yakupuriywan: yaku junt'akuyta qhaway.",
  },
  D13: {
    code: "D13",
    alias: "Pie de Tunari",
    label_es: "Distrito 13 · Pie de Tunari",
    label_qu: "Distrito 13 · Tunari urin",
    zone_id: "tapacari_zona_andina",
    periurban_pressure: "growth",
    flood_sensitive: true,
    slope_bias: "ladera",
    tip_es: "Ladera periurbana: helada, escurrimiento y surcos en curva.",
    tip_qu: "Urqu periurbano: qasa, yaku phawaq, surk'ukuna muyurisqa.",
  },
  D1: {
    code: "D1",
    alias: "Tunari",
    label_es: "Distrito 1 · Tunari",
    label_qu: "Distrito 1 · Tunari",
    zone_id: "tapacari_zona_andina",
    periurban_pressure: "none",
    flood_sensitive: false,
    slope_bias: "ladera",
    tip_es: "Zona alta hacia Tunari: prioriza cobertura y cuidado de heladas.",
    tip_qu: "Tunari urqu: allpa qhatay, qasata qhaway.",
  },
  D8: {
    code: "D8",
    alias: "Sur periurbano",
    label_es: "Distrito 8",
    label_qu: "Distrito 8",
    zone_id: "punata_valle_alto",
    periurban_pressure: "consolidated",
    flood_sensitive: true,
    slope_bias: "valle",
    tip_es: "Periurbano consolidado: cubre la tierra pronto; la ciudad aprieta la chacra.",
    tip_qu: "Periurbano hatun: allpata usqhayta qhatay.",
  },
  D14: {
    code: "D14",
    alias: "Valle Hermoso",
    label_es: "Distrito 14",
    label_qu: "Distrito 14",
    zone_id: "punata_valle_alto",
    periurban_pressure: "consolidated",
    flood_sensitive: true,
    slope_bias: "valle",
    tip_es: "Valle urbano-rural: revisa drenaje antes de saturar el canal.",
    tip_qu: "Llaqta-qhichwa: yakupurinata ñawpaqta qhaway.",
  },
  D15: {
    code: "D15",
    alias: "Tamborada",
    label_es: "Distrito 15 · Tamborada",
    label_qu: "Distrito 15 · Tamborada",
    zone_id: "punata_valle_alto",
    periurban_pressure: "growth",
    flood_sensitive: true,
    slope_bias: "valle",
    tip_es: "Franja periurbana en crecimiento: ventana corta para rotaciones largas.",
    tip_qu: "Periurbano wiñariq: mana unay rotacionkuna.",
  },
};

export function normalizeDistrictCode(code) {
  const raw = String(code || "").trim().toUpperCase();
  if (/^\d+$/.test(raw)) return `D${raw}`;
  if (/^D\d+$/.test(raw)) return raw;
  return raw;
}

export function resolvePeriurbanProfile(districtCode) {
  const code = normalizeDistrictCode(districtCode);
  return PERIURBAN_PROFILES[code] || null;
}

export function isNearDrainage(drainage) {
  return /quebrada|tributario/i.test(`${drainage?.tipo || ""} ${drainage?.clasificacion || ""}`);
}

export function isWetBulletin(bulletin) {
  const soil = Number(bulletin?.current_conditions?.soil_moisture_top_pct);
  const bal = Number(bulletin?.predictions_summary?.net_water_balance_7d_mm);
  const rainy = (bulletin?.seven_day_forecast || []).some((d) => Number(d.precip_mm) >= 10);
  return rainy || (Number.isFinite(soil) && soil >= 26) || (Number.isFinite(bal) && bal >= 0);
}

/** Build municipal_context for /api/recommend from GPS + GAMC probes. */
export function buildMunicipalContextPayload({
  districtCode,
  comuna,
  periurban,
  drainage,
  bulletin,
} = {}) {
  const profile = resolvePeriurbanProfile(districtCode);
  const near = isNearDrainage(drainage);
  const pressureFromWms = String(periurban?.clase || periurban?.periurban || "").toLowerCase();
  let periurban_class = profile?.periurban_pressure || "none";
  if (pressureFromWms.includes("consolid")) periurban_class = "consolidated";
  else if (pressureFromWms.includes("crecim") || pressureFromWms.includes("growth")) periurban_class = "growth";

  return {
    district_code: normalizeDistrictCode(districtCode) || null,
    comuna: comuna || null,
    periurban_class,
    periurban_pressure: periurban_class,
    periurban_detail: periurban?.detalle || null,
    near_drainage: near,
    drainage_tipo: drainage?.tipo || null,
    drainage_clasificacion: drainage?.clasificacion || null,
    wet_bulletin: isWetBulletin(bulletin),
  };
}

export function chipLabel(profile, lang = "es") {
  if (!profile) return null;
  return lang === "qu" ? profile.label_qu : profile.label_es;
}

export function contextTip(profile, drainage, lang = "es") {
  if (!profile && !drainage) return null;
  const near = isNearDrainage(drainage);
  const base = profile ? (lang === "qu" ? profile.tip_qu : profile.tip_es) : "";
  if (near) {
    const drainTip =
      lang === "qu"
        ? "Yakupuriy qayllapi: yaku junt'akuyta qhaway."
        : "Hay quebrada o drenaje cerca: cuida el anegamiento.";
    return [base, drainTip].filter(Boolean).join(" ");
  }
  return base || null;
}
