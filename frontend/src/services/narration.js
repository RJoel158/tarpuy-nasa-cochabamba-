import { MONTH_FULL, resolveMonthCell, shortCropWord } from "../features/producer/calendarHelpers.js";
import { waterActionText } from "../utils/quechuaI18n.js";

export function buildWaterActionNarration(action, lang = "es") {
  const text = waterActionText(action, lang);
  return `${text.heading}. ${text.title}. ${text.message}${text.instruction ? ` ${text.instruction}` : ""} ${text.scope}`;
}

const number = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) ? Number(value) : null;
const spokenNumber = (value) => value.toLocaleString("es-BO", { maximumFractionDigits: 1, useGrouping: false }).replace(/[.,]/, " coma ").replace(/^-/, "menos ");
const dateLabel = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString("es-BO", { timeZone: "America/La_Paz", day: "numeric", month: "long", year: "numeric" }) : "";
};

export function buildStrategyNarration(strategy = {}, lang = "es", indicators = []) {
  const sequence = strategy.crop_sequence || [];
  if (!sequence.length) return lang === "qu" ? "Mana tarpuy willakuy kanchu." : "Falta el calendario de esta alternativa.";
  const groups = [];
  for (let month = 0; month < 12; month++) {
    const cell = resolveMonthCell(month, sequence, indicators, lang);
    const previous = groups.at(-1);
    if (previous && previous.cropId === cell.cropId && previous.category === cell.category) previous.end = month;
    else groups.push({ ...cell, start: month, end: month });
  }
  const explained = new Set();
  const stages = groups.map((group) => {
    const range = group.start === group.end ? `En ${MONTH_FULL[group.start]}` : `De ${MONTH_FULL[group.start]} a ${MONTH_FULL[group.end]}`;
    const name = group.category === "bare" ? "descanso de la tierra, sin cobertura"
      : group.category === "idle" ? "descanso o transición"
      : group.cropName.replace(/\s*\/\s*/g, ", o ").replace(/\s*\([^)]*\)/g, "");
    const role = group.role.toLowerCase();
    const purpose = group.category === "bare" ? { es: "La tierra queda expuesta a la lluvia y al viento.", qu: "Para, wayra ima allpata apanman." }
      : group.category === "mulch" ? { es: "La cobertura ayuda a cuidar la humedad de la tierra.", qu: "Allpata qhatanapaq." }
      : /forraj/.test(role) ? { es: "Sirve como alimento para los animales.", qu: "Uywakunapaq mikhuna." }
      : /fijaci[oó]n|nitr[oó]geno/.test(role) ? { es: "Ayuda a aportar nitrógeno al suelo.", qu: "Allpata kallpachanapaq." }
      : /cobertura|erosi[oó]n/.test(role) ? { es: "Ayuda a cubrir y proteger la tierra.", qu: "Allpata qhatanapaq." }
      : null;
    const reason = purpose && !explained.has(purpose.es) ? purpose[lang === "qu" ? "qu" : "es"] : "";
    if (purpose) explained.add(purpose.es);
    // Quechua templates are drafts pending review by a Cochabamba speaker.
    const quRange = group.start === group.end ? `${MONTH_FULL[group.start]} killapi`
      : `${MONTH_FULL[group.start]} killamanta ${MONTH_FULL[group.end]} killakama`;
    return lang === "qu" ? `${quRange}, ${group.shortWord}${reason ? `, ${reason.charAt(0).toLowerCase()}${reason.slice(1)}` : "."}`.trim()
      : `${range}, ${name}. ${reason}`.trim();
  });
  const overlapping = Array.from({ length: 12 }, (_, i) => i + 1).some((month) => sequence.filter((crop) =>
    crop.start_month <= crop.end_month ? month >= crop.start_month && month <= crop.end_month : month >= crop.start_month || month <= crop.end_month
  ).length > 1);
  if (lang === "qu") return [
    ...stages,
    ...(overlapping ? ["Wakin tarpuy killakuna tinkunakunku. Yachaqwan tapurikuy."] : []),
    "Manaraq tarpuspa, allpata yakuta qhaway.",
  ].join(" ");
  return [
    ...stages,
    ...(overlapping ? ["Atención. Hay períodos de cultivo superpuestos. Confirma con un técnico cómo distribuirlos entre campañas antes de sembrar."] : ["Las fechas son orientativas. Confírmalas con un técnico antes de sembrar."]),
    "Comprueba la humedad de la tierra y el agua disponible.",
  ].join(" ");
}

