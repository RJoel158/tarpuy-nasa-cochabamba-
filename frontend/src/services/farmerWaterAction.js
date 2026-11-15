// Review thresholds, not calibrated irrigation doses. Never issue IRRIGATE from a forecast alone.
const number = v => v !== null && v !== undefined && v !== "" && Number.isFinite(Number(v)) ? Number(v) : null;
export function decideFarmerWaterAction(bulletin, drainage = null, now = Date.now()) {
  const age = now - Date.parse(bulletin?.fetched_at_utc || "");
  const fresh = bulletin?.weather_scope === "selected_point_model" && !bulletin.weather_refresh_error && age >= -300000 && age <= 7200000;
  const result = (reason, title, consequence, instruction, evidence = []) => ({
    code: reason === "data_review" ? "WAIT" : "CAUTION", reason,
    presentation: { heading: "Agua en tu parcela", title, message: consequence, instruction,
      scope: "Estimación del modelo; comprueba las condiciones en tu parcela.", plant: "Ver qué sembrar", details: "Por qué esta recomendación", language: "es" }, evidence,
  });
  if (!fresh) return result("data_review", "Falta confirmar los datos", "No se puede valorar el riego con esta referencia.", "Confirma tu ubicación y actualiza el pronóstico.");
  const current = bulletin.current_conditions || {};
  const observed = Date.parse(current.observed_at ? (/Z$|[+-]\d{2}:\d{2}$/.test(current.observed_at) ? current.observed_at : current.observed_at + "-04:00") : "");
  const currentFresh = now - observed >= -300000 && now - observed <= 7200000;
  const rain = number(current.precip_mm);
  const days = (bulletin.seven_day_forecast || []).filter(d => d.date >= new Date(now).toLocaleDateString("en-CA", {timeZone:"America/La_Paz"}));
  const daily = days[0];
  const balance = number(bulletin.predictions_summary?.net_water_balance_7d_mm);
  const nearDrainage = /quebrada|tributario/i.test(`${drainage?.tipo || ""} ${drainage?.clasificacion || ""}`);
  if (currentFresh && rain !== null && rain > 0) return result("current_rain", "Lluvia actual estimada", "Añadir agua podría favorecer la acumulación si la tierra ya está húmeda.", "Si está lloviendo en tu parcela, comprueba el drenaje y la humedad antes de añadir riego.", [`Precipitación del intervalo del modelo: ${rain} mm`, `Hora: ${current.observed_at}`]);
  if (daily && number(daily.precip_mm) !== null && number(daily.precip_mm) >= 20) return result("rain_forecast", "Riesgo de acumulación de agua", "La lluvia prevista para hoy podría producir escurrimiento o encharcamiento.", "Revisa las salidas de agua. Si hay encharcamiento, no añadas riego.", [`Acumulado diario previsto: ${daily.precip_mm} mm`, "El acumulado no indica la intensidad por hora."]);
  if (daily && number(daily.temp_min_c) !== null && number(daily.temp_min_c) <= 2) return result("frost", "Riesgo de frío intenso", "Las plantas sensibles podrían sufrir daños; la temperatura local puede variar.", "Revisa la protección de brotes y confirma el estado del cultivo.", [`Mínima diaria prevista: ${daily.temp_min_c} °C`]);
  if (nearDrainage) return result("drainage", "Revisa el paso del agua", "El GAMC identifica drenaje cercano; no confirma inundación ni humedad en las raíces.", "Comprueba que el agua salga de la parcela antes de decidir regar.", [`GAMC: ${drainage.tipo || ""} ${drainage.clasificacion || ""}`]);
  if (balance !== null && balance < 0) return result("reference_deficit", "Posible falta de agua durante la semana", "La lluvia prevista es menor que la demanda de referencia; eso no demuestra que la tierra esté seca hoy.", "Comprueba la humedad en las raíces. Si está seca, evalúa el riego según el cultivo y su etapa.", [`Balance de referencia de 7 días: ${balance} mm`, "No equivale a una dosis de riego."]);
  return result("check", "Comprueba la humedad antes de regar", "El pronóstico no basta para decidir cuánto necesita tu cultivo.", "Revisa la tierra a la profundidad de las raíces y el estado de las plantas.");
}
