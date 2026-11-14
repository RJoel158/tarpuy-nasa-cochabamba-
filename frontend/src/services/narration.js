import { MONTH_FULL, shortCropWord } from "../features/producer/calendarHelpers.js";
import { waterActionText } from "../utils/quechuaI18n.js";

export function buildWaterActionNarration(action, lang = "es") {
  const text = waterActionText(action, lang);
  return `${text.heading}. ${text.title}. ${text.message} ${text.scope}`;
}

const number = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) ? Number(value) : null;
const spokenNumber = (value) => value.toLocaleString("es-BO", { maximumFractionDigits: 1 });
const dateLabel = (value) => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toLocaleDateString("es-BO", { timeZone: "America/La_Paz", day: "numeric", month: "long", year: "numeric" }) : "";
};

export function buildStrategyNarration(strategy = {}, lang = "es") {
  const sequence = strategy.crop_sequence || [];
  if (!sequence.length) return lang === "qu" ? "Mana tarpuy yachay kanchu." : "Falta el calendario de esta alternativa.";
  const stages = sequence.map((crop, index) => {
    const start = MONTH_FULL[crop.start_month - 1];
    const end = MONTH_FULL[crop.end_month - 1];
    const name = lang === "qu" ? shortCropWord(crop, lang) : crop.crop_name || shortCropWord(crop);
    return lang === "qu" ? `${index + 1}. ${name}. ${start || ""}, ${end || ""}.`
      : `Etapa ${index + 1}. ${name}${start && end ? `, con una ventana orientativa de ${start} a ${end}` : ""}.`;
  });
  if (lang === "qu") return ["Tarpuykunata qhaway.", ...stages, "Allpata, yakuta qhaway."].join(" ");
  return [
    strategy.strategy_type === "current_baseline" ? "Este es el escenario de referencia usado en la comparación." : "Esta es una alternativa de rotación para evaluar en tu zona.",
    ...stages,
    "Las etapas pueden corresponder a campañas diferentes. Revisa las fechas con un técnico local, según tu cultivo, el riego y las condiciones de la parcela.",
    "El puntaje expresa afinidad con tus prioridades. Para decidir el riego hay que revisar también la humedad y la etapa del cultivo.",
  ].join(" ");
}

export function buildWeatherNarration(bulletin, zoneName = "", lang = "es") {
  if (!bulletin?.seven_day_forecast?.length) return lang === "qu" ? "Mana pacha yachay kanchu." : "Falta el pronóstico para esta zona.";
  const days = bulletin.seven_day_forecast;
  if (lang === "qu") {
    return [zoneName, "Pacha willakuy.", ...days.map((day) =>
      `${day.date}. Para: ${number(day.precip_mm) ?? "—"} milímetros. Chiri: ${number(day.temp_min_c) ?? "—"} grados.`),
      "Allpata, yakuta qhaway."].join(" ");
  }
  const summary = bulletin.predictions_summary || {};
  const out = [
    `Información para la zona de ${zoneName}. Pronóstico de Open-Meteo del ${dateLabel(days[0].date + "T12:00:00-04:00")} al ${dateLabel(days.at(-1).date + "T12:00:00-04:00")}.`,
  ];
  if (bulletin.fetched_at_utc && dateLabel(bulletin.fetched_at_utc)) out.push(`Datos descargados el ${dateLabel(bulletin.fetched_at_utc)}.`);
  const last = Date.parse(days.at(-1).date + "T23:59:59-04:00");
  if (Number.isFinite(last) && last < Date.now()) out.push("Este pronóstico ya terminó. Actualiza los datos antes de decidir.");
  const rain = number(summary.total_precip_7d_mm);
  const minimum = number(summary.min_temp_7d_c);
  const soil = number(bulletin.current_conditions?.soil_moisture_top_pct);
  const et0 = number(summary.total_et0_7d_mm);
  if (rain !== null && rain >= 0) out.push(`Se estiman ${spokenNumber(rain)} milímetros de lluvia en ese período. Un milímetro equivale a un litro de agua por metro cuadrado; parte del agua puede escurrir o no llegar a las raíces.`);
  if (minimum !== null) out.push(`La mínima prevista es de ${spokenNumber(minimum)} grados Celsius. ${minimum <= 2 ? "Hay riesgo de frío intenso o helada; revisa la protección de plantas sensibles." : "En tu parcela puede hacer más frío que en la estimación regional."}`);
  if (soil !== null && soil >= 0 && soil <= 100) out.push(`La humedad superficial estimada por el modelo es de ${spokenNumber(soil)} por ciento en volumen, en los primeros siete centímetros. Comprueba también la tierra a la profundidad de las raíces antes de regar.`);
  if (et0 !== null && et0 >= 0 && rain !== null && rain >= 0) out.push(
    `La demanda de agua de referencia es de ${spokenNumber(et0)} milímetros. ${rain < et0 ? "La lluvia prevista es menor que esa referencia." : "La lluvia prevista alcanza o supera esa referencia."} El riego necesario depende del cultivo, su etapa, el suelo y el agua disponible.`);
  out.push("Revisa el cultivo y el drenaje antes de actuar. Estas estimaciones corresponden a la zona.");
  return out.join(" ");
}
