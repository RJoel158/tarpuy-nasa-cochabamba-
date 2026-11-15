export function lightRainLabel(day, lang = "es") {
  const value = day?.precip_prob_pct;
  const probability = value !== null && value !== undefined && value !== "" ? Number(value) : NaN;
  if (Number.isFinite(probability) && probability >= 0 && probability <= 100) {
    return lang === "qu" ? `Para: ${probability}%` : `Posibilidad de lluvia: ${probability}%`;
  }
  return lang === "qu" ? "Para: —" : "Probabilidad de lluvia no disponible";
}
