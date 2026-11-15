export const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export const MONTH_FULL = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const SHORT_NAMES = {
  maiz_valle: { es: "Maíz", qu: "Sara" },
  papa_huaycha: { es: "Papa", qu: "Papa" },
  avena_vicia: { es: "Avena", qu: "Avenawan wikawan" },
  mulch_residue: { es: "Chala", qu: "Chhalla" },
  bare_soil_fallow: { es: "Descanso", qu: "Samay" },
  alfalfa: { es: "Alfalfa", qu: "Alfalfa" },
  haba: { es: "Haba", qu: "Hawas" },
  tarwi: { es: "Tarwi", qu: "Tarwi" },
  quinua: { es: "Quinua", qu: "Kinwa" },
  cebada: { es: "Cebada", qu: "Siwara" },
};

export const CAT_STYLE = {
  main: {
    cls: "",
    ring: "",
    dot: "",
    bgVar: "var(--hoja-suave)",
    accentVar: "var(--hoja)",
  },
  cover: {
    cls: "",
    ring: "",
    dot: "",
    bgVar: "var(--cielo-suave)",
    accentVar: "var(--cielo)",
  },
  mulch: {
    cls: "",
    ring: "",
    dot: "",
    bgVar: "var(--dorado-suave)",
    accentVar: "var(--dorado)",
  },
  bare: {
    cls: "",
    ring: "",
    dot: "",
    bgVar: "var(--alerta-critico-suave)",
    accentVar: "var(--alerta-critico)",
  },
  idle: {
    cls: "",
    ring: "",
    dot: "",
    bgVar: "var(--arena)",
    accentVar: "var(--piedra)",
  },
};

export function shortCropWord(crop, lang = "es") {
  if (!crop) return "";
  const entry = SHORT_NAMES[crop.crop_id];
  if (entry) return lang === "qu" ? entry.qu : entry.es;
  return String(crop.crop_name || "").split(/\s+/)[0] || "";
}

// Texto para productores; conservar agronomic_role para clasificar el plan.
export function simpleStageDescription(crop) {
  const descriptions = {
    maiz_valle: "Siembra maíz para cosechar choclo o grano y aprovechar la chala para tus animales.",
    papa_huaycha: "Siembra papa para el consumo de tu familia o para vender en el mercado.",
    avena_vicia: "Siembra avena con vicia para alimentar a tus animales y mantener cubierta la tierra.",
    mulch_residue: "Deja chala y restos de la cosecha sobre la tierra para que conserve humedad y el viento no se la lleve.",
    bare_soil_fallow: "Deja descansar la parcela sin sembrar. Si queda descubierta, el sol la seca y el viento puede llevarse la tierra.",
    alfalfa: "Siembra alfalfa para alimentar a tus animales y ayudar a recuperar la tierra.",
    haba: "Siembra haba para cosechar alimento y ayudar a recuperar la fuerza de la tierra.",
    tarwi: "Siembra tarwi para ayudar a recuperar la fuerza de la tierra antes del siguiente cultivo.",
    quinua: "Siembra quinua para cosechar grano para tu familia o para vender.",
    cebada: "Siembra cebada para alimentar a tus animales y mantener cubierta la tierra.",
  };
  return descriptions[crop?.crop_id] || "Revisa en el calendario cuándo sembrar, cuidar y cosechar este cultivo.";
}

export function stageMonthIndices(stage) {
  const start = stage?.start_month;
  const end = stage?.end_month;
  if (![start, end].every((m) => Number.isInteger(m) && m >= 1 && m <= 12)) return [];
  const count = ((end - start + 12) % 12) + 1;
  return Array.from({ length: count }, (_, offset) => (start - 1 + offset) % 12);
}

export function formatStageRange(startM, endM, lang = "es") {
  if (!startM || !endM) return "";
  const s = MONTH_SHORT[(startM - 1) % 12];
  const e = MONTH_SHORT[(endM - 1) % 12];
  const count = startM <= endM ? endM - startM + 1 : 12 - startM + 1 + endM;
  return `${s} – ${e} · ${count} ${lang === "qu" ? "killa" : count === 1 ? "mes" : "meses"}`;
}

