export const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export const MONTH_FULL = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

const SHORT_NAMES = {
  maiz_valle: { es: "Maíz", qu: "Sara" },
  papa_huaycha: { es: "Papa", qu: "Akshu" },
  avena_vicia: { es: "Avena", qu: "Avena" },
  mulch_residue: { es: "Chala", qu: "Chhalla" },
  bare_soil_fallow: { es: "Pelada", qu: "Q'ara" },
  alfalfa: { es: "Alfalfa", qu: "Alfalfa" },
  haba: { es: "Haba", qu: "Jawasa" },
  tarwi: { es: "Tarwi", qu: "Tarwi" },
  quinua: { es: "Quinua", qu: "Kinwa" },
  cebada: { es: "Cebada", qu: "Siwara" },
};

export const CAT_STYLE = {
  main: { cls: "bg-emerald-50 border-emerald-300 text-emerald-950", ring: "ring-2 ring-emerald-500", dot: "bg-emerald-500" },
  cover: { cls: "bg-sky-50 border-sky-300 text-sky-950", ring: "ring-2 ring-[#0284C7]", dot: "bg-[#0284C7]" },
  mulch: { cls: "bg-amber-50 border-amber-300 text-amber-950", ring: "ring-2 ring-amber-500", dot: "bg-amber-500" },
  bare: { cls: "bg-rose-50 border-rose-300 text-rose-950", ring: "ring-2 ring-rose-500", dot: "bg-rose-500" },
  idle: { cls: "bg-slate-50 border-slate-200 text-slate-700", ring: "ring-2 ring-slate-400", dot: "bg-slate-400" },
};

export function shortCropWord(crop, lang = "es") {
  if (!crop) return "";
  const entry = SHORT_NAMES[crop.crop_id];
  if (entry) return lang === "qu" ? entry.qu : entry.es;
  return String(crop.crop_name || "").split(/\s+/)[0] || "";
}

export function formatStageRange(startM, endM, lang = "es") {
  if (!startM || !endM) return "";
  const s = MONTH_SHORT[(startM - 1) % 12];
  const e = MONTH_SHORT[(endM - 1) % 12];
  const count = startM <= endM ? endM - startM + 1 : 12 - startM + 1 + endM;
  return `${s} – ${e} · ${count} ${lang === "qu" ? "killa" : count === 1 ? "mes" : "meses"}`;
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
  let role = qu ? "Chakrapi samay pacha." : "Parcela en transición entre campañas.";

  if (matched) {
    cropName = matched.crop_name || "";
    shortWord = shortCropWord(matched, lang);
    role = matched.agronomic_role || "";
    const txt = `${matched.crop_id} ${cropName} ${role}`.toLowerCase();
    if (matched.crop_id === "bare_soil_fallow" || /pelad|sin cobertura|barbecho limpio/.test(txt)) {
      category = "bare";
      cropId = "bare_soil_fallow";
    } else if (matched.crop_id === "mulch_residue" || /mulch|rastrojo|protector/.test(txt)) {
      category = "mulch";
      cropId = "mulch_residue";
    } else if (/cobertura|legum|vicia|alfalfa|tarwi|arveja|haba|fijad/.test(txt)) {
      category = "cover";
    } else {
      category = "main";
    }
  } else if (ind.bare_soil_flag) {
    category = "bare";
    cropId = "bare_soil_fallow";
    cropName = qu ? "Q'ara allpa (wayra manchay)" : "Tierra pelada (alerta viento)";
    shortWord = qu ? "Q'ara" : "Pelada";
  }

  return { m, monthName: MONTH_FULL[monthIndex], monthShort: MONTH_SHORT[monthIndex], category, cropId, cropName, shortWord, role, wx, rainMm, tmin, tmax };
}