export function buildWeatherNarration(bulletin, zoneName = "", lang = "es") {
  if (!bulletin?.seven_day_forecast?.length) return lang === "qu" ? "Mana pacha yachay kanchu." : "Falta el pronóstico para esta zona.";
  const days = bulletin.weather_provider === "WeatherAPI" ? (bulletin.fourteen_day_forecast || bulletin.seven_day_forecast).filter(day => day.forecast_provider === "WeatherAPI") : bulletin.seven_day_forecast;
  if (!days.length) return "No hay un pronóstico disponible.";
  if (lang === "qu") {
    return [zoneName, "Pacha willakuy.", ...days.map((day) =>
      `${day.date}. Para: ${number(day.precip_mm) ?? "—"} milímetros. Chiri: ${number(day.temp_min_c) ?? "—"} grados.`),
      "Allpata, yakuta qhaway."].join(" ");
  }
  const summary = bulletin.weather_provider === "WeatherAPI" ? {
    total_precip_7d_mm: days.reduce((sum, day) => sum + (number(day.precip_mm) ?? 0), 0),
    min_temp_7d_c: Math.min(...days.map(day => number(day.temp_min_c)).filter(value => value !== null)),
    total_et0_7d_mm: days.reduce((sum, day) => sum + (number(day.et0_mm) ?? 0), 0),
  } : bulletin.predictions_summary || {};
  const out = [
    `Clima para ${zoneName || "tu zona"}. Del ${dateLabel(days[0].date + "T12:00:00-04:00")} al ${dateLabel(days.at(-1).date + "T12:00:00-04:00")}.`,
  ];
  if (bulletin.fetched_at_utc && dateLabel(bulletin.fetched_at_utc)) out.push(`Datos descargados el ${dateLabel(bulletin.fetched_at_utc)}.`);
  const last = Date.parse(days.at(-1).date + "T23:59:59-04:00");
  if (Number.isFinite(last) && last < Date.now()) out.push("Este pronóstico ya terminó. Actualiza los datos antes de decidir.");
  const rain = number(summary.total_precip_7d_mm);
  const minimum = number(summary.min_temp_7d_c);
  const soil = number(bulletin.current_conditions?.soil_moisture_top_pct);
  const et0 = number(summary.total_et0_7d_mm);
  if (rain !== null && rain >= 0) out.push(`Primero, la lluvia. Se esperan ${spokenNumber(rain)} milímetros en todo el período. Parte de esa agua puede escurrir y no llegar a las raíces.`);
  if (minimum !== null) out.push(`Ahora, el frío. La temperatura mínima prevista es de ${spokenNumber(minimum)} grados Celsius. ${minimum <= 2 ? "Hay riesgo de frío intenso o helada. Revisa la protección de plantas sensibles." : "En tu parcela puede hacer más frío que en esta estimación."}`);
  if (soil !== null && soil >= 0 && soil <= 100) out.push(`La humedad superficial estimada por el modelo es de ${spokenNumber(soil)} por ciento en volumen, en los primeros siete centímetros. Comprueba también la tierra a la profundidad de las raíces antes de regar.`);
  if (et0 !== null && et0 >= 0 && rain !== null && rain >= 0) out.push(
    `La demanda de agua de referencia es de ${spokenNumber(et0)} milímetros. ${rain < et0 ? "La lluvia prevista es menor que esa referencia." : "La lluvia prevista alcanza o supera esa referencia."} El riego necesario depende del cultivo, su etapa, el suelo y el agua disponible.`);
  out.push("Para terminar. Revisa el cultivo y el drenaje antes de actuar. Son estimaciones para la zona, del servicio Open Meteo.");
  return out.join(" ");
}