/* Cuidados del cultivo mes a mes (no solo regar):
 * Sembrar → Aporque (solo cultivos principales) → Abonar (solo principales)
 * → Regar → Cosechar. */
function faseDelMes(m, matched, esPrincipal) {
  const pasos = m >= matched.start_month ? m - matched.start_month : m + 12 - matched.start_month;
  const largo = matched.end_month >= matched.start_month
    ? matched.end_month - matched.start_month
    : matched.end_month + 12 - matched.start_month;
  if (m === matched.start_month) return "sembrar";
  if (m === matched.end_month) return "cosechar";
  if (esPrincipal && largo >= 4) {
    if (pasos === 1) return "aporcar";
    if (pasos === 2) return "abonar";
  }
  return "regar";
}

export function resolveMonthCell(monthIndex, cropSequence = [], indicators = [], lang = "es") {
  const m = monthIndex + 1;
  const qu = lang === "qu";
  const ind = indicators.find((i) => i.month === m) || indicators[monthIndex] || {};
  const matched = cropSequence.find((c) => {
    if (!c.start_month || !c.end_month) return false;
    return c.start_month <= c.end_month ? m >= c.start_month && m <= c.end_month : m >= c.start_month || m <= c.end_month;
  });

  const rainMm = Number(ind.precip_mm ?? 0);
  const tmin = Number(ind.temp_min_c ?? 8);
  const tmax = Number(ind.temp_max_c ?? 22);
  const frostDays = Number(ind.frost_risk_days ?? 0);
  const wx = rainMm >= 40 ? "rain" : (frostDays >= 3 || tmin <= 2) ? "frost" : "sun";

  let category = "idle";
  let cropId = matched?.crop_id || "";
  let cropName = qu ? "Samariy allpa" : "Descanso";
  let shortWord = qu ? "Samay" : "Libre";
  let role = qu ? "Chakrapi samay pacha." : "La parcela está en descanso entre una cosecha y la siguiente siembra.";

  /* Acción visual para la cinta de 12 meses:
   * - 'sembrar' (semilla, --hoja) en el mes de inicio del cultivo
   * - 'cosechar' (cosecha, --dorado) en el mes final del cultivo
   * - 'regar' (gota_agua, --cielo) durante los meses de crecimiento
   * - 'cubrir' (tierra_humeda, --tierra) si es rastrojo/descanso
   */
  let accionVisual = "regar";

  if (matched) {
    cropName = matched.crop_name || "";
    shortWord = shortCropWord(matched, lang);
    role = matched.agronomic_role || "";
    const txt = `${matched.crop_id} ${cropName} ${role}`.toLowerCase();
    if (matched.crop_id === "bare_soil_fallow" || /pelad|sin cobertura|barbecho limpio/.test(txt)) {
      category = "bare";
      cropId = "bare_soil_fallow";
      accionVisual = "suelo_pelado";
    } else if (matched.crop_id === "mulch_residue" || /mulch|rastrojo|protector/.test(txt)) {
      category = "mulch";
      cropId = "mulch_residue";
      accionVisual = "cubrir";
    } else if (/cobertura|legum|vicia|alfalfa|tarwi|arveja|haba|fijad/.test(txt)) {
      category = "cover";
      accionVisual = faseDelMes(m, matched, false);
    } else {
      category = "main";
      accionVisual = faseDelMes(m, matched, true);
    }
  } else if (ind.bare_soil_flag) {
    category = "bare";
    cropId = "bare_soil_fallow";
    cropName = qu ? "Allpa samay (wayra manchay)" : "Descanso de la tierra (alerta viento)";
    shortWord = qu ? "Samay" : "Descanso";
    accionVisual = "suelo_pelado";
  }

  return {
    m,
    monthName: MONTH_FULL[monthIndex],
    monthShort: MONTH_SHORT[monthIndex],
    category,
    cropId,
    cropName,
    shortWord,
    role: matched ? simpleStageDescription(matched) : role,
    wx,
    rainMm,
    tmin,
    tmax,
    accionVisual,
  };
}
