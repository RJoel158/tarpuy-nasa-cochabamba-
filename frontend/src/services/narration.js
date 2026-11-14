import { MONTH_FULL, resolveMonthCell } from "../features/producer/calendarHelpers.js";
import { waterActionText } from "../utils/quechuaI18n.js";

export function buildWaterActionNarration(action, lang = "es") {
  const text = waterActionText(action, lang);
  return `${text.heading}. ${text.title}. ${text.message} ${text.scope}`;
}

const number = (value) => value !== null && value !== undefined && value !== "" && Number.isFinite(Number(value)) ? Number(value) : null;
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
    const name = group.category === "bare" ? "tierra pelada, sin cobertura"
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
  const days = bulletin.seven_day_forecast;
  if (lang === "qu") {
    const minimum = number(bulletin.predictions_summary?.min_temp_7d_c);
    const rain = number(bulletin.predictions_summary?.total_precip_7d_mm);
    return [zoneName, "Kay semanapaq pacha willakuy.",
      minimum !== null && minimum <= 2 ? "Qasa hamunman. Mallkikunata p'istuy." : "Chakrata qhaway.",
      rain !== null && rain >= 20 ? "Para hamunman. Yakup lluqsinanta pichay." : "Allpapa ch'aranninta qhaway.",
      "Manaraq yakuchaspa, allpata qhaway."].filter(Boolean).join(" ");
  }
  const summary = bulletin.predictions_summary || {};
  const last = Date.parse(days.at(-1).date + "T23:59:59-04:00");
  const rain = number(summary.total_precip_7d_mm);
  const minimum = number(summary.min_temp_7d_c);
  const expired = Number.isFinite(last) && last < Date.now();
  if (expired) return `El pronóstico de ${zoneName || "tu zona"} ya terminó. Actualiza los datos antes de decidir sobre el riego o la siembra.`;
  return [
    `Veamos cómo viene el clima en ${zoneName || "tu zona"} durante los próximos días.`,
    minimum !== null ? minimum <= 2
      ? "Se esperan noches muy frías, con posible helada. Protege los brotes y las plantas sensibles."
      : "La mínima prevista no activa la alerta de helada. Revisa también las partes más frías de tu parcela." : "Todavía falta información sobre el frío.",
    rain !== null ? rain >= 20
      ? "Puede acumularse lluvia durante la semana. Revisa los surcos y las salidas de agua."
      : rain < 5 ? "Se espera poca lluvia. Comprueba la humedad cerca de las raíces antes de organizar el riego."
      : "Hay lluvia prevista. Comprueba si realmente humedece la tierra antes de añadir riego." : "Todavía falta la estimación de lluvia.",
    "Esta orientación corresponde a tu zona. El detalle de cada día te ayuda a revisar cuándo actuar.",
  ].join(" ");
}
